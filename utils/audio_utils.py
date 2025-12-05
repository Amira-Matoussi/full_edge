"""
Audio utility functions for RAG Server
Handles audio file saving and generation with Edge TTS
"""
import os
import re
import base64
from datetime import datetime
from typing import Optional

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import AUDIO_STORAGE_PATH, db, edge_tts
from utils.text_utils import apply_pronunciation_fixes


async def save_audio_file(audio_data: str, session_id: str) -> Optional[str]:
    """Save base64 audio data to file with enhanced security and error handling"""
    if not audio_data or len(audio_data) < 50:
        print("⚠️ Invalid audio data provided")
        return None

    try:
        # Validate session_id format
        if not re.match(r'^[a-zA-Z0-9-_]+$', session_id):
            print("❌ Invalid session ID format")
            return None

        # Create recordings directory if it doesn't exist
        os.makedirs(AUDIO_STORAGE_PATH, exist_ok=True)
        print(f"📁 Audio storage path ensured: {AUDIO_STORAGE_PATH}")

        # Generate secure filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_session = re.sub(r'[^a-zA-Z0-9-_]', '', session_id[:8])
        filename = f"{safe_session}_{timestamp}.webm"
        filepath = os.path.join(AUDIO_STORAGE_PATH, filename)

        # Clean base64 string (remove data URL prefix if present)
        clean_audio_data = audio_data
        if audio_data.startswith('data:'):
            # Handle data URLs like "data:audio/webm;codecs=opus;base64,UklGRiQ..."
            if ';base64,' in audio_data:
                clean_audio_data = audio_data.split(';base64,')[1]
            else:
                clean_audio_data = audio_data.split(',')[1]

        # Validate base64 format
        if not re.match(r'^[A-Za-z0-9+/]*={0,2}$', clean_audio_data):
            print("❌ Invalid base64 format")
            return None

        print(f"🔄 Processing audio data - Original size: {len(audio_data)}, Clean size: {len(clean_audio_data)}")

        # Add padding if needed
        missing_padding = len(clean_audio_data) % 4
        if missing_padding:
            clean_audio_data += '=' * (4 - missing_padding)

        # Decode base64 and validate
        try:
            audio_bytes = base64.b64decode(clean_audio_data)
            print(f"✅ Decoded audio size: {len(audio_bytes)} bytes")

            # Size validation (100 bytes minimum, 10MB maximum)
            if len(audio_bytes) < 100:
                print(f"⚠️ Audio data too small: {len(audio_bytes)} bytes")
                return None

            if len(audio_bytes) > 10 * 1024 * 1024:  # 10MB limit
                print(f"❌ Audio file too large: {len(audio_bytes)} bytes")
                return None

        except Exception as decode_error:
            print(f"❌ Base64 decode error: {decode_error}")
            return None

        # Save to file securely
        with open(filepath, "wb") as f:
            f.write(audio_bytes)

        print(f"💾 Audio saved: {filename} ({len(audio_bytes)} bytes)")

        # Verify file was created and has content
        if os.path.exists(filepath):
            file_size = os.path.getsize(filepath)
            print(f"✅ File verified: {filepath} ({file_size} bytes)")

            if file_size > 0:
                return filename
            else:
                print(f"❌ File is empty: {filepath}")
                os.remove(filepath)  # Remove empty file
                return None
        else:
            print(f"❌ File not found after save: {filepath}")
            return None

    except Exception as e:
        print(f"❌ Error saving audio: {e}")
        import traceback
        traceback.print_exc()
        return None


async def save_ai_audio_from_edge_tts(
    text: str,
    voice_name: str,
    session_id: str,
    assistant_name: str = "Amira",
    language: str = "en-US"
) -> Optional[str]:
    """
    Generate and save AI audio using Edge TTS (FREE!)

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
        filepath = os.path.join(AUDIO_STORAGE_PATH, filename)

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


async def save_audio_in_background(
    audio_data: str,
    session_id: str,
    conversation_id: int,
    audio_type: str
):
    """Save audio file and update database in background"""
    try:
        audio_path = await save_audio_file(audio_data, session_id)
        if audio_path and db:
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    field = "user_audio_path" if audio_type == "user" else "ai_audio_path"
                    cursor.execute(f"""
                        UPDATE conversations
                        SET {field} = %s
                        WHERE id = %s
                    """, (audio_path, conversation_id))
                conn.commit()
            print(f"✅ {audio_type.title()} audio saved in background: {audio_path}")
    except Exception as e:
        print(f"❌ Background audio save failed: {e}")


async def generate_ai_audio_in_background(
    text: str,
    voice_id: str,  # This is the Edge TTS voice name (e.g., "en-US-JennyNeural")
    session_id: str,
    conversation_id: int,
    assistant_name: str = "Amira",
    language: str = "en-US"
):
    """
    Generate AI audio using Edge TTS and update database in background

    Args:
        text: Text to convert to speech
        voice_id: Edge TTS voice name
        session_id: Session ID
        conversation_id: Database conversation ID
        assistant_name: "Slah" or "Amira"
        language: "en-US", "fr-FR", or "ar-SA"
    """
    try:
        print(f"🔄 Background audio generation started for conversation {conversation_id}")

        # Use Edge TTS instead of ElevenLabs
        ai_audio_path = await save_ai_audio_from_edge_tts(
            text,
            voice_id,
            session_id,
            assistant_name,
            language
        )

        if ai_audio_path and db:
            with db.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        UPDATE conversations
                        SET ai_audio_path = %s
                        WHERE id = %s
                    """, (ai_audio_path, conversation_id))
                conn.commit()
            print(f"✅ AI audio saved in background: {ai_audio_path}")
        else:
            print(f"⚠️ Audio generation returned None for conversation {conversation_id}")

    except Exception as e:
        print(f"❌ Background AI audio generation failed: {e}")
        import traceback
        traceback.print_exc()
