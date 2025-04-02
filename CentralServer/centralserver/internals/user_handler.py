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
    """Make sure that the password is a valid password.

    Args:
        password: The password to validate.

    Returns:
        True if the password is valid, False otherwise.
    """

    # Password requirements:
    # - Minimum length of 8 characters
    # - At least one digit
    # - At least one letter
    return len(password) > 8 and any(c.isalnum() for c in password)


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

    if not validate_password(new_user.plaintext_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password format",
        )

    # user = User(**new_user.model_dump())
    user = User(
        username=new_user.username,
        hashed_password=crypt_ctx.hash(new_user.plaintext_password),
        roleId=new_user.roleId,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    return user
