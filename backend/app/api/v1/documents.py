import os
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.config import settings
from app.models import Project, User, Document, EvidenceChunk, Claim, ClaimEvidenceLink, KnowledgeGap, Dependency, AuditLog
from app.schemas import DocumentOut, GitHubIngestRequest
from app.api.v1.deps import get_current_user
from app.services.ingestion.parser import DocumentParserService
from app.services.ai.provider import AIProviderService
from app.services.ai.grounding_guard import DeterministicGroundingGuard
from app.services.knowledge.radar_service import KnowledgeLossRadarService

router = APIRouter(prefix="/documents", tags=["Document Ingestion"])

async def _process_ingested_content(
    db: Session,
    project_id: int,
    user: User,
    title: str,
    source_type: str,
    source_url: str,
    raw_text: str,
    metadata: dict = None
) -> Document:
    # 1. Create Document record
    doc = Document(
        project_id=project_id,
        title=title,
        source_type=source_type,
        source_url=source_url or "",
        raw_content=raw_text,
        char_count=len(raw_text),
        metadata_json=json.dumps(metadata or {})
    )
    db.add(doc)
    db.flush()

    # 2. Chunk text and create EvidenceChunks
    chunk_data = DocumentParserService.chunk_text(raw_text, chunk_size=800, overlap=120)
    evidence_chunks = []
    for cd in chunk_data:
        chunk = EvidenceChunk(
            document_id=doc.id,
            chunk_index=cd["chunk_index"],
            text_content=cd["text_content"],
            start_offset=cd["start_offset"],
            end_offset=cd["end_offset"],
            page_or_section=cd["page_or_section"]
        )
        db.add(chunk)
        evidence_chunks.append(chunk)
    db.flush()

    # 3. AI Extraction of Claims, Gaps, Dependencies
    knowledge = await AIProviderService.extract_knowledge(raw_text, title)

    # 4. Deterministic Grounding Guard Verification
    for item in knowledge.get("claims", []):
        statement = item.get("statement", "")
        # Run grounding guard against actual evidence chunks
        guard_res = DeterministicGroundingGuard.verify_claim(statement, evidence_chunks)

        claim = Claim(
            project_id=project_id,
            document_id=doc.id,
            title=item.get("title", "Extracted Claim"),
            statement=statement,
            category=item.get("category", "architecture"),
            confidence_score=item.get("confidence_score", 0.9),
            grounding_score=guard_res.grounding_score,
            grounding_status="grounded" if guard_res.is_grounded else "unverified",
            status="extracted"
        )
        db.add(claim)
        db.flush()

        # Create link to evidence chunk if grounded
        if guard_res.is_grounded and guard_res.matched_evidence_id:
            link = ClaimEvidenceLink(
                claim_id=claim.id,
                evidence_id=guard_res.matched_evidence_id,
                overlap_ratio=guard_res.grounding_score,
                match_method=guard_res.match_method,
                snippet=guard_res.snippet
            )
            db.add(link)

    # 5. Save Knowledge Gaps
    for gap_item in knowledge.get("gaps", []):
        gap = KnowledgeGap(
            project_id=project_id,
            title=gap_item.get("title", "Knowledge Gap"),
            description=gap_item.get("description", ""),
            severity=gap_item.get("severity", "medium"),
            category=gap_item.get("category", "architecture"),
            status="open",
            suggested_question=gap_item.get("suggested_question", "")
        )
        db.add(gap)

    # 6. Save Dependencies
    for dep_item in knowledge.get("dependencies", []):
        dep = Dependency(
            project_id=project_id,
            source_entity=dep_item.get("source_entity", ""),
            target_entity=dep_item.get("target_entity", ""),
            dependency_type=dep_item.get("dependency_type", "service"),
            criticality=dep_item.get("criticality", "high"),
            description=dep_item.get("description", "")
        )
        db.add(dep)

    # 7. Audit log & recalculate radar
    audit = AuditLog(
        organization_id=user.organization_id,
        user_id=user.id,
        user_email=user.email,
        action="DOCUMENT_INGESTED",
        resource_type="document",
        resource_id=str(doc.id),
        details_json=json.dumps({"title": doc.title, "source_type": source_type, "chunks": len(evidence_chunks)})
    )
    db.add(audit)
    db.commit()

    # Scan for contradictions & update risk
    KnowledgeLossRadarService.detect_contradictions(db, project_id)
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        KnowledgeLossRadarService.calculate_project_risk(db, project)

    db.refresh(doc)
    return doc

@router.get("", response_model=List[DocumentOut])
def list_documents(project_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    docs = db.query(Document).filter(Document.project_id == project_id).all()
    return docs

@router.post("/upload", response_model=DocumentOut)
async def upload_document(
    project_id: int = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    filename = file.filename or "uploaded_file"
    file_bytes = await file.read()

    if filename.lower().endswith(".pdf"):
        raw_text, _ = DocumentParserService.parse_pdf(file_bytes)
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF document.")
    else:
        # Markdown, TXT, source files
        raw_text = file_bytes.decode("utf-8", errors="replace")

    doc = await _process_ingested_content(
        db=db,
        project_id=project_id,
        user=current_user,
        title=filename,
        source_type="upload",
        source_url="",
        raw_text=raw_text,
        metadata={"filename": filename, "file_size": len(file_bytes)}
    )
    return doc

@router.post("/github", response_model=DocumentOut)
async def ingest_github_repo(
    data: GitHubIngestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(
        Project.id == data.project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    try:
        title, raw_text, meta = await DocumentParserService.fetch_github_repo(
            repo_url=data.repo_url,
            token=data.access_token,
            branch=data.branch or "main"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"GitHub Ingestion error: {str(e)}")

    doc = await _process_ingested_content(
        db=db,
        project_id=data.project_id,
        user=current_user,
        title=title,
        source_type="github",
        source_url=data.repo_url,
        raw_text=raw_text,
        metadata=meta
    )
    return doc

@router.post("/clip", response_model=DocumentOut)
async def ingest_web_clip(
    project_id: int = Form(...),
    title: str = Form(...),
    url: str = Form(...),
    content: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Endpoint consumed by the Chrome Knowledge Capture Extension.
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    doc = await _process_ingested_content(
        db=db,
        project_id=project_id,
        user=current_user,
        title=f"Web: {title[:80]}",
        source_type="chrome_extension",
        source_url=url,
        raw_text=content,
        metadata={"url": url, "captured_title": title}
    )
    return doc
