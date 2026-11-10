import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Project, User, Document, EvidenceChunk, Claim, ClaimEvidenceLink, ClaimReview, AuditLog
from app.schemas import ClaimOut, ClaimReviewRequest, ClaimGroundingVerifyOut, ClaimEvidenceLinkOut
from app.api.v1.deps import get_current_user
from app.services.ai.grounding_guard import DeterministicGroundingGuard
from app.services.knowledge.radar_service import KnowledgeLossRadarService

router = APIRouter(prefix="/claims", tags=["Claim Ledger & Grounding Guard"])

@router.get("", response_model=List[ClaimOut])
def list_claims(
    project_id: int,
    status: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(Claim).filter(Claim.project_id == project_id)
    if status:
        query = query.filter(Claim.status == status)
    if category:
        query = query.filter(Claim.category == category)

    claims = query.order_by(Claim.id.desc()).all()
    results = []

    for c in claims:
        # Load evidence links
        links = db.query(ClaimEvidenceLink).filter(ClaimEvidenceLink.claim_id == c.id).all()
        link_outs = []
        for l in links:
            ev = db.query(EvidenceChunk).filter(EvidenceChunk.id == l.evidence_id).first()
            doc_title = ev.document.title if ev and ev.document else "Document"
            link_outs.append(ClaimEvidenceLinkOut(
                id=l.id,
                evidence_id=l.evidence_id,
                overlap_ratio=l.overlap_ratio,
                match_method=l.match_method,
                snippet=l.snippet or (ev.text_content[:200] if ev else ""),
                document_title=doc_title
            ))

        c_dict = {
            "id": c.id,
            "project_id": c.project_id,
            "document_id": c.document_id,
            "title": c.title,
            "statement": c.statement,
            "category": c.category,
            "confidence_score": c.confidence_score,
            "grounding_score": c.grounding_score,
            "grounding_status": c.grounding_status,
            "status": c.status,
            "reviewer_notes": c.reviewer_notes or "",
            "created_at": c.created_at,
            "evidence_links": link_outs
        }
        results.append(c_dict)

    return results

@router.post("/{claim_id}/verify", response_model=ClaimGroundingVerifyOut)
def verify_claim_grounding(
    claim_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes the Deterministic Grounding Guard on demand against all evidence chunks in the project.
    """
    claim = db.query(Claim).join(Project).filter(
        Claim.id == claim_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    # Fetch all evidence chunks for the project's documents
    chunks = db.query(EvidenceChunk).join(Document).filter(Document.project_id == claim.project_id).all()
    
    guard_res = DeterministicGroundingGuard.verify_claim(claim.statement, chunks)

    claim.grounding_score = guard_res.grounding_score
    claim.grounding_status = "grounded" if guard_res.is_grounded else "unverified"
    
    # Refresh link if grounded
    if guard_res.is_grounded and guard_res.matched_evidence_id:
        existing_link = db.query(ClaimEvidenceLink).filter(
            ClaimEvidenceLink.claim_id == claim.id,
            ClaimEvidenceLink.evidence_id == guard_res.matched_evidence_id
        ).first()
        if not existing_link:
            link = ClaimEvidenceLink(
                claim_id=claim.id,
                evidence_id=guard_res.matched_evidence_id,
                overlap_ratio=guard_res.grounding_score,
                match_method=guard_res.match_method,
                snippet=guard_res.snippet
            )
            db.add(link)

    db.commit()

    return {
        "claim_id": claim.id,
        "grounding_score": claim.grounding_score,
        "grounding_status": claim.grounding_status,
        "matched_evidences": [{
            "evidence_id": guard_res.matched_evidence_id,
            "snippet": guard_res.snippet,
            "score": guard_res.grounding_score
        }] if guard_res.is_grounded else []
    }

@router.post("/{claim_id}/review", response_model=ClaimOut)
def review_claim(
    claim_id: int,
    data: ClaimReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Human-in-the-loop review.
    A human reviewer marks a claim as approved, disputed, or rejected.
    """
    claim = db.query(Claim).join(Project).filter(
        Claim.id == claim_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")

    claim.status = data.decision # approved, disputed, rejected
    claim.reviewer_notes = data.feedback or ""

    review = ClaimReview(
        claim_id=claim.id,
        reviewer_id=current_user.id,
        decision=data.decision,
        feedback=data.feedback or ""
    )
    db.add(review)

    # Audit log
    audit = AuditLog(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        user_email=current_user.email,
        action=f"CLAIM_{data.decision.upper()}",
        resource_type="claim",
        resource_id=str(claim.id),
        details_json=json.dumps({"title": claim.title, "decision": data.decision, "reviewer": current_user.email})
    )
    db.add(audit)
    db.commit()

    # Recalculate project risk
    project = db.query(Project).filter(Project.id == claim.project_id).first()
    if project:
        KnowledgeLossRadarService.calculate_project_risk(db, project)

    db.refresh(claim)
    return {
        "id": claim.id,
        "project_id": claim.project_id,
        "document_id": claim.document_id,
        "title": claim.title,
        "statement": claim.statement,
        "category": claim.category,
        "confidence_score": claim.confidence_score,
        "grounding_score": claim.grounding_score,
        "grounding_status": claim.grounding_status,
        "status": claim.status,
        "reviewer_notes": claim.reviewer_notes,
        "created_at": claim.created_at,
        "evidence_links": []
    }

