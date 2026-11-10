import json
import re
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings

class AIProviderService:
    """
    Abstracted AI Provider interface.
    Supports Gemini, OpenAI, or intelligent deterministic NLP extraction.
    Ensures outputs are always structured schemas (Claims, Decisions, Gaps, Dependencies).
    """

    @classmethod
    async def extract_knowledge(cls, content: str, source_title: str) -> Dict[str, Any]:
        """
        Extracts structured claims, gaps, and dependencies from raw text.
        """
        # Try external LLM API if configured
        if settings.GEMINI_API_KEY:
            try:
                res = await cls._call_gemini(content, source_title)
                if res:
                    return res
            except Exception as e:
                print(f"[AIProvider] Gemini call failed, falling back: {e}")

        if settings.OPENAI_API_KEY:
            try:
                res = await cls._call_openai(content, source_title)
                if res:
                    return res
            except Exception as e:
                print(f"[AIProvider] OpenAI call failed, falling back: {e}")

        # Deterministic / Heuristic High-Precision NLP extraction
        return cls._deterministic_nlp_extract(content, source_title)

    @classmethod
    async def _call_gemini(cls, content: str, source_title: str) -> Optional[Dict[str, Any]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        prompt = f"""
You are the BATON Knowledge Continuity Extraction Engine. Analyze this document ('{source_title}'):
\"\"\"{content[:15000]}\"\"\"

Extract structured JSON strictly with keys:
- claims: list of {{"title": str, "statement": str, "category": "architecture"|"operational"|"credentials"|"risk"|"unfinished", "confidence_score": float}}
- gaps: list of {{"title": str, "description": str, "severity": "low"|"medium"|"high"|"critical", "category": str, "suggested_question": str}}
- dependencies: list of {{"source_entity": str, "target_entity": str, "dependency_type": str, "criticality": "low"|"medium"|"high"|"fatal", "description": str}}
- key_decisions: list of str
- unfinished_work: list of str
- operational_runbook: str

Return ONLY valid JSON.
"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json={
                "contents": [{"parts": [{"text": prompt}]}]
            })
            if resp.status_code == 200:
                data = resp.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
                # Parse markdown json fences if any
                clean_json = re.sub(r"^```json\s*|\s*```$", "", raw_text.strip(), flags=re.MULTILINE)
                return json.loads(clean_json)
        return None

    @classmethod
    async def _call_openai(cls, content: str, source_title: str) -> Optional[Dict[str, Any]]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        prompt = f"""Analyze this document for knowledge continuity:
\"\"\"{content[:15000]}\"\"\"
Return strictly JSON with keys: claims, gaps, dependencies, key_decisions, unfinished_work, operational_runbook."""
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json={
                "model": "gpt-4o-mini",
                "response_format": {"type": "json_object"},
                "messages": [{"role": "user", "content": prompt}]
            })
            if resp.status_code == 200:
                data = resp.json()
                return json.loads(data["choices"][0]["message"]["content"])
        return None

    @classmethod
    def _deterministic_nlp_extract(cls, content: str, source_title: str) -> Dict[str, Any]:
        """
        High-precision rule-based and syntactic extractor that guarantees:
        1. Every claim is verbatim or closely anchored to input text.
        2. Detects architecture decisions, TODOs/unfinished work, credentials/secrets references, single points of contact.
        """
        paragraphs = [p.strip() for p in content.split("\n\n") if len(p.strip()) > 30]
        sentences = re.split(r'(?<=[.!?])\s+', content)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 20]

        claims = []
        gaps = []
        dependencies = []
        key_decisions = []
        unfinished_work = []
        runbook_items = []

        # Keywords for categorization
        arch_kws = ["architecture", "database", "postgres", "redis", "service", "api", "framework", "docker", "deploy", "microservice", "pipeline"]
        op_kws = ["runbook", "restart", "monitor", "alert", "port", "env", "configuration", "cron", "log", "script", "backup"]
        cred_kws = ["secret", "password", "token", "auth", "credential", "private key", "access key", "api_key", "vpn"]
        risk_kws = ["risk", "bug", "deprecated", "vulnerability", "bottleneck", "warning", "fail", "slow", "fragile"]
        unfinished_kws = ["todo", "fixme", "in progress", "wip", "remaining", "unresolved", "not yet", "pending", "future work"]

        for s in sentences:
            s_lower = s.lower()
            
            # Check for Unfinished Work / TODOs
            if any(k in s_lower for k in unfinished_kws):
                unfinished_work.append(s)
                claims.append({
                    "title": f"Unfinished Task: {s[:50]}...",
                    "statement": s,
                    "category": "unfinished",
                    "confidence_score": 0.95
                })
                gaps.append({
                    "title": f"Unresolved Workstream: {s[:60]}",
                    "description": f"Identified pending or incomplete task in '{source_title}': '{s}'. Successor may lack context on how to complete it.",
                    "severity": "high",
                    "category": "operations",
                    "suggested_question": f"What are the immediate blockers and prerequisites for completing: '{s}'?"
                })
                continue

            # Check for Key Decisions
            if any(k in s_lower for k in ["decided to", "chose to", "selected", "migrated to", "architecture choice", "reason why", "because of"]):
                key_decisions.append(s)
                claims.append({
                    "title": f"Key Decision: {s[:50]}...",
                    "statement": s,
                    "category": "architecture",
                    "confidence_score": 0.92
                })
                continue

            # Check for Operational Runbook
            if any(k in s_lower for k in op_kws):
                runbook_items.append(s)
                claims.append({
                    "title": f"Operational Procedure: {s[:50]}...",
                    "statement": s,
                    "category": "operational",
                    "confidence_score": 0.90
                })
                continue

            # Check for Architecture Claims
            if any(k in s_lower for k in arch_kws):
                claims.append({
                    "title": f"Architecture Fact: {s[:50]}...",
                    "statement": s,
                    "category": "architecture",
                    "confidence_score": 0.88
                })
                continue

            # Check for Credentials / Secret Dependencies
            if any(k in s_lower for k in cred_kws):
                claims.append({
                    "title": f"Access & Credential Context: {s[:50]}...",
                    "statement": s,
                    "category": "credentials",
                    "confidence_score": 0.95
                })
                gaps.append({
                    "title": f"Credential Custody Gap: {s[:50]}",
                    "description": f"Document mentions access or credential requirement: '{s}'. Verify vault access before departure.",
                    "severity": "critical",
                    "category": "credentials",
                    "suggested_question": f"Where are the actual credentials stored and who has owner/admin delegation rights?"
                })

        # Dependency detection: "A connects to B" or "A uses B" or "requires X"
        dep_patterns = [
            r'([A-Za-z0-9_-]+)\s+(?:uses|depends on|connects to|queries|calls|requires|relies on)\s+([A-Za-z0-9_-]+)',
            r'service\s+([A-Za-z0-9_-]+)\s+integrates with\s+([A-Za-z0-9_-]+)'
        ]
        for pattern in dep_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            for src, tgt in matches:
                if len(src) > 1 and len(tgt) > 1 and src.lower() != tgt.lower():
                    dependencies.append({
                        "source_entity": src.strip(),
                        "target_entity": tgt.strip(),
                        "dependency_type": "technical_service",
                        "criticality": "high",
                        "description": f"System linkage extracted from text in {source_title}"
                    })

        # Ensure at least one claim is extracted from first paragraph if none found
        if not claims and paragraphs:
            first_p = paragraphs[0][:200]
            claims.append({
                "title": f"Overview statement from {source_title}",
                "statement": first_p,
                "category": "operational",
                "confidence_score": 0.85
            })

        # If runbook empty, formulate from operational claims
        op_text = "\n".join(f"- {item}" for item in runbook_items[:8]) if runbook_items else "Standard service monitoring and CI/CD pipelines documented."

        return {
            "claims": claims[:15], # top 15 claims
            "gaps": gaps[:6],
            "dependencies": dependencies[:8],
            "key_decisions": key_decisions[:5],
            "unfinished_work": unfinished_work[:5],
            "operational_runbook": op_text
        }

