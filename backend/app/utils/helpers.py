import os
import uuid
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import math
from slugify import slugify


def create_slug(text: str) -> str:
    """Create URL-friendly slug from text"""
    return slugify(text, max_length=100, word_boundary=True)


def generate_unique_filename(original_filename: str, prefix: str = "") -> str:
    """Generate unique filename with timestamp and UUID"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_id = str(uuid.uuid4())[:8]
    
    # Get file extension
    name, ext = os.path.splitext(original_filename)
    
    # Clean the original name
    clean_name = slugify(name, max_length=50)
    
    if prefix:
        prefix = slugify(prefix) + "_"
    
    return f"{prefix}{clean_name}_{timestamp}_{unique_id}{ext}"


def format_file_size(size_bytes: int) -> str:
    """Format file size in human readable format"""
    if size_bytes == 0:
        return "0 B"
    
    size_names = ["B", "KB", "MB", "GB", "TB"]
    i = int(math.floor(math.log(size_bytes, 1024)))
    p = math.pow(1024, i)
    s = round(size_bytes / p, 2)
    
    return f"{s} {size_names[i]}"


def calculate_pagination(total: int, page: int, per_page: int) -> Dict[str, Any]:
    """Calculate pagination metadata"""
    pages = math.ceil(total / per_page) if total > 0 else 1
    has_prev = page > 1
    has_next = page < pages
    
    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
        "has_prev": has_prev,
        "has_next": has_next
    }


def get_client_ip(request) -> str:
    """Extract client IP address from request"""
    # Check for forwarded IP first (in case of proxy)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    
    # Check for real IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip
    
    # Fall back to direct connection
    return request.client.host if request.client else "unknown"


def get_file_extension(filename: str) -> str:
    """Get file extension from filename"""
    return os.path.splitext(filename)[1].lower().lstrip('.')


def create_directory_if_not_exists(path: str) -> bool:
    """Create directory if it doesn't exist"""
    try:
        os.makedirs(path, exist_ok=True)
        return True
    except Exception:
        return False


def clean_dict(data: dict, remove_none: bool = True, remove_empty: bool = False) -> dict:
    """Clean dictionary by removing None or empty values"""
    cleaned = {}
    
    for key, value in data.items():
        if remove_none and value is None:
            continue
        if remove_empty and (
            value == "" or 
            (isinstance(value, (list, dict)) and len(value) == 0)
        ):
            continue
        cleaned[key] = value
    
    return cleaned


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate text to specified length"""
    if len(text) <= max_length:
        return text
    
    truncated = text[:max_length - len(suffix)].rstrip()
    return truncated + suffix


def validate_date_range(start_date: Optional[datetime], end_date: Optional[datetime]) -> bool:
    """Validate that start_date is before end_date"""
    if start_date and end_date:
        return start_date <= end_date
    return True


def get_date_range_filter(days: int) -> Dict[str, datetime]:
    """Get date range for filtering (last N days)"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    return {
        "start_date": start_date,
        "end_date": end_date
    }


def extract_keywords_from_text(text: str, min_length: int = 3) -> List[str]:
    """Extract keywords from text for search indexing"""
    import re
    
    # Remove HTML tags if any
    text = re.sub(r'<[^>]+>', '', text)
    
    # Convert to lowercase and split into words
    words = re.findall(r'\b[a-zA-Z]{' + str(min_length) + ',}\b', text.lower())
    
    # Remove common stop words
    stop_words = {
        'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
        'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
        'after', 'above', 'below', 'between', 'among', 'through', 'during',
        'before', 'after', 'above', 'below', 'between'
    }
    
    keywords = [word for word in words if word not in stop_words]
    
    # Return unique keywords
    return list(set(keywords))


def merge_dicts(*dicts: dict) -> dict:
    """Merge multiple dictionaries, with later ones taking precedence"""
    result = {}
    for d in dicts:
        if d:
            result.update(d)
    return result


def is_image_file(filename: str) -> bool:
    """Check if file is an image based on extension"""
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'}
    return get_file_extension(filename).lower() in image_extensions


def sanitize_filename_for_url(filename: str) -> str:
    """Sanitize filename to be URL-safe"""
    # Remove file extension
    name, ext = os.path.splitext(filename)
    
    # Create slug and add extension back
    safe_name = slugify(name, max_length=100)
    
    return f"{safe_name}{ext.lower()}" 