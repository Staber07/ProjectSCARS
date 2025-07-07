import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from centralserver.internals.models.reports.monthly_report import MonthlyReport


class PayrollReport(SQLModel, table=True):
    """A model representing the monthly payroll report."""

    __tablename__: str = "payrollReports"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )

    noted_by: list["PayrollReportNotedBy"] = Relationship(
        back_populates="parent_report"
    )
    entries: list["PayrollReportEntry"] = Relationship(back_populates="parent_report")

    parent_report: "MonthlyReport" = Relationship(back_populates="payroll_report")


class PayrollReportNotedBy(SQLModel, table=True):
    """A model representing the noted by section of the payroll report."""

    __tablename__: str = "payrollReportNotedBy"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="payrollReports.parent"
    )

    name: str
    position: str
    date: datetime.date | None = None
    parent_report: PayrollReport = Relationship(back_populates="noted_by")


class PayrollReportEntry(SQLModel, table=True):
    """A model representing an entry in the payroll report for a week."""

    __tablename__: str = "payrollReportEntries"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="payrollReports.parent"
    )
    week_number: int = Field(primary_key=True, description="Week number in the month")
    employee_id: str = Field(primary_key=True, description="Employee identifier")
    employee_name: str
    sun: float = Field(default=0.0, description="Amount received on Sunday")
    mon: float = Field(default=0.0, description="Amount received on Monday")
    tue: float = Field(default=0.0, description="Amount received on Tuesday")
    wed: float = Field(default=0.0, description="Amount received on Wednesday")
    thu: float = Field(default=0.0, description="Amount received on Thursday")
    fri: float = Field(default=0.0, description="Amount received on Friday")
    sat: float = Field(default=0.0, description="Amount received on Saturday")
    total: float = Field(default=0.0, description="Total amount received for the week")
    signature: str | None = Field(default=None, description="Signature or reference")

    parent_report: PayrollReport = Relationship(back_populates="entries")
