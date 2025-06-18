import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from centralserver.internals.models.reports.report_status import ReportStatus

if TYPE_CHECKING:
    from centralserver.internals.models.reports.monthly_report import MonthlyReport


class DailyFinancialReport(SQLModel, table=True):
    """A model representing the daily sales and purchases report.

    Document Name: Financial Report for the Month of [MONTH], [YEAR]
    """

    __tablename__: str = "dailyFinancialReports"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="monthlyReports.id",
    )
    reportStatus: ReportStatus = Field(
        default=ReportStatus.DRAFT,
        description="The status of the report.",
    )
    preparedBy: str = Field(foreign_key="users.id")
    notedBy: str = Field(foreign_key="users.id")

    parent_report: "MonthlyReport" = Relationship(
        back_populates="daily_financial_report"
    )
    entries: list["DailyFinancialReportEntry"] = Relationship(
        back_populates="parent_report"
    )


class DailyFinancialReportEntry(SQLModel, table=True):
    """A model representing an entry in the daily sales and purchases report."""

    __tablename__: str = "dailyFinancialReportsEntries"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="dailyFinancialReports.parent"
    )
    day: int  # The day of the month (1-31, depending on the month)
    sales: float  # Positive float representing the total sales for the day
    purchases: float  # Positive float representing the total purchases for the day

    parent_report: DailyFinancialReport = Relationship(back_populates="entries")
