from sqlmodel import Session, select

from centralserver.internals.exceptions import NotificationNotFoundError
from centralserver.internals.models.notification import Notification, NotificationType


async def get_all_notifications(
    session: Session, important_only: bool = False
) -> list[Notification]:
    """Retrieve all notifications from the database.

    Args:
        session: The SQLAlchemy session to use for the query.
        important_only: If True, only retrieve important notifications.

    Returns:
        A list of all notifications.
    """

    return (
        list(
            session.exec(
                select(Notification).where(Notification.important is True)
            ).all()
        )
        if important_only
        else list(session.exec(select(Notification)).all())
    )


async def get_user_notifications(
    user_id: str, session: Session, important_only: bool = False
) -> list[Notification]:
    """Retrieve all notifications for a specific user.

    Args:
        user_id: The ID of the user whose notifications are to be retrieved.
        session: The SQLAlchemy session to use for the query.
        important_only: If True, only retrieve important notifications.

    Returns:
        A list of notifications for the specified user.
    """

    if important_only:
        return list(
            session.exec(
                select(Notification).where(
                    Notification.ownerId == user_id and Notification.important is True
                )
            ).all()
        )
    else:
        return list(
            session.exec(
                select(Notification).where(Notification.ownerId == user_id)
            ).all()
        )


async def get_notification(notification_id: str, session: Session) -> Notification:
    """Retrieve a specific notification by its ID.

    Args:
        notification_id: The ID of the notification to retrieve.
        session: The SQLAlchemy session to use for the query.

    Returns:
        The notification object if found, otherwise None.
    """

    notification = session.get(Notification, notification_id)
    if notification is None:
        raise NotificationNotFoundError(
            f"Notification with ID {notification_id} not found."
        )

    return notification


async def push_notification(
    owner_id: str,
    title: str,
    content: str,
    session: Session,
    important: bool = False,
    notification_type: NotificationType = NotificationType.INFO,
):
    """Create and store a new notification in the database.

    Args:
        owner_id: The ID of the user who will own the notification.
        title: The title of the notification.
        content: The content of the notification.
        session: The SQLAlchemy session to use for the operation.
        important: Whether the notification is important (default is False).
        type: The type of the notification.

    Returns:
        The created notification object.
    """

    notification = Notification(
        ownerId=owner_id,
        title=title,
        content=content,
        important=important,
        type=notification_type,
    )
    session.add(notification)
    session.commit()
    session.refresh(notification)


async def archive_notification(
    notification_id: str,
    session: Session,
    unarchive: bool = False,
) -> Notification:
    """Set a notification as archived (or unarchived).

    Args:
        notification_id: The ID of the notification to delete.
        session: The SQLAlchemy session to use for the operation.
        unarchive: If True, the notification will be unarchived instead of archived.

    Returns:
        The deleted notification object if found, otherwise None.
    """

    notification = await get_notification(notification_id, session)
    notification.archived = False if unarchive else True
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification
