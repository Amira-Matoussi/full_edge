"""
Utility modules for RAG Server
Contains helper functions for various operations
"""
from utils.text_utils import (
    apply_pronunciation_fixes,
    get_gender_aware_system_prompt,
    extract_user_name,
    extract_issue_type,
    clean_text,
    truncate_text
)
from utils.phone_utils import (
    normalize_phone_number,
    validate_tunisian_phone,
    format_phone_display
)
from utils.audio_utils import (
    save_audio_file,
    save_ai_audio_from_edge_tts,
    save_audio_in_background,
    generate_ai_audio_in_background
)
from utils.caller_utils import identify_caller_by_phone
from utils.session_utils import get_or_create_call_session
from utils.trello_utils import create_trello_card

__all__ = [
    # Text utilities
    'apply_pronunciation_fixes',
    'get_gender_aware_system_prompt',
    'extract_user_name',
    'extract_issue_type',
    'clean_text',
    'truncate_text',
    # Phone utilities
    'normalize_phone_number',
    'validate_tunisian_phone',
    'format_phone_display',
    # Audio utilities
    'save_audio_file',
    'save_ai_audio_from_edge_tts',
    'save_audio_in_background',
    'generate_ai_audio_in_background',
    # Caller utilities
    'identify_caller_by_phone',
    # Session utilities
    'get_or_create_call_session',
    # Trello utilities
    'create_trello_card'
]
