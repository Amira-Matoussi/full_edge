"""
Twilio Routes for RAG Server
Handles incoming Twilio voice call endpoints
"""
from fastapi import APIRouter, HTTPException, Request, Form
from fastapi.responses import Response
from typing import Optional
from urllib.parse import parse_qs

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from twilio.twiml.voice_response import VoiceResponse, Gather
except ImportError:
    print("twilio not installed, Twilio routes will be limited")
    VoiceResponse = None
    Gather = None

from config import db, LANGUAGE_CONFIG, ASSISTANT_CONFIG, call_sessions
from models import CallSession
from services.rag_service import ImprovedRAGSystem
from utils.phone_utils import normalize_phone_number
from utils.caller_utils import identify_caller_by_phone
from utils.session_utils import get_or_create_call_session

router = APIRouter(prefix="/api/twilio", tags=["Twilio"])

# Initialize RAG system
rag_system = ImprovedRAGSystem()


@router.post("/incoming-call")
async def handle_incoming_call(
    request: Request,
    CallSid: str = Form(...),
    From: str = Form(...),
    To: str = Form(...)
):
    """Handle incoming Twilio voice call"""
    if not VoiceResponse:
        raise HTTPException(status_code=500, detail="Twilio not available")

    print(f"📞 Incoming call from {From} (CallSid: {CallSid})")

    # Create call session
    session = get_or_create_call_session(CallSid, From)

    # Identify caller
    session.caller_info = identify_caller_by_phone(From)

    response = VoiceResponse()

    # Greet caller
    if session.caller_info.is_registered and session.caller_info.full_name:
        greeting = f"Hello {session.caller_info.full_name}! Welcome back to Ooredoo."
    else:
        greeting = "Hello! Welcome to Ooredoo AI Assistant."

    response.say(greeting, voice="alice")

    # Ask for language selection
    gather = Gather(
        num_digits=1,
        action="/api/twilio/language-selection",
        method="POST",
        timeout=5
    )
    gather.say(
        "Press 1 for English. Press 2 for Arabic. Press 3 for French.",
        voice="alice"
    )
    response.append(gather)

    # Default to English if no input
    response.redirect("/api/twilio/language-selection?Digits=1")

    return Response(content=str(response), media_type="application/xml")


@router.post("/language-selection")
async def handle_language_selection(
    request: Request,
    CallSid: str = Form(...),
    Digits: str = Form(default="1")
):
    """Handle language selection"""
    if not VoiceResponse:
        raise HTTPException(status_code=500, detail="Twilio not available")

    session = call_sessions.get(CallSid)
    if not session:
        session = get_or_create_call_session(CallSid, "unknown")

    # Get selected language
    lang_config = LANGUAGE_CONFIG.get(Digits, LANGUAGE_CONFIG["1"])
    session.language = lang_config["code"]

    print(f"🌍 Language selected: {lang_config['name']} ({session.language})")

    response = VoiceResponse()
    response.say(f"You selected {lang_config['name']}.", voice=lang_config["voice"])

    # Ask for assistant selection
    gather = Gather(
        num_digits=1,
        action="/api/twilio/assistant-selection",
        method="POST",
        timeout=5
    )
    gather.say(
        "Press 1 for Slah, our B2B Enterprise Assistant. Press 2 for Amira, our B2C Customer Assistant.",
        voice=lang_config["voice"]
    )
    response.append(gather)

    # Default to Amira if no input
    response.redirect("/api/twilio/assistant-selection?Digits=2")

    return Response(content=str(response), media_type="application/xml")


@router.post("/assistant-selection")
async def handle_assistant_selection(
    request: Request,
    CallSid: str = Form(...),
    Digits: str = Form(default="2")
):
    """Handle assistant selection"""
    if not VoiceResponse:
        raise HTTPException(status_code=500, detail="Twilio not available")

    session = call_sessions.get(CallSid)
    if not session:
        session = get_or_create_call_session(CallSid, "unknown")
        session.language = "en-US"

    # Get selected assistant
    assistant_config = ASSISTANT_CONFIG.get(Digits, ASSISTANT_CONFIG["2"])
    session.assistant_id = assistant_config["id"]

    print(f"🤖 Assistant selected: {assistant_config['name']} ({assistant_config['type']})")

    lang_config = LANGUAGE_CONFIG.get("1", LANGUAGE_CONFIG["1"])
    for key, config in LANGUAGE_CONFIG.items():
        if config["code"] == session.language:
            lang_config = config
            break

    response = VoiceResponse()
    response.say(
        f"You're now connected with {assistant_config['name']}. How can I help you today?",
        voice=lang_config["voice"]
    )

    # Gather speech input
    gather = Gather(
        input="speech",
        action="/api/twilio/process-speech",
        method="POST",
        timeout=5,
        speech_timeout="auto",
        language=session.language
    )
    response.append(gather)

    response.say("I didn't hear anything. Please try again.", voice=lang_config["voice"])
    response.redirect("/api/twilio/start-conversation")

    return Response(content=str(response), media_type="application/xml")


