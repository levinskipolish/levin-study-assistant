_answer_cache: dict[str, str] = {}


def get_cached(key: str) -> str | None:
    return _answer_cache.get(key)


def set_cached(key: str, value: str) -> None:
    _answer_cache[key] = value
