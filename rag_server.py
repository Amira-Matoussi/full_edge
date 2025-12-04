
# from dotenv import load_dotenv
# load_dotenv(".env.local")

# # Standard library imports
# import os
# import re
# import json
# import glob
# import uuid
# import base64
# import logging
# import asyncio
# import requests
# from datetime import datetime, timedelta
# from typing import Optional, List, AsyncIterator
# from urllib.parse import parse_qs
# from functools import lru_cache

# # Third-party imports
# import jwt
# import faiss
# import numpy as np
# from groq import Groq
# from sentence_transformers import SentenceTransformer
# from twilio.rest import Client
# from twilio.twiml.voice_response import VoiceResponse, Gather

# # FastAPI imports
# from fastapi import FastAPI, HTTPException, Depends, Header, BackgroundTasks, Request, Form
# from fastapi.responses import Response, StreamingResponse
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from fastapi.staticfiles import StaticFiles
# from pydantic import BaseModel

# import requests

# # Add these environment variables
# SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
# FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@ooredoo.com")

# # Language detection with proper error handling
# try:
#     from langdetect import detect
# except ImportError:
#     print("Installing langdetect...")
#     os.system("pip install langdetect")
#     from langdetect import detect

# # Edge TTS for text-to-speech (replaces ElevenLabs)
# try:
#     import edge_tts
# except ImportError:
#     print("Installing edge-tts...")
#     os.system("pip install edge-tts")
#     import edge_tts

# # Database import with error handling
# try:
#     from database import DatabaseManager
# except ImportError as e:
#     print(f"Database module not found: {e}")
#     DatabaseManager = None

# # Configuration constants
# LANGUAGE_CONFIG = {
#     "1": {"code": "en-US", "name": "English", "voice": "alice"},
#     "2": {"code": "ar-SA", "name": "Arabic", "voice": "alice"}, 
#     "3": {"code": "fr-FR", "name": "French", "voice": "alice"}
# }

# ASSISTANT_CONFIG = {
#     "1": {"id": 1, "name": "Slah", "type": "B2B"},
#     "2": {"id": 2, "name": "Amira", "type": "B2C"}
# }

# # UPDATED: Edge TTS Voice Configuration (replaces ElevenLabs)
# VOICE_CONFIG = {
#     "Slah": {  # Male assistant
#         "en-US": "en-US-GuyNeural",
#         "fr-FR": "fr-FR-HenriNeural", 
#         "ar-SA": "ar-EG-ShakirNeural",  # Egyptian male
#     },
#     "Amira": {  # Female assistant
#         "en-US": "en-US-JennyNeural",
#         "fr-FR": "fr-FR-DeniseNeural",
#         "ar-SA": "ar-SA-ZariyahNeural",  # Saudi female
#     }
# }

# # Pronunciation dictionary for proper name pronunciation
# PRONUNCIATION_FIXES = {
#     "Slah": {
#         "en-US": "Slah",  # Pronounced as "Slah" not "Slaw"
#         "fr-FR": "Slah",
#         "ar-SA": "صلاح"  # Use Arabic spelling for Arabic
#     },
#     "Amira": {
#         "en-US": "Amira",
#         "fr-FR": "Amira",
#         "ar-SA": "أميرة"  # Use Arabic spelling for Arabic
#     }
# }

# def apply_pronunciation_fixes(text: str, assistant_name: str, language: str) -> str:
#     """
#     Apply pronunciation fixes to text for proper name pronunciation
    
#     Args:
#         text: The text to fix
#         assistant_name: "Slah" or "Amira"
#         language: "en-US", "fr-FR", or "ar-SA"
    
#     Returns:
#         Fixed text with proper pronunciation hints
#     """
    
#     # For Arabic, use native spelling
#     if language == "ar-SA":
#         name_replacements = {
#             "Slah": "صلاح",
#             "slah": "صلاح",
#             "SLAH": "صلاح",
#             "Amira": "أميرة",
#             "amira": "أميرة",
#             "AMIRA": "أميرة",
#             "B2C": "بي تو سي",
#             "B2B": "بي تو بي",
#             "Ooredoo": "أوريدو"
#         }
#         for eng_name, ar_name in name_replacements.items():
#             text = text.replace(eng_name, ar_name)
    
#     # For French, ensure proper spelling
#     elif language == "fr-FR":
#         # Ensure Slah and Amira are written clearly
#         text = re.sub(r'\bSlah\b', 'Slah', text, flags=re.IGNORECASE)
#         text = re.sub(r'\bAmira\b', 'Amira', text, flags=re.IGNORECASE)
#         # Break down acronyms
#         text = text.replace("B2C", "B deux C")
#         text = text.replace("B2B", "B deux B")
    
#     # For English, use phonetic hints
#     elif language == "en-US":
#         # Keep Slah as-is but ensure it's spelled correctly
#         text = re.sub(r'\bslah\b', 'Slah', text, flags=re.IGNORECASE)
#         text = re.sub(r'\bamira\b', 'Amira', text, flags=re.IGNORECASE)
#         # Break down B2C/B2B for better pronunciation
#         text = text.replace("B2C", "B two C")
#         text = text.replace("B2B", "B two B")
    
#     return text

# # Environment variables
# GROQ_API_KEY = os.getenv("GROQ_API_KEY")
# TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
# TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
# TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")
# # ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")  # No longer needed with Edge TTS

# # Config
# LLM_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct"
# SIMILARITY_THRESHOLD = 0.7
# MAX_RESULTS = 12

# # JWT Configuration
# JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-please-change-this-in-production")
# JWT_ALGORITHM = "HS256"
# JWT_EXPIRATION_HOURS = 24

# # Audio storage
# AUDIO_STORAGE_PATH = "recordings"
# os.makedirs(AUDIO_STORAGE_PATH, exist_ok=True)

# # Security
# security = HTTPBearer()

# # Session storage for call state
# call_sessions = {}

# # Initialize database
# db = None
# if DatabaseManager:
#     try:
#         db = DatabaseManager()
#         db.setup_database()
#         print("Database connected and ready")
#     except Exception as e:
#         print(f"Database not available: {e}")
#         db = None

# # Pydantic models
# class ConversationTurn(BaseModel):
#     user: str
#     ai: str

# class CallerInfo(BaseModel):
#     phone: str
#     is_registered: bool
#     user_id: Optional[int] = None
#     full_name: Optional[str] = None
#     email: Optional[str] = None

# class CallSession:
#     def __init__(self, call_sid: str, caller_phone: str):
#         self.call_sid = call_sid
#         self.caller_phone = caller_phone
#         self.session_id = str(uuid.uuid4())
#         self.language = None
#         self.assistant_id = None
#         self.caller_info = None
#         self.conversation_started = False

# class ProfileUpdateRequest(BaseModel):
#     full_name: Optional[str] = None
#     phone: Optional[str] = None

# class AvatarUpdateRequest(BaseModel):
#     avatar_url: str

# class LoginRequest(BaseModel):
#     email: str
#     password: str

# class RegisterRequest(BaseModel):
#     email: str
#     password: str
#     full_name: Optional[str] = None

# class EnhancedRegisterRequest(BaseModel):
#     email: str
#     phone: Optional[str] = None
#     password: str
#     full_name: Optional[str] = None
#     verification_code: Optional[str] = None

# class EnhancedLoginRequest(BaseModel):
#     email: Optional[str] = None
#     phone: Optional[str] = None
#     password: str

# class AuthorizedTranscriptionRequest(BaseModel):
#     transcription: str
#     history: Optional[List[ConversationTurn]] = []
#     language: str = "en-US"
#     sessionId: Optional[str] = None
#     assistantId: Optional[int] = 1
#     userId: Optional[int] = None
#     audioData: Optional[str] = None

# class TranscriptionRequest(BaseModel):
#     transcription: str
#     history: Optional[List[ConversationTurn]] = []
#     language: str = "en-US"
#     sessionId: Optional[str] = None
#     assistantId: Optional[int] = 1

# class EdgeTTSRequest(BaseModel):
#     text: str
#     voice_id: str  # "slah" or "amira"
#     language: str  # "en-US", "fr-FR", or "ar-SA"

# # ============================================
# # GENDER-AWARE SYSTEM PROMPTS
# # ============================================

# def get_gender_aware_system_prompt(assistant_id: int, language: str) -> str:
#     """Get system prompt with proper gender grammar"""
    
#     assistant_name = "Slah" if assistant_id == 1 else "Amira"
#     is_male = assistant_id == 1
#     print(f"🟢 PROMPT: id={assistant_id}, name={assistant_name}, male={is_male}, lang={language}")
#     prompts = {
#         "en-US": {
#             True: f"You are {assistant_name}, a helpful B2B Enterprise Assistant. Provide clear, concise, and professional responses.",
#             False: f"You are {assistant_name}, a helpful B2C Customer Support Assistant. Provide clear, concise, and friendly responses."
#         },
#         "fr-FR": {
#             True: f"Vous êtes {assistant_name}, un assistant B2B pour les entreprises. Fournissez des réponses claires et professionnelles. Utilisez toujours la forme masculine (assistant, serviable, disponible).",
#             False: f"Vous êtes {assistant_name}, une assistante B2C pour le service client. Fournissez des réponses claires et amicales. Utilisez toujours la forme féminine (assistante, serviable, disponible)."
#         },
#         "ar-SA": {
#             True: f"أنت {assistant_name}، مساعد ذكي للشركات B2B. قدم إجابات واضحة ومهنية. استخدم دائماً صيغة المذكر (مساعدك، متاح، جاهز).",
#             False: f"أنت {assistant_name}، مساعدة ذكية لخدمة العملاء B2C. قدمي إجابات واضحة وودية. استخدمي دائماً صيغة المؤنث (مساعدتك، متاحة، جاهزة)."
#         }
#     }
    
#     result = prompts.get(language, prompts["en-US"]).get(is_male, prompts["en-US"][True])
#     print(f"🟢 RETURNING: {result[:80]}...")
#     return result

# # class SMSService:
# #     def __init__(self):
# #         self.client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN else None
# #         self.dev_mode = True  # Set to False in production

# #     def send_verification_code(self, phone: str, code: str, action: str) -> bool:
# #         """Send verification code via SMS or console in dev mode"""

# #         # Always log to console for development
# #         print(f"""
# #         ╔══════════════════════════════════════════╗
# #         ║     📱 VERIFICATION CODE (DEV MODE)      ║
# #         ╠══════════════════════════════════════════╣
# #         ║  Phone: {phone:<32} ║
# #         ║  Code:  {code:<32} ║
# #         ║  Action: {action:<31} ║
# #         ╚══════════════════════════════════════════╝
# #         """)

# #         if self.dev_mode:
# #             # In dev mode, just return success without sending SMS
# #             return True

# #         if not self.client:
# #             print(f"⚠️ SMS service not configured. Code for {phone}: {code}")
# #             return True  # Return True for development

# #         try:
# #             message_body = self.get_message_body(code, action)

# #             message = self.client.messages.create(
# #                 body=message_body,
# #                 from_=TWILIO_PHONE_NUMBER,
# #                 to=phone
# #             )

# #             print(f"✅ SMS sent to {phone}: {message.sid}")
# #             return True

# #         except Exception as e:
# #             print(f"❌ SMS send failed: {e}")
# #             # Check if it's a verification issue
# #             if "unverified" in str(e).lower():
# #                 print(f"""
# #                 ⚠️ TWILIO FREE ACCOUNT LIMITATION:
# #                 The phone number {phone} is not verified in your Twilio account.

# #                 To fix this:
# #                 1. Go to https://console.twilio.com
# #                 2. Navigate to Phone Numbers → Verified Caller IDs
# #                 3. Add and verify {phone}

# #                 For now, use the code shown above in the console.
# #                 """)
# #             return False

# #     def get_message_body(self, code: str, action: str) -> str:
# #         """Get SMS message body based on action"""
# #         messages = {
# #             "register": f"Your Ooredoo AI verification code is: {code}. This code expires in 10 minutes.",
# #             "reset_password": f"Your Ooredoo AI password reset code is: {code}. This code expires in 10 minutes.",
# #             "login": f"Your Ooredoo AI login verification code is: {code}. This code expires in 10 minutes."
# #         }
# #         return messages.get(action, f"Your verification code is: {code}")
# # In rag_server.py, find the SMSService class and modify:

# # Replace your entire SMSService class in rag_server.py with this:
# # For development, modify your EmailService like this:

# # Replace the entire EmailService class in rag_server.py with this simplified version:

# class EmailService:
#     def __init__(self):
#         self.sendgrid_api_key = SENDGRID_API_KEY
#         self.from_email = FROM_EMAIL
#         self.dev_mode = False  # Set to False to send real emails
        
#     def send_verification_email(self, email: str, code: str, action: str) -> bool:
#         """Send verification code via email using SendGrid"""
        
#         print(f"""
#         ╔══════════════════════════════════════════╗
#         ║     📧 EMAIL VERIFICATION CODE           ║
#         ╠══════════════════════════════════════════╣
#         ║  Email: {email:<33} ║
#         ║  Code:  {code:<33} ║
#         ║  Action: {action:<32} ║
#         ╚══════════════════════════════════════════╝
#         """)
        
#         # In dev mode, just show in console
#         if self.dev_mode:
#             print(f"📧 DEV MODE: Email reset code for {email}: {code}")
#             return True
        
#         # Check if SendGrid is configured
#         if not self.sendgrid_api_key:
#             print(f"⚠️ SendGrid not configured. Email code for {email}: {code}")
#             return True
        
#         try:
#             # Send actual email via SendGrid
#             return self._send_with_sendgrid(email, code, action)
            
#         except Exception as e:
#             print(f"❌ Email send failed: {e}")
#             print(f"📧 Fallback - Email code for {email}: {code}")
#             return False
    
#     def _send_with_sendgrid(self, email: str, code: str, action: str) -> bool:
#         """Send email using SendGrid API"""
#         try:
#             subject, html_content = self._get_email_content(code, action)
            
#             # SendGrid API payload
#             data = {
#                 "personalizations": [
#                     {
#                         "to": [{"email": email}],
#                         "subject": subject
#                     }
#                 ],
#                 "from": {
#                     "email": self.from_email,
#                     "name": "Ooredoo AI Assistant"
#                 },
#                 "content": [
#                     {
#                         "type": "text/html",
#                         "value": html_content
#                     }
#                 ]
#             }
            
#             # Send via SendGrid API
#             response = requests.post(
#                 "https://api.sendgrid.com/v3/mail/send",
#                 headers={
#                     "Authorization": f"Bearer {self.sendgrid_api_key}",
#                     "Content-Type": "application/json"
#                 },
#                 json=data,
#                 timeout=10
#             )
            
#             if response.status_code == 202:
#                 print(f"✅ Email sent successfully to {email}")
#                 return True
#             else:
#                 print(f"❌ SendGrid API error: {response.status_code}")
#                 print(f"Response: {response.text}")
#                 return False
                
#         except Exception as e:
#             print(f"❌ SendGrid request failed: {e}")
#             return False
    
#     def _get_email_content(self, code: str, action: str) -> tuple:
#         """Get email subject and HTML content"""
        
#         subjects = {
#             "register": "Verify Your Ooredoo AI Account",
#             "reset_password": "Reset Your Ooredoo AI Password",
#             "login": "Ooredoo AI Login Verification"
#         }
        
#         # Simple HTML email template
#         html_template = f"""
#         <!DOCTYPE html>
#         <html>
#         <head>
#             <meta charset="utf-8">
#             <title>{subjects.get(action, 'Verification Code')}</title>
#         </head>
#         <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            
#             <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
#                 <h1 style="color: white; margin: 0; font-size: 24px;">Ooredoo AI Assistant</h1>
#             </div>
            
#             <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
#                 <h2 style="color: #495057; margin-top: 0;">
#                     {"Password Reset Request" if action == "reset_password" else "Account Verification"}
#                 </h2>
                
#                 <p style="font-size: 16px; margin-bottom: 25px;">
#                     Your verification code is:
#                 </p>
                
#                 <div style="background: white; border: 2px dashed #6c757d; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px;">
#                     <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #495057;">{code}</span>
#                 </div>
                
#                 <p style="font-size: 14px; color: #6c757d; margin-bottom: 20px;">
#                     This code will expire in <strong>10 minutes</strong>.
#                 </p>
                
#                 <p style="font-size: 14px; color: #6c757d;">
#                     If you didn't request this verification, please ignore this email.
#                 </p>
#             </div>
            
#             <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #adb5bd;">
#                 <p>Ooredoo AI Assistant - Powered by AI Technology</p>
#             </div>
            
#         </body>
#         </html>
#         """
        
#         subject = subjects.get(action, "Verification Code")
#         return subject, html_template
# class SMSService:
#     def __init__(self):
#         self.client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN else None
#         self.dev_mode = False  # Set to False for production SMS

#     def send_verification_code(self, phone: str, code: str, action: str) -> bool:
#         """Send verification code via SMS or console in dev mode"""

#         # Always log to console for development
#         print(f"""
#         ╔══════════════════════════════════════════╗
#         ║     📱 VERIFICATION CODE (PRODUCTION)    ║
#         ╠══════════════════════════════════════════╣
#         ║  Phone: {phone:<32} ║
#         ║  Code:  {code:<32} ║
#         ║  Action: {action:<31} ║
#         ╚══════════════════════════════════════════╝
#         """)

#         if self.dev_mode:
#             # In dev mode, just return success without sending SMS
#             return True

#         if not self.client:
#             print(f"⚠️ SMS service not configured. Code for {phone}: {code}")
#             return True  # Return True for development

#         try:
#             message_body = self.get_message_body(code, action)

#             message = self.client.messages.create(
#                 body=message_body,
#                 from_=TWILIO_PHONE_NUMBER,
#                 to=phone
#             )

#             print(f"✅ SMS sent to {phone}: {message.sid}")
#             print(f"Message status: {message.status}")
#             return True

#         except Exception as e:
#             print(f"❌ SMS send failed: {e}")
#             # Check if it's a verification issue
#             if "unverified" in str(e).lower():
#                 print(f"""
#                 ⚠️ TWILIO TRIAL ACCOUNT LIMITATION:
#                 The phone number {phone} is not verified in your Twilio account.
#                 For now, use the code shown above in the console: {code}
#                 """)
#             return False

#     def get_message_body(self, code: str, action: str) -> str:
#         """Get SMS message body based on action"""
#         messages = {
#             "register": f"Your Ooredoo AI verification code is: {code}. This code expires in 10 minutes.",
#             "reset_password": f"Your Ooredoo AI password reset code is: {code}. This code expires in 10 minutes.",
#             "login": f"Your Ooredoo AI login verification code is: {code}. This code expires in 10 minutes."
#         }
#         return messages.get(action, f"Your verification code is: {code}")
# # RAG System Class
# # RAG System Class with B2B/B2C Filtering
# # class ImprovedRAGSystem:
# #     def __init__(self):
# #         self.embedding_model = None
# #         self.groq_client = None
# #         self.index = None
# #         self.chunks = []
# #         self.initialize_models()

# #     def initialize_models(self):
# #         """Initialize models with error handling"""
# #         try:
# #             print("Initializing embedding model...")
# #             self.embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
# #             print("✅ Embedding model loaded")
# #         except Exception as e:
# #             print(f"❌ Failed to load embedding model: {e}")
# #             return False

# #         if GROQ_API_KEY:
# #             try:
# #                 self.groq_client = Groq(api_key=GROQ_API_KEY)
# #                 print("✅ Groq client initialized")
# #             except Exception as e:
# #                 print(f"❌ Failed to initialize Groq client: {e}")
# #         else:
# #             print("⚠️ GROQ_API_KEY not found")

# #         self.load_and_build_index()
# #         return True

# #     def load_multilingual_data(self):
# #         """Load data from all language folders and combine"""
# #         all_data = []
        
# #         # Try language-specific folders first
# #         for lang_folder in ["en", "fr", "ar"]:
# #             folder_path = f"./data/{lang_folder}/"
# #             files = glob.glob(f"{folder_path}use_case_*.json")
            
# #             for file in files:
# #                 try:
# #                     with open(file, "r", encoding="utf-8") as f:
# #                         data = json.load(f)
# #                     if isinstance(data, list):
# #                         all_data.extend(data)
# #                     else:
# #                         all_data.append(data)
# #                     print(f"Loaded {file}")
# #                 except Exception as e:
# #                     print(f"Error loading {file}: {e}")
        
# #         # Fallback to root data folder
# #         if not all_data:
# #             files = glob.glob("./data/use_case_*.json")
# #             for file in files:
# #                 try:
# #                     with open(file, "r", encoding="utf-8") as f:
# #                         data = json.load(f)
# #                     if isinstance(data, list):
# #                         all_data.extend(data)
# #                     else:
# #                         all_data.append(data)
# #                     print(f"Loaded {file}")
# #                 except Exception as e:
# #                     print(f"Error loading {file}: {e}")
        
# #         print(f"Total items loaded: {len(all_data)}")
# #         return all_data

