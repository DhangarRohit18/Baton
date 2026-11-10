import os
import re
import io
from typing import List, Dict, Any, Tuple
from pypdf import PdfReader
import httpx

class DocumentParserService:
    """
    Parses and chunks ingested documents into sequential evidence chunks.
    Preserves exact character offsets for deterministic grounding verification.
    """

    @classmethod
    def chunk_text(cls, text: str, chunk_size: int = 800, overlap: int = 150) -> List[Dict[str, Any]]:
        """
        Splits text into overlapping chunks while tracking start and end byte/char offsets.
        Prefers breaking at paragraph or sentence boundaries.
        """
        chunks = []
        text_len = len(text)
        if text_len == 0:
            return chunks

        start = 0
        chunk_idx = 0

        while start < text_len:
            end = min(start + chunk_size, text_len)

            # If not at the very end of document, try to find a sentence or newline break
            if end < text_len:
                break_point = -1
                # Try finding newline or sentence end in the last 150 chars of the window
                window = text[max(start, end - 150):end]
                newline_pos = window.rfind('\n')
                if newline_pos != -1:
                    break_point = max(start, end - 150) + newline_pos + 1
                else:
                    period_pos = window.rfind('. ')
                    if period_pos != -1:
                        break_point = max(start, end - 150) + period_pos + 2

                if break_point > start:
                    end = break_point

            chunk_content = text[start:end].strip()
            if chunk_content:
                chunks.append({
                    "chunk_index": chunk_idx,
                    "text_content": chunk_content,
                    "start_offset": start,
                    "end_offset": end,
                    "page_or_section": f"Offset {start}..{end}"
                })
                chunk_idx += 1

            if end >= text_len:
                break
            start = max(start + 1, end - overlap)

        return chunks

    @classmethod
    def parse_pdf(cls, file_bytes: bytes) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Extracts text from PDF bytes and builds chunks with page-level annotation.
        """
        reader = PdfReader(io.BytesIO(file_bytes))
        full_text = []
        chunks = []
        global_offset = 0
        chunk_idx = 0

        for page_num, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            clean_page_text = page_text.strip()
            if not clean_page_text:
                continue

            full_text.append(clean_page_text)
            page_start = global_offset
            page_end = page_start + len(clean_page_text)

            page_chunks = cls.chunk_text(clean_page_text, chunk_size=800, overlap=100)
            for ch in page_chunks:
                chunks.append({
                    "chunk_index": chunk_idx,
                    "text_content": ch["text_content"],
                    "start_offset": page_start + ch["start_offset"],
                    "end_offset": page_start + ch["end_offset"],
                    "page_or_section": f"Page {page_num + 1}"
                })
                chunk_idx += 1

            global_offset = page_end + 2 # account for double newline separator

        return "\n\n".join(full_text), chunks

    @classmethod
    async def fetch_github_repo(cls, repo_url: str, token: str = None, branch: str = "main") -> Tuple[str, str, Dict[str, Any]]:
        """
        Fetches repository metadata, README, and commit history from GitHub API.
        Works with public repositories or authenticated repos with PAT.
        """
        # Parse github.com/owner/repo
        match = re.search(r'github\.com/([^/]+)/([^/]+)', repo_url)
        if not match:
            raise ValueError("Invalid GitHub repository URL format. Expected: https://github.com/owner/repo")
        owner, repo = match.group(1), match.group(2).rstrip(".git")

        headers = {"Accept": "application/vnd.github.v3+json"}
        if token:
            headers["Authorization"] = f"Bearer {token}"

        async with httpx.AsyncClient(timeout=20.0) as client:
            # 1. Fetch README
            readme_url = f"https://api.github.com/repos/{owner}/{repo}/readme"
            readme_resp = await client.get(readme_url, headers=headers)
            readme_text = ""
            if readme_resp.status_code == 200:
                import base64
                data = readme_resp.json()
                if "content" in data:
                    readme_text = base64.b64decode(data["content"]).decode("utf-8", errors="replace")

            # 2. Fetch recent commits (extract operational change log and authors)
            commits_url = f"https://api.github.com/repos/{owner}/{repo}/commits?per_page=10"
            commits_resp = await client.get(commits_url, headers=headers)
            commit_logs = []
            if commits_resp.status_code == 200:
                for c in commits_resp.json():
                    author = c.get("commit", {}).get("author", {}).get("name", "Unknown")
                    msg = c.get("commit", {}).get("message", "").split("\n")[0]
                    date = c.get("commit", {}).get("author", {}).get("date", "")
                    commit_logs.append(f"- [{date[:10]}] {author}: {msg}")

            combined_content = f"# GitHub Repository: {owner}/{repo}\nBranch: {branch}\n\n"
            if readme_text:
                combined_content += f"## Repository README\n{readme_text}\n\n"
            if commit_logs:
                combined_content += f"## Recent Operational Commits\n" + "\n".join(commit_logs)

            metadata = {
                "owner": owner,
                "repo": repo,
                "branch": branch,
                "commit_count": len(commit_logs)
            }
            return f"GitHub: {owner}/{repo}", combined_content, metadata

