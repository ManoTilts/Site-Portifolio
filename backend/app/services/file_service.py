import os
import shutil
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
import aiofiles
from fastapi import UploadFile, HTTPException

from app.config.settings import settings
from app.utils.helpers import (
    generate_unique_filename, 
    create_directory_if_not_exists,
    format_file_size,
    get_file_extension,
    is_image_file
)
from app.utils.validators import validate_file_size, validate_image_file

logger = logging.getLogger(__name__)


class FileService:
    """File upload and management service"""
    
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.max_file_size = settings.MAX_FILE_SIZE
        self.allowed_extensions = settings.ALLOWED_IMAGE_EXTENSIONS
        
        # Create upload subdirectories
        self._create_directories()
    
    def _create_directories(self):
        """Create necessary upload directories"""
        directories = [
            self.upload_dir,
            self.upload_dir / "images",
            self.upload_dir / "projects",
            self.upload_dir / "thumbnails",
            self.upload_dir / "temp"
        ]
        
        for directory in directories:
            create_directory_if_not_exists(str(directory))
    
    async def upload_file(self, file: UploadFile, subfolder: str = "images", 
                         prefix: str = "") -> Dict[str, Any]:
        """Upload file with validation"""
        try:
            # Validate file
            self._validate_file(file)
            
            # Generate unique filename
            unique_filename = generate_unique_filename(file.filename, prefix)
            
            # Create file path
            file_dir = self.upload_dir / subfolder
            create_directory_if_not_exists(str(file_dir))
            file_path = file_dir / unique_filename
            
            # Save file
            await self._save_file(file, file_path)
            
            # Get file info
            file_info = await self._get_file_info(file_path, subfolder, unique_filename)
            
            logger.info(f"File uploaded successfully: {file_path}")
            return file_info
            
        except Exception as e:
            logger.error(f"File upload failed: {e}")
            raise HTTPException(status_code=400, detail=str(e))
    
    def _validate_file(self, file: UploadFile):
        """Validate uploaded file"""
        if not file.filename:
            raise ValueError("No filename provided")
        
        # Check file extension
        if not validate_image_file(file.filename):
            raise ValueError(f"File type not allowed. Allowed types: {', '.join(self.allowed_extensions)}")
        
        # Check file size (if available)
        if hasattr(file, 'size') and file.size:
            if not validate_file_size(file.size, self.max_file_size):
                raise ValueError(f"File too large. Maximum size: {format_file_size(self.max_file_size)}")
    
    async def _save_file(self, file: UploadFile, file_path: Path):
        """Save uploaded file to disk"""
        try:
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                
                # Check content size
                if len(content) > self.max_file_size:
                    raise ValueError(f"File too large. Maximum size: {format_file_size(self.max_file_size)}")
                
                await f.write(content)
                
        except Exception as e:
            # Clean up partial file if exists
            if file_path.exists():
                file_path.unlink()
            raise e
    
    async def _get_file_info(self, file_path: Path, subfolder: str, filename: str) -> Dict[str, Any]:
        """Get file information"""
        stat = file_path.stat()
        
        # Generate URL path
        url_path = f"/uploads/{subfolder}/{filename}"
        
        return {
            "filename": filename,
            "original_filename": filename,
            "size": stat.st_size,
            "size_formatted": format_file_size(stat.st_size),
            "extension": get_file_extension(filename),
            "is_image": is_image_file(filename),
            "url": url_path,
            "path": str(file_path),
            "subfolder": subfolder
        }
    
    async def upload_multiple_files(self, files: List[UploadFile], 
                                   subfolder: str = "images", prefix: str = "") -> List[Dict[str, Any]]:
        """Upload multiple files"""
        results = []
        errors = []
        
        for file in files:
            try:
                result = await self.upload_file(file, subfolder, prefix)
                results.append(result)
            except Exception as e:
                errors.append({
                    "filename": file.filename,
                    "error": str(e)
                })
        
        return {
            "uploaded": results,
            "errors": errors,
            "total": len(files),
            "successful": len(results),
            "failed": len(errors)
        }
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from disk"""
        try:
            path = Path(file_path)
            
            # Security check - ensure file is within upload directory
            if not str(path.resolve()).startswith(str(self.upload_dir.resolve())):
                raise ValueError("Invalid file path")
            
            if path.exists():
                path.unlink()
                logger.info(f"File deleted: {path}")
                return True
            else:
                logger.warning(f"File not found for deletion: {path}")
                return False
                
        except Exception as e:
            logger.error(f"File deletion failed: {e}")
            return False
    
    def delete_multiple_files(self, file_paths: List[str]) -> Dict[str, Any]:
        """Delete multiple files"""
        results = {"deleted": [], "errors": []}
        
        for file_path in file_paths:
            try:
                if self.delete_file(file_path):
                    results["deleted"].append(file_path)
                else:
                    results["errors"].append({
                        "path": file_path,
                        "error": "File not found"
                    })
            except Exception as e:
                results["errors"].append({
                    "path": file_path,
                    "error": str(e)
                })
        
        return results
    
    def get_file_info(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Get file information"""
        try:
            path = Path(file_path)
            
            if not path.exists():
                return None
            
            stat = path.stat()
            
            return {
                "filename": path.name,
                "size": stat.st_size,
                "size_formatted": format_file_size(stat.st_size),
                "extension": get_file_extension(path.name),
                "is_image": is_image_file(path.name),
                "path": str(path),
                "created": stat.st_ctime,
                "modified": stat.st_mtime
            }
            
        except Exception as e:
            logger.error(f"Failed to get file info: {e}")
            return None
    
    def list_files(self, subfolder: str = "", limit: int = 100) -> List[Dict[str, Any]]:
        """List files in upload directory"""
        try:
            search_dir = self.upload_dir / subfolder if subfolder else self.upload_dir
            
            if not search_dir.exists():
                return []
            
            files = []
            for file_path in search_dir.rglob("*"):
                if file_path.is_file() and len(files) < limit:
                    file_info = self.get_file_info(str(file_path))
                    if file_info:
                        files.append(file_info)
            
            return sorted(files, key=lambda x: x["modified"], reverse=True)
            
        except Exception as e:
            logger.error(f"Failed to list files: {e}")
            return []
    
    def cleanup_temp_files(self, older_than_hours: int = 24) -> int:
        """Clean up temporary files older than specified hours"""
        try:
            temp_dir = self.upload_dir / "temp"
            if not temp_dir.exists():
                return 0
            
            import time
            cutoff_time = time.time() - (older_than_hours * 3600)
            deleted_count = 0
            
            for file_path in temp_dir.iterdir():
                if file_path.is_file() and file_path.stat().st_mtime < cutoff_time:
                    try:
                        file_path.unlink()
                        deleted_count += 1
                    except Exception as e:
                        logger.warning(f"Failed to delete temp file {file_path}: {e}")
            
            logger.info(f"Cleaned up {deleted_count} temporary files")
            return deleted_count
            
        except Exception as e:
            logger.error(f"Temp file cleanup failed: {e}")
            return 0
    
    def get_storage_stats(self) -> Dict[str, Any]:
        """Get storage usage statistics"""
        try:
            total_size = 0
            file_count = 0
            
            for file_path in self.upload_dir.rglob("*"):
                if file_path.is_file():
                    total_size += file_path.stat().st_size
                    file_count += 1
            
            return {
                "total_files": file_count,
                "total_size": total_size,
                "total_size_formatted": format_file_size(total_size),
                "upload_dir": str(self.upload_dir)
            }
            
        except Exception as e:
            logger.error(f"Failed to get storage stats: {e}")
            return {
                "total_files": 0,
                "total_size": 0,
                "total_size_formatted": "0 B",
                "upload_dir": str(self.upload_dir)
            }


# Global file service instance
file_service = FileService() 