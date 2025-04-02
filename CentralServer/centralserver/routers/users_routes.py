from typing import Annotated, Sequence

from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select

from centralserver.internals.db_handler import get_db_session
from centralserver.internals.models import User
from centralserver.routers.auth_routes import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(get_db_session)],
)

logged_in_dep = Annotated[dict[str, str], Depends(get_current_user)]


@router.get("/get", status_code=status.HTTP_200_OK, response_model=list[User])
async def get_all_users(
    session: Annotated[Session, Depends(get_db_session)],
    token: logged_in_dep,
) -> Sequence[User]:
    users = session.exec(select(User)).all()
    return users


@router.get("/me")
async def get_user_profile(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> User:
    return session.exec(select(User).where(User.id == token["user_id"])).one()
