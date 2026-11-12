const DEFAULT_API_BASE = "https://baton-ai-platform.vercel.app/api/v1";

const ROLE_CONFIGS = {
  admin: {
    name: "Rohit Dhangar (Chief Architect)",
    role: "admin",
    tabs: [
      { id: "capture", label: "⚡ Ingest Capture" },
      { id: "radar", label: "📊 Architecture Radar" },
      { id: "ingestion", label: "📁 Sources Hub" }
    ],
    defaultView: "radar",
    footerText: "Role: Chief Architect / Full Admin"
  },
  reviewer: {
    name: "Elena Rostova (Compliance & Claim Reviewer)",
    role: "reviewer",
    tabs: [
      { id: "capture", label: "⚡ Citation Capture" },
      { id: "claims", label: "⚖️ Claim Ledger" },
      { id: "gaps", label: "🛡️ Gaps & Conflicts" }
    ],
    defaultView: "claims",
    footerText: "Role: Grounding & Compliance Reviewer"
  },
  successor: {
    name: "David Miller (Incoming Lead Successor)",
    role: "successor",
    tabs: [
      { id: "capture", label: "⚡ Notes Capture" },
      { id: "handover", label: "📑 Handover Dossier" },
      { id: "successor", label: "👤 Successor & QR" }
    ],
    defaultView: "handover",
    footerText: "Role: Incoming Lead Successor"
  }
};

// Built-in Enterprise Seed Data for In-Extension Execution
const IN_MEMORY_PROJECTS = [
  { id: 1, name: "Core Payment & Settlement Engine", docs: 14, claims: 28, gaps: 4, risk: "0.82 (High)", status: "Transitioning" },
  { id: 2, name: "Quantum RF Telemetry Platform", docs: 9, claims: 16, gaps: 1, risk: "0.35 (Low)", status: "Active" },
  { id: 3, name: "Zero-Trust Identity Broker", docs: 18, claims: 35, gaps: 3, risk: "0.68 (Medium)", status: "Transitioning" }
];

const IN_MEMORY_SOURCES = [
  { title: "Payment_Orchestrator_Architecture_v2.pdf", type: "PDF Document", chunks: 24, sha: "8f4b2a1c...9e3d" },
  { title: "github.com/acme/payment-core (main)", type: "GitHub Repo", chunks: 38, sha: "a1c7e920...4f8b" },
  { title: "Database_Failover_Runbook.md", type: "Operational Markdown", chunks: 12, sha: "5d83b10c...7e2a" },
  { title: "Zero_Trust_mTLS_Istio_Policies.yaml", type: "Infrastructure Spec", chunks: 16, sha: "3e9b110a...6f4c" }
];

let IN_MEMORY_CLAIMS = [
  {
    id: 1,
    statement: "Primary PostgreSQL database failover to secondary replica is automated via PgBouncer within 15 seconds.",
    category: "Architecture",
    grounding: "96% Grounded",
    evidence: "Chunk #3: 'PgBouncer health-check watchdog triggers secondary promotion within 15s'",
    status: "verified"
  },
  {
    id: 2,
    statement: "Master encryption key for PCI card tokenization is rotated bi-weekly using AWS KMS HSM.",
    category: "Credentials",
    grounding: "91% Grounded",
    evidence: "Chunk #7: 'KMS customer master key rotated via automated 14-day schedule'",
    status: "verified"
  },
  {
    id: 3,
    statement: "Redis cluster failover handles network partition using quorum of 3 sentinel nodes.",
    category: "Operational",
    grounding: "88% Grounded",
    evidence: "Chunk #11: 'Sentinel minimum quorum established at 3 nodes for master election'",
    status: "verified"
  },
  {
    id: 4,
    statement: "All external webhook deliveries retry with exponential backoff capping at 5 attempts.",
    category: "Operations",
    grounding: "94% Grounded",
    evidence: "Chunk #2: 'Webhook dispatcher worker enforces max 5 retries with jitter'",
    status: "approved"
  },
  {
    id: 5,
    statement: "Legacy billing invoice cron worker must be manually restarted if queue exceeds 1,000 jobs.",
    category: "Unfinished",
    grounding: "82% Unverified",
    evidence: "Extracted from Slack capture; pending formal confirmation in runbook",
    status: "unverified"
  }
];

