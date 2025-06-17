from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr, validator


class AdminLoginSchema(BaseModel):
    """Schema for admin login"""
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)


class AdminCreateSchema(BaseModel):
    """Schema for creating admin user"""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(...)
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = Field(None, max_length=100)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    
    @validator('username')
    def validate_username(cls, v):
        import re
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain letters, numbers, hyphens, and underscores')
        return v.lower()
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v


class AdminUpdateSchema(BaseModel):
    """Schema for updating admin user"""
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=100)
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8)
    
    @validator('password')
    def validate_password(cls, v):
        if v is not None:
            if len(v) < 8:
                raise ValueError('Password must be at least 8 characters long')
            if not any(c.isdigit() for c in v):
                raise ValueError('Password must contain at least one digit')
            if not any(c.isupper() for c in v):
                raise ValueError('Password must contain at least one uppercase letter')
            if not any(c.islower() for c in v):
                raise ValueError('Password must contain at least one lowercase letter')
        return v


class AdminResponseSchema(BaseModel):
    """Schema for admin response"""
    id: str
    username: str
    email: EmailStr
    full_name: Optional[str]
    is_active: bool
    is_superuser: bool
    last_login: Optional[datetime]
    login_count: int
    date_created: datetime
    date_updated: datetime
    
    class Config:
        from_attributes = True


class TokenResponseSchema(BaseModel):
    """Schema for token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    admin: AdminResponseSchema


class PasswordChangeSchema(BaseModel):
    """Schema for password change"""
    current_password: str = Field(..., min_length=1)
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)
    
    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('new_password')
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain at least one digit')
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v


class DashboardStatsSchema(BaseModel):
    """Schema for dashboard statistics"""
    total_projects: int
    published_projects: int
    draft_projects: int
    featured_projects: int
    total_contacts: int
    unread_contacts: int
    recent_contacts: int
    total_uploads: int
    storage_used: str 