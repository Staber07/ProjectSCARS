import os, json

CONFIG_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "config.json"))
with open(CONFIG_PATH) as f:
    config = json.load(f)