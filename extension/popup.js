const API_BASE = "http://localhost:8000/api/v1";

document.addEventListener("DOMContentLoaded", async () => {
  const authSection = document.getElementById("auth-section");
  const captureSection = document.getElementById("capture-section");
  const pageTitleEl = document.getElementById("page-title");
  const pageUrlEl = document.getElementById("page-url");
  const projectSelect = document.getElementById("project-select");
  const tagsInput = document.getElementById("capture-tags");
  const notesInput = document.getElementById("capture-notes");
  const statusBox = document.getElementById("status-box");
  const btnLogin = document.getElementById("btn-login");
  const btnCaptureAll = document.getElementById("btn-capture-all");
  const btnCaptureSelection = document.getElementById("btn-capture-selection");

  function showStatus(text, isError = false) {
    statusBox.style.display = "block";
    statusBox.className = "status-msg " + (isError ? "status-error" : "status-success");
    statusBox.textContent = text;
  }

  // 1. Get stored token
  const { batonToken } = await chrome.storage.local.get(["batonToken"]);

  // 2. Query active tab
  let activeTab;
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tabs[0];
    if (activeTab) {
      pageTitleEl.textContent = activeTab.title || "Web Document";
      pageUrlEl.textContent = activeTab.url || "";
    }
  } catch (e) {
    console.error(e);
  }

  if (!batonToken) {
    authSection.style.display = "block";
    captureSection.style.display = "none";
  } else {
    authSection.style.display = "none";
    captureSection.style.display = "block";
    loadProjects(batonToken);
  }

  btnLogin.addEventListener("click", async () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    if (!email || !password) {
      showStatus("Please enter your email and password.", true);
      return;
    }

    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        showStatus(data.detail || "Authentication failed.", true);
        return;
      }

      await chrome.storage.local.set({ batonToken: data.access_token });
      authSection.style.display = "none";
      captureSection.style.display = "block";
      showStatus("Authenticated with BATON Vault!");
      loadProjects(data.access_token);
    } catch (err) {
      showStatus("Connection error to BATON backend: " + err.message, true);
    }
  });

  async function loadProjects(token) {
    try {
      const resp = await fetch(`${API_BASE}/projects`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (resp.status === 401) {
        chrome.storage.local.remove(["batonToken"]);
        authSection.style.display = "block";
        captureSection.style.display = "none";
        return;
      }
      const projects = await resp.json();
      projectSelect.innerHTML = "";
      if (projects.length === 0) {
        projectSelect.innerHTML = '<option value="">No projects found (create one on dashboard)</option>';
      } else {
        projects.forEach(p => {
          const opt = document.createElement("option");
          opt.value = p.id;
          opt.textContent = `${p.name} (${p.status})`;
          projectSelect.appendChild(opt);
        });
      }
    } catch (err) {
      showStatus("Could not fetch projects: " + err.message, true);
    }
  }

  async function executeCapture(isSelectionOnly = false) {
    const projectId = projectSelect.value;
    if (!projectId) {
      showStatus("Please select a target project.", true);
      return;
    }

    const { batonToken } = await chrome.storage.local.get(["batonToken"]);
    if (!batonToken) {
      showStatus("Session expired, please sign in.", true);
      return;
    }

    showStatus("Extracting grounded content from page...");

    try {
      chrome.tabs.sendMessage(activeTab.id, { action: "EXTRACT_PAGE_CONTENT" }, async (response) => {
        if (chrome.runtime.lastError || !response || !response.success) {
          showStatus("Error extracting text: Refresh page or check active permissions.", true);
          return;
        }

        const pageData = response.data;
        const tags = tagsInput.value.split(",").map(t => t.trim()).filter(Boolean);
        const notes = notesInput.value.trim();

        const payload = {
          page_url: pageData.url,
          page_title: pageData.title,
          extracted_content: isSelectionOnly ? (pageData.selectedText || pageData.content) : pageData.content,
          selected_text: isSelectionOnly ? pageData.selectedText : null,
          capture_metadata: pageData.metadata,
          project_id: parseInt(projectId, 10),
          tags: tags,
          notes: notes
        };

        const postResp = await fetch(`${API_BASE}/captures`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${batonToken}`
          },
          body: JSON.stringify(payload)
        });

        const postData = await postResp.json();
        if (!postResp.ok) {
          showStatus(postData.detail || "Capture failed.", true);
        } else {
          showStatus(`Captured successfully! ${postData.char_count} chars ingested & grounded.`);
          notesInput.value = "";
        }
      });
    } catch (err) {
      showStatus("Capture failed: " + err.message, true);
    }
  }

  btnCaptureAll.addEventListener("click", () => executeCapture(false));
  btnCaptureSelection.addEventListener("click", () => executeCapture(true));
});

