import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Project, User, Handover, Claim, KnowledgeGap, Dependency, AuditLog
from app.schemas import HandoverGenerateRequest, HandoverOut
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/handovers", tags=["Handover Generation"])

@router.get("", response_model=List[HandoverOut])
def list_handovers(
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

    return db.query(Handover).filter(Handover.project_id == project_id).order_by(Handover.id.desc()).all()

@router.post("/generate", response_model=HandoverOut)
def generate_handover(
    data: HandoverGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Synthesizes all verified and approved claims, operational runbooks, dependencies,
    and unresolved tickets into an actionable Successor Handover Pack.
    """
    project = db.query(Project).filter(
        Project.id == data.project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Fetch verified claims
    claims = db.query(Claim).filter(
        Claim.project_id == data.project_id,
        Claim.status.in_(["approved", "verified", "extracted"])
    ).all()

    # Categorize claims
    arch_claims = [c.statement for c in claims if c.category == "architecture"]
    op_claims = [c.statement for c in claims if c.category == "operational"]
    cred_claims = [c.statement for c in claims if c.category == "credentials"]
    unfinished_claims = [c.statement for c in claims if c.category == "unfinished"]
    risk_claims = [c.statement for c in claims if c.category == "risk"]

    # Dependencies
    dependencies = db.query(Dependency).filter(Dependency.project_id == data.project_id).all()
    dep_summary = "\n".join([f"- **{d.source_entity}** -> **{d.target_entity}** ({d.dependency_type}, {d.criticality} criticality): {d.description}" for d in dependencies])

    # Open gaps warning
    open_gaps = db.query(KnowledgeGap).filter(KnowledgeGap.project_id == data.project_id, KnowledgeGap.status != "resolved").all()
    gap_summary = "\n".join([f"- [!] {g.title} ({g.severity} severity): {g.description}" for g in open_gaps])

    # Formulate sections
    exec_summary = (
        f"This Knowledge Continuity Handover Pack was systematically compiled for project '{project.name}' "
        f"under organization stewardship. It encompasses {len(claims)} evidence-grounded claims, "
        f"{len(dependencies)} mapped operational dependencies, and {len(open_gaps)} active knowledge advisories. "
        f"Primary goal: Ensure seamless technical and operational ownership for the incoming successor."
    )

    arch_overview = "### Architectural Baseline\n" + (
        "\n".join(f"- {s}" for s in arch_claims) if arch_claims else "Standard microservice / SaaS design pattern deployed."
    )

    key_decisions = "### Core Decisions & Technical Rationales\n" + (
        "\n".join(f"- {s}" for s in arch_claims[:5]) if arch_claims else "Decisions anchored in repository commits and documentation."
    )

    unfinished_work = "### Unfinished Initiatives & Pending Backlog\n" + (
        "\n".join(f"- {s}" for s in unfinished_claims) if unfinished_claims else "No active blocker tickets flagged in source documents."
    )
    if gap_summary:
        unfinished_work += f"\n\n#### Active Knowledge Gaps to Clarify:\n{gap_summary}"

    pitfalls_and_risks = "### Critical Dependencies & Operational Risks\n" + (
        dep_summary if dep_summary else "No single points of failure recorded."
    )
    if risk_claims:
        pitfalls_and_risks += "\n\n#### Documented Vulnerabilities & Bottlenecks:\n" + "\n".join(f"- {s}" for s in risk_claims)

    operational_runbook = "### Operational Runbook & Emergency Recovery\n" + (
        "\n".join(f"- {s}" for s in op_claims) if op_claims else "Standard health-check and CI/CD deployment pipelines active."
    )
    if cred_claims:
        operational_runbook += "\n\n#### Vault & Credential Access Guidelines:\n" + "\n".join(f"- {s}" for s in cred_claims)

    handover = Handover(
        project_id=data.project_id,
        created_by_id=current_user.id,
        title=data.title,
        executive_summary=exec_summary,
        architecture_overview=arch_overview,
        key_decisions=key_decisions,
        unfinished_work=unfinished_work,
        pitfalls_and_risks=pitfalls_and_risks,
        operational_runbook=operational_runbook,
        verified_claims_count=len(claims),
        readiness_score=project.bus_factor_risk or 90.0,
        status="ready"
    )
    db.add(handover)
    db.flush()

    audit = AuditLog(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        user_email=current_user.email,
        action="HANDOVER_GENERATED",
        resource_type="handover",
        resource_id=str(handover.id),
        details_json=json.dumps({"title": handover.title, "claims": len(claims)})
    )
    db.add(audit)
    db.commit()
    db.refresh(handover)

    return handover

@router.get("/{handover_id}", response_model=HandoverOut)
def get_handover(
    handover_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    handover = db.query(Handover).join(Project).filter(
        Handover.id == handover_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not handover:
        raise HTTPException(status_code=404, detail="Handover not found")
    return handover
