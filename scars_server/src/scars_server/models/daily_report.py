"""
Project SCARS - School Canteen Automated Reporting System
"""

import datetime

from pydantic import BaseModel


class DailyReport(BaseModel):
    canteen_id: int
    date: datetime.date
    total_sales: float
    total_purchases: float
