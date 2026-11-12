# BATON REST API Specification (v1)

Base URL: `/api/v1`
Authentication: Bearer JWT in `Authorization` header (`Authorization: Bearer <TOKEN>`).

---

## 1. Authentication & Tenant Identity

### `POST /api/v1/auth/register`
Creates a new tenant organization and provisions the initial owner account.
- **Request Body**:
  ```json
  {
    "org_name": "Acme Aerospace",
    "email": "lead@acme.com",
    "password": "SecurePassword123!",
    "full_name": "Alex Mercer",
    "role": "owner"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGci...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "lead@acme.com",
      "full_name": "Alex Mercer",
      "role": "owner"
    }
  }
  ```

### `POST /api/v1/auth/login`
Authenticates existing credentials and returns an access token.
- **Request Body**:
  ```json
  {
    "email": "lead@acme.com",
    "password": "SecurePassword123!"
  }
  ```

### `GET /api/v1/auth/me`
Fetches the active authenticated user profile and organization membership.

### `POST /api/v1/auth/forgot-password`
Initiates self-service password recovery by minting a signed 1-hour reset token.

### `POST /api/v1/auth/reset-password`
Applies a new password after validating the cryptographic reset token signature.

### `POST /api/v1/auth/refresh`
Issues a refreshed access token without requiring re-entry of credentials.

### `POST /api/v1/auth/mfa/setup` & `POST /api/v1/auth/mfa/verify`
Pairs and verifies TOTP multi-factor authenticators.

---

## 2. Project Management

- `GET /api/v1/projects`: Lists all projects within the authenticated tenant organization.
- `POST /api/v1/projects`: Creates a new monitored project domain.
- `GET /api/v1/projects/{id}`: Retrieves single project details and bus factor metrics.
- `PATCH /api/v1/projects/{id}`: Updates project metadata, status, or lead assignments.

---

## 3. Document Ingestion & Parsers

### `POST /api/v1/documents/upload`
Uploads a document and extracts evidence chunks with SHA-256 cryptographic verification.
- **Form Data**:
  - `project_id`: integer
  - `file`: Multipart binary (PDF, DOCX, CSV, JSON, TXT, MD)
- **Automatic Parsers**:
  - `parse_pdf`: Multi-page text extraction with page offsets.
  - `parse_docx`: OpenXML paragraph extraction.
  - `parse_csv`: Markdown schema and sample rows.
  - `parse_json`: Structured schema formatting.

### `POST /api/v1/documents/github`
Synchronizes README files and recent commit changelogs directly from GitHub REST API.

---

## 4. Claim Ledger & Deterministic Grounding Guard

- `GET /api/v1/claims?project_id={id}`: Queries claims with optional status/category filtering.
- `POST /api/v1/claims/verify`: Runs Deterministic Grounding Guard against evidence chunks.
- `POST /api/v1/claims/{id}/review`: Human reviewer approval, dispute, or rejection.

---

## 5. Knowledge Loss Radar & Gap Detector

- `GET /api/v1/radar/overview`: Calculates multi-project Bus Factor Risk, critical dependencies, and readiness scores.
- `GET /api/v1/gaps?project_id={id}`: Lists detected knowledge voids.
- `PATCH /api/v1/gaps/{id}`: Manually resolves a gap or updates prompt questions.

---

## 6. Exit Interviews & Continuity Handover

- `POST /api/v1/interviews/generate`: Synthesizes dynamic exit interview questions from active knowledge gaps.
- `POST /api/v1/interviews/answer/{response_id}`: Records answering engineer's debrief (with optional voice dictation) and promotes it to a verified claim while resolving the gap.
- `POST /api/v1/handovers/generate`: Compiles a complete 6-section Handover Pack.
- `GET /api/v1/handovers/{id}`: Retrieves the synthesized handover document.
- `GET /api/v1/handovers/{id}/export`: Exports the complete handover pack as portable Markdown.

---

## 7. QR Knowledge Bridge

- `POST /api/v1/qr-bridge/mint`: Mints a signed, time-decayed QR access token with configurable TTL hours, max uses, and secondary passphrase.
- `POST /api/v1/qr-bridge/verify`: Public verification and claim challenge endpoint for successors.
- `POST /api/v1/qr-bridge/revoke`: Immediate one-click revocation of an active QR bridge with immutable audit reason.
