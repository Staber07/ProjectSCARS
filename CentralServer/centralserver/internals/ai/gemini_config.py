import json
import os
import google.generativeai as genai

CONFIG_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'config.json')

with open(CONFIG_PATH) as f:
    config = json.load(f)

api_key = config.get("ai", {}).get("gemini_api_key")

if not api_key:
    raise ValueError("Gemini API key not found in config.json under 'ai.gemini_api_key'")

genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-pro")
