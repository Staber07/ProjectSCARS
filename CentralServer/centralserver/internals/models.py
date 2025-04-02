import uuid

from sqlmodel import Field, Relationship, SQLModel


class School(SQLModel, table=True):
    """A model representing schools in the system."""

    __tablename__: str = "schools"  # type: ignore

    id: int | None = Field(primary_key=True, index=True)
    name: str = Field(unique=True, description="The name of the school.")
    users: list["User"] = Relationship(back_populates="school")


class Role(SQLModel, table=True):
    """A model representing user roles in the system."""

    __tablename__: str = "roles"  # type: ignore

    id: int | None = Field(default=None, primary_key=True, index=True)
    description: str = Field(
        unique=True,
        description="Canteen Manager, Principal, Administrator, or Superintendent",
    )

    users: list["User"] = Relationship(back_populates="role")


class User(SQLModel, table=True):
    """A model representing a user in the system."""

    __tablename__: str = "users"  # type: ignore

    id: str | None = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
        description="The unique identifier for the user.",
    )

    username: str = Field(unique=True, description="The username of the user.")
    email: str | None = Field(unique=True, description="The email address of the user.")
    nameFirst: str = Field(description="The first name of the user.")
    nameMiddle: str | None = Field(description="The middle name of the user.")
    nameLast: str = Field(description="The last name of the user.")
    avatarUrl: str | None = Field(
        description="A link to the user's avatar within the file storage server."
    )
    schoolId: int | None = Field(
        description="The ID of the school the user belongs to.",
        foreign_key="schools.id",
    )
    roleId: int = Field(
        description="The user's role in the system.", foreign_key="roles.id"
    )
    hashed_password: str = Field(
        description="The hashed password of the user.",
    )
    deactivated: bool = Field(
        default=False,
        description="Whether the user account is deactivated.",
    )

    school: School | None = Relationship(
        back_populates="users",
    )
    role: Role = Relationship(back_populates="users")


class NewUser(SQLModel):
    """A model representing a new user to be created."""

    username: str
    email: str | None = None
    nameFirst: str
    nameMiddle: str | None = None
    nameLast: str
    schoolId: int | None = None
    roleId: int
    hashed_password: str