# #     def create_chunks_with_type_filtering(self, data):
# #         """Create chunks with type information for B2B/B2C filtering"""
# #         chunks = []
# #         for i, entry in enumerate(data):
# #             # Determine the type(s) for this entry
# #             entry_types = []
# #             if 'type' in entry:
# #                 if isinstance(entry['type'], list):
# #                     entry_types = entry['type']  # e.g., ["B2C", "B2B"] for MIFI
# #                 else:
# #                     entry_types = [entry['type']]  # e.g., ["B2C"] or ["B2B"]
# #             else:
# #                 # Default to both if no type specified
# #                 entry_types = ["B2C", "B2B"]
            
# #             # Build comprehensive text from entry
# #             text_parts = []
# #             for k, v in entry.items():
# #                 if k == 'type':  # Skip the type field from content
# #                     continue
# #                 if isinstance(v, (str, int, float)):
# #                     text_parts.append(f"{k}: {v}")
# #                 elif isinstance(v, list):
# #                     text_parts.append(f"{k}: {', '.join(map(str, v))}")
# #                 elif isinstance(v, dict):
# #                     for sub_k, sub_v in v.items():
# #                         text_parts.append(f"{k}_{sub_k}: {sub_v}")
            
# #             text = " | ".join(text_parts)
            
# #             # Create chunks (same size as before)
# #             for j in range(0, len(text), 300):
# #                 chunk_text = text[j:j+300]
# #                 if len(chunk_text.strip()) > 50:
# #                     chunks.append({
# #                         "id": f"{i}_{j//300}",
# #                         "content": chunk_text,
# #                         "source": entry.get("service", f"doc_{i}"),
# #                         "types": entry_types  # Store the types this chunk applies to
# #                     })
# #         return chunks

# #     def load_and_build_index(self):
# #         """Load data and build single index with type filtering support"""
# #         if not self.embedding_model:
# #             print("❌ Embedding model not available")
# #             return False

# #         try:
# #             print("Building RAG system with B2B/B2C filtering...")
            
# #             # Load all multilingual data
# #             all_data = self.load_multilingual_data()
# #             if not all_data:
# #                 print("No data found!")
# #                 return False
            
# #             # Create chunks with type information
# #             self.chunks = self.create_chunks_with_type_filtering(all_data)
# #             print(f"Created {len(self.chunks)} chunks with type filtering")
            
# #             if not self.chunks:
# #                 print("No chunks created!")
# #                 return False
            
# #             # Build embeddings
# #             print("Building embeddings...")
# #             embeddings = self.embedding_model.encode(
# #                 [c["content"] for c in self.chunks],
# #                 batch_size=32,
# #                 show_progress_bar=True
# #             )
            
# #             # Build FAISS index
# #             dim = embeddings.shape[1]
# #             self.index = faiss.IndexFlatL2(dim)
# #             self.index.add(np.array(embeddings).astype("float32"))
            
# #             print(f"RAG system ready: {len(self.chunks)} chunks, {dim} dimensions")
# #             return True
            
# #         except Exception as e:
# #             print(f"RAG build failed: {e}")
# #             return False

# #     def search_context_with_type_filter(self, query: str, assistant_type: str, top_k=MAX_RESULTS):
# #         """Search function with B2B/B2C filtering"""
# #         if not self.index or not self.embedding_model:
# #             return []
        
# #         try:
# #             q_vec = self.embedding_model.encode([query])
# #             D, I = self.index.search(np.array(q_vec).astype("float32"), top_k * 2)  # Get more results to filter
            
# #             results = []
# #             for distance, idx in zip(D[0], I[0]):
# #                 if idx < len(self.chunks):
# #                     chunk = self.chunks[idx]
                    
# #                     # Filter based on assistant type
# #                     if assistant_type in chunk["types"]:
# #                         results.append(chunk["content"])
                        
# #                         # Stop when we have enough results
# #                         if len(results) >= top_k:
# #                             break
            
# #             print(f"🔍 Found {len(results)} relevant chunks for {assistant_type} assistant")
# #             return results[:MAX_RESULTS]
            
# #         except Exception as e:
# #             print(f"Search error: {e}")
# #             return []
    
# #     def create_chunks(self, data):
# #         """Create chunks like in your notebook (fallback method for backward compatibility)"""
# #         chunks = []
# #         for i, entry in enumerate(data):
# #             # Build comprehensive text from entry
# #             text_parts = []
# #             for k, v in entry.items():
# #                 if isinstance(v, (str, int, float)):
# #                     text_parts.append(f"{k}: {v}")
# #                 elif isinstance(v, list):
# #                     text_parts.append(f"{k}: {', '.join(map(str, v))}")
# #                 elif isinstance(v, dict):
# #                     for sub_k, sub_v in v.items():
# #                         text_parts.append(f"{k}_{sub_k}: {sub_v}")
            
# #             text = " | ".join(text_parts)
            
# #             # Create chunks (same size as your notebook)
# #             for j in range(0, len(text), 300):
# #                 chunk_text = text[j:j+300]
# #                 if len(chunk_text.strip()) > 50:
# #                     chunks.append({
# #                         "id": f"{i}_{j//300}",
# #                         "content": chunk_text,
# #                         "source": entry.get("service", f"doc_{i}")
# #                     })
# #         return chunks
    
# #     def detect_language(self, query: str):
# #         """Enhanced language detection with fallbacks"""
# #         try:
# #             detected = detect(query)
# #             print(f"Raw detection result: {detected}")
            
# #             # Map common detection results to our supported languages
# #             language_mapping = {
# #                 'en': 'en',
# #                 'fr': 'fr', 
# #                 'ar': 'ar',
# #             }
            
# #             return language_mapping.get(detected, 'en')  # Default to English
# #         except Exception as e:
# #             print(f"Language detection failed: {e}")
# #             return "en"  # Default to English on failure
    
# #     def map_ui_language_to_response_language(self, ui_language: str) -> str:
# #         """Map UI language codes to response language codes"""
# #         language_map = {
# #             "en-US": "en",
# #             "fr-FR": "fr", 
# #             "ar-SA": "ar"
# #         }
# #         return language_map.get(ui_language, "en")
    
# #     @lru_cache(maxsize=1000)
# #     def translate_query(self, query: str, target_lang="en"):
# #         """Translation function"""
# #         if not self.groq_client:
# #             return query
            
# #         try:
# #             response = self.groq_client.chat.completions.create(
# #                 model="llama-3.1-70b-versatile",
# #                 messages=[
# #                     {"role": "system", "content": f"Translate this into {target_lang} only, without explanations."},
# #                     {"role": "user", "content": query}
# #                 ],
# #                 temperature=0.0,
# #                 max_tokens=200
# #             )
# #             return response.choices[0].message.content.strip()
# #         except Exception as e:
# #             print(f"Translation error: {e}")
# #             return query
    
# #     def search_context(self, query: str, top_k=MAX_RESULTS):
# #         """Search function (fallback for backward compatibility)"""
# #         if not self.index or not self.embedding_model:
# #             return []
        
# #         try:
# #             q_vec = self.embedding_model.encode([query])
# #             D, I = self.index.search(np.array(q_vec).astype("float32"), top_k)
            
# #             results = []
# #             for distance, idx in zip(D[0], I[0]):
# #                 if idx < len(self.chunks):
# #                     results.append(self.chunks[idx]["content"])
            
# #             return results[:MAX_RESULTS]
# #         except Exception as e:
# #             print(f"Search error: {e}")
# #             return []

# #     def get_response(self, query: str, ui_language: str = "en-US", assistant_name: str = "Amira") -> str:
# #         """Generate response with B2B/B2C filtering based on assistant"""
# #         if not self.groq_client:
# #             return self._get_fallback_response(ui_language)

# #         # Validate inputs
# #         if not query or not query.strip():
# #             return self._get_fallback_response(ui_language, "empty_query")
        
# #         if len(query) > 5000:
# #             query = query[:5000] + "..."
        
# #         # Determine assistant type
# #         assistant_type = "B2B" if assistant_name == "Slah" else "B2C"
# #         print(f"🤖 Assistant: {assistant_name} ({assistant_type})")
        
# #         # Map UI language to response language
# #         target_response_lang = self.map_ui_language_to_response_language(ui_language)
# #         print(f"🌍 UI Language: {ui_language} → Target Response: {target_response_lang}")
        
# #         # Handle conversation context
# #         is_conversation_context = "Previous conversation:" in query or ("User:" in query and "AI:" in query)
        
# #         if is_conversation_context:
# #             lines = query.split('\n')
# #             current_message = ""
# #             for line in lines:
# #                 if line.startswith("Current user message:"):
# #                     current_message = line.replace("Current user message:", "").strip()
# #                     break
# #             search_query = current_message if current_message else query
# #             print(f"🔍 Using conversation context. Current message: {current_message[:50] if current_message else 'N/A'}...")
# #         else:
# #             search_query = query
# #             print(f"🔍 Single message query: {search_query[:50] if search_query else 'N/A'}...")
        
# #         # Detect and translate query if needed
# #         detected_lang = self.detect_language(search_query)
# #         print(f"🔍 Detected query language: {detected_lang}")
        
# #         if detected_lang == "ar":
# #             translated_search = self.translate_query(search_query, "en")
# #             print(f"🔄 Translated for search: {translated_search[:50] if translated_search else 'N/A'}...")
# #         else:
# #             translated_search = search_query
        
# #         # Search with type filtering
# #         context_results = self.search_context_with_type_filter(translated_search, assistant_type)
# #         context = "\n".join(context_results)
        
# #         # If no relevant context found, provide assistant-specific fallback
# #         if not context_results:
# #             print(f"⚠️ No relevant {assistant_type} content found for query")
# #             if assistant_type == "B2B":
# #                 fallback_message = {
# #                     "en": "I specialize in business solutions. This query seems to be about consumer services. Please contact our customer service team for personal account assistance.",
# #                     "fr": "Je me spécialise dans les solutions d'entreprise. Cette requête semble concerner les services aux consommateurs. Veuillez contacter notre équipe de service client.",
# #                     "ar": "أختص في الحلول التجارية. يبدو أن هذا الاستفسار يتعلق بخدمات المستهلكين. يرجى الاتصال بفريق خدمة العملاء."
# #                 }
# #             else:  # B2C
# #                 fallback_message = {
# #                     "en": "I help with personal customer services. For business solutions and enterprise services, please contact our business solutions team.",
# #                     "fr": "J'aide avec les services clients personnels. Pour les solutions d'entreprise, veuillez contacter notre équipe de solutions d'affaires.",
# #                     "ar": "أساعد في خدمات العملاء الشخصية. للحلول التجارية وخدمات المؤسسات، يرجى الاتصال بفريق الحلول التجارية."
# #                 }
            
# #             return fallback_message.get(target_response_lang, fallback_message["en"])
        
# #         # Create language-specific response instructions
# #         language_instructions = {
# #             "en": "Answer in English only. Be conversational and natural.",
# #             "fr": "Répondez uniquement en français. Soyez conversationnel et naturel.", 
# #             "ar": "أجب باللغة العربية فقط. كن محاوراً وطبيعياً."
# #         }
        
# #         lang_instruction = language_instructions.get(target_response_lang, language_instructions["en"])
        
# #         # Build assistant-specific prompt
# #         assistant_context = {
# #             "B2B": "You are Slah, a business solutions expert for Ooredoo. You help with enterprise services, corporate accounts, and business solutions.",
# #             "B2C": "You are Amira, a customer service assistant for Ooredoo. You help individual customers with personal accounts, mobile services, and consumer products."
# #         }
        
# #         # Build the enhanced prompt
# #         if is_conversation_context:
# #             prompt = f"""You are {assistant_name}, {assistant_context[assistant_type]}

# # LANGUAGE: {lang_instruction}

# # CONVERSATION SO FAR:
# # {query}

# # Behavior rules:
# # - Keep answers very short (max 2 sentences, <30 words).
# # - Speak like a call center agent, natural and concise.
# # - Only help with {assistant_type} matters.
# # - If asked about {"consumer services" if assistant_type == "B2B" else "business solutions"}, politely redirect.

# # KNOWLEDGE BASE ({assistant_type} content only):
# # {context}

# # Customer asked: {search_query}"""
# #         else:
# #             prompt = f"""You are {assistant_name}, {assistant_context[assistant_type]}

# # LANGUAGE: {lang_instruction}

# # Only help with {assistant_type} services. If asked about {"consumer services" if assistant_type == "B2B" else "business solutions"}, politely redirect.

# # KNOWLEDGE BASE ({assistant_type} content only):
# # {context}

# # Customer asked: {query}"""
        
# #         try:
# #             response = self.groq_client.chat.completions.create(
# #                 model=LLM_MODEL,
# #                 messages=[{"role": "user", "content": prompt}],
# #                 max_tokens=500,
# #                 temperature=0.0,
# #                 timeout=30
# #             )
            
# #             result = response.choices[0].message.content.strip()
            
# #             if len(result) > 2000:
# #                 result = result[:2000] + "... [Response truncated for clarity]"
            
# #             print(f"✅ Generated {assistant_type} response from {assistant_name}: {result[:50] if result else 'N/A'}...")
# #             return result if result else self._get_fallback_response(target_response_lang)
            
# #         except Exception as e:
# #             print(f"Groq API error: {e}")
# #             return self._get_fallback_response(target_response_lang, "api_error")

# #     def _get_fallback_response(self, ui_language: str, error_type: str = "general"):
# #         """Provide fallback responses based on language"""
# #         fallbacks = {
# #             "en-US": {
# #                 "general": "I'm having technical difficulties. Please try again in a moment.",
# #                 "empty_query": "I didn't receive your question clearly. Could you please repeat it?",
# #                 "api_error": "I'm currently experiencing connectivity issues. Please try again shortly."
# #             },
# #             "fr-FR": {
# #                 "general": "Je rencontre des difficultés techniques. Veuillez réessayer dans un moment.",
# #                 "empty_query": "Je n'ai pas bien reçu votre question. Pourriez-vous la répéter?",
# #                 "api_error": "Je rencontre actuellement des problèmes de connectivité. Veuillez réessayer bientôt."
# #             },
# #             "ar-SA": {
# #                 "general": "أواجه مشاكل تقنية. يرجى المحاولة مرة أخرى.",
# #                 "empty_query": "لم أستقبل سؤالك بوضوح. هل يمكنك إعادته؟",
# #                 "api_error": "أواجه حاليًا مشاكل في الاتصال. يرجى المحاولة مرة أخرى قريبًا."
# #             }
# #         }
        
# #         lang = ui_language.split("-")[0] if "-" in ui_language else ui_language
# #         return fallbacks.get(ui_language, fallbacks.get(lang, fallbacks["en-US"])).get(error_type, fallbacks["en-US"]["general"])
# class ImprovedRAGSystem:
#     def __init__(self):
#         self.embedding_model = None
#         self.groq_client = None
#         self.index = None
#         self.chunks = []
#         self.initialize_models()

#     def initialize_models(self):
#         """Initialize models with error handling"""
#         try:
#             print("Initializing embedding model...")
#             self.embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
#             print("✅ Embedding model loaded")
#         except Exception as e:
#             print(f"❌ Failed to load embedding model: {e}")
#             return False

#         if GROQ_API_KEY:
#             try:
#                 self.groq_client = Groq(api_key=GROQ_API_KEY)
#                 print("✅ Groq client initialized")
#             except Exception as e:
#                 print(f"❌ Failed to initialize Groq client: {e}")
#         else:
#             print("⚠️ GROQ_API_KEY not found")

#         self.load_and_build_index()
#         return True

#     def load_multilingual_data(self):
#         """Load data from all language folders and combine"""
#         all_data = []
        
#         # Try language-specific folders first
#         for lang_folder in ["en", "fr", "ar"]:
#             folder_path = f"./data/{lang_folder}/"
#             files = glob.glob(f"{folder_path}use_case_*.json")
            
#             for file in files:
#                 try:
#                     with open(file, "r", encoding="utf-8") as f:
#                         data = json.load(f)
#                     if isinstance(data, list):
#                         all_data.extend(data)
#                     else:
#                         all_data.append(data)
#                     print(f"Loaded {file}")
#                 except Exception as e:
#                     print(f"Error loading {file}: {e}")
        
#         # Fallback to root data folder
#         if not all_data:
#             files = glob.glob("./data/use_case_*.json")
#             for file in files:
#                 try:
#                     with open(file, "r", encoding="utf-8") as f:
#                         data = json.load(f)
#                     if isinstance(data, list):
#                         all_data.extend(data)
#                     else:
#                         all_data.append(data)
#                     print(f"Loaded {file}")
#                 except Exception as e:
#                     print(f"Error loading {file}: {e}")
        
#         print(f"Total items loaded: {len(all_data)}")
#         return all_data
    
#     def create_chunks(self, data):
#         """Create chunks like in your notebook"""
#         chunks = []
#         for i, entry in enumerate(data):
#             # Build comprehensive text from entry
#             text_parts = []
#             for k, v in entry.items():
#                 if isinstance(v, (str, int, float)):
#                     text_parts.append(f"{k}: {v}")
#                 elif isinstance(v, list):
#                     text_parts.append(f"{k}: {', '.join(map(str, v))}")
#                 elif isinstance(v, dict):
#                     for sub_k, sub_v in v.items():
#                         text_parts.append(f"{k}_{sub_k}: {sub_v}")
            
#             text = " | ".join(text_parts)
            
#             # Create chunks (same size as your notebook)
#             for j in range(0, len(text), 300):
#                 chunk_text = text[j:j+300]
#                 if len(chunk_text.strip()) > 50:
#                     chunks.append({
#                         "id": f"{i}_{j//300}",
#                         "content": chunk_text,
#                         "source": entry.get("service", f"doc_{i}")
#                     })
#         return chunks
    
#     def load_and_build_index(self):
#         """Load data and build single index like your notebook"""
#         if not self.embedding_model:
#             print("❌ Embedding model not available")
#             return False

#         try:
#             print("Building RAG system...")
            
#             # Load all multilingual data
#             all_data = self.load_multilingual_data()
#             if not all_data:
#                 print("No data found!")
#                 return False
            
#             # Create chunks
#             self.chunks = self.create_chunks(all_data)
#             print(f"Created {len(self.chunks)} chunks")
            
#             if not self.chunks:
#                 print("No chunks created!")
#                 return False
            
#             # Build embeddings (same as your notebook)
#             print("Building embeddings...")
#             embeddings = self.embedding_model.encode(
#                 [c["content"] for c in self.chunks],
#                 batch_size=32,  # Reduced for stability
#                 show_progress_bar=True
#             )
            
#             # Build FAISS index
#             dim = embeddings.shape[1]
#             self.index = faiss.IndexFlatL2(dim)
#             self.index.add(np.array(embeddings).astype("float32"))
            
#             print(f"RAG system ready: {len(self.chunks)} chunks, {dim} dimensions")
#             return True
            
#         except Exception as e:
#             print(f"RAG build failed: {e}")
#             return False
    
#     def detect_language(self, query: str):
#         """Enhanced language detection with fallbacks"""
#         try:
#             detected = detect(query)
#             print(f"Raw detection result: {detected}")
            
#             # Map common detection results to our supported languages
#             language_mapping = {
#                 'en': 'en',
#                 'fr': 'fr', 
#                 'ar': 'ar',
#             }
            
#             return language_mapping.get(detected, 'en')  # Default to English
#         except Exception as e:
#             print(f"Language detection failed: {e}")
#             return "en"  # Default to English on failure
    
#     def map_ui_language_to_response_language(self, ui_language: str) -> str:
#         """Map UI language codes to response language codes"""
#         language_map = {
#             "en-US": "en",
#             "fr-FR": "fr", 
#             "ar-SA": "ar"
#         }
#         return language_map.get(ui_language, "en")
    
#     @lru_cache(maxsize=1000)
#     def translate_query(self, query: str, target_lang="en"):
#         """Translation function"""
#         if not self.groq_client:
#             return query
            
#         try:
#             response = self.groq_client.chat.completions.create(
#                 model="llama-3.1-70b-versatile",
#                 messages=[
#                     {"role": "system", "content": f"Translate this into {target_lang} only, without explanations."},
#                     {"role": "user", "content": query}
#                 ],
#                 temperature=0.0,
#                 max_tokens=200
#             )
#             return response.choices[0].message.content.strip()
#         except Exception as e:
#             print(f"Translation error: {e}")
#             return query
    
#     def search_context(self, query: str, top_k=MAX_RESULTS):
#         """Search function"""
#         if not self.index or not self.embedding_model:
#             return []
        
#         try:
#             q_vec = self.embedding_model.encode([query])
#             D, I = self.index.search(np.array(q_vec).astype("float32"), top_k)
            
#             results = []
#             for distance, idx in zip(D[0], I[0]):
#                 if idx < len(self.chunks):
#                     results.append(self.chunks[idx]["content"])
            
#             return results[:MAX_RESULTS]
#         except Exception as e:
#             print(f"Search error: {e}")
#             return []
    
#     def get_response(self, query: str, ui_language: str = "en-US", assistant_name: str = "Amira") -> str:
#         """Generate response with proper language handling and conversation memory"""
#         if not self.groq_client:
#             return self._get_fallback_response(ui_language)

