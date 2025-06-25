import logging
from typing import List
from fastapi import APIRouter, HTTPException, Query, Depends
from beanie import PydanticObjectId

from app.models.project import Project
from app.schemas.project import (
    ProjectResponseSchema, 
    ProjectListSchema, 
    ProjectFilterSchema
)
from app.schemas.common import PaginatedResponse
from app.utils.helpers import calculate_pagination
from app.config.database import database

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/projects", response_model=PaginatedResponse[ProjectListSchema])
async def get_projects(
    category: str = Query(None, description="Filter by category"),
    featured: bool = Query(None, description="Filter by featured status"),
    search: str = Query(None, description="Search in title and description"),
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(10, ge=1, le=50, description="Items per page")
):
    """Get list of published projects with pagination and filtering"""
    try:
        # Check if database is available
        if database.database is None:
            logger.error("Database not initialized - MongoDB connection required")
            raise HTTPException(
                status_code=503, 
                detail="Database not available. Please ensure MongoDB is running and properly configured."
            )
        
        # Use database if available
        query_filter = {"status": "published"}
        
        if category:
            query_filter["category"] = category
        
        if featured is not None:
            query_filter["featured"] = featured
        
        # Build the query
        query = Project.find(query_filter)
        
        # Add text search if provided
        if search:
            query = Project.find(
                {
                    **query_filter,
                    "$text": {"$search": search}
                }
            )
        
        # Get total count
        total = await query.count()
        
        # Apply pagination and sorting
        skip = (page - 1) * per_page
        projects = await query.sort(-Project.order, -Project.date_created).skip(skip).limit(per_page).to_list()
        
        # Convert to response schema
        project_list = [ProjectListSchema.from_orm(project) for project in projects]
        
        # Calculate pagination info
        pagination = calculate_pagination(total, page, per_page)
        
        return PaginatedResponse(
            items=project_list,
            total=total,
            page=page,
            per_page=per_page,
            pages=pagination["pages"],
            has_next=pagination["has_next"],
            has_prev=pagination["has_prev"]
        )
        
    except Exception as e:
        logger.error(f"Error fetching projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch projects")


@router.get("/projects/{project_id}", response_model=ProjectResponseSchema)
async def get_project(project_id: str):
    """Get a specific project by ID or slug"""
    try:
        # Try to find by ID first
        try:
            object_id = PydanticObjectId(project_id)
            project = await Project.get(object_id)
        except:
            # If not a valid ObjectId, try to find by slug
            project = await Project.find_one({"slug": project_id, "status": "published"})
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if project.status != "published":
            raise HTTPException(status_code=404, detail="Project not found")
        
        return ProjectResponseSchema.from_orm(project)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch project")


@router.get("/projects/featured", response_model=List[ProjectListSchema])
async def get_featured_projects(limit: int = Query(6, ge=1, le=20)):
    """Get featured projects"""
    try:
        projects = await Project.find(
            {"featured": True, "status": "published"}
        ).sort(-Project.order, -Project.date_created).limit(limit).to_list()
        
        return [ProjectListSchema.from_orm(project) for project in projects]
        
    except Exception as e:
        logger.error(f"Error fetching featured projects: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch featured projects")


@router.get("/projects/categories")
async def get_project_categories():
    """Get all unique project categories"""
    try:
        # Check if database is available
        if database.database is None:
            logger.error("Database not initialized - MongoDB connection required")
            raise HTTPException(
                status_code=503, 
                detail="Database not available. Please ensure MongoDB is running and properly configured."
            )
        
        # Use database if available
        categories = await Project.distinct("category", {"status": "published"})
        
        # Get category counts
        category_counts = []
        for category in categories:
            count = await Project.find({"category": category, "status": "published"}).count()
            category_counts.append({
                "name": category,
                "count": count
            })
        
        # Sort by count descending
        category_counts.sort(key=lambda x: x["count"], reverse=True)
        
        return {
            "categories": category_counts,
            "total_categories": len(categories)
        }
        
    except Exception as e:
        logger.error(f"Error fetching project categories: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch project categories") 