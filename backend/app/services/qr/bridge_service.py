import io
import base64
import qrcode
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models import QRKnowledgeBridge, QRAccessLog, Handover, Project, Claim, Dependency
from app.core.security import sign_qr_token, verify_qr_token, get_password_hash, verify_password

def utcnow():
    return datetime.utcnow()

def to_naive_utc(dt: datetime) -> datetime:
    if dt.tzinfo is not None:
        return dt.astimezone(timezone.utc).replace(tzinfo=None)
    return dt

class QRBridgeService:
    """
    Manages Secure QR Knowledge Bridge minting, cryptographically signed redemption,
    and instantaneous revocation.
    """

    @classmethod
    def generate_qr_data_url(cls, data_string: str) -> str:
        """
        Creates a high-contrast dark navy/teal branded QR code and converts to base64 Data URL.
        """
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H, # High error tolerance (30%)
            box_size=10,
            border=3,
        )
        qr.add_data(data_string)
        qr.make(fit=True)

        img = qr.make_image(fill_color="#0F172A", back_color="#F8FAFC")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        b64_png = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64_png}"

    @classmethod
    def mint_bridge(
        cls,
        db: Session,
        handover_id: int,
        organization_id: int,
        created_by_id: int,
        ttl_hours: int = 72,
        passphrase: Optional[str] = None,
        max_uses: int = 5
    ) -> Tuple[QRKnowledgeBridge, str]:
        handover = db.query(Handover).filter(Handover.id == handover_id).first()
        if not handover:
            raise ValueError("Handover record not found.")

        # Cryptographically signed HMAC-SHA256 token
        signed_token = sign_qr_token(handover_id=handover.id, organization_id=organization_id, ttl_hours=ttl_hours)
        
        passphrase_hash = None
        if passphrase and passphrase.strip():
            passphrase_hash = get_password_hash(passphrase.strip())

        expires_at = utcnow() + timedelta(hours=ttl_hours)

        bridge = QRKnowledgeBridge(
            handover_id=handover.id,
            created_by_id=created_by_id,
            signed_token=signed_token,
            passphrase_hash=passphrase_hash,
            max_uses=max_uses,
            current_uses=0,
            is_revoked=False,
            expires_at=expires_at
        )
        db.add(bridge)
        db.commit()
        db.refresh(bridge)

        # Generate QR code containing redemption payload
        qr_data_url = cls.generate_qr_data_url(signed_token)
        return bridge, qr_data_url

    @classmethod
    def redeem_bridge(
        cls,
        db: Session,
        signed_token: str,
        passphrase: Optional[str] = None,
        client_ip: str = "127.0.0.1",
        user_agent: str = "Web"
    ) -> Dict[str, Any]:
        """
        Validates token signature, checks expiration, verifies passphrase, checks usage limits,
        and returns the complete handover package for the successor.
        """
        # 1. Cryptographic Signature & Expiry Check
        payload = verify_qr_token(signed_token)
        if not payload:
            raise ValueError("Invalid or expired QR Knowledge Bridge cryptographic signature.")

        # 2. Database lookup
        bridge = db.query(QRKnowledgeBridge).filter(QRKnowledgeBridge.signed_token == signed_token).first()
        if not bridge:
            raise ValueError("QR Bridge record not found or revoked.")

        # 3. Revocation Check
        if bridge.is_revoked:
            cls._log_access(db, bridge.id, client_ip, user_agent, "revoked_block")
            raise ValueError(f"This QR Knowledge Bridge has been revoked: {bridge.revocation_reason}")

        # 4. Expiry Check against DB record
        if to_naive_utc(bridge.expires_at) < utcnow():
            cls._log_access(db, bridge.id, client_ip, user_agent, "expired_block")
            raise ValueError("This QR Knowledge Bridge token has expired.")

        # 5. Usage Limit Check
        if bridge.max_uses > 0 and bridge.current_uses >= bridge.max_uses:
            cls._log_access(db, bridge.id, client_ip, user_agent, "usage_limit_reached")
            raise ValueError("Maximum allowed redemptions for this QR Knowledge Bridge exceeded.")

        # 6. Passphrase Verification (if set)
        if bridge.passphrase_hash:
            if not passphrase or not verify_password(passphrase, bridge.passphrase_hash):
                cls._log_access(db, bridge.id, client_ip, user_agent, "invalid_passphrase")
                raise ValueError("Incorrect security passphrase for this Knowledge Bridge.")

        # Increment uses and log success
        bridge.current_uses += 1
        cls._log_access(db, bridge.id, client_ip, user_agent, "success")
        db.commit()

        # Load handover and associated verified context
        handover = db.query(Handover).filter(Handover.id == bridge.handover_id).first()
        project = db.query(Project).filter(Project.id == handover.project_id).first()
        claims = db.query(Claim).filter(Claim.project_id == project.id, Claim.status.in_(["approved", "verified"])).all()
        dependencies = db.query(Dependency).filter(Dependency.project_id == project.id).all()

        return {
            "success": True,
            "handover": handover,
            "project_name": project.name,
            "verified_claims": claims,
            "dependencies": dependencies,
            "remaining_uses": max(0, bridge.max_uses - bridge.current_uses)
        }

    @classmethod
    def revoke_bridge(cls, db: Session, bridge_id: int, reason: str, user_id: int) -> QRKnowledgeBridge:
        bridge = db.query(QRKnowledgeBridge).filter(QRKnowledgeBridge.id == bridge_id).first()
        if not bridge:
            raise ValueError("QR Bridge not found.")

        bridge.is_revoked = True
        bridge.revocation_reason = reason
        db.commit()
        db.refresh(bridge)
        return bridge

    @staticmethod
    def _log_access(db: Session, bridge_id: int, ip: str, ua: str, status: str):
        log = QRAccessLog(
            qr_bridge_id=bridge_id,
            redeemer_ip=ip,
            user_agent=ua[:250],
            status=status
        )
        db.add(log)
        db.commit()
