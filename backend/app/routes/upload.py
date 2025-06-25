import logging
import os
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from fastapi.responses import JSONResponse

from app.config.settings import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_file(file: UploadFile = File(...)):
    """Upload a single file"""
    try:
        # Check file size (10MB limit)
        if file.size > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 10MB.")
        
        # Check file type
        allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
        if file.content_type not in allowed_types:
            raise HTTPException(status_code=400, detail="File type not allowed. Only JPEG, PNG, GIF, and WebP images are supported.")
        
        # Generate unique filename
        import uuid
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Return file URL
        file_url = f"/uploads/{unique_filename}"
        
        return {
            "filename": unique_filename,
            "original_filename": file.filename,
            "url": file_url,
            "size": file.size,
            "content_type": file.content_type
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file")


@router.post("/upload/multiple", status_code=status.HTTP_201_CREATED)
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    """Upload multiple files"""
    try:
        if len(files) > 10:
            raise HTTPException(status_code=400, detail="Too many files. Maximum 10 files per request.")
        
        uploaded_files = []
        
        for file in files:
            # Check file size (10MB limit)
            if file.size > 10 * 1024 * 1024:
                raise HTTPException(status_code=413, detail=f"File {file.filename} too large. Maximum size is 10MB.")
            
            # Check file type
            allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
            if file.content_type not in allowed_types:
                raise HTTPException(status_code=400, detail=f"File type not allowed for {file.filename}. Only JPEG, PNG, GIF, and WebP images are supported.")
            
            # Generate unique filename
            import uuid
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
            
            # Save file
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Add to uploaded files list
            file_url = f"/uploads/{unique_filename}"
            uploaded_files.append({
                "filename": unique_filename,
                "original_filename": file.filename,
                "url": file_url,
                "size": file.size,
                "content_type": file.content_type
            })
        
        return {
            "uploaded_files": uploaded_files,
            "total_files": len(uploaded_files)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading files: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload files")


@router.delete("/upload/{filename}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(filename: str):
    """Delete an uploaded file"""
    try:
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Check if file is in upload directory (security check)
        if not file_path.startswith(settings.UPLOAD_DIR):
            raise HTTPException(status_code=400, detail="Invalid file path")
        
        os.remove(file_path)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting file {filename}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete file") 