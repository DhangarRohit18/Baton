from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Project, User, ExitInterview, InterviewResponse, KnowledgeGap, Claim, AuditLog
from app.schemas import InterviewCreate, InterviewAnswerSubmit, InterviewOut, InterviewDetailOut
from app.api.v1.deps import get_current_user

router = APIRouter(prefix="/interviews", tags=["Gap-Driven Exit Interviews"])

@router.get("", response_model=List[InterviewOut])
def list_interviews(
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

    interviews = db.query(ExitInterview).filter(ExitInterview.project_id == project_id).all()
    out = []
    for i in interviews:
        out.append({
            "id": i.id,
            "project_id": i.project_id,
            "departing_user_name": i.departing_user_name,
            "departing_user_email": i.departing_user_email,
            "role_title": i.role_title,
            "status": i.status,
            "completion_percentage": i.completion_percentage,
            "created_at": i.created_at,
            "questions_count": db.query(InterviewResponse).filter(InterviewResponse.interview_id == i.id).count()
        })
    return out

@router.post("/generate", response_model=InterviewDetailOut)
def generate_gap_driven_interview(
    data: InterviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == data.project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    interview = ExitInterview(
        project_id=data.project_id,
        departing_user_name=data.departing_user_name,
        departing_user_email=data.departing_user_email,
        role_title=data.role_title,
        status="in_progress",
        completion_percentage=0.0
    )
    db.add(interview)
    db.flush()

    # Fetch open gaps to generate targeted questions
    open_gaps = db.query(KnowledgeGap).filter(
        KnowledgeGap.project_id == data.project_id,
        KnowledgeGap.status == "open"
    ).all()

    responses = []
    for gap in open_gaps:
        q_text = gap.suggested_question or f"Could you provide operational details to resolve: {gap.title}?"
        resp = InterviewResponse(
            interview_id=interview.id,
            gap_id=gap.id,
            prompt_question=q_text,
            category=gap.category,
            answer_text="",
            is_critical=(gap.severity in ("critical", "high"))
        )
        db.add(resp)
        responses.append(resp)
        gap.status = "interview_prompted"

    # Add core institutional handoff questions if gaps were fewer than 3
    if len(responses) < 3:
        fallback_questions = [
            ("credentials", "What credentials, secrets, or elevated tokens exist that are only accessible by you?", True),
            ("operations", "What undocumented steps must be taken to safely restart or roll back this service in an emergency?", True),
            ("unfinished", "What work was in progress or planned that is currently undocumented?", False),
        ]
        for cat, q_text, is_crit in fallback_questions:
            resp = InterviewResponse(
                interview_id=interview.id,
                gap_id=None,
                prompt_question=q_text,
                category=cat,
                answer_text="",
                is_critical=is_crit
            )
            db.add(resp)
            responses.append(resp)

    audit = AuditLog(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        user_email=current_user.email,
        action="EXIT_INTERVIEW_GENERATED",
        resource_type="interview",
        resource_id=str(interview.id),
        details_json=f'{{"departing_member": "{data.departing_user_name}", "questions": {len(responses)}}}'
    )
    db.add(audit)
    db.commit()
    db.refresh(interview)

    return {
        "id": interview.id,
        "project_id": interview.project_id,
        "departing_user_name": interview.departing_user_name,
        "departing_user_email": interview.departing_user_email,
        "role_title": interview.role_title,
        "status": interview.status,
        "completion_percentage": interview.completion_percentage,
        "created_at": interview.created_at,
        "questions_count": len(responses),
        "responses": responses
    }

@router.get("/{interview_id}", response_model=InterviewDetailOut)
def get_interview(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    interview = db.query(ExitInterview).join(Project).filter(
        ExitInterview.id == interview_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Exit interview not found")

    responses = db.query(InterviewResponse).filter(InterviewResponse.interview_id == interview.id).all()
    return {
        "id": interview.id,
        "project_id": interview.project_id,
        "departing_user_name": interview.departing_user_name,
        "departing_user_email": interview.departing_user_email,
        "role_title": interview.role_title,
        "status": interview.status,
        "completion_percentage": interview.completion_percentage,
        "created_at": interview.created_at,
        "questions_count": len(responses),
        "responses": responses
    }

@router.post("/answer", response_model=InterviewDetailOut)
def submit_interview_answer(
    data: InterviewAnswerSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resp = db.query(InterviewResponse).join(ExitInterview).join(Project).filter(
        InterviewResponse.id == data.response_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not resp:
        raise HTTPException(status_code=404, detail="Interview question response not found")

    resp.answer_text = data.answer_text
    
    # If this response was linked to a gap, resolve the gap and convert answer into a verified operational claim!
    if resp.gap_id and data.answer_text.strip():
        gap = db.query(KnowledgeGap).filter(KnowledgeGap.id == resp.gap_id).first()
        if gap:
            gap.status = "resolved"
            gap.resolved_notes = f"Resolved via Exit Interview with departing team member: {data.answer_text}"
            
            # Formulate verified claim from exit interview response
            claim = Claim(
                project_id=gap.project_id,
                document_id=None,
                title=f"Exit Handover: {gap.title}",
                statement=data.answer_text,
                category=resp.category,
                confidence_score=1.0,
                grounding_score=1.0,
                grounding_status="grounded",
                status="approved", # Departed employee direct testimonial
                reviewer_notes=f"Directly verified during exit interview"
            )
            db.add(claim)

    # Recalculate interview completion percentage
    all_resps = db.query(InterviewResponse).filter(InterviewResponse.interview_id == resp.interview_id).all()
    answered = sum(1 for r in all_resps if (r.answer_text and r.answer_text.strip()))
    interview = db.query(ExitInterview).filter(ExitInterview.id == resp.interview_id).first()
    interview.completion_percentage = round((answered / float(len(all_resps))) * 100.0, 1)
    if interview.completion_percentage >= 100.0:
        interview.status = "completed"

    db.commit()
    db.refresh(interview)

    return {
        "id": interview.id,
        "project_id": interview.project_id,
        "departing_user_name": interview.departing_user_name,
        "departing_user_email": interview.departing_user_email,
        "role_title": interview.role_title,
        "status": interview.status,
        "completion_percentage": interview.completion_percentage,
        "created_at": interview.created_at,
        "questions_count": len(all_resps),
        "responses": all_resps
    }
