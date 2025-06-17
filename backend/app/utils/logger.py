import logging
import logging.handlers
import os
from pathlib import Path

from app.config.settings import settings


def setup_logging():
    """Setup logging configuration with file rotation"""
    
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Create formatters
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
    )
    
    console_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(name)s - %(message)s'
    )
    
    # Create file handler with rotation
    file_handler = logging.handlers.RotatingFileHandler(
        filename=settings.LOG_FILE,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(file_formatter)
    
    # Create console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO if settings.is_production else logging.DEBUG)
    console_handler.setFormatter(console_formatter)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL.upper()))
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    # Add handlers
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)
    
    # Configure specific loggers
    configure_third_party_loggers()
    
    logging.info("Logging configured successfully")


def configure_third_party_loggers():
    """Configure third-party library loggers"""
    
    # Reduce noise from third-party libraries in production
    if settings.is_production:
        logging.getLogger("uvicorn").setLevel(logging.WARNING)
        logging.getLogger("uvicorn.error").setLevel(logging.WARNING)
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
        logging.getLogger("fastapi").setLevel(logging.WARNING)
        logging.getLogger("motor").setLevel(logging.WARNING)
        logging.getLogger("pymongo").setLevel(logging.WARNING)
    
    # Set httpx logging to WARNING to reduce noise
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for a specific module"""
    return logging.getLogger(name)


class RequestLogger:
    """Logger for HTTP requests"""
    
    def __init__(self):
        self.logger = logging.getLogger("requests")
    
    def log_request(self, method: str, url: str, status_code: int, 
                   processing_time: float, client_ip: str = None):
        """Log HTTP request details"""
        message = f"{method} {url} - {status_code} - {processing_time:.3f}s"
        if client_ip:
            message += f" - {client_ip}"
        
        if status_code >= 500:
            self.logger.error(message)
        elif status_code >= 400:
            self.logger.warning(message)
        else:
            self.logger.info(message)
    
    def log_error(self, method: str, url: str, error: Exception, client_ip: str = None):
        """Log request errors"""
        message = f"ERROR - {method} {url} - {str(error)}"
        if client_ip:
            message += f" - {client_ip}"
        
        self.logger.error(message, exc_info=True)


class DatabaseLogger:
    """Logger for database operations"""
    
    def __init__(self):
        self.logger = logging.getLogger("database")
    
    def log_query(self, collection: str, operation: str, 
                 execution_time: float = None, document_count: int = None):
        """Log database queries"""
        message = f"{operation.upper()} on {collection}"
        
        if execution_time:
            message += f" - {execution_time:.3f}s"
        
        if document_count is not None:
            message += f" - {document_count} docs"
        
        self.logger.debug(message)
    
    def log_error(self, collection: str, operation: str, error: Exception):
        """Log database errors"""
        message = f"DB ERROR - {operation.upper()} on {collection} - {str(error)}"
        self.logger.error(message, exc_info=True)


class SecurityLogger:
    """Logger for security-related events"""
    
    def __init__(self):
        self.logger = logging.getLogger("security")
    
    def log_authentication(self, username: str, success: bool, ip_address: str = None):
        """Log authentication attempts"""
        status = "SUCCESS" if success else "FAILED"
        message = f"AUTH {status} - {username}"
        
        if ip_address:
            message += f" - {ip_address}"
        
        if success:
            self.logger.info(message)
        else:
            self.logger.warning(message)
    
    def log_rate_limit(self, endpoint: str, ip_address: str, limit: str):
        """Log rate limiting events"""
        message = f"RATE LIMIT - {endpoint} - {ip_address} - {limit}"
        self.logger.warning(message)
    
    def log_security_event(self, event_type: str, details: str, ip_address: str = None):
        """Log general security events"""
        message = f"SECURITY - {event_type} - {details}"
        if ip_address:
            message += f" - {ip_address}"
        
        self.logger.warning(message)


# Global logger instances
request_logger = RequestLogger()
database_logger = DatabaseLogger()
security_logger = SecurityLogger() 