from datetime import datetime
from typing import List, Optional, Dict, Any
from beanie import Document, Indexed
from pydantic import Field, HttpUrl
from pymongo import IndexModel, TEXT


class ProjectLinks(Document):
    """Project links schema"""
    github: Optional[HttpUrl] = None
    live: Optional[HttpUrl] = None
    demo: Optional[HttpUrl] = None


class Project(Document):
    """Project model for portfolio items"""
    
    title: Indexed(str) = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    short_description: Optional[str] = Field(None, max_length=300)
    technologies: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)  # URLs to uploaded images
    thumbnail: Optional[str] = None  # Main thumbnail image
    links: Optional[ProjectLinks] = None
    category: Indexed(str) = Field(..., min_length=1, max_length=50)
    featured: Indexed(bool) = Field(default=False)
    order: Optional[int] = Field(default=0)  # For manual ordering
    status: str = Field(default="published")  # published, draft, archived
    slug: Optional[str] = None  # URL-friendly version of title
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    date_created: datetime = Field(default_factory=datetime.utcnow)
    date_updated: datetime = Field(default_factory=datetime.utcnow)
    
    class Settings:
        name = "projects"
        indexes = [
            IndexModel([("title", TEXT), ("description", TEXT)]),
            IndexModel("featured"),
            IndexModel("category"),
            IndexModel("status"),
            IndexModel("date_created"),
            IndexModel("order"),
        ]
    
    def dict(self, **kwargs):
        """Override dict method to include computed fields"""
        data = super().dict(**kwargs)
        data["id"] = str(self.id)
        return data
    
    @property
    def main_image(self) -> Optional[str]:
        """Get the main image for the project"""
        return self.thumbnail or (self.images[0] if self.images else None)
    
    def update_timestamp(self):
        """Update the date_updated field"""
        self.date_updated = datetime.utcnow() 