import { setAnswer } from "./js/ui.js";
import { captureCurrentTab } from "./js/capture.js";
import { fetchSolution } from "./js/api.js";

const solveBtn = document.getElementById("solve-btn");
const refreshBtn = document.getElementById("refresh-btn");

let pageData = null;
let updateDebounceTimer = null;

// ── Main page scan ────────────────────────────────────────────────────────────

async function scanPage() {
  solveBtn.hidden = true;
  setAnswer("", "ready");

  pageData = await captureCurrentTab();
  if (!pageData) return;

  solveBtn.hidden = false;
}

// ── Solve ─────────────────────────────────────────────────────────────────────

async function solveQuiz() {
  if (!pageData?.text) return;
  solveBtn.disabled = true;
  setAnswer("Solving…", "loading");

  try {
    const data = await fetchSolution(pageData.text, pageData.title);
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

// ── Event listeners + init ────────────────────────────────────────────────────

solveBtn.addEventListener("click", solveQuiz);
refreshBtn.addEventListener("click", scanPage);
scanPage();
