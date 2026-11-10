from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# ----------------- Auth & User Schemas -----------------
class UserRegister(BaseModel):
    org_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    role: Optional[str] = "owner"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class UserOut(BaseModel):
    id: int
    organization_id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class OrganizationOut(BaseModel):
    id: int
    name: str
    slug: str
    plan: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Project Schemas -----------------
class ProjectCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: Optional[str] = ""
    lead_name: Optional[str] = ""
    lead_email: Optional[str] = ""

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    lead_name: Optional[str] = None
    lead_email: Optional[str] = None

class ProjectOut(BaseModel):
    id: int
    organization_id: int
    name: str
    description: str
    lead_name: str
    lead_email: str
    status: str
    bus_factor_risk: float
    created_at: datetime
    document_count: Optional[int] = 0
    claim_count: Optional[int] = 0
    gap_count: Optional[int] = 0

    class Config:
        from_attributes = True

# ----------------- Document Schemas -----------------
class DocumentCreate(BaseModel):
    project_id: int
    title: str
    source_type: str = "manual" # upload, github, chrome_extension, manual
    source_url: Optional[str] = ""
    raw_content: str
    metadata_json: Optional[str] = "{}"

class GitHubIngestRequest(BaseModel):
    project_id: int
    repo_url: str
    access_token: Optional[str] = None
    branch: Optional[str] = "main"

class DocumentOut(BaseModel):
    id: int
    project_id: int
    title: str
    source_type: str
    source_url: str
    char_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class EvidenceChunkOut(BaseModel):
    id: int
    document_id: int
    chunk_index: int
    text_content: str
    start_offset: int
    end_offset: int
    page_or_section: str

    class Config:
        from_attributes = True

# ----------------- Claim Schemas -----------------
class ClaimEvidenceLinkOut(BaseModel):
    id: int
    evidence_id: int
    overlap_ratio: float
    match_method: str
    snippet: str
    document_title: Optional[str] = ""

    class Config:
        from_attributes = True

class ClaimOut(BaseModel):
    id: int
    project_id: int
    document_id: Optional[int] = None
    title: str
    statement: str
    category: str
    confidence_score: float
    grounding_score: float
    grounding_status: str
    status: str
    reviewer_notes: Optional[str] = ""
    created_at: datetime
    evidence_links: List[ClaimEvidenceLinkOut] = []

    class Config:
        from_attributes = True

class ClaimReviewRequest(BaseModel):
    decision: str = Field(..., pattern="^(approved|rejected|disputed)$")
    feedback: Optional[str] = ""

class ClaimGroundingVerifyOut(BaseModel):
    claim_id: int
    grounding_score: float
    grounding_status: str
    matched_evidences: List[Dict[str, Any]]

# ----------------- Knowledge Gap Schemas -----------------
class GapCreate(BaseModel):
    project_id: int
    title: str
    description: str
    severity: str = "medium"
    category: str = "architecture"
    suggested_question: Optional[str] = ""

class GapOut(BaseModel):
    id: int
    project_id: int
    title: str
    description: str
    severity: str
    category: str
    status: str
    suggested_question: str
    resolved_notes: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Contradiction & Dependency -----------------
class ContradictionOut(BaseModel):
    id: int
    project_id: int
    claim_a_id: int
    claim_b_id: int
    claim_a_statement: Optional[str] = ""
    claim_b_statement: Optional[str] = ""
    conflict_summary: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class DependencyCreate(BaseModel):
    project_id: int
    source_entity: str
    target_entity: str
    dependency_type: str = "service"
    criticality: str = "high"
    description: Optional[str] = ""

class DependencyOut(BaseModel):
    id: int
    project_id: int
    source_entity: str
    target_entity: str
    dependency_type: str
    criticality: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- Exit Interview Schemas -----------------
class InterviewCreate(BaseModel):
    project_id: int
    departing_user_name: str
    departing_user_email: EmailStr
    role_title: str

class InterviewAnswerSubmit(BaseModel):
    response_id: int
    answer_text: str

class InterviewResponseOut(BaseModel):
    id: int
    interview_id: int
    gap_id: Optional[int] = None
    prompt_question: str
    category: str
    answer_text: str
    is_critical: bool

    class Config:
        from_attributes = True

class InterviewOut(BaseModel):
    id: int
    project_id: int
    departing_user_name: str
    departing_user_email: str
    role_title: str
    status: str
    completion_percentage: float
    created_at: datetime
    questions_count: Optional[int] = 0

    class Config:
        from_attributes = True

class InterviewDetailOut(InterviewOut):
    responses: List[InterviewResponseOut] = []

# ----------------- Handover Schemas -----------------
class HandoverGenerateRequest(BaseModel):
    project_id: int
    title: str
    custom_directives: Optional[str] = ""

class HandoverOut(BaseModel):
    id: int
    project_id: int
    title: str
    executive_summary: str
    architecture_overview: str
    key_decisions: str
    unfinished_work: str
    pitfalls_and_risks: str
    operational_runbook: str
    verified_claims_count: int
    readiness_score: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- QR Knowledge Bridge Schemas -----------------
class QRBridgeMintRequest(BaseModel):
    handover_id: int
    ttl_hours: Optional[int] = 72
    passphrase: Optional[str] = None
    max_uses: Optional[int] = 10

class QRBridgeOut(BaseModel):
    id: int
    handover_id: int
    signed_token: str
    qr_data_url: str # Base64 encoded PNG for display
    has_passphrase: bool
    max_uses: int
    current_uses: int
    is_revoked: bool
    expires_at: datetime
    created_at: datetime

class QRRedeemRequest(BaseModel):
    token: str
    passphrase: Optional[str] = None

class QRRevokeRequest(BaseModel):
    qr_bridge_id: int
    reason: str

class QRRedeemResponse(BaseModel):
    success: bool
    handover: HandoverOut
    project_name: str
    verified_claims: List[ClaimOut]
    dependencies: List[DependencyOut]
    remaining_uses: int

# ----------------- Radar & Analytics Schemas -----------------
class RiskFactor(BaseModel):
    category: str
    score: float # 0 to 100
    risk_level: str # Low, Medium, High, Critical
    explanation: str

class LossRadarOverview(BaseModel):
    overall_readiness_score: float # 0 to 100
    overall_risk_score: float # 0 to 100
    bus_factor_alert_count: int
    unresolved_gaps_count: int
    unverified_claims_count: int
    active_handovers_count: int
    risk_breakdown: List[RiskFactor]
    project_risk_matrix: List[Dict[str, Any]]

# ----------------- Audit Schemas -----------------
class AuditLogOut(BaseModel):
    id: int
    user_email: str
    action: str
    resource_type: str
    resource_id: str
    details_json: str
    created_at: datetime

    class Config:
        from_attributes = True
