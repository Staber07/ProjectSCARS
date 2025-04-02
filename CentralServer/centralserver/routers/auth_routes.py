from fastapi import APIRouter

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
    # dependencies=[Depends(get_auth_header)],
)
