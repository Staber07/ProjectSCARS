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


class OTPToken(SQLModel):
    """A model representing a request to create an OTP token."""

    secret: str
    recovery_code: str
    provisioning_uri: str


class OTPVerificationToken(SQLModel):
    """A model representing a request to verify an OTP token."""

    otp: str
    nonce: str
