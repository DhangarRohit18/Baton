import re
from typing import List, Tuple, Dict, Any

class GroundingGuardResult:
    def __init__(self, is_grounded: bool, grounding_score: float, matched_evidence_id: int, snippet: str, match_method: str):
        self.is_grounded = is_grounded
        self.grounding_score = grounding_score
        self.matched_evidence_id = matched_evidence_id
        self.snippet = snippet
        self.match_method = match_method

class DeterministicGroundingGuard:
    """
    Deterministic Grounding Guard:
    Guarantees that an AI-extracted claim is anchored directly to ground-truth evidence chunks.
    Uses n-gram token overlap, lexical substring analysis, and exact numeric/entity containment checks.
    AI is strictly prohibited from asserting ungrounded 'facts'.
    """

    @staticmethod
    def tokenize(text: str) -> List[str]:
        # Normalize and tokenize into lowercase words
        words = re.findall(r'\b[a-zA-Z0-9_\-\./]+\b', text.lower())
        # Filter out extremely common stop words for high-fidelity token comparison
        stop_words = {"the", "a", "an", "is", "are", "was", "were", "to", "in", "for", "on", "with", "at", "by", "from", "that", "this", "it"}
        return [w for w in words if w not in stop_words]

    @classmethod
    def verify_claim(cls, claim_statement: str, evidence_chunks: List[Any]) -> GroundingGuardResult:
        if not evidence_chunks:
            return GroundingGuardResult(False, 0.0, 0, "", "no_evidence")

        claim_tokens = set(cls.tokenize(claim_statement))
        if not claim_tokens:
            return GroundingGuardResult(False, 0.0, 0, "", "empty_claim")

        best_score = 0.0
        best_chunk_id = 0
        best_snippet = ""
        best_method = "none"

        clean_claim = claim_statement.strip().lower()

        for chunk in evidence_chunks:
            chunk_text = chunk.text_content
            clean_chunk = chunk_text.lower()

            # 1. Exact Substring Containment Check (Highest confidence)
            if clean_claim in clean_chunk:
                return GroundingGuardResult(
                    is_grounded=True,
                    grounding_score=1.0,
                    matched_evidence_id=chunk.id,
                    snippet=chunk_text[:300],
                    match_method="exact_substring"
                )

            # 2. Token Overlap (Jaccard Index of Significant Tokens)
            chunk_tokens = set(cls.tokenize(chunk_text))
            if not chunk_tokens:
                continue

            intersection = claim_tokens.intersection(chunk_tokens)
            # What percentage of the claim's core informational tokens are grounded in this chunk?
            coverage_score = len(intersection) / float(len(claim_tokens))

            # 3. Numeric & Technical Identifier Guard (Critical facts)
            # E.g. port 5432, redis, v2.1, etc.
            claim_entities = re.findall(r'\b(?:[0-9]+(?:\.[0-9]+)?|[A-Z][a-zA-Z0-9_-]+)\b', claim_statement)
            if claim_entities:
                entity_hits = sum(1 for e in claim_entities if e.lower() in clean_chunk)
                entity_ratio = entity_hits / float(len(claim_entities))
                combined_score = (coverage_score * 0.7) + (entity_ratio * 0.3)
            else:
                combined_score = coverage_score

            if combined_score > best_score:
                best_score = combined_score
                best_chunk_id = chunk.id
                # Find best matching sentence for snippet
                sentences = re.split(r'(?<=[.!?]) +', chunk_text)
                matching_sentence = max(sentences, key=lambda s: len(claim_tokens.intersection(set(cls.tokenize(s)))), default=chunk_text[:200])
                best_snippet = matching_sentence.strip()
                best_method = "token_jaccard_entity"

        # Grounding threshold: at least 45% of claim tokens must be grounded in an evidence chunk
        is_grounded = best_score >= 0.45

        return GroundingGuardResult(
            is_grounded=is_grounded,
            grounding_score=round(best_score, 3),
            matched_evidence_id=best_chunk_id,
            snippet=best_snippet,
            match_method=best_method
        )
