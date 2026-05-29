from pydantic import BaseModel


class SolveRequest(BaseModel):
    page_content: str
    page_title: str = ""
    page_screenshot: str | None = None  # base64 JPEG data URL, or None


class SolveResponse(BaseModel):
    response: str
    cached: bool = False
    used_vision: bool = False
