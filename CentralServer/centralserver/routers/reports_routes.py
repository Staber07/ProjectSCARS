from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from centralserver.internals.auth_handler import (
    verify_access_token,
    verify_user_permission,
)
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models import DecodedJWTToken

logger = LoggerFactory().get_logger(__name__)

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
    dependencies=[Depends(verify_access_token)],
)

logged_in_dep = Annotated[DecodedJWTToken, Depends(verify_access_token)]


@router.get("/monthly/{school_id}")
async def get_monthly_reports(
    school_id: int,
    month: int,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict[str, Any]:
    """Get the last 24 months of reports."""

    if not await verify_user_permission("reports:local:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view monthly reports.",
        )

    logger.debug(
        "user `%s` requesting monthly reports of school %s for month %s.",
        token.id,
        school_id,
        month,
    )

    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED)  # TODO: WIP


@router.get("/daily/{school_id}")
async def get_daily_reports(
    school_id: int,
    report_date: datetime,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> list[Any]:
    """Get all submissions on <month> <year>."""

    if not await verify_user_permission("reports:local:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view daily reports.",
        )

    logger.debug(
        "user `%s` requesting daily reports of school %s for %s.",
        token.id,
        school_id,
        report_date.strftime("%Y-%m-%d"),
    )

    raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED)  # TODO: WIP
