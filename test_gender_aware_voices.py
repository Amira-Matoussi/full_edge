"""
Test Gender-Aware Voices
This script generates sample audio with correct gender grammar
"""

import edge_tts
import asyncio
import os

os.makedirs("gender_test_samples", exist_ok=True)

# Test sentences with CORRECT gender grammar
TEST_SENTENCES = {
    "male": {
        "ar": "مرحباً، أنا صلاح، مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟",
        "fr": "Bonjour, je suis Slah, votre assistant intelligent. Comment puis-je vous aider aujourd'hui?",
        "en": "Hello, I'm Slah, your intelligent assistant. How can I help you today?"
    },
    "female": {
        "ar": "مرحباً، أنا أميرة، مساعدتك الذكية. كيف يمكنني مساعدتك اليوم؟",
        "fr": "Bonjour, je suis Amira, votre assistante intelligente. Comment puis-je vous aider aujourd'hui?",
        "en": "Hello, I'm Amira, your intelligent assistant. How can I help you today?"
    }
}

# Voice configurations
VOICES = {
    "male": {
        "ar": "ar-EG-ShakirNeural",
        "fr": "fr-FR-HenriNeural",
        "en": "en-US-GuyNeural"
    },
    "female": {
        "ar": "ar-SA-ZariyahNeural",
        "fr": "fr-FR-DeniseNeural",
        "en": "en-US-JennyNeural"
    }
}

async def generate_sample(gender, language, voice_name, text):
    """Generate a sample audio file"""
    try:
        lang_name = {
            "ar": "Arabic",
            "fr": "French",
            "en": "English"
        }[language]
        
        filename = f"gender_test_samples/{gender}_{language}_{lang_name}.mp3"
        
        print(f"\n🎤 Generating: {gender.title()} {lang_name}")
        print(f"   Voice: {voice_name}")
        print(f"   Text: {text}")
        
        communicate = edge_tts.Communicate(text, voice_name)
        await communicate.save(filename)
        
        print(f"   ✅ Saved: {filename}")
        return True
        
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False

async def main():
    print("=" * 80)
    print("🎯 GENDER-AWARE VOICE TEST")
    print("=" * 80)
    print("\nThis will generate audio samples with CORRECT gender grammar.")
    print("Listen carefully to verify the grammar matches the voice gender!\n")
    
    total = 0
    success = 0
    
    for gender in ["male", "female"]:
        print(f"\n{'='*80}")
        print(f"👤 Testing {gender.upper()} voices ({gender == 'male' and 'Slah' or 'Amira'})")
        print(f"{'='*80}")
        
        for language in ["en", "fr", "ar"]:
            voice_name = VOICES[gender][language]
            text = TEST_SENTENCES[gender][language]
            
            result = await generate_sample(gender, language, voice_name, text)
            total += 1
            if result:
                success += 1
            
            await asyncio.sleep(0.5)
    
    print("\n" + "=" * 80)
    print(f"✅ Generated {success}/{total} samples successfully!")
    print(f"📁 Samples saved in: ./gender_test_samples/")
    print("\n🎧 WHAT TO LISTEN FOR:")
    print("=" * 80)
    
    print("\n📌 ARABIC:")
    print("   Male (Slah):   Should say 'مساعدك' (mousa3idak)")
    print("   Female (Amira): Should say 'مساعدتك' (mousa3idatak)")
    
    print("\n📌 FRENCH:")
    print("   Male (Slah):   Should say 'votre assistant'")
    print("   Female (Amira): Should say 'votre assistante'")
    
    print("\n📌 ENGLISH:")
    print("   Both: Should say 'your intelligent assistant' (gender-neutral)")
    
    print("\n" + "=" * 80)
    print("🔧 If the grammar is WRONG, it means:")
    print("   1. The AI is generating responses with wrong gender")
    print("   2. Use the updated rag_server_main_gender_aware.py file")
    print("   3. This file has gender-aware system prompts")
    print("=" * 80)

if __name__ == "__main__":
    asyncio.run(main())