def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_register_and_login(client):
    # 1. Register new tenant organization and owner
    reg_payload = {
        "org_name": "Acme Aerospace",
        "email": "chief.engineer@acme.com",
        "password": "SecurePassword123!",
        "full_name": "Chief Engineer"
    }
    reg_resp = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_resp.status_code == 200, reg_resp.text
    data = reg_resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "chief.engineer@acme.com"
    assert data["user"]["role"] == "owner"

    # 2. Login with valid credentials
    login_payload = {
        "email": "chief.engineer@acme.com",
        "password": "SecurePassword123!"
    }
    login_resp = client.post("/api/v1/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    assert token

    # 3. Access authenticated /me endpoint
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["full_name"] == "Chief Engineer"
