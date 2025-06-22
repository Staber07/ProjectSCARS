import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from centralserver.internals.models.reports.daily_financial_report import (
    DailyFinancialReport,
    DailyFinancialReportEntry,
)
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
from centralserver.internals.models.token import DecodedJWTToken

logger = LoggerFactory().get_logger(__name__)

router = APIRouter(
    prefix="/v1/reports",
    tags=["reports"],
    dependencies=[Depends(verify_access_token)],
)

logged_in_dep = Annotated[DecodedJWTToken, Depends(verify_access_token)]


@router.get("/monthly/{school_id}")
async def get_school_monthly_reports(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
) -> list[MonthlyReport]:
    """Get all monthly reports of a school."""

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
            detail="You do not have permission to view monthly reports.",
        )

    logger.debug(
        "user `%s` requesting monthly reports of school %s.",
        token.id,
        school_id,
    )

    monthly_reports = session.exec(
        select(MonthlyReport).where(MonthlyReport.submittedBySchool == school_id)
    ).all()

    return list(monthly_reports)


@router.get("/monthly/{school_id}/{year}/{month}")
async def get_school_monthly_report(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
) -> MonthlyReport | None:
    """Get monthly reports of a school for a specific month."""

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
            detail="You do not have permission to view monthly reports.",
        )

    logger.debug(
        "user `%s` requesting monthly reports of school %s for %s-%s.",
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

    return selected_monthly_report


@router.get("/daily/{school_id}/{year}/{month}")
async def get_school_daily_report(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
) -> DailyFinancialReport | None:
    """Get daily reports of a school for a specific month with pagination."""

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
            detail="You do not have permission to view daily reports.",
        )

    logger.debug(
        "user `%s` requesting daily reports of school %s for %s-%s.",
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

    return (
        selected_monthly_report.daily_financial_report
        if selected_monthly_report
        else None
    )


@router.get("/daily/{school_id}/{year}/{month}/entries")
async def get_school_daily_report_entries(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
) -> list[DailyFinancialReportEntry]:
    """Get all daily report entries for a school for a specific month."""

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
            detail="You do not have permission to view daily report entries.",
        )

    logger.debug(
        "user `%s` requesting daily report entries of school %s for %s-%s.",
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

    logger.debug(f"{selected_monthly_report=}")
    if (
        selected_monthly_report is None
        or selected_monthly_report.daily_financial_report is None
    ):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Daily financial report not found.",
        )

    logger.debug(
        "Found %s daily financial report/s for school %s for %s-%s.",
        len(selected_monthly_report.daily_financial_report.entries),
        school_id,
        year,
        month,
    )
    return selected_monthly_report.daily_financial_report.entries


@router.patch("/monthly/{school_id}/{year}/{month}")
async def create_school_monthly_report(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
    noted_by: str,
) -> MonthlyReport:
    """Create or update a monthly report of a school for a specific month."""

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
            detail="You do not have permission to create monthly reports.",
        )

    logger.debug(
        "user `%s` creating or updating monthly report of school %s for %s-%s.",
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
            notedBy=noted_by,
        )

    session.add(selected_monthly_report)
    session.commit()
    session.refresh(selected_monthly_report)

    return selected_monthly_report


@router.patch("/daily/{school_id}/{year}/{month}")
async def create_school_daily_report(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
    noted_by: str,
) -> DailyFinancialReport:
    """Create or update a daily report of a school for a specific month."""

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
            detail="You do not have permission to create daily reports.",
        )

    logger.debug(
        "user `%s` creating or updating daily report of school %s for %s-%s.",
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
            name=f"Daily Report for {datetime.date(year=year, month=month, day=1).strftime('%B %Y')}",
            submittedBySchool=school_id,
            reportStatus=ReportStatus.DRAFT,
            preparedBy=user.id,
            notedBy=noted_by,
        )

    new_daily_report = DailyFinancialReport(
        parent=selected_monthly_report.id,
        reportStatus=ReportStatus.DRAFT,
        preparedBy=user.id,
        notedBy=noted_by,
    )

    session.add(selected_monthly_report)
    session.add(new_daily_report)
    session.commit()
    session.refresh(selected_monthly_report)
    session.refresh(new_daily_report)

    return new_daily_report


