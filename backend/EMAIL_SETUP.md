# Email Configuration Guide

## Setting Up Email for Your Portfolio

Your portfolio uses your email address `felipe.mazzeo.barbosa@outlook.com` for:
- Contact form submissions
- Admin notifications
- Auto-reply to visitors

## Required Environment Variables

Add these to your `.env` file in the backend directory:

```bash
# Email Configuration
FROM_EMAIL=felipe.mazzeo.barbosa@outlook.com
ADMIN_EMAIL_RECIPIENT=felipe.mazzeo.barbosa@outlook.com
ADMIN_EMAIL=felipe.mazzeo.barbosa@outlook.com
```

## Option 1: Using Outlook SMTP (Recommended)

For Outlook/Hotmail email addresses, configure SMTP:

```bash
# SMTP Configuration for Outlook
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=felipe.mazzeo.barbosa@outlook.com
SMTP_PASSWORD=your-outlook-app-password
```

### Setting up Outlook App Password:

1. **Enable 2-Factor Authentication:**
   - Go to https://account.microsoft.com/security
   - Enable two-factor authentication

2. **Generate App Password:**
   - Go to https://account.microsoft.com/security/app-passwords
   - Create a new app password for "Mail"
   - Use this password in `SMTP_PASSWORD`

3. **Alternative: Use your regular password**
   - If you don't want 2FA, you can try your regular password
   - May require enabling "Less secure app access"

## Option 2: Using SendGrid (Alternative)

For production environments, SendGrid is more reliable:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Setting up SendGrid:

1. **Sign up:** https://sendgrid.com
2. **Create API Key:** Go to Settings > API Keys
3. **Verify Email:** Add and verify `felipe.mazzeo.barbosa@outlook.com` as a sender
4. **Add to .env:** Use the API key in your environment

## Testing Email Configuration

After setting up, test your email by:

1. **Start the backend:**
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Test the contact form:**
   - Go to your frontend contact form
   - Submit a test message
   - Check if you receive emails

3. **Check logs:**
   ```bash
   tail -f backend/logs/app.log
   ```

## Troubleshooting

### Common Issues:

1. **"Authentication failed":**
   - Double-check your email and password
   - For Outlook, try generating an app password
   - Verify SMTP settings

2. **"Connection refused":**
   - Check SMTP host and port
   - Ensure firewall allows outbound connections

3. **"Sender not verified" (SendGrid):**
   - Verify your email address in SendGrid dashboard
   - Check domain authentication

### Email Templates

Your portfolio includes these email templates:
- `backend/app/templates/emails/contact_notification.html` - Admin notification
- `backend/app/templates/emails/contact_autoreply.html` - Visitor auto-reply

You can customize these templates to match your branding.

## Security Notes

- Never commit your `.env` file to version control
- Use app passwords instead of regular passwords when possible
- Regularly rotate your API keys and passwords
- Monitor your email service usage for unusual activity 