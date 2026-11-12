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

    # 4. Refresh token
    refresh_resp = client.post("/api/v1/auth/refresh", headers=headers)
    assert refresh_resp.status_code == 200
    assert "access_token" in refresh_resp.json()

    # 5. Forgot password flow
    forgot_resp = client.post("/api/v1/auth/forgot-password", json={"email": "chief.engineer@acme.com"})
    assert forgot_resp.status_code == 200
    reset_token = forgot_resp.json()["reset_token"]
    assert reset_token is not None

    # 6. Reset password using valid reset token
    reset_resp = client.post("/api/v1/auth/reset-password", json={
        "token": reset_token,
        "new_password": "BrandNewPassword2026!"
    })
    assert reset_resp.status_code == 200

    # 7. Login with newly reset password
    new_login = client.post("/api/v1/auth/login", json={
        "email": "chief.engineer@acme.com",
        "password": "BrandNewPassword2026!"
    })
    assert new_login.status_code == 200

    # 8. Setup MFA
    mfa_resp = client.post("/api/v1/auth/mfa/setup", headers=headers)
    assert mfa_resp.status_code == 200
    assert "secret" in mfa_resp.json()
    assert "otpauth_url" in mfa_resp.json()