#         # Validate inputs
#         if not query or not query.strip():
#             return self._get_fallback_response(ui_language, "empty_query")
        
#         if len(query) > 5000:  # Reasonable limit
#             query = query[:5000] + "..."
        
#         # Step 1: Map UI language to our internal language codes
#         target_response_lang = self.map_ui_language_to_response_language(ui_language)
#         print(f"🌍 UI Language: {ui_language} → Target Response: {target_response_lang}")
        
#         # Step 2: Check if this is a conversation context (contains previous messages)
#         is_conversation_context = "Previous conversation:" in query or ("User:" in query and "AI:" in query)
        
#         if is_conversation_context:
#             # Extract the current user message from conversation context
#             lines = query.split('\n')
#             current_message = ""
#             for line in lines:
#                 if line.startswith("Current user message:"):
#                     current_message = line.replace("Current user message:", "").strip()
#                     break
            
#             # Use the full conversation context for search if no current message found
#             search_query = current_message if current_message else query
#             print(f"🔍 Using conversation context. Current message: {current_message[:50] if current_message else 'N/A'}...")
#         else:
#             search_query = query
#             print(f"🔍 Single message query: {search_query[:50] if search_query else 'N/A'}...")
        
#         # Step 3: Detect the language of the search query
#         detected_lang = self.detect_language(search_query)
#         print(f"🔍 Detected query language: {detected_lang}")
        
#         # Step 4: Prepare search query (translate to English if needed for better search)
#         if detected_lang == "ar":
#             # Arabic → translate to English for search
#             translated_search = self.translate_query(search_query, "en")
#             print(f"🔄 Translated for search: {translated_search[:50] if translated_search else 'N/A'}...")
#         else:
#             # English/French → use as is
#             translated_search = search_query
        
#         # Step 5: Search for context
#         context_results = self.search_context(translated_search)
#         context = "\n".join(context_results)
        
#         # Step 6: Create language-specific response instructions
#         language_instructions = {
#             "en": "Answer in English only. Be conversational and natural.",
#             "fr": "Répondez uniquement en français. Soyez conversationnel et naturel.", 
#             "ar": "أجب باللغة العربية فقط. كن محاوراً وطبيعياً."
#         }
        
#         lang_instruction = language_instructions.get(target_response_lang, language_instructions["en"])
        
#         # Step 7: Build the enhanced prompt with memory instructions
#         if is_conversation_context:
#             # Use gender-aware system prompt
#             assistant_id = 1 if assistant_name == "Slah" else 2
#             base_prompt = get_gender_aware_system_prompt(assistant_id, ui_language)
            
#             prompt = f"""{base_prompt}
# Customer asked: {search_query}"""
#         else:
#             # Use gender-aware system prompt
#             assistant_id = 1 if assistant_name == "Slah" else 2
#             base_prompt = get_gender_aware_system_prompt(assistant_id, ui_language)
            
#             prompt = f"""{base_prompt}
# Customer asked: {query}"""
        
#         try:
#             response = self.groq_client.chat.completions.create(
#                 model=LLM_MODEL,
#                 messages=[{"role": "user", "content": prompt}],
#                 max_tokens=500,
#                 temperature=0.0,
#                 timeout=30
#             )
            
#             result = response.choices[0].message.content.strip()
            
#             # Prevent extremely long responses
#             if len(result) > 2000:
#                 result = result[:2000] + "... [Response truncated for clarity]"
            
#             print(f"✅ Generated response from {assistant_name} in {target_response_lang}: {result[:50] if result else 'N/A'}...")
#             return result if result else self._get_fallback_response(target_response_lang)
            
#         except Exception as e:
#             print(f"Groq API error: {e}")
#             return self._get_fallback_response(target_response_lang, "api_error")

#     def _get_fallback_response(self, ui_language: str, error_type: str = "general"):
#         """Provide fallback responses based on language"""
#         fallbacks = {
#             "en-US": {
#                 "general": "I'm having technical difficulties. Please try again in a moment.",
#                 "empty_query": "I didn't receive your question clearly. Could you please repeat it?",
#                 "api_error": "I'm currently experiencing connectivity issues. Please try again shortly."
#             },
#             "fr-FR": {
#                 "general": "Je rencontre des difficultés techniques. Veuillez réessayer dans un moment.",
#                 "empty_query": "Je n'ai pas bien reçu votre question. Pourriez-vous la répéter?",
#                 "api_error": "Je rencontre actuellement des problèmes de connectivité. Veuillez réessayer bientôt."
#             },
#             "ar-SA": {
#                 "general": "أواجه مشاكل تقنية. يرجى المحاولة مرة أخرى.",
#                 "empty_query": "لم أستقبل سؤالك بوضوح. هل يمكنك إعادته؟",
#                 "api_error": "أواجه حاليًا مشاكل في الاتصال. يرجى المحاولة مرة أخرى قريبًا."
#             }
#         }
        
#         lang = ui_language.split("-")[0] if "-" in ui_language else ui_language
#         return fallbacks.get(ui_language, fallbacks.get(lang, fallbacks["en-US"])).get(error_type, fallbacks["en-US"]["general"])

# # Helper functions
# def normalize_phone_number(phone: str) -> str:
#     """Normalize phone number format"""
#     # Remove all non-digits
#     digits_only = ''.join(filter(str.isdigit, phone))
    
#     # Add country code if missing
#     if len(digits_only) == 8 and digits_only.startswith('2'):  # Tunisia local number
#         return f"+216{digits_only}"
#     elif len(digits_only) == 11 and digits_only.startswith('216'):  # Tunisia with country code
#         return f"+{digits_only}"
#     elif not phone.startswith('+'):
#         return f"+{digits_only}"
#     else:
#         return phone

# def identify_caller_by_phone(phone: str) -> CallerInfo:
#     """Identify if caller is a registered user"""
#     if not db:
#         return CallerInfo(phone=phone, is_registered=False)
    
#     try:
#         # Normalize phone number
#         normalized_phone = normalize_phone_number(phone)
        
#         # Look up user in database
#         user = db.find_user_by_phone(normalized_phone)
        
#         if user:
#             print(f"✅ Recognized caller: {user['full_name']} ({user['email']})")
#             return CallerInfo(
#                 phone=normalized_phone,
#                 is_registered=True,
#                 user_id=user['user_id'],
#                 full_name=user['full_name'],
#                 email=user['email']
#             )
#         else:
#             print(f"📞 Unknown caller: {normalized_phone}")
#             return CallerInfo(phone=normalized_phone, is_registered=False)
            
#     except Exception as e:
#         print(f"❌ Error identifying caller: {e}")
#         return CallerInfo(phone=phone, is_registered=False)

# def get_or_create_call_session(call_sid: str, caller_phone: str) -> CallSession:
#     """Get existing call session or create new one"""
#     if call_sid not in call_sessions:
#         call_sessions[call_sid] = CallSession(call_sid, caller_phone)
#     return call_sessions[call_sid]

# def extract_user_name(input_text: str) -> Optional[str]:
#     """Enhanced name extraction with multiple patterns"""
#     # Convert to lowercase for pattern matching
#     text_lower = input_text.lower()
    
#     # Multiple patterns for name extraction
#     name_patterns = [
#         # English patterns
#         r"my name is (\w+(?:\s+\w+)*)",
#         r"i'm (\w+(?:\s+\w+)*)",
#         r"i am (\w+(?:\s+\w+)*)", 
#         r"call me (\w+(?:\s+\w+)*)",
#         r"this is (\w+(?:\s+\w+)*)",
#         r"i'm called (\w+(?:\s+\w+)*)",
        
#         # French patterns
#         r"je m'appelle (\w+(?:\s+\w+)*)",
#         r"mon nom est (\w+(?:\s+\w+)*)",
#         r"je suis (\w+(?:\s+\w+)*)",
#         r"c'est (\w+(?:\s+\w+)*)",
        
#         # Arabic patterns (transliterated)
#         r"ismi (\w+(?:\s+\w+)*)",
#         r"ana (\w+(?:\s+\w+)*)",
        
#         # Common introductions
#         r"hello,?\s*i'?m (\w+(?:\s+\w+)*)",
#         r"hi,?\s*i'?m (\w+(?:\s+\w+)*)",
#         r"bonjour,?\s*je suis (\w+(?:\s+\w+)*)",
#     ]
    
#     for pattern in name_patterns:
#         match = re.search(pattern, text_lower, re.IGNORECASE)
#         if match:
#             name = match.group(1).strip()
#             # Filter out common non-names
#             if name not in ['good', 'fine', 'okay', 'well', 'here', 'calling', 'looking', 'trying']:
#                 return name.title()  # Capitalize properly
    
#     return None

# def extract_issue_type(input_text: str) -> Optional[str]:
#     """Enhanced issue type extraction"""
#     text_lower = input_text.lower()
    
#     # Define issue patterns with keywords
#     issue_patterns = [
#         {
#             "type": "billing",
#             "keywords": [
#                 "bill", "billing", "payment", "charge", "invoice", "cost", "price", "money", "pay", "owed", "debt",
#                 "facture", "paiement", "coût", "prix", "argent",  # French
#                 "فاتورة", "دفع", "سعر", "مال", "تكلفة"  # Arabic
#             ]
#         },
#         {
#             "type": "internet",
#             "keywords": [
#                 "internet", "wifi", "wi-fi", "connection", "slow", "outage", "speed", "broadband", "network",
#                 "connexion", "lent", "panne", "vitesse",  # French
#                 "إنترنت", "واي فاي", "اتصال", "بطيء", "سرعة", "شبكة"  # Arabic
#             ]
#         },
#         {
#             "type": "mobile",
#             "keywords": [
#                 "phone", "mobile", "cell", "call", "text", "sms", "voicemail", "signal", "roaming",
#                 "téléphone", "mobile", "appel", "texto", "signal",  # French
#                 "هاتف", "جوال", "مكالمة", "رسالة", "إشارة"  # Arabic
#             ]
#         },
#         {
#             "type": "technical",
#             "keywords": [
#                 "technical", "support", "help", "problem", "issue", "error", "bug", "fix", "repair", "broken",
#                 "technique", "aide", "problème", "erreur", "réparer",  # French
#                 "تقني", "مساعدة", "مشكلة", "خطأ", "إصلاح"  # Arabic
#             ]
#         },
#         {
#             "type": "account",
#             "keywords": [
#                 "account", "login", "password", "profile", "settings", "personal", "information", "data",
#                 "compte", "connexion", "mot de passe", "profil", "paramètres",  # French
#                 "حساب", "تسجيل دخول", "كلمة مرور", "ملف شخصي", "إعدادات"  # Arabic
#             ]
#         },
#         {
#             "type": "service",
#             "keywords": [
#                 "service", "plan", "package", "subscription", "upgrade", "downgrade", "change", "switch",
#                 "forfait", "abonnement", "amélioration",  # French
#                 "خدمة", "باقة", "اشتراك", "ترقية", "تغيير"  # Arabic
#             ]
#         }
#     ]
    
#     # Count matches for each issue type
#     issue_scores = {}
#     for issue in issue_patterns:
#         score = 0
#         for keyword in issue["keywords"]:
#             if keyword in text_lower:
#                 score += 1
#         if score > 0:
#             issue_scores[issue["type"]] = score
    
#     # Return the issue type with highest score
#     if issue_scores:
#         return max(issue_scores, key=issue_scores.get)
    
#     return None

# def generate_jwt_token(user_data: dict) -> str:
#     """Generate JWT token for authentication"""
#     payload = {
#         "user_id": user_data["user_id"],
#         "email": user_data["email"],
#         "role": user_data["role"],
#         "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
#     }
#     return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

# def verify_jwt_token(token: str) -> dict:
#     """Verify and decode JWT token"""
#     try:
#         payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
#         return payload
#     except jwt.ExpiredSignatureError:
#         raise HTTPException(status_code=401, detail="Token expired")
#     except jwt.InvalidTokenError:
#         raise HTTPException(status_code=401, detail="Invalid token")

# async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
#     """Dependency to get current user from JWT token"""
#     token = credentials.credentials
#     try:
#         payload = verify_jwt_token(token)
#         return payload
#     except:
#         raise HTTPException(status_code=401, detail="Invalid authentication")

# async def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
#     """Get user if token is provided, otherwise return None (for guest access)"""
#     if authorization and authorization.startswith("Bearer "):
#         token = authorization.split(" ")[1]
#         try:
#             return verify_jwt_token(token)
#         except:
#             return None
#     return None

# async def save_audio_file(audio_data: str, session_id: str) -> Optional[str]:
#     """Save base64 audio data to file with enhanced security and error handling"""
#     if not audio_data or len(audio_data) < 50:
#         print("⚠️ Invalid audio data provided")
#         return None
    
#     try:
#         # Validate session_id format
#         if not re.match(r'^[a-zA-Z0-9-_]+$', session_id):
#             print("❌ Invalid session ID format")
#             return None
            
#         # Create recordings directory if it doesn't exist
#         os.makedirs(AUDIO_STORAGE_PATH, exist_ok=True)
#         print(f"📁 Audio storage path ensured: {AUDIO_STORAGE_PATH}")
        
#         # Generate secure filename
#         timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#         safe_session = re.sub(r'[^a-zA-Z0-9-_]', '', session_id[:8])
#         filename = f"{safe_session}_{timestamp}.webm"
#         filepath = os.path.join(AUDIO_STORAGE_PATH, filename)
        
#         # Clean base64 string (remove data URL prefix if present)
#         clean_audio_data = audio_data
#         if audio_data.startswith('data:'):
#             # Handle data URLs like "data:audio/webm;codecs=opus;base64,UklGRiQ..."
#             if ';base64,' in audio_data:
#                 clean_audio_data = audio_data.split(';base64,')[1]
#             else:
#                 clean_audio_data = audio_data.split(',')[1]
        
#         # Validate base64 format
#         if not re.match(r'^[A-Za-z0-9+/]*={0,2}$', clean_audio_data):
#             print("❌ Invalid base64 format")
#             return None
        
#         print(f"🔄 Processing audio data - Original size: {len(audio_data)}, Clean size: {len(clean_audio_data)}")
        
#         # Add padding if needed
#         missing_padding = len(clean_audio_data) % 4
#         if missing_padding:
#             clean_audio_data += '=' * (4 - missing_padding)
        
#         # Decode base64 and validate
#         try:
#             audio_bytes = base64.b64decode(clean_audio_data)
#             print(f"✅ Decoded audio size: {len(audio_bytes)} bytes")
            
#             # Size validation (100 bytes minimum, 10MB maximum)
#             if len(audio_bytes) < 100:
#                 print(f"⚠️ Audio data too small: {len(audio_bytes)} bytes")
#                 return None
            
#             if len(audio_bytes) > 10 * 1024 * 1024:  # 10MB limit
#                 print(f"❌ Audio file too large: {len(audio_bytes)} bytes")
#                 return None
                
#         except Exception as decode_error:
#             print(f"❌ Base64 decode error: {decode_error}")
#             return None
        
#         # Save to file securely
#         with open(filepath, "wb") as f:
#             f.write(audio_bytes)
        
#         print(f"💾 Audio saved: {filename} ({len(audio_bytes)} bytes)")
        
#         # Verify file was created and has content
#         if os.path.exists(filepath):
#             file_size = os.path.getsize(filepath)
#             print(f"✅ File verified: {filepath} ({file_size} bytes)")
            
#             if file_size > 0:
#                 return filename
#             else:
#                 print(f"❌ File is empty: {filepath}")
#                 os.remove(filepath)  # Remove empty file
#                 return None
#         else:
#             print(f"❌ File not found after save: {filepath}")
#             return None
            
#     except Exception as e:
#         print(f"❌ Error saving audio: {e}")
#         import traceback
#         traceback.print_exc()
#         return None

# async def save_ai_audio_from_edge_tts(
#     text: str, 
#     voice_name: str, 
#     session_id: str,
#     assistant_name: str = "Amira",
#     language: str = "en-US"
# ) -> Optional[str]:
#     """
#     Generate and save AI audio using Edge TTS (FREE!)
    
#     Args:
#         text: Text to convert to speech
#         voice_name: Edge TTS voice name (e.g., "en-US-JennyNeural")
#         session_id: Session ID for filename
#         assistant_name: "Slah" or "Amira" for pronunciation fixes
#         language: "en-US", "fr-FR", or "ar-SA"
    
#     Returns:
#         Filename of saved audio or None if failed
#     """
    
#     if not text or not text.strip():
#         print("⚠️ No text provided for audio generation")
#         return None
    
#     try:
#         print(f"🎤 Generating AI audio with Edge TTS for: {text[:50]}...")
        
#         # Apply pronunciation fixes before TTS
#         fixed_text = apply_pronunciation_fixes(text, assistant_name, language)
#         print(f"🔧 Text after pronunciation fixes: {fixed_text[:50]}...")
        
#         # Generate speech using Edge TTS
#         communicate = edge_tts.Communicate(fixed_text, voice_name)
        
#         # Save AI audio file
#         timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
#         safe_session = re.sub(r'[^a-zA-Z0-9-_]', '', session_id[:8])
#         filename = f"{safe_session}_ai_{timestamp}.mp3"
#         filepath = os.path.join(AUDIO_STORAGE_PATH, filename)
        
#         # Save the audio
#         await communicate.save(filepath)
        
#         # Get file size
#         file_size = os.path.getsize(filepath)
#         print(f"✅ AI audio saved: {filename} ({file_size} bytes) using Edge TTS")
        
#         return filename
        
#     except Exception as e:
#         print(f"❌ Error saving AI audio with Edge TTS: {e}")
#         import traceback
#         traceback.print_exc()
#         return None
# async def save_audio_in_background(
#     audio_data: str, 
#     session_id: str, 
#     conversation_id: int,
#     audio_type: str
# ):
#     """Save audio file and update database in background"""
#     try:
#         audio_path = await save_audio_file(audio_data, session_id)
#         if audio_path and db:
#             with db.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     field = "user_audio_path" if audio_type == "user" else "ai_audio_path"
#                     cursor.execute(f"""
#                         UPDATE conversations 
#                         SET {field} = %s 
#                         WHERE id = %s
#                     """, (audio_path, conversation_id))
#                 conn.commit()
#             print(f"✅ {audio_type.title()} audio saved in background: {audio_path}")
#     except Exception as e:
#         print(f"❌ Background audio save failed: {e}")

# async def generate_ai_audio_in_background(
#     text: str,
#     voice_id: str,  # This is the Edge TTS voice name (e.g., "en-US-JennyNeural")
#     session_id: str,
#     conversation_id: int,
#     assistant_name: str = "Amira",
#     language: str = "en-US"
# ):
#     """
#     Generate AI audio using Edge TTS and update database in background
    
#     Args:
#         text: Text to convert to speech
#         voice_id: Edge TTS voice name
#         session_id: Session ID
#         conversation_id: Database conversation ID
#         assistant_name: "Slah" or "Amira"
#         language: "en-US", "fr-FR", or "ar-SA"
#     """
#     try:
#         print(f"🔄 Background audio generation started for conversation {conversation_id}")
        
#         # Use Edge TTS instead of ElevenLabs
#         ai_audio_path = await save_ai_audio_from_edge_tts(
#             text, 
#             voice_id, 
#             session_id,
#             assistant_name,
#             language
#         )
        
#         if ai_audio_path and db:
#             with db.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         UPDATE conversations 
#                         SET ai_audio_path = %s 
#                         WHERE id = %s
#                     """, (ai_audio_path, conversation_id))
#                 conn.commit()
#             print(f"✅ AI audio saved in background: {ai_audio_path}")
#         else:
#             print(f"⚠️ Audio generation returned None for conversation {conversation_id}")
            
#     except Exception as e:
#         print(f"❌ Background AI audio generation failed: {e}")
#         import traceback
#         traceback.print_exc()


# # Initialize services
# rag_system = ImprovedRAGSystem()
# sms_service = SMSService()
# email_service = EmailService()
# # FastAPI setup
# app = FastAPI(title="Ooredoo AI Assistant (Fixed)", version="3.1")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ============================================
# # AUTHENTICATION ENDPOINTS
# # ============================================

# @app.post("/api/auth/send-verification")
# async def send_verification_code(request: dict):
#     """Send phone verification code"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")

#     phone = request.get("phone")
#     action = request.get("action", "register")  # register, reset_password, login

#     if not phone:
#         raise HTTPException(status_code=400, detail="Phone number is required")

#     # Validate action
#     valid_actions = ["register", "reset_password", "login"]
#     if action not in valid_actions:
#         raise HTTPException(status_code=400, detail=f"Invalid action. Must be one of: {valid_actions}")

#     # Normalize phone number
#     phone = phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
#     if not phone.startswith("+"):
#         if phone.startswith("0"):
#             phone = "+216" + phone[1:]  # Tunisia country code
#         else:
#             phone = "+" + phone

