from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    plan = Column(String(50), default="enterprise")
    created_at = Column(DateTime, default=utcnow)
    settings_json = Column(Text, default="{}")

    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="organization", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="organization", cascade="all, delete-orphan")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="member") # owner, admin, auditor, member, successor
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    organization = relationship("Organization", back_populates="users")
    reviews = relationship("ClaimReview", back_populates="reviewer")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, default="")
    lead_name = Column(String(255), default="")
    lead_email = Column(String(255), default="")
    status = Column(String(50), default="active") # active, transitioning, handed_over, archived
    bus_factor_risk = Column(Float, default=0.0) # 0.0 to 100.0 risk score
    created_at = Column(DateTime, default=utcnow)

    organization = relationship("Organization", back_populates="projects")
    documents = relationship("Document", back_populates="project", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="project", cascade="all, delete-orphan")
    gaps = relationship("KnowledgeGap", back_populates="project", cascade="all, delete-orphan")
    handovers = relationship("Handover", back_populates="project", cascade="all, delete-orphan")
    dependencies = relationship("Dependency", back_populates="project", cascade="all, delete-orphan")
    contradictions = relationship("Contradiction", back_populates="project", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    source_type = Column(String(50), nullable=False) # upload, github, chrome_extension, manual
    source_url = Column(String(1024), default="")
    file_path = Column(String(1024), default="")
    raw_content = Column(Text, nullable=False)
    char_count = Column(Integer, default=0)
    metadata_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=utcnow)

    project = relationship("Project", back_populates="documents")
    evidence_chunks = relationship("EvidenceChunk", back_populates="document", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="document", cascade="all, delete-orphan")


class EvidenceChunk(Base):
    __tablename__ = "evidence_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    start_offset = Column(Integer, nullable=False)
    end_offset = Column(Integer, nullable=False)
    page_or_section = Column(String(255), default="")
    created_at = Column(DateTime, default=utcnow)

    document = relationship("Document", back_populates="evidence_chunks")
    claim_links = relationship("ClaimEvidenceLink", back_populates="evidence", cascade="all, delete-orphan")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    statement = Column(Text, nullable=False)
    category = Column(String(100), default="architecture") # architecture, operational, credentials, risk, business_logic, unfinished
    confidence_score = Column(Float, default=1.0) # 0.0 - 1.0
    grounding_score = Column(Float, default=1.0) # Exact verification score from Deterministic Grounding Guard
    grounding_status = Column(String(50), default="grounded") # grounded, unverified, contradicted, hallucination_detected
    status = Column(String(50), default="extracted") # extracted, verified, approved, disputed, rejected
    reviewer_notes = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)

    project = relationship("Project", back_populates="claims")
    document = relationship("Document", back_populates="claims")
    evidence_links = relationship("ClaimEvidenceLink", back_populates="claim", cascade="all, delete-orphan")
    reviews = relationship("ClaimReview", back_populates="claim", cascade="all, delete-orphan")


class ClaimEvidenceLink(Base):
    __tablename__ = "claim_evidence_links"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False, index=True)
    evidence_id = Column(Integer, ForeignKey("evidence_chunks.id", ondelete="CASCADE"), nullable=False, index=True)
    overlap_ratio = Column(Float, default=1.0)
    match_method = Column(String(50), default="lexical_exact") # lexical_exact, fuzzy_token, semantic
    snippet = Column(Text, default="")

    claim = relationship("Claim", back_populates="evidence_links")
    evidence = relationship("EvidenceChunk", back_populates="claim_links")


class ClaimReview(Base):
    __tablename__ = "claim_reviews"

    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(Integer, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    decision = Column(String(50), nullable=False) # approved, rejected, disputed
    feedback = Column(Text, default="")
    reviewed_at = Column(DateTime, default=utcnow)

    claim = relationship("Claim", back_populates="reviews")
    reviewer = relationship("User", back_populates="reviews")


class KnowledgeGap(Base):
    __tablename__ = "knowledge_gaps"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(50), default="medium") # low, medium, high, critical
    category = Column(String(100), default="architecture") # architecture, credentials, operations, deployment, dependencies
    status = Column(String(50), default="open") # open, interview_prompted, resolved
    suggested_question = Column(Text, default="")
    resolved_notes = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)

    project = relationship("Project", back_populates="gaps")