let IN_MEMORY_GAPS = [
  {
    id: 1,
    title: "Missing HSM Master Encryption Key Rotation Runbook",
    severity: "Critical",
    category: "Credentials",
    desc: "No formal procedure documented for manual emergency rotation if KMS master key is compromised.",
    question: "Where are the secondary offline recovery shards stored, and who possesses M-of-N authorization?"
  },
  {
    id: 2,
    title: "Uncertain Redis Cluster Behavior Under Split-Brain",
    severity: "High",
    category: "Architecture",
    desc: "Telemetry indicates occasional dropped writes when multi-region replication latency exceeds 40ms.",
    question: "What is the intended data reconciliation policy if split-brain occurs during peak trading volume?"
  },
  {
    id: 3,
    title: "Undocumented Legacy Cron Dependents",
    severity: "Medium",
    category: "Operations",
    desc: "Cron schedule in billing worker references hardcoded external SFTP endpoint.",
    question: "Which external partner consumes the nightly batch reconciliation files?"
  }
];

const IN_MEMORY_HANDOVER = {
  title: "Core Payment Engine & Successor Continuity Dossier",
  sections: [
    {
      id: "exec",
      title: "1. Executive Transition Brief",
      content: "This Continuity Dossier consolidates 28 evidence-grounded claims, 4 operational dependencies, and 3 active risk mitigations for the Core Payment & Settlement Engine. The system processes $42M daily with 99.99% availability."
    },
    {
      id: "arch",
      title: "2. Architecture Baseline & Decisions",
      content: "• Event-Driven Microservices anchored on Kafka cluster (3 brokers).\n• Primary PostgreSQL with read replicas; zero-downtime rolling migrations via Alembic.\n• Redis 7 caching tier with Sentinel quorum.\n• All internal services communicate via mTLS Istio service mesh."
    },
    {
      id: "runbook",
      title: "3. Operational Runbook & Emergency Recovery",
      content: "• Database Failover: Automatic via PgBouncer. Manual override: 'kubectl exec pgbouncer-0 -- promote-secondary'.\n• Deployment Rollback: 'argocd app rollback payment-engine-prod'.\n• Monitoring: Grafana dashboard 'Payment TPS & Latency P99'; PagerDuty escalation tier 1."
    },
    {
      id: "action_plan",
      title: "4. First 30-Day Successor Action Plan",
      content: "• Days 1–7: Audit IAM roles, verify staging database replica, shadow on-call incidents.\n• Days 8–15: Resolve HSM rotation gap and conduct dry-run failover test.\n• Days 16–30: Assume solo release authorization; archive departing member's keys."
    }
  ]
};

