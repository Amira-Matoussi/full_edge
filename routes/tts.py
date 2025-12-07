"""
TTS Routes for RAG Server
Handles text-to-speech generation endpoints using Edge TTS
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import VOICE_CONFIG, edge_tts
from models import EdgeTTSRequest
from utils.text_utils import apply_pronunciation_fixes

router = APIRouter(prefix="/api", tags=["Text-to-Speech"])


@router.post("/edge-tts")
async def generate_edge_tts(request: EdgeTTSRequest):
    """Generate speech using Edge TTS with pronunciation fixes"""
    if not edge_tts:
        raise HTTPException(status_code=500, detail="Edge TTS not available")

    try:
        # Map assistant name
        assistant_name = "Slah" if request.voice_id.lower() == "slah" else "Amira"
        voice_name = VOICE_CONFIG.get(assistant_name, {}).get(request.language)

        if not voice_name:
            raise HTTPException(
                status_code=400,
                detail=f"No voice found for {request.voice_id} in {request.language}"
            )

        # Apply pronunciation fixes
        fixed_text = apply_pronunciation_fixes(request.text, assistant_name, request.language)

        print(f"🎤 Edge TTS: {voice_name}")
        print(f"📝 Original: {request.text[:50]}...")
        print(f"🔧 Fixed: {fixed_text[:50]}...")

        # Generate speech
        communicate = edge_tts.Communicate(fixed_text, voice_name)

        async def generate_audio():
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    yield chunk["data"]

        return StreamingResponse(
            generate_audio(),
            media_type="audio/mpeg",
            headers={
                "Cache-Control": "no-cache",
                "Transfer-Encoding": "chunked",
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Edge TTS error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/voices")
async def get_available_voices():
    """Get list of available voices"""
    return {
        "voices": VOICE_CONFIG,
        "assistants": ["Slah", "Amira"],
        "languages": ["en-US", "fr-FR", "ar-SA"]
    }
