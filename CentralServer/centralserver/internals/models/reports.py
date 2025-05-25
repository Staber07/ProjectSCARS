import datetime

from sqlmodel import Field, Relationship, SQLModel

class AdministrativeExpensesCertifiedBy(SQLModel, table=True):
    """A model representing the "Certified By" field in the operating expenses report."""

    __tablename__: str = "AdministrativeExpensesCertifiedBy"  

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="AdministrativeExpensesCertifiedBy.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: "LiquidationReportAdministrativeExpenses" = Relationship(
        back_populates="certified_by"
    )

class AdministrativeExpenseEntry(SQLModel, table=True):
    """A model representing an entry in the administrative expenses report."""

    __tablename__: str = "AdministrativeExpenseEntry"  

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="LiquidationReportAdministrativeExpenses.parent",
    )
    date: datetime.datetime
    particulars: str
    unit: str 
    quantity: float  #
    unit_price: float

    parent_report: "LiquidationReportOperatingExpenses" = Relationship(
        back_populates="entries"
    )

class LiquidationReportAdministrativeExpenses(SQLModel, table=True):
    """A model representing the liquidation (Administrative Expenses) reports."""

    __tablename__: str = "LiquidationReportAdministrativeExpenses" 

    parent: datetime.date = Field(  
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    certified_by: list[AdministrativeExpensesCertifiedBy] = Relationship(
        back_populates="parent_report"
    )
    notedby: str = Field(foreign_key="users.id")
    preparedby: str = Field(foreign_key="users.id")
    teacherInCharge: str = Field(foreign_key="users.id")
    
    entries: list[AdministrativeExpenseEntry] = Relationship(
        back_populates="parent_report")
    parent_report: "MonthlyReport" = Relationship(
        back_populates="AdministrativeExpensesReport")
    


class RevolvingFundCertifiedBy(SQLModel, table=True):
    """A model representing the "Certified By" field in the operating expenses report."""

    __tablename__: str = "RevolvingFundCertifiedBy" 

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="RevolvingFundCertifiedBy.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: "LiquidationReportRevolvingFund" = Relationship(
        back_populates="certified_by"
    )

class RevolvingFundEntry(SQLModel, table=True):
    """A model representing an entry in the administrative expenses report."""

    __tablename__: str = "RevolvingFundEntry"  

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="LiquidationReportingRevolvingFund.parent",
    )
    date: datetime.datetime
    receipt: str
    particulars: str
    unit: str 
    quantity: float  
    unit_price: float

    parent_report: "LiquidationReportRevolvingFund" = Relationship(
        back_populates="entries"
    )

class LiquidationReportRevolvingFund(SQLModel, table=True):
    """A model representing the liquidation (Revolving Fund) reports."""

    __tablename__: str = "LiquidationReportRevolvingFund"  

    parent: datetime.date = Field(  
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    notedby: str = Field(foreign_key="users.id")
    preparedby: str = Field(foreign_key="users.id")
    teacherInCharge: str = Field(foreign_key="users.id")
    
    entries: list[RevolvingFundEntry] = Relationship(
        back_populates="parent_report")
    parent_report: "MonthlyReport" = Relationship(
        back_populates="RevolvingFundReport")


class SupplementaryFeedingFundCertifiedBy(SQLModel, table=True):

    __tablename__: str = "SupplementaryFeedingFundCertifiedBy" 

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="SupplementaryFeedingFundCertifiedBy.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: "LiquidationReportSupplementaryFeedingFund" = Relationship(
        back_populates="certified_by"
    )

class SupplementaryFeedingFundEntry(SQLModel, table=True):

    __tablename__: str = "SupplementaryFeedingFundEntry"  

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="LiquidationReportingSupplementaryFeedingFund.parent",
    )
    date: datetime.datetime
    receipt: str
    particulars: str
    unit: str 
    quantity: float  
    unit_price: float

    parent_report: "LiquidationReportSupplementaryFeedingFund" = Relationship(
        back_populates="entries"
    )

