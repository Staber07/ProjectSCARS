from fastapi import APIRouter, Query, Depends
from fastapi.responses import JSONResponse
from sqlmodel import Session

from centralserver.internals.ai.core import smart_ask
from centralserver.routers.misc_routes import logged_in_dep
from centralserver.internals.ai.auth import fetch_user_info

router = APIRouter(prefix="/ai", tags=["AI Assistant"])

@router.post("/ask")
async def ask_ai(
    prompt: str = Query(...),
    user_id: str = Query("default"),
    token: logged_in_dep = Depends(),
    session: Session = Depends(),
):
    user_info = await fetch_user_info(token, session)
    reply = await smart_ask(prompt, user_id, user_info, token, session)
    return JSONResponse(content={"reply": reply})
