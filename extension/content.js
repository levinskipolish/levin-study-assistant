let lastUrl = location.href;
let lastTextLength = document.body?.innerText?.length ?? 0;
let debounceTimer = null;

// Write a timestamp to storage — side panel watches chrome.storage.onChanged,
// which is reliable even when the MV3 service worker is sleeping.
function notifyPageUpdated() {
  chrome.storage.local.set({ pageUpdated: Date.now() });
}

// Notify immediately when the content script initializes (covers full-page navigations)
notifyPageUpdated();

// Watch for SPA URL changes and significant DOM mutations (dynamic content, quiz loaders, etc.)
const observer = new MutationObserver(() => {
  const currentUrl = location.href;

  if (currentUrl !== lastUrl) {
    // URL changed (SPA/history navigation)
    lastUrl = currentUrl;
    clearTimeout(debounceTimer);
    notifyPageUpdated();
    return;
  }

  // Same URL — wait for DOM to settle, then check for significant text change
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    const newLength = document.body?.innerText?.length ?? 0;
    if (Math.abs(newLength - lastTextLength) > 150) {
      lastTextLength = newLength;
      notifyPageUpdated();
    }
  }, 2000);
});

observer.observe(document.documentElement, { childList: true, subtree: true });
