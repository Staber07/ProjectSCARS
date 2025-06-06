import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel
from pydantic import EmailStr

if TYPE_CHECKING:
    from centralserver.internals.models.user import User


class School(SQLModel, table=True):
    """A model representing schools in the system."""

    __tablename__: str = "schools"  # type: ignore

    id: int = Field(
        primary_key=True,
        index=True,
        description="The unique identifier for the school.",
    )
    # NOTE: I did not make `name` unique because I think there can be
    #       multiple schools with the same name.
    name: str = Field(index=True, description="The name of the school.")
    address: str | None = Field(default=None, description="The address of the school.")
    coordinates: str | None = Field(
        default=None,
        regex=r"^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$",
        description="The coordinates of the school. (Format: `x,y`)",
    )

    # NOTE: verification are not implemented for these fields.
    phone: str | None = Field(
        default=None, description="The phone number of the school."
    )
    email: EmailStr | None = Field(
        default=None, description="The email address of the school."
    )
    website: str | None = Field(default=None, description="The website of the school.")

    logoUrn: str | None = Field(
        default=None,
        description="A link or identifier to the schools's logo within the file storage server.",
    )

    dateCreated: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc),
        description="The timestamp when the record was created.",
    )
    lastModified: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc),
        description="The last time the user information was modified.",
    )
    lastModifiedById: str = Field(
        description="The user ID of the last user who modified the record.",
        foreign_key="users.id",
    )

    principalId: str | None = Field(
        default=None,
        description="The user ID of the principal of the school.",
        foreign_key="users.id",
    )

    users: list["User"] = Relationship(back_populates="school")
    lastModifiedBy: "User" = Relationship(back_populates="lastModifiedSchools")
    principal: "User" = Relationship(back_populates="principalOfSchools")
