"""
Dashboard Routes for RAG Server
Handles dashboard statistics and admin endpoints
"""
from fastapi import APIRouter, HTTPException, Depends

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import db
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/statistics")
async def get_dashboard_statistics(current_user: dict = Depends(get_current_user)):
    """Get overall dashboard statistics (admin only)"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        stats = db.get_dashboard_statistics()
        return stats
    except Exception as e:
        print(f"❌ Error fetching dashboard stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/conversations")
async def get_conversations(
    current_user: dict = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0
):
    """Get recent conversations"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        # Admin sees all conversations, regular users see only their own
        if current_user.get("role") == "admin":
            conversations = db.get_all_conversations(limit=limit, offset=offset)
        else:
            conversations = db.get_user_conversations(
                user_id=current_user["user_id"],
                limit=limit,
                offset=offset
            )
        return {"conversations": conversations, "limit": limit, "offset": offset}
    except Exception as e:
        print(f"❌ Error fetching conversations: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/users")
async def get_users(
    current_user: dict = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0
):
    """Get list of users (admin only)"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        users = db.get_all_users(limit=limit, offset=offset)
        return {"users": users, "limit": limit, "offset": offset}
    except Exception as e:
        print(f"❌ Error fetching users: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/sessions")
async def get_sessions(
    current_user: dict = Depends(get_current_user),
    limit: int = 50,
    offset: int = 0
):
    """Get list of chat sessions"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        # Admin sees all sessions, regular users see only their own
        if current_user.get("role") == "admin":
            sessions = db.get_all_sessions(limit=limit, offset=offset)
        else:
            sessions = db.get_user_sessions(
                user_id=current_user["user_id"],
                limit=limit,
                offset=offset
            )
        return {"sessions": sessions, "limit": limit, "offset": offset}
    except Exception as e:
        print(f"❌ Error fetching sessions: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/session/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all messages for a specific session"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        # Verify access - admin can see all, users only their own
        session = db.get_session_by_id(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        if current_user.get("role") != "admin":
            if session.get("user_id") != current_user["user_id"]:
                raise HTTPException(status_code=403, detail="Access denied")

        messages = db.get_session_messages(session_id)
        return {
            "session_id": session_id,
            "session": session,
            "messages": messages
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error fetching session messages: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/analytics")
async def get_analytics(
    current_user: dict = Depends(get_current_user),
    period: str = "week"
):
    """Get analytics data (admin only)"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

    valid_periods = ["day", "week", "month", "year"]
    if period not in valid_periods:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid period. Must be one of: {valid_periods}"
        )

    try:
        analytics = db.get_analytics(period=period)
        return {"period": period, "analytics": analytics}
    except Exception as e:
        print(f"❌ Error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
