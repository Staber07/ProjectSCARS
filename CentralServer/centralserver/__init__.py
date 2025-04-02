from centralserver import info
from centralserver.internals.config_handler import read_config_file
from centralserver.internals.logger import LoggerFactory
from centralserver.main import app

# read configuration file
read_config_file()

logger = LoggerFactory(log_level="debug" if info.Program.debug else "warn").get_logger(
    __name__
)

logger.debug(f"{info.Program.name=}")
logger.debug(f"info.Program.version={'.'.join(map(str, info.Program.version))}")
logger.debug(f"{info.Program.debug=}")

logger.debug(f"{info.Configuration.default_filepath=}")
logger.debug(f"{info.Configuration.default_encoding=}")

logger.debug(f"{info.Logging.filepath=}")
logger.debug(f"{info.Logging.max_bytes=}")
logger.debug(f"{info.Logging.backup_count=}")
logger.debug(f"{info.Logging.encoding=}")
logger.debug(f"{info.Logging.log_format=}")
logger.debug(f"{info.Logging.date_format=}")

logger.debug(f"{info.Database.db_type=}")
logger.debug(f"{info.Database.db_driver=}")
logger.debug(f"{info.Database.username=}")
logger.debug(f"info.Database.password={'*' * 8}")
logger.debug(f"{info.Database.host=}")
logger.debug(f"{info.Database.port=}")
logger.debug(f"{info.Database.database=}")
logger.debug(f"{info.Database.get_uri()=}")

logger.debug(f"{info.Authentication.secret_key=}")
logger.debug(f"{info.Authentication.algorithm=}")
logger.debug(f"{info.Authentication.access_token_expire_minutes=}")

__all__ = ["app"]
