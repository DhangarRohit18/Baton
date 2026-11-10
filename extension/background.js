// BATON Extension Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("BATON Knowledge Capture Extension initialized.");
  chrome.storage.local.set({
    apiBaseUrl: "http://localhost:8000/api/v1",
    captureHistory: []
  });
});

