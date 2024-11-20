"""
Project SCARS - School Canteen Automated Reporting System
"""

# TODO: This file currently contains placeholder code.

import datetime

from scars_server.models.daily_report import DailyReport


class DatabaseHandler:
    def __init__(self):
        self.entries: dict[datetime.date, DailyReport] = {}

    def create(self, daily_report: DailyReport):
        self.entries[daily_report.date] = daily_report

    def read(self, date: datetime.date) -> DailyReport:
        return self.entries[date]
