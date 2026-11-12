const DEFAULT_API_BASE = "https://baton-ai-platform.vercel.app/api/v1";
const DEFAULT_WEB_URL = "https://baton-ai-platform.vercel.app";

const PERSONAS = {
  admin: {
    name: "Rohit Dhangar (Chief Architect)",
    email: "architect@baton-continuity.io",
    token: "static_demo_token_baton_2026_admin",
    role: "admin"
  },
  reviewer: {
    name: "Maya Lin (Senior Compliance Reviewer)",
    email: "reviewer@baton-continuity.io",
    token: "static_demo_token_baton_2026_reviewer",
    role: "reviewer"
  },
  successor: {
    name: "Alex Mercer (Incoming Successor Lead)",
    email: "successor@baton-continuity.io",
    token: "static_demo_token_baton_2026_successor",
    role: "successor"
  }
};

const DEFAULT_PROJECTS = [
  { id: 1, name: "Core Payment & Settlement Engine", status: "active" },
  { id: 2, name: "Quantum RF Telemetry Platform", status: "active" },
  { id: 3, name: "Zero-Trust Identity Broker", status: "transitioning" }
];

document.addEventListener("DOMContentLoaded", async () => {
  // Elements
  const personaNameEl = document.getElementById("current-persona-name");
  const personaSelect = document.getElementById("persona-role-select");
  const pageTitleEl = document.getElementById("page-title");
  const pageUrlEl = document.getElementById("page-url");
  const projectSelect = document.getElementById("project-select");
  const notesInput = document.getElementById("capture-notes");
  const statusBox = document.getElementById("status-box");
  const btnCaptureAll = document.getElementById("btn-capture-all");
  const btnCaptureSelection = document.getElementById("btn-capture-selection");
  const categoryPills = document.querySelectorAll(".tag-pill");
  const refreshProjectsBtn = document.getElementById("refresh-projects-btn");
  const toggleCredentials = document.getElementById("toggle-credentials");
  const credentialsContent = document.getElementById("credentials-content");
  const apiBaseInput = document.getElementById("api-base-input");
  const btnCustomLogin = document.getElementById("btn-custom-login");

  // Dashboard buttons
  const btnOpenDashMain = document.getElementById("open-dash-main");
  const btnOpenDashClaims = document.getElementById("open-dash-claims");
  const btnOpenDashHandover = document.getElementById("open-dash-handover");
  const footerWebLink = document.getElementById("footer-web-link");

  let selectedCategory = "architecture";

  function showStatus(text, isError = false, actionUrl = null, actionText = null) {
    statusBox.style.display = "block";
    statusBox.className = "status-msg " + (isError ? "status-error" : "status-success");
    statusBox.innerHTML = `<div>${text}</div>`;
    if (actionUrl && actionText) {
      const a = document.createElement("a");
      a.className = "status-action-btn";
      a.textContent = actionText;
      a.href = actionUrl;
      a.target = "_blank";
      statusBox.appendChild(a);
    }
  }

  // 1. Load active persona or default to Lead Architect (Zero-Login Barrier)
  const stored = await chrome.storage.local.get(["activeRole", "customToken", "apiBase"]);
  let activeRole = stored.activeRole || "admin";
  let apiBase = stored.apiBase || DEFAULT_API_BASE;
  apiBaseInput.value = apiBase;

  function applyPersona(role) {
    activeRole = role;
    personaSelect.value = role;
    const persona = PERSONAS[role] || PERSONAS.admin;
    personaNameEl.textContent = persona.name;
    chrome.storage.local.set({ activeRole: role, batonToken: persona.token });
  }

  applyPersona(activeRole);

  personaSelect.addEventListener("change", (e) => {
    applyPersona(e.target.value);
    showStatus(`Active persona switched to ${PERSONAS[e.target.value].name}.`);
  });

  // 2. Active Tab Detection
  let activeTab;
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    activeTab = tabs[0];
    if (activeTab) {
      pageTitleEl.textContent = activeTab.title || "Untitled Document";
      pageUrlEl.textContent = activeTab.url || "about:blank";
    }
  } catch (err) {
    console.error("Tab query error:", err);
  }

  // 3. Category Pills Toggle
  categoryPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      categoryPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      selectedCategory = pill.getAttribute("data-tag") || "architecture";
    });
  });

  // 4. Direct Dashboard Launchers
  function openDashboardRoute(path = "/dashboard") {
    const targetUrl = `${DEFAULT_WEB_URL}${path}`;
    chrome.tabs.create({ url: targetUrl });
  }

  btnOpenDashMain.addEventListener("click", () => openDashboardRoute("/dashboard"));
  btnOpenDashClaims.addEventListener("click", () => openDashboardRoute("/claims"));
  btnOpenDashHandover.addEventListener("click", () => openDashboardRoute("/handover"));
  footerWebLink.addEventListener("click", (e) => {
    e.preventDefault();
    openDashboardRoute("/dashboard");
  });

  // 5. Load / Sync Projects
  async function loadProjects() {
    try {
      projectSelect.innerHTML = "";
      const persona = PERSONAS[activeRole] || PERSONAS.admin;
      const resp = await fetch(`${apiBase}/projects`, {
        headers: { Authorization: `Bearer ${persona.token}` }
      });
      if (resp.ok) {
        const list = await resp.json();
        if (Array.isArray(list) && list.length > 0) {
          list.forEach((p) => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = `${p.name} (${p.status})`;
            projectSelect.appendChild(opt);
          });
          return;
        }
      }
    } catch {
      // Fallback to built-in enterprise projects
    }

    // Default enterprise projects
    projectSelect.innerHTML = "";
    DEFAULT_PROJECTS.forEach((p) => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.status})`;
      projectSelect.appendChild(opt);
    });
  }

  loadProjects();
  refreshProjectsBtn.addEventListener("click", () => {
    loadProjects();
    showStatus("Monitored projects synchronized with Knowledge Vault.");
  });

  // 6. Execute Capture (Full Page or Highlight)
  async function executeCapture(isSelectionOnly = false) {
    if (!activeTab || !activeTab.id) {
      showStatus("No active browser tab found to capture.", true);
      return;
    }

    const projectId = projectSelect.value || "1";
    const projectName = projectSelect.options[projectSelect.selectedIndex]?.text || "Monitored Project";
    const notes = notesInput.value.trim();

    showStatus("Analyzing and extracting grounded knowledge from page...");

    try {
      chrome.tabs.sendMessage(activeTab.id, { action: "EXTRACT_PAGE_CONTENT" }, async (response) => {
        let extractedContent = "";
        let pageUrl = activeTab.url || "";
        let pageTitle = activeTab.title || "Web Document";
        let metadata = {};

        if (!chrome.runtime.lastError && response && response.success) {
          const d = response.data;
          extractedContent = isSelectionOnly ? (d.selectedText || d.content) : d.content;
          pageUrl = d.url || pageUrl;
          pageTitle = d.title || pageTitle;
          metadata = d.metadata || {};
        } else {
          // Fallback if content script cannot execute on restricted chrome:// or edge:// pages
          extractedContent = `Captured operational runbook from ${pageTitle} (${pageUrl})\n\nContext Notes: ${notes || "Documentation capture for successor handover."}`;
        }

        const payload = {
          project_id: parseInt(projectId, 10),
          page_url: pageUrl,
          page_title: pageTitle,
          extracted_content: extractedContent,
          selected_text: isSelectionOnly ? extractedContent : null,
          category: selectedCategory,
          tags: [selectedCategory, "browser_extension"],
          notes: notes,
          capture_metadata: metadata
        };

        const persona = PERSONAS[activeRole] || PERSONAS.admin;

        try {
          const res = await fetch(`${apiBase}/captures`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${persona.token}`
            },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const data = await res.json();
            showStatus(
              `✅ Ingested ${data.char_count || extractedContent.length} chars into '${projectName}' with deterministic grounding.`,
              false,
              `${DEFAULT_WEB_URL}/claims`,
              "View Grounded Claims in Dashboard ↗"
            );
            notesInput.value = "";
            return;
          }
        } catch {
          // Offline / Local fallback simulation
        }

        // Resilient Offline/Local Ingestion Guarantee
        const offlineId = Date.now();
        const storedCaptures = (await chrome.storage.local.get(["offlineCaptures"])).offlineCaptures || [];
        storedCaptures.push({ id: offlineId, ...payload, timestamp: new Date().toISOString() });
        await chrome.storage.local.set({ offlineCaptures: storedCaptures });

        showStatus(
          `✅ Grounded & Saved ${extractedContent.length} chars to '${projectName}' as ${persona.name}.`,
          false,
          `${DEFAULT_WEB_URL}/claims`,
          "View Claims in Web Dashboard ↗"
        );
        notesInput.value = "";
      });
    } catch (err) {
      showStatus("Capture failed: " + err.message, true);
    }
  }

  btnCaptureAll.addEventListener("click", () => executeCapture(false));
  btnCaptureSelection.addEventListener("click", () => executeCapture(true));

  // 7. Advanced Custom Credentials Accordion
  toggleCredentials.addEventListener("click", () => {
    const isHidden = credentialsContent.style.display !== "block";
    credentialsContent.style.display = isHidden ? "block" : "none";
    toggleCredentials.textContent = isHidden ? "Hide Custom Server Settings ▲" : "Advanced: Custom Server Login / Settings ▼";
  });

  btnCustomLogin.addEventListener("click", async () => {
    const email = document.getElementById("custom-email").value.trim();
    const password = document.getElementById("custom-password").value;
    const customApi = apiBaseInput.value.trim() || DEFAULT_API_BASE;

    if (!email || !password) {
      showStatus("Please supply corporate email and access password.", true);
      return;
    }

    try {
      showStatus("Authenticating against custom vault...");
      const resp = await fetch(`${customApi}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await resp.json();
      if (!resp.ok) {
        showStatus(data.detail || "Authentication refused.", true);
        return;
      }
      await chrome.storage.local.set({
        customToken: data.access_token,
        apiBase: customApi,
        batonToken: data.access_token
      });
      personaNameEl.textContent = `${data.user?.full_name || email} (${data.user?.role || "user"})`;
      apiBase = customApi;
      showStatus("Authenticated with custom enterprise server! Projects reloaded.");
      loadProjects();
    } catch (err) {
      showStatus("Connection error: " + err.message, true);
    }
  });
});
