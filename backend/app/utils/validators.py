import re
from typing import Any
import bleach
from pydantic import validator


def validate_slug(slug: str) -> str:
    """Validate and clean URL slug"""
    if not slug:
        raise ValueError("Slug cannot be empty")
    
    # Convert to lowercase and replace spaces/special chars with hyphens
    slug = re.sub(r'[^\w\s-]', '', slug.lower())
    slug = re.sub(r'[-\s]+', '-', slug)
    slug = slug.strip('-')
    
    if not slug:
        raise ValueError("Slug must contain at least one alphanumeric character")
    
    if len(slug) > 100:
        raise ValueError("Slug must be less than 100 characters")
    
    return slug


def sanitize_html(content: str) -> str:
    """Sanitize HTML content to prevent XSS"""
    allowed_tags = [
        'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
        'a', 'img', 'code', 'pre'
    ]
    
    allowed_attributes = {
        'a': ['href', 'title'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        '*': ['class']
    }
    
    return bleach.clean(
        content,
        tags=allowed_tags,
        attributes=allowed_attributes,
        strip=True
    )


def validate_file_extension(filename: str, allowed_extensions: list) -> bool:
    """Validate file extension"""
    if not filename:
        return False
    
    extension = filename.lower().split('.')[-1]
    return extension in [ext.lower() for ext in allowed_extensions]


def validate_image_file(filename: str) -> bool:
    """Validate if file is an allowed image type"""
    allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    return validate_file_extension(filename, allowed_extensions)


def validate_file_size(file_size: int, max_size: int) -> bool:
    """Validate file size"""
    return file_size <= max_size


def validate_email_domain(email: str, allowed_domains: list = None) -> bool:
    """Validate email domain if restrictions are in place"""
    if not allowed_domains:
        return True
    
    domain = email.split('@')[-1].lower()
    return domain in [d.lower() for d in allowed_domains]


def validate_url(url: str) -> bool:
    """Basic URL validation"""
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    return url_pattern.match(url) is not None


def clean_filename(filename: str) -> str:
    """Clean and sanitize filename"""
    # Remove or replace invalid characters
    filename = re.sub(r'[<>:"/\\|?*]', '', filename)
    filename = re.sub(r'\s+', '_', filename)
    filename = filename.strip('.')
    
    # Ensure filename is not too long
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        filename = name[:255-len(ext)-1] + '.' + ext if ext else name[:255]
    
    return filename


def validate_json_structure(data: Any, required_fields: list = None) -> bool:
    """Validate JSON structure has required fields"""
    if not isinstance(data, dict):
        return False
    
    if required_fields:
        return all(field in data for field in required_fields)
    
    return True 