from typing import Any

from sqlmodel import SQLModel


class ConfigUpdateRequest(SQLModel):
    """Request model for updating configuration."""

    config: dict[str, Any]
