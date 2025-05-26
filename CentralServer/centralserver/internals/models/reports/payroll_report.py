import datetime

from sqlmodel import Field, SQLModel


# TODO: WIP
class PayrollReport(SQLModel, table=True):
    """A model representing the monthly payroll report."""

    __tablename__: str = "payrollReports"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