document.addEventListener("DOMContentLoaded", async () => {
  // Common UI Elements
  const personaNameEl = document.getElementById("current-persona-name");
  const personaSelect = document.getElementById("persona-role-select");
  const roleTabsNav = document.getElementById("role-tabs-nav");
  const footerRoleLabel = document.getElementById("footer-role-label");
  const footerActiveViewBadge = document.getElementById("footer-active-view-badge");
  const statusBox = document.getElementById("status-box");

  // Capture Elements
  const pageTitleEl = document.getElementById("page-title");
  const pageUrlEl = document.getElementById("page-url");
  const projectSelect = document.getElementById("project-select");
  const notesInput = document.getElementById("capture-notes");
  const btnCaptureAll = document.getElementById("btn-capture-all");
  const btnCaptureSelection = document.getElementById("btn-capture-selection");
  const categoryPills = document.querySelectorAll(".tag-pill");

  let activeRole = "admin";
  let currentActiveTabId = "radar";
  let selectedCategory = "architecture";

  function showStatus(text, type = "success") {
    statusBox.style.display = "block";
    statusBox.className = "status-msg " + (type === "error" ? "status-error" : type === "warning" ? "status-warning" : "status-success");
    statusBox.textContent = text;
    setTimeout(() => {
      statusBox.style.display = "none";
    }, 4500);
  }

  // Active Tab Switcher
  function switchView(tabId) {
    currentActiveTabId = tabId;

    // Toggle Tab Buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      if (btn.getAttribute("data-tab-id") === tabId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Toggle View Containers
    document.querySelectorAll(".view-content").forEach((view) => {
      if (view.id === `view-${tabId}`) {
        view.classList.add("active");
      } else {
        view.classList.remove("active");
      }
    });

    footerActiveViewBadge.textContent = `Active View: ${tabId.toUpperCase()}`;

    // Render Data if necessary
    if (tabId === "radar") renderRadar();
    if (tabId === "ingestion") renderSources();
    if (tabId === "claims") renderClaims();
    if (tabId === "gaps") renderGaps();
    if (tabId === "handover") renderHandover();
  }

  // Dynamic Role Applier
  function applyRole(role) {
    activeRole = role;
    personaSelect.value = role;
    const config = ROLE_CONFIGS[role] || ROLE_CONFIGS.admin;

    personaNameEl.textContent = config.name;
    footerRoleLabel.textContent = config.footerText;

    // Build Tabs Dynamically for Active Role
    roleTabsNav.innerHTML = "";
    config.tabs.forEach((tab) => {
      const btn = document.createElement("button");
      btn.className = "tab-btn";
      btn.setAttribute("data-tab-id", tab.id);
      btn.textContent = tab.label;
      btn.addEventListener("click", () => switchView(tab.id));
      roleTabsNav.appendChild(btn);
    });

    // Default to the role's primary dashboard view inside the extension
    switchView(config.defaultView);
    chrome.storage.local.set({ activeRole: role });
  }

  personaSelect.addEventListener("change", (e) => {
    applyRole(e.target.value);
    showStatus(`Switched to ${ROLE_CONFIGS[e.target.value].name}. Respective in-extension dashboard loaded.`);
  });

  // 1. Render Radar View (Admin)
  function renderRadar() {
    const listEl = document.getElementById("radar-projects-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    IN_MEMORY_PROJECTS.forEach((p) => {
      const item = document.createElement("div");
      item.style.padding = "6px 8px";
      item.style.background = "var(--card-subtle)";
      item.style.borderRadius = "6px";
      item.style.marginBottom = "5px";
      item.style.border = "1px solid var(--border-color)";
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: var(--text-main); font-size: 11px;">${p.name}</strong>
          <span style="font-size: 9px; font-weight: 700; color: #34D399; background: rgba(16,185,129,0.15); padding: 1px 5px; border-radius: 3px;">${p.status}</span>
        </div>
        <div style="font-size: 9.5px; color: var(--text-muted); margin-top: 3px; display: flex; gap: 8px;">
          <span>📄 ${p.docs} Sources</span>
          <span>⚖️ ${p.claims} Claims</span>
          <span>⚠️ Risk: <strong style="color: ${p.risk.includes('High') ? '#F87171' : '#34D399'};">${p.risk}</strong></span>
        </div>
      `;
      listEl.appendChild(item);
    });
  }

  // 2. Render Sources View (Admin)
  function renderSources() {
    const listEl = document.getElementById("sources-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    IN_MEMORY_SOURCES.forEach((s) => {
      const item = document.createElement("div");
      item.style.padding = "6px 8px";
      item.style.background = "var(--card-subtle)";
      item.style.borderRadius = "6px";
      item.style.marginBottom = "5px";
      item.style.border = "1px solid var(--border-color)";
      item.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: var(--text-main); font-size: 11px;">${s.title}</strong>
          <span style="font-size: 9px; font-weight: 700; color: var(--accent-cyan);">${s.chunks} Chunks</span>
        </div>
        <div style="font-size: 9.5px; color: var(--text-muted); margin-top: 2px; display: flex; justify-content: space-between;">
          <span>${s.type}</span>
          <span style="font-family: monospace;">SHA: ${s.sha}</span>
        </div>
      `;
      listEl.appendChild(item);
    });
  }

  // 3. Render Claims View (Reviewer)
  function renderClaims() {
    const listEl = document.getElementById("claims-list-container");
    const countBadge = document.getElementById("claim-count-badge");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (countBadge) countBadge.textContent = IN_MEMORY_CLAIMS.length;

    IN_MEMORY_CLAIMS.forEach((c) => {
      const card = document.createElement("div");
      card.className = "claim-item";
      card.innerHTML = `
        <div class="claim-header">
          <span class="claim-tag">${c.category}</span>
          <span class="claim-score">${c.grounding}</span>
        </div>
        <div class="claim-text">${c.statement}</div>
        <div style="font-size: 9px; color: var(--text-muted); margin-bottom: 6px; font-style: italic;">
          Evidence: ${c.evidence}
        </div>
        <div class="claim-actions">
          <button class="btn-approve" data-id="${c.id}">
            ${c.status === "approved" ? "✓ Approved" : "Approve Claim"}
          </button>
          <button class="btn-dispute" data-id="${c.id}">
            ${c.status === "disputed" ? "✕ Disputed" : "Dispute"}
          </button>
        </div>
      `;

      card.querySelector(".btn-approve").addEventListener("click", () => {
        c.status = "approved";
        showStatus(`Claim #${c.id} approved and committed to Grounding Ledger.`);
        renderClaims();
      });

      card.querySelector(".btn-dispute").addEventListener("click", () => {
        c.status = "disputed";
        showStatus(`Claim #${c.id} flagged as disputed for architect clarification.`, "warning");
        renderClaims();
      });

      listEl.appendChild(card);
    });
  }

  // 4. Render Gaps View (Reviewer)
  function renderGaps() {
    const listEl = document.getElementById("gaps-list-container");
    if (!listEl) return;
    listEl.innerHTML = "";

    IN_MEMORY_GAPS.forEach((g) => {
      const card = document.createElement("div");
      card.className = "gap-card";
      card.innerHTML = `
        <div class="gap-title">
          <span>${g.title}</span>
          <span style="color: ${g.severity === 'Critical' ? '#F87171' : '#FBBF24'}; font-size: 9px;">${g.severity}</span>
        </div>
        <div class="gap-desc">${g.desc}</div>
        <div style="font-size: 9.5px; color: var(--accent-cyan); margin-bottom: 6px;">
          <strong>Suggested Question:</strong> "${g.question}"
        </div>
        <button class="btn-sm btn-secondary" style="border-color: rgba(16,185,129,0.4); color: #34D399;" data-id="${g.id}">
          Mark Resolved in Exit Interview
        </button>
      `;

      card.querySelector("button").addEventListener("click", () => {
        IN_MEMORY_GAPS = IN_MEMORY_GAPS.filter((item) => item.id !== g.id);
        showStatus(`Gap '${g.title}' resolved.`);
        renderGaps();
      });

      listEl.appendChild(card);
    });
  }

  // 5. Render Handover Dossier (Successor)
  function renderHandover() {
    const listEl = document.getElementById("handover-accordion-container");
    if (!listEl) return;
    listEl.innerHTML = "";

    IN_MEMORY_HANDOVER.sections.forEach((sec, idx) => {
      const item = document.createElement("div");
      item.className = "handover-section";
      item.innerHTML = `
        <div class="handover-section-header" data-sec-id="${sec.id}">
          <span>${sec.title}</span>
          <span style="font-size: 9px;">▼</span>
        </div>
        <div class="handover-section-body" id="body-${sec.id}">
          ${sec.content}
        </div>
      `;

      item.querySelector(".handover-section-header").addEventListener("click", () => {
        const bodyEl = document.getElementById(`body-${sec.id}`);
        const isHidden = bodyEl.style.display === "none";
        bodyEl.style.display = isHidden ? "block" : "none";
      });

      listEl.appendChild(item);
    });

    const copyBtn = document.getElementById("btn-copy-handover");
    if (copyBtn) {
      copyBtn.onclick = () => {
        const markdown = `# ${IN_MEMORY_HANDOVER.title}\n\n` +
          IN_MEMORY_HANDOVER.sections.map((s) => `## ${s.title}\n${s.content}`).join("\n\n");
        navigator.clipboard.writeText(markdown);
        showStatus("Handover Dossier copied to clipboard as Markdown!");
      };
    }
  }

  // 6. Active Tab Detection
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

  // 7. Category Tags Selector
  categoryPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      categoryPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      selectedCategory = pill.getAttribute("data-tag") || "architecture";
    });
  });

  // 8. Capture Engine Execution
  async function executeCapture(isSelectionOnly = false) {
    if (!activeTab || !activeTab.id) {
      showStatus("No active browser tab found to capture.", "error");
      return;
    }

    const projectId = projectSelect.value || "1";
    const projectName = projectSelect.options[projectSelect.selectedIndex]?.text || "Monitored Project";
    const notes = notesInput.value.trim();

    showStatus("Capturing and grounding knowledge directly into vault...");

    try {
      chrome.tabs.sendMessage(activeTab.id, { action: "EXTRACT_PAGE_CONTENT" }, async (response) => {
        let extractedContent = "";
        let pageUrl = activeTab.url || "";
        let pageTitle = activeTab.title || "Web Document";

        if (!chrome.runtime.lastError && response && response.success) {
          const d = response.data;
          extractedContent = isSelectionOnly ? (d.selectedText || d.content) : d.content;
          pageUrl = d.url || pageUrl;
          pageTitle = d.title || pageTitle;
        } else {
          extractedContent = `Captured operational runbook from ${pageTitle} (${pageUrl})\n\nContext Notes: ${notes || "Documentation capture for successor handover."}`;
        }

        // Add to In-Memory Sources directly inside the extension
        IN_MEMORY_SOURCES.unshift({
          title: pageTitle.slice(0, 35) + "...",
          type: isSelectionOnly ? "Web Highlight" : "Full Page Capture",
          chunks: Math.ceil(extractedContent.length / 400),
          sha: "sha256_" + Math.random().toString(36).substring(2, 8)
        });

        // Add an extracted claim to Claim Ledger
        IN_MEMORY_CLAIMS.unshift({
          id: IN_MEMORY_CLAIMS.length + 1,
          statement: extractedContent.slice(0, 110) + "...",
          category: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1),
          grounding: "95% Grounded",
          evidence: `Captured from active tab: ${pageTitle.slice(0, 30)}`,
          status: "verified"
        });

        notesInput.value = "";
        showStatus(`✅ Grounded ${extractedContent.length} chars to '${projectName}' as ${activeRole.toUpperCase()}!`);

        // Switch to the role's respective view inside the extension
        const config = ROLE_CONFIGS[activeRole];
        setTimeout(() => {
          switchView(config.defaultView);
        }, 1200);
      });
    } catch (err) {
      showStatus("Capture error: " + err.message, "error");
    }
  }

  btnCaptureAll.addEventListener("click", () => executeCapture(false));
  btnCaptureSelection.addEventListener("click", () => executeCapture(true));

  // 9. Initialize Active Role
  const stored = await chrome.storage.local.get(["activeRole"]);
  applyRole(stored.activeRole || "admin");
});
