import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from centralserver.internals.auth_handler import (
    get_user,
    verify_access_token,
    verify_user_permission,
)
from centralserver.internals.db_handler import get_db_session
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models.reports.daily_financial_report import (
    DailyFinancialReport,
    DailyFinancialReportEntry,
)
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


@router.get("/monthly")
async def get_all_monthly_reports(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    offset: int = 0,
    limit: int = 10,
) -> list[MonthlyReport]:
    """Get all monthly reports with pagination."""

    if not await verify_user_permission("reports:global:read", session, token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view monthly reports.",
        )

    logger.debug(
        "user `%s` requesting monthly reports of all schools with offset %s and limit %s.",
        token.id,
        offset,
        limit,
    )

    return list(session.exec(select(MonthlyReport).offset(offset).limit(limit)).all())


@router.get("/monthly/{school_id}")
async def get_school_monthly_reports(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    offset: int = 0,
    limit: int = 10,
) -> list[MonthlyReport]:
    """Get monthly reports of a specific school with pagination."""

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
        "user `%s` requesting monthly reports of school %s with offset %s and limit %s.",
        token.id,
        school_id,
        offset,
        limit,
    )

    return list(
        session.exec(
            select(MonthlyReport)
            .where(MonthlyReport.submittedBySchool == school_id)
            .offset(offset)
            .limit(limit)
        ).all()
    )


@router.get("/monthly/{school_id}/{year}/{month}")
async def get_school_monthly_report(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
    offset: int = 0,
    limit: int = 10,
) -> MonthlyReport:
    """Get monthly reports of a school with pagination."""

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
        "user `%s` requesting monthly reports of school %s with offset %s and limit %s.",
        token.id,
        school_id,
        offset,
        limit,
    )

    report = session.exec(
        select(MonthlyReport).where(
            MonthlyReport.id == datetime.date(year=year, month=month, day=1)
        )
    ).one_or_none()

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        )

    return report


@router.put("/monthly/{school_id}/{year}/{month}")
async def create_school_monthly_report(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
    name: str | None = None,
) -> MonthlyReport:
    """Create a monthly report of a school."""

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
        "user `%s` creating monthly report of school %s for %s-%s.",
        token.id,
        school_id,
        year,
        month,
    )

    report = session.exec(
        select(MonthlyReport).where(
            MonthlyReport.id == datetime.date(year=year, month=month, day=1)
        )
    ).one_or_none()

    if report is not None:
        logger.debug(
            "Monthly report for %s-%s already exists.",
            year,
            month,
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Monthly report for this month already exists.",
        )

    report = MonthlyReport(
        id=datetime.date(year=year, month=month, day=1),
        name=name,
        submittedBySchool=school_id,
        reportStatus=ReportStatus.DRAFT,
        preparedBy=user.id,
        lastModified=datetime.datetime.now(),
    )

    session.add(report)
    session.commit()
    session.refresh(report)

    return report


@router.get("/daily/{school_id}")
async def get_school_daily_financial_reports(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    offset: int = 0,
    limit: int = 10,
) -> list[DailyFinancialReport]:
    """Get daily financial reports of a specific school with pagination."""

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
            detail="You do not have permission to view daily financial reports.",
        )

    logger.debug(
        "user `%s` requesting daily financial reports of school %s with offset %s and limit %s.",
        token.id,
        school_id,
        offset,
        limit,
    )

    return list(
        session.exec(
            select(DailyFinancialReport)
            .where(DailyFinancialReport.parent_report.submittedBySchool == school_id)
            .offset(offset)
            .limit(limit)
        ).all()
    )


