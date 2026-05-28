import pytest

import app.cache as cache_module
from app.cache import get_cached, set_cached


@pytest.fixture(autouse=True)
def clear_cache():
    """Reset the in-memory cache before each test."""
    cache_module._answer_cache.clear()
    yield
    cache_module._answer_cache.clear()


def test_get_returns_none_for_missing_key():
    assert get_cached("nonexistent") is None


def test_set_and_get_round_trip():
    set_cached("key1", "answer one")
    assert get_cached("key1") == "answer one"


def test_overwrite_existing_key():
    set_cached("key1", "first")
    set_cached("key1", "second")
    assert get_cached("key1") == "second"


def test_multiple_keys_are_independent():
    set_cached("a", "alpha")
    set_cached("b", "beta")
    assert get_cached("a") == "alpha"
    assert get_cached("b") == "beta"
