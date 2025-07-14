from datetime import datetime
from pytz import timezone
from typing import Optional, TypedDict
from dateparser.search import search_dates

PH_TZ = timezone("Asia/Manila")

ROLE_MAP = {
    2: "Superintendent",
    3: "Administrator",
    4: "Principal",
    5: "Canteen Manager",
}

class DailyFinancialReportEntry(TypedDict, total=False):
    day: int
    sales: Optional[float]
    purchases: Optional[float]
    parent: Optional[str]

def extract_date_from_prompt(prompt: str) -> Optional[str]:
    now_ph = datetime.now(PH_TZ)
    base_year = 2025  # or dynamically: now_ph.year
    relative_base = now_ph.replace(year=base_year)

    result = search_dates(
        prompt,
        settings={
            "PREFER_DATES_FROM": "past",
            "RELATIVE_BASE": relative_base
        },
        languages=["en", "tl"]
    )

    if result:
        _, parsed_date = result[0]
        return parsed_date.strftime("%Y-%m-%d")

    return None
