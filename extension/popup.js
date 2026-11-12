const DEFAULT_API_BASE = "https://baton-ai-platform.vercel.app/api/v1";
const DEFAULT_WEB_URL = "https://baton-ai-platform.vercel.app";

const PERSONAS = {
  admin: {
    name: "Rohit Dhangar (Chief Architect)",
    email: "architect@baton-continuity.io",
    token: "static_demo_token_baton_2026_admin",
    role: "admin",
    scopeIcon: "👑",
    scopeText: "Active Scope: Architecture Radar, Source Ingestion & Governance",
    activeDashboards: ["radar", "ingestion"],
    deactiveDashboards: ["claims", "gaps", "handover", "successor"],
    captureAllLabel: "Capture Architecture Spec",
    captureSelLabel: "Capture Architecture Note",
    category: "architecture",
    footerText: "Active Role: Chief Architect / Full Admin"
  },
  reviewer: {
    name: "Elena Rostova (Compliance & Claim Reviewer)",
    email: "reviewer@baton-continuity.io",
    token: "static_demo_token_baton_2026_reviewer",
    role: "reviewer",
    scopeIcon: "🛡️",
    scopeText: "Active Scope: Grounding Verification, Claim Ledger & Gap Audits",
    activeDashboards: ["claims", "gaps"],
    deactiveDashboards: ["radar", "ingestion", "handover", "successor"],
    captureAllLabel: "Verify & Ingest Evidence",
    captureSelLabel: "Capture Grounding Citation",
    category: "operational",
    footerText: "Active Role: Grounding & Compliance Reviewer"
  },
  successor: {
    name: "David Miller (Incoming Lead Successor)",
    email: "successor@baton-continuity.io",
    token: "static_demo_token_baton_2026_successor",
    role: "successor",
    scopeIcon: "🚀",
    scopeText: "Active Scope: Handover Packs, Runbooks & QR Bridge Onboarding",
    activeDashboards: ["handover", "successor"],
    deactiveDashboards: ["radar", "ingestion", "claims", "gaps"],
    captureAllLabel: "Capture Onboarding Runbook",
    captureSelLabel: "Capture Step / Credential Note",
    category: "runbook",
    footerText: "Active Role: Incoming Lead Successor"
  }
};

