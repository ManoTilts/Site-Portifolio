from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, validator
from app.utils.validators import validate_slug


class ProjectLinksSchema(BaseModel):
    """Project links schema"""
    github: Optional[HttpUrl] = None
    live: Optional[HttpUrl] = None
    demo: Optional[HttpUrl] = None


class ProjectCreateSchema(BaseModel):
    """Schema for creating a new project"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    short_description: Optional[str] = Field(None, max_length=300)
    technologies: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    thumbnail: Optional[str] = None
    links: Optional[ProjectLinksSchema] = None
    category: str = Field(..., min_length=1, max_length=50)
    featured: bool = Field(default=False)
    order: Optional[int] = Field(default=0)
    status: str = Field(default="published")
    slug: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    @validator('slug')
    def validate_project_slug(cls, v, values):
        if v:
            return validate_slug(v)
        # Auto-generate slug from title if not provided
        title = values.get('title', '')
        if title:
            from app.utils.helpers import create_slug
            return create_slug(title)
        return v
    
    @validator('technologies')
    def validate_technologies(cls, v):
        if v:
            return [tech.strip() for tech in v if tech.strip()]
        return []
    
    @validator('status')
    def validate_status(cls, v):
        allowed_statuses = ['published', 'draft', 'archived']
        if v not in allowed_statuses:
            raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v


class ProjectUpdateSchema(BaseModel):
    """Schema for updating a project"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=2000)
    short_description: Optional[str] = Field(None, max_length=300)
    technologies: Optional[List[str]] = None
    images: Optional[List[str]] = None
    thumbnail: Optional[str] = None
    links: Optional[ProjectLinksSchema] = None
    category: Optional[str] = Field(None, min_length=1, max_length=50)
    featured: Optional[bool] = None
    order: Optional[int] = None
    status: Optional[str] = None
    slug: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    
    @validator('slug')
    def validate_project_slug(cls, v):
        if v:
            return validate_slug(v)
        return v
    
    @validator('technologies')
    def validate_technologies(cls, v):
        if v is not None:
            return [tech.strip() for tech in v if tech.strip()]
        return v
    
    @validator('status')
    def validate_status(cls, v):
        if v is not None:
            allowed_statuses = ['published', 'draft', 'archived']
            if v not in allowed_statuses:
                raise ValueError(f'Status must be one of: {", ".join(allowed_statuses)}')
        return v


class ProjectResponseSchema(BaseModel):
    """Schema for project response"""
    id: str
    title: str
    description: str
    short_description: Optional[str]
    technologies: List[str]
    images: List[str]
    thumbnail: Optional[str]
    links: Optional[ProjectLinksSchema]
    category: str
    featured: bool
    order: int
    status: str
    slug: Optional[str]
    metadata: Optional[Dict[str, Any]]
    date_created: datetime
    date_updated: datetime
    main_image: Optional[str] = None
    
    class Config:
        from_attributes = True


class ProjectListSchema(BaseModel):
    """Schema for project list response"""
    id: str
    title: str
    short_description: Optional[str]
    technologies: List[str]
    thumbnail: Optional[str]
    category: str
    featured: bool
    status: str
    slug: Optional[str]
    date_created: datetime
    main_image: Optional[str] = None
    
    class Config:
        from_attributes = True


class ProjectFilterSchema(BaseModel):
    """Schema for filtering projects"""
    category: Optional[str] = None
    featured: Optional[bool] = None
    status: Optional[str] = "published"
    technologies: Optional[List[str]] = None
    search: Optional[str] = None
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=10, ge=1, le=100)
    order_by: Optional[str] = Field(default="date_created")
    order_direction: Optional[str] = Field(default="desc")
    
    @validator('order_direction')
    def validate_order_direction(cls, v):
        if v not in ['asc', 'desc']:
            raise ValueError('order_direction must be "asc" or "desc"')
        return v 