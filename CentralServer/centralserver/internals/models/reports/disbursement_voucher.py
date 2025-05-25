import datetime

from sqlmodel import Field, SQLModel


# TODO: WIP
class DisbursementVoucher(SQLModel, table=True):
    """A model representing the disbursement vouchers."""

    __tablename__: str = "disbursementVouchers"  # type: ignore

    parent: datetime.date = Field(
        primary_key=True, index=True, foreign_key="monthlyReports.id"
    )
