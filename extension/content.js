// Content script for BATON Knowledge Capture
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_PAGE_CONTENT") {
    try {
      const selectedText = window.getSelection() ? window.getSelection().toString().trim() : "";
      
      // Clean clone of document body without scripts/styles
      const clone = document.body.cloneNode(true);
      const scripts = clone.querySelectorAll("script, style, nav, footer, header, noscript, iframe");
      scripts.forEach(el => el.remove());
      
      const pageText = clone.innerText || clone.textContent || "";
      const cleanText = pageText.replace(/\n\s*\n/g, "\n\n").trim();

      const metaTags = {};
      document.querySelectorAll("meta").forEach(meta => {
        const name = meta.getAttribute("name") || meta.getAttribute("property");
        const val = meta.getAttribute("content");
        if (name && val) {
          metaTags[name] = val;
        }
      });

      sendResponse({
        success: true,
        data: {
          url: window.location.href,
          title: document.title || "Untitled Document",
          selectedText: selectedText,
          content: cleanText.slice(0, 50000), // Cap at 50k chars for security & performance
          metadata: {
            metaTags: metaTags,
            capturedAt: new Date().toISOString()
          }
        }
      });
    } catch (err) {
      sendResponse({ success: false, error: err.message });
    }
    return true; // async callback
  }
});
