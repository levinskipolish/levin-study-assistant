import os

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()

_openai_key = os.getenv("OPENAI_API_KEY")
if not _openai_key:
    raise RuntimeError(
        "OPENAI_API_KEY is not set. Copy .env.example to .env and fill it in."
    )

MAX_PAGE_CHARS: int = 12_000

SOLVE_SYSTEM_PROMPT: str = (
    "You are a study assistant. "
    "STRICT: for each question output ONLY its number and the correct answer choice. "
    "Example: '1. c) In swing states'. "
    "No question text, no other options, no explanation, no preamble."
)

llm = ChatOpenAI(model="gpt-4o", temperature=0.3, api_key=_openai_key)
