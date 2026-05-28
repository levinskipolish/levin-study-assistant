const API_URL = "http://localhost:8000";

const answerEl = document.getElementById("answer");
const solveBtn = document.getElementById("solve-btn");
const refreshBtn = document.getElementById("refresh-btn");
const pageStatus = document.getElementById("page-status");

let pageData = { text: "", title: "", url: "" };
let updateDebounceTimer = null;

// ── Quiz detection (mirrors backend fingerprint logic) ────────────────────────

function hasQuestions(text) {
  let count = 0;
  for (const line of text.split("\n")) {
    const s = line.trim();
    if (!s) continue;
    if (/^(Q?\d+[.)]\s|Question\s+\d+)/i.test(s)) count++;
    else if (s.endsWith("?") && s.length > 15) count++;
    if (count >= 2) return true;
  }
  return false;
}

// ── UI helpers ────────────────────────────────────────────────────────────────

function setAnswer(text, state = "ready") {
  answerEl.className = state;
  answerEl.textContent = text;
}

// ── Page capture ──────────────────────────────────────────────────────────────

async function captureCurrentTab() {
  pageStatus.textContent = "Capturing page…";
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    pageStatus.textContent = "No active tab found.";
    return false;
  }
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        text: document.body.innerText,
        title: document.title,
        url: window.location.href,
      }),
    });
    pageData = result;
    const truncatedTitle =
      pageData.title.length > 60
        ? pageData.title.slice(0, 57) + "…"
        : pageData.title;
    pageStatus.textContent = `📄 ${truncatedTitle || pageData.url}`;
    return true;
  } catch {
    pageStatus.textContent = "⚠️ Cannot read this page (try a regular website).";
    pageData = { text: "", title: "", url: "" };
    return false;
  }
}

// ── Main page scan ────────────────────────────────────────────────────────────

async function scanPage() {
  solveBtn.hidden = true;
  setAnswer("", "ready");

  const ok = await captureCurrentTab();
  if (!ok) return;

  if (hasQuestions(pageData.text)) {
    solveBtn.hidden = false;
    setAnswer("Quiz detected — press Solve Quiz for answers.", "ready");
  } else {
    setAnswer("No quiz detected on this page.", "ready");
  }
}

// ── Solve ─────────────────────────────────────────────────────────────────────

async function solveQuiz() {
  if (!pageData.text) return;
  solveBtn.disabled = true;
  setAnswer("Solving…", "loading");

  try {
    const res = await fetch(`${API_URL}/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_content: pageData.text,
        page_title: pageData.title,
      }),
    });
    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const data = await res.json();
    setAnswer(data.response, "ready");
  } catch (err) {
    setAnswer(`Error: ${err.message}`, "error");
  } finally {
    solveBtn.disabled = false;
  }
}

// ── Storage signal bus (fired by content.js) ──────────────────────────────────

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local" || !changes.pageUpdated) return;
  clearTimeout(updateDebounceTimer);
  updateDebounceTimer = setTimeout(scanPage, 1500);
});

// ── Event listeners ───────────────────────────────────────────────────────────

solveBtn.addEventListener("click", solveQuiz);
refreshBtn.addEventListener("click", scanPage);

// ── Init ──────────────────────────────────────────────────────────────────────

scanPage();
