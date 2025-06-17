from typing import Optional, Any, Generic, TypeVar, List
from pydantic import BaseModel, Field

T = TypeVar('T')


class ResponseModel(BaseModel, Generic[T]):
    """Generic response model"""
    success: bool = True
    message: str = "Success"
    data: Optional[T] = None
    errors: Optional[List[str]] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response model"""
    items: List[T]
    total: int
    page: int = Field(ge=1)
    per_page: int = Field(ge=1, le=100)
    pages: int
    has_next: bool
    has_prev: bool


class HealthCheck(BaseModel):
    """Health check response"""
    status: str = "healthy"
    timestamp: str
    version: str
    database: str = "connected"


class ErrorResponse(BaseModel):
    """Error response model"""
    success: bool = False
    message: str
    errors: Optional[List[str]] = None
    error_code: Optional[str] = None


class SuccessResponse(BaseModel):
    """Success response model"""
    success: bool = True
    message: str
    data: Optional[Any] = None 