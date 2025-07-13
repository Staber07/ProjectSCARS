import os
import json
from datetime import datetime, timedelta
import requests
import google.generativeai as genai

# Load API key from config.json (assumes it's two levels up from this script)
CONFIG_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..', '..', '..', 'config.json')
)


with open(CONFIG_PATH, 'r') as f:
    config = json.load(f)

api_key = config.get("ai", {}).get("gemini_api_key")

if not api_key:
    raise ValueError(
        "Gemini API key not found in config.json under 'ai.gemini_api_key'"
    )

genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-pro")


def get_sales(date: str) -> str:
    try:
        url = f"http://localhost:8080/statistics?date={date}"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            return f"Ang kita noong {date} ay ₱{data['total_sales']:.2f}."
        else:
            return f"❌ Error: {response.status_code} - {response.text}"
    except Exception as e:
        return f"❌ Exception: {str(e)}"


def smart_ask(prompt: str) -> str:
    prompt_lower = prompt.lower()

    if "kahapon" in prompt_lower:
        date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        return get_sales(date)

    if "ngayong araw" in prompt_lower or "ngayon" in prompt_lower:
        date = datetime.now().strftime("%Y-%m-%d")
        return get_sales(date)

    # Fallback to LLM
    response = model.generate_content(prompt)
    return response.text


# === CLI Entry Point ===
if __name__ == "__main__":
    while True:
        user_input = input("👤 You: ")
        if user_input.lower() in ["exit", "quit"]:
            break
        reply = smart_ask(user_input)
        print("🤖 Gemini:", reply)
