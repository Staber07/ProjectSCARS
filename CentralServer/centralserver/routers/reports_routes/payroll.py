# pylint: disable=C0302
import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import NoResultFound
from sqlmodel import Session, select

from centralserver.internals.auth_handler import (
    get_user,
    verify_access_token,
    verify_user_permission,
)
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models.reports.monthly_report import (
    MonthlyReport,
    ReportStatus,
)
from centralserver.internals.models.reports.payroll_report import (
    PayrollReport,
    PayrollReportEntry,
    PayrollReportNotedBy,
)
from centralserver.internals.models.token import DecodedJWTToken

logger = LoggerFactory().get_logger(__name__)
router = APIRouter(prefix="/payroll")
logged_in_dep = Annotated[DecodedJWTToken, Depends(verify_access_token)]


@router.get("/{school_id}/{year}/{month}")
async def get_school_payroll_report(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
) -> PayrollReport:
    """Get payroll report of a school for a specific month.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.
        school_id: The ID of the school to get reports for.
        year: The year of the report.
        month: The month of the report.

    Returns:
        The payroll report for the specified school, year, and month.

    Raises:
        HTTPException: If the user is not found, lacks permission, or the report is not found.
    """

    user = await get_user(token.id, session, by_id=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    required_permission = (
        "reports:local:read" if user.schoolId == school_id else "reports:global:read"
    )
    logger.debug("Required permission for user %s: %s", token.id, required_permission)
    if not await verify_user_permission(required_permission, session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view payroll reports.",
        )

    logger.debug(
        "user `%s` requesting payroll report of school %s for %s-%s.",
        token.id,
        school_id,
        year,
        month,
    )
    try:
        selected_monthly_report = session.exec(
            select(MonthlyReport).where(
                MonthlyReport.id == datetime.date(year=year, month=month, day=1),
                MonthlyReport.submittedBySchool == school_id,
            )
        ).one()
        if selected_monthly_report.payroll_report is not None:
            return selected_monthly_report.payroll_report

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll report not found.",
        )

    except NoResultFound as e:
        logger.warning(
            "Payroll report not found for school %s for %s-%s",
            school_id,
            year,
            month,
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll report not found.",
        ) from e


@router.get("/{school_id}/{year}/{month}/entries")
async def get_school_payroll_report_entries(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
) -> list[PayrollReportEntry]:
    """Get all payroll report entries for a school for a specific month.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.
        school_id: The ID of the school to get reports for.
        year: The year of the report.
        month: The month of the report.

    Returns:
        A list of payroll report entries for the specified school, year, and month.

    Raises:
        HTTPException: If the user is not found, lacks permission, or the report is not found.
    """

    user = await get_user(token.id, session, by_id=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    required_permission = (
        "reports:local:read" if user.schoolId == school_id else "reports:global:read"
    )
    if not await verify_user_permission(required_permission, session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view payroll report entries.",
        )

    logger.debug(
        "user `%s` requesting payroll report entries of school %s for %s-%s.",
        token.id,
        school_id,
        year,
        month,
    )

    try:
        selected_monthly_report = session.exec(
            select(MonthlyReport).where(
                MonthlyReport.id == datetime.date(year=year, month=month, day=1),
                MonthlyReport.submittedBySchool == school_id,
            )
        ).one()

    except NoResultFound as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        ) from e

    payroll_report = selected_monthly_report.payroll_report
    if payroll_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll report not found.",
        )

    return list(payroll_report.entries)


@router.get("/{school_id}/{year}/{month}/noted-by")
async def get_school_payroll_report_noted_by(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
) -> list[PayrollReportNotedBy]:
    """Get all payroll report noted-by entries for a school for a specific month.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.
        school_id: The ID of the school to get reports for.
        year: The year of the report.
        month: The month of the report.

    Returns:
        A list of payroll report noted-by entries for the specified school, year, and month.

    Raises:
        HTTPException: If the user is not found, lacks permission, or the report is not found.
    """

    user = await get_user(token.id, session, by_id=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    required_permission = (
        "reports:local:read" if user.schoolId == school_id else "reports:global:read"
    )
    if not await verify_user_permission(required_permission, session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view payroll report noted-by entries.",
        )

    logger.debug(
        "user `%s` requesting payroll report noted-by entries of school %s for %s-%s.",
        token.id,
        school_id,
        year,
        month,
    )

    try:
        selected_monthly_report = session.exec(
            select(MonthlyReport).where(
                MonthlyReport.id == datetime.date(year=year, month=month, day=1),
                MonthlyReport.submittedBySchool == school_id,
            )
        ).one()

    except NoResultFound as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        ) from e

    payroll_report = selected_monthly_report.payroll_report
    if payroll_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll report not found.",
        )

    return list(payroll_report.noted_by)


