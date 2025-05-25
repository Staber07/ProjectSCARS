import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from centralserver.internals.models.reports.monthly_report import MonthlyReport


class LiquidationReportAdministrativeExpenses(SQLModel, table=True):
    """A model representing the liquidation (Administrative Expenses) reports.

    Document Name: Liquidation Report > Administrative Expenses
    """

    __tablename__: str = "liquidationReportAdministrativeExpenses"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    notedby: str = Field(foreign_key="users.id")
    preparedby: str = Field(foreign_key="users.id")
    teacherInCharge: str = Field(foreign_key="users.id")

    parent_report: "MonthlyReport" = Relationship(
        back_populates="AdministrativeExpensesReport"
    )
    certified_by: list["AdministrativeExpensesCertifiedBy"] = Relationship(
        back_populates="parent_report"
    )
    entries: list["AdministrativeExpenseEntry"] = Relationship(
        back_populates="parent_report"
    )


class AdministrativeExpensesCertifiedBy(SQLModel, table=True):
    __tablename__: str = "liquidationReportAdministrativeExpensesCertifiedBy"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportAdministrativeExpenses.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: "LiquidationReportAdministrativeExpenses" = Relationship(
        back_populates="certified_by"
    )


class AdministrativeExpenseEntry(SQLModel, table=True):
    """A model representing an entry in the administrative expenses report."""

    __tablename__: str = "liquidationReportAdministrativeExpensesEntries"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportAdministrativeExpenses.parent",
    )
    date: datetime.datetime
    particulars: str
    unit: str
    quantity: float
    unit_price: float

    parent_report: LiquidationReportAdministrativeExpenses = Relationship(
        back_populates="entries"
    )
