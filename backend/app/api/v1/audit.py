from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import AuditLog, User
from app.schemas import AuditLogOut
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/audit", tags=["Audit & Compliance"])

@router.get("/logs", response_model=List[AuditLogOut])
def get_audit_logs(
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(AuditLog).filter(
        AuditLog.organization_id == current_user.organization_id
    ).order_by(AuditLog.id.desc()).limit(limit).all()
    return logs