class LiquidationReportSupplementaryFeedingFund(SQLModel, table=True):

    __tablename__: str = "LiquidationReportSupplementaryFeedingFund"  

    parent: datetime.date = Field(  
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    certified_by: list[SupplementaryFeedingFundCertifiedBy] = Relationship(
        back_populates="parent_report"
    )
    notedby: str = Field(foreign_key="users.id")
    preparedby: str = Field(foreign_key="users.id")
    teacherInCharge: str = Field(foreign_key="users.id")
    
    entries: list[SupplementaryFeedingFundEntry] = Relationship(
        back_populates="parent_report")
    parent_report: "MonthlyReport" = Relationship(
        back_populates="RevolvingFundReport")


class ClinicFundCertifiedBy(SQLModel, table=True):

    __tablename__: str = "ClinicFundCertifiedBy" 

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="ClinicFundCertifiedBy.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: "LiquidationReportSupplementaryFeedingFund" = Relationship(
        back_populates="certified_by"
    )

class ClinicFundEntry(SQLModel, table=True):

    __tablename__: str = "ClinicFundEntry"  

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="LiquidationReportClinicFund.parent",
    )
    date: datetime.datetime
    receipt: str
    particulars: str
    unit: str 
    quantity: float  
    unit_price: float

    parent_report: "LiquidationReportClinicFund" = Relationship(
        back_populates="entries"
    )


class LiquidationReportClinicFund(SQLModel, table=True):
    """A model representing the liquidation (Clinic Fund) reports."""

    __tablename__: str = "LiquidationReportClinicFund"  

    parent: datetime.date = Field(  
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    certified_by: list[ClinicFundCertifiedBy] = Relationship(
        back_populates="parent_report"
    )
    notedby: str = Field(foreign_key="users.id")
    preparedby: str = Field(foreign_key="users.id")
    teacherInCharge: str = Field(foreign_key="users.id")
    
    entries: list[AdministrativeExpenseEntry] = Relationship(
        back_populates="parent_report")
    parent_report: "MonthlyReport" = Relationship(
        back_populates="ClinicFundReport")


class SchoolOperationFundCertifiedBy(SQLModel, table=True):

    __tablename__: str = "SchoolOperationFundCertifiedBy" 

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="ClinicFundCertifiedBy.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: "LiquidationReportSchoolOperationFund" = Relationship(
        back_populates="certified_by"
    )

class SchoolOperationFundEntry(SQLModel, table=True):

    __tablename__: str = "SchoolOperationFundEntry"  

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="LiquidationReportSchoolOperationFund.parent",
    )
    date: datetime.datetime
    receipt: str
    particulars: str
    unit: str 
    quantity: float  
    unit_price: float

    parent_report: "LiquidationReportSchoolOperationFund" = Relationship(
        back_populates="entries"
    )

class LiquidationReportSchoolOperationFund(SQLModel, table=True):
    """A model representing the liquidation (School Operation Fund) reports."""

    __tablename__: str = "LiquidationReportSchoolOperationFund" 

    parent: datetime.date = Field(  
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    certified_by: list[SchoolOperationFundCertifiedBy] = Relationship(
        back_populates="parent_report"
    )
    notedby: str = Field(foreign_key="users.id")
    preparedby: str = Field(foreign_key="users.id")
    teacherInCharge: str = Field(foreign_key="users.id")
    
    entries: list[SchoolOperationFundEntry] = Relationship(
        back_populates="parent_report")
    parent_report: "MonthlyReport" = Relationship(
        back_populates="SchoolOperationFundReport")




class LiquidationReportFacultyAndStudentDevFund(SQLModel, table=True):
    """A model representing the liquidation (Faculty and Student Development Fund) reports."""

    __tablename__: str = "LiquidationReportFacultyAndStudentDevFund"  # type: ignore

    parent: datetime.date = Field(  # TODO: WIP
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )


class LiquidationReportHEFund(SQLModel, table=True):
    """A model representing the liquidation (HE Fund) reports."""

    __tablename__: str = "LiquidationReportHEFund"  # type: ignore

    parent: datetime.date = Field(  # TODO: WIP
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )


class PayrollReport(SQLModel, table=True):
    """A model representing the monthly payroll report."""

    __tablename__: str = "PayrollReports"  # type: ignore

    parent: datetime.date = Field(  # TODO: WIP
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )


class DisbursementVoucher(SQLModel, table=True):
    """A model representing the disbursement vouchers."""

    __tablename__: str = "DisbursementVouchers"  # type: ignore

    parent: datetime.date = Field(  # TODO: WIP
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )


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
