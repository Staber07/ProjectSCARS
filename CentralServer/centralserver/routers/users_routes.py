from typing import Annotated, Any, Sequence

from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select

from centralserver.internals.auth_handler import oauth2_bearer
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.models import User

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(get_db_session)],
)


@router.get("/get", status_code=status.HTTP_200_OK, response_model=list[User])
async def get_all_users(
    session: Annotated[Session, Depends(get_db_session)],
) -> Sequence[User]:
    users = session.exec(select(User)).all()
    return users


@router.get("/me")
async def get_user_profile(
    token: Annotated[str, Depends(oauth2_bearer)],
) -> dict[str, Annotated[str, Any]]:  # TODO: WIP
    return {"token": token}
