import { setPageStatus } from "./ui.js";

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
    const [[{ result }], screenshot] = await Promise.allSettled([
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => ({
          text: document.body.innerText,
          title: document.title,
          url: window.location.href,
        }),
      }),
      chrome.tabs.captureVisibleTab(tab.windowId, { format: "jpeg", quality: 65 }),
    ]).then(([textResult, shotResult]) => [
      textResult.status === "fulfilled" ? textResult.value : null,
      shotResult.status === "fulfilled" ? shotResult.value : null,
    ]);

    if (!result) {
      setPageStatus("⚠️ Cannot read this page (try a regular website).");
      return null;
    }

    const truncatedTitle =
      result.title.length > 60 ? result.title.slice(0, 57) + "…" : result.title;
    setPageStatus(`📄 ${truncatedTitle || result.url}`);
    return { ...result, screenshot };
  } catch {
    setPageStatus("⚠️ Cannot read this page (try a regular website).");
    return null;
  }
}
