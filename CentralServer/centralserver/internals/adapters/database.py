"""
This module contains the database configuration classes.
The actual database engine is created in the `db_handler.py` module.
"""

import os
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, override


class DatabaseAdapterConfig(ABC):
    """Superclass for database adapter configuration."""

    @property
    @abstractmethod
    def sqlalchemy_uri(self) -> str:
        """Get the database URI for SQLAlchemy."""

    @property
    @abstractmethod
    def connect_args(self) -> dict[str, Any]:
        """Get the connection arguments for SQLAlchemy."""


class SQLiteDatabaseConfig(DatabaseAdapterConfig):
    """The SQLite database configuration."""

    def __init__(
        self,
        filepath: str | Path | None = None,
        connect_args: dict[str, Any] | None = None,
    ):
        """Configuration for a SQLite database engine.

        Args:
            filepath: The location of the SQLite database file.
            connect_args: The connection arguments to use.
        """

        default_connect_args: dict[str, Any] = {"check_same_thread": False}

        self.filepath: Path = Path(
            filepath or os.path.join(os.getcwd(), "centralserver.db")
        )

        self._connect_args = {**default_connect_args, **(connect_args or {})}

    @property
    @override
    def sqlalchemy_uri(self) -> str:
        """Get the database URI for SQLAlchemy."""

        return f"sqlite:///{self.filepath.absolute()}"

    @property
    @override
    def connect_args(self) -> dict[str, Any]:
        return self._connect_args


class MySQLDatabaseConfig(DatabaseAdapterConfig):
    """The MySQL database configuration."""

    def __init__(
        self,
        username: str | None = None,
        password: str | None = None,
        host: str | None = None,
        port: int | None = None,
        database: str | None = None,
        connect_args: dict[str, Any] | None = None,
    ):
        """Create a configuration object for the database.

        Args:
            username: The database username.
            password: The database password.
            host: The hostname of the database server.
            port: The port number of the database server.
            database: The database name.
            connect_args: The connection arguments to use.
        """

        default_connect_args: dict[str, Any] = {}

        self.username: str = username or "ProjectSCARS_DatabaseAdmin"
        self.password: str = password or "ProjectSCARS_mysql143"
        self.host: str = host or "localhost"
        self.port: int = port or 3306
        self.database: str = database or "ProjectSCARS_CentralServer"
        self._connect_args = {**default_connect_args, **(connect_args or {})}

    @property
    @override
    def sqlalchemy_uri(self) -> str:
        """Get the database URI for SQLAlchemy."""
        return "mysql+pymysql://{username}:{password}@{host}:{port}/{database}".format(
            username=self.username,
            password=self.password,
            host=self.host,
            port=self.port,
            database=self.database,
        )

    @property
    @override
    def connect_args(self) -> dict[str, Any]:
        return self._connect_args
