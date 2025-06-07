import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel
from pydantic import EmailStr

if TYPE_CHECKING:
    from centralserver.internals.models.user import User


class SchoolUserLink(SQLModel, table=True):
    """A model representing which users are linked to which schools."""

    __tablename__: str = "school_user_link"  # type: ignore

    schoolId: int = Field(
        primary_key=True,
        index=True,
        foreign_key="schools.id",
        description="The ID of the school.",
    )
    userId: str = Field(
        primary_key=True,
        index=True,
        foreign_key="users.id",
        description="The ID of the user (employee).",
    )


class SchoolPrincipalLink(SQLModel, table=True):
    """A model representing which user is the principal of a school."""

    __tablename__: str = "school_principal"  # type: ignore

    schoolId: int = Field(
        primary_key=True,
        index=True,
        foreign_key="schools.id",
        description="The ID of the school.",
    )
    principalId: str = Field(
        foreign_key="users.id",
        description="The ID of the user (principal).",
    )


class SchoolLastModifiedByLink(SQLModel, table=True):
    """A model representing which user last modified a school record."""

    __tablename__: str = "school_last_modified_by"  # type: ignore

    schoolId: int = Field(
        primary_key=True,
        index=True,
        foreign_key="schools.id",
        description="The ID of the school.",
    )
    lastModifiedById: str = Field(
        foreign_key="users.id",
        description="The ID of the user who last modified the school record.",
    )


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

    # lastModifiedBy: "User" = Relationship(back_populates="lastModifiedSchools")
    lastModifiedBy: Optional["User"] = Relationship(
        back_populates="lastModifiedSchools", link_model=SchoolLastModifiedByLink
    )
    principal: Optional["User"] = Relationship(
        back_populates="principalOfSchools", link_model=SchoolPrincipalLink
    )
    users: list["User"] = Relationship(
        back_populates="schools", link_model=SchoolUserLink
    )
