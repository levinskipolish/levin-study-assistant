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
    "The page may contain numbered questions, proposition-style questions (e.g. 'For X to be Y, it must be:'), "
    "or any other multiple-choice format. "
    "For each question or proposition, output ONLY a short identifier and the single correct answer choice. "
    "Use the question number if present, otherwise use Q1, Q2, … in order. "
    "Example: 'Q3. c) randomly selected and representative of the universe.' "
    "One answer per line. No question text, no other options, no explanation, no preamble."
)

llm = ChatOpenAI(model="gpt-4o", temperature=0.3, api_key=_openai_key)
