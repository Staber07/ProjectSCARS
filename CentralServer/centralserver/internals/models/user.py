import datetime
import uuid
from dataclasses import dataclass
from typing import TYPE_CHECKING, Optional

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from centralserver.internals.models.role import Role
    from centralserver.internals.models.school import School


@dataclass(frozen=True)
class DefaultRole:
    id: int
    description: str
    modifiable: bool


class User(SQLModel, table=True):
    """A model representing a user in the system."""

    __tablename__: str = "users"  # type: ignore

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
        description="The unique identifier for the user.",
    )

    username: str = Field(
        unique=True, index=True, description="The username of the user."
    )
    email: EmailStr | None = Field(
        default=None, unique=True, description="The email address of the user."
    )
    nameFirst: str | None = Field(
        default=None, description="The first name of the user."
    )
    nameMiddle: str | None = Field(
        default=None, description="The middle name of the user."
    )
    nameLast: str | None = Field(default=None, description="The last name of the user.")
    avatarUrn: str | None = Field(
        default=None,
        description="A link or identifier to the user's avatar within the file storage server.",
    )
    schoolId: int | None = Field(
        default=None,
        description="The ID of the school the user belongs to.",
        foreign_key="schools.id",
    )
    roleId: int = Field(
        description="The user's role in the system.", foreign_key="roles.id"
    )
    password: str = Field(
        description="The hashed password of the user.",
    )
    deactivated: bool = Field(
        default=False,
        description="Whether the user account is deactivated.",
    )
    forceUpdateInfo: bool = Field(
        default=False,
        description="Whether the user is required to update their information.",
    )
    recoveryToken: str | None = Field(
        default=None,
        description="A token used for account recovery, if applicable.",
    )
    recoveryTokenExpires: datetime.datetime | None = Field(
        default=None,
        description="The expiration time for the recovery token.",
    )
    finishedTutorials: str = Field(
        default_factory=str,
        description="A list of onboarding tutorials the user has completed.",
    )

    dateCreated: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc),
        description="The timestamp when the record was created.",
    )
    lastModified: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc),
        description="The last time the user information was modified.",
    )
    lastLoggedInTime: datetime.datetime | None = Field(
        default=None,
        description="The last time the user logged in.",
    )
    lastLoggedInIp: str | None = Field(
        default=None,
        description="The last IP address the user logged in from.",
    )

    school: Optional["School"] = Relationship(
        back_populates="users",
    )
    role: "Role" = Relationship(back_populates="users")


class UserPublic(SQLModel):
    """A model representing a user without sensitive information."""

    id: str
    username: str
    email: EmailStr | None
    nameFirst: str | None
    nameMiddle: str | None
    nameLast: str | None
    avatarUrn: str | None
    schoolId: int | None
    roleId: int
    deactivated: bool
    finishedTutorials: str
    forceUpdateInfo: bool
    dateCreated: datetime.datetime
    lastModified: datetime.datetime
    lastLoggedInTime: datetime.datetime | None
    lastLoggedInIp: str | None


class UserUpdate(SQLModel):
    """A model used when updating user information."""

    id: str  # The ID of the user to be updated.
    username: str | None = None
    email: EmailStr | None = None
    nameFirst: str | None = None
    nameMiddle: str | None = None
    nameLast: str | None = None
    password: str | None = None

    finishedTutorials: str | None = None


class UserCreate(SQLModel):
    """A model used for creating new user accounts."""

    username: str
    roleId: int
    password: str


class UserRecover(SQLModel):
    """A model used for recovering a user account."""

    username: str
    email: EmailStr


class UserPasswordResetRequest(SQLModel):
    """A model used for resetting a user's password."""

    new_password: str
    recovery_token: str
