import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

from centralserver.internals.models.reports.report_status import ReportStatus

if TYPE_CHECKING:
    from centralserver.internals.models.reports.monthly_report import MonthlyReport


class DisbursementVoucher(SQLModel, table=True):
    """A model representing the disbursement voucher reports.

    Document Name: Disbursement Voucher
    """

    __tablename__ = "disbursementVouchers"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    date: datetime.date

    modeOfPayment: str  # MDS Check, Commercial Check, ADA, Others

    payee: str
    tinOrEmployeeNo: str | None = None
    responsibilityCenter: str | None = None
    orsbursNo: str | None = None
    address: str | None = None

    # Section C: Certified
    certifiedCashAvailable: bool = False
    certifiedSupportingDocsComplete: bool = False
    certifiedSubjectToDebitAccount: bool = False

    # Section D: Approved for Payment
    approvedBy: str | None = Field(foreign_key="users.id", default=None)

    # Section E: Receipt of Payment
    checkNo: str | None = None
    bankNameAndAccountNo: str | None = None
    adaNo: str | None = None  # Advice to Debit Account Number
    jevNo: str | None = None  # Journal Entry Voucher Number
    reportStatus: ReportStatus = Field(
        default=ReportStatus.DRAFT,
        description="The status of the report.",
    )

    certified_by: list["DisbursementVoucherCertifiedBy"] = Relationship(
        back_populates="parent_report"
    )
    entries: list["DisbursementVoucherEntry"] = Relationship(
        back_populates="parent_report"
    )
    accounting_entries: list["DisbursementVoucherAccountingEntry"] = Relationship(
        back_populates="parent_report"
    )
    parent_report: "MonthlyReport" = Relationship(
        back_populates="disbursement_voucher_report"
    )


class DisbursementVoucherCertifiedBy(SQLModel, table=True):
    __tablename__ = "disbursementVoucherCertifiedBy"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="disbursementVouchers.parent"
    )
    user: str = Field(foreign_key="users.id")
    role: str | None = None  # e.g. Principal, Accountant, Cashier

    parent_report: DisbursementVoucher = Relationship(back_populates="certified_by")


class DisbursementVoucherEntry(SQLModel, table=True):
    __tablename__ = "disbursementVoucherEntries"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="disbursementVouchers.parent"
    )
    # to be edited for specific inputs based on the report requirements
    date: datetime.datetime
    receipt: str
    particulars: str
    unit: str
    quantity: float
    unitPrice: float

    parent_report: DisbursementVoucher = Relationship(back_populates="entries")


class DisbursementVoucherAccountingEntry(SQLModel, table=True):
    __tablename__ = "disbursementVoucherAccountingEntries"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="disbursementVouchers.parent"
    )
    uacs_code: str
    accountTitle: str
    debit: float
    credit: float

    parent_report: DisbursementVoucher = Relationship(
        back_populates="accounting_entries"
    )
