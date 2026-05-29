import { API_URL } from "./config.js";

/**
 * Sends page content (and optional screenshot) to the backend and returns the solution.
 *
 * @param {string} pageContent
 * @param {string} pageTitle
 * @param {string|null} screenshot  base64 JPEG data URL, or null
 * @returns {Promise<{response: string, cached: boolean}>}
 * @throws {Error} on non-2xx responses or network failures
 */
export async function fetchSolution(pageContent, pageTitle, screenshot = null) {
  const res = await fetch(`${API_URL}/solve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      page_content: pageContent,
      page_title: pageTitle,
      page_screenshot: screenshot,
    }),
  });

  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json();
}
