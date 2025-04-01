import os
from typing import Final


class Program:
    name: Final[str] = "Project SCARS Central Server"
    version: Final[tuple[int, int, int]] = (0, 1, 0)
    debug: Final[bool] = os.getenv("CENTRAL_SERVER_DEBUG", "false").lower() == "true"


class Database:
    db_type: Final[str] = "mysql"
    db_driver: Final[str] = "pymysql"
    username: Final[str] = os.getenv("CENTRAL_SERVER_DB_USERNAME", "root")
    password: Final[str] = os.getenv("CENTRAL_SERVER_DB_PASSWORD", "")
    host: Final[str] = os.getenv("CENTRAL_SERVER_DB_HOST", "localhost")
    port: Final[int] = int(os.getenv("CENTRAL_SERVER_DB_PORT", 3306))
    database: Final[str] = os.getenv("CENTRAL_SERVER_DB_DATABASE", "projectscars")

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
