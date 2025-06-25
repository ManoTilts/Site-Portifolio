from typing import List, Optional
from pydantic import validator, Field
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # =============================================================================
    # REQUIRED SETTINGS - No defaults for security-critical values
    # =============================================================================
    
    # Database (REQUIRED)
    MONGODB_URL: str
    
    # JWT Configuration (REQUIRED)
    JWT_SECRET_KEY: str
    
    # Admin Configuration (REQUIRED)
    ADMIN_USERNAME: str
    ADMIN_EMAIL: str
    ADMIN_PASSWORD: str
    
    # Email Configuration (REQUIRED for email functionality)
    FROM_EMAIL: str
    ADMIN_EMAIL_RECIPIENT: str
    
    # =============================================================================
    # OPTIONAL SETTINGS - Safe defaults for operational settings
    # =============================================================================
    
    # Database
    DATABASE_NAME: str = "portfolio_db"
    
    # JWT Configuration
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Email Configuration (Optional - for alternative email methods)
    SENDGRID_API_KEY: Optional[str] = None
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # File Upload Configuration
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_EXTENSIONS: str = "jpg,jpeg,png,gif,webp"
    
    # Rate Limiting
    RATE_LIMIT_CONTACT_FORM: str = "5/minute"
    RATE_LIMIT_FILE_UPLOAD: str = "10/minute"
    
    # Environment-dependent defaults
    FRONTEND_URL: str = "http://localhost:5173"  # OK for development
    REDIS_URL: str = "redis://localhost:6379"    # OK for development
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"
    
    # =============================================================================
    # VALIDATORS - Security and data validation
    # =============================================================================
    
    @validator("JWT_SECRET_KEY")
    def validate_jwt_secret(cls, v):
        """Ensure JWT secret is secure"""
        if len(v) < 32:
            raise ValueError("JWT_SECRET_KEY must be at least 32 characters long")
        
        # Prevent common insecure defaults
        insecure_defaults = [
            "your-super-secret-jwt-key",
            "changeme", 
            "secret",
            "jwt-secret-key",
            "your-secret-key"
        ]
        if v.lower() in [default.lower() for default in insecure_defaults]:
            raise ValueError(f"JWT_SECRET_KEY cannot be a default/insecure value: {v}")
        
        return v
    
    @validator("ADMIN_PASSWORD")
    def validate_admin_password(cls, v):
        """Ensure admin password is secure"""
        if len(v) < 12:
            raise ValueError("ADMIN_PASSWORD must be at least 12 characters long")
            
        # Prevent common insecure defaults
        insecure_defaults = ["changeme", "admin", "password", "123456", "admin123"]
        if v.lower() in [default.lower() for default in insecure_defaults]:
            raise ValueError(f"ADMIN_PASSWORD cannot be a default/insecure value")
            
        return v
    
    @validator("ADMIN_EMAIL", "FROM_EMAIL", "ADMIN_EMAIL_RECIPIENT")
    def validate_email_format(cls, v):
        """Basic email validation"""
        if "@" not in v or "." not in v.split("@")[-1]:
            raise ValueError(f"Invalid email format: {v}")
        
        # Prevent example emails
        if "example.com" in v.lower():
            raise ValueError(f"Email cannot use example.com domain: {v}")
            
        return v.lower()
    
    @validator("MONGODB_URL")
    def validate_mongodb_url(cls, v):
        """Ensure MongoDB URL is properly formatted"""
        if not v.startswith(("mongodb://", "mongodb+srv://")):
            raise ValueError("MONGODB_URL must start with 'mongodb://' or 'mongodb+srv://'")
        return v
    
    @validator("ENVIRONMENT")
    def validate_environment(cls, v):
        """Ensure environment is valid"""
        valid_envs = ["development", "testing", "staging", "production"]
        if v.lower() not in valid_envs:
            raise ValueError(f"ENVIRONMENT must be one of: {valid_envs}")
        return v.lower()
    
    @validator("ALLOWED_IMAGE_EXTENSIONS")
    def parse_allowed_extensions(cls, v):
        """Convert comma-separated string to list"""
        if isinstance(v, str):
            extensions = [ext.strip().lower() for ext in v.split(",")]
            # Validate extensions
            valid_extensions = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff"]
            for ext in extensions:
                if ext not in valid_extensions:
                    raise ValueError(f"Invalid image extension: {ext}. Valid: {valid_extensions}")
            return extensions
        return v
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"
    
    class Config:
        # Try environment-specific file first, fallback to .env
        env_file = [
            f".env.{os.getenv('ENVIRONMENT', 'development')}",
            ".env"
        ]
        case_sensitive = True
        # Don't load .env file in production if ENVIRONMENT is set to production
        env_file_encoding = 'utf-8'


# Global settings instance with error handling
try:
    settings = Settings()
except Exception as e:
    print(f"❌ Configuration Error: {e}")
    print("📝 Please check your .env file and ensure all required settings are properly configured.")
    print("💡 Required settings: JWT_SECRET_KEY, ADMIN_PASSWORD, MONGODB_URL, ADMIN_EMAIL, etc.")
    raise 