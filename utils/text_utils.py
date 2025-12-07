"""
Text utility functions for RAG Server
Contains pronunciation fixes, system prompt generation, and text extraction utilities
"""
import re
from typing import Optional


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


def clean_text(text: str) -> str:
    """Clean text by removing extra whitespace and special characters"""
    if not text:
        return ""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Strip leading/trailing whitespace
    text = text.strip()
    return text


def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate text to a maximum length with suffix"""
    if not text or len(text) <= max_length:
        return text
    return text[:max_length - len(suffix)] + suffix
