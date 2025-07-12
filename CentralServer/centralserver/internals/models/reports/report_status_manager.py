"""Generic utilities for report status management across all report types."""

import datetime
from typing import Any, Dict, List, Union

from fastapi import HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.exc import NoResultFound

from centralserver.internals.models.reports.monthly_report import MonthlyReport
from centralserver.internals.models.reports.status_change_request import (
    StatusChangeRequest,
    RoleBasedTransitions,
)
from centralserver.internals.models.user import User
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models.reports.report_status import ReportStatus

logger = LoggerFactory().get_logger(__name__)


class ReportStatusManager:
    """Generic manager for handling report status changes across different report types."""

    @staticmethod
    def get_monthly_report(
        session: Session, school_id: int, year: int, month: int
    ) -> MonthlyReport:
        """Get the monthly report for the given parameters."""
        try:
            return session.exec(
                select(MonthlyReport).where(
                    MonthlyReport.id == datetime.date(year=year, month=month, day=1),
                    MonthlyReport.submittedBySchool == school_id,
                )
            ).one()
        except NoResultFound as e:
            logger.warning(
                "Monthly report not found for school %s for %s-%s",
                school_id,
                year,
                month,
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Monthly report not found.",
            ) from e

    @staticmethod
    def _check_monthly_report_component_statuses(
        monthly_report: MonthlyReport, target_status: Any
    ) -> None:
        """
        Check if all existing component reports of a monthly report are in the required status.
        For monthly reports transitioning to REVIEW, all existing component reports must already be in REVIEW.
        Missing reports are not required and will not block the submission.
        """

        # Only validate when transitioning monthly report to REVIEW status
        if target_status != ReportStatus.REVIEW:
            return

        not_in_review_reports: List[str] = []

        # Check Daily Financial Report (only if it exists)
        if (
            monthly_report.daily_financial_report is not None
            and (
                monthly_report.daily_financial_report.reportStatus is None
                or monthly_report.daily_financial_report.reportStatus != ReportStatus.REVIEW
            )
        ):
            status_value = (
                monthly_report.daily_financial_report.reportStatus.value
                if monthly_report.daily_financial_report.reportStatus
                else "draft"
            )
            not_in_review_reports.append(
                f"Daily Sales & Purchases Report (current status: {status_value})"
            )

        # Check Payroll Report (only if it exists)
        if (
            monthly_report.payroll_report is not None
            and monthly_report.payroll_report.reportStatus != ReportStatus.REVIEW
        ):
            not_in_review_reports.append(
                f"Payroll Report (current status: {monthly_report.payroll_report.reportStatus.value})"
            )

        # Check all liquidation reports (only if they exist)
        liquidation_reports: List[tuple[str, Any]] = [
            ("Operating Expenses Report", monthly_report.operating_expenses_report),
            (
                "Administrative Expenses Report",
                monthly_report.administrative_expenses_report,
            ),
            ("Clinic Fund Report", monthly_report.clinic_fund_report),
            (
                "Supplementary Feeding Fund Report",
                monthly_report.supplementary_feeding_fund_report,
            ),
            ("HE Fund Report", monthly_report.he_fund_report),
            (
                "Faculty & Student Development Fund Report",
                monthly_report.faculty_and_student_dev_fund_report,
            ),
            (
                "School Operation Fund Report",
                monthly_report.school_operation_fund_report,
            ),
            ("Revolving Fund Report", monthly_report.revolving_fund_report),
        ]

        for report_name, report in liquidation_reports:
            if (
                report is not None
                and hasattr(report, "reportStatus")
                and report.reportStatus != ReportStatus.REVIEW
            ):
                not_in_review_reports.append(
                    f"{report_name} (current status: {report.reportStatus.value})"
                )

        # Construct error message if validation fails
        if not_in_review_reports:
            error_message = (
                "Cannot submit monthly report for review. "
                f"Reports not in REVIEW status: {', '.join(not_in_review_reports)}. "
                "Please submit these existing reports for review first."
            )

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_message,
            )

    @staticmethod
    def change_report_status(
        session: Session,
        user: User,
        report: Any,  # Any report type with reportStatus field
        status_change: StatusChangeRequest,
        report_type: str,
        school_id: int,
        year: int,
        month: int,
        category: str | None = None,
    ) -> Any:
        """
        Generic function to change the status of any report type.

        Args:
            session: Database session
            user: User making the change
            report: The report object to change status for
            status_change: The status change request
            report_type: Type of report (e.g., "monthly", "payroll", "liquidation")
            school_id: School ID
            year: Report year
            month: Report month
            category: Category (for liquidation reports)

        Returns:
            The updated report object
        """

        # Special validation for monthly reports - check component report statuses
        if report_type == "monthly":
            ReportStatusManager._check_monthly_report_component_statuses(
                report, status_change.new_status
            )

        # Validate the status transition based on user role
        if not RoleBasedTransitions.is_transition_valid(
            user.roleId, report.reportStatus, status_change.new_status
        ):
            valid_transitions = RoleBasedTransitions.get_valid_transitions(
                user.roleId, report.reportStatus
            )
            role_description = RoleBasedTransitions.get_role_description(user.roleId)

            if not valid_transitions:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"As a {role_description}, you cannot change reports with '{report.reportStatus.value}' status.",
                )
            else:
                valid_statuses = [status.value for status in valid_transitions]
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"As a {role_description}, you can only change reports from '{report.reportStatus.value}' to: {', '.join(valid_statuses)}.",
                )

        # Update the report status
        old_status = report.reportStatus
        report.reportStatus = status_change.new_status

        # Add to session and commit
        session.add(report)
        session.commit()
        session.refresh(report)

        # Build log context
        context_parts = [f"school {school_id}", f"{year}-{month}"]
        if category:
            context_parts.append(f"category {category}")
        context = ", ".join(context_parts)

        logger.info(
            "user `%s` (role %s) changed status of %s report for %s from '%s' to '%s'",
            user.id,
            user.roleId,
            report_type,
            context,
            old_status.value,
            status_change.new_status.value,
        )

        return report

    @staticmethod
    def get_valid_transitions_response(
        user: User,
        report: Any,  # Any report type with reportStatus field
    ) -> Dict[str, Union[str, list[str]]]:
        """Get valid transitions for a report based on user role."""
        valid_transitions = RoleBasedTransitions.get_valid_transitions(
            user.roleId, report.reportStatus
        )

        return {
            "current_status": report.reportStatus.value,
            "valid_transitions": [status.value for status in valid_transitions],
            "user_role": RoleBasedTransitions.get_role_description(user.roleId),
        }

    @staticmethod
    def check_view_permission(
        user: User,
        report: Any,  # Any report type with reportStatus field
    ) -> bool:
        """Check if user can view the report based on role and report status."""
        return RoleBasedTransitions.can_view_report(user.roleId, report.reportStatus)

    @staticmethod
    def check_create_permission(user: User) -> bool:
        """Check if user can create new reports."""
        return RoleBasedTransitions.can_create_report(user.roleId)

    @staticmethod
    def get_viewable_reports_filter(user: User) -> List[Any]:
        """Get list of viewable report statuses for filtering queries."""
        viewable_statuses = RoleBasedTransitions.get_viewable_statuses(user.roleId)
        return viewable_statuses  # Return the enum objects directly
