import logging
from pathlib import Path
from typing import Dict, Any, Tuple, Optional
from PIL import Image, ImageOps
import io

from app.config.settings import settings
from app.utils.helpers import generate_unique_filename, format_file_size

logger = logging.getLogger(__name__)


class ImageService:
    """Image processing and optimization service"""
    
    def __init__(self):
        self.upload_dir = Path(settings.UPLOAD_DIR)
        self.quality = 85  # JPEG quality
        self.max_width = 1920
        self.max_height = 1080
        self.thumbnail_sizes = {
            "small": (150, 150),
            "medium": (300, 300),
            "large": (600, 600)
        }
    
    def optimize_image(self, image_path: str, quality: int = None) -> Dict[str, Any]:
        """Optimize image by compressing"""
        try:
            path = Path(image_path)
            quality = quality or self.quality
            
            with Image.open(path) as img:
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                img = ImageOps.exif_transpose(img)
                img.save(str(path), "JPEG", quality=quality, optimize=True)
            
            return {"success": True, "path": str(path)}
            
        except Exception as e:
            logger.error(f"Image optimization failed: {e}")
            raise e
    
    def create_thumbnail(self, image_path: str, size: Tuple[int, int], 
                        output_path: str = None, crop: bool = True) -> Dict[str, Any]:
        """Create thumbnail from image"""
        try:
            path = Path(image_path)
            if not path.exists():
                raise FileNotFoundError(f"Image not found: {image_path}")
            
            # Generate output path if not provided
            if not output_path:
                thumbnail_dir = self.upload_dir / "thumbnails"
                thumbnail_dir.mkdir(exist_ok=True)
                
                # Generate unique filename
                base_name = path.stem
                output_filename = f"{base_name}_thumb_{size[0]}x{size[1]}.jpg"
                output_path = str(thumbnail_dir / output_filename)
            
            with Image.open(path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Apply auto-orientation
                img = ImageOps.exif_transpose(img)
                
                # Create thumbnail
                if crop:
                    # Crop to exact size (center crop)
                    img = ImageOps.fit(img, size, Image.Resampling.LANCZOS)
                else:
                    # Maintain aspect ratio
                    img.thumbnail(size, Image.Resampling.LANCZOS)
                
                # Ensure output directory exists
                Path(output_path).parent.mkdir(parents=True, exist_ok=True)
                
                # Save thumbnail
                img.save(output_path, "JPEG", quality=self.quality, optimize=True)
            
            thumbnail_size = Path(output_path).stat().st_size
            
            result = {
                "original_path": str(path),
                "thumbnail_path": output_path,
                "thumbnail_size": thumbnail_size,
                "thumbnail_dimensions": size,
                "crop": crop
            }
            
            logger.info(f"Thumbnail created: {output_path}")
            return result
            
        except Exception as e:
            logger.error(f"Thumbnail creation failed: {e}")
            raise e
    
    def create_multiple_thumbnails(self, image_path: str, 
                                  sizes: Dict[str, Tuple[int, int]] = None) -> Dict[str, Any]:
        """Create multiple thumbnail sizes"""
        sizes = sizes or self.thumbnail_sizes
        results = {}
        
        for size_name, dimensions in sizes.items():
            try:
                result = self.create_thumbnail(image_path, dimensions)
                results[size_name] = result
            except Exception as e:
                logger.error(f"Failed to create {size_name} thumbnail: {e}")
                results[size_name] = {"error": str(e)}
        
        return results
    
    def convert_to_webp(self, image_path: str, output_path: str = None, 
                       quality: int = 80) -> Dict[str, Any]:
        """Convert image to WebP format"""
        try:
            path = Path(image_path)
            if not path.exists():
                raise FileNotFoundError(f"Image not found: {image_path}")
            
            # Generate output path if not provided
            if not output_path:
                output_path = str(path.with_suffix('.webp'))
            
            original_size = path.stat().st_size
            
            with Image.open(path) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Apply auto-orientation
                img = ImageOps.exif_transpose(img)
                
                # Ensure output directory exists
                Path(output_path).parent.mkdir(parents=True, exist_ok=True)
                
                # Save as WebP
                img.save(output_path, "WEBP", quality=quality, optimize=True)
            
            webp_size = Path(output_path).stat().st_size
            compression_ratio = (original_size - webp_size) / original_size * 100
            
            result = {
                "original_path": str(path),
                "webp_path": output_path,
                "original_size": original_size,
                "webp_size": webp_size,
                "compression_ratio": round(compression_ratio, 2),
                "size_saved": format_file_size(original_size - webp_size)
            }
            
            logger.info(f"Image converted to WebP: {compression_ratio:.1f}% compression")
            return result
            
        except Exception as e:
            logger.error(f"WebP conversion failed: {e}")
            raise e
    
    def get_image_info(self, image_path: str) -> Dict[str, Any]:
        """Get detailed image information"""
        try:
            path = Path(image_path)
            if not path.exists():
                raise FileNotFoundError(f"Image not found: {image_path}")
            
            file_size = path.stat().st_size
            
            with Image.open(path) as img:
                width, height = img.size
                format_name = img.format
                mode = img.mode
                
                # Get EXIF data if available
                exif_data = {}
                try:
                    exif = img._getexif()
                    if exif:
                        for tag_id, value in exif.items():
                            tag = Image.ExifTags.TAGS.get(tag_id, tag_id)
                            exif_data[tag] = value
                except:
                    pass
            
            return {
                "path": str(path),
                "filename": path.name,
                "size": file_size,
                "size_formatted": format_file_size(file_size),
                "dimensions": (width, height),
                "width": width,
                "height": height,
                "format": format_name,
                "mode": mode,
                "aspect_ratio": round(width / height, 2),
                "megapixels": round((width * height) / 1000000, 2),
                "exif": exif_data
            }
            
        except Exception as e:
            logger.error(f"Failed to get image info: {e}")
            raise e
    
    def _calculate_dimensions(self, original_width: int, original_height: int,
                            max_width: int, max_height: int) -> Tuple[int, int]:
        """Calculate new dimensions while maintaining aspect ratio"""
        aspect_ratio = original_width / original_height
        
        # Calculate dimensions based on max constraints
        if original_width > max_width or original_height > max_height:
            if aspect_ratio > 1:  # Wider than tall
                new_width = min(max_width, original_width)
                new_height = int(new_width / aspect_ratio)
                if new_height > max_height:
                    new_height = max_height
                    new_width = int(new_height * aspect_ratio)
            else:  # Taller than wide
                new_height = min(max_height, original_height)
                new_width = int(new_height * aspect_ratio)
                if new_width > max_width:
                    new_width = max_width
                    new_height = int(new_width / aspect_ratio)
        else:
            new_width = original_width
            new_height = original_height
        
        return new_width, new_height
    
    def batch_process_images(self, image_paths: list, operations: list) -> Dict[str, Any]:
        """Process multiple images with specified operations"""
        results = {
            "processed": [],
            "errors": [],
            "total": len(image_paths)
        }
        
        for image_path in image_paths:
            try:
                image_results = {"path": image_path, "operations": {}}
                
                for operation in operations:
                    op_type = operation.get("type")
                    op_params = operation.get("params", {})
                    
                    if op_type == "optimize":
                        result = self.optimize_image(**op_params)
                        image_results["operations"]["optimize"] = result
                    
                    elif op_type == "thumbnail":
                        result = self.create_thumbnail(image_path, **op_params)
                        image_results["operations"]["thumbnail"] = result
                    
                    elif op_type == "webp":
                        result = self.convert_to_webp(image_path, **op_params)
                        image_results["operations"]["webp"] = result
                
                results["processed"].append(image_results)
                
            except Exception as e:
                results["errors"].append({
                    "path": image_path,
                    "error": str(e)
                })
        
        results["successful"] = len(results["processed"])
        results["failed"] = len(results["errors"])
        
        return results


# Global image service instance
image_service = ImageService() 