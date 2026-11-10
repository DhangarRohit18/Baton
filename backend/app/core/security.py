import time
import hmac
import hashlib
import json
import base64
import bcrypt
import jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from app.core.config import settings

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.PyJWTError:
        return None

def sign_qr_token(handover_id: int, organization_id: int, ttl_hours: int = 72, nonce: Optional[str] = None) -> str:
    """
    Creates a tamper-proof cryptographically signed token for the QR Knowledge Bridge.
    Format: base64(payload).hex_hmac
    """
    exp = int(time.time()) + (ttl_hours * 3600)
    payload_obj = {
        "hid": handover_id,
        "oid": organization_id,
        "exp": exp,
        "nonce": nonce or hashlib.sha256(f"{handover_id}-{time.time()}".encode()).hexdigest()[:12]
    }
    payload_str = json.dumps(payload_obj, separators=(',', ':'))
    b64_payload = base64.urlsafe_b64encode(payload_str.encode()).decode()
    
    key = (settings.SECRET_KEY + settings.QR_BRIDGE_SIGNING_SALT).encode()
    signature = hmac.new(key, b64_payload.encode(), hashlib.sha256).hexdigest()
    return f"BATON-{b64_payload}.{signature}"

def verify_qr_token(signed_token: str) -> Optional[Dict[str, Any]]:
    """
    Verifies that a QR Bridge token has not been tampered with and is not expired.
    """
    if not signed_token.startswith("BATON-"):
        return None
    raw_token = signed_token[6:]
    parts = raw_token.split(".")
    if len(parts) != 2:
        return None
    b64_payload, signature = parts
    
    key = (settings.SECRET_KEY + settings.QR_BRIDGE_SIGNING_SALT).encode()
    expected_sig = hmac.new(key, b64_payload.encode(), hashlib.sha256).hexdigest()
    
    if not hmac.compare_digest(expected_sig, signature):
        return None # Signature mismatch / forged token
        
    try:
        payload_bytes = base64.urlsafe_b64decode(b64_payload.encode())
        payload = json.loads(payload_bytes.decode())
        
        # Check expiration
        if payload.get("exp", 0) < int(time.time()):
            return None # Expired
            
        return payload
    except Exception:
        return None
