import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from centralserver.internals.models.reports.monthly_report import MonthlyReport


class LiquidationReportClinicFund(SQLModel, table=True):
    """A model representing the liquidation (Clinic Fund) reports.

    Document Name: Liquidation Report > Clinic Fund
    """

    __tablename__: str = "liquidationReportClinicFund"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    notedby: str = Field(foreign_key="users.id")
    preparedby: str = Field(foreign_key="users.id")
    teacherInCharge: str = Field(foreign_key="users.id")

    parent_report: "MonthlyReport" = Relationship(back_populates="clinic_fund_report")
    certified_by: list["LiquidationReportClinicFundCertifiedBy"] = Relationship(
        back_populates="parent_report"
    )
    entries: list["LiquidationReportClinicFundEntry"] = Relationship(
        back_populates="parent"
    )


class LiquidationReportClinicFundCertifiedBy(SQLModel, table=True):
    __tablename__: str = "liquidationReportClinicFundCertifiedBy"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportClinicFund.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: LiquidationReportClinicFund = Relationship(
        back_populates="certified_by"
    )


class LiquidationReportClinicFundEntry(SQLModel, table=True):
    __tablename__: str = "liquidationReportClinicFundEntries"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportClinicFund.parent",
    )
    date: datetime.datetime
    receiptNumber: str
    particulars: str
    unit: str
    quantity: float
    unitPrice: float

    parent_report: LiquidationReportClinicFund = Relationship(back_populates="entries")
