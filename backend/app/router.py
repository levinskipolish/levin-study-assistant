from fastapi import APIRouter, HTTPException
from langchain_core.messages import HumanMessage, SystemMessage

from .cache import get_cached, set_cached
from .config import MAX_PAGE_CHARS, SOLVE_SYSTEM_PROMPT, llm
from .models import SolveRequest, SolveResponse
from .utils import extract_question_fingerprint

router = APIRouter()


@router.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@router.post("/solve", response_model=SolveResponse)
async def solve(req: SolveRequest) -> SolveResponse:
    content = req.page_content[:MAX_PAGE_CHARS]
    if not content.strip():
        raise HTTPException(status_code=400, detail="page_content must not be empty")

    q_hash = extract_question_fingerprint(content)
    cached = get_cached(q_hash)
    if cached is not None:
        return SolveResponse(response=cached, cached=True)

    try:
        result = await llm.ainvoke([
            SystemMessage(content=SOLVE_SYSTEM_PROMPT),
            HumanMessage(content=f"Page: {req.page_title}\n\n{content}"),
        ])
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    answer = result.content
    set_cached(q_hash, answer)
    return SolveResponse(response=answer, cached=False)
