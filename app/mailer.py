"""Outgoing email. The reset link (which contains the raw token) exists only inside the message sent."""
import logging
import smtplib
from email.message import EmailMessage
from typing import Protocol

from app.config import get_settings

logger = logging.getLogger(__name__)


class Mailer(Protocol):
    def send_password_reset(self, to_email: str, reset_url: str) -> None: ...


class SmtpMailer:
    def send_password_reset(self, to_email: str, reset_url: str) -> None:
        settings = get_settings()
        if not settings.smtp_host:
            # Deliberately logs neither the address nor the link.
            logger.warning("SMTP is not configured; password reset email was not sent")
            return

        message = EmailMessage()
        message["Subject"] = "Reset your password"
        message["From"] = settings.smtp_from
        message["To"] = to_email
        message.set_content(
            "We received a request to reset your password.\n\n"
            f"Use this link to choose a new one (valid for {settings.password_reset_ttl_minutes} minutes, one use only):\n"
            f"{reset_url}\n\n"
            "If you did not request this, you can ignore this email."
        )
        try:
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
                if settings.smtp_starttls:
                    smtp.starttls()
                if settings.smtp_username:
                    smtp.login(settings.smtp_username, settings.smtp_password or "")
                smtp.send_message(message)
        except (smtplib.SMTPException, OSError):
            logger.error("Failed to send password reset email")  # no exc_info: keep message content out of logs


def get_mailer() -> Mailer:
    return SmtpMailer()
