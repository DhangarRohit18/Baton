# BATON: AI-Powered Knowledge Continuity Platform

> *"Preserve not only what an organisation knows, but why decisions were made, what remains unfinished, and how the next person can continue."*

[![Live Deployment](https://img.shields.io/badge/Vercel-Live%20Production-success?logo=vercel&style=for-the-badge)](https://frontend-orcin-sigma-74.vercel.app)
[![GitHub Repository](https://img.shields.io/badge/GitHub-DhangarRohit18%2FBaton-blue?logo=github&style=for-the-badge)](https://github.com/DhangarRohit18/Baton)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Live Production URL:** [https://frontend-orcin-sigma-74.vercel.app](https://frontend-orcin-sigma-74.vercel.app)  
*(Production Aliases: [https://baton-continuity.vercel.app](https://baton-continuity.vercel.app) | [https://baton-ai-platform.vercel.app](https://baton-ai-platform.vercel.app))*

BATON is a complete, production-oriented AI-powered knowledge continuity SaaS platform engineered to prevent critical institutional memory loss when employees, developers, project leaders, or team members leave an organization.

---

## 1. System Architecture & Pillars

```
+---------------------------------------------------------------------------------------------------+
|                                       BATON PLATFORM SUITE                                        |
+------------------------------------+--------------------------------------------------------------+
| React 19 + TypeScript + Vite       | Deep Navy & Cyan design system, interactive continuity radar |
| FastAPI Backend Core               | High-performance async REST API with multi-tenant isolation   |
| Deterministic Grounding Guard      | Lexical offset & n-gram evidence verification engine          |
| Secure QR Knowledge Bridge         | HMAC-SHA256 signed tokens, rate limits & emergency revocation|
| Gap-Driven Exit Interview Wizard   | Dynamic Q&A generating verified institutional claims         |
| Chrome Manifest V3 Extension       | One-click activeTab page & highlight knowledge capture       |
+------------------------------------+--------------------------------------------------------------+
```

### The Core Architectural Pillars:
1. **Deterministic Grounding Guard**: Every AI-extracted claim is anchored directly to byte offsets in original evidence chunks. Zero hallucinated or unverified assertions are promoted to official handovers without human reviewer signoff.
2. **Knowledge Loss Radar**: Continuously monitors bus-factor vulnerabilities, isolated domain owners, contradictory technical claims, and open operational gaps.
3. **Gap-Driven Exit Interview Engine**: Rather than generic questionnaires, departing personnel are prompted with targeted questions derived directly from unresolved institutional blindspots. Answers are converted into verified claims.
4. **Secure QR Knowledge Bridge**: Cryptographically random HMAC-signed tokens with expiration, max usage counters, optional passphrase encryption, and instantaneous revocation for secure successor access.
5. **Multi-Tenant Enterprise Isolation**: Strict tenant scoping across all database entities with audit logging for SOC2 / ISO compliance.

---

## 2. Core Modules Implemented

1. **Authentication & Multi-Tenant Organization Management**: JWT OAuth2 bearer authentication, role-based access control (`owner`, `admin`, `reviewer`, `member`, `successor`, `auditor`).
2. **Project & Operational Domain Management**: Domain scoping with bus-factor risk tracking.
3. **Multi-Modal Document Ingestion**: Ingests PDFs, Markdown, DOCX, TXT, and raw source files into chunked evidence with start/end character offsets.
4. **GitHub Connector**: Syncs repository README, operational commits, and branch structures.
5. **Chrome Knowledge Capture Extension (Manifest V3)**: Captures full pages or selected highlights directly into target projects.
6. **Evidence-Linked Claim Ledger**: Searchable, filterable ledger with category classifications (`architecture`, `operational`, `credentials`, `unfinished`, `risk`).
7. **Deterministic Grounding Guard**: On-demand verification of claims against text evidence chunks.
8. **Knowledge Gap Detector**: Automatically identifies undocumented runbooks, missing credentials, and single points of failure.
9. **Contradiction & Conflict Engine**: Identifies conflicting technical claims across documentation.
10. **Knowledge Loss Radar**: Calculates institutional readiness scores and categorical risk breakdowns.
11. **Interactive Exit Interview Wizard**: Personalized offboarding interviews with progress tracking.
12. **Handover Generator**: Compiles structured Handover Packs with executive briefs, operational runbooks, and 30-day successor action plans.
13. **Successor Onboarding Portal**: Interactive 30-day milestone checklist and unlocked verified claims viewer.
14. **Secure QR Knowledge Bridge**: High-resolution PNG QR generation, camera scanner via `@zxing/browser`, token redemption, and revocation.
15. **Public Integrity Verification**: Non-confidential cryptographic provenance verification.
16. **Immutable Compliance Audit Trail**: Tracks all claim approvals, QR mintings, gap resolutions, and revocations.
17. **Team Management & Role Delegation**: Member invitations and role updates.

---

## 3. Quickstart & Local Installation

### Prerequisites
- Python 3.11+
- Node.js v20+ and npm
- (Optional) Docker & Docker Compose for containerized deployment

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create & activate virtual environment (Windows)
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt email-validator

# Run backend test suite
python -m pytest tests -v

# Start FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend API will be live at `http://localhost:8000`. Swagger documentation available at `http://localhost:8000/api/v1/docs`.

### 2. Frontend Setup
```bash
# In a separate terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Run Vitest test suite
npm test

# Build production bundle
npm run build

# Start Vite development server
npm run dev
```
Frontend Web Platform will be live at `http://localhost:5173`.

### 3. Chrome Knowledge Capture Extension Setup
1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the `extension/` directory inside this repository.
5. The **BATON Knowledge Capture** extension is ready to capture documentation directly from any web page!

---

## 4. Docker Deployment

Deploy the complete multi-container stack (PostgreSQL 16 + pgvector, Redis 7, Celery Worker, FastAPI Backend, and Nginx-powered React Frontend):

```bash
# Start all services
docker compose up --build -d

# Check running containers
docker compose ps
```

Services exposed:
- Web App: `http://localhost:80` (or `http://localhost:5173`)
- Backend API & Docs: `http://localhost:8000/api/v1/docs`
- PostgreSQL pgvector: `localhost:5432`
- Redis: `localhost:6379`

---

## 5. Verification & Automated Test Results

### Backend Test Suite (Pytest)
```
backend/tests/test_auth.py::test_health_check PASSED
backend/tests/test_auth.py::test_register_and_login PASSED
backend/tests/test_claims_and_guard.py::test_grounding_guard_exact_and_token_overlap PASSED
backend/tests/test_claims_and_guard.py::test_project_and_claim_flow PASSED
backend/tests/test_interviews_and_gaps.py::test_exit_interview_and_gap_resolution PASSED
backend/tests/test_qr_bridge.py::test_qr_bridge_cryptographic_signing PASSED
backend/tests/test_qr_bridge.py::test_qr_bridge_lifecycle PASSED
backend/tests/test_users_and_captures.py::test_team_invite_and_browser_capture PASSED

================ 8 passed, 20 warnings in 2.85s ================
```

### Frontend Test Suite (Vitest)
```
Test Files  1 passed (1)
     Tests  2 passed (2)
  Duration  202ms
```

### Production Build
```
vite v8.3.7 building client environment for production...
✓ 2718 modules transformed.
✓ built in 3.94s
```
Zero linting, type, or runtime compilation errors.

