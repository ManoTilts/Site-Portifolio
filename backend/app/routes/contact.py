import logging
from datetime import datetime
from fastapi import APIRouter, HTTPException, Request, BackgroundTasks

from app.models.contact import Contact
from app.schemas.contact import ContactCreateSchema
from app.schemas.common import SuccessResponse
from app.services.email_service import email_service
from app.utils.helpers import get_client_ip

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/contact", response_model=SuccessResponse)
async def submit_contact_form(
    contact_data: ContactCreateSchema,
    background_tasks: BackgroundTasks,
    request: Request
):
    """Submit contact form"""
    try:
        # Get client information
        client_ip = get_client_ip(request)
        user_agent = request.headers.get("User-Agent", "")
        
        # Create contact record
        contact = Contact(
            name=contact_data.name,
            email=contact_data.email,
            subject=contact_data.subject,
            message=contact_data.message,
            phone=contact_data.phone,
            company=contact_data.company,
            ip_address=client_ip,
            user_agent=user_agent
        )
        
        # Save to database
        await contact.insert()
        
        # Send notifications in background
        background_tasks.add_task(
            send_contact_notifications,
            contact_data,
            datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        )
        
        logger.info(f"Contact form submitted: {contact_data.email} - {contact_data.subject}")
        
        return SuccessResponse(
            message="Thank you for your message! I'll get back to you soon.",
            data={
                "id": str(contact.id),
                "submitted_at": contact.date_submitted.isoformat()
            }
        )
        
    except Exception as e:
        logger.error(f"Contact form submission failed: {e}")
        raise HTTPException(
            status_code=500, 
            detail="Failed to submit contact form. Please try again later."
        )


async def send_contact_notifications(contact_data: ContactCreateSchema, timestamp: str):
    """Send email notifications for contact form submission"""
    try:
        # Send notification to admin
        await email_service.send_contact_notification(contact_data, timestamp)
        
        # Send auto-reply to user
        await email_service.send_contact_autoreply(contact_data)
        
        logger.info(f"Contact notifications sent for {contact_data.email}")
        
    except Exception as e:
        logger.error(f"Failed to send contact notifications: {e}")
        # Don't raise exception here as the contact was already saved 