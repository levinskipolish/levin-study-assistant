import hashlib

import pytest

from app.utils import extract_question_fingerprint


def _md5(text: str) -> str:
    return hashlib.md5(text.encode()).hexdigest()


def test_numbered_questions_are_extracted():
    content = "1. What is photosynthesis?\n2. Name the planets.\n3. Define osmosis."
    result = extract_question_fingerprint(content)
    expected = _md5("1. What is photosynthesis?\n2. Name the planets.\n3. Define osmosis.")
    assert result == expected


def test_question_mark_lines_are_extracted():
    content = "Some intro text.\nWhat is the capital of France?\nWho wrote Hamlet?"
    result = extract_question_fingerprint(content)
    expected = _md5("What is the capital of France?\nWho wrote Hamlet?")
    assert result == expected


def test_short_question_mark_lines_are_ignored():
    # Lines ending in "?" but <= 15 chars should not be picked up
    content = "Hi?\nWhat is the capital of France?"
    result = extract_question_fingerprint(content)
    expected = _md5("What is the capital of France?")
    assert result == expected


def test_falls_back_to_first_300_chars_when_no_questions():
    content = "No questions here, just plain prose about nothing in particular."
    result = extract_question_fingerprint(content)
    assert result == _md5(content[:300])


def test_same_questions_different_surrounding_text_produce_same_hash():
    base_questions = "1. What is gravity?\n2. Define velocity."
    content_a = f"Chapter 1 intro.\n{base_questions}\nSome extra text at end."
    content_b = f"Different preamble.\n{base_questions}"
    assert extract_question_fingerprint(content_a) == extract_question_fingerprint(content_b)


def test_different_questions_produce_different_hashes():
    content_a = "1. What is gravity?"
    content_b = "1. What is inertia?"
    assert extract_question_fingerprint(content_a) != extract_question_fingerprint(content_b)


def test_q_prefix_questions_are_extracted():
    content = "Q1. What is DNA?\nQ2. Describe mitosis."
    result = extract_question_fingerprint(content)
    expected = _md5("Q1. What is DNA?\nQ2. Describe mitosis.")
    assert result == expected


def test_empty_content_falls_back_gracefully():
    result = extract_question_fingerprint("")
    assert result == _md5("")
