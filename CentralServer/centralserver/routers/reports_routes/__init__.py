from typing import Annotated

from fastapi import APIRouter, Depends

from centralserver.internals.auth_handler import verify_access_token
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models.token import DecodedJWTToken
from centralserver.routers.reports_routes.monthly import router as monthly_router
from centralserver.routers.reports_routes.daily import router as daily_router

logger = LoggerFactory().get_logger(__name__)
router = APIRouter(
    prefix="/v1/reports",
    tags=["reports"],
    dependencies=[Depends(verify_access_token)],
)
logged_in_dep = Annotated[DecodedJWTToken, Depends(verify_access_token)]

router.include_router(monthly_router)
router.include_router(daily_router)
