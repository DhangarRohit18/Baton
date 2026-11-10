# BATON Chrome Manifest V3 Knowledge Capture Extension

## Features
- **One-Click Page & Highlight Ingestion**: Ingests active technical documentation, RFCs, and cloud console configurations directly into the BATON Claim Ledger.
- **Content Hash Integrity**: Automatically generates SHA-256 hashes of captured data.
- **Multi-Tenant Vault Routing**: Routes captures directly to specific projects within your organization.
- **Zero-History Tracking**: Strictly operates via explicit user button triggers using Chrome `activeTab` permission.

## Installation in Chrome (Developer Mode)
1. Open Google Chrome and navigate to `chrome://extensions/`.
2. Enable the **Developer mode** toggle in the top-right corner.
3. Click the **Load unpacked** button.
4. Select this directory: `c:\Users\user\OneDrive\Desktop\Competition\codersinpune\extension`.
5. The **BATON Knowledge Capture** icon will appear in your Chrome extensions toolbar!

## Usage
1. Open any documentation page (e.g., GitHub README, internal wiki, API reference).
2. Click the BATON extension icon.
3. Sign in using your BATON account.
4. Select the target project.
5. Click **Capture Full Page** or highlight text and click **Capture Selected Highlight**.
6. The content is securely transferred to BATON, chunked into evidence, and verified by the Deterministic Grounding Guard.
