import logging
from datetime import datetime
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorClient

from app.config.database import get_database
from app.schemas.common import HealthCheck
from app import __version__

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/health", response_model=HealthCheck)
async def health_check(db: AsyncIOMotorClient = Depends(get_database)):
    """Health check endpoint"""
    
    # Check database connection
    try:
        await db.admin.command('ismaster')
        database_status = "connected"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        database_status = "disconnected"
    
    return HealthCheck(
        status="healthy" if database_status == "connected" else "unhealthy",
        timestamp=datetime.utcnow().isoformat(),
        version=__version__,
        database=database_status
    )


@router.get("/health/detailed")
async def detailed_health_check(db: AsyncIOMotorClient = Depends(get_database)):
    """Detailed health check with more information"""
    
    health_data = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": __version__,
        "services": {}
    }
    
    # Database check
    try:
        start_time = datetime.utcnow()
        await db.admin.command('ismaster')
        response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        health_data["services"]["database"] = {
            "status": "connected",
            "response_time_ms": round(response_time, 2)
        }
    except Exception as e:
        health_data["status"] = "unhealthy"
        health_data["services"]["database"] = {
            "status": "disconnected",
            "error": str(e)
        }
    
    # Add more service checks here (Redis, Email, etc.)
    
    return health_data 