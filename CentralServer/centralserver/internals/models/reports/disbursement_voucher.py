import datetime
from typing import TYPE_CHECKING, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from centralserver.internals.models.reports.monthly_report import MonthlyReport


class DisbursementVoucher(SQLModel, table=True):
    __tablename__ = "disbursementVouchers"

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )

    payee: str = Field(foreign_key="users.id")
    tin_or_employee_no: Optional[str] = None
    responsibility_center: Optional[str] = None

    amount_gross: float
    amount_tax: Optional[float] = 0.0
    amount_net: float

    amount_due: float

    certified_cash_available: bool = False
    certified_supporting_docs_complete: bool = False
    certified_subject_to_debit_account: bool = False

    check_no: Optional[str] = None
    bank_name_and_account_no: Optional[str] = None
    ada_no: Optional[str] = None
    jev_no: Optional[str] = None

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
    __tablename__ = "DisbursementVoucherCertifiedBy"

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="DisbursementVoucher.parent"
    )
    user: str = Field(foreign_key="users.id")
    role: Optional[str] = None  # e.g. Principal, Accountant, Cashier

    parent_report: DisbursementVoucher = Relationship(
        back_populates="certified_by"
    )


class DisbursementVoucherEntry(SQLModel, table=True):
    __tablename__ = "DisbursementVoucherEntry"

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="DisbursementVoucher.parent"
    )
    date: datetime.datetime
    receipt: str
    particulars: str
    unit: str
    quantity: float
    unit_price: float

    parent_report: DisbursementVoucher = Relationship(
        back_populates="entries"
    )


class DisbursementVoucherAccountingEntry(SQLModel, table=True):
    __tablename__ = "DisbursementVoucherAccountingEntry"

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="DisbursementVoucher.parent"
    )
    uacs_code: str
    account_title: str
    debit: float
    credit: float

    parent_report: DisbursementVoucher = Relationship(
        back_populates="accounting_entries"
    )
