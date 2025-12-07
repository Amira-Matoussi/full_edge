"""
Configuration module for RAG Server
Contains environment variables, constants, and configuration settings
"""
import os
from fastapi.security import HTTPBearer

# Load environment variables
try:
    from dotenv import load_dotenv
    load_dotenv(".env.local")
except ImportError:
    print("python-dotenv not installed, using system environment variables")
    pass

# Add these environment variables
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@ooredoo.com")

# Language detection with proper error handling
try:
    from langdetect import detect
except ImportError:
    print("langdetect not installed, language detection will be limited")
    detect = None

# Edge TTS for text-to-speech (replaces ElevenLabs)
try:
    import edge_tts
except ImportError:
    print("edge-tts not installed, TTS features will be limited")
    edge_tts = None

# Database import with error handling
try:
    from database import DatabaseManager
except ImportError as e:
    print(f"Database module not found: {e}")
    DatabaseManager = None

# Configuration constants
LANGUAGE_CONFIG = {
    "1": {"code": "en-US", "name": "English", "voice": "alice"},
    "2": {"code": "ar-SA", "name": "Arabic", "voice": "alice"},
    "3": {"code": "fr-FR", "name": "French", "voice": "alice"}
}

ASSISTANT_CONFIG = {
    "1": {"id": 1, "name": "Slah", "type": "B2B"},
    "2": {"id": 2, "name": "Amira", "type": "B2C"}
}

# UPDATED: Edge TTS Voice Configuration (replaces ElevenLabs)
VOICE_CONFIG = {
    "Slah": {  # Male assistant
        "en-US": "en-US-GuyNeural",
        "fr-FR": "fr-FR-HenriNeural",
        "ar-SA": "ar-EG-ShakirNeural",  # Egyptian male
    },
    "Amira": {  # Female assistant
        "en-US": "en-US-JennyNeural",
        "fr-FR": "fr-FR-DeniseNeural",
        "ar-SA": "ar-SA-ZariyahNeural",  # Saudi female
    }
}

# Pronunciation dictionary for proper name pronunciation
PRONUNCIATION_FIXES = {
    "Slah": {
        "en-US": "Slah",  # Pronounced as "Slah" not "Slaw"
        "fr-FR": "Slah",
        "ar-SA": "صلاح"  # Use Arabic spelling for Arabic
    },
    "Amira": {
        "en-US": "Amira",
        "fr-FR": "Amira",
        "ar-SA": "أميرة"  # Use Arabic spelling for Arabic
    }
}

# Environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Config
LLM_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct"
SIMILARITY_THRESHOLD = 0.7
MAX_RESULTS = 12

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-please-change-this-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Audio storage
AUDIO_STORAGE_PATH = "recordings"
os.makedirs(AUDIO_STORAGE_PATH, exist_ok=True)

# Security
security = HTTPBearer()

# Session storage for call state
call_sessions = {}

# Initialize database
db = None
if DatabaseManager:
    try:
        db = DatabaseManager()
        db.setup_database()
        print("Database connected and ready")
    except Exception as e:
        print(f"Database not available: {e}")
        db = None
