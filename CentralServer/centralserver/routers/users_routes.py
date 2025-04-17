from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from centralserver.internals.auth_handler import (
    verify_access_token,
    verify_user_permission,
)
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models import (
    DecodedJWTToken,
    Role,
    User,
    UserPublic,
    UserUpdate,
)
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


@router.patch("/update")
async def update_user(
    updated_user_info: UserUpdate,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    """Update a user's profile information.

    Args:
        token: The access token of the logged-in user.
        session: The session to the database.
    """

    if not await verify_user_permission("users:global:modify", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update user profiles. Use `/me/update` to update your own profile.",
        )

    logger.debug(
        "user %s is updating user profile of %s...", token.id, updated_user_info.id
    )
    return update_user_info(updated_user_info, session)


@router.patch("/update/school")
async def update_user_school(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
):
    """Assign a school to a user.

    Args:
        token: The user's access token.
        session: The database session.

    Raises:
        HTTPException: Raised when the user does not have permission to update users' assigned schools.
    """

    if not await verify_user_permission("users:global:modify", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update users' assigned schools.",
        )

    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED)  # TODO: WIP


@router.patch("/update/role")
async def update_user_role(
    user_id: str,
    role_id: int,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    """Update a user's role.

    Args:
        user_id: The ID of the user to update.
        role_id: The ID of the new role to assign.
        token: The access token of the logged-in user.
        session: The session to the database.

    Returns:
        The updated user information.

    Raises:
        HTTPException: Raised when the user does not have permission to update users' roles.
    """

    if not await verify_user_permission("users:global:modify", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update users' roles.",
        )

    user_role = session.get(Role, role_id)
    selected_user = session.get(User, user_id)
    if not selected_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found.",
        )
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role ID provided.",
        )

    selected_user.roleId = role_id
    session.commit()
    session.refresh(selected_user)
    return UserPublic.model_validate(selected_user)


@router.patch("/update/deactivate")
async def deactivate_user(
    user_id: str,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    """Deactivate a user.

    Args:
        user_id: The ID of the user to deactivate.
        token: The access token of the logged-in user.
        session: The session to the database.

    Returns:
        The updated user information.

    Raises:
        HTTPException: Raised when the user does not have permission to deactivate users.
    """

    if not await verify_user_permission("users:global:modify", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to deactivate users.",
        )

    selected_user = session.get(User, user_id)

    if not selected_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found.",
        )

    selected_user.deactivated = True
    session.commit()
    session.refresh(selected_user)
    return UserPublic.model_validate(selected_user)


@router.patch("/update/reactivate")
async def reactivate_user(
    user_id: str,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    """Reactivate a user.

    Args:
        user_id: The ID of the user to reactivate.
        token: The access token of the logged-in user.
        session: The session to the database.

    Returns:
        The updated user information.

    Raises:
        HTTPException: Raised when the user does not have permission to reactivate users.
    """

    if not await verify_user_permission("users:global:modify", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to reactivate users.",
        )

    selected_user = session.get(User, user_id)
    if not selected_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found.",
        )

    selected_user.deactivated = False
    session.commit()
    session.refresh(selected_user)
    return UserPublic.model_validate(selected_user)


@router.patch("/update/force")
async def force_update_user(
    user_id: str,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    """Force a user to update their profile information on login.

    Args:
        user_id: The ID of the user to force update.
        token: The access token of the logged-in user.
        session: The session to the database.

    Returns:
        The updated user information.

    Raises:
        HTTPException: Raised when the user does not have permission to force update users.
    """

    if not await verify_user_permission("users:global:modify", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update user profiles.",
        )

    selected_user = session.get(User, user_id)

    if not selected_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found.",
        )

    selected_user.forceUpdateInfo = True
    session.commit()
    session.refresh(selected_user)
    return UserPublic.model_validate(selected_user)


@router.get("/me")
async def get_user_profile(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    """Get the logged-in user's profile information.

    Args:
        token: The access token of the logged-in user.
        session: The session to the database.

    Returns:
        The user's profile information.
    """

    logger.debug("Fetching user profile for user ID: %s", token.id)
    return UserPublic.model_validate(
        session.exec(select(User).where(User.id == token.id)).one()
    )


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

    logger.debug("user %s is updating their profile...", token.id)
    return update_user_info(updated_user_info, session)
