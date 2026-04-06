import logging
import os
from typing import Optional, Literal
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Query
from fastapi.responses import FileResponse
from pathlib import Path

from app.config.settings import settings

logger = logging.getLogger(__name__)

router = APIRouter()

# Supported languages
SUPPORTED_LANGUAGES = ["en", "pt"]
LANGUAGE_NAMES = {
    "en": "English",
    "pt": "Portuguese"
}

def get_cv_path(language: str) -> str:
    """Get CV file path for a specific language"""
    filename = f"cv_{language}.pdf"
    return os.path.join(settings.UPLOAD_DIR, "cv", filename)

def get_cv_filename(language: str) -> str:
    """Get downloadable filename for a specific language"""
    if language == "en":
        return "Felipe_Mazzeo_Barbosa_CV_English.pdf"
    elif language == "pt":
        return "Felipe_Mazzeo_Barbosa_CV_Portuguese.pdf"
    else:
        return f"Felipe_Mazzeo_Barbosa_CV_{language}.pdf"


@router.post("/cv/upload", status_code=status.HTTP_201_CREATED)
async def upload_cv(
    file: UploadFile = File(...), 
    language: Literal["en", "pt"] = Query(..., description="Language of the CV (en for English, pt for Portuguese)")
):
    """Upload CV/Resume in a specific language (PDF only)"""
    try:
        # Validate language
        if language not in SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=400, 
                detail=f"Language '{language}' not supported. Supported languages: {', '.join(SUPPORTED_LANGUAGES)}"
            )
        
        # Validate file type
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400, 
                detail="Only PDF files are allowed for CV upload"
            )
        
        # Check file size (5MB limit for CV)
        if file.size > 5 * 1024 * 1024:
            raise HTTPException(
                status_code=413, 
                detail="CV file too large. Maximum size is 5MB."
            )
        
        # Create CV directory if it doesn't exist
        cv_dir = os.path.join(settings.UPLOAD_DIR, "cv")
        os.makedirs(cv_dir, exist_ok=True)
        
        # Get file path for this language
        cv_path = get_cv_path(language)
        
        # Remove existing CV for this language if it exists
        if os.path.exists(cv_path):
            os.remove(cv_path)
        
        # Save new CV
        with open(cv_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"CV uploaded successfully for language '{language}': {file.filename}")
        
        return {
            "message": f"CV uploaded successfully for {LANGUAGE_NAMES[language]}",
            "language": language,
            "language_name": LANGUAGE_NAMES[language],
            "filename": f"cv_{language}.pdf",
            "original_filename": file.filename,
            "size": file.size,
            "download_url": f"/api/cv/download?language={language}",
            "view_url": f"/api/cv/view?language={language}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading CV for language '{language}': {e}")
        raise HTTPException(status_code=500, detail="Failed to upload CV")


@router.get("/cv/download")
async def download_cv(language: Literal["en", "pt"] = Query("en", description="Language of the CV to download")):
    """Download CV/Resume in specified language"""
    try:
        # Validate language
        if language not in SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=400, 
                detail=f"Language '{language}' not supported. Supported languages: {', '.join(SUPPORTED_LANGUAGES)}"
            )
        
        cv_path = get_cv_path(language)
        
        if not os.path.exists(cv_path):
            raise HTTPException(
                status_code=404, 
                detail=f"CV not found for {LANGUAGE_NAMES[language]}. Please upload a CV first."
            )
        
        return FileResponse(
            path=cv_path,
            filename=get_cv_filename(language),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={get_cv_filename(language)}"}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading CV for language '{language}': {e}")
        raise HTTPException(status_code=500, detail="Failed to download CV")


