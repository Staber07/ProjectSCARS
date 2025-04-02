from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from centralserver.internals.db_handler import get_db_session
from centralserver.internals.models import NewUser, User
from centralserver.internals.user_handler import create_user

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    dependencies=[Depends(get_db_session)],
)


@router.post("/create", status_code=status.HTTP_201_CREATED, response_model=User)
async def create_new_user(
    new_user: NewUser, session: Annotated[Session, Depends(get_db_session)]
) -> User:
    user = create_user(new_user, session)
    return user
