import logging
import traceback
from typing import Callable
from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import ValidationError

from app.utils.helpers import get_client_ip
from app.utils.logger import request_logger

logger = logging.getLogger(__name__)


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Global error handling middleware"""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            response = await call_next(request)
            return response
            
        except ValidationError as e:
            logger.warning(f"Validation error: {e}")
            return JSONResponse(
                status_code=422,
                content={
                    "success": False,
                    "message": "Validation error",
                    "errors": self._format_validation_errors(e),
                    "error_code": "VALIDATION_ERROR"
                }
            )
            
        except HTTPException as e:
            logger.warning(f"HTTP exception: {e.status_code} - {e.detail}")
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "success": False,
                    "message": e.detail,
                    "error_code": "HTTP_ERROR"
                }
            )
            
        except StarletteHTTPException as e:
            logger.warning(f"Starlette HTTP exception: {e.status_code} - {e.detail}")
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "success": False,
                    "message": e.detail,
                    "error_code": "HTTP_ERROR"
                }
            )
            
        except Exception as e:
            # Log the full exception with traceback
            client_ip = get_client_ip(request)
            error_id = self._generate_error_id()
            
            logger.error(
                f"Unhandled exception {error_id}: {str(e)} - "
                f"Path: {request.url.path} - IP: {client_ip}",
                exc_info=True
            )
            
            # Log request details for debugging
            request_logger.log_error(
                request.method, 
                str(request.url), 
                e, 
                client_ip
            )
            
            # Return generic error in production, detailed in development
            from app.config.settings import settings
            
            if settings.is_development:
                error_detail = {
                    "success": False,
                    "message": f"Internal server error: {str(e)}",
                    "error_code": "INTERNAL_ERROR",
                    "error_id": error_id,
                    "traceback": traceback.format_exc().split('\n')
                }
            else:
                error_detail = {
                    "success": False,
                    "message": "An internal server error occurred. Please try again later.",
                    "error_code": "INTERNAL_ERROR",
                    "error_id": error_id
                }
            
            return JSONResponse(
                status_code=500,
                content=error_detail
            )
    
    def _format_validation_errors(self, validation_error: ValidationError) -> list:
        """Format Pydantic validation errors"""
        errors = []
        for error in validation_error.errors():
            field = " -> ".join(str(loc) for loc in error["loc"])
            message = error["msg"]
            errors.append(f"{field}: {message}")
        return errors
    
    def _generate_error_id(self) -> str:
        """Generate unique error ID for tracking"""
        import uuid
        return str(uuid.uuid4())[:8] 