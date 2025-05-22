from dataclasses import dataclass
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from centralserver.internals.models.user import User


@dataclass(frozen=True)
class DefaultRole:
    id: int
    description: str
    modifiable: bool


class Role(SQLModel, table=True):
    """A model representing user roles in the system."""

    __tablename__: str = "roles"  # type: ignore

    id: int | None = Field(default=None, primary_key=True, index=True)
    description: str = Field(
        unique=True,
        description="WebAdmin, Canteen Manager, Principal, Administrator, or Superintendent",
    )
    modifiable: bool = Field(
        default=False,
        description="Whether the role's characteristics can be modified.",
    )

    users: list["User"] = Relationship(back_populates="role")
