from app.core.security import sign_qr_token, verify_qr_token

def test_qr_bridge_cryptographic_signing():
    token = sign_qr_token(handover_id=42, organization_id=1, ttl_hours=24)
    assert token.startswith("BATON-")
    
    payload = verify_qr_token(token)
    assert payload is not None
    assert payload["hid"] == 42
    assert payload["oid"] == 1

    # Test tampering
    tampered = token[:-4] + "abcd"
    assert verify_qr_token(tampered) is None

def test_qr_bridge_lifecycle(client):
    # Register & setup
    reg = client.post("/api/v1/auth/register", json={
        "org_name": "Initech Corp",
        "email": "peter@initech.com",
        "password": "Password123!",
        "full_name": "Peter Gibbons"
    }).json()
    token = reg["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    proj = client.post("/api/v1/projects", json={
        "name": "TPS Report Automation",
        "description": "Critical enterprise reporting system"
    }, headers=headers).json()
    proj_id = proj["id"]

    # Generate Handover
    handover = client.post("/api/v1/handovers/generate", json={
        "project_id": proj_id,
        "title": "TPS Successor Handover Pack"
    }, headers=headers).json()
    handover_id = handover["id"]

    # Mint QR Bridge
    mint_resp = client.post("/api/v1/qr-bridge/mint", json={
        "handover_id": handover_id,
        "ttl_hours": 48,
        "passphrase": "RedStapler2026!",
        "max_uses": 3
    }, headers=headers)
    assert mint_resp.status_code == 200, mint_resp.text
    bridge = mint_resp.json()
    assert bridge["has_passphrase"] is True
    assert bridge["qr_data_url"].startswith("data:image/png;base64,")
    signed_token = bridge["signed_token"]

    # Redeem with wrong passphrase -> Expect 400
    bad_redeem = client.post("/api/v1/qr-bridge/redeem", json={
        "token": signed_token,
        "passphrase": "WrongPassphrase"
    })
    assert bad_redeem.status_code == 400

    # Redeem with correct passphrase -> Expect 200
    good_redeem = client.post("/api/v1/qr-bridge/redeem", json={
        "token": signed_token,
        "passphrase": "RedStapler2026!"
    })
    assert good_redeem.status_code == 200
    redeem_data = good_redeem.json()
    assert redeem_data["success"] is True
    assert redeem_data["handover"]["title"] == "TPS Successor Handover Pack"
    assert redeem_data["remaining_uses"] == 2

    # Revoke QR Bridge
    revoke_resp = client.post("/api/v1/qr-bridge/revoke", json={
        "qr_bridge_id": bridge["id"],
        "reason": "Employee departure completed, invalidating bridge token"
    }, headers=headers)
    assert revoke_resp.status_code == 200
    assert revoke_resp.json()["is_revoked"] is True

    # Attempt redeem after revocation -> Expect 400
    post_revoke_redeem = client.post("/api/v1/qr-bridge/redeem", json={
        "token": signed_token,
        "passphrase": "RedStapler2026!"
    })
    assert post_revoke_redeem.status_code == 400
    assert "revoked" in post_revoke_redeem.json()["detail"].lower()

