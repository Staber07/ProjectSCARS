from uvicorn import config, run

from centralserver.internals.config_handler import app_config

if __name__ == "__main__":
    app_config.run_internal = True  # app is running using __main__
    run(
        "centralserver:app",  # import using module:attribute
        host=app_config.connection.host,
        port=app_config.connection.port,
        reload=app_config.debug.hot_reload,
        log_level=(
            config.LOG_LEVELS["debug"]
            if app_config.debug.enabled
            else config.LOG_LEVELS["warning"]
        ),
    )
