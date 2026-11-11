import json
from datetime import datetime, timezone, timedelta
from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash, sign_qr_token
import app.models as models

def run_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_org = db.query(models.Organization).filter(models.Organization.slug == "baton-enterprise").first()
        if existing_org:
            db.delete(existing_org)
            db.commit()

        org = models.Organization(
            name="BATON Enterprise Labs",
            slug="baton-enterprise",
            plan="enterprise",
            settings_json=json.dumps({"compliance_tier": "SOC2_TYPE_II", "auto_grounding_guard": True})
        )
        db.add(org)
        db.commit()
        db.refresh(org)

        default_pwd_hash = get_password_hash("password123")
        users = [
            models.User(
                organization_id=org.id,
                email="architect@baton-continuity.io",
                hashed_password=default_pwd_hash,
                full_name="Rohit Dhangar (Chief Continuity Architect)",
                role="admin",
                is_active=True
            ),
            models.User(
                organization_id=org.id,
                email="reviewer@baton-continuity.io",
                hashed_password=default_pwd_hash,
                full_name="Elena Rostova (Compliance Reviewer)",
                role="reviewer",
                is_active=True
            ),
            models.User(
                organization_id=org.id,
                email="successor@baton-continuity.io",
                hashed_password=default_pwd_hash,
                full_name="David Miller (Incoming Successor)",
                role="successor",
                is_active=True
            ),
            models.User(
                organization_id=org.id,
                email="departing@baton-continuity.io",
                hashed_password=default_pwd_hash,
                full_name="Alex Mercer (Departing Principal Lead)",
                role="member",
                is_active=True
            ),
            models.User(
                organization_id=org.id,
                email="sarah.chen@baton-continuity.io",
                hashed_password=default_pwd_hash,
                full_name="Sarah Chen (Identity Lead)",
                role="member",
                is_active=True
            ),
            models.User(
                organization_id=org.id,
                email="marcus.v@baton-continuity.io",
                hashed_password=default_pwd_hash,
                full_name="Marcus Vance (Infrastructure Architect)",
                role="member",
                is_active=True
            )
        ]
        db.add_all(users)
        db.commit()
        for u in users:
            db.refresh(u)

        admin_user, reviewer_user, successor_user, departing_user = users[0], users[1], users[2], users[3]

        projects = [
            models.Project(
                organization_id=org.id,
                name="Core Ledger & Payment Engine",
                description="High-throughput transactional payment processing engine, PCI-DSS tokenization, and Stripe fallback routing.",
                lead_name="Alex Mercer",
                lead_email="departing@baton-continuity.io",
                status="transitioning",
                bus_factor_risk=82.0
            ),
            models.Project(
                organization_id=org.id,
                name="Enterprise Identity & OAuth2 SSO",
                description="Centralized authentication authority, JWT rotation, session revocation, and multi-tenant IAM enforcement.",
                lead_name="Sarah Chen",
                lead_email="sarah.chen@baton-continuity.io",
                status="active",
                bus_factor_risk=35.0
            ),
            models.Project(
                organization_id=org.id,
                name="Kubernetes Infrastructure & Service Mesh",
                description="Cloud orchestrator manifests, Istio mTLS policies, ArgoCD GitOps pipelines, and multi-region disaster recovery.",
                lead_name="Marcus Vance",
                lead_email="marcus.v@baton-continuity.io",
                status="transitioning",
                bus_factor_risk=68.0
            )
        ]
        db.add_all(projects)
        db.commit()
        for p in projects:
            db.refresh(p)

        core_project = projects[0]

        raw_doc_1 = (
            "BATON PAYMENT GATEWAY ARCHITECTURE SPECIFICATION v3.2\n\n"
            "1. DATABASE TRANSACTION ISOLATION\n"
            "To prevent phantom account read race conditions, all ledger migrations require "
            "Serializable transaction isolation level before deploying schema v2.4+ tables.\n\n"
            "2. HIGH AVAILABILITY & CACHE SENTINEL\n"
            "Sentinel quorum is 3. If split brain partitions reduce available nodes below quorum, "
            "manual failover override CLI is necessary using sentinel failover command.\n\n"
            "3. TELEMETRY & OPEN-TELEMETRY COLLECTOR\n"
            "Remaining gRPC instrumentation in payment-gateway-service: telemetry migration sits at 65% "
            "with legacy statsd operational.\n\n"
            "4. REPLICATION REPLAY DELAY\n"
            "WAL replay lag can spike replica promotion times upwards of 240 seconds under continuous "
            "heavy write transactions."
        )
        raw_doc_2 = (
            "PCI-DSS COMPLIANCE & CREDENTIAL SECURITY RUNBOOK\n\n"
            "1. WEBHOOK SIGNING KEYS\n"
            "Webhooks secret rotation occurs quarterly using AWS Secrets Manager "
            "arn:aws:secretsmanager:us-east-1:prod/stripe-keys.\n\n"
            "2. MASTER ROOT KEYS\n"
            "Master encryption key rotation occurs via HSM ceremony requiring physical custody YubiKeys."
        )

        doc1 = models.Document(
            project_id=core_project.id,
            title="Payment Gateway Architecture & Failover Runbook.pdf",
            source_type="upload",
            source_url="/documents/payment-gateway-arch.pdf",
            file_path="uploads/payment-gateway-arch.pdf",
            raw_content=raw_doc_1,
            char_count=len(raw_doc_1)
        )
        doc2 = models.Document(
            project_id=core_project.id,
            title="PCI-DSS Data Protection & Encryption Keys Specification.md",
            source_type="github",
            source_url="https://github.com/enterprise/ledger/docs/pci.md",
            file_path="github/pci.md",
            raw_content=raw_doc_2,
            char_count=len(raw_doc_2)
        )
        db.add_all([doc1, doc2])
        db.commit()
        db.refresh(doc1)
        db.refresh(doc2)

        chunks = [
            models.EvidenceChunk(
                document_id=doc1.id,
                chunk_index=0,
                text_content="To prevent phantom account read race conditions, all ledger migrations require Serializable transaction isolation level before deploying schema v2.4+ tables.",
                start_offset=82,
                end_offset=242,
                page_or_section="Section 1"
            ),
            models.EvidenceChunk(
                document_id=doc1.id,
                chunk_index=1,
                text_content="Sentinel quorum is 3. If split brain partitions reduce available nodes below quorum, manual failover override CLI is necessary using sentinel failover command.",
                start_offset=285,
                end_offset=445,
                page_or_section="Section 2"
            ),
            models.EvidenceChunk(
                document_id=doc1.id,
                chunk_index=2,
                text_content="Remaining gRPC instrumentation in payment-gateway-service: telemetry migration sits at 65% with legacy statsd operational.",
                start_offset=490,
                end_offset=612,
                page_or_section="Section 3"
            ),
            models.EvidenceChunk(
                document_id=doc2.id,
                chunk_index=0,
                text_content="Webhooks secret rotation occurs quarterly using AWS Secrets Manager arn:aws:secretsmanager:us-east-1:prod/stripe-keys.",
                start_offset=75,
                end_offset=193,
                page_or_section="Section 1"
            )
        ]
        db.add_all(chunks)
        db.commit()
        for c in chunks:
            db.refresh(c)

        claims = [
            models.Claim(
                project_id=core_project.id,
                document_id=doc1.id,
                title="Database Serializable Isolation for Schema Migrations",
                statement="Database ledger schema migrations must execute within Serializable isolation before deploying v2.4+ tables to avoid phantom account balances.",
                category="architecture",
                confidence_score=0.98,
                grounding_score=0.96,
                grounding_status="grounded",
                status="approved",
                reviewer_notes="Approved by Elena Rostova after checking PostgreSQL ACID compliance documentation."
            ),
            models.Claim(
                project_id=core_project.id,
                document_id=doc2.id,
                title="Stripe Webhook HMAC Rotation Schedule",
                statement="Stripe webhook HMAC secret keys are rotated every 90 days via AWS Secrets Manager ARN arn:aws:secretsmanager:us-east-1:prod/stripe-keys.",
                category="credentials",
                confidence_score=0.95,
                grounding_score=0.92,
                grounding_status="grounded",
                status="approved",
                reviewer_notes="Verified against AWS IAM and Secrets Manager rotation policies."
            ),
            models.Claim(
                project_id=core_project.id,
                document_id=doc1.id,
                title="Redis Cluster Sentinel Quorum Threshold",
                statement="The Redis cluster Sentinel quorum requires manual intervention if more than 2 nodes drop during network partitions.",
                category="operational",
                confidence_score=0.89,
                grounding_score=0.87,
                grounding_status="grounded",
                status="extracted",
                reviewer_notes="Pending verification drill on staging environment."
            )
        ]
        db.add_all(claims)
        db.commit()
        for cl in claims:
            db.refresh(cl)

        evidence_links = [
            models.ClaimEvidenceLink(
                claim_id=claims[0].id,
                evidence_id=chunks[0].id,
                overlap_ratio=0.96,
                match_method="exact_offset",
                snippet=chunks[0].text_content
            ),
            models.ClaimEvidenceLink(
                claim_id=claims[1].id,
                evidence_id=chunks[3].id,
                overlap_ratio=0.92,
                match_method="exact_offset",
                snippet=chunks[3].text_content
            ),
            models.ClaimEvidenceLink(
                claim_id=claims[2].id,
                evidence_id=chunks[1].id,
                overlap_ratio=0.87,
                match_method="ngram_jaccard",
                snippet=chunks[1].text_content
            )
        ]
        db.add_all(evidence_links)

        gaps = [
            models.KnowledgeGap(
                project_id=core_project.id,
                title="Undocumented Kafka Consumer Offset Replay for Failed Webhooks",
                description="No formal SOP exists for reprocessing rejected webhook payloads when Dead Letter Queue Kafka partitions overflow.",
                severity="critical",
                category="disaster_recovery",
                status="open",
                suggested_question="How do we manually trigger offset replay for dead-lettered payment webhooks without re-executing credit card charges?"
            ),
            models.KnowledgeGap(
                project_id=core_project.id,
                title="Missing Emergency Passphrase for AWS KMS Master Key Custodian",
                description="The physical custodian recovery procedure for AWS KMS HSM backups is known solely to the departing lead architect.",
                severity="critical",
                category="credentials",
                status="open",
                suggested_question="Who possesses the second physical YubiKey required for multi-party KMS key derivation during cold recovery?"
            )
        ]
        db.add_all(gaps)

        dependencies = [
            models.Dependency(
                project_id=core_project.id,
                source_entity="Payment Core Engine",
                target_entity="PostgreSQL 16 Cluster",
                dependency_type="database",
                criticality="fatal",
                description="Primary transactional store for all ledger entries."
            ),
            models.Dependency(
                project_id=core_project.id,
                source_entity="Payment Core Engine",
                target_entity="Redis Sentinel Quorum",
                dependency_type="cache",
                criticality="high",
                description="In-memory idempotent request deduplication lock."
            )
        ]
        db.add_all(dependencies)

        interview = models.ExitInterview(
            project_id=core_project.id,
            departing_user_name="Alex Mercer",
            departing_user_email="departing@baton-continuity.io",
            role_title="Departing Principal Architect",
            status="in_progress",
            completion_percentage=85.0
        )
        db.add(interview)
        db.commit()
        db.refresh(interview)

        interview_responses = [
            models.InterviewResponse(
                interview_id=interview.id,
                gap_id=gaps[0].id,
                prompt_question="Which deployment or database migration step is currently undocumented in the official runbook?",
                category="architecture",
                answer_text="The step where you run pg_partman maintenance before running Alembic migration 2.4. If you skip this, new monthly partitioned tables fail to create.",
                is_critical=True
            ),
            models.InterviewResponse(
                interview_id=interview.id,
                gap_id=gaps[1].id,
                prompt_question="Which third-party vendor service has credentials known only to you?",
                category="credentials",
                answer_text="The Stripe Tier-2 Escalation Slack Webhook and our backup Datadog synthetic monitoring API token.",
                is_critical=True
            )
        ]
        db.add_all(interview_responses)

        handover = models.Handover(
            project_id=core_project.id,
            created_by_id=admin_user.id,
            title="Chief Architect Handover Pack - Payment Engine & Vault Continuity",
            executive_summary=(
                "Comprehensive operational handover pack encompassing payment routing algorithms, "
                "PCI vault encryption tokenization, pending gRPC deprecation, and Kafka consumer recovery runbooks."
            ),
            architecture_overview="Distributed event-driven transaction ledger featuring PostgreSQL 16 active-passive clustering with Redis Sentinel caching.",
            key_decisions="Adopted Serializable isolation level for accounting tables to eliminate balance discrepancies.",
            unfinished_work="OpenTelemetry collector instrumentation for legacy statsd exporter (65% complete).",
            pitfalls_and_risks="WAL archiving backlog can stall replica promotion under peak bursts.",
            operational_runbook="Follow doc/runbooks/failover.md with manual Sentinel CLI intervention if quorum drops.",
            verified_claims_count=26,
            readiness_score=94.0,
            status="ready"
        )
        db.add(handover)
        db.commit()
        db.refresh(handover)

        signed_token = sign_qr_token(
            handover_id=handover.id,
            organization_id=org.id,
            ttl_hours=72
        )

        qr_bridge = models.QRKnowledgeBridge(
            handover_id=handover.id,
            created_by_id=admin_user.id,
            signed_token=signed_token,
            passphrase_hash=None,
            max_uses=10,
            current_uses=2,
            is_revoked=False,
            revocation_reason="",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=72)
        )
        db.add(qr_bridge)
        db.commit()

        audit_log = models.AuditLog(
            organization_id=org.id,
            user_id=admin_user.id,
            user_email=admin_user.email,
            action="PROJECT_SEEDED",
            resource_type="system",
            resource_id="1",
            details_json=json.dumps({"seeded_by": "admin", "timestamp": datetime.now(timezone.utc).isoformat()})
        )
        db.add(audit_log)
        db.commit()

        return {
            "organization": org.name,
            "users_count": len(users),
            "projects_count": len(projects),
            "claims_count": len(claims),
            "handovers_count": 1,
            "qr_bridge_token": signed_token[:20] + "..."
        }
    finally:
        db.close()
