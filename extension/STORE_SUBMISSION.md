# Chrome Web Store Submission & Developer Mode Guide

This document details developer installation instructions and Chrome Web Store submission requirements for **BATON Knowledge Capture (Manifest V3)**.

---

## 1. Developer Mode Installation (Local Testing)

Follow these steps to load the unpacked extension in Google Chrome, Brave, or Microsoft Edge:

1. Open your browser and navigate to the extensions manager:
   - **Chrome**: `chrome://extensions`
   - **Edge**: `edge://extensions`
   - **Brave**: `brave://extensions`
2. Enable **Developer mode** toggle in the top-right corner.
3. Click the **Load unpacked** button.
4. Select the directory:
   ```text
   <path-to-repo>/extension
   ```
5. The extension **BATON Knowledge Capture** (v1.0.0) is now loaded and visible in your browser toolbar.
6. Click the extension puzzle icon and pin **BATON** for quick access.

---

## 2. Configuration & Usage

1. Click the BATON icon in the browser toolbar.
2. In the popup settings:
   - **API Host**: By default, connects to `http://localhost:8000` (or `https://baton-ai-platform.vercel.app`).
   - **JWT Token**: Paste an active authentication token from your BATON session or use the default pre-configured tenant token.
   - **Target Project**: Select the project into which web documentation or runbooks will be ingested.
3. **Capture Methods**:
   - **Capture Full Page**: Grabs article or documentation text from the active tab.
   - **Capture Selection**: Highlight any text on the page and click capture.
   - **Notes & Direct Tags**: Append operational context or credentials metadata directly.

---

## 3. Chrome Web Store Submission Checklist

To publish on the Chrome Web Store:

### Step 1: Generate Package Archive
Run the automated packaging script from the repository root:
```bash
python scripts/package_extension.py
```
This generates `extension/baton-extension-v3.zip`.

### Step 2: Chrome Web Store Developer Dashboard
1. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Click **+ New Item**.
3. Upload `baton-extension-v3.zip`.

### Step 3: Store Listing Details
- **Title**: `BATON Knowledge Capture`
- **Short Description**: `Capture operational documentation, decisions, and system runbooks into your BATON institutional continuity vault.`
- **Category**: `Productivity / Developer Tools`
- **Language**: `English`
- **Privacy Policy URL**: `https://baton-continuity.vercel.app/privacy`
- **Single Purpose Declaration**: "Capture selected web documentation and operational runbooks directly into the user's secure BATON knowledge continuity vault."

### Step 4: Permission Justifications
- `activeTab`: Required to inspect the current document URL and extract text from the active webpage on user demand.
- `storage`: Required to save user preferences (API Host, Project ID, session token) locally within the browser.
- `scripting`: Required to execute content text extraction scripts on user-initiated captures.

---

## 4. Verification & Security
The extension operates under zero-trust principles:
- No background analytics or third-party trackers.
- Captures are only triggered by explicit user action.
- All requests are cryptographically authenticated via Bearer JWT.
