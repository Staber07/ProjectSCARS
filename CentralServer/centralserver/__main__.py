from uvicorn import config, run

from centralserver.internals.config_handler import app_config
from centralserver.main import app

if __name__ == "__main__":
    run(
        app,
        host=app_config.connection.host,
        port=app_config.connection.port,
        reload=app_config.debug.hot_reload,
        log_level=(
            config.LOG_LEVELS["debug"]
            if app_config.debug.enabled
            else config.LOG_LEVELS["warning"]
        ),
    )
