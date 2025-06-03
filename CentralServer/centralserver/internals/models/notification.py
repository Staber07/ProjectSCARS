from datetime import datetime
from typing import TYPE_CHECKING
from enum import StrEnum
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from centralserver.internals.models.user import User


class NotificationType(StrEnum):
    """Enumeration for notification types."""

    # Generic notification types
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"

    # Account-specific notification types
    MAIL = "mail"
    SECURITY = "security"


class Notification(SQLModel, table=True):
    """A model representing a notification in the system."""

    __tablename__ = "notifications"  # type: ignore

    id: datetime = Field(
        default_factory=datetime.now,
        primary_key=True,
        index=True,
        description="The timestamp for when the notification was created.",
    )
    ownerId: str = Field(
        default=None,
        foreign_key="users.id",
        description="The ID of the user who owns the notification.",
    )
    title: str = Field(
        description="The title of the notification.",
    )
    content: str = Field(
        description="The content of the notification.",
    )
    important: bool = Field(
        default=False,
        description="Indicates whether the notification is important.",
    )
    type: NotificationType = Field(
        default="info",
        description="The type of the notification. (To be used by the frontend for styling purposes.)",
    )
    archived: bool = Field(
        default=False,
        description="Indicates whether the notification has been archived.",
    )

    owner: "User" = Relationship(
        back_populates="notifications",
    )
