import uuid

from sqlalchemy import VARCHAR, Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.mysql import CHAR
from sqlalchemy.ext.declarative import declarative_base

base = declarative_base()


class Role(base):
    """A model representing user roles in the system."""

    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    description = Column(
        VARCHAR(64),
        nullable=False,
        unique=True,
        comment="Canteen Manager, Principal, Administrator, or Superintendent",
    )


class User(base):
    """A model representing a user in the system."""

    __tablename__ = "users"

    id = Column(
        CHAR(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        comment="The unique identifier for the user.",
    )
    username = Column(
        VARCHAR(64), nullable=False, unique=True, comment="The username of the user."
    )
    email = Column(
        VARCHAR(64),
        nullable=False,
        unique=True,
        comment="The email address of the user.",
    )
    nameFirst = Column(
        VARCHAR(64), nullable=False, comment="The first name of the user."
    )
    nameMiddle = Column(
        VARCHAR(64), nullable=True, comment="The middle name of the user."
    )
    nameLast = Column(VARCHAR(64), nullable=False, comment="The last name of the user.")
    avatarUrl = (
        Column(
            Text, comment="A link to the user's avatar within the file storage server."
        ),
    )
    schoolId = (
        Column(
            Integer,
            ForeignKey("schools.id", onupdate="CASCADE", ondelete="RESTRICT"),
            nullable=True,
            comment="In which school the user is responsible for.",
        ),
    )
    role_id = Column(
        Integer,
        ForeignKey("roles.id", onupdate="CASCADE", ondelete="RESTRICT"),
        nullable=False,
        comment="The user's role in the system.",
    )
    hashed_password = Column(String(128), nullable=False)
    deactivated = Column(Boolean, default=False)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}')>"