@router.patch("/{school_id}/{year}/{month}")
async def create_school_payroll_report(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
) -> PayrollReport:
    """Create or update a payroll report of a school for a specific month.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.
        school_id: The ID of the school to create or update the report for.
        year: The year of the report.
        month: The month of the report.

    Returns:
        The created or updated payroll report.

    Raises:
        HTTPException: If the user is not found or lacks permission.
    """

    user = await get_user(token.id, session, by_id=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    required_permission = (
        "reports:local:write" if user.schoolId == school_id else "reports:global:write"
    )
    logger.debug("Required permission for user %s: %s", token.id, required_permission)
    if not await verify_user_permission(required_permission, session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create payroll reports.",
        )

    logger.debug(
        "user `%s` creating or updating payroll report of school %s for %s-%s.",
        token.id,
        school_id,
        year,
        month,
    )

    selected_monthly_report = session.exec(
        select(MonthlyReport).where(
            MonthlyReport.id == datetime.date(year=year, month=month, day=1),
            MonthlyReport.submittedBySchool == school_id,
        )
    ).one_or_none()
    if selected_monthly_report is None:
        selected_monthly_report = MonthlyReport(
            id=datetime.date(year=year, month=month, day=1),
            name=f"Monthly Report for {datetime.date(year=year, month=month, day=1).strftime('%B %Y')}",
            submittedBySchool=school_id,
            reportStatus=ReportStatus.DRAFT,
            preparedBy=user.id,
        )

    new_payroll_report = PayrollReport(
        parent=selected_monthly_report.id,
    )

    session.add(selected_monthly_report)
    session.add(new_payroll_report)
    session.commit()
    session.refresh(selected_monthly_report)
    session.refresh(new_payroll_report)
    return new_payroll_report


@router.post("/{school_id}/{year}/{month}/entries")
async def create_payroll_report_entry(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
    week_number: int,
    employee_id: str,
    employee_name: str,
    mon: float = 0.0,
    tue: float = 0.0,
    wed: float = 0.0,
    thu: float = 0.0,
    fri: float = 0.0,
    total: float = 0.0,
    signature: str | None = None,
) -> PayrollReportEntry:
    """Create a new payroll report entry for a school for a specific month.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.
        school_id: The ID of the school to create the entry for.
        year: The year of the report.
        month: The month of the report.
        week_number: The week number in the month.
        employee_id: The employee identifier.
        employee_name: The employee name.
        mon: Amount received on Monday.
        tue: Amount received on Tuesday.
        wed: Amount received on Wednesday.
        thu: Amount received on Thursday.
        fri: Amount received on Friday.
        total: Total amount received for the week.
        signature: Signature or reference.

    Returns:
        The created payroll report entry.

    Raises:
        HTTPException: If the user is not found, lacks permission, or the report is not found.
    """

    user = await get_user(token.id, session, by_id=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    required_permission = (
        "reports:local:write" if user.schoolId == school_id else "reports:global:write"
    )
    if not await verify_user_permission(required_permission, session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create payroll report entries.",
        )

    logger.debug(
        "user `%s` creating payroll report entry for school %s for %s-%s, week %s, employee %s.",
        token.id,
        school_id,
        year,
        month,
        week_number,
        employee_id,
    )

    # Ensure the payroll report exists
    try:
        selected_monthly_report = session.exec(
            select(MonthlyReport).where(
                MonthlyReport.id == datetime.date(year=year, month=month, day=1),
                MonthlyReport.submittedBySchool == school_id,
            )
        ).one()

    except NoResultFound as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        ) from e

    payroll_report = selected_monthly_report.payroll_report
    if payroll_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll report not found. Create the payroll report first.",
        )

    # Check if entry already exists (composite primary key)
    existing_entry = session.exec(
        select(PayrollReportEntry).where(
            PayrollReportEntry.parent == payroll_report.parent,
            PayrollReportEntry.week_number == week_number,
            PayrollReportEntry.employee_id == employee_id,
        )
    ).one_or_none()

    if existing_entry:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Payroll entry for week {week_number} and employee {employee_id} already exists.",
        )

    # Calculate total if not provided or incorrect
    calculated_total = mon + tue + wed + thu + fri
    if total == 0.0 or abs(total - calculated_total) > 0.01:
        total = calculated_total

    new_entry = PayrollReportEntry(
        parent=payroll_report.parent,
        week_number=week_number,
        employee_id=employee_id,
        employee_name=employee_name,
        mon=mon,
        tue=tue,
        wed=wed,
        thu=thu,
        fri=fri,
        total=total,
        signature=signature,
    )

    session.add(new_entry)
    session.commit()
    session.refresh(new_entry)
    return new_entry


