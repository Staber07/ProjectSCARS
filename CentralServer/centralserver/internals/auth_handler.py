from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from centralserver.internals.config_handler import app_config
from centralserver.internals.models import User

crypt_ctx = CryptContext(schemes=["argon2"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/auth/token")


def get_hashed_password(password: str, salt: str | None = None) -> str:
    """Hash the password using Argon2id algorithm.

    Args:
        password: The password to hash.
        salt: The salt to use for hashing.

    Returns:
        The hashed password.
    """

    if salt:
        return crypt_ctx.hash(password, salt=salt)

    return crypt_ctx.hash(password)


def authenticate_user(
    username: str, plaintext_password: str, session: Session
) -> User | None:
    found_user: User | None = session.exec(
        select(User).where(User.username == username)
    ).first()

    if not found_user:
        return None

    print(get_hashed_password(plaintext_password))
    print(found_user.hashed_password)
    hashed_password = get_hashed_password(
        plaintext_password, found_user.hashed_password.split("$")[2]
    )
    return (
        found_user
        if crypt_ctx.verify(hashed_password, found_user.hashed_password)
        else None
    )


def create_access_token(username: str, user_id: str, expiration_td: timedelta):
    """Create an access token for the user.

    Args:
        user: The user to create the access token for.

    Returns:
        The access token.
    """

    token_data: dict[str, Any] = {
        "sub": username,
        "id": user_id,
        "exp": datetime.now(timezone.utc) + expiration_td,
    }

    return jwt.encode(
        token_data,
        app_config.authentication.secret_key,
        app_config.authentication.algorithm,
    )
