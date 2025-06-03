from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func

from centralserver.internals.exceptions import NotificationNotFoundError
from centralserver.internals.auth_handler import verify_access_token
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models.token import DecodedJWTToken
from centralserver.internals.models.notification import (
    Notification,
    NotificationArchiveRequest,
)
from centralserver.internals.notification_handler import (
    get_all_notifications as internals_get_all_notifications,
    get_notification as internals_get_notification,
    get_user_notifications as internals_get_user_notifications,
    archive_notification as internals_archive_notification,
)
from centralserver.internals.auth_handler import verify_user_permission

logger = LoggerFactory().get_logger(__name__)

router = APIRouter(
    prefix="/v1/notifications",
    tags=["notifications"],
    # dependencies=[Depends(get_db_session)],
)

logged_in_dep = Annotated[DecodedJWTToken, Depends(verify_access_token)]


@router.get("/quantity", status_code=status.HTTP_200_OK, response_model=int)
async def get_notification_quantity(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    show_archived: bool = False,
) -> int:
    """Get the total number of notifications for the logged-in user.
    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.
        show_archived: Whether to include archived notifications in the count.

    Returns:
        int: The total number of notifications.
    """

    logger.info("User %s is fetching notification quantity.", token.id)

    if not await verify_user_permission("notifications:self:view", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view your own notifications.",
        )

    logger.debug("user %s fetching users quantity", token.id)
    return (
        session.exec(select(func.count(Notification.id))).one()
        if show_archived
        else session.exec(
            select(func.count(Notification.id)).where(Notification.archived is False)
        ).one()
    )


@router.get("/", response_model=list[Notification])
async def get_all_notifications(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> list[Notification]:
    """Get all notifications.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.

    Returns:
        A list of notification objects.
    """
    logger.info("User %s is fetching all notifications.", token.id)

    if not await verify_user_permission("notifications:global:view", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view notifications.",
        )

    return await internals_get_all_notifications(session=session)


@router.get("/", response_model=Notification)
async def get_notification(
    notification_id: str,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> Notification:
    """Get a specific notification by its ID.

    Args:
        notification_id: The ID of the notification to retrieve.
        token: The decoded JWT token of the logged-in user.
        session: The database session.

    Returns:
        The requested notification object.
    """
    logger.info("User %s is fetching notification %s.", token.id, notification_id)

    try:
        notification = await internals_get_notification(
            notification_id=notification_id, session=session
        )
    except NotificationNotFoundError as e:
        logger.warning(
            "Notification %s not found for user %s.", notification_id, token.id
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found.",
        ) from e

    # Check permissions based on ownership
    permission = (
        "notifications:self:view"
        if notification.ownerId == token.id
        else "notifications:global:view"
    )

    if not await verify_user_permission(permission, session, token):
        detail = (
            "You do not have permission to view your own notifications."
            if notification.ownerId == token.id
            else "You do not have permission to view this notification."
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )

    logger.debug(
        "User %s successfully retrieved notification %s.", token.id, notification_id
    )
    return notification


@router.post("/", response_model=Notification)
async def archive_notification(
    n: NotificationArchiveRequest,
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> Notification:
    """Set a notification as archived.

    Args:
        notification_id: The ID of the notification to archive.
        token: The decoded JWT token of the logged-in user.

    Returns:
        Notification: The archived notification object.
    """

    logger.info("User %s is archiving notification %s.", token.id, n.notification_id)
    try:
        selected_notification = await internals_get_notification(
            notification_id=n.notification_id, session=session
        )

    except NotificationNotFoundError as e:
        logger.warning(
            "Notification %s not found for archiving by user %s.",
            n.notification_id,
            token.id,
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found.",
        ) from e

    if not await verify_user_permission(
        (
            "notifications:self:archive"
            if selected_notification.ownerId == token.id
            else "notifications:global:archive"
        ),
        session,
        token,
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to archive this notification.",
        )

    try:
        archived_notification = await internals_archive_notification(
            notification_id=n.notification_id, session=session
        )
        logger.info(
            "Notification %s archived successfully by user %s.",
            n.notification_id,
            token.id,
        )
        return archived_notification

    except NotificationNotFoundError as e:
        logger.warning(
            "Notification %s not found for archiving by user %s.",
            n.notification_id,
            token.id,
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found.",
        ) from e


@router.get("/me", response_model=list[Notification])
async def get_user_notifications(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
) -> list[Notification]:
    """
    Get all notifications for the logged-in user.

    Args:
        token: The decoded JWT token of the logged-in user.

    Returns:
        A list of notification titles.
    """

    logger.info("User %s is fetching their own notifications.", token.id)
    if not await verify_user_permission("notifications:self:view", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view your own notifications.",
        )

    return await internals_get_user_notifications(user_id=token.id, session=session)
