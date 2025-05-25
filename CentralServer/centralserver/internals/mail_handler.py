import smtplib
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from centralserver.internals.config_handler import app_config
from centralserver.internals.logger import LoggerFactory

logger = LoggerFactory().get_logger(__name__)


def create_attachment(bytes_data: bytes, filename: str, content_type: str) -> MIMEBase:
    """Create an email attachment from bytes data.

    Args:
        bytes_data: The content of the file as bytes.
        filename: The name of the file to be attached.
        content_type: The MIME type of the file (e.g., 'application/pdf').

    Returns:
        A MIMEBase object representing the attachment.
    """

    attachment = MIMEBase(*content_type.split("/"))
    attachment.set_payload(bytes_data)
    encoders.encode_base64(attachment)
    attachment.add_header("Content-Disposition", f"attachment; filename={filename}")
    return attachment


def send_mail(
    to_address: str,
    subject: str,
    text: str,
    html: str | None = None,
    attachments: list[MIMEBase] | None = None,
):
    """Send an email to the specified recipient.

    If mailing is disabled in the configuration, the email content will be logged instead of sent.

    Args:
        to_address: The email address of the recipient.
        subject: The subject of the email.
        text: The plain text content of the email.
        html: The HTML content of the email (optional).
        attachments: A list of files (optional).
    """

    if not app_config.mailing.enabled:
        logger.info("Mailing is disabled, printing to logs instead.")
        logger.info("To: %s", to_address)
        logger.info("Subject: %s", subject)
        logger.info("Text: %s", text)
        return

    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = app_config.mailing.from_address
        message["To"] = to_address

        plain_content = MIMEText(text, "plain")
        html_content = MIMEText(html, "html") if html else None

        message.attach(plain_content)
        if html_content:
            message.attach(html_content)

        if attachments:
            for attachment in attachments:
                message.attach(attachment)

        # Send the email
        with smtplib.SMTP(app_config.mailing.server, app_config.mailing.port) as server:
            server.connect(app_config.mailing.server, app_config.mailing.port)
            server.ehlo()
            server.starttls()  # Upgrade the connection to a secure encrypted SSL/TLS connection
            server.ehlo()
            server.login(app_config.mailing.username, app_config.mailing.password)
            server.sendmail(
                from_addr=app_config.mailing.from_address,
                to_addrs=[to_address],
                msg=message.as_string(),
            )

    except smtplib.SMTPException as e:
        logger.error("Failed to send email: %s", e)

    except Exception as e:
        logger.error("An unexpected error occurred while sending email: %s", e)
