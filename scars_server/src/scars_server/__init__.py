#!/usr/bin/env python3

"""
Project SCARS - School Canteen Automated Reporting System
"""


from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def index():
    return {"message": "Hello"}
