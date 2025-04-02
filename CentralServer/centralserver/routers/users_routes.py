from typing import Annotated, Any, Sequence

from fastapi import APIRouter, Depends, status
from sqlmodel import Session, select

from centralserver.internals.auth_handler import oauth2_bearer
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.models import NewUser, User
from centralserver.internals.user_handler import create_user

router = APIRouter(
    prefix="/users",
    tags=["users"],
    dependencies=[Depends(get_db_session)],
)


@router.post("/create", status_code=status.HTTP_201_CREATED, response_model=User)
async def create_new_user(
    new_user: NewUser, session: Annotated[Session, Depends(get_db_session)]
) -> User:
    user = create_user(new_user, session)
    return user


@router.get("/get", status_code=status.HTTP_200_OK, response_model=list[User])
async def get_all_users(
    session: Annotated[Session, Depends(get_db_session)],
) -> Sequence[User]:
    users = session.exec(select(User)).all()
    return users


@router.get("/me")
def get_user_profile(
    token: Annotated[str, Depends(oauth2_bearer)],
) -> dict[str, Annotated[str, Any]]:  # TODO: WIP
    return {"token": token}
