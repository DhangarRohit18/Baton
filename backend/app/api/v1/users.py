from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash
from app.models import User, Organization, AuditLog
from app.schemas import UserOut
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users & Team Management"])

class UserInviteRequest(BaseModel):
    email: EmailStr
    full_name: str
    role: str = Field(..., pattern="^(owner|admin|auditor|member|successor|reviewer)$")
    initial_password: Optional[str] = "BatonWelcome2026!"

class UserRoleUpdateRequest(BaseModel):
    user_id: int
    role: str = Field(..., pattern="^(owner|admin|auditor|member|successor|reviewer)$")

@router.get("", response_model=List[UserOut])
def list_team_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    members = db.query(User).filter(User.organization_id == current_user.organization_id).all()
    return members

@router.post("/invite", response_model=UserOut)
def invite_team_member(
    data: UserInviteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ("owner", "admin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Organization Admins or Owners can invite new team members."
        )

    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email is already registered.")

    new_user = User(
        organization_id=current_user.organization_id,
        email=data.email.lower(),
        hashed_password=get_password_hash(data.initial_password or "BatonWelcome2026!"),
        full_name=data.full_name,
        role=data.role,
        is_active=True
    )
    db.add(new_user)
    db.flush()

    audit = AuditLog(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        user_email=current_user.email,
        action="TEAM_MEMBER_INVITED",
        resource_type="user",
        resource_id=str(new_user.id),
        details_json=f'{{"email": "{new_user.email}", "role": "{new_user.role}"}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/update-role", response_model=UserOut)
def update_user_role(
    data: UserRoleUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Insufficient permissions to modify user roles.")

    target = db.query(User).filter(
        User.id == data.user_id,
        User.organization_id == current_user.organization_id
    ).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found in organization.")

    target.role = data.role
    db.commit()
    db.refresh(target)
    return target