@router.post("/start-conversation")
async def start_conversation(
    request: Request,
    CallSid: str = Form(...)
):
    """Start or continue conversation"""
    if not VoiceResponse:
        raise HTTPException(status_code=500, detail="Twilio not available")

    session = call_sessions.get(CallSid)
    if not session:
        session = get_or_create_call_session(CallSid, "unknown")
        session.language = "en-US"
        session.assistant_id = 2

    lang_config = LANGUAGE_CONFIG.get("1")
    for key, config in LANGUAGE_CONFIG.items():
        if config["code"] == session.language:
            lang_config = config
            break

    response = VoiceResponse()

    gather = Gather(
        input="speech",
        action="/api/twilio/process-speech",
        method="POST",
        timeout=5,
        speech_timeout="auto",
        language=session.language
    )
    response.append(gather)

    response.say("I didn't hear anything. Goodbye!", voice=lang_config["voice"])
    response.hangup()

    return Response(content=str(response), media_type="application/xml")


@router.post("/process-speech")
async def process_speech(
    request: Request,
    CallSid: str = Form(...),
    SpeechResult: str = Form(default="")
):
    """Process speech input and generate response"""
    if not VoiceResponse:
        raise HTTPException(status_code=500, detail="Twilio not available")

    session = call_sessions.get(CallSid)
    if not session:
        session = get_or_create_call_session(CallSid, "unknown")
        session.language = "en-US"
        session.assistant_id = 2

    print(f"🎤 Speech received: {SpeechResult}")

    lang_config = LANGUAGE_CONFIG.get("1")
    for key, config in LANGUAGE_CONFIG.items():
        if config["code"] == session.language:
            lang_config = config
            break

    assistant_name = "Slah" if session.assistant_id == 1 else "Amira"

    response = VoiceResponse()

    if not SpeechResult:
        response.say("I didn't hear anything. Please try again.", voice=lang_config["voice"])
        response.redirect("/api/twilio/start-conversation")
        return Response(content=str(response), media_type="application/xml")

    # Generate AI response
    try:
        ai_response = rag_system.get_response(
            SpeechResult,
            session.language,
            assistant_name
        )

        # Save to database if available
        if db:
            try:
                user_id = session.caller_info.user_id if session.caller_info else None
                db.save_session(
                    session_id=session.session_id,
                    language=session.language,
                    assistant_id=session.assistant_id,
                    user_id=user_id,
                    user_name=session.caller_info.full_name if session.caller_info else None,
                    issue_type=None
                )

                db.save_conversation(
                    session_id=session.session_id,
                    user_message=SpeechResult,
                    ai_response=ai_response,
                    language=session.language,
                    user_id=user_id
                )
            except Exception as e:
                print(f"❌ Database save failed: {e}")

        response.say(ai_response, voice=lang_config["voice"])

    except Exception as e:
        print(f"❌ Error generating response: {e}")
        response.say(
            "I'm having technical difficulties. Please try again later.",
            voice=lang_config["voice"]
        )
        response.hangup()
        return Response(content=str(response), media_type="application/xml")

    # Continue conversation
    gather = Gather(
        input="speech",
        action="/api/twilio/process-speech",
        method="POST",
        timeout=5,
        speech_timeout="auto",
        language=session.language
    )
    gather.say("Is there anything else I can help you with?", voice=lang_config["voice"])
    response.append(gather)

    response.say("Thank you for calling Ooredoo. Goodbye!", voice=lang_config["voice"])
    response.hangup()

    return Response(content=str(response), media_type="application/xml")


@router.post("/status-callback")
async def handle_status_callback(
    request: Request,
    CallSid: str = Form(...),
    CallStatus: str = Form(...)
):
    """Handle call status updates"""
    print(f"📊 Call status update: {CallSid} -> {CallStatus}")

    # Clean up session when call ends
    if CallStatus in ["completed", "failed", "busy", "no-answer", "canceled"]:
        if CallSid in call_sessions:
            del call_sessions[CallSid]
            print(f"🗑️ Session cleaned up for {CallSid}")

    return {"status": "received", "call_sid": CallSid, "call_status": CallStatus}


@router.get("/test")
async def test_twilio_endpoint():
    """Test endpoint to verify Twilio routes are working"""
    return {
        "status": "ok",
        "message": "Twilio routes are working",
        "twilio_available": VoiceResponse is not None,
        "active_sessions": len(call_sessions)
    }
