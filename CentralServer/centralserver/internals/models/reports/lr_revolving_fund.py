import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from centralserver.internals.models.reports.monthly_report import MonthlyReport


class LiquidationReportRevolvingFund(SQLModel, table=True):
    """A model representing the liquidation (Revolving Fund) reports."""

    __tablename__: str = "liquidationReportRevolvingFund"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    notedby: str = Field(foreign_key="users.id")
    preparedby: str = Field(foreign_key="users.id")
    teacherInCharge: str = Field(foreign_key="users.id")

    entries: list["RevolvingFundEntry"] = Relationship(back_populates="parent_report")
    parent_report: "MonthlyReport" = Relationship(
        back_populates="revolving_fund_report"
    )


class RevolvingFundCertifiedBy(SQLModel, table=True):
    """A model representing the "Certified By" field in the operating expenses report."""

    __tablename__: str = "liquidationReportRevolvingFundCertifiedBy"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportRevolvingFund.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: LiquidationReportRevolvingFund = Relationship(
        back_populates="certified_by"
    )


class RevolvingFundEntry(SQLModel, table=True):
    __tablename__: str = "liquidationReportRevolvingFundEntries"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportRevolvingFund.parent",
    )
    date: datetime.datetime
    receipt: str
    particulars: str
    unit: str
    quantity: float
    unitPrice: float

    parent_report: "LiquidationReportRevolvingFund" = Relationship(
        back_populates="entries"
    )
