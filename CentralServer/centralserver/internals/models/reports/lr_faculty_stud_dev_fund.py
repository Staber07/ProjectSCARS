import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from centralserver.internals.models.reports.monthly_report import MonthlyReport


class LiquidationReportFacultyAndStudentDevFund(SQLModel, table=True):
    """A model representing the liquidation (Faculty and Student Development Fund) reports."""

    __tablename__: str = "liquidationReportFacultyAndStudentDevFund"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    notedBy: str = Field(foreign_key="users.id")
    preparedBy: str = Field(foreign_key="users.id")
    teacherInCharge: str = Field(foreign_key="users.id")

    audited_by: list["FacultyAndStudentDevFundAuditedBy"] = Relationship(
        back_populates="parent_report"
    )
    entries: list["FacultyAndStudentDevFundEntry"] = Relationship(
        back_populates="parent_report"
    )
    parent_report: "MonthlyReport" = Relationship(
        back_populates="faculty_and_student_dev_fund_report"
    )


class FacultyAndStudentDevFundAuditedBy(SQLModel, table=True):
    __tablename__: str = "liquidationReportFacultyAndStudentDevFundAuditedBy"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportFacultyAndStudentDevFund.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: LiquidationReportFacultyAndStudentDevFund = Relationship(
        back_populates="audited_by"
    )


class FacultyAndStudentDevFundEntry(SQLModel, table=True):
    __tablename__: str = "liquidationReportFacultyAndStudentDevFundEntries"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="liquidationReportFacultyAndStudentDevFund.parent",
    )
    date: datetime.datetime
    receipt: str
    particulars: str
    unit: str
    quantity: float
    unitPrice: float

    parent_report: "LiquidationReportFacultyAndStudentDevFund" = Relationship(
        back_populates="entries"
    )
