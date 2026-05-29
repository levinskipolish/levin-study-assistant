const answerEl = document.getElementById("answer");
const pageStatus = document.getElementById("page-status");
const answerMeta = document.getElementById("answer-meta");
const monitorWarning = document.getElementById("monitor-warning");
const monitorText = document.getElementById("monitor-text");
const visionBadge = document.getElementById("vision-badge");
const visionPreview = document.getElementById("vision-preview");
const visionImg = document.getElementById("vision-img");

visionBadge.addEventListener("click", () => {
  const open = visionPreview.hidden;
  visionPreview.hidden = !open;
  visionBadge.setAttribute("aria-expanded", String(open));
  visionBadge.textContent = open
    ? "\u{1F4F7} Analyzed with image \u25B2"
    : "\u{1F4F7} Analyzed with image \u25BC";
});

/**
 * @param {string} text
 * @param {"ready"|"loading"|"error"} state
 */
export function setAnswer(text, state = "ready") {
  answerEl.className = state;
  answerEl.textContent = text;
}

/** @param {string} text */
export function setPageStatus(text) {
  pageStatus.textContent = text;
}

/** @param {boolean} visible */
export function setVisionBadge(visible, screenshotDataUrl = null) {
  if (!visible) {
    answerMeta.hidden = true;
    visionPreview.hidden = true;
    visionImg.src = "";
    visionBadge.setAttribute("aria-expanded", "false");
    visionBadge.textContent = "\u{1F4F7} Analyzed with image \u25BC";
    return;
  }
  answerMeta.hidden = false;
  if (screenshotDataUrl) {
    visionImg.src = screenshotDataUrl;
  }
}

/**
 * @param {string[]} signals  list of detection strings; empty array clears the warning
 */
export function setMonitorWarning(signals) {
  if (!signals.length) {
    monitorWarning.hidden = true;
    monitorText.textContent = "";
    return;
  }
  monitorText.textContent = signals.join(" \u00b7 ");
  monitorWarning.hidden = false;
}
