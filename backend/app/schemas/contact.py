from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr, validator
import re


class ContactCreateSchema(BaseModel):
    """Schema for creating a contact submission"""
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr = Field(...)
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=10, max_length=2000)
    phone: Optional[str] = Field(None, max_length=20)
    company: Optional[str] = Field(None, max_length=100)
    
    @validator('name')
    def validate_name(cls, v):
        # Remove extra whitespace and validate name format
        v = ' '.join(v.split())
        if not re.match(r'^[a-zA-Z\s\-\'\.]+$', v):
            raise ValueError('Name can only contain letters, spaces, hyphens, apostrophes, and periods')
        return v
    
    @validator('phone')
    def validate_phone(cls, v):
        if v:
            # Remove all non-digit characters for validation
            digits_only = re.sub(r'\D', '', v)
            if len(digits_only) < 10 or len(digits_only) > 15:
                raise ValueError('Phone number must be between 10-15 digits')
        return v
    
    @validator('message')
    def validate_message(cls, v):
        # Basic content filtering
        v = v.strip()
        if len(v.split()) < 3:
            raise ValueError('Message must contain at least 3 words')
        return v


class ContactUpdateSchema(BaseModel):
    """Schema for updating a contact submission (admin only)"""
    read_status: Optional[bool] = None
    replied: Optional[bool] = None
    notes: Optional[str] = Field(None, max_length=1000)


class ContactResponseSchema(BaseModel):
    """Schema for contact response"""
    id: str
    name: str
    email: EmailStr
    subject: str
    message: str
    phone: Optional[str]
    company: Optional[str]
    date_submitted: datetime
    read_status: bool
    replied: bool
    reply_date: Optional[datetime]
    notes: Optional[str]
    ip_address: Optional[str]
    
    class Config:
        from_attributes = True


class ContactListSchema(BaseModel):
    """Schema for contact list response (simplified)"""
    id: str
    name: str
    email: EmailStr
    subject: str
    company: Optional[str]
    date_submitted: datetime
    read_status: bool
    replied: bool
    
    class Config:
        from_attributes = True


class ContactFilterSchema(BaseModel):
    """Schema for filtering contacts"""
    read_status: Optional[bool] = None
    replied: Optional[bool] = None
    search: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)
    order_by: Optional[str] = Field(default="date_submitted")
    order_direction: Optional[str] = Field(default="desc")
    
    @validator('order_direction')
    def validate_order_direction(cls, v):
        if v not in ['asc', 'desc']:
            raise ValueError('order_direction must be "asc" or "desc"')
        return v


class ContactStatsSchema(BaseModel):
    """Schema for contact statistics"""
    total_contacts: int
    unread_contacts: int
    replied_contacts: int
    this_month: int
    this_week: int
    today: int 