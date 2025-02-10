from firebase_admin import auth
from models import User


def convert_user_firebase_to_dataclass(firebase_auth: auth.UserRecord) -> User:
    """Convert a Firebase Auth user to a User dataclass.

    Args:
        firebase_auth (auth.UserRecord): The Firebase Auth user.

    Returns:
        User: The User dataclass.
    """

    return User(
        uid=firebase_auth.uid,
        display_name=firebase_auth.display_name,
        email=firebase_auth.email,
        email_verified=firebase_auth.email_verified,
        phone_number=firebase_auth.phone_number,
        photo_url=firebase_auth.photo_url,
        disabled=firebase_auth.disabled,
    )
