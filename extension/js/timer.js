const timerPageEl = document.getElementById("timer-page");
const timerTotalEl = document.getElementById("timer-total");

let totalSeconds = 0;
let pageSeconds = 0;
let pageInterval = null;

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// Session timer — starts when the panel opens, never resets
setInterval(() => {
  totalSeconds++;
  timerTotalEl.textContent = formatTime(totalSeconds);
}, 1000);

/**
 * Resets the per-page timer to 0:00 and starts counting.
 * Call this each time a new page is captured.
 */
export function resetPageTimer() {
  clearInterval(pageInterval);
  pageSeconds = 0;
  timerPageEl.textContent = "0:00";
  pageInterval = setInterval(() => {
    pageSeconds++;
    timerPageEl.textContent = formatTime(pageSeconds);
  }, 1000);
}
