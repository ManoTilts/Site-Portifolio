from datetime import datetime
from typing import List, Optional, Dict, Any
from beanie import Document
from pydantic import Field, HttpUrl, validator
from pymongo import IndexModel, TEXT


class ProjectLinks(Document):
    """Project links schema"""
    github: Optional[HttpUrl] = None
    live: Optional[HttpUrl] = None
    demo: Optional[HttpUrl] = None


class Project(Document):
    """Project model for portfolio items"""
    
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    short_description: Optional[str] = Field(None, max_length=300)
    long_description: Optional[str] = Field(None, max_length=5000)  # Detailed description for modal
    technologies: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)  # URLs to uploaded images
    thumbnail: Optional[str] = None  # Main thumbnail image
    links: Optional[ProjectLinks] = None
    category: str = Field(..., min_length=1, max_length=50)
    featured: bool = Field(default=False)
    order: Optional[int] = Field(default=0)  # For manual ordering
    status: str = Field(default="published")  # published, draft, archived
    slug: Optional[str] = None  # URL-friendly version of title
    challenges: Optional[List[str]] = Field(default_factory=list)  # Project challenges
    solutions: Optional[List[str]] = Field(default_factory=list)  # Solutions implemented
    highlights: Optional[List[str]] = Field(default_factory=list)  # Key features/highlights
    duration: Optional[str] = Field(None, max_length=100)  # Project duration
    team_size: Optional[int] = Field(None, ge=1)  # Team size
    role: Optional[str] = Field(None, max_length=100)  # Role in the project
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    date_created: datetime = Field(default_factory=datetime.utcnow)
    date_updated: datetime = Field(default_factory=datetime.utcnow)
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['published', 'draft', 'archived', 'in-progress']
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v
    
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
    
    def model_dump(self, **kwargs):
        """Override model_dump method to include computed fields"""
        data = super().model_dump(**kwargs)
        data["id"] = str(self.id)
        return data
    
    @property
    def main_image(self) -> Optional[str]:
        """Get the main image for the project"""
        return self.thumbnail or (self.images[0] if self.images else None)
    
    def update_timestamp(self):
        """Update the date_updated field"""
        self.date_updated = datetime.utcnow() 