import uuid

from sqlmodel import SQLModel


class JWTToken(SQLModel):
    """A model representing an encoded JWT token."""

    uid: uuid.UUID
    access_token: str
    token_type: str


class DecodedJWTToken(SQLModel):
    """A model representing a decoded JWT token."""

    id: str
    is_refresh_token: bool
