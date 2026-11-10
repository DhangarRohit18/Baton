import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token
from app.models import Organization, User, AuditLog
from app.schemas import UserRegister, UserLogin, Token, UserOut
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