@router.get("/cv/view")
async def view_cv(language: Literal["en", "pt"] = Query("en", description="Language of the CV to view")):
    """View CV in browser (without download) in specified language"""
    try:
        # Validate language
        if language not in SUPPORTED_LANGUAGES:
            raise HTTPException(
                status_code=400, 
                detail=f"Language '{language}' not supported. Supported languages: {', '.join(SUPPORTED_LANGUAGES)}"
            )
        
        cv_path = get_cv_path(language)
        
        if not os.path.exists(cv_path):
            raise HTTPException(
                status_code=404, 
                detail=f"CV not found for {LANGUAGE_NAMES[language]}. Please upload a CV first."
            )
        
        return FileResponse(
            path=cv_path,
            filename=get_cv_filename(language),
            media_type="application/pdf"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error viewing CV for language '{language}': {e}")
        raise HTTPException(status_code=500, detail="Failed to view CV")


@router.get("/cv/info")
async def get_cv_info(language: Optional[Literal["en", "pt"]] = Query(None, description="Specific language info, or all if not specified")):
    """Get CV information for specific language or all languages"""
    try:
        if language:
            # Get info for specific language
            if language not in SUPPORTED_LANGUAGES:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Language '{language}' not supported. Supported languages: {', '.join(SUPPORTED_LANGUAGES)}"
                )
            
            cv_path = get_cv_path(language)
            
            if not os.path.exists(cv_path):
                return {
                    "language": language,
                    "language_name": LANGUAGE_NAMES[language],
                    "available": False, 
                    "message": f"No CV uploaded for {LANGUAGE_NAMES[language]}"
                }
            
            # Get file stats
            stat = os.stat(cv_path)
            
            return {
                "language": language,
                "language_name": LANGUAGE_NAMES[language],
                "available": True,
                "filename": f"cv_{language}.pdf",
                "size": stat.st_size,
                "size_mb": round(stat.st_size / (1024 * 1024), 2),
                "last_modified": stat.st_mtime,
                "download_url": f"/api/cv/download?language={language}",
                "view_url": f"/api/cv/view?language={language}"
            }
        else:
            # Get info for all languages
            all_cvs = {}
            
            for lang in SUPPORTED_LANGUAGES:
                cv_path = get_cv_path(lang)
                
                if os.path.exists(cv_path):
                    stat = os.stat(cv_path)
                    all_cvs[lang] = {
                        "language": lang,
                        "language_name": LANGUAGE_NAMES[lang],
                        "available": True,
                        "filename": f"cv_{lang}.pdf",
                        "size": stat.st_size,
                        "size_mb": round(stat.st_size / (1024 * 1024), 2),
                        "last_modified": stat.st_mtime,
                        "download_url": f"/api/cv/download?language={lang}",
                        "view_url": f"/api/cv/view?language={lang}"
                    }
                else:
                    all_cvs[lang] = {
                        "language": lang,
                        "language_name": LANGUAGE_NAMES[lang],
                        "available": False,
                        "message": f"No CV uploaded for {LANGUAGE_NAMES[lang]}"
                    }
            
            return {
                "supported_languages": SUPPORTED_LANGUAGES,
                "language_names": LANGUAGE_NAMES,
                "cvs": all_cvs
            }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting CV info: {e}")
        raise HTTPException(status_code=500, detail="Failed to get CV info")


@router.delete("/cv", status_code=status.HTTP_204_NO_CONTENT)
async def delete_cv(language: Optional[Literal["en", "pt"]] = Query(None, description="Language to delete, or all if not specified")):
    """Delete CV for specific language or all languages"""
    try:
        if language:
            # Delete specific language
            if language not in SUPPORTED_LANGUAGES:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Language '{language}' not supported. Supported languages: {', '.join(SUPPORTED_LANGUAGES)}"
                )
            
            cv_path = get_cv_path(language)
            
            if os.path.exists(cv_path):
                os.remove(cv_path)
                logger.info(f"CV deleted successfully for language '{language}'")
            else:
                raise HTTPException(status_code=404, detail=f"CV not found for {LANGUAGE_NAMES[language]}")
        else:
            # Delete all CVs
            deleted_count = 0
            for lang in SUPPORTED_LANGUAGES:
                cv_path = get_cv_path(lang)
                if os.path.exists(cv_path):
                    os.remove(cv_path)
                    deleted_count += 1
            
            if deleted_count == 0:
                raise HTTPException(status_code=404, detail="No CVs found to delete")
            
            logger.info(f"All CVs deleted successfully ({deleted_count} files)")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting CV: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete CV")


@router.get("/cv/languages")
async def get_supported_languages():
    """Get list of supported languages for CV"""
    return {
        "supported_languages": SUPPORTED_LANGUAGES,
        "language_names": LANGUAGE_NAMES,
        "default_language": "en"
    } 