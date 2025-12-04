"""
Test script to generate sample audio for all available voices
Run: python test_all_voices.py
"""

import edge_tts
import asyncio
import os

# Create output directory
os.makedirs("voice_samples", exist_ok=True)

# Test sentences
TEST_SENTENCES = {
    "ar": "مرحباً، أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟",
    "fr": "Bonjour, je suis votre assistant intelligent. Comment puis-je vous aider aujourd'hui?",
    "en": "Hello, I'm your intelligent assistant. How can I help you today?"
}

# Voice configurations
VOICES = {
    "Arabic Male Voices": [
        ("ar-EG-ShakirNeural", "Egyptian (RECOMMENDED)", "ar"),
        ("ar-AE-HamdanNeural", "UAE/Gulf", "ar"),
        ("ar-TN-HediNeural", "Tunisian", "ar"),
        ("ar-JO-TaimNeural", "Jordanian", "ar"),
        ("ar-LB-RamiNeural", "Lebanese", "ar"),
        ("ar-SY-LaithNeural", "Syrian", "ar"),
        ("ar-BH-AliNeural", "Bahraini", "ar"),
    ],
    "Arabic Female Voices": [
        ("ar-SA-ZariyahNeural", "Saudi (RECOMMENDED)", "ar"),
        ("ar-EG-SalmaNeural", "Egyptian", "ar"),
    ],
    "French Male Voices": [
        ("fr-FR-HenriNeural", "Standard French (RECOMMENDED)", "fr"),
        ("fr-FR-AlainNeural", "Deep Voice", "fr"),
        ("fr-CA-AntoineNeural", "Canadian French", "fr"),
    ],
    "French Female Voices": [
        ("fr-FR-DeniseNeural", "Standard French (RECOMMENDED)", "fr"),
        ("fr-FR-BrigitteNeural", "Professional", "fr"),
        ("fr-CA-SylvieNeural", "Canadian French", "fr"),
    ],
    "English Male Voices": [
        ("en-US-GuyNeural", "Professional (RECOMMENDED)", "en"),
        ("en-GB-RyanNeural", "British", "en"),
        ("en-AU-WilliamNeural", "Australian", "en"),
    ],
    "English Female Voices": [
        ("en-US-JennyNeural", "Friendly (RECOMMENDED)", "en"),
        ("en-US-AriaNeural", "Professional", "en"),
        ("en-GB-SoniaNeural", "British", "en"),
    ],
}

async def generate_sample(voice_name, description, language):
    """Generate a sample audio file"""
    try:
        text = TEST_SENTENCES[language]
        filename = f"voice_samples/{voice_name}.mp3"
        
        print(f"  🎤 Generating: {voice_name} ({description})")
        
        communicate = edge_tts.Communicate(text, voice_name)
        await communicate.save(filename)
        
        print(f"  ✅ Saved: {filename}")
        return True
        
    except Exception as e:
        print(f"  ❌ Error with {voice_name}: {str(e)}")
        return False

async def main():
    print("🚀 Edge TTS Voice Sample Generator")
    print("=" * 60)
    print("\nThis will generate sample audio files for all available voices.")
    print("Files will be saved in: ./voice_samples/\n")
    
    total_voices = sum(len(voices) for voices in VOICES.values())
    generated = 0
    
    for category, voices in VOICES.items():
        print(f"\n📂 {category}")
        print("-" * 60)
        
        for voice_name, description, language in voices:
            success = await generate_sample(voice_name, description, language)
            if success:
                generated += 1
            await asyncio.sleep(0.5)  # Small delay to avoid rate limits
    
    print("\n" + "=" * 60)
    print(f"✅ Generated {generated}/{total_voices} voice samples")
    print(f"📁 Samples saved in: ./voice_samples/")
    print("\n🎧 Listen to the samples and pick your favorites!")
    print("\nTo use a voice in your app:")
    print("1. Find the voice name (e.g., 'ar-EG-ShakirNeural')")
    print("2. Update VOICE_MAP in rag_server/main.py")
    print("=" * 60)

if __name__ == "__main__":
    print("\nStarting in 2 seconds...")
    asyncio.sleep(2)
    asyncio.run(main())