#     try:
#         if action == "register":
#             existing_user = db.find_user_by_phone(phone)
#             if existing_user:
#                 raise HTTPException(status_code=400, detail="Phone number already registered")
#         elif action == "reset_password":
#             user = db.find_user_by_phone(phone)
#             if not user:
#                 raise HTTPException(status_code=404, detail="Phone number not found")

#         verification_code = db.store_verification_code(
#             phone=phone,
#             action=action,
#             user_data=request.get("user_data")
#         )

#         sms_sent = sms_service.send_verification_code(phone, verification_code, action)

#         if sms_sent:
#             return {"message": "Verification code sent", "phone": phone, "expires_in": 600}
#         else:
#             raise HTTPException(status_code=500, detail="Failed to send verification code")

#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"❌ Verification error: {e}")
#         raise HTTPException(status_code=500, detail="Internal server error")

# @app.post("/api/auth/register")
# async def register(request: EnhancedRegisterRequest):
#     """Register new user with phone verification"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")

#     try:
#         if request.phone and request.verification_code:
#             verification_result = db.verify_phone_code(
#                 phone=request.phone,
#                 code=request.verification_code,
#                 action="register"
#             )
#             if not verification_result:
#                 raise HTTPException(status_code=400, detail="Invalid or expired verification code")

#         user_id = db.create_user(
#             email=request.email,
#             password=request.password,
#             phone=request.phone,
#             full_name=request.full_name,
#             phone_verified=bool(request.phone and request.verification_code)
#         )

#         if not user_id:
#             raise HTTPException(status_code=400, detail="Email or phone already exists")

#         return {"message": "User created", "user_id": user_id, "email": request.email}

#     except Exception as e:
#         print(f"❌ Registration error: {e}")
#         raise HTTPException(status_code=500, detail="Internal server error")

# @app.post("/api/auth/login")
# async def login(request: EnhancedLoginRequest):
#     """Login with email or phone"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")

#     try:
#         login_method = "email" if request.email else "phone"
#         identifier = request.email or request.phone

#         user = db.authenticate_user(identifier, request.password, login_method)

#         if not user:
#             raise HTTPException(status_code=401, detail="Invalid credentials")

#         token = generate_jwt_token(user)
#         return {
#             "token": token,
#             "user_id": user["user_id"],
#             "email": user["email"],
#             "phone": user.get("phone"),
#             "role": user["role"],
#             "full_name": user["full_name"]
#         }

#     except Exception as e:
#         print(f"❌ Login error: {e}")
#         raise HTTPException(status_code=500, detail="Authentication service error")

# # @app.post("/api/auth/forgot-password")
# # async def forgot_password(request: dict):
# #     """Initiate password reset process"""
# #     if not db:
# #         raise HTTPException(status_code=500, detail="Database not available")
    
# #     method = request.get("method", "phone")
# #     identifier = request.get("identifier")
    
# #     if not identifier:
# #         raise HTTPException(status_code=400, detail="Phone number is required")
    
# #     try:
# #         user = db.find_user_by_phone(identifier)
        
# #         if not user:
# #             # Don't reveal if phone exists for security
# #             return {"message": "If the account exists, you will receive a reset code"}
        
# #         verification_code = db.store_verification_code(
# #             phone=identifier,
# #             action="reset_password"
# #         )
        
# #         sms_sent = sms_service.send_verification_code(identifier, verification_code, "reset_password")
        
# #         if not sms_sent:
# #             raise HTTPException(status_code=500, detail="Failed to send reset code")
        
# #         return {"message": "Reset code sent successfully"}
        
# #     except HTTPException:
# #         raise
# #     except Exception as e:
# #         print(f"❌ Password reset error: {e}")
# #         raise HTTPException(status_code=500, detail="Internal server error")
# @app.post("/api/auth/forgot-password")
# async def forgot_password(request: dict):
#     """Initiate password reset process with phone or email"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     method = request.get("method", "phone")  # "phone" or "email"
#     identifier = request.get("identifier")
    
#     if not identifier:
#         raise HTTPException(status_code=400, detail=f"{method.title()} is required")
    
#     try:
#         # Find user by phone or email
#         if method == "phone":
#             user = db.find_user_by_phone(identifier)
#         elif method == "email":
#             user = db.find_user_by_email(identifier)
#         else:
#             raise HTTPException(status_code=400, detail="Method must be 'phone' or 'email'")
        
#         if not user:
#             # Don't reveal if account exists for security
#             return {"message": f"If the account exists, you will receive a reset code via {method}"}
        
#         # Generate verification code
#         if method == "phone":
#             verification_code = db.store_verification_code(
#                 phone=identifier,
#                 action="reset_password"
#             )
            
#             # Send SMS
#             sms_sent = sms_service.send_verification_code(identifier, verification_code, "reset_password")
            
#             if not sms_sent:
#                 raise HTTPException(status_code=500, detail="Failed to send reset code")
                
#         elif method == "email":
#             verification_code = db.store_email_verification_code(
#                 email=identifier,
#                 action="reset_password"
#             )
            
#             # Send email
#             email_sent = email_service.send_verification_email(identifier, verification_code, "reset_password")
            
#             if not email_sent:
#                 raise HTTPException(status_code=500, detail="Failed to send reset email")
        
#         return {"message": f"Reset code sent successfully via {method}"}
        
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"❌ Password reset error: {e}")
#         raise HTTPException(status_code=500, detail="Internal server error")

# # @app.post("/api/auth/reset-password")
# # async def reset_password(request: dict):
# #     """Reset password with verification code"""
# #     if not db:
# #         raise HTTPException(status_code=500, detail="Database not available")
    
# #     phone = request.get("phone")
# #     verification_code = request.get("verification_code")
# #     new_password = request.get("new_password")
    
# #     if not all([phone, verification_code, new_password]):
# #         raise HTTPException(status_code=400, detail="Phone, verification code, and new password are required")
    
# #     if len(new_password) < 6:
# #         raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
# #     try:
# #         verification_result = db.verify_phone_code(phone, verification_code, "reset_password")
        
# #         if not verification_result:
# #             raise HTTPException(status_code=400, detail="Invalid or expired verification code")
        
# #         user = db.find_user_by_phone(phone)
# #         if not user:
# #             raise HTTPException(status_code=404, detail="User not found")
        
# #         success = db.update_user_password(user["user_id"], new_password)
        
# #         if success:
# #             return {"message": "Password updated successfully"}
# #         else:
# #             raise HTTPException(status_code=500, detail="Failed to update password")
            
# #     except HTTPException:
# #         raise
# #     except Exception as e:
# #         print(f"❌ Password reset error: {e}")
# #         raise HTTPException(status_code=500, detail="Internal server error")
# @app.post("/api/auth/reset-password") 
# async def reset_password(request: dict):
#     """Reset password with verification code from phone or email"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     phone = request.get("phone")
#     email = request.get("email") 
#     verification_code = request.get("verification_code")
#     new_password = request.get("new_password")
    
#     if not verification_code or not new_password:
#         raise HTTPException(status_code=400, detail="Verification code and new password are required")
    
#     if not (phone or email):
#         raise HTTPException(status_code=400, detail="Either phone or email is required")
        
#     if len(new_password) < 6:
#         raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
#     try:
#         # Verify code based on method used
#         if phone:
#             verification_result = db.verify_phone_code(phone, verification_code, "reset_password")
#             user = db.find_user_by_phone(phone) if verification_result else None
#         else:  # email
#             verification_result = db.verify_email_code(email, verification_code, "reset_password") 
#             user = db.find_user_by_email(email) if verification_result else None
        
#         if not verification_result:
#             raise HTTPException(status_code=400, detail="Invalid or expired verification code")
        
#         if not user:
#             raise HTTPException(status_code=404, detail="User not found")
        
#         # Update password
#         success = db.update_user_password(user["user_id"], new_password)
        
#         if success:
#             return {"message": "Password updated successfully"}
#         else:
#             raise HTTPException(status_code=500, detail="Failed to update password")
            
#     except HTTPException:
#         raise
#     except Exception as e:
#         print(f"❌ Password reset error: {e}")
#         raise HTTPException(status_code=500, detail="Internal server error")
# @app.get("/api/auth/me")
# async def get_me(current_user: dict = Depends(get_current_user)):
#     """Get current user info from token"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     user = db.get_user_by_id(current_user["user_id"])
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
    
#     return user

# # ============================================
# # PROFILE MANAGEMENT ENDPOINTS
# # ============================================

# @app.get("/api/profile")
# async def get_user_profile(current_user: dict = Depends(get_current_user)):
#     """Get current user profile"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     try:
#         user_profile = db.get_user_by_id(current_user["user_id"])
#         if not user_profile:
#             raise HTTPException(status_code=404, detail="User profile not found")
        
#         return user_profile
#     except Exception as e:
#         print(f"❌ Error fetching user profile: {e}")
#         raise HTTPException(status_code=500, detail="Internal server error")

# @app.put("/api/profile/update")
# async def update_user_profile(
#     request: ProfileUpdateRequest,
#     current_user: dict = Depends(get_current_user)
# ):
#     """Update user profile"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     try:
#         # Validate phone format if provided
#         if request.phone:
#             phone = request.phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
#             if not phone.startswith("+"):
#                 if phone.startswith("0"):
#                     phone = "+216" + phone[1:]  # Tunisia country code
#                 else:
#                     phone = "+" + phone
#             request.phone = phone
        
#         # Update user profile in database
#         success = db.update_user_profile(
#             user_id=current_user["user_id"],
#             full_name=request.full_name,
#             phone=request.phone
#         )
        
#         if success:
#             # Get updated profile
#             updated_profile = db.get_user_by_id(current_user["user_id"])
#             return updated_profile
#         else:
#             raise HTTPException(status_code=400, detail="Failed to update profile")
            
#     except Exception as e:
#         print(f"❌ Error updating user profile: {e}")
#         raise HTTPException(status_code=500, detail="Internal server error")

# @app.post("/api/profile/avatar")
# async def update_user_avatar(
#     request: AvatarUpdateRequest,
#     current_user: dict = Depends(get_current_user)
# ):
#     """Update user avatar URL"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     try:
#         success = db.update_user_avatar(current_user["user_id"], request.avatar_url)
        
#         if success:
#             return {
#                 "message": "Avatar updated successfully",
#                 "avatar_url": request.avatar_url
#             }
#         else:
#             raise HTTPException(status_code=400, detail="Failed to update avatar")
            
#     except Exception as e:
#         print(f"❌ Error updating user avatar: {e}")
#         raise HTTPException(status_code=500, detail="Internal server error")

# @app.delete("/api/profile/avatar")
# async def remove_user_avatar(current_user: dict = Depends(get_current_user)):
#     """Remove user avatar"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     try:
#         success = db.update_user_avatar(current_user["user_id"], None)
        
#         if success:
#             return {"message": "Avatar removed successfully"}
#         else:
#             raise HTTPException(status_code=400, detail="Failed to remove avatar")
            
#     except Exception as e:
#         print(f"❌ Error removing user avatar: {e}")
#         raise HTTPException(status_code=500, detail="Internal server error")

# @app.get("/api/profile/stats")
# async def get_user_profile_stats(current_user: dict = Depends(get_current_user)):
#     """Get user profile statistics"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     try:
#         stats = db.get_user_statistics(current_user["user_id"])
#         return stats
#     except Exception as e:
#         print(f"❌ Error fetching user stats: {e}")
#         raise HTTPException(status_code=500, detail="Internal server error")
# # ============================================
# # TRELLO HELPER
# # ============================================

# TRELLO_API_KEY = os.getenv("TRELLO_API_KEY")
# TRELLO_TOKEN = os.getenv("TRELLO_TOKEN")
# TRELLO_LIST_ID = os.getenv("TRELLO_LIST_ID")

# def create_trello_card(title: str, description: str) -> str | None:
#     """
#     Create a Trello card in the configured list.
#     Returns the card's short URL if successful, otherwise None.
#     """
#     if not (TRELLO_API_KEY and TRELLO_TOKEN and TRELLO_LIST_ID):
#         print("⚠️ Trello not configured properly in environment variables")
#         return None

#     url = "https://api.trello.com/1/cards"
#     query = {
#         "idList": TRELLO_LIST_ID,
#         "key": TRELLO_API_KEY,
#         "token": TRELLO_TOKEN,
#         "name": title,
#         "desc": description,
#     }

#     try:
#         response = requests.post(url, params=query, timeout=10)
#         if response.status_code == 200:
#             card = response.json()
#             print(f"✅ Trello card created: {card.get('shortUrl')}")
#             return card.get("shortUrl")
#         else:
#             print(f"❌ Trello error {response.status_code}: {response.text}")
#             return None
#     except Exception as e:
#         print(f"❌ Trello request failed: {e}")
#         return None

# # ============================================

# # ============================================
# # EDGE TTS ENDPOINTS (Replaces ElevenLabs)
# # ============================================

# @app.post("/api/edge-tts")
# async def generate_edge_tts(request: EdgeTTSRequest):
#     """Generate speech using Edge TTS with pronunciation fixes"""
#     try:
#         # Map assistant name
#         assistant_name = "Slah" if request.voice_id.lower() == "slah" else "Amira"
#         voice_name = VOICE_CONFIG[assistant_name].get(request.language)
        
#         if not voice_name:
#             raise HTTPException(
#                 status_code=400,
#                 detail=f"No voice found for {request.voice_id} in {request.language}"
#             )
        
#         # Apply pronunciation fixes
#         fixed_text = apply_pronunciation_fixes(request.text, assistant_name, request.language)
        
#         print(f"🎤 Edge TTS: {voice_name}")
#         print(f"📝 Original: {request.text[:50]}...")
#         print(f"🔧 Fixed: {fixed_text[:50]}...")
        
#         # Generate speech
#         communicate = edge_tts.Communicate(fixed_text, voice_name)
        
#         async def generate_audio():
#             async for chunk in communicate.stream():
#                 if chunk["type"] == "audio":
#                     yield chunk["data"]
        
#         return StreamingResponse(
#             generate_audio(),
#             media_type="audio/mpeg",
#             headers={
#                 "Cache-Control": "no-cache",
#                 "Transfer-Encoding": "chunked",
#             }
#         )
        
#     except Exception as e:
#         print(f"❌ Edge TTS error: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=str(e))

# # VOICE PROCESSING ENDPOINTS
# # ============================================

# # @app.post("/api/voice-pipeline-auth")
# # async def process_voice_with_auth(
# #     request: AuthorizedTranscriptionRequest,
# #     current_user: Optional[dict] = Depends(get_optional_user)
# # ):
# #     try:
# #         session_id = request.sessionId or str(uuid.uuid4())
# #         user_id = current_user["user_id"] if current_user else None
# #         assistant_name = "Slah" if request.assistantId == 1 else "Amira"

# #         print(f"🎙️ Processing for user: {current_user['email'] if current_user else 'Guest'}")
# #         print(f"📋 Session: {session_id}")

# #         # Extract user info
# #         extracted_name = extract_user_name(request.transcription)
# #         extracted_issue = extract_issue_type(request.transcription)

# #         # TEMPORARILY SKIP USER AUDIO PROCESSING FOR SPEED
# #         user_audio_path = None
# #         if request.audioData:
# #             print(f"⚠️ Skipping audio processing for speed - audio data present but not processed")
# #         else:
# #             print(f"📤 No audio data provided - proceeding with text-only processing")

# #         # Load conversation history
# #         conversation_history_list = []
# #         if db:
# #             try:
# #                 with db.get_connection() as conn:
# #                     with conn.cursor() as cursor:
# #                         cursor.execute("""
# #                             SELECT user_message, ai_response
# #                             FROM conversations 
# #                             WHERE session_id = %s 
# #                             ORDER BY timestamp ASC
# #                             LIMIT 10
# #                         """, (session_id,))
                        
# #                         rows = cursor.fetchall()
# #                         conversation_history_list = [
# #                             {"user": row[0], "ai": row[1]}
# #                             for row in rows
# #                         ]
# #             except Exception as e:
# #                 print(f"❌ Error loading history: {e}")

# #         # Build conversation context
# #         history_to_use = request.history if request.history else conversation_history_list
# #         conversation_context = ""
# #         if history_to_use:
# #             conversation_context = "Previous conversation:\n"
# #             for turn in history_to_use[-10:]:
# #                 user_msg = turn.user if hasattr(turn, 'user') else turn.get('user', '')
# #                 ai_msg = turn.ai if hasattr(turn, 'ai') else turn.get('ai', '')
# #                 conversation_context += f"User: {user_msg}\nAI: {ai_msg}\n"
# #             conversation_context += f"\nCurrent user message: {request.transcription}\n"
# #         else:
# #             conversation_context = request.transcription

# #         # Check for manual ticket request BEFORE RAG
# #         transcription_lower = request.transcription.lower()
# #         if any(phrase in transcription_lower for phrase in [
# #             "open a ticket", "open the ticket", "create a ticket", "raise a ticket", "submit a ticket"
# #         ]):
# #             ticket_url = create_trello_card(
# #                 title=f"[MANUAL] {assistant_name} - {current_user['email'] if current_user else 'guest'}",
# #                 description=f"""
# #                 User explicitly asked to open a ticket.
# #                 Session: {session_id}
# #                 Language: {request.language}
# #                 Message: {request.transcription}
# #                 """
# #             )
# #             if ticket_url:
# #                 ai_response = f"✅ A support ticket has been created: {ticket_url}"
# #             else:
# #                 ai_response = "I'll create a support ticket for you right away."
# #         else:
# #             # Generate AI response
# #             ai_response = rag_system.get_response(conversation_context, request.language, assistant_name)
            
# #             # Handle fallback if RAG fails
# #             if not ai_response or "technical difficulties" in ai_response.lower():
# #                 ticket_url = create_trello_card(
# #                     title=f"[AUTO-FALLBACK] {assistant_name} - {current_user['email'] if current_user else 'guest'}",
# #                     description=f"""
# #                     AI failed to respond properly.
# #                     Session: {session_id}
# #                     Language: {request.language}
# #                     Message: {request.transcription}
# #                     """
# #                 )
# #                 if ticket_url:
# #                     ai_response = f"I'm having technical issues. A support ticket was created: {ticket_url}"

# #         # TEMPORARILY SKIP AI AUDIO GENERATION FOR SPEED
# #         ai_audio_path = None
# #         print(f"⚠️ Skipping AI audio generation for speed")

# #         # Save to database WITHOUT audio paths
# #         if db:
# #             try:
# #                 # Save session
# #                 db.save_session(
# #                     session_id=session_id,
# #                     language=request.language,
# #                     assistant_id=request.assistantId or 1,
# #                     user_id=user_id,
# #                     user_name=extracted_name,
# #                     issue_type=extracted_issue
# #                 )
                
# #                 # Save conversation WITHOUT audio paths for speed
# #                 db.save_conversation(
# #                     session_id=session_id,
# #                     user_message=request.transcription,
# #                     ai_response=ai_response,
# #                     language=request.language,
# #                     user_id=user_id,
# #                     user_audio_path=None,      # TEMPORARILY NULL
# #                     ai_audio_path=None        # TEMPORARILY NULL
# #                 )
                
# #                 # Get updated conversation history
# #                 with db.get_connection() as conn:
# #                     with conn.cursor() as cursor:
# #                         cursor.execute("""
# #                             SELECT user_message, ai_response, timestamp, 
# #                                    user_audio_path, ai_audio_path
# #                             FROM conversations 
# #                             WHERE session_id = %s 
# #                             ORDER BY timestamp ASC
# #                         """, (session_id,))
                        
# #                         rows = cursor.fetchall()
# #                         conversation_history = [
# #                             {
# #                                 "user": row[0] or "",
# #                                 "ai": row[1] or "",
# #                                 "user_message": row[0] or "",
# #                                 "ai_response": row[1] or "",
# #                                 "timestamp": row[2].isoformat() if row[2] else None,
# #                                 "user_audio_path": row[3],
# #                                 "ai_audio_path": row[4]
# #                             }
# #                             for row in rows
# #                         ]
                
# #             except Exception as db_error:
# #                 print(f"❌ Database save failed: {db_error}")
# #                 conversation_history = []
# #         else:
# #             conversation_history = []

# #         return {
# #             "transcription": request.transcription,
# #             "aiResponse": ai_response,
# #             "sessionId": session_id,
# #             "conversationHistory": conversation_history,
# #             "user": current_user["email"] if current_user else "guest",
# #             "extractedInfo": {
# #                 "userName": extracted_name,
# #                 "issueType": extracted_issue
# #             },
# #             "audioSaved": {
# #                 "user": False,  # No audio saved for speed
# #                 "ai": False     # No audio saved for speed
# #             }
# #         }

# #     except Exception as e:
# #         print(f"❌ Voice processing error: {e}")
# #         raise HTTPException(status_code=500, detail=str(e))

