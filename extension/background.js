// BATON Extension Background Service Worker
const DEFAULT_WEB_URL = "https://baton-ai-platform.vercel.app";

chrome.runtime.onInstalled.addListener(() => {
  console.log("BATON Knowledge Capture Extension initialized.");
  chrome.storage.local.set({
    activeRole: "admin",
    apiBase: "https://baton-ai-platform.vercel.app/api/v1",
    captureHistory: []
  });

  // Create context menu for quick capture
  chrome.contextMenus.create({
    id: "baton-capture-selection",
    title: "⚡ Ingest into BATON Knowledge Vault",
    contexts: ["selection"]
  });

  // Create shortcut to open dashboard
  chrome.contextMenus.create({
    id: "baton-open-dashboard",
    title: "📊 Open BATON Executive Dashboard",
    contexts: ["page", "action"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "baton-open-dashboard") {
    chrome.tabs.create({ url: `${DEFAULT_WEB_URL}/dashboard` });
    return;
  }

  if (info.menuItemId === "baton-capture-selection" && info.selectionText) {
    const selectedText = info.selectionText.trim();
    const pageUrl = tab ? tab.url : "";
    const pageTitle = tab ? tab.title : "Captured Snippet";

    const captureItem = {
      id: Date.now(),
      page_url: pageUrl,
      page_title: pageTitle,
      extracted_content: selectedText,
      selected_text: selectedText,
      category: "operational",
      tags: ["context_menu", "quick_capture"],
      timestamp: new Date().toISOString()
    };

    const stored = await chrome.storage.local.get(["offlineCaptures"]);
    const list = stored.offlineCaptures || [];
    list.push(captureItem);
    await chrome.storage.local.set({ offlineCaptures: list });

    // Open claims dashboard to review the new capture
    chrome.tabs.create({ url: `${DEFAULT_WEB_URL}/claims` });
  }
});
