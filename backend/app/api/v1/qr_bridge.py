import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import QRKnowledgeBridge, Handover, Project, User, AuditLog
from app.schemas import QRBridgeMintRequest, QRBridgeOut, QRRedeemRequest, QRRevokeRequest, QRRedeemResponse
from app.api.v1.deps import get_current_user
from app.services.qr.bridge_service import QRBridgeService
from app.core.security import verify_qr_token

router = APIRouter(prefix="/qr-bridge", tags=["Secure QR Knowledge Bridge"])

@router.post("/mint", response_model=QRBridgeOut)
def mint_qr_bridge(
    data: QRBridgeMintRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    handover = db.query(Handover).join(Project).filter(
        Handover.id == data.handover_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not handover:
        raise HTTPException(status_code=404, detail="Handover record not found")

    bridge, qr_data_url = QRBridgeService.mint_bridge(
        db=db,
        handover_id=handover.id,
        organization_id=current_user.organization_id,
        created_by_id=current_user.id,
        ttl_hours=data.ttl_hours or 72,
        passphrase=data.passphrase,
        max_uses=data.max_uses or 5
    )

    audit = AuditLog(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        user_email=current_user.email,
        action="QR_BRIDGE_MINTED",
        resource_type="qr_bridge",
        resource_id=str(bridge.id),
        details_json=json.dumps({"handover_id": handover.id, "ttl_hours": data.ttl_hours, "max_uses": data.max_uses})
    )
    db.add(audit)
    db.commit()

    return {
        "id": bridge.id,
        "handover_id": bridge.handover_id,
        "signed_token": bridge.signed_token,
        "qr_data_url": qr_data_url,
        "has_passphrase": bool(bridge.passphrase_hash),
        "max_uses": bridge.max_uses,
        "current_uses": bridge.current_uses,
        "is_revoked": bridge.is_revoked,
        "expires_at": bridge.expires_at,
        "created_at": bridge.created_at
    }

@router.get("/verify/{token}")
def public_verify_qr_bridge(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Public cryptographic integrity verification endpoint.
    Distinguishes integrity verification from revealing confidential document data.
    """
    payload = verify_qr_token(token)
    if not payload:
        return {
            "valid": False,
            "verification_status": "INVALID_OR_FORGED_SIGNATURE",
            "message": "Token signature mismatch or expired cryptographic proof."
        }

    bridge = db.query(QRKnowledgeBridge).filter(QRKnowledgeBridge.signed_token == token).first()
    if not bridge:
        return {
            "valid": False,
            "verification_status": "TOKEN_NOT_REGISTERED",
            "message": "No active knowledge bridge registered for this token."
        }

    handover = db.query(Handover).filter(Handover.id == bridge.handover_id).first()
    return {
        "valid": not bridge.is_revoked,
        "verification_id": f"BATON-VERIFY-{bridge.id:06d}",
        "integrity_status": "REVOKED" if bridge.is_revoked else "VERIFIED_AUTHENTIC",
        "document_type": "Knowledge Continuity Handover Pack",
        "published_at": bridge.created_at.isoformat(),
        "expires_at": bridge.expires_at.isoformat(),
        "claims_count_verified": handover.verified_claims_count if handover else 0,
        "note": "Cryptographic proof confirms this artifact was officially compiled and signed by the institutional steward."
    }

@router.post("/redeem", response_model=QRRedeemResponse)
def redeem_qr_bridge(
    data: QRRedeemRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Public or successor endpoint to scan/redeem a Secure QR Knowledge Bridge.
    Validates HMAC signature, expiration, usage limits, and optional passphrase.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    ua = request.headers.get("user-agent", "Unknown")

    try:
        result = QRBridgeService.redeem_bridge(
            db=db,
            signed_token=data.token,
            passphrase=data.passphrase,
            client_ip=client_ip,
            user_agent=ua
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/revoke", response_model=QRBridgeOut)
def revoke_qr_bridge(
    data: QRRevokeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bridge = db.query(QRKnowledgeBridge).join(Handover).join(Project).filter(
        QRKnowledgeBridge.id == data.qr_bridge_id,
        Project.organization_id == current_user.organization_id
    ).first()
    if not bridge:
        raise HTTPException(status_code=404, detail="QR Bridge not found")

    revoked = QRBridgeService.revoke_bridge(
        db=db,
        bridge_id=bridge.id,
        reason=data.reason,
        user_id=current_user.id
    )

    audit = AuditLog(
        organization_id=current_user.organization_id,
        user_id=current_user.id,
        user_email=current_user.email,
        action="QR_BRIDGE_REVOKED",
        resource_type="qr_bridge",
        resource_id=str(bridge.id),
        details_json=json.dumps({"reason": data.reason})
    )
    db.add(audit)
    db.commit()

    qr_data_url = QRBridgeService.generate_qr_data_url(revoked.signed_token)

    return {
        "id": revoked.id,
        "handover_id": revoked.handover_id,
        "signed_token": revoked.signed_token,
        "qr_data_url": qr_data_url,
        "has_passphrase": bool(revoked.passphrase_hash),
        "max_uses": revoked.max_uses,
        "current_uses": revoked.current_uses,
        "is_revoked": revoked.is_revoked,
        "expires_at": revoked.expires_at,
        "created_at": revoked.created_at
    }

@router.get("/list/{handover_id}", response_model=List[QRBridgeOut])
def list_bridges_for_handover(
    handover_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bridges = db.query(QRKnowledgeBridge).join(Handover).join(Project).filter(
        QRKnowledgeBridge.handover_id == handover_id,
        Project.organization_id == current_user.organization_id
    ).all()

    out = []
    for b in bridges:
        qr_url = QRBridgeService.generate_qr_data_url(b.signed_token)
        out.append({
            "id": b.id,
            "handover_id": b.handover_id,
            "signed_token": b.signed_token,
            "qr_data_url": qr_url,
            "has_passphrase": bool(b.passphrase_hash),
            "max_uses": b.max_uses,
            "current_uses": b.current_uses,
            "is_revoked": b.is_revoked,
            "expires_at": b.expires_at,
            "created_at": b.created_at
        })
    return out
