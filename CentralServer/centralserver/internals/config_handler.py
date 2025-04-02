import json
from pathlib import Path

from centralserver import info


def read_config_file(
    fp: str | Path = info.Configuration.default_filepath,
    enc: str = info.Configuration.default_encoding,
) -> None:
    """Update the application's configuration from a JSON file."""

    with open(fp, "r", encoding=enc) as f:
        config = json.load(f)

    info.Program.debug = config.get("debug", info.Program.debug)

    db_config = config.get("database", {})
    info.Database.db_type = db_config.get("db_type", info.Database.db_type)
    info.Database.db_driver = db_config.get("db_driver", info.Database.db_driver)
    info.Database.username = db_config.get("username", info.Database.username)
    info.Database.password = db_config.get("password", info.Database.password)
    info.Database.host = db_config.get("host", info.Database.host)
    info.Database.port = db_config.get("port", info.Database.port)
    info.Database.database = db_config.get("database", info.Database.database)

    auth_config = config.get("authentication", {})
    info.Authentication.secret_key = auth_config.get(
        "secret_key", info.Authentication.secret_key
    )
    info.Authentication.algorithm = auth_config.get(
        "algorithm", info.Authentication.algorithm
    )
    info.Authentication.access_token_expire_minutes = auth_config.get(
        "access_token_expire_minutes", info.Authentication.access_token_expire_minutes
    )
