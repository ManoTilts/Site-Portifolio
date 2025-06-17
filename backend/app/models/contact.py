from datetime import datetime
from typing import Optional
from beanie import Document, Indexed
from pydantic import Field, EmailStr
from pymongo import IndexModel


class Contact(Document):
    """Contact form submission model"""
    
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr = Field(...)
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=2000)
    phone: Optional[str] = Field(None, max_length=20)
    company: Optional[str] = Field(None, max_length=100)
    date_submitted: Indexed(datetime) = Field(default_factory=datetime.utcnow)
    read_status: Indexed(bool) = Field(default=False)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    replied: bool = Field(default=False)
    reply_date: Optional[datetime] = None
    notes: Optional[str] = Field(None, max_length=1000)
    
    class Settings:
        name = "contacts"
        indexes = [
            IndexModel("date_submitted"),
            IndexModel("read_status"),
            IndexModel("email"),
            IndexModel("replied"),
        ]
    
    def dict(self, **kwargs):
        """Override dict method to include computed fields"""
        data = super().dict(**kwargs)
        data["id"] = str(self.id)
        return data
    
    def mark_as_read(self):
        """Mark contact as read"""
        self.read_status = True
    
    def mark_as_replied(self):
        """Mark contact as replied"""
        self.replied = True
        self.reply_date = datetime.utcnow() 