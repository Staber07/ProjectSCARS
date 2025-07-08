from enum import Enum


class ReportStatus(Enum):
    DRAFT = "draft"  # The default status when a report is created.
    REVIEW = "review"  # The report is ready for review.
    APPROVED = "approved"  # The report has been approved by the necessary authorities.
    REJECTED = "rejected"  # The report has been rejected and may need to be revised.
    RECEIVED = "received"  # The report has been received by the SDO.
    ARCHIVED = "archived"  # The report has been archived and is no longer active.
