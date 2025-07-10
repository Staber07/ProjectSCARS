"""Generic utilities for report status management across all report types."""

import datetime
from typing import Any, Dict, Union

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

logger = LoggerFactory().get_logger(__name__)


class ReportStatusManager:
    """Generic manager for handling report status changes across different report types."""
    
    @staticmethod
    def get_monthly_report(
        session: Session,
        school_id: int,
        year: int,
        month: int
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
