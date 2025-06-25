from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field, EmailStr
from pymongo import IndexModel


class Admin(Document):
    """Admin user model for authentication"""
    
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(...)
    hashed_password: str = Field(...)
    full_name: Optional[str] = Field(None, max_length=100)
    is_active: bool = Field(default=True)
    is_superuser: bool = Field(default=False)
    last_login: Optional[datetime] = None
    login_count: int = Field(default=0)
    date_created: datetime = Field(default_factory=datetime.utcnow)
    date_updated: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "admins"
        indexes = [
            IndexModel("username", unique=True),
            IndexModel("email", unique=True),
            IndexModel("is_active"),
        ]
    
    def dict(self, **kwargs):
        """Override dict method to exclude sensitive data"""
        data = super().dict(**kwargs)
        data["id"] = str(self.id)
        # Remove sensitive fields from serialization
        data.pop("hashed_password", None)
        return data
    
    def update_login(self):
        """Update login information"""
        self.last_login = datetime.utcnow()
        self.login_count += 1
    
    def update_timestamp(self):
        """Update the date_updated field"""
        self.date_updated = datetime.utcnow() 