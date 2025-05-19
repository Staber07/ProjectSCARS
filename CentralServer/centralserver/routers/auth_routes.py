import datetime
import uuid
from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from sqlmodel import Session, select

from centralserver.internals.auth_handler import (
    authenticate_user,
    create_access_token,
    verify_access_token,
    verify_user_permission,
)
from centralserver.internals.config_handler import app_config
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models.role import Role
from centralserver.internals.models.token import DecodedJWTToken, JWTToken
from centralserver.internals.models.user import User, UserCreate, UserPublic
from centralserver.internals.user_handler import create_user

logger = LoggerFactory().get_logger(__name__)

router = APIRouter(
    prefix="/v1/auth",
    tags=["authentication"],
    # dependencies=[Depends(get_db_session)],
)

logged_in_dep = Annotated[DecodedJWTToken, Depends(verify_access_token)]


@router.post("/create", status_code=status.HTTP_201_CREATED, response_model=UserPublic)
async def create_new_user(
    new_user: UserCreate,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> UserPublic:
    """Create a new user in the database.

    Args:
        new_user: The new user's information.
        token: The decoded JWT token of the logged-in user.
        session: The database session.

    Returns:
        A newly created user object.
    """

    if not await verify_user_permission("users:global:create", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create a user.",
        )

    user_role = session.get(Role, new_user.roleId)
    if not user_role:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role ID provided.",
        )

    logger.info("Creating new user: %s", new_user.username)
    logger.debug("Created by user: %s", token.id)
    user = UserPublic.model_validate(await create_user(new_user, session))
    logger.debug("Returning new user information: %s", user)
    return user


@router.post("/token")
async def request_access_token(
    data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[Session, Depends(get_db_session)],
    request: Request,
) -> JWTToken:
    """Get an access token for a user.

    Args:
        data: The data from the OAuth2 password request form.
        session: The database session.
        request: The HTTP request object.

    Returns:
        A JWT token.

    Raises:
        HTTPException: If the user cannot be authenticated.
    """

    logger.info("Requesting access token for user: %s", data.username)
    user: User | None = await authenticate_user(data.username, data.password, session)

    if not user:
        logger.warning(
            "Failed to authenticate user: %s (Invalid credentials)", data.username
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    user.lastLoggedInTime = datetime.datetime.now(datetime.timezone.utc)
    user.lastLoggedInIp = request.client.host if request.client else None
    session.commit()
    session.refresh(user)

    return JWTToken(
        uid=uuid.uuid4(),
        access_token=await create_access_token(
            user.id,
            timedelta(minutes=app_config.authentication.access_token_expire_minutes),
            False,
        ),
        token_type="bearer",
    )


@router.get("/roles", response_model=list[Role])
async def get_all_roles(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> list[Role]:
    """Get all roles in the database.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.

    Returns:
        A list of all roles in the database.
    """

    if not await verify_user_permission("roles:global:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view all roles.",
        )

    # NOTE: Should we include the permissions of each role in the response?
    return [role for role in session.exec(select(Role)).all()]
