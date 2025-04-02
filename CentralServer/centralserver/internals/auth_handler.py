from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from centralserver.internals.config_handler import app_config
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models import User

logger = LoggerFactory().get_logger(__name__)
crypt_ctx = CryptContext(schemes=["argon2"], deprecated="auto", argon2__type="ID")
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
        logger.debug("Hashing using Argon2id with salt")
        return crypt_ctx.hash(password, salt=salt)

    logger.debug("Hashing using Argon2id without salt")
    return crypt_ctx.hash(password)


def authenticate_user(
    username: str, plaintext_password: str, session: Session
) -> User | None:
    logger.debug("Authenticating user: %s", username)
    found_user: User | None = session.exec(
        select(User).where(User.username == username)
    ).first()

    if not found_user:
        logger.debug("Authentication failed: %s (user not found)", username)
        return None

    logger.debug(plaintext_password)
    logger.debug(found_user.hashed_password)
    logger.debug(crypt_ctx.verify(plaintext_password, found_user.hashed_password))
    if crypt_ctx.verify(plaintext_password, found_user.hashed_password):
        logger.debug("Authentication successful: %s", username)
        return found_user

    else:
        logger.debug("Authentication failed: %s (invalid password)", username)
        return None


def create_access_token(username: str, user_id: str, expiration_td: timedelta):
    """Create an access token for the user.

    Args:
        user: The user to create the access token for.

    Returns:
        The access token.
    """

    logger.debug("Creating access token for user: %s", username)
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
