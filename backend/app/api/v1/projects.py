from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Project, User, Document, Claim, KnowledgeGap, AuditLog
from app.schemas import ProjectCreate, ProjectUpdate, ProjectOut
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectOut])
def list_projects(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    projects = db.query(Project).filter(Project.organization_id == current_user.organization_id).all()
    out = []
    for p in projects:
        p_dict = {
            "id": p.id,
            "organization_id": p.organization_id,
            "name": p.name,
            "description": p.description or "",
            "lead_name": p.lead_name or "",
            "lead_email": p.lead_email or "",
            "status": p.status,
            "bus_factor_risk": p.bus_factor_risk or 0.0,
            "created_at": p.created_at,
            "document_count": db.query(Document).filter(Document.project_id == p.id).count(),
            "claim_count": db.query(Claim).filter(Claim.project_id == p.id).count(),
            "gap_count": db.query(KnowledgeGap).filter(KnowledgeGap.project_id == p.id).count(),
        }
        out.append(p_dict)
    return out

@router.post("", response_model=ProjectOut)
def create_project(data: ProjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = Project(
        organization_id=current_user.organization_id,
        name=data.name,
        description=data.description or "",
        lead_name=data.lead_name or "",
        lead_email=data.lead_email or "",
        status="active"
    )
    db.add(project)
    db.flush()

    audit = AuditLog(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        user_email=current_user.email,
        action="PROJECT_CREATED",
        resource_type="project",
        resource_id=str(project.id),
        details_json=f'{{"name": "{project.name}"}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(project)

    return {
        "id": project.id,
        "organization_id": project.organization_id,
        "name": project.name,
        "description": project.description,
        "lead_name": project.lead_name,
        "lead_email": project.lead_email,
        "status": project.status,
        "bus_factor_risk": project.bus_factor_risk,
        "created_at": project.created_at,
        "document_count": 0,
        "claim_count": 0,
        "gap_count": 0
    }

@router.get("/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "id": project.id,
        "organization_id": project.organization_id,
        "name": project.name,
        "description": project.description,
        "lead_name": project.lead_name,
        "lead_email": project.lead_email,
        "status": project.status,
        "bus_factor_risk": project.bus_factor_risk,
        "created_at": project.created_at,
        "document_count": db.query(Document).filter(Document.project_id == project.id).count(),
        "claim_count": db.query(Claim).filter(Claim.project_id == project.id).count(),
        "gap_count": db.query(KnowledgeGap).filter(KnowledgeGap.project_id == project.id).count(),
    }

