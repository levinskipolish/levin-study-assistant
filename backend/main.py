import hashlib
import os
import re

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

load_dotenv()

_openai_key = os.getenv("OPENAI_API_KEY")
if not _openai_key:
    raise RuntimeError("OPENAI_API_KEY is not set. Copy .env.example to .env and fill it in.")

# ── LLM ──────────────────────────────────────────────────────────────────────

llm = ChatOpenAI(model="gpt-4o", temperature=0.3, api_key=_openai_key)

MAX_PAGE_CHARS = 12_000

# In-memory cache: question_hash → answer (cleared on server restart)
_answer_cache: dict[str, str] = {}

# ── Helpers ───────────────────────────────────────────────────────────────────

def _extract_question_fingerprint(content: str) -> str:
    """Hash the question lines found in page content."""
    question_lines: list[str] = []
    for line in content.split("\n"):
        s = line.strip()
        if not s:
            continue
        if re.match(r"^(Q?\d+[\.)\s]|Question\s+\d+)", s, re.IGNORECASE):
            question_lines.append(s[:120])
        elif s.endswith("?") and len(s) > 15:
            question_lines.append(s[:120])
    source = "\n".join(question_lines) if question_lines else content[:300]
    return hashlib.md5(source.encode()).hexdigest()


SOLVE_SYSTEM_PROMPT = (
    "You are a study assistant. "
    "STRICT: for each question output ONLY its number and the correct answer choice. "
    "Example: '1. c) In swing states'. "
    "No question text, no other options, no explanation, no preamble."
)

# ── FastAPI ───────────────────────────────────────────────────────────────────

app = FastAPI(title="Study Assistant API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["Content-Type"],
)

# ── Models ────────────────────────────────────────────────────────────────────

class SolveRequest(BaseModel):
    page_content: str
    page_title: str = ""


class SolveResponse(BaseModel):
    response: str
    cached: bool = False

# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/solve", response_model=SolveResponse)
async def solve(req: SolveRequest) -> SolveResponse:
    content = req.page_content[:MAX_PAGE_CHARS]
    if not content.strip():
        raise HTTPException(status_code=400, detail="page_content must not be empty")

    q_hash = _extract_question_fingerprint(content)

    if q_hash in _answer_cache:
        return SolveResponse(response=_answer_cache[q_hash], cached=True)

    try:
        result = await llm.ainvoke([
            SystemMessage(content=SOLVE_SYSTEM_PROMPT),
            HumanMessage(content=f"Page: {req.page_title}\n\n{content}"),
        ])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    answer = result.content
    _answer_cache[q_hash] = answer
    return SolveResponse(response=answer, cached=False)

