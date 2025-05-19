import datetime
import uuid
from dataclasses import dataclass

from pydantic import EmailStr
from sqlmodel import Field, Relationship, SQLModel

##### Access tokens #####


class JWTToken(SQLModel):
    """A model representing an encoded JWT token."""

    uid: uuid.UUID
    access_token: str
    token_type: str


class DecodedJWTToken(SQLModel):
    """A model representing a decoded JWT token."""

    id: str
    is_refresh_token: bool


##### School models #####


class School(SQLModel, table=True):
    """A model representing schools in the system."""

    __tablename__: str = "schools"  # type: ignore

    id: int | None = Field(primary_key=True, index=True)
    name: str = Field(unique=True, description="The name of the school.")

    users: list["User"] = Relationship(back_populates="school")


##### Role models #####


@dataclass(frozen=True)
class DefaultRole:
    id: int
    description: str
    modifiable: bool


class Role(SQLModel, table=True):
    """A model representing user roles in the system."""

    __tablename__: str = "roles"  # type: ignore

    id: int | None = Field(default=None, primary_key=True, index=True)
    description: str = Field(
        unique=True,
        description="WebAdmin, Canteen Manager, Principal, Administrator, or Superintendent",
    )
    modifiable: bool = Field(
        default=False,
        description="Whether the role's characteristics can be modified.",
    )

    users: list["User"] = Relationship(back_populates="role")


##### User models #####


class User(SQLModel, table=True):
    """A model representing a user in the system."""

    __tablename__: str = "users"  # type: ignore

    id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        primary_key=True,
        index=True,
        description="The unique identifier for the user.",
    )

    username: str = Field(unique=True, description="The username of the user.")
    email: EmailStr | None = Field(
        default=None, unique=True, description="The email address of the user."
    )
    nameFirst: str | None = Field(
        default=None, description="The first name of the user."
    )
    nameMiddle: str | None = Field(
        default=None, description="The middle name of the user."
    )
    nameLast: str | None = Field(default=None, description="The last name of the user.")
    avatarUrn: str | None = Field(
        default=None,
        description="A link or identifier to the user's avatar within the file storage server.",
    )
    schoolId: int | None = Field(
        default=None,
        description="The ID of the school the user belongs to.",
        foreign_key="schools.id",
    )
    roleId: int = Field(
        description="The user's role in the system.", foreign_key="roles.id"
    )
    password: str = Field(
        description="The hashed password of the user.",
    )
    deactivated: bool = Field(
        default=False,
        description="Whether the user account is deactivated.",
    )
    forceUpdateInfo: bool = Field(
        default=False,
        description="Whether the user is required to update their information.",
    )
    finishedTutorials: str = Field(
        default_factory=str,
        description="A list of onboarding tutorials the user has completed.",
    )

    dateCreated: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc),
        description="The timestamp when the record was created.",
    )
    lastModified: datetime.datetime = Field(
        default_factory=lambda: datetime.datetime.now(datetime.timezone.utc),
        description="The last time the user information was modified.",
    )
    lastLoggedInTime: datetime.datetime | None = Field(
        default=None,
        description="The last time the user logged in.",
    )
    lastLoggedInIp: str | None = Field(
        default=None,
        description="The last IP address the user logged in from.",
    )

    school: School | None = Relationship(
        back_populates="users",
    )
    role: Role = Relationship(back_populates="users")


class UserPublic(SQLModel):
    """A model representing a user without sensitive information."""

    id: str
    username: str
    email: EmailStr | None
    nameFirst: str | None
    nameMiddle: str | None
    nameLast: str | None
    avatarUrn: str | None
    schoolId: int | None
    roleId: int
    deactivated: bool
    finishedTutorials: str
    forceUpdateInfo: bool
    dateCreated: datetime.datetime
    lastModified: datetime.datetime
    lastLoggedInTime: datetime.datetime | None
    lastLoggedInIp: str | None


class UserUpdate(SQLModel):
    """A model used when updating user information."""

    id: str  # The ID of the user to be updated.
    username: str | None = None
    email: EmailStr | None = None
    nameFirst: str | None = None
    nameMiddle: str | None = None
    nameLast: str | None = None
    password: str | None = None

    finishedTutorials: str | None = None


class UserCreate(SQLModel):
    """A model used for creating new user accounts."""

    username: str
    roleId: int
    password: str


##### Object store models #####


class BucketObject(SQLModel):
    """A model representing an object in a bucket."""

    bucket: str
    fn: str
    obj: bytes


##### Reports models #####


class MonthlyReport(SQLModel, table=True):
    """A model representing a monthly report in the system."""

    __tablename__: str = "reports"  # type: ignore

    dailyFinancialReport: "DailyFinancialReport | None"


@dataclass
class DailyFinancialReportEntry:
    day: int
    sales: float
    purchases: float


class DailyFinancialReport(SQLModel):
    """A model representing the daily sales and purchases report."""

    entries: list[DailyFinancialReportEntry]
    prepared_by: User
    noted_by: User


@dataclass
class OperatingExpenseEntry:
    date: datetime.datetime
    particulars: str
    quantity: float  # NOTE: This is float because it could be a (for example) weight
    unit_price: float


class LiquidationReportOperatingExpenses(SQLModel):
    """A model representing the liquidation (Operating Expenses) reports."""

    month: datetime.datetime
    teacher_in_charge: User
    entries: list[OperatingExpenseEntry]
    prepared_by: User
    certified_by: tuple[User, User]
    noted_by: User


class LiquidationReportAdministrativeExpenses(SQLModel):
    """A model representing the liquidation (Administrative Expenses) reports."""


class LiquidationReportRevolvingFund(SQLModel):
    """A model representing the liquidation (Revolving Fund) reports."""


class LiquidationReportSupplementaryFeedingFund(SQLModel):
    """A model representing the liquidation (Supplementary Feeding Fund) reports."""


class LiquidationReportClinicFund(SQLModel):
    """A model representing the liquidation (Clinic Fund) reports."""


class LiquidationReportSchoolOperationFund(SQLModel):
    """A model representing the liquidation (School Operation Fund) reports."""


class LiquidationReportFacultyAndStudentDevFund(SQLModel):
    """A model representing the liquidation (Faculty and Student Development Fund) reports."""


class LiquidationReportHEFund(SQLModel):
    """A model representing the liquidation (HE Fund) reports."""


class PayrollReport(SQLModel):
    """A model representing the monthly payroll report."""


class DisbursementVoucher(SQLModel):
    """A model representing the disbursement vouchers."""


##################################################
