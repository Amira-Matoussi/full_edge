"""
Voice Pipeline Routes for RAG Server
Handles voice processing endpoints for authenticated and guest users
"""
import uuid
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import db, VOICE_CONFIG
from models import TranscriptionRequest, AuthorizedTranscriptionRequest
from services.auth_service import get_optional_user
from services.rag_service import ImprovedRAGSystem
from utils.text_utils import extract_user_name, extract_issue_type
from utils.audio_utils import save_audio_in_background, generate_ai_audio_in_background
from utils.trello_utils import create_trello_card

router = APIRouter(prefix="/api", tags=["Voice Pipeline"])

# Initialize RAG system
rag_system = ImprovedRAGSystem()


@router.post("/voice-pipeline-auth")
async def process_voice_with_auth(
    request: AuthorizedTranscriptionRequest,
    background_tasks: BackgroundTasks,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Process voice input for authenticated users with full features"""
    try:
        session_id = request.sessionId or str(uuid.uuid4())
        user_id = current_user["user_id"] if current_user else None
        assistant_name = "Slah" if request.assistantId == 1 else "Amira"

        print(f"🔴 assistantId={request.assistantId}, assistant_name={assistant_name}, lang={request.language}")
        print(f"🎙️ Processing for user: {current_user['email'] if current_user else 'Guest'}")
        print(f"📋 Session: {session_id}")

        # Extract user info
        extracted_name = extract_user_name(request.transcription)
        extracted_issue = extract_issue_type(request.transcription)

        # Load conversation history
        conversation_history_list = []
        if db:
            try:
                with db.get_connection() as conn:
                    with conn.cursor() as cursor:
                        cursor.execute("""
                            SELECT user_message, ai_response
                            FROM conversations
                            WHERE session_id = %s
                            ORDER BY timestamp ASC
                            LIMIT 10
                        """, (session_id,))

                        rows = cursor.fetchall()
                        conversation_history_list = [
                            {"user": row[0], "ai": row[1]}
                            for row in rows
                        ]
            except Exception as e:
                print(f"❌ Error loading history: {e}")

        # Build conversation context
        history_to_use = request.history if request.history else conversation_history_list
        conversation_context = ""
        if history_to_use:
            conversation_context = "Previous conversation:\n"
            for turn in history_to_use[-10:]:
                user_msg = turn.user if hasattr(turn, 'user') else turn.get('user', '')
                ai_msg = turn.ai if hasattr(turn, 'ai') else turn.get('ai', '')
                conversation_context += f"User: {user_msg}\nAI: {ai_msg}\n"
            conversation_context += f"\nCurrent user message: {request.transcription}\n"
        else:
            conversation_context = request.transcription

        # Check for manual ticket request
        transcription_lower = request.transcription.lower()
        if any(phrase in transcription_lower for phrase in [
            "open a ticket", "open the ticket", "create a ticket", "raise a ticket", "submit a ticket"
        ]):
            ticket_url = create_trello_card(
                title=f"[MANUAL] {assistant_name} - {current_user['email'] if current_user else 'guest'}",
                description=f"""
                User explicitly asked to open a ticket.
                Session: {session_id}
                Language: {request.language}
                Message: {request.transcription}
                """
            )
            if ticket_url:
                ai_response = f"A support ticket has been created: {ticket_url}"
            else:
                ai_response = "I'll create a support ticket for you right away."
        else:
            # Generate AI response
            ai_response = rag_system.get_response(conversation_context, request.language, assistant_name)

            if not ai_response or "technical difficulties" in ai_response.lower():
                ticket_url = create_trello_card(
                    title=f"[AUTO-FALLBACK] {assistant_name} - {current_user['email'] if current_user else 'guest'}",
                    description=f"""
                    AI failed to respond properly.
                    Session: {session_id}
                    Language: {request.language}
                    Message: {request.transcription}
                    """
                )
                if ticket_url:
                    ai_response = f"I'm having technical issues. A support ticket was created: {ticket_url}"

        # Save to database
        conversation_id = None
        if db:
            try:
                db.save_session(
                    session_id=session_id,
                    language=request.language,
                    assistant_id=request.assistantId or 1,
                    user_id=user_id,
                    user_name=extracted_name,
                    issue_type=extracted_issue
                )

                # Save conversation and get ID
                with db.get_connection() as conn:
                    with conn.cursor() as cursor:
                        cursor.execute("""
                            INSERT INTO conversations
                            (session_id, user_id, user_message, ai_response, language)
                            VALUES (%s, %s, %s, %s, %s)
                            RETURNING id
                        """, (session_id, user_id, request.transcription, ai_response, request.language))
                        conversation_id = cursor.fetchone()[0]
                    conn.commit()

            except Exception as db_error:
                print(f"❌ Database save failed: {db_error}")

        # Schedule background audio processing
        if conversation_id:
            if request.audioData:
                background_tasks.add_task(
                    save_audio_in_background,
                    request.audioData,
                    session_id,
                    conversation_id,
                    "user"
                )

            voice_id = VOICE_CONFIG.get(assistant_name, {}).get(request.language, VOICE_CONFIG["Amira"]["en-US"])
            background_tasks.add_task(
                generate_ai_audio_in_background,
                ai_response,
                voice_id,
                session_id,
                conversation_id,
                assistant_name,
                request.language
            )

        # Get updated conversation history
        conversation_history = []
        if db:
            try:
                with db.get_connection() as conn:
                    with conn.cursor() as cursor:
                        cursor.execute("""
                            SELECT user_message, ai_response, timestamp,
                                   user_audio_path, ai_audio_path
                            FROM conversations
                            WHERE session_id = %s
                            ORDER BY timestamp ASC
                        """, (session_id,))

                        rows = cursor.fetchall()
                        conversation_history = [
                            {
                                "user": row[0] or "",
                                "ai": row[1] or "",
                                "user_message": row[0] or "",
                                "ai_response": row[1] or "",
                                "timestamp": row[2].isoformat() if row[2] else None,
                                "user_audio_path": row[3],
                                "ai_audio_path": row[4]
                            }
                            for row in rows
                        ]

            except Exception as db_error:
                print(f"❌ Error fetching history: {db_error}")

        return {
            "transcription": request.transcription,
            "aiResponse": ai_response,
            "sessionId": session_id,
            "conversationHistory": conversation_history,
            "user": current_user["email"] if current_user else "guest",
            "extractedInfo": {
                "userName": extracted_name,
                "issueType": extracted_issue
            },
            "audioSaved": {
                "user": "processing",
                "ai": "processing"
            }
        }

    except Exception as e:
        print(f"❌ Voice processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/voice-pipeline")
async def process_voice(request: TranscriptionRequest):
    """Regular voice pipeline for guests"""
    try:
        session_id = request.sessionId or str(uuid.uuid4())
        assistant_name = "Slah" if request.assistantId == 1 else "Amira"

        print(f"Processing: {request.transcription[:50]}... (Session: {session_id})")
        print(f"UI Language: {request.language}")

        # Extract user info even for guests
        extracted_name = extract_user_name(request.transcription)
        extracted_issue = extract_issue_type(request.transcription)

        # Load existing conversation history from database
        conversation_history_list = []
        if db:
            try:
                with db.get_connection() as conn:
                    with conn.cursor() as cursor:
                        cursor.execute("""
                            SELECT user_message, ai_response
                            FROM conversations
                            WHERE session_id = %s
                            ORDER BY timestamp ASC
                            LIMIT 10
                        """, (session_id,))

                        rows = cursor.fetchall()
                        conversation_history_list = [
                            {"user": row[0], "ai": row[1]}
                            for row in rows
                        ]
                        print(f"Loaded {len(conversation_history_list)} messages from database")
            except Exception as e:
                print(f"Error loading history from database: {e}")

        # Use frontend history if available, otherwise use database history
        if request.history and len(request.history) > 0:
            history_to_use = request.history
            print("Using history from frontend")
        else:
            history_to_use = conversation_history_list
            print("Using history from database")

        # Build context from conversation history
        conversation_context = ""
        if history_to_use and len(history_to_use) > 0:
            conversation_context = "Previous conversation:\n"
            for turn in history_to_use[-10:]:
                user_msg = turn.user if hasattr(turn, 'user') else turn.get('user', '')
                ai_msg = turn.ai if hasattr(turn, 'ai') else turn.get('ai', '')
                conversation_context += f"User: {user_msg}\nAI: {ai_msg}\n"
            conversation_context += f"\nCurrent user message: {request.transcription}\n"
        else:
            conversation_context = request.transcription

        # Generate AI response
        ai_response = rag_system.get_response(conversation_context, request.language, assistant_name)

        # Save to database
        if db:
            try:
                db.save_session(
                    session_id=session_id,
                    language=request.language,
                    assistant_id=request.assistantId or 1,
                    user_id=None,
                    user_name=extracted_name,
                    issue_type=extracted_issue
                )

                db.save_conversation(
                    session_id=session_id,
                    user_message=request.transcription,
                    ai_response=ai_response,
                    language=request.language,
                    user_id=None,
                    user_audio_path=None,
                    ai_audio_path=None
                )
            except Exception as db_error:
                print(f"❌ Database save failed: {db_error}")

        # Build updated conversation history
        updated_history = []
        if history_to_use:
            for turn in history_to_use:
                user_msg = turn.user if hasattr(turn, 'user') else turn.get('user', '')
                ai_msg = turn.ai if hasattr(turn, 'ai') else turn.get('ai', '')
                updated_history.append({
                    "user": user_msg,
                    "ai": ai_msg,
                    "user_message": user_msg,
                    "ai_response": ai_msg
                })

        # Add current exchange
        updated_history.append({
            "user": request.transcription,
            "ai": ai_response,
            "user_message": request.transcription,
            "ai_response": ai_response
        })

        return {
            "transcription": request.transcription,
            "aiResponse": ai_response,
            "sessionId": session_id,
            "conversationHistory": updated_history,
            "extractedInfo": {
                "userName": extracted_name,
                "issueType": extracted_issue
            }
        }

    except Exception as e:
        print(f"❌ Voice processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
