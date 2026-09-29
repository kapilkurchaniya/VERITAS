import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import structlog

logger = structlog.get_logger(__name__)

class NotificationService:
    def __init__(self):
        self.email_user = os.getenv("EMAIL_USER")
        self.email_password = os.getenv("EMAIL_APP_PASSWORD")
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        
    def send_alert(self, subject: str, body: str, to_email: str):
        if not self.email_user or not self.email_password:
            logger.warn("NotificationService: Email credentials not set, skipping email", subject=subject)
            return
            
        try:
            msg = MIMEMultipart()
            msg["From"] = self.email_user
            msg["To"] = to_email
            msg["Subject"] = f"[VERITAS Nexus] {subject}"
            
            msg.attach(MIMEText(body, "plain"))
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email_user, self.email_password)
                server.send_message(msg)
                
            logger.info("NotificationService: Email sent successfully", to=to_email, subject=subject)
        except Exception as e:
            logger.error("NotificationService: Failed to send email", error=str(e), to=to_email)

notification_service = NotificationService()
