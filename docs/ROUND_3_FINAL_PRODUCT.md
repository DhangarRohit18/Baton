# BATON: Round 3 — The Final Product Submission Dossier
**Hackathon:** CodersInPune  
**Project Name:** BATON (AI-Powered Knowledge Continuity Platform)  
**Live Production URL:** https://baton-ai-platform.vercel.app  
**Public Repository:** https://github.com/DhangarRohit18/Baton  
**Team Leader:** Rohit Dhangar (dhangarrohit2006@gmail.com)  

---

## 1. Executive Overview & Mission
Modern organizations operate with acute **bus-factor vulnerability**: when senior engineers, architects, or domain leads leave, irreplaceable institutional knowledge evaporates. Traditional documentation is fragmented, stale, or untrusted.

**BATON** is a mission-critical AI knowledge continuity SaaS platform engineered to preserve not just *what* an organization knows, but *why* architectural decisions were made, *what* remains unfinished, and *how* incoming successors can immediately assume operational ownership with zero downtime.

---

## 2. Complete List of Live Production Features
*Every feature listed below is 100% functional and testable on the live deployment without credentials.*

1. **One-Click Direct Dashboard Access**: Zero-login enterprise persona switcher (`👑 Architect`, `🛡️ Reviewer`, `🚀 Successor`) with instant authenticated routing.
2. **Multi-Tenant Enterprise Vault Architecture**: Isolated organizational scoping with cryptographically salted tenant databases.
3. **Multi-Modal Document Ingestion Engine**: Ingests PDF documents, Word (.docx), CSV tables, structured JSON, Markdown, and TXT files.
4. **Deterministic Lexical Chunking with Offset Tracking**: Text decomposition preserving exact character and byte offsets for forensic citation.
5. **Cryptographic Content Hashing**: SHA-256 integrity validation calculated and stored on every ingested document.
6. **GitHub Repository & Commits Connector**: Syncs remote repository documentation, README, and operational changelogs per branch.
7. **Chrome Manifest V3 Extension (Self-Contained Micro-App)**: Full-page and text selection capture into organizational vaults directly from the browser.
8. **In-Extension Dynamic Role-Gating**: Dynamically activates role-specific tabs (Radar, Sources, Claim Ledger, Gaps, Handover) and deactivates others.
9. **Zero-Redirect In-Popup Extension Runtime**: All claim reviews, gap resolutions, and runbook inspections execute 100% inside the extension popup.
10. **Evidence-Linked Claim Ledger**: Searchable, filterable ledger mapping extracted factual assertions to underlying document chunks.
11. **Deterministic Grounding Guard**: Real-time lexical overlap, entity verification, and n-gram analysis proving assertions against cited text.
12. **Interactive Evidence Drawer**: Inspects source citation snippets, start/end byte offsets, and match methods (`exact_offset`, `ngram_jaccard`).
13. **Human-in-the-Loop Review Workflow**: Reviewers mark claims as Approved, Disputed, or Rejected with mandatory audit logging.
14. **Knowledge Loss Radar**: Continuous calculation of project readiness scores (0–100%) and bus-factor vulnerability risks.
15. **Knowledge Gap & Blindspot Matrix**: Automated detection of missing credentials, unrecorded runbooks, and single points of failure.
16. **Contradiction & Conflict Engine**: Semantic detection of contradictory assertions across documentation (e.g. conflicting ports, databases, auth policies).
17. **Gap-Driven Exit Interview Wizard**: Dynamically generates targeted offboarding questionnaires derived from unresolved knowledge gaps.
18. **Voice-Enabled Dictation (Web Speech API)**: Hands-free audio speech-to-text response recording for departing engineers during exit interviews.
19. **Automated Gap-to-Claim Conversion**: Submitting an exit interview response automatically resolves the knowledge gap and creates a verified operational claim.
20. **One-Click Handover Pack Generator**: Synthesizes verified claims, architecture decisions, and runbooks into a structured successor handover dossier.
21. **Markdown Export & Whitepaper Printing**: Immutable Markdown download (`/api/v1/handovers/{id}/export`) and `@media print` executive styling.
22. **Successor Onboarding Portal**: 30-day interactive transition roadmap with milestone checkboxes, task progress tracking, and unlocked verified claims.
23. **Secure QR Knowledge Bridge**: High-contrast cryptographic QR code minting with customizable TTL (hours), usage limits, and optional passphrase protection.
24. **In-Browser Camera QR Scanner (`@zxing/browser`)**: Real-time video stream webcam scanner for scanning physical handover badges.
25. **One-Time Token Redemption & Instant Revocation**: Redemptions decrement remaining allowances; emergency revocation renders tokens instantly invalid.
26. **Public Cryptographic Provenance Verification**: Zero-knowledge verification portal (`/verify/:token`) confirming document authenticity without leaking confidential data.
27. **Immutable Compliance Audit Trail**: Structured event logging (`DOCUMENT_INGESTED`, `CLAIM_APPROVED`, `QR_BRIDGE_MINTED`, `GAP_RESOLVED`) for SOC2/ISO compliance.
28. **Enterprise Team Management & Role Delegation**: Multi-role invitations (`owner`, `admin`, `reviewer`, `successor`, `auditor`) and instantaneous role upgrades.
29. **Dual-Theme Enterprise Design System**: Slate/Navy Dark Mode and Pure White Light Mode with instant persistence.
30. **Automated Enterprise Database Seeding**: Pre-loaded realistic enterprise datasets available via `/api/v1/seed` and CLI script.

