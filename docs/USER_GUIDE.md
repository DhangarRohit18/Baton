# BATON User Guide

Welcome to **BATON**, the AI-powered institutional knowledge continuity and offboarding handover platform.

---

## 1. Quick Start Workflow

```
  1. Ingest Documentation & Repositories
            │
            ▼
  2. Grounding Guard Verifies Claims & Detects Knowledge Gaps
            │
            ▼
  3. Knowledge Loss Radar Visualizes Bus Factor Risk
            │
            ▼
  4. Offboarding Wizard Conducts Gap-Driven Exit Interview
            │
            ▼
  5. Compile Successor Handover Pack & Mint QR Knowledge Bridge
            │
            ▼
  6. Successor Scans QR Bridge for Instant Secure Onboarding
```

---

## 2. Ingesting Project Knowledge

1. Navigate to **Document Ingestion** in the sidebar.
2. Select your project.
3. Choose your ingestion source:
   - **File Upload**: Drag and drop PDF, Word (`.docx`), CSV spreadsheets, JSON specifications, or Markdown.
   - **GitHub Repository**: Enter repository URL (e.g., `https://github.com/organization/repo`) and optionally provide an access token to automatically fetch the README and commit logs.
   - **Chrome Extension**: Use the BATON browser extension to capture documentation directly from Jira, Confluence, internal wikis, or AWS dashboards.

---

## 3. Reviewing Claims in the Claim Ledger

- Every statement extracted from your documents is analyzed by the **Deterministic Grounding Guard**.
- **Grounded**: Lexically verified with character-level evidence citations.
- **Unverified**: Lacks conclusive textual corroboration.
- Human-in-the-loop: Reviewers can click **Approve**, **Dispute**, or **Reject** on any claim.

---

## 4. Offboarding & Exit Interviews

When an engineer or architect prepares to transition:
1. Open **Exit Interviews**.
2. Click **Initiate Offboarding Wizard**.
3. BATON queries all open gaps and ungrounded claims in the project and synthesizes tailored questions.
4. The departing team member can:
   - Type their answers directly.
   - Click the **Microphone** icon to dictate their answer using real-time voice speech-to-text.
5. Saving an answer automatically resolves the associated knowledge gap and promotes the answer into an approved claim.

---

## 5. Successor Handover & QR Knowledge Bridge

1. Open **Handover Packs**.
2. Click **Compile New Handover** to synthesize all approved claims, runbooks, dependencies, and a 30-day onboarding plan.
3. Click **Mint QR Bridge**:
   - Set the expiration hours (e.g., 72h).
   - Set maximum scans (e.g., 3).
   - Optionally set a secret passphrase.
4. Export or share:
   - **Print**: Pre-styled for executive PDF generation.
   - **Export .md**: Download portable Markdown for offline vaults or wikis.
   - **QR Code**: Present the QR code to the incoming successor.
5. Successor can scan the QR code with their mobile phone or enter the token at `/verify` to immediately receive the complete handover brief.
