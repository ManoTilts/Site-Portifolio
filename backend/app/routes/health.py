import logging
from datetime import datetime
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorClient

from app.config.database import get_database
from app.schemas.common import HealthCheck
from app import __version__

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/status")
async def get_status():
    """Simple status endpoint for database initialization check"""
    from app.config.database import database
    
    if database.database is None:
        return {
            "status": "error",
            "message": "Database not initialized",
            "database": "not_connected",
            "details": "MongoDB connection failed. Check configuration and ensure MongoDB is running."
        }
    
    try:
        await database.client.admin.command('ismaster')
        return {
            "status": "success", 
            "message": "Database initialized successfully",
            "database": "connected",
            "database_name": database.database.name
        }
    except Exception as e:
        return {
            "status": "error",
            "message": "Database connection failed",
            "database": "error", 
            "error": str(e)
        }


@router.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    from app.config.database import database
    
    # Check database connection
    database_status = "disconnected"
    if database.database is not None:
        try:
            await database.client.admin.command('ismaster')
            database_status = "connected"
            logger.info("Database health check: MongoDB is connected and responsive")
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            database_status = "error"
    else:
        logger.warning("Database health check: MongoDB not initialized")
        database_status = "not_initialized"
    
    return HealthCheck(
        status="healthy" if database_status == "connected" else "unhealthy",
        timestamp=datetime.utcnow().isoformat(),
        version=__version__,
        database=database_status
    )


@router.get("/health/detailed")
async def detailed_health_check():
    """Detailed health check with more information"""
    from app.config.database import database
    from app.config.settings import settings
    
    health_data = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": __version__,
        "services": {},
        "configuration": {
            "database_name": settings.DATABASE_NAME,
            "environment": settings.ENVIRONMENT,
            "mongodb_configured": bool(settings.MONGODB_URL)
        }
    }
    
    # Database check
    if database.database is not None:
        try:
            start_time = datetime.utcnow()
            await database.client.admin.command('ismaster')
            response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            # Get database stats
            db_stats = await database.database.command("dbStats")
            
            health_data["services"]["database"] = {
                "status": "connected",
                "response_time_ms": round(response_time, 2),
                "database_name": database.database.name,
                "collections": db_stats.get("collections", 0),
                "data_size": db_stats.get("dataSize", 0),
                "storage_size": db_stats.get("storageSize", 0)
            }
            logger.info("Detailed database health check: All systems operational")
        except Exception as e:
            health_data["status"] = "unhealthy"
            health_data["services"]["database"] = {
                "status": "error",
                "error": str(e)
            }
            logger.error(f"Detailed database health check failed: {e}")
    else:
        health_data["status"] = "unhealthy"
        health_data["services"]["database"] = {
            "status": "not_initialized",
            "error": "Database connection not established. Check MongoDB configuration and connectivity."
        }
        logger.warning("Detailed health check: Database not initialized")
    
    return health_data 