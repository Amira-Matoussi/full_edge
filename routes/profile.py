"""
Profile Routes for RAG Server
Handles user profile management endpoints
"""
from fastapi import APIRouter, HTTPException, Depends

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import db
from models import ProfileUpdateRequest, AvatarUpdateRequest
from services.auth_service import get_current_user

router = APIRouter(prefix="/api/profile", tags=["Profile"])


@router.get("")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        user_profile = db.get_user_by_id(current_user["user_id"])
        if not user_profile:
            raise HTTPException(status_code=404, detail="User profile not found")

        return user_profile
    except Exception as e:
        print(f"❌ Error fetching user profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.put("/update")
async def update_user_profile(
    request: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        # Validate phone format if provided
        phone = request.phone
        if phone:
            phone = phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
            if not phone.startswith("+"):
                if phone.startswith("0"):
                    phone = "+216" + phone[1:]  # Tunisia country code
                else:
                    phone = "+" + phone

        # Update user profile in database
        success = db.update_user_profile(
            user_id=current_user["user_id"],
            full_name=request.full_name,
            phone=phone
        )

        if success:
            # Get updated profile
            updated_profile = db.get_user_by_id(current_user["user_id"])
            return updated_profile
        else:
            raise HTTPException(status_code=400, detail="Failed to update profile")

    except Exception as e:
        print(f"❌ Error updating user profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/avatar")
async def update_user_avatar(
    request: AvatarUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update user avatar URL"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        success = db.update_user_avatar(current_user["user_id"], request.avatar_url)

        if success:
            return {
                "message": "Avatar updated successfully",
                "avatar_url": request.avatar_url
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to update avatar")

    except Exception as e:
        print(f"❌ Error updating user avatar: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.delete("/avatar")
async def remove_user_avatar(current_user: dict = Depends(get_current_user)):
    """Remove user avatar"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        success = db.update_user_avatar(current_user["user_id"], None)

        if success:
            return {"message": "Avatar removed successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to remove avatar")

    except Exception as e:
        print(f"❌ Error removing user avatar: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/stats")
async def get_user_profile_stats(current_user: dict = Depends(get_current_user)):
    """Get user profile statistics"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        stats = db.get_user_statistics(current_user["user_id"])
        return stats
    except Exception as e:
        print(f"❌ Error fetching user stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
