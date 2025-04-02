import os
from pathlib import Path
from typing import Final


class Program:
    """General program information."""

    name: Final[str] = "Project SCARS Central Server"
    version: Final[tuple[int, int, int]] = (0, 1, 0)
    debug: bool = False


class Configuration:
    default_filepath: Final[Path] = Path(os.getcwd(), "config.json")
    default_encoding: Final[str] = "utf-8"


class Logging:
    filepath: str = os.path.join(os.getcwd(), "logs", "centralserver-{0}.log")
    max_bytes: int = 1024 * 1024 * 10  # 10 MB
    backup_count: int = 5
    encoding: str = "utf-8"

    log_format: str = "%(asctime)s:%(name)s:%(levelname)s:%(message)s"
    date_format: str = "%d-%m-%y_%H-%M-%S"


class Database:
    """Database connection information."""

    db_type: str = "mysql"
    db_driver: str = "pymysql"
    username: str = "root"
    password: str = ""
    host: str = "localhost"
    port: int = 3306
    database: str = "projectscars"

    @classmethod
    def get_uri(cls) -> str:
        """Get the database URI for SQLAlchemy."""
        return (
            "{type}+{driver}://{username}:{password}@{host}:{port}/{database}".format(
                type=cls.db_type,
                driver=cls.db_driver,
                username=cls.username,
                password=cls.password,
                host=cls.host,
                port=cls.port,
                database=cls.database,
            )
        )


class Authentication:
    """Authentication configuration."""

    secret_key: str | None = None
    algorithm: str = ""
    access_token_expire_minutes: int = 30
