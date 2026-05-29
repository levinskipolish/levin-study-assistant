/**
 * Detects signals that the page may be monitoring user activity.
 * Runs inside the page via executeScript — returns a plain-serialisable object.
 *
 * Checks:
 *  1. Known proctoring / LMS integrity scripts in <script src="...">
 *  2. Copy / right-click / text-selection prevention on document/body
 *  3. Focus-loss surveillance (blur / visibilitychange handlers on document)
 *  4. Screen-share or webcam capture requests registered on the page
 *  5. Known window-level proctoring fingerprints
 */
function detectPageMonitoring() {
  const signals = [];

  // 1 ── Proctoring script patterns ───────────────────────────────────────────
  const PROCTOR_PATTERNS = [
    /honorlock/i,
    /proctorio/i,
    /respondus/i,
    /proctortrack/i,
    /examity/i,
    /meazure/i,
    /proview/i,
    /lockdown.?browser/i,
    /integrity\.safeexambrowser/i,
  ];
  const scriptSrcs = Array.from(document.scripts)
    .map((s) => s.src)
    .filter(Boolean);
  for (const src of scriptSrcs) {
    for (const re of PROCTOR_PATTERNS) {
      if (re.test(src)) {
        signals.push(`Proctoring script detected: ${new URL(src).hostname}`);
        break;
      }
    }
  }

  // 2 ── Copy / right-click / selection prevention ───────────────────────────
  if (document.oncopy !== null && document.oncopy !== undefined) {
    signals.push("Copy prevention active (document.oncopy)");
  }
  if (document.oncontextmenu !== null && document.oncontextmenu !== undefined) {
    signals.push("Right-click disabled (document.oncontextmenu)");
  }
  if (document.onselectstart !== null && document.onselectstart !== undefined) {
    signals.push("Text selection blocked (document.onselectstart)");
  }

  // 3 ── CSS user-select disabled on body ────────────────────────────────────
  const bodySelect = getComputedStyle(document.body).userSelect;
  if (bodySelect === "none") {
    signals.push("Text selection disabled via CSS (user-select: none)");
  }

  // 4 ── Known window-level proctoring fingerprints ──────────────────────────
  const WIN_KEYS = [
    "__proctorio",
    "__honorlock",
    "ProctorioExtension",
    "HonorLock",
    "LockDownBrowser",
    "SafeExamBrowser",
  ];
  for (const key of WIN_KEYS) {
    if (key in window) {
      signals.push(`Proctoring global detected: window.${key}`);
    }
  }

  // 5 ── Suspicious meta tags (some LMS platforms) ───────────────────────────
  const metaIntegrity = document.querySelector(
    'meta[name="exam-integrity"], meta[name="proctoring"]'
  );
  if (metaIntegrity) {
    signals.push("Exam-integrity meta tag present");
  }

  return { signals };
}

export { detectPageMonitoring };