@router.get("/daily/{school_id}/{year}/{month}")
async def get_school_daily_financial_report(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
) -> tuple[DailyFinancialReport, list[DailyFinancialReportEntry]]:
    """Get daily financial report of a school for a specific month."""

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
            detail="You do not have permission to view daily financial reports.",
        )

    logger.debug(
        "user `%s` requesting daily financial report of school %s for %s-%s.",
        token.id,
        school_id,
        year,
        month,
    )

    report = session.exec(
        select(DailyFinancialReport).where(
            DailyFinancialReport.parent == datetime.date(year=year, month=month, day=1),
            DailyFinancialReport.parent_report.submittedBySchool == school_id,
        )
    ).one_or_none()

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Daily financial report not found.",
        )

    return (report, list(report.entries))


@router.put("/daily/{school_id}/{year}/{month}")
async def create_school_daily_financial_report(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
) -> DailyFinancialReport:
    """Create a daily financial report for a school for a specific month."""

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
            detail="You do not have permission to create daily financial reports.",
        )

    logger.debug(
        "user `%s` creating daily financial report of school %s for %s-%s.",
        token.id,
        school_id,
        year,
        month,
    )

    report = session.exec(
        select(DailyFinancialReport).where(
            DailyFinancialReport.parent == datetime.date(year=year, month=month, day=1),
            DailyFinancialReport.parent_report.submittedBySchool == school_id,
        )
    ).one_or_none()

    if report is not None:
        logger.debug(
            "Daily financial report for %s-%s already exists.",
            year,
            month,
        )
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Daily financial report for this month already exists.",
        )

    monthly_report = session.exec(
        select(MonthlyReport).where(
            MonthlyReport.id == datetime.date(year=year, month=month, day=1),
            MonthlyReport.submittedBySchool == school_id,
        )
    ).one_or_none()

    if monthly_report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Monthly report not found.",
        )

    report = DailyFinancialReport(
        parent=datetime.date(year=year, month=month, day=1),
        preparedBy=user.id,
        notedBy=user.id,
        parent_report=monthly_report,
    )

    session.add(report)
    session.commit()
    session.refresh(report)

    return report


@router.put("/daily/{school_id}/{year}/{month}/add")
async def add_daily_financial_report_entry(
    token: logged_in_dep,
    session: Annotated[Session, Depends(get_db_session)],
    school_id: int,
    year: int,
    month: int,
    day: int,
    entry: DailyFinancialReportEntry,
) -> DailyFinancialReport:
    """Add an entry to a daily financial report for a school for a specific month."""

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
            detail="You do not have permission to add entries to daily financial reports.",
        )

    parent_report = session.exec(
        select(MonthlyReport).where(
            MonthlyReport.id == datetime.date(year=year, month=month, day=1),
            MonthlyReport.submittedBySchool == school_id,
        )
    ).one_or_none()
    if parent_report is None:
        # If the parent report does not exist, create it
        parent_report = MonthlyReport(
            id=datetime.date(year=year, month=month, day=1),
            submittedBySchool=school_id,
            reportStatus=ReportStatus.DRAFT,
            preparedBy=user.id,
            lastModified=datetime.datetime.now(),
        )
        session.add(parent_report)

    else:
        if parent_report.reportStatus != ReportStatus.DRAFT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot add entries to a submitted report.",
            )

    logger.debug(
        "user `%s` adding entry to daily financial report of school %s for %s-%s.",
        token.id,
        school_id,
        year,
        month,
    )

    report = session.exec(
        select(DailyFinancialReport).where(
            DailyFinancialReport.parent == datetime.date(year=year, month=month, day=1),
            DailyFinancialReport.parent_report.submittedBySchool == school_id,
        )
    ).one_or_none()

    if report is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Daily financial report not found.",
        )

    if report.reportStatus != ReportStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot add entries to a submitted report.",
        )

    entry.date = datetime.date(year=year, month=month, day=day)
    entry.preparedBy = user.id
    entry.notedBy = user.id
    report.entries.append(entry)
    session.add(entry)
    session.commit()
    session.refresh(report)
    session.refresh(entry)
    logger.debug(
        "Entry added to daily financial report for %s-%s: %s",
        year,
        month,
        entry,
    )
    return report
