import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from centralserver.internals.models.reports.monthly_report import MonthlyReport


class LiquidationReportSchoolOperationFund(SQLModel, table=True):
    """A model representing the liquidation (School Operation Fund) reports."""

    __tablename__: str = "liquidationReportSchoolOperationFund"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    notedBy: str = Field(foreign_key="users.id")
    preparedBy: str = Field(foreign_key="users.id")
    teacherInCharge: str = Field(foreign_key="users.id")

    certified_by: list["SchoolOperationFundCertifiedBy"] = Relationship(
        back_populates="parent_report"
    )
    entries: list["SchoolOperationFundEntry"] = Relationship(
        back_populates="parent_report"
    )
    parent_report: "MonthlyReport" = Relationship(
        back_populates="school_operation_fund_report"
    )


class SchoolOperationFundCertifiedBy(SQLModel, table=True):
    """A model representing the liquidation (School Operation Fund) reports."""

    __tablename__: str = "liquidationReportSchoolOperationFundCertifiedBy"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportSchoolOperationFund.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: LiquidationReportSchoolOperationFund = Relationship(
        back_populates="certified_by"
    )


class SchoolOperationFundEntry(SQLModel, table=True):
    __tablename__: str = "liquidationReportSchoolOperationFundEntries"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportSchoolOperationFund.parent",
    )
    date: datetime.datetime
    receipt: str
    particulars: str
    unit: str
    quantity: float
    unitPrice: float

    parent_report: LiquidationReportSchoolOperationFund = Relationship(
        back_populates="entries"
    )
