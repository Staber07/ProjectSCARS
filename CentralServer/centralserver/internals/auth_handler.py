from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/auth/token")
crypt_ctx = CryptContext(schemes=["argon2"], deprecated="auto")


def validate_username(username: str) -> bool:
    """Check if the username is valid.

    Args:
        username: The username to validate.

    Returns:
        True if the username is valid, False otherwise.
    """
    return (
        all([c for c in username if c.isalnum() or c in ("_", "-")])
        and len(username) > 3
        and len(username) < 22
    )