# @app.post("/api/voice-pipeline-auth")
# async def process_voice_with_auth(
#     request: AuthorizedTranscriptionRequest,
#     background_tasks: BackgroundTasks,  # ADD THIS PARAMETER
#     current_user: Optional[dict] = Depends(get_optional_user)
# ):
#     try:
#         session_id = request.sessionId or str(uuid.uuid4())
#         user_id = current_user["user_id"] if current_user else None
#         assistant_name = "Slah" if request.assistantId == 1 else "Amira"
#         print(f"🔴 assistantId={request.assistantId}, assistant_name={assistant_name}, lang={request.language}")
#         print(f"🎙️ Processing for user: {current_user['email'] if current_user else 'Guest'}")
#         print(f"📋 Session: {session_id}")

#         # Extract user info
#         extracted_name = extract_user_name(request.transcription)
#         extracted_issue = extract_issue_type(request.transcription)

#         # Load conversation history (FAST - no blocking operations)
#         conversation_history_list = []
#         if db:
#             try:
#                 with db.get_connection() as conn:
#                     with conn.cursor() as cursor:
#                         cursor.execute("""
#                             SELECT user_message, ai_response
#                             FROM conversations 
#                             WHERE session_id = %s 
#                             ORDER BY timestamp ASC
#                             LIMIT 10
#                         """, (session_id,))
                        
#                         rows = cursor.fetchall()
#                         conversation_history_list = [
#                             {"user": row[0], "ai": row[1]}
#                             for row in rows
#                         ]
#             except Exception as e:
#                 print(f"❌ Error loading history: {e}")

#         # Build conversation context
#         history_to_use = request.history if request.history else conversation_history_list
#         conversation_context = ""
#         if history_to_use:
#             conversation_context = "Previous conversation:\n"
#             for turn in history_to_use[-10:]:
#                 user_msg = turn.user if hasattr(turn, 'user') else turn.get('user', '')
#                 ai_msg = turn.ai if hasattr(turn, 'ai') else turn.get('ai', '')
#                 conversation_context += f"User: {user_msg}\nAI: {ai_msg}\n"
#             conversation_context += f"\nCurrent user message: {request.transcription}\n"
#         else:
#             conversation_context = request.transcription

#         # Check for manual ticket request
#         transcription_lower = request.transcription.lower()
#         if any(phrase in transcription_lower for phrase in [
#             "open a ticket", "open the ticket", "create a ticket", "raise a ticket", "submit a ticket"
#         ]):
#             ticket_url = create_trello_card(
#                 title=f"[MANUAL] {assistant_name} - {current_user['email'] if current_user else 'guest'}",
#                 description=f"""
#                 User explicitly asked to open a ticket.
#                 Session: {session_id}
#                 Language: {request.language}
#                 Message: {request.transcription}
#                 """
#             )
#             if ticket_url:
#                 ai_response = f"✅ A support ticket has been created: {ticket_url}"
#             else:
#                 ai_response = "I'll create a support ticket for you right away."
#         else:
#             # Generate AI response (CRITICAL PATH - keep this fast)
#             ai_response = rag_system.get_response(conversation_context, request.language, assistant_name)
            
#             if not ai_response or "technical difficulties" in ai_response.lower():
#                 ticket_url = create_trello_card(
#                     title=f"[AUTO-FALLBACK] {assistant_name} - {current_user['email'] if current_user else 'guest'}",
#                     description=f"""
#                     AI failed to respond properly.
#                     Session: {session_id}
#                     Language: {request.language}
#                     Message: {request.transcription}
#                     """
#                 )
#                 if ticket_url:
#                     ai_response = f"I'm having technical issues. A support ticket was created: {ticket_url}"

#         # Save to database WITHOUT audio (FAST)
#         conversation_id = None
#         if db:
#             try:
#                 db.save_session(
#                     session_id=session_id,
#                     language=request.language,
#                     assistant_id=request.assistantId or 1,
#                     user_id=user_id,
#                     user_name=extracted_name,
#                     issue_type=extracted_issue
#                 )
                
#                 # Save conversation and get ID
#                 with db.get_connection() as conn:
#                     with conn.cursor() as cursor:
#                         cursor.execute("""
#                             INSERT INTO conversations 
#                             (session_id, user_id, user_message, ai_response, language)
#                             VALUES (%s, %s, %s, %s, %s)
#                             RETURNING id
#                         """, (session_id, user_id, request.transcription, ai_response, request.language))
#                         conversation_id = cursor.fetchone()[0]
#                     conn.commit()
                
#             except Exception as db_error:
#                 print(f"❌ Database save failed: {db_error}")

#         # Schedule background audio processing (NON-BLOCKING)
#         if conversation_id:
#             if request.audioData:
#                 background_tasks.add_task(
#                     save_audio_in_background,
#                     request.audioData,
#                     session_id,
#                     conversation_id,
#                     "user"
#                 )
            
#             voice_id = VOICE_CONFIG.get(assistant_name, {}).get(request.language, VOICE_CONFIG["Amira"]["en-US"])
#             background_tasks.add_task(
#                 generate_ai_audio_in_background,
#                 ai_response,
#                 voice_id,
#                 session_id,
#                 conversation_id,
#                 assistant_name,  # ADD THIS PARAMETER
#                 request.language  # ADD THIS PARAMETER
#             )

#         # Get updated conversation history
#         conversation_history = []
#         if db:
#             try:
#                 with db.get_connection() as conn:
#                     with conn.cursor() as cursor:
#                         cursor.execute("""
#                             SELECT user_message, ai_response, timestamp, 
#                                    user_audio_path, ai_audio_path
#                             FROM conversations 
#                             WHERE session_id = %s 
#                             ORDER BY timestamp ASC
#                         """, (session_id,))
                        
#                         rows = cursor.fetchall()
#                         conversation_history = [
#                             {
#                                 "user": row[0] or "",
#                                 "ai": row[1] or "",
#                                 "user_message": row[0] or "",
#                                 "ai_response": row[1] or "",
#                                 "timestamp": row[2].isoformat() if row[2] else None,
#                                 "user_audio_path": row[3],
#                                 "ai_audio_path": row[4]
#                             }
#                             for row in rows
#                         ]
                
#             except Exception as db_error:
#                 print(f"❌ Error fetching history: {db_error}")

#         # Return response IMMEDIATELY (audio processing in background)
#         return {
#             "transcription": request.transcription,
#             "aiResponse": ai_response,
#             "sessionId": session_id,
#             "conversationHistory": conversation_history,
#             "user": current_user["email"] if current_user else "guest",
#             "extractedInfo": {
#                 "userName": extracted_name,
#                 "issueType": extracted_issue
#             },
#             "audioSaved": {
#                 "user": "processing",  # Indicates background processing
#                 "ai": "processing"
#             }
#         }

#     except Exception as e:
#         print(f"❌ Voice processing error: {e}")
#         raise HTTPException(status_code=500, detail=str(e))
# # 
 
# @app.post("/api/voice-pipeline")
# async def process_voice(request: TranscriptionRequest):
#     """Regular voice pipeline for guests"""
#     try:
#         session_id = request.sessionId or str(uuid.uuid4())
        
#         print(f"Processing: {request.transcription[:50]}... (Session: {session_id})")
#         print(f"UI Language: {request.language}")
        
#         # Extract user info even for guests
#         extracted_name = extract_user_name(request.transcription)
#         extracted_issue = extract_issue_type(request.transcription)
        
#         # Load existing conversation history from database
#         conversation_history_list = []
#         if db:
#             try:
#                 with db.get_connection() as conn:
#                     with conn.cursor() as cursor:
#                         cursor.execute("""
#                             SELECT user_message, ai_response
#                             FROM conversations 
#                             WHERE session_id = %s 
#                             ORDER BY timestamp ASC
#                             LIMIT 10
#                         """, (session_id,))
                        
#                         rows = cursor.fetchall()
#                         conversation_history_list = [
#                             {"user": row[0], "ai": row[1]}
#                             for row in rows
#                         ]
#                         print(f"Loaded {len(conversation_history_list)} messages from database")
#             except Exception as e:
#                 print(f"Error loading history from database: {e}")
        
#         # Use frontend history if available, otherwise use database history
#         if request.history and len(request.history) > 0:
#             history_to_use = request.history
#             print("Using history from frontend")
#         else:
#             history_to_use = conversation_history_list
#             print("Using history from database")
        
#         # Build context from conversation history
#         conversation_context = ""
#         if history_to_use and len(history_to_use) > 0:
#             conversation_context = "Previous conversation:\n"
#             for turn in history_to_use[-10:]:  # Use last 10 turns for context
#                 user_msg = turn.user if hasattr(turn, 'user') else turn.get('user', '')
#                 ai_msg = turn.ai if hasattr(turn, 'ai') else turn.get('ai', '')
#                 conversation_context += f"User: {user_msg}\nAI: {ai_msg}\n"
#             conversation_context += f"\nCurrent user message: {request.transcription}\n"
#         else:
#             conversation_context = request.transcription
        
#         # Get AI response with assistant name
#         assistant_name = "Slah" if request.assistantId == 1 else "Amira"
#         ai_response = rag_system.get_response(conversation_context, request.language, assistant_name)
        
#         # Save to database
#         if db:
#             try:
#                 db.save_session(
#                     session_id=session_id,
#                     language=request.language,
#                     assistant_id=request.assistantId or 1,
#                     user_name=extracted_name,
#                     issue_type=extracted_issue
#                 )
                
#                 db.save_conversation(
#                     session_id=session_id,
#                     user_message=request.transcription,
#                     ai_response=ai_response,
#                     language=request.language
#                 )
                
#                 # Get complete conversation history
#                 with db.get_connection() as conn:
#                     with conn.cursor() as cursor:
#                         cursor.execute("""
#                             SELECT user_message, ai_response, timestamp, audio_path
#                             FROM conversations 
#                             WHERE session_id = %s 
#                             ORDER BY timestamp ASC
#                         """, (session_id,))
                        
#                         rows = cursor.fetchall()
#                         conversation_history = [
#                             {
#                                 "user": row[0] or "",
#                                 "ai": row[1] or "",
#                                 "user_message": row[0] or "",
#                                 "ai_response": row[1] or "",
#                                 "timestamp": row[2].isoformat() if row[2] else None,
#                                 "audio_path": row[3]
#                             }
#                             for row in rows
#                         ]
                
#             except Exception as db_error:
#                 print(f"Database save failed: {db_error}")
#                 conversation_history = []
#         else:
#             conversation_history = []

#         return {
#             "transcription": request.transcription,
#             "aiResponse": ai_response,
#             "sessionId": session_id,
#             "conversationHistory": conversation_history,
#         }

#     except Exception as e:
#         print(f"Voice processing error: {e}")
#         raise HTTPException(status_code=500, detail=str(e))

# # ============================================
# # CONVERSATION HISTORY ENDPOINTS
# # ============================================

# @app.get("/api/conversation-history/{session_id}")
# async def get_conversation_history_endpoint(
#     session_id: str,
#     current_user: Optional[dict] = Depends(get_optional_user)
# ):
#     """Get conversation history for a specific session"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     try:
#         with db.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 # If user is authenticated, verify they own this session
#                 if current_user:
#                     cursor.execute("""
#                         SELECT user_id FROM sessions WHERE session_id = %s
#                     """, (session_id,))
#                     session_owner = cursor.fetchone()
#                     if session_owner and session_owner[0] != current_user["user_id"]:
#                         raise HTTPException(status_code=403, detail="Access denied")
                
#                 # Get all conversations for this session
#                 cursor.execute("""
#                     SELECT user_message, ai_response, timestamp, audio_path
#                     FROM conversations 
#                     WHERE session_id = %s 
#                     ORDER BY timestamp ASC
#                 """, (session_id,))
                
#                 rows = cursor.fetchall()
#                 history = [
#                     {
#                         "user_message": row[0],
#                         "ai_response": row[1], 
#                         "timestamp": row[2].isoformat() if row[2] else None,
#                         "audio_path": row[3]
#                     }
#                     for row in rows
#                 ]
                
#                 return history
                
#     except Exception as e:
#         print(f"Error fetching conversation history: {e}")
#         raise HTTPException(status_code=500, detail=str(e))

# # ============================================
# # TWILIO VOICE CALL ENDPOINTS
# # ============================================

# @app.post("/api/twilio/incoming-call")
# async def handle_incoming_call(request: Request):
#     """Handle incoming Twilio call with language and assistant selection"""
#     try:
#         # Parse Twilio form data
#         form = await request.form()
#         caller_phone = form.get("From", "")
#         call_sid = form.get("CallSid", "")
        
#         print(f"📞 Incoming call from: {caller_phone} (CallSid: {call_sid})")
        
#         # Create or get call session
#         session = get_or_create_call_session(call_sid, caller_phone)
        
#         # Identify caller for later use
#         session.caller_info = identify_caller_by_phone(caller_phone)
        
#         # Create TwiML response for language selection
#         response = VoiceResponse()
        
#         # Welcome message in multiple languages
#         welcome_message = (
#             "Welcome to Ooredoo AI Assistant. "
#             "مرحباً بك في مساعد أوريدو الذكي. "
#             "Bienvenue chez l'Assistant IA Ooredoo. "
#             "Please press 1 for English, 2 for Arabic, or 3 for French. "
#             "اضغط 1 للإنجليزية، 2 للعربية، أو 3 للفرنسية. "
#             "Appuyez sur 1 pour l'anglais, 2 pour l'arabe, ou 3 pour le français."
#         )
        
#         gather = Gather(
#             input='dtmf',
#             action='/api/twilio/language-selection',
#             method='POST',
#             num_digits=1,
#             timeout=10
#         )
#         gather.say(welcome_message, voice='alice', language='en')
#         response.append(gather)
        
#         # Fallback if no input
#         response.say("No selection received. Please call back and make a selection.", voice='alice')
        
#         return Response(str(response), media_type="application/xml")
        
#     except Exception as e:
#         print(f"❌ Error handling incoming call: {e}")
#         response = VoiceResponse()
#         response.say("Sorry, we're experiencing technical difficulties. Please try again later.")
#         return Response(str(response), media_type="application/xml")

# @app.post("/api/twilio/language-selection")
# async def handle_language_selection(request: Request):
#     """Handle language selection and proceed to assistant selection"""
#     try:
#         form = await request.form()
#         digits = form.get("Digits", "")
#         call_sid = form.get("CallSid", "")
#         caller_phone = form.get("From", "")
        
#         print(f"📞 Language selection: {digits} from {caller_phone}")
        
#         # Get call session
#         session = get_or_create_call_session(call_sid, caller_phone)
        
#         response = VoiceResponse()
        
#         if digits in LANGUAGE_CONFIG:
#             # Save language selection
#             session.language = LANGUAGE_CONFIG[digits]["code"]
#             language_name = LANGUAGE_CONFIG[digits]["name"]
#             voice = LANGUAGE_CONFIG[digits]["voice"]
            
#             print(f"📞 Language selected: {language_name} for call {call_sid}")
            
#             # Create assistant selection message in selected language
#             if digits == "1":  # English
#                 assistant_message = (
#                     f"Thank you for selecting {language_name}. "
#                     "Now please choose your assistant: "
#                     "Press 1 for Slah, our Business Solutions Expert, "
#                     "or press 2 for Amira, our Customer Service Assistant."
#                 )
#             elif digits == "2":  # Arabic
#                 assistant_message = (
#                     "شكراً لك لاختيار اللغة العربية. "
#                     "الآن يرجى اختيار مساعدك: "
#                     "اضغط 1 لصلاح، خبير الحلول التجارية، "
#                     "أو اضغط 2 لأميرة، مساعدة خدمة العملاء."
#                 )
#             else:  # French
#                 assistant_message = (
#                     "Merci d'avoir sélectionné le français. "
#                     "Maintenant, veuillez choisir votre assistant: "
#                     "Appuyez sur 1 pour Slah, notre Expert en Solutions Business, "
#                     "ou appuyez sur 2 pour Amira, notre Assistante Service Client."
#                 )
            
#             gather = Gather(
#                 input='dtmf',
#                 action='/api/twilio/assistant-selection',
#                 method='POST',
#                 num_digits=1,
#                 timeout=10
#             )
#             gather.say(assistant_message, voice=voice, language=session.language)
#             response.append(gather)
            
#             # Fallback
#             response.say("No selection received. Connecting you to our default assistant.", voice=voice)
#             response.redirect('/api/twilio/start-conversation?assistant=2')  # Default to Amira
            
#         else:
#             # Invalid selection
#             response.say("Invalid selection. Please call back and choose 1, 2, or 3.")
        
#         return Response(str(response), media_type="application/xml")
        
#     except Exception as e:
#         print(f"❌ Error in language selection: {e}")
#         response = VoiceResponse()
#         response.say("Sorry, there was an error. Please try again.")
#         return Response(str(response), media_type="application/xml")

# @app.post("/api/twilio/assistant-selection")
# async def handle_assistant_selection(request: Request):
#     """Handle assistant selection and start conversation"""
#     try:
#         form = await request.form()
#         digits = form.get("Digits", "")
#         call_sid = form.get("CallSid", "")
#         caller_phone = form.get("From", "")
        
#         print(f"📞 Assistant selection: {digits} from {caller_phone}")
        
#         # Get call session
#         session = get_or_create_call_session(call_sid, caller_phone)
        
#         response = VoiceResponse()
        
#         if digits in ASSISTANT_CONFIG:
#             # Save assistant selection
#             session.assistant_id = ASSISTANT_CONFIG[digits]["id"]
#             assistant_name = ASSISTANT_CONFIG[digits]["name"]
#             assistant_type = ASSISTANT_CONFIG[digits]["type"]
            
#             print(f"📞 Assistant selected: {assistant_name} ({assistant_type}) for call {call_sid}")
            
#             # Redirect to start conversation
#             response.redirect(f'/api/twilio/start-conversation')
            
#         else:
#             # Invalid selection - default to Amira
#             session.assistant_id = 2
#             response.redirect('/api/twilio/start-conversation')
        
#         return Response(str(response), media_type="application/xml")
        
#     except Exception as e:
#         print(f"❌ Error in assistant selection: {e}")
#         response = VoiceResponse()
#         response.say("Sorry, there was an error. Connecting you to our assistant.")
#         response.redirect('/api/twilio/start-conversation')
#         return Response(str(response), media_type="application/xml")

# @app.get("/api/twilio/start-conversation")
# @app.post("/api/twilio/start-conversation")
# async def start_conversation(request: Request):
#     """Start the AI conversation"""
#     try:
#         if request.method == "GET":
#             # Handle redirect from assistant selection
#             query_params = request.query_params
#             call_sid = query_params.get("CallSid", "")
#         else:
#             # Handle POST
#             form = await request.form()
#             call_sid = form.get("CallSid", "")
        
#         caller_phone = request.query_params.get("From") or (await request.form()).get("From", "")
        
#         # Get call session
#         session = get_or_create_call_session(call_sid, caller_phone)
        
#         # Create database session if not exists
#         if not session.conversation_started and db:
#             if hasattr(db, 'create_twilio_call_session'):
#                 db_session_id = db.create_twilio_call_session(
#                     call_sid=call_sid,
#                     caller_phone=caller_phone,
#                     caller_user_id=session.caller_info.user_id if session.caller_info and session.caller_info.is_registered else None
#                 )
#                 session.session_id = db_session_id or session.session_id
#             session.conversation_started = True
        
#         response = VoiceResponse()
        
#         # Generate personalized greeting
#         assistant_name = ASSISTANT_CONFIG.get(str(session.assistant_id), ASSISTANT_CONFIG["2"])["name"]
        
#         if session.caller_info and session.caller_info.is_registered:
#             if session.language == "en-US":
#                 greeting = f"Hello {session.caller_info.full_name}! I'm {assistant_name}, your AI assistant. How can I help you today?"
#             elif session.language == "ar-SA":
#                 greeting = f"مرحباً {session.caller_info.full_name}! أنا {assistant_name}, مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟"
#             else:  # French
#                 greeting = f"Bonjour {session.caller_info.full_name}! Je suis {assistant_name}, votre assistant IA. Comment puis-je vous aider aujourd'hui?"
#         else:
#             if session.language == "en-US":
#                 greeting = f"Hello! I'm {assistant_name}, your AI assistant. How can I help you today?"
#             elif session.language == "ar-SA":
#                 greeting = f"مرحباً! أنا {assistant_name}, مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟"
#             else:  # French
#                 greeting = f"Bonjour! Je suis {assistant_name}, votre assistant IA. Comment puis-je vous aider aujourd'hui?"
        
#         voice = LANGUAGE_CONFIG.get(session.language.split("-")[0] if session.language else "1", LANGUAGE_CONFIG["1"])["voice"]
#         response.say(greeting, voice=voice, language=session.language or "en-US")
        
#         # Start listening for user input
#         gather = Gather(
#             input='speech',
#             action='/api/twilio/process-speech',
#             method='POST',
#             speech_timeout='auto',
#             language=session.language or 'en-US',
#             enhanced=True
#         )
#         response.append(gather)
        
#         # Fallback
#         response.say("I didn't hear anything. Please speak clearly or call back.", voice=voice)
        
#         return Response(str(response), media_type="application/xml")
        
#     except Exception as e:
#         print(f"❌ Error starting conversation: {e}")
#         response = VoiceResponse()
#         response.say("Sorry, I'm having trouble starting our conversation. Please try again.")
#         return Response(str(response), media_type="application/xml")

