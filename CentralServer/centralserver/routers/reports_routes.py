from typing import Annotated, Any

from fastapi import APIRouter, Depends

from centralserver.internals.auth_handler import oauth2_bearer

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
    # dependencies=[Depends(get_auth_header)],
)


@router.get("/monthly")
def get_monthly_reports(
    token: Annotated[str, Depends(oauth2_bearer)],
) -> dict[str, Annotated[str, Any]]:
    """Get the last 24 months of reports."""
    # TODO: WIP
    return {"token": token}


@router.get("/daily/{year}/{month}")
def get_daily_reports(
    token: Annotated[str, Depends(oauth2_bearer)],
) -> list[Any]:
    """Get all submissions on <month> <year>."""
    # TODO: WIP
    return [token]
