from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Project, User, KnowledgeGap, Contradiction, Claim, AuditLog
from app.schemas import GapCreate, GapOut, ContradictionOut
from app.api.v1.deps import get_current_user
from app.services.knowledge.radar_service import KnowledgeLossRadarService

router = APIRouter(prefix="/gaps", tags=["Knowledge Gaps & Contradictions"])

@router.get("", response_model=List[GapOut])
def list_knowledge_gaps(
    project_id: int,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(KnowledgeGap).filter(KnowledgeGap.project_id == project_id)
    if status:
        query = query.filter(KnowledgeGap.status == status)
    if severity:
        query = query.filter(KnowledgeGap.severity == severity)

    return query.order_by(KnowledgeGap.id.desc()).all()

@router.post("", response_model=GapOut)
def create_knowledge_gap(
    data: GapCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == data.project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    gap = KnowledgeGap(
        project_id=data.project_id,
        title=data.title,
        description=data.description,
        severity=data.severity,
        category=data.category,
        suggested_question=data.suggested_question or f"How should a successor address: {data.title}?",
        status="open"
    )
    db.add(gap)
    db.commit()
    db.refresh(gap)

    KnowledgeLossRadarService.calculate_project_risk(db, project)
    return gap

@router.post("/{gap_id}/resolve", response_model=GapOut)
def resolve_knowledge_gap(
    gap_id: int,
    resolution_notes: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    gap = db.query(KnowledgeGap).join(Project).filter(
        KnowledgeGap.id == gap_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not gap:
        raise HTTPException(status_code=404, detail="Knowledge gap not found")

    gap.status = "resolved"
    gap.resolved_notes = resolution_notes

    audit = AuditLog(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        user_email=current_user.email,
        action="GAP_RESOLVED",
        resource_type="gap",
        resource_id=str(gap.id),
        details_json=f'{{"title": "{gap.title}"}}'
    )
    db.add(audit)
    db.commit()

    project = db.query(Project).filter(Project.id == gap.project_id).first()
    if project:
        KnowledgeLossRadarService.calculate_project_risk(db, project)

    db.refresh(gap)
    return gap

@router.get("/contradictions", response_model=List[ContradictionOut])
def list_contradictions(
    project_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    contradictions = db.query(Contradiction).filter(Contradiction.project_id == project_id).all()
    results = []
    for c in contradictions:
        ca = db.query(Claim).filter(Claim.id == c.claim_a_id).first()
        cb = db.query(Claim).filter(Claim.id == c.claim_b_id).first()
        results.append({
            "id": c.id,
            "project_id": c.project_id,
            "claim_a_id": c.claim_a_id,
            "claim_b_id": c.claim_b_id,
            "claim_a_statement": ca.statement if ca else "",
            "claim_b_statement": cb.statement if cb else "",
            "conflict_summary": c.conflict_summary,
            "status": c.status,
            "created_at": c.created_at
        })
    return results
