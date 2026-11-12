# BATON Chrome Manifest V3 Knowledge Capture Extension

A professional, zero-friction knowledge capture extension designed for Lead Architects, Compliance Reviewers, and Successor Engineers.

## Key Capabilities

1. **Zero-Login Barrier (Instant Role Detection)**:
   - Genuine persona selector pre-loaded with **👑 Chief Architect / Admin**, **🛡️ Compliance Reviewer**, and **🚀 Successor Lead**.
   - No forced login or manual JWT copy-pasting required—ready to capture out-of-the-box.
2. **Direct Dashboard Redirection**:
   - One-click navigation buttons directly to respective web dashboards:
     - 📊 **Main Overview Dashboard** (`/dashboard`)
     - ⚖️ **Claim Ledger & Reviews** (`/claims`)
     - 📑 **Continuity Handover Packs** (`/handover`)
   - Instant post-capture jump link: "View Grounded Claims in Dashboard ↗".
3. **Multi-Mode Ingestion**:
   - **Full Page Capture**: Extracts clean document text without scripts or styling clutter.
   - **Highlighted Snippet**: Ingests only the user's active selection.
   - **Right-Click Context Menu**: Select text on any web page, right-click, and choose **"⚡ Ingest into BATON Knowledge Vault"**.
4. **Deterministic Categorization & Tags**:
   - One-click tags: `Architecture`, `Operational`, `Runbook`, `Credentials`, `Backlog`.
   - Context notes for incoming successors.
5. **High-Availability Hybrid Sync**:
   - Automatically synchronizes with live cloud production API (`https://baton-ai-platform.vercel.app/api/v1`) or local dev server.
   - Offline resilient queue: captures are never lost even when offline.

---

## Installation in Chrome / Brave / Edge (Developer Mode)

1. Open your browser and navigate to `chrome://extensions/` (or `edge://extensions/`).
2. Enable the **Developer mode** toggle in the top-right corner.
3. Click the **Load unpacked** button.
4. Select the `extension/` directory.
5. The **BATON Knowledge Capture** icon appears in your toolbar. Pin it for 1-click access!
