// Open the side panel when the extension icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
// Page-update notifications are handled via chrome.storage.onChanged in the side panel.
// No relay needed here.
