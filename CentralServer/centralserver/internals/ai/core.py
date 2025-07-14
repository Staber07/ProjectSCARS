from datetime import datetime, timedelta
from typing import Optional, DefaultDict, Deque, Annotated
from collections import defaultdict, deque

from intents import INTENT_KEYWORDS, SAFE_GENERAL_TOPICS
from rapidfuzz import fuzz
import google.generativeai as genai

from sqlmodel import Session

from utils import PH_TZ, extract_date_from_prompt
from typo import correct_typos_advanced
from config import config

from auth import UserInfo
from .routers import (get_school_daily_report_entries,logged_in_dep,)




# Load Gemini model
gemini_api_key = config.get("ai", {}).get("gemini_api_key")
genai.configure(api_key=gemini_api_key)
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    system_instruction=(
        "You are a helpful assistant for a school canteen sales bot. "
        "Only answer based on user prompts. If you're unsure, say you don't know. "
        "Keep answers short, direct, and friendly."
    )
)

user_memory: DefaultDict[str, Deque[str]] = defaultdict(lambda: deque(maxlen=3))


def classify_intent_local(prompt: str) -> str:
    prompt_lower = prompt.lower()
    for intent, keywords in INTENT_KEYWORDS.items():
        for keyword in keywords:
            if fuzz.partial_ratio(keyword, prompt_lower) > 85:
                return intent
    return "unknown"


def classify_intent_gemini(prompt: str) -> str:
    classification_prompt = f"""
You are an intent classification AI. Classify the following user prompt into one of the following categories:

- sales_query
- greeting
- thank_you
- general_question
- unknown

Respond ONLY with the category name.

Prompt: "{prompt}"
"""
    try:
        response = model.generate_content(classification_prompt)
        return response.text.strip().lower()
    except Exception as e:
        print(f"[Gemini Fallback Error] {e}")
        return "unknown"


async def get_sales(
    date: str,
    user_info: Optional[UserInfo] = None,
    token: Optional[Annotated[logged_in_dep, None]] = None,
    session: Optional[Session] = None,
) -> str:
    if not token or not session:
        return "❌ Missing authentication token or database session."

    school_id = user_info.school_id if user_info else 1
    year, month, day = map(int, date.split("-"))

    try:
        daily_entries = await get_school_daily_report_entries(token, session, school_id, year, month)
    except Exception as e:
        return f"❌ Error fetching sales data: {str(e)}"

    for entry in daily_entries:
        if entry.day == day:
            sales = float(entry.sales or 0)
            return f"📊 The sales on {date} was ₱{sales:,.2f}."

    return f"📭 No sales record found for {date}."


async def smart_ask(prompt: str, user_id: str = "default", user_info: Optional[UserInfo] = None, token: Optional[logged_in_dep] = None, session: Optional[Session] = None) -> str:
    prompt = prompt.strip()
    if not prompt:
        return ""

    prompt_corrected = correct_typos_advanced(prompt)
    user_memory[user_id].append(prompt)
    recent_history: list[str] = list(user_memory[user_id])

    intent = classify_intent_local(prompt_corrected)
    if intent == "unknown":
        intent = classify_intent_gemini(prompt_corrected)

    now_ph = datetime.now(PH_TZ)

    if intent == "sales_query":
        if "kahapon" in prompt_corrected or "yesterday" in prompt_corrected:
            return await get_sales((now_ph - timedelta(days=1)).strftime("%Y-%m-%d"), user_info, token, session)
        elif "ngayon" in prompt_corrected or "today" in prompt_corrected:
            return await get_sales(now_ph.strftime("%Y-%m-%d"), user_info, token, session)

        extracted_date = extract_date_from_prompt(prompt_corrected)
        if extracted_date:
            return await get_sales(extracted_date, user_info, token, session)

        return (
            "📅 Hmm, I couldn't understand the date you mentioned. "
            "Please try saying it like 'July 14' or 'yesterday'."
        )

    elif intent == "greeting":
        if user_info:
            if user_info.role == "Superintendent":
                return f"👋 Hello {user_info.name}, the {user_info.role} overseeing all schools. How may I help you?"
            else:
                return (
                    f"👋 Hello {user_info.name}, the {user_info.role} of {user_info.school_name}. "
                    "How may I help you?"
                )
        if len(recent_history) > 1:
            return f"👋 Welcome back! Last time you asked: \"{recent_history[-2]}\""
        return "👋 Hello! How can I help you today?"

    elif intent == "thank_you":
        return "🙏 You're welcome! Let me know if there's anything else I can help with."

    if intent == "unknown":
        safe_fallback = any(phrase in prompt_corrected.lower() for phrase in SAFE_GENERAL_TOPICS)
        if recent_history[:-1] or safe_fallback:
            try:
                history = "\n".join(f"User: {p}" for p in recent_history[:-1])
                gemini_prompt = f"{history}\nUser: {prompt_corrected}" if history else prompt_corrected
                response = model.generate_content(gemini_prompt)
                text = response.text.strip()
                if len(text) > 300:
                    text = text[:300].rsplit('.', 1)[0] + "..."
                return text
            except Exception as e:
                return f"🤖 Gemini error: {str(e)}"
        else:
            return "❓ I couldn't understand the question. Can you please rephrase it?"

    return "🤖 Sorry, I didn't catch that. Could you repeat it?"
