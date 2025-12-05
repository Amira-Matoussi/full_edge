"""
Caller utility functions for RAG Server
Handles caller identification and verification
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import CallerInfo
from utils.phone_utils import normalize_phone_number
from config import db


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