@router.put("/{school_id}/{year}/{month}/entries/{week_number}/{employee_id}")
async def update_payroll_report_entry(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
    week_number: int,
    employee_id: str,
    employee_name: str | None = None,
    mon: float | None = None,
    tue: float | None = None,
    wed: float | None = None,
    thu: float | None = None,
    fri: float | None = None,
    signature: str | None = None,
) -> PayrollReportEntry:
    """Update an existing payroll report entry for a school for a specific month.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.
        school_id: The ID of the school to update the entry for.
        year: The year of the report.
        month: The month of the report.
        week_number: The week number in the month.
        employee_id: The employee identifier.
        employee_name: The employee name (optional).
        mon: Amount received on Monday (optional).
        tue: Amount received on Tuesday (optional).
        wed: Amount received on Wednesday (optional).
        thu: Amount received on Thursday (optional).
        fri: Amount received on Friday (optional).
        signature: Signature or reference (optional).

    Returns:
        The updated payroll report entry.

    Raises:
        HTTPException: If the user is not found, lacks permission, or the entry is not found.
    """

    user = await get_user(token.id, session, by_id=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    required_permission = (
        "reports:local:write" if user.schoolId == school_id else "reports:global:write"
    )
    if not await verify_user_permission(required_permission, session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update payroll report entries.",
        )

    logger.debug(
        "user `%s` updating payroll report entry for school %s for %s-%s, week %s, employee %s.",
        token.id,
        school_id,
        year,
        month,
        week_number,
        employee_id,
    )

    # Find the existing entry
    try:
        selected_monthly_report = session.exec(
            select(MonthlyReport).where(
                MonthlyReport.id == datetime.date(year=year, month=month, day=1),
                MonthlyReport.submittedBySchool == school_id,
            )
        ).one()

    except NoResultFound as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        ) from e

    payroll_report = selected_monthly_report.payroll_report
    if payroll_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll report not found.",
        )

    existing_entry = session.exec(
        select(PayrollReportEntry).where(
            PayrollReportEntry.parent == payroll_report.parent,
            PayrollReportEntry.week_number == week_number,
            PayrollReportEntry.employee_id == employee_id,
        )
    ).one_or_none()

    if not existing_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payroll entry for week {week_number} and employee {employee_id} not found.",
        )

    # Update only the provided fields
    if employee_name is not None:
        existing_entry.employee_name = employee_name
    if mon is not None:
        existing_entry.mon = mon
    if tue is not None:
        existing_entry.tue = tue
    if wed is not None:
        existing_entry.wed = wed
    if thu is not None:
        existing_entry.thu = thu
    if fri is not None:
        existing_entry.fri = fri
    if signature is not None:
        existing_entry.signature = signature

    # Recalculate total
    existing_entry.total = (
        existing_entry.mon
        + existing_entry.tue
        + existing_entry.wed
        + existing_entry.thu
        + existing_entry.fri
    )

    session.add(existing_entry)
    session.commit()
    session.refresh(existing_entry)
    return existing_entry


