from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from centralserver.internals.auth_handler import (
    verify_access_token,
    verify_user_permission,
)
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models import DecodedJWTToken, User, UserPublic, UserUpdate
from centralserver.internals.user_handler import update_user_info

logger = LoggerFactory().get_logger(__name__)

router = APIRouter(
    prefix="/v1/users",
    tags=["users"],
    # dependencies=[Depends(get_db_session)],
)

logged_in_dep = Annotated[DecodedJWTToken, Depends(verify_access_token)]


@router.get("/get", status_code=status.HTTP_200_OK, response_model=list[UserPublic])
async def get_all_users(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> list[UserPublic]:
    if not await verify_user_permission("users:global:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view users list.",
        )

    logger.debug("user %s fetching all user info", token.id)
    return [
        UserPublic.model_validate(user) for user in session.exec(select(User)).all()
    ]


@router.get("/me")
async def get_user_profile(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    logger.debug("Fetching user profile for user ID: %s", token.id)
    return UserPublic.model_validate(
        session.exec(select(User).where(User.id == token.id)).one()
    )


@router.patch("/update")
async def update_user(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED)  # TODO: WIP


@router.patch("/me/update")
async def update_user_profile(
    updated_user_info: UserUpdate,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    """Update the logged-in user's profile information.

    Args:
        updated_user_info: The new user information.
        token: The access token of the logged-in user.
        session: The session to the database.

    Returns:
        The newly updated user information.

    Raises:
        HTTPException: Raised when the user does not have permission to update their profile.
    """

    if not await verify_user_permission("users:global:selfupdate", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update your profile.",
        )

    if token.id != updated_user_info.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile. Use `/users/update` if you want to update another user's profile.",
        )

    # Make sure that the user exists in the database
    acquired_user = session.get(User, token.id)
    if not acquired_user:
        logger.warning("Failed to update user: %s (user does not exist)", token.id)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not exist",
        )

    new_info = User(
        id=updated_user_info.id,
        username=updated_user_info.username,
        email=updated_user_info.email,
        nameFirst=updated_user_info.nameFirst,
        nameMiddle=updated_user_info.nameMiddle,
        nameLast=updated_user_info.nameLast,
        avatarUrl=updated_user_info.avatarUrl,
        schoolId=acquired_user.schoolId,
        roleId=acquired_user.roleId,
        password=acquired_user.password,
        deactivated=acquired_user.deactivated,
        force_update_info=acquired_user.force_update_info,
    )

    logger.debug("user %s updating their profile", token.id)
    return update_user_info(acquired_user, new_info, session)
