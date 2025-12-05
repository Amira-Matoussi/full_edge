"""
Route modules for RAG Server
Contains API endpoint definitions organized by feature
"""
from routes.auth import router as auth_router
from routes.profile import router as profile_router
from routes.voice import router as voice_router
from routes.twilio import router as twilio_router
from routes.dashboard import router as dashboard_router
from routes.tts import router as tts_router

__all__ = [
    'auth_router',
    'profile_router',
    'voice_router',
    'twilio_router',
    'dashboard_router',
    'tts_router'
]
