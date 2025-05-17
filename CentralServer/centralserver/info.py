import os
from pathlib import Path
from typing import Final


class Program:
    """General program information."""

    name: Final[str] = "Project SCARS Central Server"
    version: Final[tuple[int, int, int]] = (0, 3, 6)


class Database:
    """Default user credentials in the database."""

    default_user: Final[str] = "scars"
    default_password: Final[str] = "ProjectSCARS1"


class Configuration:
    """Default configuration file information."""

    default_filepath: Final[Path] = Path(os.getcwd(), "config.json")
    default_encoding: Final[str] = "utf-8"