@router.delete("/{school_id}/{year}/{month}/entries/{week_number}/{employee_id}")
async def delete_payroll_report_entry(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
    week_number: int,
    employee_id: str,
) -> dict[str, str]:
    """Delete a payroll report entry for a school for a specific month.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.
        school_id: The ID of the school to delete the entry for.
        year: The year of the report.
        month: The month of the report.
        week_number: The week number in the month.
        employee_id: The employee identifier.

    Returns:
        A confirmation message.

    Raises:
        HTTPException: If the user is not found, lacks permission, or the entry is not found.
    """

    user = await get_user(token.id, session, by_id=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    required_permission = (
        "reports:local:write" if user.schoolId == school_id else "reports:global:write"
    )
    if not await verify_user_permission(required_permission, session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete payroll report entries.",
        )

    logger.debug(
        "user `%s` deleting payroll report entry for school %s for %s-%s, week %s, employee %s.",
        token.id,
        school_id,
        year,
        month,
        week_number,
        employee_id,
    )

    # Find the existing entry
    try:
        selected_monthly_report = session.exec(
            select(MonthlyReport).where(
                MonthlyReport.id == datetime.date(year=year, month=month, day=1),
                MonthlyReport.submittedBySchool == school_id,
            )
        ).one()

    except NoResultFound as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        ) from e

    payroll_report = selected_monthly_report.payroll_report
    if payroll_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll report not found.",
        )

    existing_entry = session.exec(
        select(PayrollReportEntry).where(
            PayrollReportEntry.parent == payroll_report.parent,
            PayrollReportEntry.week_number == week_number,
            PayrollReportEntry.employee_id == employee_id,
        )
    ).one_or_none()

    if not existing_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Payroll entry for week {week_number} and employee {employee_id} not found.",
        )

    session.delete(existing_entry)
    session.commit()
    return {
        "message": f"Payroll entry for week {week_number} and employee {employee_id} deleted successfully."
    }


@router.post("/{school_id}/{year}/{month}/noted-by")
async def create_payroll_report_noted_by(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
    name: str,
    position: str,
    date: datetime.date | None = None,
) -> PayrollReportNotedBy:
    """Create a new payroll report noted-by entry for a school for a specific month.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.
        school_id: The ID of the school to create the noted-by entry for.
        year: The year of the report.
        month: The month of the report.
        name: The name of the person noting the report.
        position: The position of the person noting the report.
        date: The date when the report was noted (optional).

    Returns:
        The created payroll report noted-by entry.

    Raises:
        HTTPException: If the user is not found, lacks permission, or the report is not found.
    """

    user = await get_user(token.id, session, by_id=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    required_permission = (
        "reports:local:write" if user.schoolId == school_id else "reports:global:write"
    )
    if not await verify_user_permission(required_permission, session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to create payroll report noted-by entries.",
        )

    logger.debug(
        "user `%s` creating payroll report noted-by entry for school %s for %s-%s with name %s.",
        token.id,
        school_id,
        year,
        month,
        name,
    )

    # Ensure the payroll report exists
    try:
        selected_monthly_report = session.exec(
            select(MonthlyReport).where(
                MonthlyReport.id == datetime.date(year=year, month=month, day=1),
                MonthlyReport.submittedBySchool == school_id,
            )
        ).one()

    except NoResultFound as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        ) from e

    payroll_report = selected_monthly_report.payroll_report
    if payroll_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll report not found. Create the payroll report first.",
        )

    # Check if noted-by entry already exists for this person
    existing_noted_by = session.exec(
        select(PayrollReportNotedBy).where(
            PayrollReportNotedBy.parent == payroll_report.parent,
            PayrollReportNotedBy.name == name,
        )
    ).one_or_none()

    if existing_noted_by:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Noted-by entry for {name} already exists.",
        )

    new_noted_by = PayrollReportNotedBy(
        parent=payroll_report.parent,
        name=name,
        position=position,
        date=date,
    )

    session.add(new_noted_by)
    session.commit()
    session.refresh(new_noted_by)
    return new_noted_by


