"""
SMS Service for RAG Server
Handles SMS verification via Twilio
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from twilio.rest import Client
except ImportError:
    print("twilio not installed, SMS features will be limited")
    Client = None

from config import TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER


class SMSService:
    """Service for sending SMS verification codes via Twilio"""

    def __init__(self):
        self.client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) if (Client and TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN) else None
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
