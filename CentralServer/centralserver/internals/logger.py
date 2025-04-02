import logging
from logging.handlers import RotatingFileHandler
from time import strftime

from centralserver import info


class LoggerFactory:
    def __init__(
        self,
        log_level: int | str | None = None,
    ):
        """Create a new LoggerFactory object.

        Args:
            log_level: Override the log level with the provided value.
        """

        self.log_level = (
            log_level
            if log_level is not None
            else "DEBUG" if info.Program.debug else "WARN"
        )

    def get_logger(self, name: str) -> logging.Logger:
        """Get a logger with the provided name.

        Args:
            name: The name of the logger.

        Returns:
            The logger object.
        """

        logger = logging.getLogger(name)
        if type(self.log_level) is int:
            logger.setLevel(self.log_level)
        elif type(self.log_level) is str:
            logger.setLevel(self.log_level.upper())
        else:
            raise ValueError("Invalid log level type. Must be int or str.")

        # Add a handler if one does not already exist.
        if not logger.handlers:
            # handlers
            stream_handler = logging.StreamHandler()
            file_handler = RotatingFileHandler(
                info.Logging.filepath.format(strftime("%Y-%m-%d_%H-%M-%S")),
                maxBytes=info.Logging.max_bytes,
                backupCount=info.Logging.backup_count,
                encoding=info.Logging.encoding,
            )

            # formatters
            formatter = logging.Formatter(
                fmt=info.Logging.log_format,
                datefmt=info.Logging.date_format,
            )

            # add formatters to handlers
            stream_handler.setFormatter(formatter)
            file_handler.setFormatter(formatter)

            # add handlers to logger
            logger.addHandler(stream_handler)
            logger.addHandler(file_handler)

        return logger