# @app.post("/api/twilio/process-speech")
# async def process_speech(request: Request):
#     """Process speech input and generate AI response"""
#     try:
#         form = await request.form()
#         speech_result = form.get("SpeechResult", "")
#         call_sid = form.get("CallSid", "")
#         caller_phone = form.get("From", "")
        
#         print(f"📝 Speech from {caller_phone}: {speech_result}")
        
#         # Get call session
#         session = get_or_create_call_session(call_sid, caller_phone)
        
#         response = VoiceResponse()
#         voice = LANGUAGE_CONFIG.get(session.language.split("-")[0] if session.language else "1", LANGUAGE_CONFIG["1"])["voice"]
        
#         if not speech_result:
#             response.say("I didn't catch that. Could you please repeat?", voice=voice, language=session.language)
            
#             # Continue listening
#             gather = Gather(
#                 input='speech',
#                 action='/api/twilio/process-speech',
#                 method='POST',
#                 speech_timeout='auto',
#                 language=session.language or 'en-US'
#             )
#             response.append(gather)
#             return Response(str(response), media_type="application/xml")
        
#         # Generate AI response using RAG system
#         assistant_name = ASSISTANT_CONFIG.get(str(session.assistant_id), ASSISTANT_CONFIG["2"])["name"]
        
#         # Get conversation history for context
#         conversation_history = []
#         if db and session.conversation_started:
#             if hasattr(db, 'get_conversation_history'):
#                 conversation_history = db.get_conversation_history(session_id=session.session_id, limit=10)
        
#         # Build conversation context
#         conversation_context = ""
#         if conversation_history:
#             conversation_context = "Previous conversation:\n"
#             for turn in conversation_history[-5:]:  # Last 5 turns
#                 conversation_context += f"User: {turn['user']}\nAI: {turn['ai']}\n"
#             conversation_context += f"\nCurrent user message: {speech_result}\n"
#         else:
#             conversation_context = speech_result
        
#         # Generate AI response
#         ai_response = rag_system.get_response(
#             query=conversation_context,
#             ui_language=session.language or "en-US",
#             assistant_name=assistant_name
#         )
        
#         # Enhance response for phone conversation
#         if session.caller_info and session.caller_info.is_registered and not conversation_history:
#             # First response should acknowledge the caller
#             if session.language == "en-US":
#                 ai_response = f"Thank you for calling, {session.caller_info.full_name}. " + ai_response
#             elif session.language == "ar-SA":
#                 ai_response = f"شكراً لك للاتصال، {session.caller_info.full_name}. " + ai_response
#             else:  # French
#                 ai_response = f"Merci d'avoir appelé, {session.caller_info.full_name}. " + ai_response
        
#         # Save conversation to database
#         if db and session.conversation_started:
#             db.save_conversation(
#                 session_id=session.session_id,
#                 user_message=speech_result,
#                 ai_response=ai_response,
#                 language=session.language or "en-US",
#                 user_id=session.caller_info.user_id if session.caller_info and session.caller_info.is_registered else None
#             )
        
#         # Speak the response
#         response.say(ai_response, voice=voice, language=session.language or "en-US")
        
#         # Continue the conversation
#         gather = Gather(
#             input='speech',
#             action='/api/twilio/process-speech',
#             method='POST',
#             speech_timeout='auto',
#             language=session.language or 'en-US',
#             timeout=10
#         )
#         response.append(gather)
        
#         # Fallback after timeout
#         if session.language == "en-US":
#             goodbye = "Thank you for calling Ooredoo. Have a great day!"
#         elif session.language == "ar-SA":
#             goodbye = "شكراً لك للاتصال بأوريدو. أتمنى لك يوماً سعيداً!"
#         else:  # French
#             goodbye = "Merci d'avoir appelé Ooredoo. Passez une excellente journée!"
            
#         response.say(goodbye, voice=voice, language=session.language)
        
#         return Response(str(response), media_type="application/xml")
        
#     except Exception as e:
#         print(f"❌ Error processing speech: {e}")
#         response = VoiceResponse()
#         response.say("I'm having trouble processing your request. Please try again or call back.")
#         return Response(str(response), media_type="application/xml")

# @app.post("/api/twilio/status-callback")
# async def handle_status_callback(request: Request):
#     """Handle call status updates"""
#     try:
#         form = await request.form()
#         call_sid = form.get("CallSid", "")
#         call_status = form.get("CallStatus", "")
#         call_duration = form.get("CallDuration", "0")
        
#         print(f"📞 Call {call_sid} status: {call_status}, duration: {call_duration}s")
        
#         # Clean up session if call ended
#         if call_status in ["completed", "failed", "busy", "no-answer"] and call_sid in call_sessions:
#             del call_sessions[call_sid]
        
#         # Update database
#         if db and hasattr(db, 'update_call_status'):
#             db.update_call_status(
#                 call_sid=call_sid,
#                 status=call_status,
#                 duration=int(call_duration) if call_duration.isdigit() else None
#             )
        
#         return {"status": "success"}
        
#     except Exception as e:
#         print(f"❌ Error handling status callback: {e}")
#         return {"status": "error", "message": str(e)}

# @app.get("/api/twilio/test")
# async def test_twilio_setup():
#     """Test endpoint to verify Twilio integration"""
#     return {
#         "status": "Twilio integration ready",
#         "languages": LANGUAGE_CONFIG,
#         "assistants": ASSISTANT_CONFIG,
#         "active_calls": len(call_sessions)
#     }

# # ============================================
# # DASHBOARD ENDPOINTS
# # ============================================

# @app.get("/api/dashboard/statistics")
# async def get_dashboard_statistics(current_user: dict = Depends(get_current_user)):
#     """Get statistics for dashboard"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     # Admin sees all stats, users see their own
#     if current_user["role"] == "admin":
#         stats = db.get_user_statistics()  # Global stats
#     else:
#         stats = db.get_user_statistics(current_user["user_id"])  # User's own stats
    
#     return stats

# @app.get("/api/dashboard/conversations")
# async def get_dashboard_conversations(
#     current_user: dict = Depends(get_current_user),
#     limit: int = 100
# ):
#     """Get individual conversations for backward compatibility"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     print(f"Fetching conversations for user: {current_user['email']} (ID: {current_user['user_id']}, Role: {current_user['role']})")
    
#     conversations = []
#     with db.get_connection() as conn:
#         with conn.cursor() as cursor:
#             if current_user["role"] == "admin":
#                 # Admin sees all conversations with user info
#                 cursor.execute("""
#                     SELECT 
#                         c.id, c.session_id, c.user_message, c.ai_response,
#                         c.timestamp, c.language, c.audio_path,
#                         u.email, u.full_name
#                     FROM conversations c
#                     LEFT JOIN users u ON c.user_id = u.user_id
#                     ORDER BY c.timestamp DESC
#                     LIMIT %s
#                 """, (limit,))
                
#                 rows = cursor.fetchall()
#                 conversations = [
#                     {
#                         "id": str(row[0]) if row[0] else None,
#                         "session_id": row[1],
#                         "user_message": row[2] or "No message recorded",
#                         "ai_response": row[3] or "No response recorded",
#                         "timestamp": row[4].isoformat() if row[4] else None,
#                         "language": row[5] or "en-US",
#                         "audio_path": row[6],
#                         "email": row[7],
#                         "full_name": row[8]
#                     }
#                     for row in rows
#                 ]
#             else:
#                 # User sees their own conversations
#                 cursor.execute("""
#                     SELECT 
#                         c.id, c.session_id, c.user_message, c.ai_response,
#                         c.timestamp, c.language, c.audio_path
#                     FROM conversations c
#                     WHERE c.user_id = %s
#                     ORDER BY c.timestamp DESC
#                     LIMIT %s
#                 """, (current_user["user_id"], limit))
                
#                 rows = cursor.fetchall()
#                 conversations = [
#                     {
#                         "id": str(row[0]) if row[0] else None,
#                         "session_id": row[1],
#                         "user_message": row[2] or "No message recorded",
#                         "ai_response": row[3] or "No response recorded", 
#                         "timestamp": row[4].isoformat() if row[4] else None,
#                         "language": row[5] or "en-US",
#                         "audio_path": row[6]
#                     }
#                     for row in rows
#                 ]
    
#     print(f"Returning {len(conversations)} conversations")
#     return conversations

# @app.get("/api/dashboard/users")
# async def get_all_users(current_user: dict = Depends(get_current_user)):
#     """Get all users (admin only)"""
#     if current_user["role"] != "admin":
#         raise HTTPException(status_code=403, detail="Admin access required")
    
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     return db.get_all_users()

# @app.get("/api/dashboard/sessions")
# async def get_conversation_sessions(
#     current_user: dict = Depends(get_current_user),
#     limit: int = 100
# ):
#     """Get conversation sessions grouped by session_id with audio counts"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     print(f"Fetching sessions for user: {current_user['email']} (Role: {current_user['role']})")
    
#     try:
#         with db.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 if current_user["role"] == "admin":
#                     # Admin sees all sessions with user info and audio counts
#                     cursor.execute("""
#                         SELECT 
#                             s.session_id,
#                             u.email,
#                             u.full_name,
#                             s.language,
#                             COUNT(c.id) as message_count,
#                             MIN(c.user_message) as first_message,
#                             MAX(c.timestamp) as last_activity,
#                             COUNT(c.user_audio_path) as user_audio_count,
#                             COUNT(c.ai_audio_path) as ai_audio_count
#                         FROM sessions s
#                         LEFT JOIN users u ON s.user_id = u.user_id
#                         LEFT JOIN conversations c ON s.session_id = c.session_id
#                         GROUP BY s.session_id, u.email, u.full_name, s.language
#                         HAVING COUNT(c.id) > 0
#                         ORDER BY MAX(c.timestamp) DESC
#                         LIMIT %s
#                     """, (limit,))
#                 else:
#                     # User sees only their own sessions with audio counts
#                     cursor.execute("""
#                         SELECT 
#                             s.session_id,
#                             u.email,
#                             u.full_name,
#                             s.language,
#                             COUNT(c.id) as message_count,
#                             MIN(c.user_message) as first_message,
#                             MAX(c.timestamp) as last_activity,
#                             COUNT(c.user_audio_path) as user_audio_count,
#                             COUNT(c.ai_audio_path) as ai_audio_count
#                         FROM sessions s
#                         LEFT JOIN users u ON s.user_id = u.user_id
#                         LEFT JOIN conversations c ON s.session_id = c.session_id
#                         WHERE s.user_id = %s
#                         GROUP BY s.session_id, u.email, u.full_name, s.language
#                         HAVING COUNT(c.id) > 0
#                         ORDER BY MAX(c.timestamp) DESC
#                         LIMIT %s
#                     """, (current_user["user_id"], limit,))
                
#                 rows = cursor.fetchall()
#                 sessions = [
#                     {
#                         "session_id": row[0],
#                         "user_email": row[1],
#                         "full_name": row[2],
#                         "language": row[3],
#                         "message_count": row[4],
#                         "first_message": row[5] or "No message",
#                         "last_activity": row[6].isoformat() if row[6] else None,
#                         "user_audio_count": row[7],
#                         "ai_audio_count": row[8],
#                         "total_audio_count": row[7] + row[8]
#                     }
#                     for row in rows
#                 ]
                
#                 print(f"Returning {len(sessions)} sessions")
#                 return sessions
                
#     except Exception as e:
#         print(f"Error fetching sessions: {e}")
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/api/dashboard/session/{session_id}/messages")
# async def get_session_messages(
#     session_id: str,
#     current_user: dict = Depends(get_current_user)
# ):
#     """Get all messages for a specific session"""
#     if not db:
#         raise HTTPException(status_code=500, detail="Database not available")
    
#     try:
#         with db.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 # Check if user has access to this session
#                 if current_user["role"] != "admin":
#                     cursor.execute("""
#                         SELECT user_id FROM sessions WHERE session_id = %s
#                     """, (session_id,))
#                     session_user = cursor.fetchone()
#                     if not session_user or session_user[0] != current_user["user_id"]:
#                         raise HTTPException(status_code=403, detail="Access denied")
                
#                 # Get all messages for the session with dual audio support
#                 cursor.execute("""
#                     SELECT 
#                         id, user_message, ai_response, timestamp, 
#                         user_audio_path, ai_audio_path
#                     FROM conversations
#                     WHERE session_id = %s
#                     ORDER BY timestamp ASC
#                 """, (session_id,))
                
#                 rows = cursor.fetchall()
#                 messages = [
#                     {
#                         "id": str(row[0]),
#                         "user_message": row[1],
#                         "ai_response": row[2],
#                         "timestamp": row[3].isoformat() if row[3] else None,
#                         "user_audio_path": row[4],
#                         "ai_audio_path": row[5]
#                     }
#                     for row in rows
#                 ]
                
#                 print(f"Returning {len(messages)} messages for session {session_id}")
#                 return messages
                
#     except Exception as e:
#         print(f"Error fetching session messages: {e}")
#         raise HTTPException(status_code=500, detail=str(e))

# # ============================================
# # HEALTH CHECK ENDPOINTS
# # ============================================


# # ============================================
# # HEALTH CHECK ENDPOINTS
# # ============================================

# @app.get("/health")
# async def health_check():
#     return {
#         "status": "healthy",
#         "rag_ready": rag_system.index is not None,
#         "database_ready": db is not None,
#         "chunks_loaded": len(rag_system.chunks) if rag_system.chunks else 0,
#         "model": LLM_MODEL,
#         "approach": "translation_based",
#         "tts": "edge_tts"  # Updated to Edge TTS
#     }

# @app.get("/api/check-config")
# async def check_config():
#     return {
#         "hasRAG": rag_system.index is not None,
#         "embeddingModel": "paraphrase-multilingual-MiniLM-L12-v2",
#         "llmModel": LLM_MODEL,
#         "chunks": len(rag_system.chunks) if rag_system.chunks else 0,
#         "approach": "translation_based_like_notebook"
#     }

# # ============================================
# # STATIC FILE SERVING FOR AUDIO
# # ============================================

# # Mount the recordings directory for audio playback
# if not os.path.exists(AUDIO_STORAGE_PATH):
#     os.makedirs(AUDIO_STORAGE_PATH)
#     print(f"Created recordings directory: {AUDIO_STORAGE_PATH}")

# app.mount("/recordings", StaticFiles(directory=AUDIO_STORAGE_PATH), name="recordings")

# # ============================================
# # APPLICATION STARTUP
# # ============================================

# if __name__ == "__main__":
#     import uvicorn
    
#     # Validate critical environment variables on startup
#     if not GROQ_API_KEY:
#         print("⚠️ WARNING: GROQ_API_KEY not found. RAG responses will fail.")
    
#     if JWT_SECRET == "your-secret-key-please-change-this-in-production":
#         print("⚠️ WARNING: Using default JWT secret. Change this in production!")
    
#     print("🚀 Starting Ooredoo AI Assistant Server with Edge TTS...")
#     print(f"📊 RAG System Status: {'✅ Ready' if rag_system.index is not None else '❌ Failed'}")
#     print(f"🗄️ Database Status: {'✅ Connected' if db is not None else '❌ Not available'}")
#     print(f"🎤 TTS Status: ✅ Edge TTS (FREE)")
#     print(f"📱 SMS Service Status: {'✅ Ready' if sms_service.client is not None else '⚠️ Development mode'}")
    
#     uvicorn.run("rag_server:app", host="0.0.0.0", port=8000, reload=True)

from dotenv import load_dotenv
load_dotenv(".env.local")

# Standard library imports
import os
import re
import json
import glob
import uuid
import base64
import logging
import asyncio
import requests
from datetime import datetime, timedelta
from typing import Optional, List, AsyncIterator
from urllib.parse import parse_qs
from functools import lru_cache

# Third-party imports
import jwt
import faiss
import numpy as np
from groq import Groq
from sentence_transformers import SentenceTransformer
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Gather

# FastAPI imports
from fastapi import FastAPI, HTTPException, Depends, Header, BackgroundTasks, Request, Form
from fastapi.responses import Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import requests

# Add these environment variables
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@ooredoo.com")

# Language detection with proper error handling
try:
    from langdetect import detect
except ImportError:
    print("Installing langdetect...")
    os.system("pip install langdetect")
    from langdetect import detect

# Edge TTS for text-to-speech (replaces ElevenLabs)
try:
    import edge_tts
except ImportError:
    print("Installing edge-tts...")
    os.system("pip install edge-tts")
    import edge_tts

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

def apply_pronunciation_fixes(text: str, assistant_name: str, language: str) -> str:
    """
    Apply pronunciation fixes to text for proper name pronunciation
    
    Args:
        text: The text to fix
        assistant_name: "Slah" or "Amira"
        language: "en-US", "fr-FR", or "ar-SA"
    
    Returns:
        Fixed text with proper pronunciation hints
    """
    
    # For Arabic, use native spelling
    if language == "ar-SA":
        name_replacements = {
            "Slah": "صلاح",
            "slah": "صلاح",
            "SLAH": "صلاح",
            "Amira": "أميرة",
            "amira": "أميرة",
            "AMIRA": "أميرة",
            "B2C": "بي تو سي",
            "B2B": "بي تو بي",
            "Ooredoo": "أوريدو"
        }
        for eng_name, ar_name in name_replacements.items():
            text = text.replace(eng_name, ar_name)
    
    # For French, ensure proper spelling
    elif language == "fr-FR":
        # Ensure Slah and Amira are written clearly
        text = re.sub(r'\bSlah\b', 'Slah', text, flags=re.IGNORECASE)
        text = re.sub(r'\bAmira\b', 'Amira', text, flags=re.IGNORECASE)
        # Break down acronyms
        text = text.replace("B2C", "B deux C")
        text = text.replace("B2B", "B deux B")
    
    # For English, use phonetic hints
    elif language == "en-US":
        # Keep Slah as-is but ensure it's spelled correctly
        text = re.sub(r'\bslah\b', 'Slah', text, flags=re.IGNORECASE)
        text = re.sub(r'\bamira\b', 'Amira', text, flags=re.IGNORECASE)
        # Break down B2C/B2B for better pronunciation
        text = text.replace("B2C", "B two C")
        text = text.replace("B2B", "B two B")
    
    return text

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

# Pydantic models
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

# ============================================
# GENDER-AWARE SYSTEM PROMPTS
# ============================================

def get_gender_aware_system_prompt(assistant_id: int, language: str) -> str:
    """Get system prompt with proper gender grammar"""
    
    assistant_name = "Slah" if assistant_id == 1 else "Amira"
    is_male = assistant_id == 1
    print(f"🟢 PROMPT: id={assistant_id}, name={assistant_name}, male={is_male}, lang={language}")
    
    prompts = {
        "en-US": {
            True: f"You are {assistant_name}, a friendly human telecom advisor for Ooredoo.",
            False: f"You are {assistant_name}, a friendly human telecom advisor for Ooredoo."
        },
        "fr-FR": {
            True: f"Vous êtes {assistant_name}, un conseiller télécom humain et amical pour Ooredoo.",
            False: f"Vous êtes {assistant_name}, une conseillère télécom humaine et amicale pour Ooredoo."
        },
        "ar-SA": {
            True: f"أنت {assistant_name}، مستشار اتصالات بشري وودود في أوريدو.",
            False: f"أنت {assistant_name}، مستشارة اتصالات بشرية وودودة في أوريدو."
        }
    }
    
    result = prompts.get(language, prompts["en-US"]).get(is_male, prompts["en-US"][True])
    print(f"🟢 RETURNING: {result[:80]}...")
    return result

