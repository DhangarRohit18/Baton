import os
import zipfile
import json
from pathlib import Path

def package_chrome_extension():
    root = Path(__file__).resolve().parent.parent
    ext_dir = root / "extension"
    dist_zip = ext_dir / "baton-extension-v3.zip"

    manifest_file = ext_dir / "manifest.json"
    if not manifest_file.exists():
        raise FileNotFoundError("manifest.json not found in extension directory")

    with open(manifest_file, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    print(f"Packaging {manifest['name']} v{manifest['version']} (Manifest V{manifest['manifest_version']})...")

    required_files = [
        "manifest.json",
        "background.js",
        "content.js",
        "popup.html",
        "popup.js"
    ]

    for fname in required_files:
        fpath = ext_dir / fname
        if not fpath.exists():
            raise FileNotFoundError(f"Missing required extension file: {fname}")

    # Remove old zip if present
    if dist_zip.exists():
        dist_zip.unlink()

    with zipfile.ZipFile(dist_zip, "w", zipfile.ZIP_DEFLATED) as z:
        for fname in required_files:
            z.write(ext_dir / fname, arcname=fname)
        if (ext_dir / "README.md").exists():
            z.write(ext_dir / "README.md", arcname="README.md")

    print(f"Successfully created packaged extension archive: {dist_zip}")
    print(f"Archive size: {dist_zip.stat().st_size} bytes")

if __name__ == "__main__":
    package_chrome_extension()
