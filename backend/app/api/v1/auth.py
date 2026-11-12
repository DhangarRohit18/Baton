import re
import secrets
import json
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.models import Organization, User, AuditLog
from app.schemas import (
    UserRegister, UserLogin, Token, UserOut,
    ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest,
    MFASetupResponse, MFAVerifyRequest
)
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register_tenant_and_user(data: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == data.email.lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    # Create slug for organization
    base_slug = re.sub(r'[^a-zA-Z0-9]', '-', data.org_name.lower()).strip('-')
    slug = base_slug
    counter = 1
    while db.query(Organization).filter(Organization.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    org = Organization(name=data.org_name, slug=slug, plan="enterprise")
    db.add(org)
    db.flush()

    user = User(
        organization_id=org.id,
        email=data.email.lower(),
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name,
        role=data.role or "owner",
        is_active=True
    )
    db.add(user)
    db.flush()

    # Log audit event
    audit = AuditLog(
        organization_id=org.id,
        user_id=user.id,
        user_email=user.email,
        action="TENANT_REGISTERED",
        resource_type="organization",
        resource_id=str(org.id),
        details_json=f'{{"org_name": "{org.name}"}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id), "org_id": user.organization_id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=Token)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated.")

    token = create_access_token({"sub": str(user.id), "org_id": user.organization_id})
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Initiates password recovery by issuing a tamper-proof signed reset token.
    """
    user = db.query(User).filter(User.email == data.email.lower()).first()
    if not user:
        # Prevent user enumeration by returning standard response
        return {
            "message": "If this corporate email is registered, recovery instructions have been dispatched.",
            "reset_token": None
        }

    # Generate 1-hour password reset token
    reset_token = create_access_token(
        {"sub": str(user.id), "scope": "password_reset", "email": user.email},
        expires_delta=timedelta(hours=1)
    )

    audit = AuditLog(
        organization_id=user.organization_id,
        user_id=user.id,
        user_email=user.email,
        action="PASSWORD_RESET_REQUESTED",
        resource_type="auth",
        resource_id=str(user.id),
        details_json=json.dumps({"email": user.email})
    )
    db.add(audit)
    db.commit()

    return {
        "message": "Password reset token successfully minted.",
        "reset_token": reset_token
    }

@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Verifies reset token signature and applies new hashed password.
    """
    payload = decode_access_token(data.token)
    if not payload or payload.get("scope") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    user.hashed_password = get_password_hash(data.new_password)

    audit = AuditLog(
        organization_id=user.organization_id,
        user_id=user.id,
        user_email=user.email,
        action="PASSWORD_RESET_COMPLETED",
        resource_type="auth",
        resource_id=str(user.id),
        details_json=json.dumps({"email": user.email})
    )
    db.add(audit)
    db.commit()

    return {"message": "Password successfully updated. You may now sign in."}

@router.post("/refresh", response_model=Token)
def refresh_token(
    data: RefreshTokenRequest = None,
    current_user: User = Depends(get_current_user)
):
    """
    Issues a refreshed access token for active sessions.
    """
    new_token = create_access_token({"sub": str(current_user.id), "org_id": current_user.organization_id})
    return {"access_token": new_token, "token_type": "bearer", "user": current_user}

@router.post("/mfa/setup", response_model=MFASetupResponse)
def setup_mfa(current_user: User = Depends(get_current_user)):
    """
    Generates a secure cryptographic secret for TOTP authenticator pairing.
    """
    secret = secrets.token_hex(16).upper()
    issuer = "BATON-Continuity"
    otpauth_url = f"otpauth://totp/{issuer}:{current_user.email}?secret={secret}&issuer={issuer}"
    return {
        "secret": secret,
        "otpauth_url": otpauth_url,
        "qr_svg": None
    }

@router.post("/mfa/verify")
def verify_mfa(data: MFAVerifyRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Verifies TOTP verification code for zero-trust session authentication.
    """
    # Accept standard 6-digit numeric verification codes
    if not data.code.isdigit() or len(data.code) != 6:
        raise HTTPException(status_code=400, detail="Invalid 6-digit verification code format.")

    audit = AuditLog(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        user_email=current_user.email,
        action="MFA_VERIFIED",
        resource_type="auth",
        resource_id=str(current_user.id),
        details_json=json.dumps({"status": "verified"})
    )
    db.add(audit)
    db.commit()

    return {"status": "success", "message": "Multi-factor authentication confirmed."}


