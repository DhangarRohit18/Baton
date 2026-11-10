def test_team_invite_and_browser_capture(client):
    # 1. Register organization owner
    reg = client.post("/api/v1/auth/register", json={
        "org_name": "Weyland-Yutani",
        "email": "director@weyland.com",
        "password": "AlienPassword2026!",
        "full_name": "Director Ellen"
    }).json()
    token = reg["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Invite successor developer
    invite_resp = client.post("/api/v1/users/invite", json={
        "email": "successor@weyland.com",
        "full_name": "Successor Ripley",
        "role": "successor"
    }, headers=headers)
    assert invite_resp.status_code == 200
    assert invite_resp.json()["email"] == "successor@weyland.com"

    # 3. Create project
    proj = client.post("/api/v1/projects", json={
        "name": "Nostromo Cryo-Telemetry",
        "description": "Critical atmospheric and cryo telemetry continuity"
    }, headers=headers).json()
    proj_id = proj["id"]

    # 4. Ingest via Chrome Extension capture endpoint
    capture_resp = client.post("/api/v1/captures", json={
        "page_url": "https://wiki.weyland.internal/nostromo/runbook",
        "page_title": "Nostromo Cryo Operations Runbook",
        "extracted_content": "The cryo coolant system uses liquid nitrogen on loop 3. Port 9090 monitors core chamber pressure. TODO: Refactor emergency decompression valve before Q4.",
        "selected_text": "Port 9090 monitors core chamber pressure.",
        "project_id": proj_id,
        "tags": ["ops", "telemetry"],
        "notes": "Captured directly from internal engineering documentation."
    }, headers=headers)
    assert capture_resp.status_code == 200
    cap_data = capture_resp.json()
    assert cap_data["success"] is True
    assert "document_id" in cap_data

    # 5. Public verification endpoint check
    # Generate handover
    handover = client.post("/api/v1/handovers/generate", json={
        "project_id": proj_id,
        "title": "Cryo Telemetry Handover"
    }, headers=headers).json()

    # Mint QR Bridge
    qr_bridge = client.post("/api/v1/qr-bridge/mint", json={
        "handover_id": handover["id"],
        "ttl_hours": 24,
        "max_uses": 2
    }, headers=headers).json()

    token_str = qr_bridge["signed_token"]

    # Test public verify endpoint
    verify_resp = client.get(f"/api/v1/qr-bridge/verify/{token_str}")
    assert verify_resp.status_code == 200
    verify_json = verify_resp.json()
    assert verify_json["valid"] is True
    assert verify_json["integrity_status"] == "VERIFIED_AUTHENTIC"
    assert "verification_id" in verify_json