---

## 3. Technical Architecture & Implementation Summary

### Architectural Components & Data Flow
BATON is built as a decoupled, multi-tiered enterprise architecture:

```
[ Browser / Chrome MV3 Extension ]
       │              │
  (HTTPS / REST) (Webcam / QR)
       ▼              ▼
[ React 19 + TypeScript + Tailwind Frontend (Vercel Edge CDN) ]
       │
  (REST API / JWT Bearer)
       ▼
[ FastAPI High-Performance Async Core (Python 3.14 / Pydantic V2) ]
  ├── Grounding Guard Service (Lexical & Offset Verification)
  ├── Knowledge Loss Radar Engine (Bus-Factor Vulnerability Scoring)
  ├── Exit Interview Orchestrator (Dynamic Gap Prompting)
  ├── QR Knowledge Bridge Crypto Service (HMAC-SHA256 Signing)
  └── Multi-Format Parser Engine (PDF, DOCX, CSV, JSON, Markdown)
       │
  (SQLAlchemy ORM + SQLite/PostgreSQL)
       ▼
[ Relational Schema + Immutable Compliance Audit Log ]
```

### Core Technologies
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Canvas-Confetti, `@zxing/browser`.
- **Backend**: Python 3.14, FastAPI, SQLAlchemy 2.0, Pydantic V2 (`SettingsConfigDict`, `ConfigDict`), PyPDF, Passlib/Bcrypt, PyJWT.
- **Chrome Extension**: Google Chrome Manifest V3, Service Worker background runtime, dynamic popup view switching, Content Scripts with DOM sanitation.
- **Security**: HMAC-SHA256 signed tokens, salted Bcrypt password hashing, JWT bearer auth with role-based access control, SHA-256 document hashing.

### The Hardest Problem Solved
**Deterministic Evidence Grounding Without Hallucinations:**
Language models frequently hallucinate technical specifics (such as database failover timeouts, port numbers, or IAM policies). In an institutional handover, an inaccurate timeout or credential reference can cause catastrophic production outages.
To solve this, BATON built the **Deterministic Grounding Guard**:
1. Every ingested document is segmented into overlapping textual chunks whose precise character and byte offsets (`start_offset` .. `end_offset`) are cataloged in the database.
2. When AI extracts claims, each assertion must be evaluated through a multi-pass deterministic matcher:
   - **Pass 1 (Exact Lexical Offset)**: Verifies exact substring matching and exact numeric values against original source chunks.
   - **Pass 2 (N-gram Jaccard Overlap)**: Calculates word token intersections and character-level similarity ratios.
3. Claims falling below threshold (0.60) are quarantined as `unverified` and barred from inclusion in official handover dossiers until a designated human compliance reviewer signs off.

---

## 4. Testing Details & Verification Methodology
- **Unit & Integration Testing**: 12/12 automated pytest suites in `backend/tests/` covering authentication lifecycle, token refresh, deterministic grounding guard exact/ngram scoring, multi-format parsing (PDF, DOCX, CSV, JSON), cryptographic QR bridge minting/redemption/revocation, and browser extension captures.
- **Frontend Type Safety**: Strict TypeScript compilation (`npx tsc --noEmit`) passing with 0 errors across 2,351 transformed modules.
- **Manual Incognito Verification**:
  - Tested `https://baton-ai-platform.vercel.app/` in private/incognito windows across Chrome, Edge, and Firefox.
  - Verified that direct persona buttons (`Architect`, `Reviewer`, `Successor`) grant immediate dashboard access without login prompts.
  - Tested camera QR scanning and public verification at `/verify/BATON-SEC-DEMO-2026`.
- **What Was Found & Fixed**:
  - Found and fixed 14 bugs during the final audit: missing public verify routing in SPA, unescaped JSON in audit logs, inverted handover readiness scoring, Pydantic V2 deprecations, and extension context menu redirections.
- **Known Imperfections**:
  - Web Speech API speech-to-text requires microphone permissions supported natively in Chromium-based browsers; fallback manual text input is provided on non-supported browsers.

---

## 5. The Three Round 2 Committed Improvements

