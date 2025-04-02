from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security.oauth2 import OAuth2PasswordRequestForm
from jose import JWTError, jwt
from sqlmodel import Session

from centralserver.internals.auth_handler import (
    authenticate_user,
    create_access_token,
    oauth2_bearer,
)
from centralserver.internals.config_handler import app_config
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models import NewUser, Token, User
from centralserver.internals.user_handler import create_user

logger = LoggerFactory().get_logger(__name__)

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    dependencies=[Depends(get_db_session)],
)


@router.post("/create", status_code=status.HTTP_201_CREATED, response_model=User)
async def create_new_user(
    new_user: NewUser, session: Annotated[Session, Depends(get_db_session)]
) -> User:
    logger.info("Creating new user: %s", new_user.username)
    user = create_user(new_user, session)
    return user


@router.post("/token", response_model=Token)
async def request_access_token(
    data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Annotated[Session, Depends(get_db_session)],
):
    logger.info("Requesting access token for user: %s", data.username)
    user: User | None = authenticate_user(data.username, data.password, session)

    if not user:
        logger.warning(
            "Failed to authenticate user: %s (Invalid credentials)", data.username
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    return {
        "access_token": create_access_token(
            user.username,
            user.id,
            timedelta(minutes=app_config.authentication.access_token_expire_minutes),
        ),
        "token_type": "bearer",
    }


async def get_current_user(
    token: Annotated[str, Depends(oauth2_bearer)],
) -> dict[str, str] | None:
    try:
        payload = jwt.decode(
            token,
            app_config.authentication.secret_key,
            algorithms=[app_config.authentication.algorithm],
        )
        username: str | None = payload.get("sub")
        user_id: str | None = payload.get("id")
        if username is None or user_id is None:
            logger.warning("Failed to validate user JWT: %s", payload)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Failed to validate user.",
            )

        return {"username": username, "user_id": user_id}

    except JWTError:
        logger.warning("Failed to decode JWT: %s", token)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Failed to validate user.",
        )
