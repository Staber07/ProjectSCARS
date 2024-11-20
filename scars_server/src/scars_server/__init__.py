#!/usr/bin/env python3

"""
Project SCARS - School Canteen Automated Reporting System
"""


import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from scars_server.core.db_handler import DatabaseHandler
from scars_server.models.daily_report import DailyReport

app = FastAPI()
db = DatabaseHandler()

origins = [
    "http://localhost",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def index():
    return {"message": "Hello there!"}


@app.get("/api/v1/daily/{date}", response_model=DailyReport)
def get_daily_stats(date: datetime.date):
    return db.read(date)


# @app.put("/api/v1/add/{year}/{month}/{day}", response_model=DailyReport)
@app.put("/api/v1/add")
def put_daily_stats(daily_report: DailyReport):
    db.create(daily_report)
    return {
        "message": f"Daily stats for {daily_report.date} uploaded",
        "result": daily_report.dict(),
    }
