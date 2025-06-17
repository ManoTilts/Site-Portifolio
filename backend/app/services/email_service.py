import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional, Dict, Any
from pathlib import Path
import asyncio
from concurrent.futures import ThreadPoolExecutor

try:
    import sendgrid
    from sendgrid.helpers.mail import Mail, Email, To, Content
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

from jinja2 import Environment, FileSystemLoader

from app.config.settings import settings
from app.schemas.contact import ContactCreateSchema

logger = logging.getLogger(__name__)


class EmailService:
    """Email service with template support"""
    
    def __init__(self):
        self.sendgrid_client = None
        self.template_env = None
        self.executor = ThreadPoolExecutor(max_workers=3)
        
        # Initialize SendGrid if available and API key is provided
        if SENDGRID_AVAILABLE and settings.SENDGRID_API_KEY:
            try:
                self.sendgrid_client = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
                logger.info("SendGrid client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize SendGrid: {e}")
        
        # Initialize Jinja2 templates
        self._setup_templates()
    
    def _setup_templates(self):
        """Setup Jinja2 template environment"""
        try:
            # Create templates directory if it doesn't exist
            templates_dir = Path("app/templates")
            templates_dir.mkdir(exist_ok=True)
            
            # Create email templates directory
            email_templates_dir = templates_dir / "emails"
            email_templates_dir.mkdir(exist_ok=True)
            
            self.template_env = Environment(
                loader=FileSystemLoader(str(templates_dir)),
                autoescape=True
            )
            
            # Create default templates if they don't exist
            self._create_default_templates(email_templates_dir)
            
            logger.info("Email templates initialized")
            
        except Exception as e:
            logger.error(f"Failed to setup email templates: {e}")
    
    def _create_default_templates(self, templates_dir: Path):
        """Create default email templates"""
        
        # Contact notification template
        contact_template = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Form Submission</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .content { background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #495057; }
        .value { margin-top: 5px; }
        .message { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>New Contact Form Submission</h2>
            <p>You have received a new message through your portfolio contact form.</p>
        </div>
        
        <div class="content">
            <div class="field">
                <div class="label">Name:</div>
                <div class="value">{{ contact.name }}</div>
            </div>
            
            <div class="field">
                <div class="label">Email:</div>
                <div class="value">{{ contact.email }}</div>
            </div>
            
            {% if contact.phone %}
            <div class="field">
                <div class="label">Phone:</div>
                <div class="value">{{ contact.phone }}</div>
            </div>
            {% endif %}
            
            {% if contact.company %}
            <div class="field">
                <div class="label">Company:</div>
                <div class="value">{{ contact.company }}</div>
            </div>
            {% endif %}
            
            <div class="field">
                <div class="label">Subject:</div>
                <div class="value">{{ contact.subject }}</div>
            </div>
            
            <div class="field">
                <div class="label">Message:</div>
                <div class="message">{{ contact.message }}</div>
            </div>
            
            <div class="field">
                <div class="label">Submitted at:</div>
                <div class="value">{{ timestamp }}</div>
            </div>
        </div>
    </div>
</body>
</html>
        """
        
        # Auto-reply template
        autoreply_template = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Thank you for your message</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #007bff; color: white; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .content { background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Thank you for reaching out!</h2>
        </div>
        
        <div class="content">
            <p>Hi {{ contact.name }},</p>
            
            <p>Thank you for your message. I have received your inquiry and will get back to you as soon as possible, usually within 24 hours.</p>
            
            <p><strong>Your message summary:</strong></p>
            <p><strong>Subject:</strong> {{ contact.subject }}</p>
            <p><strong>Message:</strong> {{ contact.message[:200] }}{% if contact.message|length > 200 %}...{% endif %}</p>
            
            <p>Best regards,<br>Portfolio Team</p>
        </div>
    </div>
</body>
</html>
        """
        
        # Write templates to files
        contact_file = templates_dir / "emails" / "contact_notification.html"
        if not contact_file.exists():
            contact_file.write_text(contact_template)
        
        autoreply_file = templates_dir / "emails" / "contact_autoreply.html"
        if not autoreply_file.exists():
            autoreply_file.write_text(autoreply_template)
    
    async def send_email_async(self, to_email: str, subject: str, html_content: str, 
                              text_content: str = None, from_email: str = None) -> bool:
        """Send email asynchronously"""
        loop = asyncio.get_event_loop()
        
        if self.sendgrid_client:
            return await loop.run_in_executor(
                self.executor,
                self._send_via_sendgrid,
                to_email, subject, html_content, text_content, from_email
            )
        else:
            return await loop.run_in_executor(
                self.executor,
                self._send_via_smtp,
                to_email, subject, html_content, text_content, from_email
            )
    
    def _send_via_sendgrid(self, to_email: str, subject: str, html_content: str,
                          text_content: str = None, from_email: str = None) -> bool:
        """Send email via SendGrid"""
        try:
            from_email = from_email or settings.FROM_EMAIL
            
            mail = Mail(
                from_email=Email(from_email),
                to_emails=To(to_email),
                subject=subject,
                html_content=Content("text/html", html_content)
            )
            
            if text_content:
                mail.content = [
                    Content("text/plain", text_content),
                    Content("text/html", html_content)
                ]
            
            response = self.sendgrid_client.send(mail)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Email sent successfully via SendGrid to {to_email}")
                return True
            else:
                logger.error(f"SendGrid error: {response.status_code} - {response.body}")
                return False
                
        except Exception as e:
            logger.error(f"SendGrid email sending failed: {e}")
            return False
    
    def _send_via_smtp(self, to_email: str, subject: str, html_content: str,
                      text_content: str = None, from_email: str = None) -> bool:
        """Send email via SMTP"""
        try:
            from_email = from_email or settings.SMTP_USERNAME
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = from_email
            msg['To'] = to_email
            
            # Add text content
            if text_content:
                msg.attach(MIMEText(text_content, 'plain'))
            
            # Add HTML content
            msg.attach(MIMEText(html_content, 'html'))
            
            # Send email
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully via SMTP to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"SMTP email sending failed: {e}")
            return False
    
    def render_template(self, template_name: str, **context) -> str:
        """Render email template with context"""
        try:
            template = self.template_env.get_template(f"emails/{template_name}")
            return template.render(**context)
        except Exception as e:
            logger.error(f"Template rendering failed: {e}")
            return ""
    
    async def send_contact_notification(self, contact: ContactCreateSchema, 
                                      timestamp: str = None) -> bool:
        """Send contact form notification to admin"""
        try:
            from datetime import datetime
            timestamp = timestamp or datetime.now().strftime("%Y-%m-%d %H:%M:%S UTC")
            
            html_content = self.render_template(
                "contact_notification.html",
                contact=contact,
                timestamp=timestamp
            )
            
            if not html_content:
                # Fallback to simple template
                html_content = f"""
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> {contact.name}</p>
                <p><strong>Email:</strong> {contact.email}</p>
                <p><strong>Subject:</strong> {contact.subject}</p>
                <p><strong>Message:</strong> {contact.message}</p>
                <p><strong>Time:</strong> {timestamp}</p>
                """
            
            subject = f"New Contact: {contact.subject}"
            
            return await self.send_email_async(
                to_email=settings.ADMIN_EMAIL_RECIPIENT,
                subject=subject,
                html_content=html_content
            )
            
        except Exception as e:
            logger.error(f"Failed to send contact notification: {e}")
            return False
    
    async def send_contact_autoreply(self, contact: ContactCreateSchema) -> bool:
        """Send auto-reply to contact form submitter"""
        try:
            html_content = self.render_template(
                "contact_autoreply.html",
                contact=contact
            )
            
            if not html_content:
                # Fallback to simple template
                html_content = f"""
                <h2>Thank you for your message!</h2>
                <p>Hi {contact.name},</p>
                <p>Thank you for reaching out. I will get back to you soon.</p>
                <p>Best regards,<br>Portfolio Team</p>
                """
            
            subject = "Thank you for your message"
            
            return await self.send_email_async(
                to_email=contact.email,
                subject=subject,
                html_content=html_content
            )
            
        except Exception as e:
            logger.error(f"Failed to send autoreply: {e}")
            return False
    
    async def send_custom_email(self, to_emails: List[str], subject: str, 
                               template_name: str, **context) -> bool:
        """Send custom email using template"""
        try:
            html_content = self.render_template(template_name, **context)
            
            if not html_content:
                logger.error(f"Template {template_name} not found or failed to render")
                return False
            
            # Send to multiple recipients
            success_count = 0
            for email in to_emails:
                if await self.send_email_async(email, subject, html_content):
                    success_count += 1
            
            return success_count == len(to_emails)
            
        except Exception as e:
            logger.error(f"Failed to send custom email: {e}")
            return False


# Global email service instance
email_service = EmailService() 