# Email and SMS Services
class EmailService:
    def __init__(self):
        self.sendgrid_api_key = SENDGRID_API_KEY
        self.from_email = FROM_EMAIL
        self.dev_mode = False  # Set to False to send real emails
        
    def send_verification_email(self, email: str, code: str, action: str) -> bool:
        """Send verification code via email using SendGrid"""
        
        print(f"""
        ╔══════════════════════════════════════════╗
        ║     📧 EMAIL VERIFICATION CODE           ║
        ╠══════════════════════════════════════════╣
        ║  Email: {email:<33} ║
        ║  Code:  {code:<33} ║
        ║  Action: {action:<32} ║
        ╚══════════════════════════════════════════╝
        """)
        
        # In dev mode, just show in console
        if self.dev_mode:
            print(f"📧 DEV MODE: Email reset code for {email}: {code}")
            return True
        
        # Check if SendGrid is configured
        if not self.sendgrid_api_key:
            print(f"⚠️ SendGrid not configured. Email code for {email}: {code}")
            return True
        
        try:
            # Send actual email via SendGrid
            return self._send_with_sendgrid(email, code, action)
            
        except Exception as e:
            print(f"❌ Email send failed: {e}")
            print(f"📧 Fallback - Email code for {email}: {code}")
            return False
    
    def _send_with_sendgrid(self, email: str, code: str, action: str) -> bool:
        """Send email using SendGrid API"""
        try:
            subject, html_content = self._get_email_content(code, action)
            
            # SendGrid API payload
            data = {
                "personalizations": [
                    {
                        "to": [{"email": email}],
                        "subject": subject
                    }
                ],
                "from": {
                    "email": self.from_email,
                    "name": "Ooredoo AI Assistant"
                },
                "content": [
                    {
                        "type": "text/html",
                        "value": html_content
                    }
                ]
            }
            
            # Send via SendGrid API
            response = requests.post(
                "https://api.sendgrid.com/v3/mail/send",
                headers={
                    "Authorization": f"Bearer {self.sendgrid_api_key}",
                    "Content-Type": "application/json"
                },
                json=data,
                timeout=10
            )
            
            if response.status_code == 202:
                print(f"✅ Email sent successfully to {email}")
                return True
            else:
                print(f"❌ SendGrid API error: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ SendGrid request failed: {e}")
            return False
    
    def _get_email_content(self, code: str, action: str) -> tuple:
        """Get email subject and HTML content"""
        
        subjects = {
            "register": "Verify Your Ooredoo AI Account",
            "reset_password": "Reset Your Ooredoo AI Password",
            "login": "Ooredoo AI Login Verification"
        }
        
        # Simple HTML email template
        html_template = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>{subjects.get(action, 'Verification Code')}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Ooredoo AI Assistant</h1>
            </div>
            
            <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
                <h2 style="color: #495057; margin-top: 0;">
                    {"Password Reset Request" if action == "reset_password" else "Account Verification"}
                </h2>
                
                <p style="font-size: 16px; margin-bottom: 25px;">
                    Your verification code is:
                </p>
                
                <div style="background: white; border: 2px dashed #6c757d; padding: 20px; text-align: center; margin: 25px 0; border-radius: 8px;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #495057;">{code}</span>
                </div>
                
                <p style="font-size: 14px; color: #6c757d; margin-bottom: 20px;">
                    This code will expire in <strong>10 minutes</strong>.
                </p>
                
                <p style="font-size: 14px; color: #6c757d;">
                    If you didn't request this verification, please ignore this email.
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #adb5bd;">
                <p>Ooredoo AI Assistant - Powered by AI Technology</p>
            </div>
            
        </body>
        </html>
        """
        
        subject = subjects.get(action, "Verification Code")
        return subject, html_template

class SMSService:
    def __init__(self):
        self.client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN else None
        self.dev_mode = False  # Set to False for production SMS

    def send_verification_code(self, phone: str, code: str, action: str) -> bool:
        """Send verification code via SMS or console in dev mode"""

        # Always log to console for development
        print(f"""
        ╔══════════════════════════════════════════╗
        ║     📱 VERIFICATION CODE (PRODUCTION)    ║
        ╠══════════════════════════════════════════╣
        ║  Phone: {phone:<32} ║
        ║  Code:  {code:<32} ║
        ║  Action: {action:<31} ║
        ╚══════════════════════════════════════════╝
        """)

        if self.dev_mode:
            # In dev mode, just return success without sending SMS
            return True

        if not self.client:
            print(f"⚠️ SMS service not configured. Code for {phone}: {code}")
            return True  # Return True for development

        try:
            message_body = self.get_message_body(code, action)

            message = self.client.messages.create(
                body=message_body,
                from_=TWILIO_PHONE_NUMBER,
                to=phone
            )

            print(f"✅ SMS sent to {phone}: {message.sid}")
            print(f"Message status: {message.status}")
            return True

        except Exception as e:
            print(f"❌ SMS send failed: {e}")
            # Check if it's a verification issue
            if "unverified" in str(e).lower():
                print(f"""
                ⚠️ TWILIO TRIAL ACCOUNT LIMITATION:
                The phone number {phone} is not verified in your Twilio account.
                For now, use the code shown above in the console: {code}
                """)
            return False

    def get_message_body(self, code: str, action: str) -> str:
        """Get SMS message body based on action"""
        messages = {
            "register": f"Your Ooredoo AI verification code is: {code}. This code expires in 10 minutes.",
            "reset_password": f"Your Ooredoo AI password reset code is: {code}. This code expires in 10 minutes.",
            "login": f"Your Ooredoo AI login verification code is: {code}. This code expires in 10 minutes."
        }
        return messages.get(action, f"Your verification code is: {code}")

# ============================================
# RAG SYSTEM CLASS - CORRECTED VERSION
# ============================================

class ImprovedRAGSystem:
    def __init__(self):
        self.embedding_model = None
        self.groq_client = None
        self.index = None
        self.chunks = []
        self.initialize_models()

    def initialize_models(self):
        """Initialize models with error handling"""
        try:
            print("Initializing embedding model...")
            self.embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
            print("✅ Embedding model loaded")
        except Exception as e:
            print(f"❌ Failed to load embedding model: {e}")
            return False

        if GROQ_API_KEY:
            try:
                self.groq_client = Groq(api_key=GROQ_API_KEY)
                print("✅ Groq client initialized")
            except Exception as e:
                print(f"❌ Failed to initialize Groq client: {e}")
        else:
            print("⚠️ GROQ_API_KEY not found")

        self.load_and_build_index()
        return True

    def load_multilingual_data(self):
        """Load data from all language folders and combine"""
        all_data = []
        
        # Try language-specific folders first
        for lang_folder in ["en", "fr", "ar"]:
            folder_path = f"./data/{lang_folder}/"
            files = glob.glob(f"{folder_path}use_case_*.json")
            
            for file in files:
                try:
                    with open(file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    if isinstance(data, list):
                        all_data.extend(data)
                    else:
                        all_data.append(data)
                    print(f"Loaded {file}")
                except Exception as e:
                    print(f"Error loading {file}: {e}")
        
        # Fallback to root data folder
        if not all_data:
            files = glob.glob("./data/use_case_*.json")
            for file in files:
                try:
                    with open(file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                    if isinstance(data, list):
                        all_data.extend(data)
                    else:
                        all_data.append(data)
                    print(f"Loaded {file}")
                except Exception as e:
                    print(f"Error loading {file}: {e}")
        
        print(f"Total items loaded: {len(all_data)}")
        return all_data
    
    def create_chunks(self, data):
        """Create chunks like in your notebook"""
        chunks = []
        for i, entry in enumerate(data):
            # Build comprehensive text from entry
            text_parts = []
            for k, v in entry.items():
                if isinstance(v, (str, int, float)):
                    text_parts.append(f"{k}: {v}")
                elif isinstance(v, list):
                    text_parts.append(f"{k}: {', '.join(map(str, v))}")
                elif isinstance(v, dict):
                    for sub_k, sub_v in v.items():
                        text_parts.append(f"{k}_{sub_k}: {sub_v}")
            
            text = " | ".join(text_parts)
            
            # Create chunks (same size as your notebook)
            for j in range(0, len(text), 300):
                chunk_text = text[j:j+300]
                if len(chunk_text.strip()) > 50:
                    chunks.append({
                        "id": f"{i}_{j//300}",
                        "content": chunk_text,
                        "source": entry.get("service", f"doc_{i}")
                    })
        return chunks
    
    def load_and_build_index(self):
        """Load data and build single index like your notebook"""
        if not self.embedding_model:
            print("❌ Embedding model not available")
            return False

        try:
            print("Building RAG system...")
            
            # Load all multilingual data
            all_data = self.load_multilingual_data()
            if not all_data:
                print("No data found!")
                return False
            
            # Create chunks
            self.chunks = self.create_chunks(all_data)
            print(f"Created {len(self.chunks)} chunks")
            
            if not self.chunks:
                print("No chunks created!")
                return False
            
            # Build embeddings (same as your notebook)
            print("Building embeddings...")
            embeddings = self.embedding_model.encode(
                [c["content"] for c in self.chunks],
                batch_size=32,
                show_progress_bar=True
            )
            
            # Build FAISS index
            dim = embeddings.shape[1]
            self.index = faiss.IndexFlatL2(dim)
            self.index.add(np.array(embeddings).astype("float32"))
            
            print(f"RAG system ready: {len(self.chunks)} chunks, {dim} dimensions")
            return True
            
        except Exception as e:
            print(f"RAG build failed: {e}")
            return False
    
    def detect_language(self, query: str):
        """Enhanced language detection with fallbacks"""
        try:
            detected = detect(query)
            print(f"Raw detection result: {detected}")
            
            # Map common detection results to our supported languages
            language_mapping = {
                'en': 'en',
                'fr': 'fr', 
                'ar': 'ar',
            }
            
            return language_mapping.get(detected, 'en')  # Default to English
        except Exception as e:
            print(f"Language detection failed: {e}")
            return "en"  # Default to English on failure
    
    def map_ui_language_to_response_language(self, ui_language: str) -> str:
        """Map UI language codes to response language codes"""
        language_map = {
            "en-US": "en",
            "fr-FR": "fr", 
            "ar-SA": "ar"
        }
        return language_map.get(ui_language, "en")
    
    @lru_cache(maxsize=1000)
    def translate_query(self, query: str, target_lang="en"):
        """Translation function"""
        if not self.groq_client:
            return query
            
        try:
            response = self.groq_client.chat.completions.create(
                model="llama-3.1-70b-versatile",
                messages=[
                    {"role": "system", "content": f"Translate this into {target_lang} only, without explanations."},
                    {"role": "user", "content": query}
                ],
                temperature=0.0,
                max_tokens=200
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Translation error: {e}")
            return query
    
    def search_context(self, query: str, top_k=MAX_RESULTS):
        """Search function"""
        if not self.index or not self.embedding_model:
            return []
        
        try:
            q_vec = self.embedding_model.encode([query])
            D, I = self.index.search(np.array(q_vec).astype("float32"), top_k)
            
            results = []
            for distance, idx in zip(D[0], I[0]):
                if idx < len(self.chunks):
                    results.append(self.chunks[idx]["content"])
            
            return results[:MAX_RESULTS]
        except Exception as e:
            print(f"Search error: {e}")
            return []
    
    def get_response(self, query: str, ui_language: str = "en-US", assistant_name: str = "Amira") -> str:
        """
        ✅ CORRECTED VERSION - Combines gender-aware prompts + full RAG context
        """
        if not self.groq_client:
            return self._get_fallback_response(ui_language)

        # Validate inputs
        if not query or not query.strip():
            return self._get_fallback_response(ui_language, "empty_query")
        
        if len(query) > 5000:
            query = query[:5000] + "..."
        
        # Determine assistant ID for gender-aware prompts
        assistant_id = 1 if assistant_name == "Slah" else 2
        
        # Map UI language to response language
        target_response_lang = self.map_ui_language_to_response_language(ui_language)
        print(f"🌍 UI Language: {ui_language} → Target Response: {target_response_lang}")
        
        # Check if conversation context
        is_conversation_context = "Previous conversation:" in query or ("User:" in query and "AI:" in query)
        
        if is_conversation_context:
            lines = query.split('\n')
            current_message = ""
            for line in lines:
                if line.startswith("Current user message:"):
                    current_message = line.replace("Current user message:", "").strip()
                    break
            search_query = current_message if current_message else query
            print(f"🔍 Using conversation context. Current message: {current_message[:50] if current_message else 'N/A'}...")
        else:
            search_query = query
            print(f"🔍 Single message query: {search_query[:50] if search_query else 'N/A'}...")
        
        # Detect language
        detected_lang = self.detect_language(search_query)
        print(f"🔍 Detected query language: {detected_lang}")
        
        # Translate if Arabic for better search
        if detected_lang == "ar":
            translated_search = self.translate_query(search_query, "en")
            print(f"🔄 Translated for search: {translated_search[:50] if translated_search else 'N/A'}...")
        else:
            translated_search = search_query
        
        # ✅ CRITICAL: SEARCH FOR CONTEXT - THIS WAS MISSING!
        context_results = self.search_context(translated_search)
        context = "\n".join(context_results)
        
        # Language instructions
        language_instructions = {
            "en": "Answer in English only. Be conversational and natural.",
            "fr": "Répondez uniquement en français. Soyez conversationnel et naturel.", 
            "ar": "أجب باللغة العربية فقط. كن محاوراً وطبيعياً."
        }
        
        lang_instruction = language_instructions.get(target_response_lang, language_instructions["en"])
        
        # ✅ GET GENDER-AWARE BASE PROMPT
        base_prompt = get_gender_aware_system_prompt(assistant_id, ui_language)
        
        # ✅ BUILD FULL PROMPT WITH CONTEXT, CONVERSATION, AND GENDER-AWARE BASE
        if is_conversation_context:
            prompt = f"""{base_prompt}

LANGUAGE: {lang_instruction}

CONVERSATION SO FAR:
{query}

Behavior rules:
- Keep answers short.
- Speak like a call center agent, natural and concise.
- Do not over-explain.
- If unclear, briefly ask for clarification.

KNOWLEDGE BASE:
{context}

Customer asked: {search_query}"""
        else:
            prompt = f"""{base_prompt}

LANGUAGE: {lang_instruction}

KNOWLEDGE BASE:
{context}

Customer asked: {query}"""
        
        try:
            response = self.groq_client.chat.completions.create(
                model=LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.0,
                timeout=30
            )
            
            result = response.choices[0].message.content.strip()
            
            if len(result) > 2000:
                result = result[:2000] + "... [Response truncated for clarity]"
            
            print(f"✅ Generated response from {assistant_name} in {target_response_lang}: {result[:50] if result else 'N/A'}...")
            return result if result else self._get_fallback_response(target_response_lang)
            
        except Exception as e:
            print(f"Groq API error: {e}")
            return self._get_fallback_response(target_response_lang, "api_error")

    def _get_fallback_response(self, ui_language: str, error_type: str = "general"):
        """Provide fallback responses based on language"""
        fallbacks = {
            "en-US": {
                "general": "I'm having technical difficulties. Please try again in a moment.",
                "empty_query": "I didn't receive your question clearly. Could you please repeat it?",
                "api_error": "I'm currently experiencing connectivity issues. Please try again shortly."
            },
            "fr-FR": {
                "general": "Je rencontre des difficultés techniques. Veuillez réessayer dans un moment.",
                "empty_query": "Je n'ai pas bien reçu votre question. Pourriez-vous la répéter?",
                "api_error": "Je rencontre actuellement des problèmes de connectivité. Veuillez réessayer bientôt."
            },
            "ar-SA": {
                "general": "أواجه مشاكل تقنية. يرجى المحاولة مرة أخرى.",
                "empty_query": "لم أستقبل سؤالك بوضوح. هل يمكنك إعادته؟",
                "api_error": "أواجه حاليًا مشاكل في الاتصال. يرجى المحاولة مرة أخرى قريبًا."
            }
        }
        
        lang = ui_language.split("-")[0] if "-" in ui_language else ui_language
        return fallbacks.get(ui_language, fallbacks.get(lang, fallbacks["en-US"])).get(error_type, fallbacks["en-US"]["general"])

# Helper functions
def normalize_phone_number(phone: str) -> str:
    """Normalize phone number format"""
    # Remove all non-digits
    digits_only = ''.join(filter(str.isdigit, phone))
    
    # Add country code if missing
    if len(digits_only) == 8 and digits_only.startswith('2'):  # Tunisia local number
        return f"+216{digits_only}"
    elif len(digits_only) == 11 and digits_only.startswith('216'):  # Tunisia with country code
        return f"+{digits_only}"
    elif not phone.startswith('+'):
        return f"+{digits_only}"
    else:
        return phone

def identify_caller_by_phone(phone: str) -> CallerInfo:
    """Identify if caller is a registered user"""
    if not db:
        return CallerInfo(phone=phone, is_registered=False)
    
    try:
        # Normalize phone number
        normalized_phone = normalize_phone_number(phone)
        
        # Look up user in database
        user = db.find_user_by_phone(normalized_phone)
        
        if user:
            print(f"✅ Recognized caller: {user['full_name']} ({user['email']})")
            return CallerInfo(
                phone=normalized_phone,
                is_registered=True,
                user_id=user['user_id'],
                full_name=user['full_name'],
                email=user['email']
            )
        else:
            print(f"📞 Unknown caller: {normalized_phone}")
            return CallerInfo(phone=normalized_phone, is_registered=False)
            
    except Exception as e:
        print(f"❌ Error identifying caller: {e}")
        return CallerInfo(phone=phone, is_registered=False)

def get_or_create_call_session(call_sid: str, caller_phone: str) -> CallSession:
    """Get existing call session or create new one"""
    if call_sid not in call_sessions:
        call_sessions[call_sid] = CallSession(call_sid, caller_phone)
    return call_sessions[call_sid]

def extract_user_name(input_text: str) -> Optional[str]:
    """Enhanced name extraction with multiple patterns"""
    # Convert to lowercase for pattern matching
    text_lower = input_text.lower()
    
    # Multiple patterns for name extraction
    name_patterns = [
        # English patterns
        r"my name is (\w+(?:\s+\w+)*)",
        r"i'm (\w+(?:\s+\w+)*)",
        r"i am (\w+(?:\s+\w+)*)", 
        r"call me (\w+(?:\s+\w+)*)",
        r"this is (\w+(?:\s+\w+)*)",
        r"i'm called (\w+(?:\s+\w+)*)",
        
        # French patterns
        r"je m'appelle (\w+(?:\s+\w+)*)",
        r"mon nom est (\w+(?:\s+\w+)*)",
        r"je suis (\w+(?:\s+\w+)*)",
        r"c'est (\w+(?:\s+\w+)*)",
        
        # Arabic patterns (transliterated)
        r"ismi (\w+(?:\s+\w+)*)",
        r"ana (\w+(?:\s+\w+)*)",
        
        # Common introductions
        r"hello,?\s*i'?m (\w+(?:\s+\w+)*)",
        r"hi,?\s*i'?m (\w+(?:\s+\w+)*)",
        r"bonjour,?\s*je suis (\w+(?:\s+\w+)*)",
    ]
    
    for pattern in name_patterns:
        match = re.search(pattern, text_lower, re.IGNORECASE)
        if match:
            name = match.group(1).strip()
            # Filter out common non-names
            if name not in ['good', 'fine', 'okay', 'well', 'here', 'calling', 'looking', 'trying']:
                return name.title()  # Capitalize properly
    
    return None

def extract_issue_type(input_text: str) -> Optional[str]:
    """Enhanced issue type extraction"""
    text_lower = input_text.lower()
    
    # Define issue patterns with keywords
    issue_patterns = [
        {
            "type": "billing",
            "keywords": [
                "bill", "billing", "payment", "charge", "invoice", "cost", "price", "money", "pay", "owed", "debt",
                "facture", "paiement", "coût", "prix", "argent",  # French
                "فاتورة", "دفع", "سعر", "مال", "تكلفة"  # Arabic
            ]
        },
        {
            "type": "internet",
            "keywords": [
                "internet", "wifi", "wi-fi", "connection", "slow", "outage", "speed", "broadband", "network",
                "connexion", "lent", "panne", "vitesse",  # French
                "إنترنت", "واي فاي", "اتصال", "بطيء", "سرعة", "شبكة"  # Arabic
            ]
        },
        {
            "type": "mobile",
            "keywords": [
                "phone", "mobile", "cell", "call", "text", "sms", "voicemail", "signal", "roaming",
                "téléphone", "mobile", "appel", "texto", "signal",  # French
                "هاتف", "جوال", "مكالمة", "رسالة", "إشارة"  # Arabic
            ]
        },
        {
            "type": "technical",
            "keywords": [
                "technical", "support", "help", "problem", "issue", "error", "bug", "fix", "repair", "broken",
                "technique", "aide", "problème", "erreur", "réparer",  # French
                "تقني", "مساعدة", "مشكلة", "خطأ", "إصلاح"  # Arabic
            ]
        },
        {
            "type": "account",
            "keywords": [
                "account", "login", "password", "profile", "settings", "personal", "information", "data",
                "compte", "connexion", "mot de passe", "profil", "paramètres",  # French
                "حساب", "تسجيل دخول", "كلمة مرور", "ملف شخصي", "إعدادات"  # Arabic
            ]
        },
        {
            "type": "service",
            "keywords": [
                "service", "plan", "package", "subscription", "upgrade", "downgrade", "change", "switch",
                "forfait", "abonnement", "amélioration",  # French
                "خدمة", "باقة", "اشتراك", "ترقية", "تغيير"  # Arabic
            ]
        }
    ]
    
    # Count matches for each issue type
    issue_scores = {}
    for issue in issue_patterns:
        score = 0
        for keyword in issue["keywords"]:
            if keyword in text_lower:
                score += 1
        if score > 0:
            issue_scores[issue["type"]] = score
    
    # Return the issue type with highest score
    if issue_scores:
        return max(issue_scores, key=issue_scores.get)
    
    return None

def generate_jwt_token(user_data: dict) -> str:
    """Generate JWT token for authentication"""
    payload = {
        "user_id": user_data["user_id"],
        "email": user_data["email"],
        "role": user_data["role"],
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency to get current user from JWT token"""
    token = credentials.credentials
    try:
        payload = verify_jwt_token(token)
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid authentication")

