from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from centralserver import info
from centralserver.internals.logger import LoggerFactory
from centralserver.routers import reports, users

logger = LoggerFactory().get_logger(info.Program.name)


app = FastAPI(
    debug=info.Program.debug,
    title=info.Program.name,
    version=".".join(map(str, info.Program.version)),
)


app.include_router(users.router)
app.include_router(reports.router)


@app.exception_handler(500)
async def internal_server_error(request: Request, exc: Exception):
    logger.critical(f"Internal server error: {exc}", exc_info=True)
    logger.debug(f"Request: {request}")
    return JSONResponse(status_code=500, content={"message": "Internal server error"})


@app.get("/healthcheck")
async def root():
    return {"message": "Healthy"}
