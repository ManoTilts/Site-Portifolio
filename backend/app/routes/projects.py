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
        
        # Use motor collection directly
        collection = database.database.projects
        
        # Build query filter
        query_filter = {"status": {"$in": ["published", "in-progress"]}}
        
        if category:
            query_filter["category"] = category
        
        if featured is not None:
            query_filter["featured"] = featured
        
        # Add text search if provided
        if search:
            query_filter["$text"] = {"$search": search}
        
        # Get total count
        total = await collection.count_documents(query_filter)
        
        # Apply pagination and sorting
        skip = (page - 1) * per_page
        cursor = collection.find(query_filter).sort([("order", -1), ("date_created", -1)]).skip(skip).limit(per_page)
        projects_data = await cursor.to_list(length=per_page)
        
        # Convert to response schema
        project_list = []
        for project_data in projects_data:
            # Convert ObjectId to string
            project_data["id"] = str(project_data["_id"])
            del project_data["_id"]
            
            # Ensure backwards compatibility for list schema
            if "short_description" not in project_data:
                project_data["short_description"] = None
            if "thumbnail" not in project_data:
                project_data["thumbnail"] = None
            if "slug" not in project_data:
                project_data["slug"] = None
            
            project_list.append(ProjectListSchema.model_validate(project_data))
        
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
        logger.error(f"Error fetching projects: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch projects: {str(e)}")


@router.get("/projects/featured", response_model=List[ProjectListSchema])
async def get_featured_projects(limit: int = Query(6, ge=1, le=20)):
    """Get featured projects"""
    try:
        # Use motor collection directly
        collection = database.database.projects
        
        cursor = collection.find(
            {"featured": True, "status": {"$in": ["published", "in-progress"]}}
        ).sort([("order", -1), ("date_created", -1)]).limit(limit)
        
        projects_data = await cursor.to_list(length=limit)
        
        # Convert to response schema
        project_list = []
        for project_data in projects_data:
            # Convert ObjectId to string
            project_data["id"] = str(project_data["_id"])
            del project_data["_id"]
            
            # Ensure backwards compatibility for list schema
            if "short_description" not in project_data:
                project_data["short_description"] = None
            if "thumbnail" not in project_data:
                project_data["thumbnail"] = None
            if "slug" not in project_data:
                project_data["slug"] = None
            
            project_list.append(ProjectListSchema.model_validate(project_data))
        
        return project_list
        
    except Exception as e:
        logger.error(f"Error fetching featured projects: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch featured projects: {str(e)}")


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
        
        # Use motor collection directly
        collection = database.database.projects
        
        categories = await collection.distinct("category", {"status": {"$in": ["published", "in-progress"]}})
        
        # Get category counts
        category_counts = []
        for category in categories:
            count = await collection.count_documents({"category": category, "status": {"$in": ["published", "in-progress"]}})
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
        logger.error(f"Error fetching project categories: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch project categories: {str(e)}")


@router.get("/projects/{project_id}", response_model=ProjectResponseSchema)
async def get_project(project_id: str):
    """Get a specific project by ID or slug"""
    try:
        # Use motor collection directly
        collection = database.database.projects
        
        # Try to find by ID first
        project_doc = None
        try:
            object_id = PydanticObjectId(project_id)
            project_doc = await collection.find_one({"_id": object_id})
        except:
            # If not a valid ObjectId, try to find by slug
            project_doc = await collection.find_one({"slug": project_id, "status": {"$in": ["published", "in-progress"]}})
        
        if not project_doc:
            raise HTTPException(status_code=404, detail="Project not found")
        
        if project_doc.get("status") not in ["published", "in-progress"]:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Convert ObjectId to string
        project_doc["id"] = str(project_doc["_id"])
        del project_doc["_id"]
        
        # Ensure all fields exist with default values for backward compatibility
        default_fields = {
            "long_description": None,
            "challenges": None,
            "solutions": None,
            "highlights": None,
            "duration": None,
            "team_size": None,
            "role": None,
            "short_description": None,
            "thumbnail": None,
            "links": None,
            "slug": None,
            "metadata": None
        }
        
        for field, default_value in default_fields.items():
            if field not in project_doc:
                project_doc[field] = default_value
        
        return ProjectResponseSchema.model_validate(project_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching project {project_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch project: {str(e)}") 