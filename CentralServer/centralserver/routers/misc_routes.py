import json
import os
import signal
import sys
from typing import Annotated, Any, Literal

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from sqlmodel import Session

from centralserver.info import FORBIDDEN_CONFIG_KEYS
from centralserver.internals.auth_handler import (
    verify_access_token,
    verify_user_permission,
)
from centralserver.internals.config_handler import app_config
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.models.settings import ConfigUpdateRequest
from centralserver.internals.models.token import DecodedJWTToken

router = APIRouter(prefix="/v1")

logged_in_dep = Annotated[DecodedJWTToken, Depends(verify_access_token)]


def _restart_application() -> None:
    """
    Restart the application gracefully.

    This method works for both development and production:
    - Development: Uses os.execv to restart the Python process
    - Production: Sends appropriate signal for graceful restart
    - Docker: The container will restart automatically if configured with restart policies
    """

    try:
        # Check if we're running in a production environment (e.g., with gunicorn)
        if hasattr(os, "getppid") and os.getppid() != 1:
            # Try to signal the parent process for graceful restart
            try:
                # Use SIGTERM on Windows, SIGUSR1 on Unix-like systems
                restart_signal = (
                    signal.SIGTERM
                    if sys.platform == "win32"
                    else getattr(signal, "SIGUSR1", signal.SIGTERM)
                )
                os.kill(os.getppid(), restart_signal)
                return

            except (OSError, AttributeError):
                pass

        # Development restart - restart the current Python process
        python = sys.executable
        os.execl(python, python, *sys.argv)

    except (OSError, SystemExit):
        # If all else fails, exit with code 3 which many process managers interpret as "restart"
        sys.exit(3)


@router.get("/healthcheck")
async def root() -> dict[Literal["message"], Literal["Healthy"]]:
    """Always returns a 200 OK response with a message."""

    return {"message": "Healthy"}


@router.get("/admin/config")
async def get_server_config(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict[str, Any]:
    """Get the current server configuration (excluding sensitive data)."""

    if not await verify_user_permission("site:manage", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access server configuration.",
        )

    # Export configuration from each section, excluding sensitive fields
    config_data = app_config.values
    # Why did we even do this manually, when we can just use app_config.values?
    #
    # config_data = {
    #     "debug": {
    #         "enabled": app_config.debug.enabled,
    #         "logenv_optout": app_config.debug.logenv_optout,
    #         "show_sql": app_config.debug.show_sql,
    #         "hot_reload": app_config.debug.hot_reload,
    #     },
    #     "connection": {
    #         "host": app_config.connection.host,
    #         "port": app_config.connection.port,
    #         "base_url": app_config.connection.base_url,
    #     },
    #     "logging": {
    #         "filepath": app_config.logging.filepath,
    #         "max_bytes": app_config.logging.max_bytes,
    #         "backup_count": app_config.logging.backup_count,
    #         "encoding": app_config.logging.encoding,
    #         "log_format": app_config.logging.log_format,
    #         "date_format": app_config.logging.date_format,
    #     },
    #     "security": app_config.security.export(),
    #     "mailing": {
    #         # Don't expose sensitive fields like passwords
    #         "enabled": app_config.mailing.enabled,
    #         "server": app_config.mailing.server,
    #         "port": app_config.mailing.port,
    #         "from_address": app_config.mailing.from_address,
    #         "username": app_config.mailing.username,
    #         # password is excluded for security
    #         "templates_dir": app_config.mailing.templates_dir,
    #         "templates_encoding": app_config.mailing.templates_encoding,
    #     },
    #     "authentication": {
    #         # Don't expose secret keys or sensitive data
    #         "signing_algorithm": app_config.authentication.signing_algorithm,
    #         "encryption_algorithm": app_config.authentication.encryption_algorithm,
    #         "encrypt_jwt": app_config.authentication.encrypt_jwt,
    #         "encoding": app_config.authentication.encoding,
    #         "access_token_expire_minutes": app_config.authentication.access_token_expire_minutes,
    #         "refresh_token_expire_minutes": app_config.authentication.refresh_token_expire_minutes,
    #         "recovery_token_expire_minutes": app_config.authentication.recovery_token_expire_minutes,
    #         "otp_nonce_expire_minutes": app_config.authentication.otp_nonce_expire_minutes,
    #     },
    # }

    return config_data


@router.put("/admin/config")
async def update_server_config(
    new_config: ConfigUpdateRequest,
    background_tasks: BackgroundTasks,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> dict[str, str]:
    """Update the server configuration."""

    if not await verify_user_permission("site:manage", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify server configuration.",
        )

    try:
        # Create a copy of current config to modify
        # and read the current configuration file
        current_config = {}
        with open(app_config.filepath, "r", encoding=app_config.encoding) as f:
            current_config = json.load(f)

        # Merge the updates with current config
        # Only allow updating fields that are not in the forbidden list
        safe_updates: dict[str, dict[str, Any]] = {}

        for section_name, section_data in new_config.config.items():
            if section_name in current_config:
                # Get the list of forbidden keys for this section
                forbidden_keys = FORBIDDEN_CONFIG_KEYS.get(section_name, [])

                # Filter out forbidden keys from the update
                safe_section_updates = {
                    k: v for k, v in section_data.items() if k not in forbidden_keys
                }

                # Merge with existing config for this section
                safe_updates[section_name] = {
                    **current_config.get(section_name, {}),
                    **safe_section_updates,
                }

        # Update the current config
        for section, updates in safe_updates.items():
            current_config[section] = updates

        # Write back to file
        with open(app_config.filepath, "w", encoding=app_config.encoding) as f:
            json.dump(current_config, f, indent=4)

        # Schedule a restart in the background after the response is sent
        # This allows the client to receive the success response before restart
        background_tasks.add_task(_restart_application)

        return {
            "message": "Configuration updated successfully. Server will restart to apply changes."
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update configuration: {str(e)}",
        ) from e
