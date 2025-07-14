import re
import typing
from spellchecker import SpellChecker
from rapidfuzz import process

from centralserver.internals.ai.intents import INTENT_KEYWORDS

spell = SpellChecker(language='en')

all_keywords = [kw for kws in INTENT_KEYWORDS.values() for kw in kws]

def correct_typos_advanced(text: str) -> str:
    tokens = re.findall(r"\w+|[^\w\s]", text, re.UNICODE)
    corrected_tokens: typing.List[str] = []

    for token in tokens:
        if token.isalpha():
            match = process.extractOne(token.lower(), [k.lower() for k in all_keywords])
            if match and match[1] > 85:
                corrected_tokens.append(match[0])
            else:
                corrected_word = spell.correction(token)
                corrected_tokens.append(corrected_word if corrected_word else token)
        else:
            corrected_tokens.append(token)

    output = ""
    for t in corrected_tokens:
        if re.match(r"[^\w\s]", t):
            output += t
        else:
            if output and not output.endswith(" "):
                output += " "
            output += t
    return output.strip()
