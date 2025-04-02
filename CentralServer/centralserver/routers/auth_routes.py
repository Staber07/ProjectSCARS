from fastapi import APIRouter, Depends

from centralserver.internals.db_handler import get_db_session

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    dependencies=[Depends(get_db_session)],
)
