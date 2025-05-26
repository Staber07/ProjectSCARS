import datetime
from typing import TYPE_CHECKING

from sqlmodel import Relationship, Field, SQLModel

if TYPE_CHECKING:
    from centralserver.internals.models.reports.monthly_report import MonthlyReport

class DisbursementVoucher(SQLModel, table=True):

    __tablename__: str = "disbursementVouchers"  

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
    notedBy: str = Field(foreign_key="users.id")
    preparedBy: str = Field(foreign_key="users.id")
    teacherInCharge: str = Field(foreign_key="users.id")

    certified_by: list["DisbursementVoucherCertifiedBy"] = Relationship(
        back_populates="parent_report" 
    )
    entries: list["DisbursementVoucherEntry"] = Relationship(
        back_populates="parent_report"
    )
    parent_report: "MonthlyReport" = Relationship(
        back_populates="disbursement_voucher_report"
    )

class DisbursementVoucherCertifiedBy(SQLModel, table=True):
    __tablename__: str = "DisbursementVoucherCertifiedBy" 

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="DisbursementVoucher.parent",
    )
    user: str = Field(foreign_key="users.id")

    parent_report: DisbursementVoucher = Relationship(
        back_populates="certified_by"
    )


class DisbursementVoucherEntry(SQLModel, table=True):
    __tablename__: str = "DisbursementVoucherEntry"

    parent: datetime.date = Field(
        primary_key=True,
        index=True,
        foreign_key="DisbursementVoucher.parent",
    )
    date: datetime.datetime
    receipt: str
    particulars: str
    unit: str
    quantity: float
    unitPrice: float

    parent_report: "DisbursementVoucher" = Relationship(
        back_populates="entries"
    )
