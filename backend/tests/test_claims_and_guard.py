from app.services.ai.grounding_guard import DeterministicGroundingGuard

class MockChunk:
    def __init__(self, id, text):
        self.id = id
        self.text_content = text

def test_grounding_guard_exact_and_token_overlap():
    chunks = [
        MockChunk(1, "The primary backend service connects to PostgreSQL 16 on port 5432 using SQLAlchemy pool."),
        MockChunk(2, "Redis cluster is hosted on port 6379 for caching sessions and rate limiting.")
    ]

    # Grounded claim
    claim_1 = "The backend connects to PostgreSQL 16 on port 5432."
    res_1 = DeterministicGroundingGuard.verify_claim(claim_1, chunks)
    assert res_1.is_grounded is True
    assert res_1.matched_evidence_id == 1
    assert res_1.grounding_score > 0.6

    # Completely hallucinated claim
    claim_2 = "The system uses Cassandra for distributed blockchain ledger storage on AWS."
    res_2 = DeterministicGroundingGuard.verify_claim(claim_2, chunks)
    assert res_2.is_grounded is False
    assert res_2.grounding_score < 0.2

def test_project_and_claim_flow(client):
    # Register user
    reg = client.post("/api/v1/auth/register", json={
        "org_name": "Cyberdyne Systems",
        "email": "lead@cyberdyne.com",
        "password": "Password123!",
        "full_name": "Lead Architect"
    }).json()
    token = reg["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create project
    proj = client.post("/api/v1/projects", json={
        "name": "Skynet Continuity Project",
        "description": "Critical architectural documentation",
        "lead_name": "Miles Bennett",
        "lead_email": "miles@cyberdyne.com"
    }, headers=headers).json()
    proj_id = proj["id"]

    # Ingest document
    doc_text = """
    Skynet architecture relies on distributed nodes running PostgreSQL 16 on port 5432.
    Critical operational rule: Never terminate neural process 4 without flushing the Redis write-ahead log.
    TODO: Migrate legacy authentication secrets into HashiCorp Vault before November 2026.
    """
    
    upload_resp = client.post(
        "/api/v1/documents/upload",
        data={"project_id": str(proj_id)},
        files={"file": ("architecture.md", doc_text.encode("utf-8"), "text/markdown")},
        headers=headers
    )
    assert upload_resp.status_code == 200, upload_resp.text

    # List claims
    claims_resp = client.get(f"/api/v1/claims?project_id={proj_id}", headers=headers)
    assert claims_resp.status_code == 200
    claims = claims_resp.json()
    assert len(claims) > 0

    first_claim = claims[0]
    # Human Review Approval
    review_resp = client.post(
        f"/api/v1/claims/{first_claim['id']}/review",
        json={"decision": "approved", "feedback": "Verified against production setup"},
        headers=headers
    )
    assert review_resp.status_code == 200
    assert review_resp.json()["status"] == "approved"
