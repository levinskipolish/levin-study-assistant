import { setPageStatus } from "./ui.js";

/**
 * Asks the background service worker to capture the current tab screenshot.
 * Returns the data URL string, or null on any failure.
 *
 * @returns {Promise<string|null>}
 */
async function captureScreenshot() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: "captureTab" }, (resp) => {
      if (chrome.runtime.lastError || !resp || resp.error || !resp.dataUrl) {
        resolve(null);
      } else {
        resolve(resp.dataUrl);
      }
    });
  });
}

/**
 * Reads the active tab's text, title, URL, and a JPEG screenshot.
 * Updates the page status bar and returns the data, or null on failure.
 * Screenshot capture is best-effort — if it fails the field is null.
 *
 * @returns {Promise<{text: string, title: string, url: string, screenshot: string|null}|null>}
 */
export async function captureCurrentTab() {
  setPageStatus("Capturing page…");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    setPageStatus("No active tab found.");
    return null;
  }

  try {
    // First pass: get text content + detect whether the page has visual elements
    const [textResult] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        text: document.body.innerText,
        title: document.title,
        url: window.location.href,
        hasVisuals: document.querySelectorAll("img, canvas, svg, figure, video").length > 0,
      }),
    });

    const result = textResult?.result;
    if (!result) {
      setPageStatus("\u26a0\ufe0f Cannot read this page (try a regular website).");
      return null;
    }

    // Only pay for a screenshot when the page actually has visual content
    const screenshot = result.hasVisuals ? await captureScreenshot() : null;

    const truncatedTitle =
      result.title.length > 60 ? result.title.slice(0, 57) + "…" : result.title;
    setPageStatus(`📄 ${truncatedTitle || result.url}`);
    return { ...result, screenshot };
  } catch {
    setPageStatus("⚠️ Cannot read this page (try a regular website).");
    return null;
  }
}
