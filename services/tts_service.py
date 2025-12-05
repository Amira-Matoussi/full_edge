"""
TTS Service for RAG Server
Handles text-to-speech generation using Edge TTS
"""
import os
import re
from datetime import datetime
from typing import Optional, AsyncIterator

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import VOICE_CONFIG, AUDIO_STORAGE_PATH, edge_tts
from utils.text_utils import apply_pronunciation_fixes


def get_voice_id(assistant_name: str, language: str) -> str:
    """
    Get the Edge TTS voice ID for the given assistant and language.

    Args:
        assistant_name: "Slah" or "Amira"
        language: "en-US", "fr-FR", or "ar-SA"

    Returns:
        Edge TTS voice name (e.g., "en-US-JennyNeural")
    """
    return VOICE_CONFIG.get(assistant_name, VOICE_CONFIG["Amira"]).get(
        language, VOICE_CONFIG["Amira"]["en-US"]
    )


class TTSService:
    """Service for generating speech using Edge TTS"""

    def __init__(self):
        self.audio_storage_path = AUDIO_STORAGE_PATH

    async def generate_speech(
        self,
        text: str,
        voice_id: str,
        language: str,
        assistant_name: str = "Amira"
    ) -> AsyncIterator[bytes]:
        """
        Generate speech audio stream using Edge TTS.

        Args:
            text: Text to convert to speech
            voice_id: Edge TTS voice name
            language: Language code for pronunciation fixes
            assistant_name: "Slah" or "Amira" for pronunciation fixes

        Yields:
            Audio data chunks
        """
        if not text or not text.strip():
            return

        # Apply pronunciation fixes
        fixed_text = apply_pronunciation_fixes(text, assistant_name, language)
        print(f"🎤 Edge TTS: {voice_id}")
        print(f"📝 Original: {text[:50]}...")
        print(f"🔧 Fixed: {fixed_text[:50]}...")

        # Generate speech
        communicate = edge_tts.Communicate(fixed_text, voice_id)

        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                yield chunk["data"]

    async def save_speech(
        self,
        text: str,
        voice_name: str,
        session_id: str,
        assistant_name: str = "Amira",
        language: str = "en-US"
    ) -> Optional[str]:
        """
        Generate and save AI audio using Edge TTS.

        Args:
            text: Text to convert to speech
            voice_name: Edge TTS voice name (e.g., "en-US-JennyNeural")
            session_id: Session ID for filename
            assistant_name: "Slah" or "Amira" for pronunciation fixes
            language: "en-US", "fr-FR", or "ar-SA"

        Returns:
            Filename of saved audio or None if failed
        """
        if not text or not text.strip():
            print("⚠️ No text provided for audio generation")
            return None

        try:
            print(f"🎤 Generating AI audio with Edge TTS for: {text[:50]}...")

            # Apply pronunciation fixes before TTS
            fixed_text = apply_pronunciation_fixes(text, assistant_name, language)
            print(f"🔧 Text after pronunciation fixes: {fixed_text[:50]}...")

            # Generate speech using Edge TTS
            communicate = edge_tts.Communicate(fixed_text, voice_name)

            # Save AI audio file
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            safe_session = re.sub(r'[^a-zA-Z0-9-_]', '', session_id[:8])
            filename = f"{safe_session}_ai_{timestamp}.mp3"
            filepath = os.path.join(self.audio_storage_path, filename)

            # Save the audio
            await communicate.save(filepath)

            # Get file size
            file_size = os.path.getsize(filepath)
            print(f"✅ AI audio saved: {filename} ({file_size} bytes) using Edge TTS")

            return filename

        except Exception as e:
            print(f"❌ Error saving AI audio with Edge TTS: {e}")
            import traceback
            traceback.print_exc()
            return None

    def get_assistant_voice(self, assistant_name: str, language: str) -> str:
        """
        Get the appropriate voice for an assistant in a specific language.

        Args:
            assistant_name: "Slah" or "Amira"
            language: "en-US", "fr-FR", or "ar-SA"

        Returns:
            Edge TTS voice name
        """
        return get_voice_id(assistant_name, language)
