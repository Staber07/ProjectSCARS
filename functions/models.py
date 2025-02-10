from dataclasses import dataclass
from pathlib import Path


@dataclass
class User:
    """A user dataclass.

    uid: User ID to assign to the newly created user (optional).
    display_name: The user's display name (optional).
    email: The user's primary email (optional).
    email_verified: A boolean indicating whether or not the user's primary email is
    verified (optional).
    phone_number: The user's primary phone number (optional).
    photo_url: The user's photo URL (optional).
    disabled: A boolean indicating whether or not the user account is disabled (optional).
    """

    display_name: str
    email: str

    uid: str | None = None
    disabled: bool = False
    email_verified: bool = False
    phone_number: str | None = None
    photo_url: str | Path | None = None
