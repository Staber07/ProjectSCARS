from fastapi import HTTPException, status
from sqlmodel import Session, select

from centralserver.internals.auth_handler import crypt_ctx
from centralserver.internals.models import NewUser, User


def validate_username(username: str) -> bool:
    """Check if the username is valid.

    Args:
        username: The username to validate.

    Returns:
        True if the username is valid, False otherwise.
    """
    return (
        all(c.isalnum() or c in ("_", "-") for c in username)
        and len(username) > 3
        and len(username) < 22
    )


def validate_password(password: str) -> bool:
    """Make sure that the password is a valid Argon2id password hash.

    Args:
        password: The password to validate.

    Returns:
        True if the password is valid, False otherwise.
    """

    return crypt_ctx.identify(password) == "argon2"  # type: ignore


def create_user(
    new_user: NewUser,
    session: Session,
) -> User:
    if session.exec(select(User).where(User.username == new_user.username)).first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )

    if not validate_username(new_user.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid username",
        )

    if not validate_password(new_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password format",
        )

    user = User(**new_user.model_dump())
    session.add(user)
    session.commit()
    session.refresh(user)

    return user
