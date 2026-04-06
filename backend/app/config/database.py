import logging
from typing import Any, Optional
from beanie import init_beanie

from app.config.settings import settings
from app.models.project import Project
from app.models.contact import Contact
from app.models.admin import Admin

logger = logging.getLogger(__name__)


class Database:
    """Database connection manager"""
    client: Optional[Any] = None
    database: Optional[Any] = None


database = Database()


async def get_database():
    """Get database instance"""
    return database.database


async def connect_to_mongo():
    """Create database connection"""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        database.client = AsyncIOMotorClient(settings.MONGODB_URL)
        database.database = database.client[settings.DATABASE_NAME]
        
        # Test connection
        await database.client.admin.command('ismaster')
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close database connection"""
    if database.client:
        database.client.close()
        logger.info("Disconnected from MongoDB")


async def init_database():
    """Initialize database and models"""
    try:
        await connect_to_mongo()
        
        # Initialize Beanie with models
        await init_beanie(
            database=database.database,
            document_models=[Project, Contact, Admin]
        )
        
        # Create indexes
        await create_indexes()
        
        # Create default admin user if not exists
        await create_default_admin()
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise


async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Project indexes
        await Project.create_index("featured")
        await Project.create_index("category")
        await Project.create_index("date_created")
        await Project.create_index([("title", "text"), ("description", "text")])
        
        # Contact indexes
        await Contact.create_index("date_submitted")
        await Contact.create_index("read_status")
        await Contact.create_index("email")
        
        # Admin indexes
        await Admin.create_index("username", unique=True)
        await Admin.create_index("email", unique=True)
        

        
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")


async def create_default_admin():
    """Create default admin user if not exists"""
    try:
        from app.utils.security import get_password_hash
        
        admin_exists = await Admin.find_one(Admin.username == settings.ADMIN_USERNAME)
        if not admin_exists:
            admin = Admin(
                username=settings.ADMIN_USERNAME,
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD)
            )
            await admin.insert()
            
    except Exception as e:
        logger.error(f"Failed to create default admin: {e}") 