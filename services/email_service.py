"""
Email Service for RAG Server
Handles email verification and notifications via SendGrid
"""
import requests

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import SENDGRID_API_KEY, FROM_EMAIL


class EmailService:
    """Service for sending verification emails via SendGrid"""

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
