from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/auth/token")
crypt_ctx = CryptContext(schemes=["argon2"], deprecated="auto")


def get_hashed_password(password: str) -> str:
    """Hash the password using Argon2id algorithm.

    Args:
        password: The password to hash.

    Returns:
        The hashed password.
    """

    return crypt_ctx.hash(password)
