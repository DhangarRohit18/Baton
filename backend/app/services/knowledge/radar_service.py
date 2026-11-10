import re
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Project, Claim, KnowledgeGap, Contradiction, Dependency, Handover

class KnowledgeLossRadarService:
    """
    Computes organizational knowledge continuity metrics, bus factor vulnerability,
    and institutional memory risk scores.
    """

    @classmethod
    def calculate_project_risk(cls, db: Session, project: Project) -> Dict[str, Any]:
        claims = db.query(Claim).filter(Claim.project_id == project.id).all()
        gaps = db.query(KnowledgeGap).filter(KnowledgeGap.project_id == project.id).all()
        contradictions = db.query(Contradiction).filter(Contradiction.project_id == project.id).all()
        dependencies = db.query(Dependency).filter(Dependency.project_id == project.id).all()

        total_claims = len(claims)
        unverified_claims = [c for c in claims if c.grounding_status != "grounded" or c.status == "disputed"]
        open_gaps = [g for g in gaps if g.status != "resolved"]
        critical_gaps = [g for g in open_gaps if g.severity in ("critical", "high")]
        open_contradictions = [c for c in contradictions if c.status == "flagged"]

        # Risk scoring algorithm (0 to 100, higher = more danger of knowledge loss)
        gap_penalty = min(len(critical_gaps) * 15 + len(open_gaps) * 5, 45)
        unverified_penalty = 0
        if total_claims > 0:
            unverified_penalty = (len(unverified_claims) / float(total_claims)) * 30
        else:
            unverified_penalty = 25 # No verified knowledge captured yet

        contradiction_penalty = min(len(open_contradictions) * 10, 20)
        
        # Bus factor penalty based on lead dependency
        bus_factor_penalty = 15 if project.lead_email else 5

        total_risk = min(100.0, round(gap_penalty + unverified_penalty + contradiction_penalty + bus_factor_penalty, 1))
        readiness_score = max(0.0, round(100.0 - total_risk, 1))

        # Update cached project risk
        project.bus_factor_risk = total_risk
        db.commit()

        return {
            "project_id": project.id,
            "project_name": project.name,
            "status": project.status,
            "risk_score": total_risk,
            "readiness_score": readiness_score,
            "total_claims": total_claims,
            "unverified_claims_count": len(unverified_claims),
            "open_gaps_count": len(open_gaps),
            "critical_gaps_count": len(critical_gaps),
            "open_contradictions_count": len(open_contradictions),
            "dependencies_count": len(dependencies)
        }

    @classmethod
    def get_organization_radar(cls, db: Session, organization_id: int) -> Dict[str, Any]:
        projects = db.query(Project).filter(Project.organization_id == organization_id).all()
        if not projects:
            return {
                "overall_readiness_score": 100.0,
                "overall_risk_score": 0.0,
                "bus_factor_alert_count": 0,
                "unresolved_gaps_count": 0,
                "unverified_claims_count": 0,
                "active_handovers_count": 0,
                "risk_breakdown": [],
                "project_risk_matrix": []
            }

        project_matrices = []
        total_risk_sum = 0.0
        total_unresolved_gaps = 0
        total_unverified_claims = 0
        total_bus_alerts = 0

        for p in projects:
            m = cls.calculate_project_risk(db, p)
            project_matrices.append(m)
            total_risk_sum += m["risk_score"]
            total_unresolved_gaps += m["open_gaps_count"]
            total_unverified_claims += m["unverified_claims_count"]
            if m["risk_score"] > 60:
                total_bus_alerts += 1

        avg_risk = round(total_risk_sum / len(projects), 1)
        avg_readiness = max(0.0, round(100.0 - avg_risk, 1))

        # Handover count
        active_handovers = db.query(Handover).join(Project).filter(Project.organization_id == organization_id).count()

        # Categorical risk breakdown
        risk_breakdown = [
            {
                "category": "Institutional Bus-Factor",
                "score": min(100.0, float(total_bus_alerts * 30 + 10)),
                "risk_level": "Critical" if total_bus_alerts > 0 else "Low",
                "explanation": f"{total_bus_alerts} project(s) operate with acute knowledge isolation centered on single departures."
            },
            {
                "category": "Operational Gaps & Blindspots",
                "score": min(100.0, float(total_unresolved_gaps * 12)),
                "risk_level": "High" if total_unresolved_gaps > 3 else "Medium" if total_unresolved_gaps > 0 else "Low",
                "explanation": f"{total_unresolved_gaps} unaddressed operational questions remain unanswered by offboarding personnel."
            },
            {
                "category": "Evidence Grounding Integrity",
                "score": min(100.0, float(total_unverified_claims * 8)),
                "risk_level": "Medium" if total_unverified_claims > 2 else "Low",
                "explanation": f"{total_unverified_claims} claims pending deterministic verification or human reviewer signoff."
            }
        ]

        return {
            "overall_readiness_score": avg_readiness,
            "overall_risk_score": avg_risk,
            "bus_factor_alert_count": total_bus_alerts,
            "unresolved_gaps_count": total_unresolved_gaps,
            "unverified_claims_count": total_unverified_claims,
            "active_handovers_count": active_handovers,
            "risk_breakdown": risk_breakdown,
            "project_risk_matrix": project_matrices
        }

    @classmethod
    def detect_contradictions(cls, db: Session, project_id: int):
        """
        Scans all claims in a project for conflicting assertions.
        E.g. Database engine discrepancy, conflicting auth policies, or opposite version numbers.
        """
        claims = db.query(Claim).filter(Claim.project_id == project_id).all()
        if len(claims) < 2:
            return

        for i in range(len(claims)):
            for j in range(i + 1, len(claims)):
                c1, c2 = claims[i], claims[j]
                
                # Check for direct conflicts in identical domain:
                # E.g. Claim 1 says PostgreSQL, Claim 2 says MySQL
                s1, s2 = c1.statement.lower(), c2.statement.lower()
                
                conflict = None
                if ("postgres" in s1 and "mysql" in s2) or ("mysql" in s1 and "postgres" in s2):
                    conflict = "Contradiction detected: conflicting database technologies cited (PostgreSQL vs MySQL)."
                elif ("rest api" in s1 and "graphql" in s2 and "primary api" in s1 and "primary api" in s2):
                    conflict = "Contradiction detected: conflicting primary API architecture specifications."
                elif ("port 8080" in s1 and "port 3000" in s2 and "listen" in s1 and "listen" in s2):
                    conflict = "Contradiction detected: conflicting operational listening port definitions."

                if conflict:
                    # Check if already recorded
                    exists = db.query(Contradiction).filter(
                        Contradiction.project_id == project_id,
                        Contradiction.claim_a_id == c1.id,
                        Contradiction.claim_b_id == c2.id
                    ).first()
                    if not exists:
                        contra = Contradiction(
                            project_id=project_id,
                            claim_a_id=c1.id,
                            claim_b_id=c2.id,
                            conflict_summary=conflict,
                            status="flagged"
                        )
                        db.add(contra)
        db.commit()
