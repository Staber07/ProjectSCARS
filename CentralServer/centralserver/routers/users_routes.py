from io import BytesIO
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from minio.error import S3Error
from sqlmodel import Session, func, select

from centralserver.internals.auth_handler import (
    get_role,
    get_user,
    verify_access_token,
    verify_user_permission,
)
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models.token import DecodedJWTToken
from centralserver.internals.models.user import User, UserPublic, UserUpdate
from centralserver.internals.permissions import DEFAULT_ROLES, ROLE_PERMISSIONS
from centralserver.internals.user_handler import (
    get_user_avatar,
    update_user_avatar,
    update_user_info,
)

logger = LoggerFactory().get_logger(__name__)

router = APIRouter(
    prefix="/v1/users",
    tags=["users"],
    # dependencies=[Depends(get_db_session)],
)

logged_in_dep = Annotated[DecodedJWTToken, Depends(verify_access_token)]


@router.get("/quantity", response_model=int)
async def get_users_quantity_endpoint(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> int:
    """Get the total number of users in the system.

    Args:
        token: The access token of the logged-in user.
        session: The session to the database.

    Returns:
        The total number of users.
    """

    if not await verify_user_permission("users:global:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view users list.",
        )

    logger.debug("user %s fetching users quantity", token.id)
    return session.exec(select(func.count(User.id))).one()  # type: ignore


@router.get("/me", response_model=tuple[UserPublic, list[str]])
async def get_user_profile_endpoint(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> tuple[UserPublic, list[str]]:
    """Get the logged-in user's profile information.

    Args:
        token: The access token of the logged-in user.
        session: The session to the database.

    Returns:
        The user's profile information together with their permissions.
    """

    if not await verify_user_permission("users:self:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view your profile.",
        )

    logger.debug("Fetching user profile for user ID: %s", token.id)
    user = session.get(User, token.id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    return (UserPublic.model_validate(user), ROLE_PERMISSIONS[user.roleId])


@router.get("/all", response_model=list[UserPublic])
async def get_all_users_endpoint(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    limit: int = 25,
    offset: int = 0,
) -> list[UserPublic]:
    """Get all users and their information.

    Args:
        token: The access token of the logged-in user.
        session: The session to the database.
        limit: The maximum number of users to return (default is 25).
        offset: The number of users to skip (default is 0).

    Returns:
        A list of users and their information.
    """

    if not await verify_user_permission("users:global:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view users list.",
        )

    logger.debug("user %s fetching all user info", token.id)
    return [
        UserPublic.model_validate(user)
        for user in session.exec(select(User).limit(limit).offset(offset)).all()
    ]


@router.get("/", response_model=UserPublic)
async def get_user_endpoint(
    user_id: str,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    """Get the information of a specific user.

    Args:
        user_id: The ID of the user to fetch.
        token: The access token of the logged-in user.
        session: The session to the database.

    Returns:
        The user's information.
    """

    if not await verify_user_permission("users:global:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view users' information.",
        )

    logger.debug("user %s fetching user info of %s", token.id, user_id)
    selected_user = session.get(User, user_id)
    if not selected_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found.",
        )

    return UserPublic.model_validate(selected_user)


@router.get("/avatar", response_class=StreamingResponse)
async def get_user_avatar_endpoint(
    fn: str,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> StreamingResponse:
    """Get the user's profile picture.

    Args:
        fn: The name of the user's avatar.
        token: The access token of the logged-in user.
        session: The session to the database.

    Returns:
        The user's avatar image.
    """

    user = await get_user(token.id, session=session, by_id=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found."
        )

    if not await verify_user_permission(
        "users:self:read" if user.avatarUrn == fn else "users:global:read",
        session,
        token,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You do not have permission to view your profile."
                if user.avatarUrn == fn
                else "You do not have permission to view other users' information."
            ),
        )

    try:
        bucket_object = await get_user_avatar(fn)
        if bucket_object is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Avatar not found.",
            )

    except S3Error as e:
        logger.error("Error fetching user avatar: %s", e)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Avatar not found.",
        ) from e

    return StreamingResponse(BytesIO(bucket_object.obj), media_type="image/*")


@router.patch("/", response_model=UserPublic)
async def update_user_endpoint(
    updated_user_info: UserUpdate,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    """Update a user's profile information.

    Args:
        token: The access token of the logged-in user.
        session: The session to the database.
    """

    updating_self = updated_user_info.id == token.id
    if not await verify_user_permission(
        ("users:self:modify" if updating_self else "users:global:modify"),
        session,
        token,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You do not have permission to update your profile."
                if updating_self
                else "You do not have permission to update other user profiles."
            ),
        )

    logger.debug(
        "user %s is updating user profile of %s...", token.id, updated_user_info.id
    )
    return await update_user_info(
        target_user=updated_user_info, token=token, session=session
    )


@router.patch("/avatar", response_model=UserPublic)
async def update_user_avatar_endpoint(
    user_id: str,
    img: UploadFile,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    """Update a user's avatar.

    Args:
        user_id: The ID of the user to update.
        img: The new avatar image.
        token: The access token of the logged-in user.
        session: The session to the database.

    Returns:
        The updated user information.
    """

    updating_self = user_id == token.id
    if not await verify_user_permission(
        "users:self:modify" if updating_self else "users:global:modify",
        session,
        token,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "You do not have permission to update your profile."
                if updating_self
                else "You do not have permission to update other user profiles."
            ),
        )

    logger.debug("user %s is updating user profile of %s...", token.id, user_id)
    return await update_user_avatar(user_id, await img.read(), token, session)


@router.delete("/avatar")
async def delete_user_avatar_endpoint(
    user_id: str,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
):
    """Delete a user's avatar.

    Args:
        user_id: The ID of the user to update.
        token: The access token of the logged-in user.
        session: The session to the database.
    """

    if not await verify_user_permission("users:global:modify", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update user profiles.",
        )

    logger.debug("user %s is deleting user avatar of %s...", token.id, user_id)
    try:
        return await update_user_avatar(user_id, None, token, session)

    except ValueError as e:
        logger.warning("Error deleting user avatar: %s", e)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have an avatar set.",
        ) from e


