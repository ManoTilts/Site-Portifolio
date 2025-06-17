import logging
import time
from typing import Callable, Dict, Optional
from collections import defaultdict, deque
from fastapi import Request, Response, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.utils.helpers import get_client_ip
from app.utils.logger import security_logger

logger = logging.getLogger(__name__)


class InMemoryRateLimiter:
    """In-memory rate limiter using sliding window"""
    
    def __init__(self):
        self.requests: Dict[str, deque] = defaultdict(deque)
        self.cleanup_interval = 300  # 5 minutes
        self.last_cleanup = time.time()
    
    def is_allowed(self, key: str, limit: int, window: int) -> tuple[bool, dict]:
        """Check if request is allowed under rate limit"""
        current_time = time.time()
        
        # Cleanup old entries periodically
        if current_time - self.last_cleanup > self.cleanup_interval:
            self._cleanup_old_entries(current_time)
            self.last_cleanup = current_time
        
        # Remove old requests outside the window
        request_queue = self.requests[key]
        while request_queue and request_queue[0] <= current_time - window:
            request_queue.popleft()
        
        # Check if under limit
        current_count = len(request_queue)
        remaining = max(0, limit - current_count)
        
        if current_count < limit:
            request_queue.append(current_time)
            return True, {
                "allowed": True,
                "limit": limit,
                "remaining": remaining - 1,
                "reset_time": current_time + window,
                "window": window
            }
        else:
            # Calculate when the limit will reset
            reset_time = request_queue[0] + window
            return False, {
                "allowed": False,
                "limit": limit,
                "remaining": 0,
                "reset_time": reset_time,
                "window": window,
                "retry_after": int(reset_time - current_time)
            }
    
    def _cleanup_old_entries(self, current_time: float):
        """Remove old entries to prevent memory buildup"""
        max_age = 3600  # 1 hour
        keys_to_remove = []
        
        for key, request_queue in self.requests.items():
            # Remove requests older than max_age
            while request_queue and request_queue[0] <= current_time - max_age:
                request_queue.popleft()
            
            # Remove empty queues
            if not request_queue:
                keys_to_remove.append(key)
        
        for key in keys_to_remove:
            del self.requests[key]


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Rate limiting middleware"""
    
    def __init__(self, app):
        super().__init__(app)
        self.limiter = InMemoryRateLimiter()
        
        # Define rate limits for different endpoints
        self.rate_limits = {
            "/api/contact": {"limit": 5, "window": 60},  # 5 requests per minute
            "/api/admin/upload": {"limit": 10, "window": 60},  # 10 requests per minute
            "/api/admin/login": {"limit": 5, "window": 300},  # 5 requests per 5 minutes
        }
        
        # Global rate limits
        self.global_limits = {
            "default": {"limit": 100, "window": 60},  # 100 requests per minute
            "admin": {"limit": 500, "window": 60},    # 500 requests per minute for admin
        }
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Skip rate limiting for health checks and static files
        if self._should_skip_rate_limiting(request):
            return await call_next(request)
        
        client_ip = get_client_ip(request)
        path = request.url.path
        
        # Check endpoint-specific rate limits
        if path in self.rate_limits:
            limit_config = self.rate_limits[path]
            key = f"endpoint:{path}:{client_ip}"
            
            allowed, info = self.limiter.is_allowed(
                key, 
                limit_config["limit"], 
                limit_config["window"]
            )
            
            if not allowed:
                # Log rate limit violation
                security_logger.log_rate_limit(
                    path, 
                    client_ip, 
                    f"{limit_config['limit']}/{limit_config['window']}s"
                )
                
                return self._create_rate_limit_response(info)
        
        # Check global rate limits
        user_type = self._get_user_type(request)
        global_config = self.global_limits.get(user_type, self.global_limits["default"])
        global_key = f"global:{user_type}:{client_ip}"
        
        allowed, global_info = self.limiter.is_allowed(
            global_key,
            global_config["limit"],
            global_config["window"]
        )
        
        if not allowed:
            security_logger.log_rate_limit(
                "global", 
                client_ip, 
                f"{global_config['limit']}/{global_config['window']}s"
            )
            return self._create_rate_limit_response(global_info)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers to response
        if allowed:
            self._add_rate_limit_headers(response, global_info)
        
        return response
    
    def _should_skip_rate_limiting(self, request: Request) -> bool:
        """Check if request should skip rate limiting"""
        path = request.url.path
        
        # Skip for health checks, docs, and static files
        skip_paths = [
            "/api/health",
            "/docs",
            "/redoc",
            "/openapi.json",
            "/uploads/",
            "/favicon.ico"
        ]
        
        return any(path.startswith(skip_path) for skip_path in skip_paths)
    
    def _get_user_type(self, request: Request) -> str:
        """Determine user type for rate limiting"""
        # Check if request has admin authentication
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            try:
                from app.utils.security import verify_access_token
                token = auth_header.split(" ")[1]
                payload = verify_access_token(token)
                if payload:
                    return "admin"
            except:
                pass
        
        return "default"
    
    def _create_rate_limit_response(self, rate_limit_info: dict) -> JSONResponse:
        """Create rate limit exceeded response"""
        headers = {
            "X-RateLimit-Limit": str(rate_limit_info["limit"]),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": str(int(rate_limit_info["reset_time"])),
        }
        
        if "retry_after" in rate_limit_info:
            headers["Retry-After"] = str(rate_limit_info["retry_after"])
        
        return JSONResponse(
            status_code=429,
            content={
                "success": False,
                "message": "Rate limit exceeded. Please try again later.",
                "error_code": "RATE_LIMIT_EXCEEDED",
                "details": {
                    "limit": rate_limit_info["limit"],
                    "window": rate_limit_info["window"],
                    "retry_after": rate_limit_info.get("retry_after", 60)
                }
            },
            headers=headers
        )
    
    def _add_rate_limit_headers(self, response: Response, rate_limit_info: dict):
        """Add rate limit headers to response"""
        response.headers["X-RateLimit-Limit"] = str(rate_limit_info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(rate_limit_info["remaining"])
        response.headers["X-RateLimit-Reset"] = str(int(rate_limit_info["reset_time"])) 