@router.put("/{school_id}/{year}/{month}/noted-by/{name}")
async def update_payroll_report_noted_by(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
    name: str,
    position: str | None = None,
    date: datetime.date | None = None,
) -> PayrollReportNotedBy:
    """Update an existing payroll report noted-by entry for a school for a specific month.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.
        school_id: The ID of the school to update the noted-by entry for.
        year: The year of the report.
        month: The month of the report.
        name: The name of the person noting the report.
        position: The position of the person noting the report (optional).
        date: The date when the report was noted (optional).

    Returns:
        The updated payroll report noted-by entry.

    Raises:
        HTTPException: If the user is not found, lacks permission, or the entry is not found.
    """

    user = await get_user(token.id, session, by_id=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    required_permission = (
        "reports:local:write" if user.schoolId == school_id else "reports:global:write"
    )
    if not await verify_user_permission(required_permission, session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update payroll report noted-by entries.",
        )

    logger.debug(
        "user `%s` updating payroll report noted-by entry for school %s for %s-%s with name %s.",
        token.id,
        school_id,
        year,
        month,
        name,
    )

    # Find the existing noted-by entry
    try:
        selected_monthly_report = session.exec(
            select(MonthlyReport).where(
                MonthlyReport.id == datetime.date(year=year, month=month, day=1),
                MonthlyReport.submittedBySchool == school_id,
            )
        ).one()

    except NoResultFound as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        ) from e

    payroll_report = selected_monthly_report.payroll_report
    if payroll_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll report not found.",
        )

    existing_noted_by = session.exec(
        select(PayrollReportNotedBy).where(
            PayrollReportNotedBy.parent == payroll_report.parent,
            PayrollReportNotedBy.name == name,
        )
    ).one_or_none()

    if not existing_noted_by:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Noted-by entry for {name} not found.",
        )

    # Update only the provided fields
    if position is not None:
        existing_noted_by.position = position
    if date is not None:
        existing_noted_by.date = date

    session.add(existing_noted_by)
    session.commit()
    session.refresh(existing_noted_by)
    return existing_noted_by


@router.delete("/{school_id}/{year}/{month}/noted-by/{name}")
async def delete_payroll_report_noted_by(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
    name: str,
) -> dict[str, str]:
    """Delete a payroll report noted-by entry for a school for a specific month.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.
        school_id: The ID of the school to delete the noted-by entry for.
        year: The year of the report.
        month: The month of the report.
        name: The name of the person noting the report.

    Returns:
        A confirmation message.

    Raises:
        HTTPException: If the user is not found, lacks permission, or the entry is not found.
    """

    user = await get_user(token.id, session, by_id=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    required_permission = (
        "reports:local:write" if user.schoolId == school_id else "reports:global:write"
    )
    if not await verify_user_permission(required_permission, session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete payroll report noted-by entries.",
        )

    logger.debug(
        "user `%s` deleting payroll report noted-by entry for school %s for %s-%s with name %s.",
        token.id,
        school_id,
        year,
        month,
        name,
    )

    # Find the existing noted-by entry
    try:
        selected_monthly_report = session.exec(
            select(MonthlyReport).where(
                MonthlyReport.id == datetime.date(year=year, month=month, day=1),
                MonthlyReport.submittedBySchool == school_id,
            )
        ).one()

    except NoResultFound as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        ) from e

    payroll_report = selected_monthly_report.payroll_report
    if payroll_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll report not found.",
        )

    existing_noted_by = session.exec(
        select(PayrollReportNotedBy).where(
            PayrollReportNotedBy.parent == payroll_report.parent,
            PayrollReportNotedBy.name == name,
        )
    ).one_or_none()

    if not existing_noted_by:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Noted-by entry for {name} not found.",
        )

    session.delete(existing_noted_by)
    session.commit()
    return {"message": f"Noted-by entry for {name} deleted successfully."}


@router.delete("/{school_id}/{year}/{month}")
async def delete_school_payroll_report(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
) -> dict[str, str]:
    """Delete a payroll report for a school for a specific month.

    Args:
        token: The decoded JWT token of the logged-in user.
        session: The database session.
        school_id: The ID of the school to delete the report for.
        year: The year of the report.
        month: The month of the report.

    Returns:
        A confirmation message.

    Raises:
        HTTPException: If the user is not found, lacks permission, or the report is not found.
    """

    user = await get_user(token.id, session, by_id=True)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )

    required_permission = (
        "reports:local:write" if user.schoolId == school_id else "reports:global:write"
    )
    if not await verify_user_permission(required_permission, session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete payroll reports.",
        )

    logger.debug(
        "user `%s` deleting payroll report of school %s for %s-%s.",
        token.id,
        school_id,
        year,
        month,
    )

    try:
        selected_monthly_report = session.exec(
            select(MonthlyReport).where(
                MonthlyReport.id == datetime.date(year=year, month=month, day=1),
                MonthlyReport.submittedBySchool == school_id,
            )
        ).one()

    except NoResultFound as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        ) from e

    payroll_report = selected_monthly_report.payroll_report
    if payroll_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payroll report not found.",
        )

    session.delete(payroll_report)
    session.commit()
    return {"message": "Payroll report deleted successfully."}