@router.patch("/role")  # TODO: merge with PATCH /
async def update_user_role_endpoint(
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

    logger.debug("User %s is updating user role of %s...", token.id, user_id)
    if not await verify_user_permission("users:global:modify", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update users' roles.",
        )

    selected_user = await get_user(user_id, session=session, by_id=True)
    user_role = await get_role(role_id, session)
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

    if selected_user.roleId == DEFAULT_ROLES[0].id:
        logger.warning(
            "%s is trying to change the role of another superintendent user (%s)",
            token.id,
            selected_user.id,
        )
        # Make sure that there is at least one superintedent user in the database
        superintendent_quantity = len(
            session.exec(select(User).where(User.roleId == 1)).all()
        )
        if superintendent_quantity == 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot change the role of the last admin user.",
            )

    logger.debug("Setting user %s role to %s", selected_user.id, user_role.id)
    selected_user.roleId = role_id
    session.commit()
    session.refresh(selected_user)
    return UserPublic.model_validate(selected_user)


@router.patch("/deactivate")  # TODO: merge with PATCH /
async def deactivate_user_endpoint(
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

    if selected_user.roleId == DEFAULT_ROLES[0].id:
        # Make sure that there is at least one superintedent user in the database
        if (
            len(session.exec(select(User).where(User.roleId == 1)).all())
            == DEFAULT_ROLES[0].id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate the last admin user.",
            )

    selected_user.deactivated = True
    session.commit()
    session.refresh(selected_user)
    return UserPublic.model_validate(selected_user)


@router.patch("/reactivate")  # TODO: merge with PATCH /
async def reactivate_user_endpoint(
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


@router.patch("/force")  # TODO: merge with PATCH /
async def force_update_user_endpoint(
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


# ---------------------------#


@router.patch("/update/school")
async def update_user_school_endpoint(
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
