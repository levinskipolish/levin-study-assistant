const answerEl = document.getElementById("answer");
const pageStatus = document.getElementById("page-status");

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
