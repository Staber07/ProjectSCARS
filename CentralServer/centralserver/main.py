from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from centralserver import info
from centralserver.internals.config_handler import app_config
from centralserver.internals.db_handler import Base, engine
from centralserver.internals.logger import LoggerFactory, log_app_info
from centralserver.routers import reports_routes, users_routes

logger = LoggerFactory(
    log_level="debug" if app_config.debug.enabled else "warn"
).get_logger(__name__)

log_app_info(logger)

app = FastAPI(
    debug=app_config.debug.enabled,
    title=info.Program.name,
    version=".".join(map(str, info.Program.version)),
)

Base.metadata.create_all(bind=engine)


app.include_router(users_routes.router)
app.include_router(reports_routes.router)


@app.exception_handler(404)
async def not_found_error(request: Request, exc: Exception):
    """Return a 404 error response."""

    logger.info(f"Not Found: {exc}")
    logger.debug(f"Request: {request}")
    return JSONResponse(status_code=404, content={"message": "Not found"})


@app.exception_handler(500)
async def internal_server_error(request: Request, exc: Exception):
    """Return a 500 error response."""

    logger.critical(f"Internal server error: {exc}", exc_info=True)
    logger.debug(f"Request: {request}")
    return JSONResponse(status_code=500, content={"message": "Internal server error"})


@app.get("/healthcheck")
async def root():
    return {"message": "Healthy"}
