import logging
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
from beanie import PydanticObjectId

from app.models.project import Project
from app.schemas.project import (
    ProjectCreateSchema, 
    ProjectUpdateSchema, 
    ProjectResponseSchema,
    ProjectListSchema
)
from app.schemas.common import PaginatedResponse
from app.utils.helpers import calculate_pagination

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/projects", response_model=ProjectResponseSchema, status_code=status.HTTP_201_CREATED)
async def create_project(project_data: ProjectCreateSchema):
    """Create a new project"""
    try:
        # Create slug if not provided
        if not project_data.slug:
            from app.utils.helpers import create_slug
            project_data.slug = create_slug(project_data.title)
        
        # Convert schema to dict and handle URL serialization
        project_dict = project_data.model_dump()
        
        # Convert Pydantic URL objects to strings for MongoDB compatibility
        def convert_urls_to_strings(obj):
            if isinstance(obj, dict):
                return {k: convert_urls_to_strings(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_urls_to_strings(item) for item in obj]
            elif hasattr(obj, '__str__') and 'pydantic_core' in str(type(obj)):
                return str(obj)
            else:
                return obj
        
        project_dict = convert_urls_to_strings(project_dict)
        
        # Add datetime fields
        from datetime import datetime
        now = datetime.utcnow()
        project_dict["date_created"] = now
        project_dict["date_updated"] = now
        
        # Create project using motor collection directly as fallback
        from app.config.database import database
        collection = database.database.projects
        
        # Insert the document and get the result
        result = await collection.insert_one(project_dict)
        
        # Retrieve the created document
        project_doc = await collection.find_one({"_id": result.inserted_id})
        
        # Convert ObjectId to string for response
        project_doc["id"] = str(project_doc["_id"])
        del project_doc["_id"]
        
        return ProjectResponseSchema.model_validate(project_doc)
        
    except Exception as e:
        logger.error(f"Error creating project: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to create project: {str(e)}")


@router.put("/projects/{project_id}", response_model=ProjectResponseSchema)
async def update_project(project_id: str, project_data: ProjectUpdateSchema):
    """Update an existing project"""
    try:
        from app.config.database import database
        from datetime import datetime
        collection = database.database.projects
        
        # Try to find by ObjectId first, then by slug
        project_doc = None
        try:
            object_id = PydanticObjectId(project_id)
            project_doc = await collection.find_one({"_id": object_id})
        except:
            project_doc = await collection.find_one({"slug": project_id})
        
        if not project_doc:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update fields
        update_data = project_data.model_dump(exclude_unset=True)
        update_data["date_updated"] = datetime.utcnow()
        
        # Update the document
        await collection.update_one(
            {"_id": project_doc["_id"]},
            {"$set": update_data}
        )
        
        # Retrieve updated document
        updated_doc = await collection.find_one({"_id": project_doc["_id"]})
        
        # Convert ObjectId to string for response
        updated_doc["id"] = str(updated_doc["_id"])
        del updated_doc["_id"]
        
        return ProjectResponseSchema.model_validate(updated_doc)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating project {project_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update project: {str(e)}")


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str):
    """Delete a project"""
    try:
        from app.config.database import database
        collection = database.database.projects
        
        # Try to find by ObjectId first, then by slug
        project_doc = None
        try:
            object_id = PydanticObjectId(project_id)
            project_doc = await collection.find_one({"_id": object_id})
        except:
            project_doc = await collection.find_one({"slug": project_id})
        
        if not project_doc:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Delete the document
        await collection.delete_one({"_id": project_doc["_id"]})
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting project {project_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete project: {str(e)}")


@router.get("/projects", response_model=PaginatedResponse[ProjectListSchema])
async def get_all_projects(
    page: int = 1,
    per_page: int = 10,
    status_filter: str = None
):
    """Get all projects (including drafts) for admin"""
    try:
        # Use motor collection directly to avoid Beanie initialization issues
        from app.config.database import database
        collection = database.database.projects
        
        # Build query
        query_filter = {}
        if status_filter:
            query_filter["status"] = status_filter
        
        # Get total count
        total = await collection.count_documents(query_filter)
        
        # Apply pagination and sorting
        skip = (page - 1) * per_page
        cursor = collection.find(query_filter).sort([("order", -1), ("date_created", -1)]).skip(skip).limit(per_page)
        projects_data = await cursor.to_list(length=per_page)
        
        # Convert ObjectId to string and prepare for schema validation
        project_list = []
        for project_data in projects_data:
            # Convert ObjectId to string
            project_data["id"] = str(project_data["_id"])
            del project_data["_id"]
            
            # Convert nested objects to proper format
            if "links" in project_data and project_data["links"]:
                # Ensure links is properly formatted
                pass
            
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