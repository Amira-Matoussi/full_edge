"""
Authentication Service for RAG Server
Handles JWT token generation, verification, and user authentication
"""
import jwt
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, Depends, Header
from fastapi.security import HTTPAuthorizationCredentials

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_HOURS, security


def generate_jwt_token(user_data: dict) -> str:
    """Generate JWT token for authentication"""
    payload = {
        "user_id": user_data["user_id"],
        "email": user_data["email"],
        "role": user_data["role"],
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_jwt_token(token: str) -> dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency to get current user from JWT token"""
    token = credentials.credentials
    try:
        payload = verify_jwt_token(token)
        return payload
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


async def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Get user if token is provided, otherwise return None (for guest access)"""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            return verify_jwt_token(token)
        except:
            return None
    return None
