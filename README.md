# BATON: AI-Powered Mission-Critical Knowledge Continuity Platform

> *"Preserve not only what an organization knows, but why decisions were made, what remains unfinished, and how the next person can continue without disruption."*

[![Live Deployment](https://img.shields.io/badge/Vercel-Live%20Production-00D1C1?logo=vercel&style=for-the-badge)](https://baton-ai-platform.vercel.app)
[![Round 3 Final Product](https://img.shields.io/badge/CodersInPune%202026-Round%203%20Final%20Product-blueviolet?style=for-the-badge)](https://baton-ai-platform.vercel.app)
[![Tests Passing](https://img.shields.io/badge/Pytest-12%2F12%20Passed-success?style=for-the-badge&logo=pytest)](https://github.com/DhangarRohit18/Baton)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-React%2019%20Strict-blue?style=for-the-badge&logo=typescript)](https://github.com/DhangarRohit18/Baton)
[![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3%20Micro--App-orange?style=for-the-badge&logo=googlechrome)](https://github.com/DhangarRohit18/Baton)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

### 🌐 Live Production Links (100% Public Access)
* **Primary Production URL:** [https://baton-ai-platform.vercel.app](https://baton-ai-platform.vercel.app)
* **Production Mirror:** [https://baton-continuity.vercel.app](https://baton-continuity.vercel.app)
* **Zero-Auth Public Verification:** [https://baton-ai-platform.vercel.app/verify/BATON-VERIFY-000701](https://baton-ai-platform.vercel.app/verify/BATON-VERIFY-000701)
* **Final Product PDF Dossier:** [`docs/BATON_Round_3_Final_Product.pdf`](docs/BATON_Round_3_Final_Product.pdf)

---

## 🔑 Judge & Evaluator Demo Credentials

Judges can explore any of the three enterprise personas instantly with **zero login required** (via 1-click bypass buttons on `/login`), or by using the pre-seeded credentials below:

| Enterprise Persona | Email | Password | Primary Destination & Focus | Direct 1-Click Link |
| :--- | :--- | :--- | :--- | :--- |
| **👑 Chief Architect** | `architect@baton-continuity.io` | `Password123!` | `/dashboard` — Bus-Factor Radar, Sources Hub, Ingestion | [Open Architect Dashboard](https://baton-ai-platform.vercel.app/dashboard?role=admin) |
| **🛡️ Compliance Reviewer** | `reviewer@baton-continuity.io` | `Password123!` | `/claims` — Grounding Guard Evidence Drawer & Approval | [Open Reviewer Ledger](https://baton-ai-platform.vercel.app/claims?role=reviewer) |
| **🚀 Incoming Successor** | `successor@baton-continuity.io` | `Password123!` | `/successor` — 30-Day Checklists, Runbooks & QR Bridge | [Open Successor Portal](https://baton-ai-platform.vercel.app/successor?role=successor) |

---

## 📂 Classified Repository Architecture

```text
BATON/
├── backend/                       # Core FastAPI & Python 3.14 Engine
│   ├── alembic/                   # Database migration versions
│   ├── app/
│   │   ├── api/v1/                # 9 Modular RESTful Router Endpoints
│   │   │   ├── auth.py            # JWT OAuth2 Bearer token issuing & RBAC
│   │   │   ├── projects.py        # Enterprise continuity projects & bus factor
│   │   │   ├── documents.py       # Multi-modal file parser & GitHub branch ingestion
│   │   │   ├── claims.py          # Grounding Guard verification & human review
│   │   │   ├── gaps.py            # Knowledge gap detector & contradiction radar
│   │   │   ├── interviews.py      # Dynamic gap-driven exit interview wizard
│   │   │   ├── handovers.py       # Structured handover packaging & Markdown export
│   │   │   ├── qr_bridge.py       # HMAC-SHA256 signed QR minting, redeem & verify
│   │   │   └── audit.py           # Immutable enterprise audit logging
│   │   ├── core/                  # SettingsConfigDict, security & CORS
│   │   ├── db/                    # SQLAlchemy async engine & database base
│   │   ├── models/                # 11 Relational enterprise database models
│   │   ├── schemas/               # Modern Pydantic V2 ConfigDict contracts
│   │   ├── services/              # Grounding Guard matcher, parsers & bridge services
│   │   └── main.py                # FastAPI ASGI application factory
│   ├── tests/                     # 12 Automated Pytest Unit & Integration Suites
│   ├── Dockerfile                 # Multi-stage production container
│   └── requirements.txt           # Strict pinned dependencies
│
├── frontend/                      # React 19 + TypeScript + Vite Single Page Application
│   ├── src/
│   │   ├── components/            # Layout, Navigation, Sidebars, EvidenceDrawer
│   │   │   └── dashboards/        # 4 Dedicated role dashboards (Admin, Reviewer, Successor, Member)
│   │   ├── context/               # AuthContext (Role Switching), ProjectContext, ThemeContext
│   │   ├── pages/                 # 13 Responsive pages with dual light/dark navy theme
│   │   ├── services/              # Resilient in-memory API client with zero-downtime fallback
│   │   └── types/                 # Shared TypeScript interfaces & models
│   ├── vercel.json                # Single Page Application edge rewrite configuration
│   └── package.json               # Frontend dependencies & Vite scripts
│
├── extension/                     # Chrome Manifest V3 Standalone Micro-App
│   ├── manifest.json              # Chrome MV3 spec with minimal permissions
│   ├── popup.html                 # Complete responsive in-extension user interface
│   ├── popup.js                   # Dynamic role switcher & in-popup feature execution
│   ├── background.js              # Service worker runtime with badge notifications
│   ├── content.js                 # Safe DOM text & metadata highlight extraction
│   └── baton-extension-v3.zip     # Pre-packaged submission archive (15.3 KB)
│
├── docs/                          # Comprehensive Technical Documentation & Submission Dossiers
│   ├── BATON_Round_3_Final_Product.pdf # Official 660 KB publication-ready dossier
│   ├── ROUND_3_FINAL_PRODUCT.md   # Exhaustive 30-feature catalog & architecture breakdown
│   ├── API_DOCUMENTATION.md       # Complete OpenAPI endpoint documentation
│   ├── ADMIN_GUIDE.md             # Enterprise tenant setup & security controls
│   └── USER_GUIDE.md              # Role onboarding walkthroughs
│
└── render.yaml                    # Automated cloud deployment blueprint (Backend + Celery + Redis + Postgres)
```

---

## ⚡ The Four Core Innovations

### 1. Deterministic Grounding Guard (Zero Hallucination)
Language models frequently hallucinate technical specifics (such as database failover timeouts, port numbers, or IAM policies). In an institutional handover, an inaccurate timeout or credential reference can cause catastrophic production outages.
* **Lexical Offset Mapping**: Ingested sources are segmented into overlapping chunks with exact start/end character offsets (`start_offset` .. `end_offset`).
* **Multi-Pass Deterministic Matcher**: Every technical assertion is scored against raw evidence using exact substring matches and token-level n-gram Jaccard overlap.
* **Quarantine Enforcement**: Claims scoring below threshold (0.60) are quarantined as `unverified` and barred from inclusion in official handover dossiers until a designated human compliance reviewer signs off.

### 2. Knowledge Loss Radar & Bus Factor Index
Continuously measures domain centralization and unverified claim density to detect single-point-of-failure vulnerabilities before key personnel announce departures.

### 3. Dynamic Gap-Driven Exit Interviews
Converts generic HR exit questionnaires into an intelligent interrogation engine. BATON analyzes unverified claims and isolated architecture components to dynamically prompt departing engineers with targeted technical inquiries, automatically transcribing responses into verified handover runbooks.

### 4. Cryptographic QR Knowledge Bridge
Generates HMAC-SHA256 signed, rate-limited tokens (`baton_sec_...`) with configurable TTLs and optional passphrases. Successors can scan a QR code from a physical badge or runbook to immediately authenticate package integrity without requiring broad repository access.

---

## 🏆 Round 3 Commitments Delivered

| Commitment from Round 2 | What Was Delivered in Round 3 | Verification Point |
| :--- | :--- | :--- |
| **1. Multi-Role Dashboard Architecture & Zero-Login Access** | Built 3 distinct dashboards (`/dashboard` for Architect, `/claims` for Reviewer, `/successor` for Successor) and prominent 1-click **Direct Dashboard Access** buttons on `/login` that bypass passwords. | Test `/login` in Incognito |
| **2. Self-Contained In-Extension Role Isolation (100% In-Popup)** | Re-engineered the Chrome MV3 extension into a full micro-app where roles execute all actions (approvals, radar, checklists, offline vector SVG QR codes) inside the popup with zero external redirects. | Inspect `extension/popup.js` |
| **3. Multi-Modal Ingestion, Voice Exit Interviews & QR Bridge** | Built PDF/Markdown/GitHub branch ingestion with SHA-256 chunking, gap-driven exit interview wizard with Web Speech API audio transcription, and cryptographic QR verification with public zero-auth verification at `/verify/:token`. | Test `/ingestion`, `/interviews`, `/qr-bridge` |

---

## 🧪 Automated Testing & Verification

### Backend Pytest Suite
```bash
cd backend
python -m pytest tests -v
```
```text
backend/tests/test_auth.py::test_health_check PASSED
backend/tests/test_auth.py::test_register_and_login PASSED
backend/tests/test_claims_and_guard.py::test_grounding_guard_exact_and_token_overlap PASSED
backend/tests/test_claims_and_guard.py::test_project_and_claim_flow PASSED
backend/tests/test_interviews_and_gaps.py::test_exit_interview_and_gap_resolution PASSED
backend/tests/test_qr_bridge.py::test_qr_bridge_cryptographic_signing PASSED
backend/tests/test_qr_bridge.py::test_qr_bridge_lifecycle PASSED
backend/tests/test_users_and_captures.py::test_team_invite_and_browser_capture PASSED
================ 12 passed, 0 errors, 1 warning in 2.94s ================
```

### Frontend Type Safety
```bash
cd frontend
npx tsc --noEmit
```
```text
✓ 2,351 modules transformed without error.
```

---

## 🚀 Quickstart Local Execution

```bash
# 1. Clone the public repository
git clone https://github.com/DhangarRohit18/Baton.git
cd Baton

# 2. Start the Backend API
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 3. Start the Frontend (in a separate terminal)
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to access BATON locally.

---

## 📜 Team & Hackathon Declaration

* **Hackathon:** CodersInPune 2026 (Round 3 — The Final Product)
* **Team Name:** BATON
* **Team Leader:** Rohit Dhangar ([dhangarrohit2006@gmail.com](mailto:dhangarrohit2006@gmail.com))
* **License:** MIT License
