"""
Pydantic models for RAG Server
Contains data models for requests and responses
"""
import uuid
from typing import Optional, List
from pydantic import BaseModel


class ConversationTurn(BaseModel):
    user: str
    ai: str


class CallerInfo(BaseModel):
    phone: str
    is_registered: bool
    user_id: Optional[int] = None
    full_name: Optional[str] = None
    email: Optional[str] = None


class CallSession:
    def __init__(self, call_sid: str, caller_phone: str):
        self.call_sid = call_sid
        self.caller_phone = caller_phone
        self.session_id = str(uuid.uuid4())
        self.language = None
        self.assistant_id = None
        self.caller_info = None
        self.conversation_started = False


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None


class AvatarUpdateRequest(BaseModel):
    avatar_url: str


class LoginRequest(BaseModel):
    email: str
    password: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None


class EnhancedRegisterRequest(BaseModel):
    email: str
    phone: Optional[str] = None
    password: str
    full_name: Optional[str] = None
    verification_code: Optional[str] = None


class EnhancedLoginRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str


class AuthorizedTranscriptionRequest(BaseModel):
    transcription: str
    history: Optional[List[ConversationTurn]] = []
    language: str = "en-US"
    sessionId: Optional[str] = None
    assistantId: Optional[int] = 1
    userId: Optional[int] = None
    audioData: Optional[str] = None


class TranscriptionRequest(BaseModel):
    transcription: str
    history: Optional[List[ConversationTurn]] = []
    language: str = "en-US"
    sessionId: Optional[str] = None
    assistantId: Optional[int] = 1


class EdgeTTSRequest(BaseModel):
    text: str
    voice_id: str  # "slah" or "amira"
    language: str  # "en-US", "fr-FR", or "ar-SA"


class ForgotPasswordRequest(BaseModel):
    method: str = "phone"  # "phone" or "email"
    identifier: str


class ResetPasswordRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    verification_code: str
    new_password: str


class VerificationRequest(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    action: str = "register"  # register, reset_password, login
    user_data: Optional[dict] = None
