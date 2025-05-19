import datetime

from fastapi import HTTPException, status
from sqlalchemy.exc import NoResultFound
from sqlmodel import Session, select

from centralserver.internals.adapters.object_store import (
    BucketNames,
    get_object_store_handler,
)
from centralserver.internals.auth_handler import crypt_ctx
from centralserver.internals.config_handler import app_config
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models.object_store import BucketObject
from centralserver.internals.models.user import User, UserCreate, UserPublic, UserUpdate

logger = LoggerFactory().get_logger(__name__)


async def validate_username(username: str) -> bool:
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


async def validate_password(password: str) -> tuple[bool, str | None]:
    """Make sure that the password is a valid password.

    Args:
        password: The password to validate.

    Returns:
        A tuple containing a boolean whether the password is valid or not,
        and an optional error message when the password is invalid.
    """

    if len(password) < 8:
        return (False, "Password must be at least 8 characters long.")

    if not any(c.isdigit() for c in password):
        return (False, "Password must contain at least one digit.")

    if not any(c.islower() for c in password):
        return (False, "Password must contain at least one lowercase letter.")

    if not any(c.isupper() for c in password):
        return (False, "Password must contain at least one uppercase letter.")

    return (True, None)


async def create_user(
    new_user: UserCreate,
    session: Session,
) -> User:
    """Create a new user in the database.

    Args:
        new_user: The new user's information.
        session: The database session to use.

    Returns:
        A new user object.

    Raises:
        HTTPException: Thrown when the user already exists or the username is invalid.
    """

    if session.exec(select(User).where(User.username == new_user.username)).first():
        logger.warning(
            "Failed to create user: %s (username already exists)", new_user.username
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )

    if not await validate_username(new_user.username):
        logger.warning(
            "Failed to create user: %s (invalid username)", new_user.username
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid username",
        )

    password_is_valid, password_err = await validate_password(new_user.password)
    if not password_is_valid:
        logger.warning(
            "Failed to create user: %s (%s)", new_user.username, password_err
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid password format ({password_err})",
        )

    # user = User(**new_user.model_dump())
    user = User(
        username=new_user.username,
        password=crypt_ctx.hash(new_user.password),
        roleId=new_user.roleId,
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    logger.info("User `%s` created.", new_user.username)
    return user


async def update_user_avatar(
    target_user: str, img: bytes | None, session: Session
) -> UserPublic:
    """Update the user's avatar in the database.

    Args:
        target_user: The user to update.
        img: The new avatar image.
        session: The database session to use.

    Returns:
        The updated user object.
    """

    selected_user = session.get(User, target_user)

    if not selected_user:  # Check if user exists
        logger.warning("Failed to update user: %s (user not found)", target_user)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found",
        )

    object_store_manager = await get_object_store_handler(app_config.object_store)
    if img is None:
        logger.debug("Deleting avatar for user: %s", target_user)
        if selected_user.avatarUrn is None:
            logger.warning("No avatar to delete for user: %s", target_user)
            raise ValueError("No avatar to delete.")

        await object_store_manager.delete(BucketNames.AVATARS, selected_user.avatarUrn)
        selected_user.avatarUrn = None

    else:
        logger.debug("Updating avatar for user: %s", target_user)
        object = await object_store_manager.put(
            BucketNames.AVATARS, selected_user.id, img
        )
        if selected_user.avatarUrn is not None:  # Delete old avatar if it exists
            await object_store_manager.delete(
                BucketNames.AVATARS, selected_user.avatarUrn
            )

        selected_user.avatarUrn = object.fn

    selected_user.lastModified = datetime.datetime.now(datetime.timezone.utc)

    session.commit()
    session.refresh(selected_user)
    logger.info("User info for `%s` updated.", selected_user.username)
    return UserPublic.model_validate(selected_user)


async def update_user_info(target_user: UserUpdate, session: Session) -> UserPublic:
    """Update the user's information in the database.

    Args:
        target_user: The user to update with new info.
        session: The database session to use.
    """

    selected_user = session.get(User, target_user.id)

    if not selected_user:  # Check if user exists
        logger.warning("Failed to update user: %s (user not found)", target_user.id)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found",
        )

    if target_user.username:  # Update username if provided
        logger.debug("Updating username for user: %s", target_user.id)
        # Check username availability
        if target_user.username != selected_user.username:
            try:
                _ = session.exec(
                    select(User).where(User.username == target_user.username)
                ).one()
                logger.warning(
                    "Failed to update user: %s (username already exists)",
                    target_user.id,
                )
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Username already exists",
                )

            except NoResultFound:
                logger.debug("Username %s is available.", target_user.username)

        # Check username validity
        if not await validate_username(target_user.username):
            logger.warning(
                "Failed to update user: %s (invalid username)", target_user.username
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid username",
            )

        # Set new username
        selected_user.username = target_user.username

    if target_user.email:  # Update email if provided
        logger.debug("Updating email for user: %s", target_user.id)
        selected_user.email = target_user.email

    if target_user.nameFirst:  # Update first name if provided
        logger.debug("Updating first name for user: %s", target_user.id)
        selected_user.nameFirst = target_user.nameFirst

    if target_user.nameMiddle:  # Update middle name if provided
        logger.debug("Updating middle name for user: %s", target_user.id)
        selected_user.nameMiddle = target_user.nameMiddle

    if target_user.nameLast:  # Update last name if provided
        logger.debug("Updating last name for user: %s", target_user.id)
        selected_user.nameLast = target_user.nameLast

    if target_user.password:  # Update password if provided
        logger.debug("Updating password for user: %s", target_user.id)
        # Validate password
        password_is_valid, password_err = await validate_password(target_user.password)
        if not password_is_valid:
            logger.warning(
                "Failed to update user: %s (%s)", target_user.username, password_err
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid password format ({password_err})",
            )

        # Set new password
        selected_user.password = crypt_ctx.hash(target_user.password)

    if (  # Update onboarding status if provided
        target_user.finishedTutorials is not None
    ):
        if len(target_user.finishedTutorials) > 50:
            logger.warning(
                "Failed to update user: %s (too many tutorials)", target_user.id
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Too many tutorials finished.",
            )

        logger.debug(
            "Updating onboarding status for user: %s (%s)",
            target_user.id,
            len(target_user.finishedTutorials),
        )
        selected_user.finishedTutorials = target_user.finishedTutorials

    selected_user.lastModified = datetime.datetime.now(datetime.timezone.utc)

    session.commit()
    session.refresh(selected_user)
    logger.info("User info for `%s` updated.", selected_user.username)
    return UserPublic.model_validate(selected_user)


async def get_user_avatar(fn: str) -> BucketObject | None:
    handler = await get_object_store_handler(app_config.object_store)
    return await handler.get(BucketNames.AVATARS, fn)
