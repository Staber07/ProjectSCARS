from enum import Enum


class ReportStatus(Enum):
    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    REJECTED = "rejected"
    RECEIVED = "received"
    ARCHIVED = "archived"
