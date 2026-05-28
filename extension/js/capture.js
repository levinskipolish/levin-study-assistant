import { setPageStatus } from "./ui.js";

/**
 * Reads the active tab's text, title, and URL via scripting.
 * Updates the page status bar and returns the data, or null on failure.
 *
 * @returns {Promise<{text: string, title: string, url: string}|null>}
 */
export async function captureCurrentTab() {
  setPageStatus("Capturing page…");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    setPageStatus("No active tab found.");
    return null;
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

    const truncatedTitle =
      result.title.length > 60 ? result.title.slice(0, 57) + "…" : result.title;
    setPageStatus(`📄 ${truncatedTitle || result.url}`);
    return result;
  } catch {
    setPageStatus("⚠️ Cannot read this page (try a regular website).");
    return null;
  }
}
