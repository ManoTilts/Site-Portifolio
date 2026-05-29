import logging
import os
import uuid
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends

from app.config.settings import settings
from app.models.admin import Admin
from app.utils.dependencies import get_current_admin

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


async def _save_image(file: UploadFile) -> dict:
    """Validate and persist a single uploaded image, returning its metadata.

    Reads the content before writing so the size limit is enforced even when
    the client omits a Content-Length header (UploadFile.size can be None).
    The stored filename is a server-generated UUID, so the original (untrusted)
    filename never influences the path on disk.
    """
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed for {file.filename}. Only JPEG, PNG, GIF, and WebP images are supported.",
        )

    file_extension = os.path.splitext(file.filename or "")[1].lower()
    if file_extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File extension not allowed for {file.filename}.",
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File {file.filename} too large. Maximum size is 10MB.",
        )

    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    return {
        "filename": unique_filename,
        "original_filename": file.filename,
        "url": f"/uploads/{unique_filename}",
        "size": len(content),
        "content_type": file.content_type,
    }


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    current_admin: Admin = Depends(get_current_admin),
):
    """Upload a single file"""
    try:
        return await _save_image(file)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading file: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload file")


@router.post("/upload/multiple", status_code=status.HTTP_201_CREATED)
async def upload_multiple_files(
    files: List[UploadFile] = File(...),
    current_admin: Admin = Depends(get_current_admin),
):
    """Upload multiple files"""
    try:
        if len(files) > 10:
            raise HTTPException(status_code=400, detail="Too many files. Maximum 10 files per request.")

        uploaded_files = [await _save_image(file) for file in files]

        return {
            "uploaded_files": uploaded_files,
            "total_files": len(uploaded_files),
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading files: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload files")


@router.delete("/upload/{filename}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_file(
    filename: str,
    current_admin: Admin = Depends(get_current_admin),
):
    """Delete an uploaded file"""
    try:
        # Strip any directory components so the request can never escape the
        # upload directory (e.g. "../../etc/passwd" -> "passwd").
        safe_name = os.path.basename(filename)
        upload_dir = os.path.realpath(settings.UPLOAD_DIR)
        file_path = os.path.realpath(os.path.join(upload_dir, safe_name))

        # Defence in depth: ensure the resolved path is still inside upload_dir.
        if os.path.commonpath([upload_dir, file_path]) != upload_dir:
            raise HTTPException(status_code=400, detail="Invalid file path")

        if not os.path.isfile(file_path):
            raise HTTPException(status_code=404, detail="File not found")

        os.remove(file_path)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting file {filename}: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete file")
