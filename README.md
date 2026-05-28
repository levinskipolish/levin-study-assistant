# Levin Study Assistant

An AI-powered Chrome extension that detects quiz questions on any webpage and solves them with a single click. Powered by GPT-4o via a local FastAPI backend.

---

## How it works

1. Load any page with a quiz or study questions.
2. Open the **Levin Study Assistant** side panel (click the extension icon).
3. When questions are detected, a **Solve Quiz** button appears.
4. Click it — answers are returned instantly, cached so repeated clicks cost nothing.

The extension never auto-submits anything. It only reads page content and displays answers in the side panel.

---

## Project structure

```
levin/
├── extension/          # Chrome MV3 extension
│   ├── manifest.json
│   ├── background.js
│   ├── content.js
│   ├── sidepanel.html
│   ├── sidepanel.js
│   └── sidepanel.css
└── backend/            # FastAPI backend
    ├── main.py         # Entry point (uvicorn main:app)
    ├── app/
    │   ├── config.py   # Env vars, constants, LLM instance
    │   ├── models.py   # Pydantic request/response models
    │   ├── cache.py    # In-memory answer cache
    │   ├── utils.py    # Question fingerprinting
    │   └── router.py   # /health and /solve endpoints
    └── tests/
        ├── test_utils.py
        ├── test_cache.py
        └── test_routes.py
```

---

## Prerequisites

- Python 3.12+
- [Poetry](https://python-poetry.org/docs/#installation)
- An [OpenAI API key](https://platform.openai.com/api-keys)
- Google Chrome (or any Chromium browser)

---

## Setup

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-...
```

Install dependencies and start the server:

```bash
poetry install
poetry run uvicorn main:app --reload
```

The API will be running at `http://localhost:8000`. You can verify it at `http://localhost:8000/health`.

### 2. Chrome extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked** and select the `extension/` folder
4. The Levin Study Assistant icon will appear in your toolbar

> The extension expects the backend at `http://localhost:8000`. Keep the server running while using it.

---

## Running tests

```bash
cd backend
poetry run pytest tests/ -v
```

Tests cover the cache, fingerprinting utility, and all API endpoints. The LLM is mocked so tests run instantly without any API calls.

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Extension | Chrome MV3, vanilla JS |
| Backend | FastAPI, Python 3.12+ |
| LLM | GPT-4o via `langchain-openai` |
| Dependency management | Poetry |
| Testing | pytest, pytest-asyncio, httpx |

---

## License

MIT
