from pydantic import BaseModel


class SolveRequest(BaseModel):
    page_content: str
    page_title: str = ""


class SolveResponse(BaseModel):
    response: str
    cached: bool = False
