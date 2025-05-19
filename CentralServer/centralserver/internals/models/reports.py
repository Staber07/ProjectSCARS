import datetime

from sqlmodel import Field, Relationship, SQLModel

from centralserver.internals.models.user import User


class LiquidationReportAdministrativeExpenses(SQLModel):
    """A model representing the liquidation (Administrative Expenses) reports."""

    # TODO: WIP


class LiquidationReportRevolvingFund(SQLModel):
    """A model representing the liquidation (Revolving Fund) reports."""

    # TODO: WIP


class LiquidationReportSupplementaryFeedingFund(SQLModel):
    """A model representing the liquidation (Supplementary Feeding Fund) reports."""

    # TODO: WIP


class LiquidationReportClinicFund(SQLModel):
    """A model representing the liquidation (Clinic Fund) reports."""

    # TODO: WIP


class LiquidationReportSchoolOperationFund(SQLModel):
    """A model representing the liquidation (School Operation Fund) reports."""

    # TODO: WIP


class LiquidationReportFacultyAndStudentDevFund(SQLModel):
    """A model representing the liquidation (Faculty and Student Development Fund) reports."""

    # TODO: WIP


class LiquidationReportHEFund(SQLModel):
    """A model representing the liquidation (HE Fund) reports."""

    # TODO: WIP


class PayrollReport(SQLModel):
    """A model representing the monthly payroll report."""

    # TODO: WIP


class DisbursementVoucher(SQLModel):
    """A model representing the disbursement vouchers."""

    # TODO: WIP


class OperatingExpenseEntry(SQLModel, table=True):
    """A model representing an entry in the operating expenses report."""

    __tablename__: str = "LiquidationReportOperatingExpensesEntries"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="LiquidationReportOperatingExpenses.parent",
    )
    date: datetime.datetime
    particulars: str
    unit: str  # currency (PHP), weight (kg), etc.
    quantity: float  # NOTE: This is float because it could be a (for example) weight
    unit_price: float

    parent_report: "LiquidationReportOperatingExpenses" = Relationship(
        back_populates="entries"
    )


class OperatingExpensesCertifiedBy(SQLModel, table=True):
    """A model representing the "Certified By" field in the operating expenses report."""

    __tablename__: str = "OperatingExpensesCertifiedBy"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="LiquidationReportOperatingExpenses.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: "LiquidationReportOperatingExpenses" = Relationship(
        back_populates="certified_by"
    )


class LiquidationReportOperatingExpenses(SQLModel, table=True):
    """A model representing the liquidation (Operating Expenses) reports."""

    __tablename__: str = "LiquidationReportOperatingExpenses"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    teacherInCharge: str = Field(foreign_key="users.id")
    preparedBy: str = Field(foreign_key="users.id")
    notedBy: str = Field(foreign_key="users.id")

    parent_report: "MonthlyReport" = Relationship(
        back_populates="operatingExpensesReport"
    )
    entries: list[OperatingExpenseEntry] = Relationship(back_populates="parent_report")
    certified_by: list[OperatingExpensesCertifiedBy] = Relationship(
        back_populates="parent_report"
    )


class DailyFinancialReportEntry(SQLModel, table=True):
    """A model representing an entry in the daily sales and purchases report."""

    __tablename__: str = "dailyFinancialReportsEntries"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="dailyFinancialReports.parent"
    )
    day: int
    sales: float
    purchases: float

    parent_report: "DailyFinancialReport" = Relationship(back_populates="entries")


class DailyFinancialReport(SQLModel, table=True):
    """A model representing the daily sales and purchases report."""

    __tablename__: str = "dailyFinancialReports"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="monthlyReports.id",
    )
    preparedBy: str = Field(foreign_key="users.id")
    notedBy: str = Field(foreign_key="users.id")

    parent_report: "MonthlyReport" = Relationship(back_populates="dailyFinancialReport")
    entries: list[DailyFinancialReportEntry] = Relationship(
        back_populates="parent_report"
    )


class MonthlyReport(SQLModel, table=True):
    """A model representing a monthly report in the system."""

    __tablename__: str = "monthlyReports"  # type: ignore

    id: datetime.date = Field(
        primary_key=True,
        index=True,
        description="The month and year of the report.",
    )

    dailyFinancialReport: DailyFinancialReport | None = Relationship(
        back_populates="parent_report"
    )
    operatingExpensesReport: LiquidationReportOperatingExpenses | None = Relationship(
        back_populates="parent_report"
    )
