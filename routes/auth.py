"""
Authentication Routes for RAG Server
Handles user registration, login, password reset, and verification
"""
from fastapi import APIRouter, HTTPException, Depends

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import db
from models import (
    EnhancedRegisterRequest,
    EnhancedLoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerificationRequest
)
from services.auth_service import generate_jwt_token, get_current_user
from services.sms_service import SMSService
from services.email_service import EmailService

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Initialize services
sms_service = SMSService()
email_service = EmailService()


@router.post("/send-verification")
async def send_verification_code(request: VerificationRequest):
    """Send phone or email verification code"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    phone = request.phone
    email = request.email
    action = request.action

    if not phone and not email:
        raise HTTPException(status_code=400, detail="Phone or email is required")

    # Validate action
    valid_actions = ["register", "reset_password", "login"]
    if action not in valid_actions:
        raise HTTPException(status_code=400, detail=f"Invalid action. Must be one of: {valid_actions}")

    try:
        if phone:
            # Normalize phone number
            phone = phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
            if not phone.startswith("+"):
                if phone.startswith("0"):
                    phone = "+216" + phone[1:]  # Tunisia country code
                else:
                    phone = "+" + phone

            if action == "register":
                existing_user = db.find_user_by_phone(phone)
                if existing_user:
                    raise HTTPException(status_code=400, detail="Phone number already registered")
            elif action == "reset_password":
                user = db.find_user_by_phone(phone)
                if not user:
                    raise HTTPException(status_code=404, detail="Phone number not found")

            verification_code = db.store_verification_code(
                phone=phone,
                action=action,
                user_data=request.user_data
            )

            sms_sent = sms_service.send_verification_code(phone, verification_code, action)

            if sms_sent:
                return {"message": "Verification code sent", "phone": phone, "expires_in": 600}
            else:
                raise HTTPException(status_code=500, detail="Failed to send verification code")

        elif email:
            if action == "register":
                existing_user = db.find_user_by_email(email)
                if existing_user:
                    raise HTTPException(status_code=400, detail="Email already registered")
            elif action == "reset_password":
                user = db.find_user_by_email(email)
                if not user:
                    raise HTTPException(status_code=404, detail="Email not found")

            verification_code = db.store_email_verification_code(
                email=email,
                action=action
            )

            email_sent = email_service.send_verification_email(email, verification_code, action)

            if email_sent:
                return {"message": "Verification code sent", "email": email, "expires_in": 600}
            else:
                raise HTTPException(status_code=500, detail="Failed to send verification code")

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Verification error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/register")
async def register(request: EnhancedRegisterRequest):
    """Register new user with phone verification"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        if request.phone and request.verification_code:
            verification_result = db.verify_phone_code(
                phone=request.phone,
                code=request.verification_code,
                action="register"
            )
            if not verification_result:
                raise HTTPException(status_code=400, detail="Invalid or expired verification code")

        user_id = db.create_user(
            email=request.email,
            password=request.password,
            phone=request.phone,
            full_name=request.full_name,
            phone_verified=bool(request.phone and request.verification_code)
        )

        if not user_id:
            raise HTTPException(status_code=400, detail="Email or phone already exists")

        return {"message": "User created", "user_id": user_id, "email": request.email}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Registration error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/login")
async def login(request: EnhancedLoginRequest):
    """Login with email or phone"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        login_method = "email" if request.email else "phone"
        identifier = request.email or request.phone

        user = db.authenticate_user(identifier, request.password, login_method)

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = generate_jwt_token(user)
        return {
            "token": token,
            "user_id": user["user_id"],
            "email": user["email"],
            "phone": user.get("phone"),
            "role": user["role"],
            "full_name": user["full_name"]
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {e}")
        raise HTTPException(status_code=500, detail="Authentication service error")


@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Initiate password reset process with phone or email"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    method = request.method
    identifier = request.identifier

    if not identifier:
        raise HTTPException(status_code=400, detail=f"{method.title()} is required")

    try:
        # Find user by phone or email
        if method == "phone":
            user = db.find_user_by_phone(identifier)
        elif method == "email":
            user = db.find_user_by_email(identifier)
        else:
            raise HTTPException(status_code=400, detail="Method must be 'phone' or 'email'")

        if not user:
            # Don't reveal if account exists for security
            return {"message": f"If the account exists, you will receive a reset code via {method}"}

        # Generate verification code
        if method == "phone":
            verification_code = db.store_verification_code(
                phone=identifier,
                action="reset_password"
            )

            # Send SMS
            sms_sent = sms_service.send_verification_code(identifier, verification_code, "reset_password")

            if not sms_sent:
                raise HTTPException(status_code=500, detail="Failed to send reset code")

        elif method == "email":
            verification_code = db.store_email_verification_code(
                email=identifier,
                action="reset_password"
            )

            # Send email
            email_sent = email_service.send_verification_email(identifier, verification_code, "reset_password")

            if not email_sent:
                raise HTTPException(status_code=500, detail="Failed to send reset email")

        return {"message": f"Reset code sent successfully via {method}"}

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Password reset error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    """Reset password with verification code from phone or email"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    phone = request.phone
    email = request.email
    verification_code = request.verification_code
    new_password = request.new_password

    if not verification_code or not new_password:
        raise HTTPException(status_code=400, detail="Verification code and new password are required")

    if not (phone or email):
        raise HTTPException(status_code=400, detail="Either phone or email is required")

    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    try:
        # Verify code based on method used
        if phone:
            verification_result = db.verify_phone_code(phone, verification_code, "reset_password")
            user = db.find_user_by_phone(phone) if verification_result else None
        else:  # email
            verification_result = db.verify_email_code(email, verification_code, "reset_password")
            user = db.find_user_by_email(email) if verification_result else None

        if not verification_result:
            raise HTTPException(status_code=400, detail="Invalid or expired verification code")

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update password
        success = db.update_user_password(user["user_id"], new_password)

        if success:
            return {"message": "Password updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update password")

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Password reset error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info from token"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    user = db.get_user_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user
