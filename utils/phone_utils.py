"""
Phone utility functions for RAG Server
Handles phone number normalization and validation
"""
import re


def normalize_phone_number(phone: str) -> str:
    """
    Normalize phone number format to international format.

    Args:
        phone: Phone number in various formats

    Returns:
        Normalized phone number with + prefix
    """
    if not phone:
        return phone

    # Remove all non-digits except +
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


def validate_tunisian_phone(phone: str) -> bool:
    """
    Validate if phone number is a valid Tunisian number.

    Args:
        phone: Phone number to validate

    Returns:
        True if valid Tunisian number, False otherwise
    """
    if not phone:
        return False

    # Normalize first
    normalized = normalize_phone_number(phone)

    # Check if it starts with Tunisia country code
    if not normalized.startswith('+216'):
        return False

    # Check total length (should be +216 + 8 digits = 12 characters)
    if len(normalized) != 12:
        return False

    # Check if remaining digits are all numbers
    remaining = normalized[4:]  # After +216
    if not remaining.isdigit():
        return False

    # Valid Tunisian mobile prefixes: 2, 3, 4, 5, 7, 9
    valid_prefixes = ['2', '3', '4', '5', '7', '9']
    if remaining[0] not in valid_prefixes:
        return False

    return True


def format_phone_display(phone: str) -> str:
    """
    Format phone number for display.

    Args:
        phone: Phone number to format

    Returns:
        Formatted phone number (e.g., +216 XX XXX XXX)
    """
    if not phone:
        return phone

    normalized = normalize_phone_number(phone)

    # Format Tunisian number
    if normalized.startswith('+216') and len(normalized) == 12:
        return f"+216 {normalized[4:6]} {normalized[6:9]} {normalized[9:12]}"

    return normalized