class Contradiction(Base):
    __tablename__ = "contradictions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    claim_a_id = Column(Integer, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    claim_b_id = Column(Integer, ForeignKey("claims.id", ondelete="CASCADE"), nullable=False)
    conflict_summary = Column(Text, nullable=False)
    status = Column(String(50), default="flagged") # flagged, resolved_a, resolved_b, reconciled
    created_at = Column(DateTime, default=utcnow)

    project = relationship("Project", back_populates="contradictions")


class Dependency(Base):
    __tablename__ = "dependencies"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    source_entity = Column(String(255), nullable=False) # Service A, Person X, Key Y
    target_entity = Column(String(255), nullable=False) # Database B, ThirdParty Z
    dependency_type = Column(String(100), default="service") # service, access_credential, human_domain, deployment
    criticality = Column(String(50), default="high") # low, medium, high, fatal
    description = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)

    project = relationship("Project", back_populates="dependencies")


class ExitInterview(Base):
    __tablename__ = "exit_interviews"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    departing_user_name = Column(String(255), nullable=False)
    departing_user_email = Column(String(255), nullable=False)
    role_title = Column(String(255), default="")
    status = Column(String(50), default="in_progress") # draft, in_progress, completed
    completion_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utcnow)

    responses = relationship("InterviewResponse", back_populates="interview", cascade="all, delete-orphan")


class InterviewResponse(Base):
    __tablename__ = "interview_responses"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("exit_interviews.id", ondelete="CASCADE"), nullable=False, index=True)
    gap_id = Column(Integer, ForeignKey("knowledge_gaps.id", ondelete="SET NULL"), nullable=True)
    prompt_question = Column(Text, nullable=False)
    category = Column(String(100), default="operations")
    answer_text = Column(Text, default="")
    is_critical = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    interview = relationship("ExitInterview", back_populates="responses")


class Handover(Base):
    __tablename__ = "handovers"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    executive_summary = Column(Text, nullable=False)
    architecture_overview = Column(Text, default="")
    key_decisions = Column(Text, default="")
    unfinished_work = Column(Text, default="")
    pitfalls_and_risks = Column(Text, default="")
    operational_runbook = Column(Text, default="")
    verified_claims_count = Column(Integer, default=0)
    readiness_score = Column(Float, default=100.0) # 0 to 100
    status = Column(String(50), default="ready") # draft, ready, transferred, archived
    created_at = Column(DateTime, default=utcnow)

    project = relationship("Project", back_populates="handovers")
    qr_bridges = relationship("QRKnowledgeBridge", back_populates="handover", cascade="all, delete-orphan")


class QRKnowledgeBridge(Base):
    __tablename__ = "qr_knowledge_bridges"

    id = Column(Integer, primary_key=True, index=True)
    handover_id = Column(Integer, ForeignKey("handovers.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    signed_token = Column(String(512), unique=True, index=True, nullable=False)
    passphrase_hash = Column(String(255), nullable=True) # Optional secondary password protection
    max_uses = Column(Integer, default=5) # 1 = single-use, >1 multi-use
    current_uses = Column(Integer, default=0)
    is_revoked = Column(Boolean, default=False)
    revocation_reason = Column(String(255), default="")
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=utcnow)

    handover = relationship("Handover", back_populates="qr_bridges")
    access_logs = relationship("QRAccessLog", back_populates="qr_bridge", cascade="all, delete-orphan")


class QRAccessLog(Base):
    __tablename__ = "qr_access_logs"

    id = Column(Integer, primary_key=True, index=True)
    qr_bridge_id = Column(Integer, ForeignKey("qr_knowledge_bridges.id", ondelete="CASCADE"), nullable=False, index=True)
    redeemer_ip = Column(String(100), default="")
    user_agent = Column(String(255), default="")
    status = Column(String(50), default="success") # success, revoked_block, expired_block, invalid_passphrase
    accessed_at = Column(DateTime, default=utcnow)

    qr_bridge = relationship("QRKnowledgeBridge", back_populates="access_logs")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    user_email = Column(String(255), default="")
    action = Column(String(100), nullable=False) # e.g. CLAIM_APPROVED, QR_BRIDGE_MINTED, QR_REVOKED
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), default="")
    details_json = Column(Text, default="{}")
    created_at = Column(DateTime, default=utcnow)

    organization = relationship("Organization", back_populates="audit_logs")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    recipient_email = Column(String(255), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info") # info, warning, alert, handover
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