### Improvement 1: Multi-Role Dashboard Architecture & Zero-Login Frictionless Access
- **What Committed**: Implement separate, dedicated dashboards for each enterprise role (Architect, Reviewer, Successor) with respective functions rather than a single generic view, and eliminate login friction for evaluators.
- **What Delivered**: Created three isolated dashboards:
  1. `Architect Dashboard` (`/dashboard`): Bus-factor risk radar, multi-modal ingestion pipeline, SHA-256 sources repository.
  2. `Reviewer Dashboard` (`/claims`): Deterministic Grounding Guard claim ledger with interactive evidence drawer, inline approve/dispute triggers, and contradiction detection.
  3. `Successor Portal` (`/successor`): Knowledge handover dossier, runbook viewer, cryptographic QR bridge redemption, and interactive 30-day onboarding checklist.
  Added prominent 1-click **Direct Access to Dashboard** buttons on `/login` that immediately log in as pre-seeded enterprise personas without typing credentials.

### Improvement 2: Self-Contained In-Extension Role Isolation (100% In-Popup Execution)
- **What Committed**: Upgrade the Chrome Manifest V3 extension to be an authentic enterprise micro-application where genuine roles can operate directly inside the popup without forced website redirects, dynamically activating role-specific features and deactivating others upon role switching.
- **What Delivered**: Completely re-engineered `extension/popup.html` and `extension/popup.js` into an all-in-one desktop micro-app:
  - Role switcher dynamically toggles between **Chief Architect**, **Compliance Reviewer**, and **Successor Lead**.
  - Admin activates `⚡ Ingest Capture`, `📊 Architecture Radar`, and `📁 Sources Hub`.
  - Reviewer activates `⚡ Citation Capture`, `⚖️ Claim Ledger` (with live inline claim approvals/disputes), and `🛡️ Gaps & Conflicts` (with live resolution).
  - Successor activates `⚡ Notes Capture`, `📑 Handover Dossier` (4 collapsible sections with Copy Markdown), and `👤 Successor & QR` (embedded offline SVG QR matrix and interactive 30-day checklist).
  - Zero forced login: boots directly with pre-authenticated genuine personas.
  - Zero website redirects: every operation executes within the extension popup.

### Improvement 3: Multi-Modal Ingestion, Voice Exit Interviews, and QR Cryptographic Bridge
- **What Committed**: Add multi-format document ingestion (DOCX, CSV, JSON), voice-enabled exit interviews, and an end-to-end cryptographic QR knowledge bridge with public verification.
- **What Delivered**:
  - Built parsers for Word (.docx), CSV tabular data, JSON specifications, and PDFs with start/end byte offset calculations.
  - Built the **Voice-Enabled Exit Interview Wizard** using Web Speech API STT, dynamically generating interview questions from detected gaps and converting responses into verified claims.
  - Built the **Secure QR Knowledge Bridge**: HMAC-SHA256 token minting, webcam scanning (`@zxing/browser`), token redemption with usage quotas, emergency revocation, and public integrity verification (`/verify/:token`).

### Anything Else Improved After Round 2
- Executed a comprehensive full-codebase quality audit resolving 14 bugs across backend, frontend, and extension.
- Eradicated 19 deprecation warnings in Python 3.14 by migrating all schemas to modern Pydantic V2 `ConfigDict` and `SettingsConfigDict`.
- Replaced Python 3.12+ deprecated `datetime.utcnow()` with timezone-aware UTC timestamps.
- Added structured `json.dumps()` serialization across all audit log events to prevent unescaped quotation syntax crashes.
- Created automated enterprise database seeding (`/api/v1/seed` and CLI `seed.py`).
- Disabled Vercel SSO deployment protection to guarantee 100% public access in incognito windows.

---

## 6. Product Roadmap & Future Development Plan
1. **Phase 1: Enterprise IDE & Git VCS Sidecars (Q1 2027)**:
   - VS Code and JetBrains extension analyzing local code comments, PR descriptions, and architectural decision records (ADRs) in real time to capture knowledge before commit.
2. **Phase 2: Automated Slack & Microsoft Teams Continuity Bot (Q2 2027)**:
   - Conversational bot monitoring `#architecture-decisions` and `#incident-postmortems` to extract unrecorded tribal knowledge and prompt engineers for citations.
3. **Phase 3: Hardware Security Module (HSM) Integration & PKI Smart Cards (Q3 2027)**:
   - Enterprise PKI integration (YubiKey / PIV) for signing QR Knowledge Bridge tokens with FIPS 140-2 Level 3 hardware security for defense and banking clients.
4. **Phase 4: Multi-Agent Continuity Swarm (Q4 2027)**:
   - Autonomous background agents that continuously cross-reference production telemetry, Jira tickets, and GitHub commits to automatically detect emerging bus-factor vulnerabilities.
