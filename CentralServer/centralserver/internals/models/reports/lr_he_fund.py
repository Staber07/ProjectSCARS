import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from centralserver.internals.models.reports.report_status import ReportStatus

if TYPE_CHECKING:
    from centralserver.internals.models.reports.monthly_report import MonthlyReport


class LiquidationReportHEFund(SQLModel, table=True):
    __tablename__: str = "liquidationReportHEFund"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    certified_by: list["LiquidationReportHEFundCertifiedBy"] = Relationship(
        back_populates="parent_report"
    )
    notedBy: str = Field(foreign_key="users.id")
    preparedBy: str = Field(foreign_key="users.id")
    teacherInCharge: str = Field(foreign_key="users.id")
    reportStatus: ReportStatus = Field(
        default=ReportStatus.DRAFT,
        description="The status of the report.",
    )

    entries: list["LiquidationReportHEFundEntry"] = Relationship(
        back_populates="parent_report"
    )
    parent_report: "MonthlyReport" = Relationship(back_populates="he_fund_report")


class LiquidationReportHEFundCertifiedBy(SQLModel, table=True):
    """A model representing the liquidation (HE Fund) reports."""

    __tablename__: str = "liquidationReportHEFundCertifiedBy"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportHEFund.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: LiquidationReportHEFund = Relationship(back_populates="certified_by")


class LiquidationReportHEFundEntry(SQLModel, table=True):
    __tablename__: str = "liquidationReportHEFundEntries"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportHEFund.parent",
    )
    date: datetime.datetime
    receipt: str
    particulars: str
    unit: str
    quantity: float
    unit_price: float

    parent_report: LiquidationReportHEFund = Relationship(back_populates="entries")
