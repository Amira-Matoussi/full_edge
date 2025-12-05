"""
Session utility functions for RAG Server
Handles call session management
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import CallSession
from config import call_sessions


def get_or_create_call_session(call_sid: str, caller_phone: str) -> CallSession:
    """Get existing call session or create new one"""
    if call_sid not in call_sessions:
        call_sessions[call_sid] = CallSession(call_sid, caller_phone)
    return call_sessions[call_sid]
