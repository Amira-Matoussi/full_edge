"""
Main application file for RAG Server
Initializes services and registers routes
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Import configuration
from config import (
    GROQ_API_KEY, JWT_SECRET, AUDIO_STORAGE_PATH, LLM_MODEL, db
)

# Import services from services folder
from services.rag_service import ImprovedRAGSystem
from services.sms_service import SMSService
from services.email_service import EmailService

# Import route modules
from routes.auth import router as auth_router
from routes.profile import router as profile_router
from routes.voice import router as voice_router
from routes.twilio import router as twilio_router
from routes.dashboard import router as dashboard_router
from routes.tts import router as tts_router

# Initialize services
rag_system = ImprovedRAGSystem()
sms_service = SMSService()
email_service = EmailService()

# FastAPI setup
app = FastAPI(
    title="Ooredoo AI Assistant",
    description="RAG-powered AI Assistant with Edge TTS",
    version="4.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# REGISTER ALL ROUTERS
# ============================================

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(voice_router)
app.include_router(twilio_router)
app.include_router(dashboard_router)
app.include_router(tts_router)

# ============================================
# HEALTH CHECK ENDPOINTS
# ============================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "rag_ready": rag_system.index is not None,
        "database_ready": db is not None,
        "chunks_loaded": len(rag_system.chunks) if rag_system.chunks else 0,
        "model": LLM_MODEL,
        "approach": "gender_aware_with_full_rag_context",
        "tts": "edge_tts"
    }


@app.get("/api/check-config")
async def check_config():
    """Configuration check endpoint"""
    return {
        "hasRAG": rag_system.index is not None,
        "embeddingModel": "paraphrase-multilingual-MiniLM-L12-v2",
        "llmModel": LLM_MODEL,
        "chunks": len(rag_system.chunks) if rag_system.chunks else 0,
        "approach": "gender_aware_prompts_with_full_rag_context",
        "features": [
            "gender_aware_system_prompts",
            "full_rag_context_search",
            "conversation_history",
            "behavior_rules",
            "edge_tts_integration"
        ]
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "Ooredoo AI Assistant API",
        "version": "4.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health"
    }


# ============================================
# STATIC FILE SERVING FOR AUDIO
# ============================================

# Mount the recordings directory for audio playback
if not os.path.exists(AUDIO_STORAGE_PATH):
    os.makedirs(AUDIO_STORAGE_PATH)
    print(f"Created recordings directory: {AUDIO_STORAGE_PATH}")

app.mount("/recordings", StaticFiles(directory=AUDIO_STORAGE_PATH), name="recordings")


# ============================================
# APPLICATION STARTUP
# ============================================

@app.on_event("startup")
async def startup_event():
    """Application startup event handler"""
    print("🚀 Starting Ooredoo AI Assistant Server...")
    print(f"📊 RAG System Status: {'✅ Ready' if rag_system.index is not None else '❌ Failed'}")
    print(f"🗄️ Database Status: {'✅ Connected' if db is not None else '❌ Not available'}")
    print(f"🎤 TTS Status: ✅ Edge TTS (FREE)")
    print(f"📱 SMS Service Status: {'✅ Ready' if sms_service.client is not None else '⚠️ Development mode'}")
    print(f"✅ Features: Gender-Aware Prompts + Full RAG Context + Edge TTS")


if __name__ == "__main__":
    import uvicorn

    # Validate critical environment variables on startup
    if not GROQ_API_KEY:
        print("⚠️ WARNING: GROQ_API_KEY not found. RAG responses will fail.")

    if JWT_SECRET == "your-secret-key-please-change-this-in-production":
        print("⚠️ WARNING: Using default JWT secret. Change this in production!")

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
