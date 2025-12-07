import { NextRequest, NextResponse } from "next/server"

// ElevenLabs Configuration
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1/text-to-speech"

// Lahajati Configuration (CORRECT URLs from working Python script)
const LAHAJATI_API_KEY = process.env.LAHAJATI_API_KEY
const LAHAJATI_VOICES_URL = "https://lahajati.ai/api/v1/voices"
const LAHAJATI_TTS_URL = "https://lahajati.ai/api/v1/text-to-speech-pro"

interface TTSRequest {
  text: string
  voice_id: string
  language: string
}

/**
 * Unified TTS endpoint that routes to appropriate service based on language
 * - Arabic (ar-SA) → Lahajati
 * - English (en-US) → ElevenLabs
 * - French (fr-FR) → ElevenLabs
 */
export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json()
    const { text, voice_id, language } = body

    // Validate required fields
    if (!text || !voice_id || !language) {
      return NextResponse.json(
        { error: "Missing required fields: text, voice_id, language" },
        { status: 400 }
      )
    }

    console.log(`🔊 TTS Request - Language: ${language}, Voice: ${voice_id}`)

    // Route to appropriate TTS service based on language
    if (language === "ar-SA") {
      return await handleLahajatiTTS(text, voice_id)
    } else {
      return await handleElevenLabsTTS(text, voice_id)
    }

  } catch (error) {
    console.error("❌ TTS Error:", error)
    return NextResponse.json(
      { error: "Failed to process TTS request" },
      { status: 500 }
    )
  }
}

/**
 * Handle Arabic TTS using Lahajati
 * Using the EXACT API structure from the working Python script
 */
async function handleLahajatiTTS(text: string, voice_id: string) {
  if (!LAHAJATI_API_KEY) {
    console.error("❌ Lahajati API key not configured")
    return NextResponse.json(
      { error: "Lahajati API key not configured" },
      { status: 500 }
    )
  }

  try {
    console.log("🇸🇦 Using Lahajati for Arabic TTS")
    console.log(`📝 Text: ${text.substring(0, 50)}...`)
    console.log(`🎤 Voice ID: ${voice_id}`)
    
    // Lahajati Pro TTS Request (matching Python script exactly)
    const response = await fetch(LAHAJATI_TTS_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LAHAJATI_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text: text,
        id_voice: voice_id,  // Using id_voice as per Lahajati API
        version: "lahajati_text_to_speech_pro_v1",
        professional_quality: 0,
        speech_speed: 1.0
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Lahajati API error: ${response.status} - ${errorText}`)
      throw new Error(`Lahajati API error: ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()
    console.log(`✅ Lahajati TTS success - ${audioBuffer.byteLength} bytes`)

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString()
      }
    })

  } catch (error) {
    console.error("❌ Lahajati TTS failed:", error)
    return NextResponse.json(
      { error: "Lahajati TTS failed" },
      { status: 500 }
    )
  }
}

/**
 * Handle English/French TTS using ElevenLabs
 */
async function handleElevenLabsTTS(text: string, voice_id: string) {
  if (!ELEVENLABS_API_KEY) {
    console.error("❌ ElevenLabs API key not configured")
    return NextResponse.json(
      { error: "ElevenLabs API key not configured" },
      { status: 500 }
    )
  }

  try {
    console.log("🌍 Using ElevenLabs for TTS")
    console.log(`📝 Text: ${text.substring(0, 50)}...`)
    console.log(`🎤 Voice ID: ${voice_id}`)
    
    const response = await fetch(`${ELEVENLABS_API_URL}/${voice_id}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ ElevenLabs API error: ${response.status} - ${errorText}`)
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()
    console.log(`✅ ElevenLabs TTS success - ${audioBuffer.byteLength} bytes`)

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString()
      }
    })

  } catch (error) {
    console.error("❌ ElevenLabs TTS failed:", error)
    return NextResponse.json(
      { error: "ElevenLabs TTS failed" },
      { status: 500 }
    )
  }
}

/**
 * Optional: GET endpoint to list available Lahajati voices
 * Can be called from frontend to dynamically get voice options
 */
export async function GET(request: NextRequest) {
  if (!LAHAJATI_API_KEY) {
    return NextResponse.json(
      { error: "Lahajati API key not configured" },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(LAHAJATI_VOICES_URL, {
      headers: {
        "Authorization": `Bearer ${LAHAJATI_API_KEY}`,
        "Content-Type": "application/json"
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`)
    }

    const voices = await response.json()
    return NextResponse.json(voices)

  } catch (error) {
    console.error("❌ Failed to fetch Lahajati voices:", error)
    return NextResponse.json(
      { error: "Failed to fetch voices" },
      { status: 500 }
    )
  }
}