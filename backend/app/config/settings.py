from typing import List
from pydantic import BaseSettings, validator
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017/portfolio_db"
    DATABASE_NAME: str = "portfolio_db"
    
    # JWT Configuration
    JWT_SECRET_KEY: str = "your-super-secret-jwt-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Admin Configuration
    ADMIN_USERNAME: str = "admin"
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "changeme"
    
    # Email Configuration
    SENDGRID_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@portfolio.com"
    ADMIN_EMAIL_RECIPIENT: str = "admin@example.com"
    
    # SMTP Configuration
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    
    # File Upload Configuration
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_EXTENSIONS: List[str] = ["jpg", "jpeg", "png", "gif", "webp"]
    
    # Rate Limiting
    RATE_LIMIT_CONTACT_FORM: str = "5/minute"
    RATE_LIMIT_FILE_UPLOAD: str = "10/minute"
    
    # Frontend Configuration
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Environment
    ENVIRONMENT: str = "development"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"
    
    @validator("ALLOWED_IMAGE_EXTENSIONS", pre=True)
    def parse_allowed_extensions(cls, v):
        if isinstance(v, str):
            return [ext.strip().lower() for ext in v.split(",")]
        return v
    
    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings() 