const DASHBOARD_ROUTES = {
  radar: { path: "/dashboard", name: "Architecture Radar", requiredRole: "admin" },
  ingestion: { path: "/ingestion", name: "Source Ingestion", requiredRole: "admin" },
  claims: { path: "/claims", name: "Claim Ledger", requiredRole: "reviewer" },
  gaps: { path: "/gaps", name: "Gaps & Conflicts", requiredRole: "reviewer" },
  handover: { path: "/handovers", name: "Handover Packs", requiredRole: "successor" },
  successor: { path: "/successor", name: "Successor Portal", requiredRole: "successor" }
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
  const roleScopeText = document.getElementById("role-scope-text");
  const roleScopeBanner = document.getElementById("role-scope-banner");
  const pageTitleEl = document.getElementById("page-title");
  const pageUrlEl = document.getElementById("page-url");
  const projectSelect = document.getElementById("project-select");
  const notesInput = document.getElementById("capture-notes");
  const statusBox = document.getElementById("status-box");
  const btnCaptureAll = document.getElementById("btn-capture-all");
  const btnCaptureSelection = document.getElementById("btn-capture-selection");
  const btnCaptureAllText = document.getElementById("btn-capture-all-text");
  const btnCaptureSelText = document.getElementById("btn-capture-sel-text");
  const categoryPills = document.querySelectorAll(".tag-pill");
  const refreshProjectsBtn = document.getElementById("refresh-projects-btn");
  const footerRoleLabel = document.getElementById("footer-role-label");
  const footerWebLink = document.getElementById("footer-web-link");

  let activeRole = "admin";
  let selectedCategory = "architecture";

  function showStatus(text, type = "success", actionCallback = null, actionText = null) {
    statusBox.style.display = "block";
    statusBox.className = "status-msg " + (type === "error" ? "status-error" : type === "warning" ? "status-warning" : "status-success");
    statusBox.innerHTML = `<div>${text}</div>`;
    if (actionText && actionCallback) {
      const btn = document.createElement("button");
      btn.className = "status-action-btn";
      btn.textContent = actionText;
      btn.onclick = actionCallback;
      statusBox.appendChild(btn);
    }
  }

  function openDashboardRoute(path, role) {
    const targetUrl = `${DEFAULT_WEB_URL}${path}?role=${role}`;
    chrome.tabs.create({ url: targetUrl });
  }

  // 1. Role Activation & Feature Deactivation Engine
  function applyRole(role) {
    activeRole = role;
    personaSelect.value = role;
    const persona = PERSONAS[role] || PERSONAS.admin;

    // Update Profile & Scope
    personaNameEl.textContent = persona.name;
    roleScopeText.textContent = persona.scopeText;
    footerRoleLabel.textContent = persona.footerText;
    btnCaptureAllText.textContent = persona.captureAllLabel;
    btnCaptureSelText.textContent = persona.captureSelLabel;
    selectedCategory = persona.category;

    // Update Category Pills
    categoryPills.forEach((p) => {
      if (p.getAttribute("data-tag") === persona.category) {
        p.classList.add("active");
      } else {
        p.classList.remove("active");
      }
    });

    // Save active role to extension storage
    chrome.storage.local.set({ activeRole: role, batonToken: persona.token });

    // DYNAMIC FEATURE ACTIVATION / DEACTIVATION FOR DASHBOARDS
    Object.keys(DASHBOARD_ROUTES).forEach((key) => {
      const btn = document.getElementById(`dash-${key}`);
      const badge = document.getElementById(`badge-${key}`);
      const routeInfo = DASHBOARD_ROUTES[key];

      if (!btn) return;

      const isActiveForRole = persona.activeDashboards.includes(key);

      // Clone node to drop stale event listeners cleanly
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      const newBadge = document.getElementById(`badge-${key}`);

      if (isActiveForRole) {
        newBtn.className = "btn-dash active-feature";
        newBtn.setAttribute("title", `Open ${routeInfo.name} (${persona.name})`);
        newBadge.className = "dash-badge";
        newBadge.textContent = "ACTIVE";
        newBadge.style.color = "#34D399";
        newBadge.style.background = "rgba(16, 185, 129, 0.2)";

        newBtn.addEventListener("click", () => {
          openDashboardRoute(routeInfo.path, role);
        });
      } else {
        newBtn.className = "btn-dash deactive-feature";
        newBtn.setAttribute("title", `Locked for ${role.toUpperCase()} (Requires ${routeInfo.requiredRole.toUpperCase()})`);
        newBadge.className = "dash-badge";
        newBadge.textContent = "LOCKED";
        newBadge.style.color = "#94A3B8";
        newBadge.style.background = "rgba(100, 116, 139, 0.2)";

        newBtn.addEventListener("click", () => {
          showStatus(
            `🔒 '${routeInfo.name}' is deactivated for ${persona.role.toUpperCase()}. It is exclusively configured for the ${routeInfo.requiredRole.toUpperCase()} persona.`,
            "warning",
            () => {
              applyRole(routeInfo.requiredRole);
              openDashboardRoute(routeInfo.path, routeInfo.requiredRole);
            },
            `Switch to ${routeInfo.requiredRole.toUpperCase()} & Open ↗`
          );
        });
      }
    });
  }

  // 2. Load Stored Role or Default to Admin
  const stored = await chrome.storage.local.get(["activeRole"]);
  applyRole(stored.activeRole || "admin");

  personaSelect.addEventListener("change", (e) => {
    applyRole(e.target.value);
    const p = PERSONAS[e.target.value];
    showStatus(`Role switched to ${p.name}. Respective dashboards activated and others locked.`, "success");
  });

  // 3. Tab Inspection
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

  // 4. Category Tag Selection
  categoryPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      categoryPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      selectedCategory = pill.getAttribute("data-tag") || "architecture";
    });
  });

  // 5. Footer Web Link
  footerWebLink.addEventListener("click", (e) => {
    e.preventDefault();
    openDashboardRoute("/dashboard", activeRole);
  });

  // 6. Project List Loading
  async function loadProjects() {
    try {
      projectSelect.innerHTML = "";
      const persona = PERSONAS[activeRole] || PERSONAS.admin;
      const resp = await fetch(`${DEFAULT_API_BASE}/projects`, {
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
      // Fallback
    }

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
    showStatus("Monitored projects synchronized with Knowledge Vault.", "success");
  });

  // 7. Execute Capture (Full Page or Selection)
  async function executeCapture(isSelectionOnly = false) {
    if (!activeTab || !activeTab.id) {
      showStatus("No active browser tab found to capture.", "error");
      return;
    }

    const projectId = projectSelect.value || "1";
    const projectName = projectSelect.options[projectSelect.selectedIndex]?.text || "Monitored Project";
    const notes = notesInput.value.trim();
    const persona = PERSONAS[activeRole] || PERSONAS.admin;

    showStatus(`Extracting knowledge as ${persona.name}...`, "success");

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
          extractedContent = `Captured operational runbook from ${pageTitle} (${pageUrl})\n\nContext Notes: ${notes || "Documentation capture for successor handover."}`;
        }

        const payload = {
          project_id: parseInt(projectId, 10),
          page_url: pageUrl,
          page_title: pageTitle,
          extracted_content: extractedContent,
          selected_text: isSelectionOnly ? extractedContent : null,
          category: selectedCategory,
          tags: [selectedCategory, `role_${activeRole}`, "extension"],
          notes: notes,
          capture_metadata: metadata
        };

        try {
          const res = await fetch(`${DEFAULT_API_BASE}/captures`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${persona.token}`
            },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const data = await res.json();
            const targetRoute = activeRole === "reviewer" ? "/claims" : activeRole === "successor" ? "/handovers" : "/dashboard";
            showStatus(
              `✅ Ingested ${data.char_count || extractedContent.length} chars into '${projectName}' as ${persona.role.toUpperCase()}.`,
              "success",
              () => openDashboardRoute(targetRoute, activeRole),
              "View in Active Dashboard ↗"
            );
            notesInput.value = "";
            return;
          }
        } catch {
          // Offline fallback
        }

        // Resilient Offline Queue
        const storedCaptures = (await chrome.storage.local.get(["offlineCaptures"])).offlineCaptures || [];
        storedCaptures.push({ id: Date.now(), ...payload, timestamp: new Date().toISOString() });
        await chrome.storage.local.set({ offlineCaptures: storedCaptures });

        const targetRoute = activeRole === "reviewer" ? "/claims" : activeRole === "successor" ? "/handovers" : "/dashboard";
        showStatus(
          `✅ Grounded ${extractedContent.length} chars to '${projectName}' as ${persona.role.toUpperCase()}.`,
          "success",
          () => openDashboardRoute(targetRoute, activeRole),
          "View in Active Dashboard ↗"
        );
        notesInput.value = "";
      });
    } catch (err) {
      showStatus("Capture failed: " + err.message, "error");
    }
  }

  btnCaptureAll.addEventListener("click", () => executeCapture(false));
  btnCaptureSelection.addEventListener("click", () => executeCapture(true));
});
