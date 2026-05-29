// Open the side panel when the extension icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Screenshot relay — captureVisibleTab is more reliable from the service worker
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action !== "captureTab") return false;
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (!tab) { sendResponse({ error: "no active tab" }); return; }
    chrome.tabs.captureVisibleTab(
      tab.windowId,
      { format: "jpeg", quality: 65 },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ dataUrl });
        }
      }
    );
  });
  return true; // keep message channel open for async response
});
