import hashlib
import re


def extract_question_fingerprint(content: str) -> str:
    """Hash the question lines found in page content for cache keying."""
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
