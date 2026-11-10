def test_exit_interview_and_gap_resolution(client):
    reg = client.post("/api/v1/auth/register", json={
        "org_name": "Stark Industries",
        "email": "tony@stark.com",
        "password": "IronMan2026!",
        "full_name": "Tony Stark"
    }).json()
    token = reg["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    proj = client.post("/api/v1/projects", json={
        "name": "Arc Reactor Mark VII",
        "description": "Clean energy matrix continuity"
    }, headers=headers).json()
    proj_id = proj["id"]

    # Create explicit Knowledge Gap
    gap_resp = client.post("/api/v1/gaps", json={
        "project_id": proj_id,
        "title": "Palladium Core Synthesis Frequency",
        "description": "Specific oscillation frequency needed to prevent thermal breakdown is undocumented.",
        "severity": "critical",
        "category": "operations",
        "suggested_question": "What is the exact harmonic oscillation frequency for the core?"
    }, headers=headers)
    assert gap_resp.status_code == 200
    gap = gap_resp.json()
    assert gap["status"] == "open"

    # Generate gap-driven exit interview
    interview_resp = client.post("/api/v1/interviews/generate", json={
        "project_id": proj_id,
        "departing_user_name": "Tony Stark",
        "departing_user_email": "tony@stark.com",
        "role_title": "Chief Technology Officer"
    }, headers=headers)
    assert interview_resp.status_code == 200
    interview = interview_resp.json()
    assert len(interview["responses"]) >= 1

    # Find the response corresponding to our gap
    target_resp = next(r for r in interview["responses"] if r["gap_id"] == gap["id"])
    assert target_resp is not None

    # Submit answer to resolve gap
    answer_resp = client.post("/api/v1/interviews/answer", json={
        "response_id": target_resp["id"],
        "answer_text": "The harmonic oscillation frequency must be tuned to exactly 4.28 GHz under vacuum."
    }, headers=headers)
    assert answer_resp.status_code == 200

    # Verify that the knowledge gap is now resolved
    gaps_list = client.get(f"/api/v1/gaps?project_id={proj_id}", headers=headers).json()
    resolved_gap = next(g for g in gaps_list if g["id"] == gap["id"])
    assert resolved_gap["status"] == "resolved"

    # Verify that the answer was converted into an approved claim
    claims_list = client.get(f"/api/v1/claims?project_id={proj_id}", headers=headers).json()
    testimonial_claim = next(c for c in claims_list if "4.28 GHz" in c["statement"])
    assert testimonial_claim["status"] == "approved"

    # Verify Knowledge Loss Radar computation
    radar_resp = client.get("/api/v1/radar/overview", headers=headers)
    assert radar_resp.status_code == 200
    radar_data = radar_resp.json()
    assert "overall_readiness_score" in radar_data
    assert "risk_breakdown" in radar_data
