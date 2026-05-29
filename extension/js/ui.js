const answerEl = document.getElementById("answer");
const pageStatus = document.getElementById("page-status");
const answerMeta = document.getElementById("answer-meta");
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

/**
 * @param {boolean} visible
 * @param {string|null} screenshotDataUrl  base64 data URL of the captured image
 */
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
