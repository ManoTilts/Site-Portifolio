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
        
        project = Project(**project_data.dict())
        await project.save()
        
        return ProjectResponseSchema.from_orm(project)
        
    except Exception as e:
        logger.error(f"Error creating project: {e}")
        raise HTTPException(status_code=500, detail="Failed to create project")


@router.put("/projects/{project_id}", response_model=ProjectResponseSchema)
async def update_project(project_id: str, project_data: ProjectUpdateSchema):
    """Update an existing project"""
    try:
        try:
            object_id = PydanticObjectId(project_id)
            project = await Project.get(object_id)
        except:
            project = await Project.find_one({"slug": project_id})
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Update fields
        update_data = project_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(project, field, value)
        
        project.update_timestamp()
        await project.save()
        
        return ProjectResponseSchema.from_orm(project)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to update project")


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(project_id: str):
    """Delete a project"""
    try:
        try:
            object_id = PydanticObjectId(project_id)
            project = await Project.get(object_id)
        except:
            project = await Project.find_one({"slug": project_id})
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        await project.delete()
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting project {project_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete project")


@router.get("/projects", response_model=PaginatedResponse[ProjectListSchema])
async def get_all_projects(
    page: int = 1,
    per_page: int = 10,
    status_filter: str = None
):
    """Get all projects (including drafts) for admin"""
    try:
        # Build query
        query_filter = {}
        if status_filter:
            query_filter["status"] = status_filter
        
        query = Project.find(query_filter)
        
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