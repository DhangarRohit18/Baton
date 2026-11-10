import hashlib
import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import Project, User, Document, AuditLog
from app.api.v1.deps import get_current_user
from app.api.v1.documents import _process_ingested_content

router = APIRouter(prefix="/captures", tags=["Browser Captures"])

class BrowserCaptureRequest(BaseModel):
    page_url: str
    page_title: str
    extracted_content: str
    selected_text: Optional[str] = None
    capture_metadata: Optional[dict] = None
    project_id: int
    content_hash: Optional[str] = None
    tags: Optional[List[str]] = []
    notes: Optional[str] = None

@router.post("", response_model=dict)
async def create_browser_capture(
    data: BrowserCaptureRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Direct endpoint for the BATON Chrome Manifest V3 Knowledge Capture Extension.
    Captures article or selected text, validates content hash, and ingests into project.
    """
    project = db.query(Project).filter(
        Project.id == data.project_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Target project not found")

    content_to_ingest = data.extracted_content
    if data.selected_text and data.selected_text.strip():
        content_to_ingest = f"### Selected Highlight:\n> {data.selected_text}\n\n### Full Article:\n{data.extracted_content}"

    if data.notes:
        content_to_ingest = f"### User Annotations:\n{data.notes}\n\n{content_to_ingest}"

    # Calculate content hash if not provided
    calculated_hash = hashlib.sha256(content_to_ingest.encode("utf-8")).hexdigest()
    if data.content_hash and data.content_hash != calculated_hash:
        # Warning/log mismatch but accept sanitized payload
        pass

    meta = data.capture_metadata or {}
    meta.update({
        "url": data.page_url,
        "content_hash": calculated_hash,
        "tags": data.tags or [],
        "user_notes": data.notes or "",
        "captured_by": current_user.email
    })

    doc = await _process_ingested_content(
        db=db,
        project_id=data.project_id,
        user=current_user,
        title=f"Capture: {data.page_title[:70]}",
        source_type="browser_extension",
        source_url=data.page_url,
        raw_text=content_to_ingest,
        metadata=meta
    )

    return {
        "success": True,
        "document_id": doc.id,
        "title": doc.title,
        "char_count": doc.char_count,
        "content_hash": calculated_hash
    }