async def get_optional_user(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    """Get user if token is provided, otherwise return None (for guest access)"""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            return verify_jwt_token(token)
        except:
            return None
    return None

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


# Initialize services
rag_system = ImprovedRAGSystem()
sms_service = SMSService()
email_service = EmailService()

# FastAPI setup
app = FastAPI(title="Ooredoo AI Assistant (Corrected RAG + Edge TTS)", version="4.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# TRELLO HELPER
# ============================================

TRELLO_API_KEY = os.getenv("TRELLO_API_KEY")
TRELLO_TOKEN = os.getenv("TRELLO_TOKEN")
TRELLO_LIST_ID = os.getenv("TRELLO_LIST_ID")

def create_trello_card(title: str, description: str) -> str | None:
    """
    Create a Trello card in the configured list.
    Returns the card's short URL if successful, otherwise None.
    """
    if not (TRELLO_API_KEY and TRELLO_TOKEN and TRELLO_LIST_ID):
        print("⚠️ Trello not configured properly in environment variables")
        return None

    url = "https://api.trello.com/1/cards"
    query = {
        "idList": TRELLO_LIST_ID,
        "key": TRELLO_API_KEY,
        "token": TRELLO_TOKEN,
        "name": title,
        "desc": description,
    }

    try:
        response = requests.post(url, params=query, timeout=10)
        if response.status_code == 200:
            card = response.json()
            print(f"✅ Trello card created: {card.get('shortUrl')}")
            return card.get("shortUrl")
        else:
            print(f"❌ Trello error {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Trello request failed: {e}")
        return None

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

@app.post("/api/auth/send-verification")
async def send_verification_code(request: dict):
    """Send phone verification code"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    phone = request.get("phone")
    action = request.get("action", "register")  # register, reset_password, login

    if not phone:
        raise HTTPException(status_code=400, detail="Phone number is required")

    # Validate action
    valid_actions = ["register", "reset_password", "login"]
    if action not in valid_actions:
        raise HTTPException(status_code=400, detail=f"Invalid action. Must be one of: {valid_actions}")

    # Normalize phone number
    phone = phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
    if not phone.startswith("+"):
        if phone.startswith("0"):
            phone = "+216" + phone[1:]  # Tunisia country code
        else:
            phone = "+" + phone

    try:
        if action == "register":
            existing_user = db.find_user_by_phone(phone)
            if existing_user:
                raise HTTPException(status_code=400, detail="Phone number already registered")
        elif action == "reset_password":
            user = db.find_user_by_phone(phone)
            if not user:
                raise HTTPException(status_code=404, detail="Phone number not found")

        verification_code = db.store_verification_code(
            phone=phone,
            action=action,
            user_data=request.get("user_data")
        )

        sms_sent = sms_service.send_verification_code(phone, verification_code, action)

        if sms_sent:
            return {"message": "Verification code sent", "phone": phone, "expires_in": 600}
        else:
            raise HTTPException(status_code=500, detail="Failed to send verification code")

    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Verification error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/auth/register")
async def register(request: EnhancedRegisterRequest):
    """Register new user with phone verification"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        if request.phone and request.verification_code:
            verification_result = db.verify_phone_code(
                phone=request.phone,
                code=request.verification_code,
                action="register"
            )
            if not verification_result:
                raise HTTPException(status_code=400, detail="Invalid or expired verification code")

        user_id = db.create_user(
            email=request.email,
            password=request.password,
            phone=request.phone,
            full_name=request.full_name,
            phone_verified=bool(request.phone and request.verification_code)
        )

        if not user_id:
            raise HTTPException(status_code=400, detail="Email or phone already exists")

        return {"message": "User created", "user_id": user_id, "email": request.email}

    except Exception as e:
        print(f"❌ Registration error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/auth/login")
async def login(request: EnhancedLoginRequest):
    """Login with email or phone"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")

    try:
        login_method = "email" if request.email else "phone"
        identifier = request.email or request.phone

        user = db.authenticate_user(identifier, request.password, login_method)

        if not user:
            raise HTTPException(status_code=401, detail="Invalid credentials")

        token = generate_jwt_token(user)
        return {
            "token": token,
            "user_id": user["user_id"],
            "email": user["email"],
            "phone": user.get("phone"),
            "role": user["role"],
            "full_name": user["full_name"]
        }

    except Exception as e:
        print(f"❌ Login error: {e}")
        raise HTTPException(status_code=500, detail="Authentication service error")

@app.post("/api/auth/forgot-password")
async def forgot_password(request: dict):
    """Initiate password reset process with phone or email"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    method = request.get("method", "phone")  # "phone" or "email"
    identifier = request.get("identifier")
    
    if not identifier:
        raise HTTPException(status_code=400, detail=f"{method.title()} is required")
    
    try:
        # Find user by phone or email
        if method == "phone":
            user = db.find_user_by_phone(identifier)
        elif method == "email":
            user = db.find_user_by_email(identifier)
        else:
            raise HTTPException(status_code=400, detail="Method must be 'phone' or 'email'")
        
        if not user:
            # Don't reveal if account exists for security
            return {"message": f"If the account exists, you will receive a reset code via {method}"}
        
        # Generate verification code
        if method == "phone":
            verification_code = db.store_verification_code(
                phone=identifier,
                action="reset_password"
            )
            
            # Send SMS
            sms_sent = sms_service.send_verification_code(identifier, verification_code, "reset_password")
            
            if not sms_sent:
                raise HTTPException(status_code=500, detail="Failed to send reset code")
                
        elif method == "email":
            verification_code = db.store_email_verification_code(
                email=identifier,
                action="reset_password"
            )
            
            # Send email
            email_sent = email_service.send_verification_email(identifier, verification_code, "reset_password")
            
            if not email_sent:
                raise HTTPException(status_code=500, detail="Failed to send reset email")
        
        return {"message": f"Reset code sent successfully via {method}"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Password reset error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/auth/reset-password") 
async def reset_password(request: dict):
    """Reset password with verification code from phone or email"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    phone = request.get("phone")
    email = request.get("email") 
    verification_code = request.get("verification_code")
    new_password = request.get("new_password")
    
    if not verification_code or not new_password:
        raise HTTPException(status_code=400, detail="Verification code and new password are required")
    
    if not (phone or email):
        raise HTTPException(status_code=400, detail="Either phone or email is required")
        
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    try:
        # Verify code based on method used
        if phone:
            verification_result = db.verify_phone_code(phone, verification_code, "reset_password")
            user = db.find_user_by_phone(phone) if verification_result else None
        else:  # email
            verification_result = db.verify_email_code(email, verification_code, "reset_password") 
            user = db.find_user_by_email(email) if verification_result else None
        
        if not verification_result:
            raise HTTPException(status_code=400, detail="Invalid or expired verification code")
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update password
        success = db.update_user_password(user["user_id"], new_password)
        
        if success:
            return {"message": "Password updated successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to update password")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Password reset error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info from token"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    user = db.get_user_by_id(current_user["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

# ============================================
# PROFILE MANAGEMENT ENDPOINTS
# ============================================

@app.get("/api/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        user_profile = db.get_user_by_id(current_user["user_id"])
        if not user_profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        return user_profile
    except Exception as e:
        print(f"❌ Error fetching user profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.put("/api/profile/update")
async def update_user_profile(
    request: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update user profile"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        # Validate phone format if provided
        if request.phone:
            phone = request.phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")
            if not phone.startswith("+"):
                if phone.startswith("0"):
                    phone = "+216" + phone[1:]  # Tunisia country code
                else:
                    phone = "+" + phone
            request.phone = phone
        
        # Update user profile in database
        success = db.update_user_profile(
            user_id=current_user["user_id"],
            full_name=request.full_name,
            phone=request.phone
        )
        
        if success:
            # Get updated profile
            updated_profile = db.get_user_by_id(current_user["user_id"])
            return updated_profile
        else:
            raise HTTPException(status_code=400, detail="Failed to update profile")
            
    except Exception as e:
        print(f"❌ Error updating user profile: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/api/profile/avatar")
async def update_user_avatar(
    request: AvatarUpdateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update user avatar URL"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        success = db.update_user_avatar(current_user["user_id"], request.avatar_url)
        
        if success:
            return {
                "message": "Avatar updated successfully",
                "avatar_url": request.avatar_url
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to update avatar")
            
    except Exception as e:
        print(f"❌ Error updating user avatar: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/api/profile/avatar")
async def remove_user_avatar(current_user: dict = Depends(get_current_user)):
    """Remove user avatar"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        success = db.update_user_avatar(current_user["user_id"], None)
        
        if success:
            return {"message": "Avatar removed successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to remove avatar")
            
    except Exception as e:
        print(f"❌ Error removing user avatar: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/api/profile/stats")
async def get_user_profile_stats(current_user: dict = Depends(get_current_user)):
    """Get user profile statistics"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        stats = db.get_user_statistics(current_user["user_id"])
        return stats
    except Exception as e:
        print(f"❌ Error fetching user stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ============================================
# EDGE TTS ENDPOINTS (Replaces ElevenLabs)
# ============================================

@app.post("/api/edge-tts")
async def generate_edge_tts(request: EdgeTTSRequest):
    """Generate speech using Edge TTS with pronunciation fixes"""
    try:
        # Map assistant name
        assistant_name = "Slah" if request.voice_id.lower() == "slah" else "Amira"
        voice_name = VOICE_CONFIG[assistant_name].get(request.language)
        
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
        
    except Exception as e:
        print(f"❌ Edge TTS error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# VOICE PROCESSING ENDPOINTS
# ============================================

@app.post("/api/voice-pipeline-auth")
async def process_voice_with_auth(
    request: AuthorizedTranscriptionRequest,
    background_tasks: BackgroundTasks,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    try:
        session_id = request.sessionId or str(uuid.uuid4())
        user_id = current_user["user_id"] if current_user else None
        assistant_name = "Slah" if request.assistantId == 1 else "Amira"
        
        print(f"🎙️ Processing for user: {current_user['email'] if current_user else 'Guest'}")
        print(f"📋 Session: {session_id}")
        print(f"🤖 Assistant: {assistant_name} (ID: {request.assistantId})")
        print(f"🌍 Language: {request.language}")

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
                ai_response = f"✅ A support ticket has been created: {ticket_url}"
            else:
                ai_response = "I'll create a support ticket for you right away."
        else:
            # ✅ Generate AI response with FULL RAG CONTEXT
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
 
@app.post("/api/voice-pipeline")
async def process_voice(request: TranscriptionRequest):
    """Regular voice pipeline for guests"""
    try:
        session_id = request.sessionId or str(uuid.uuid4())
        
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
            for turn in history_to_use[-10:]:  # Use last 10 turns for context
                user_msg = turn.user if hasattr(turn, 'user') else turn.get('user', '')
                ai_msg = turn.ai if hasattr(turn, 'ai') else turn.get('ai', '')
                conversation_context += f"User: {user_msg}\nAI: {ai_msg}\n"
            conversation_context += f"\nCurrent user message: {request.transcription}\n"
        else:
            conversation_context = request.transcription
        
        # Get AI response with assistant name
        assistant_name = "Slah" if request.assistantId == 1 else "Amira"
        ai_response = rag_system.get_response(conversation_context, request.language, assistant_name)
        
        # Save to database
        if db:
            try:
                db.save_session(
                    session_id=session_id,
                    language=request.language,
                    assistant_id=request.assistantId or 1,
                    user_name=extracted_name,
                    issue_type=extracted_issue
                )
                
                db.save_conversation(
                    session_id=session_id,
                    user_message=request.transcription,
                    ai_response=ai_response,
                    language=request.language
                )
                
                # Get complete conversation history
                with db.get_connection() as conn:
                    with conn.cursor() as cursor:
                        cursor.execute("""
                            SELECT user_message, ai_response, timestamp, audio_path
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
                                "audio_path": row[3]
                            }
                            for row in rows
                        ]
                
            except Exception as db_error:
                print(f"Database save failed: {db_error}")
                conversation_history = []
        else:
            conversation_history = []

        return {
            "transcription": request.transcription,
            "aiResponse": ai_response,
            "sessionId": session_id,
            "conversationHistory": conversation_history,
        }

    except Exception as e:
        print(f"Voice processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# CONVERSATION HISTORY ENDPOINTS
# ============================================

@app.get("/api/conversation-history/{session_id}")
async def get_conversation_history_endpoint(
    session_id: str,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Get conversation history for a specific session"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                # If user is authenticated, verify they own this session
                if current_user:
                    cursor.execute("""
                        SELECT user_id FROM sessions WHERE session_id = %s
                    """, (session_id,))
                    session_owner = cursor.fetchone()
                    if session_owner and session_owner[0] != current_user["user_id"]:
                        raise HTTPException(status_code=403, detail="Access denied")
                
                # Get all conversations for this session
                cursor.execute("""
                    SELECT user_message, ai_response, timestamp, audio_path
                    FROM conversations 
                    WHERE session_id = %s 
                    ORDER BY timestamp ASC
                """, (session_id,))
                
                rows = cursor.fetchall()
                history = [
                    {
                        "user_message": row[0],
                        "ai_response": row[1], 
                        "timestamp": row[2].isoformat() if row[2] else None,
                        "audio_path": row[3]
                    }
                    for row in rows
                ]
                
                return history
                
    except Exception as e:
        print(f"Error fetching conversation history: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# DASHBOARD ENDPOINTS
# ============================================

@app.get("/api/dashboard/statistics")
async def get_dashboard_statistics(current_user: dict = Depends(get_current_user)):
    """Get statistics for dashboard"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    # Admin sees all stats, users see their own
    if current_user["role"] == "admin":
        stats = db.get_user_statistics()  # Global stats
    else:
        stats = db.get_user_statistics(current_user["user_id"])  # User's own stats
    
    return stats

@app.get("/api/dashboard/conversations")
async def get_dashboard_conversations(
    current_user: dict = Depends(get_current_user),
    limit: int = 100
):
    """Get individual conversations"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    print(f"Fetching conversations for user: {current_user['email']} (ID: {current_user['user_id']}, Role: {current_user['role']})")
    
    conversations = []
    with db.get_connection() as conn:
        with conn.cursor() as cursor:
            if current_user["role"] == "admin":
                # Admin sees all conversations with user info
                cursor.execute("""
                    SELECT 
                        c.id, c.session_id, c.user_message, c.ai_response,
                        c.timestamp, c.language, c.audio_path,
                        u.email, u.full_name
                    FROM conversations c
                    LEFT JOIN users u ON c.user_id = u.user_id
                    ORDER BY c.timestamp DESC
                    LIMIT %s
                """, (limit,))
                
                rows = cursor.fetchall()
                conversations = [
                    {
                        "id": str(row[0]) if row[0] else None,
                        "session_id": row[1],
                        "user_message": row[2] or "No message recorded",
                        "ai_response": row[3] or "No response recorded",
                        "timestamp": row[4].isoformat() if row[4] else None,
                        "language": row[5] or "en-US",
                        "audio_path": row[6],
                        "email": row[7],
                        "full_name": row[8]
                    }
                    for row in rows
                ]
            else:
                # User sees their own conversations
                cursor.execute("""
                    SELECT 
                        c.id, c.session_id, c.user_message, c.ai_response,
                        c.timestamp, c.language, c.audio_path
                    FROM conversations c
                    WHERE c.user_id = %s
                    ORDER BY c.timestamp DESC
                    LIMIT %s
                """, (current_user["user_id"], limit))
                
                rows = cursor.fetchall()
                conversations = [
                    {
                        "id": str(row[0]) if row[0] else None,
                        "session_id": row[1],
                        "user_message": row[2] or "No message recorded",
                        "ai_response": row[3] or "No response recorded", 
                        "timestamp": row[4].isoformat() if row[4] else None,
                        "language": row[5] or "en-US",
                        "audio_path": row[6]
                    }
                    for row in rows
                ]
    
    print(f"Returning {len(conversations)} conversations")
    return conversations

@app.get("/api/dashboard/users")
async def get_all_users(current_user: dict = Depends(get_current_user)):
    """Get all users (admin only)"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    return db.get_all_users()

@app.get("/api/dashboard/sessions")
async def get_conversation_sessions(
    current_user: dict = Depends(get_current_user),
    limit: int = 100
):
    """Get conversation sessions grouped by session_id with audio counts"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    print(f"Fetching sessions for user: {current_user['email']} (Role: {current_user['role']})")
    
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                if current_user["role"] == "admin":
                    # Admin sees all sessions with user info and audio counts
                    cursor.execute("""
                        SELECT 
                            s.session_id,
                            u.email,
                            u.full_name,
                            s.language,
                            COUNT(c.id) as message_count,
                            MIN(c.user_message) as first_message,
                            MAX(c.timestamp) as last_activity,
                            COUNT(c.user_audio_path) as user_audio_count,
                            COUNT(c.ai_audio_path) as ai_audio_count
                        FROM sessions s
                        LEFT JOIN users u ON s.user_id = u.user_id
                        LEFT JOIN conversations c ON s.session_id = c.session_id
                        GROUP BY s.session_id, u.email, u.full_name, s.language
                        HAVING COUNT(c.id) > 0
                        ORDER BY MAX(c.timestamp) DESC
                        LIMIT %s
                    """, (limit,))
                else:
                    # User sees only their own sessions with audio counts
                    cursor.execute("""
                        SELECT 
                            s.session_id,
                            u.email,
                            u.full_name,
                            s.language,
                            COUNT(c.id) as message_count,
                            MIN(c.user_message) as first_message,
                            MAX(c.timestamp) as last_activity,
                            COUNT(c.user_audio_path) as user_audio_count,
                            COUNT(c.ai_audio_path) as ai_audio_count
                        FROM sessions s
                        LEFT JOIN users u ON s.user_id = u.user_id
                        LEFT JOIN conversations c ON s.session_id = c.session_id
                        WHERE s.user_id = %s
                        GROUP BY s.session_id, u.email, u.full_name, s.language
                        HAVING COUNT(c.id) > 0
                        ORDER BY MAX(c.timestamp) DESC
                        LIMIT %s
                    """, (current_user["user_id"], limit,))
                
                rows = cursor.fetchall()
                sessions = [
                    {
                        "session_id": row[0],
                        "user_email": row[1],
                        "full_name": row[2],
                        "language": row[3],
                        "message_count": row[4],
                        "first_message": row[5] or "No message",
                        "last_activity": row[6].isoformat() if row[6] else None,
                        "user_audio_count": row[7],
                        "ai_audio_count": row[8],
                        "total_audio_count": row[7] + row[8]
                    }
                    for row in rows
                ]
                
                print(f"Returning {len(sessions)} sessions")
                return sessions
                
    except Exception as e:
        print(f"Error fetching sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/session/{session_id}/messages")
async def get_session_messages(
    session_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get all messages for a specific session"""
    if not db:
        raise HTTPException(status_code=500, detail="Database not available")
    
    try:
        with db.get_connection() as conn:
            with conn.cursor() as cursor:
                # Check if user has access to this session
                if current_user["role"] != "admin":
                    cursor.execute("""
                        SELECT user_id FROM sessions WHERE session_id = %s
                    """, (session_id,))
                    session_user = cursor.fetchone()
                    if not session_user or session_user[0] != current_user["user_id"]:
                        raise HTTPException(status_code=403, detail="Access denied")
                
                # Get all messages for the session with dual audio support
                cursor.execute("""
                    SELECT 
                        id, user_message, ai_response, timestamp, 
                        user_audio_path, ai_audio_path
                    FROM conversations
                    WHERE session_id = %s
                    ORDER BY timestamp ASC
                """, (session_id,))
                
                rows = cursor.fetchall()
                messages = [
                    {
                        "id": str(row[0]),
                        "user_message": row[1],
                        "ai_response": row[2],
                        "timestamp": row[3].isoformat() if row[3] else None,
                        "user_audio_path": row[4],
                        "ai_audio_path": row[5]
                    }
                    for row in rows
                ]
                
                print(f"Returning {len(messages)} messages for session {session_id}")
                return messages
                
    except Exception as e:
        print(f"Error fetching session messages: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# HEALTH CHECK ENDPOINTS
# ============================================

@app.get("/health")
async def health_check():
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

if __name__ == "__main__":
    import uvicorn
    
    # Validate critical environment variables on startup
    if not GROQ_API_KEY:
        print("⚠️ WARNING: GROQ_API_KEY not found. RAG responses will fail.")
    
    if JWT_SECRET == "your-secret-key-please-change-this-in-production":
        print("⚠️ WARNING: Using default JWT secret. Change this in production!")
    
    print("🚀 Starting Ooredoo AI Assistant Server (Corrected RAG + Edge TTS)...")
    print(f"📊 RAG System Status: {'✅ Ready' if rag_system.index is not None else '❌ Failed'}")
    print(f"🗄️ Database Status: {'✅ Connected' if db is not None else '❌ Not available'}")
    print(f"🎤 TTS Status: ✅ Edge TTS (FREE)")
    print(f"📱 SMS Service Status: {'✅ Ready' if sms_service.client is not None else '⚠️ Development mode'}")
    print(f"✅ Features: Gender-Aware Prompts + Full RAG Context + Edge TTS")
    
    uvicorn.run("rag_server:app", host="0.0.0.0", port=8000, reload=True)