@router.patch("/daily/{school_id}/{year}/{month}/entry")
async def update_school_daily_report_entries(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
    day: int,
    sales: float,
    purchases: float,
) -> DailyFinancialReport:
    """Update daily report entries for a school for a specific month."""

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
            detail="You do not have permission to update daily report entries.",
        )

    logger.debug(
        "user `%s` updating daily report entries of school %s for %s-%s for day %s with sales %s and purchases %s.",
        token.id,
        school_id,
        year,
        month,
        day,
        sales,
        purchases,
    )
    selected_monthly_report = session.exec(
        select(MonthlyReport).where(
            MonthlyReport.id == datetime.date(year=year, month=month, day=1),
            MonthlyReport.submittedBySchool == school_id,
        )
    ).one_or_none()
    if selected_monthly_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        )

    daily_report = session.exec(
        select(DailyFinancialReport).where(
            DailyFinancialReport.parent == selected_monthly_report.id
        )
    ).one_or_none()
    if daily_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Daily financial report not found.",
        )

    entry = session.exec(
        select(DailyFinancialReportEntry).where(
            DailyFinancialReportEntry.parent == daily_report.parent,
            DailyFinancialReportEntry.day == day,
        )
    ).one_or_none()
    if entry is None:
        entry = DailyFinancialReportEntry(
            parent=daily_report.parent,
            day=day,
            sales=sales,
            purchases=purchases,
        )
        session.add(entry)
    else:
        entry.sales = sales
        entry.purchases = purchases

    session.commit()
    session.refresh(entry)
    session.refresh(daily_report)
    session.refresh(selected_monthly_report)
    return daily_report


@router.delete("/monthly/{school_id}/{year}/{month}")
async def delete_school_monthly_report(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
) -> None:
    """Delete a monthly report for a school for a specific month."""

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
            detail="You do not have permission to delete monthly reports.",
        )

    logger.debug(
        "user `%s` deleting monthly report of school %s for %s-%s.",
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        )

    session.delete(selected_monthly_report)
    session.commit()


@router.delete("/daily/{school_id}/{year}/{month}")
async def delete_school_daily_report(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
) -> None:
    """Delete a daily report for a school for a specific month."""

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
            detail="You do not have permission to delete daily reports.",
        )

    logger.debug(
        "user `%s` deleting daily report of school %s for %s-%s.",
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
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        )

    daily_report = session.exec(
        select(DailyFinancialReport).where(
            DailyFinancialReport.parent == selected_monthly_report.id
        )
    ).one_or_none()

    if daily_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Daily financial report not found.",
        )

    session.delete(daily_report)
    session.commit()


@router.delete("/daily/{school_id}/{year}/{month}/entry")
async def delete_school_daily_report_entry(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
    day: int,
) -> None:
    """Delete a daily report entry for a school for a specific month."""

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
            detail="You do not have permission to delete daily report entries.",
        )

    logger.debug(
        "user `%s` deleting daily report entry of school %s for %s-%s for day %s.",
        token.id,
        school_id,
        year,
        month,
        day,
    )

    selected_monthly_report = session.exec(
        select(MonthlyReport).where(
            MonthlyReport.id == datetime.date(year=year, month=month, day=1),
            MonthlyReport.submittedBySchool == school_id,
        )
    ).one_or_none()

    if selected_monthly_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        )

    daily_report = session.exec(
        select(DailyFinancialReport).where(
            DailyFinancialReport.parent == selected_monthly_report.id
        )
    ).one_or_none()

    if daily_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Daily financial report not found.",
        )

    entry = session.exec(
        select(DailyFinancialReportEntry).where(
            DailyFinancialReportEntry.parent == daily_report.parent,
            DailyFinancialReportEntry.day == day,
        )
    ).one_or_none()

    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Daily financial report entry not found.",
        )

    session.delete(entry)
    session.commit()
