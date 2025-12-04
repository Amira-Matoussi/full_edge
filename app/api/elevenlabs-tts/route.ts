// // import { NextRequest, NextResponse } from "next/server"

// export async function POST(request: NextRequest) {
//   try {
//     console.log("🔥 TTS API route called")
    
//     const { text, voice_id, language } = await request.json()
//     console.log(`📝 Text: ${text.substring(0, 50)}...`)
//     console.log(`🎤 Voice ID: ${voice_id}`)
//     console.log(`🌍 Language: ${language}`)
    
//     // Use Lahajati for Arabic, ElevenLabs for others
//     if (language === "ar-SA") {
//       return await handleLahajatiTTS(text)
//     } else {
//       return await handleElevenLabsTTS(text, voice_id)
//     }
    
//   } catch (error) {
//     console.error("❌ Server error:", error)
//     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
//   }
// }

// async function handleLahajatiTTS(text: string) {
//   const LAHAJATI_API_KEY = process.env.LAHAJATI_API_KEY
//   const LAHAJATI_VOICE_ID = process.env.LAHAJATI_VOICE_ID
  
//   if (!LAHAJATI_API_KEY) {
//     console.error("❌ No Lahajati API key found")
//     return NextResponse.json({ error: "Lahajati API key not configured" }, { status: 500 })
//   }
  
//   try {
//     console.log("🚀 Calling Lahajati API...")
    
//     // Get voices
//     const voicesResponse = await fetch("https://lahajati.ai/api/v1/voices", {
//       headers: {
//         "Authorization": `Bearer ${LAHAJATI_API_KEY}`,
//         "Content-Type": "application/json"
//       }
//     })
    
//     if (!voicesResponse.ok) {
//       throw new Error(`Failed to get voices: ${voicesResponse.status}`)
//     }
    
//     const voices = await voicesResponse.json()
//     const voiceId = LAHAJATI_VOICE_ID || voices.data[0].id_voice
    
//     console.log(`Using Lahajati voice: ${voiceId}`)
    
//     // Generate speech
//     const ttsResponse = await fetch("https://lahajati.ai/api/v1/text-to-speech-pro", {
//       method: "POST",
//       headers: {
//         "Authorization": `Bearer ${LAHAJATI_API_KEY}`,
//         "Content-Type": "application/json",
//         "Accept": "audio/mpeg"
//       },
//       body: JSON.stringify({
//         text: text,
//         id_voice: voiceId,
//         version: "lahajati_text_to_speech_pro_v1",
//         professional_quality: 0,
//         speech_speed: 1.0
//       })
//     })
    
//     if (!ttsResponse.ok) {
//       throw new Error(`Lahajati TTS failed: ${ttsResponse.status}`)
//     }
    
//     console.log("✅ Lahajati audio generated")
    
//     const audioBuffer = await ttsResponse.arrayBuffer()
    
//     return new Response(audioBuffer, {
//       headers: {
//         "Content-Type": "audio/mpeg",
//         "Cache-Control": "no-cache",
//       },
//     })
    
//   } catch (error) {
//     console.error("❌ Lahajati error:", error)
//     return NextResponse.json({ error: "Lahajati TTS failed" }, { status: 500 })
//   }
// }

// async function handleElevenLabsTTS(text: string, voiceId: string) {
//   if (!process.env.ELEVENLABS_API_KEY) {
//     console.error("❌ No ElevenLabs API key found")
//     return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 })
//   }
  
//   try {
//     console.log("🚀 Calling ElevenLabs Streaming API...")
    
//     const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
//       method: "POST",
//       headers: {
//         "Accept": "audio/mpeg",
//         "Content-Type": "application/json",
//         "xi-api-key": process.env.ELEVENLABS_API_KEY,
//       },
//       body: JSON.stringify({
//         text: text,
//         model_id: "eleven_flash_v2_5",
//         voice_settings: {
//           stability: 0.5,
//           similarity_boost: 0.5,
//           style: 0.5,
//           use_speaker_boost: true
//         },
//         output_format: "mp3_22050_32",
//         optimize_streaming_latency: 4,
//       }),
//     })
    
//     if (!response.ok) {
//       throw new Error(`ElevenLabs API error: ${response.status}`)
//     }
    
//     if (!response.body) {
//       throw new Error("No response body received")
//     }
    
//     console.log("✅ ElevenLabs audio stream received")
    
//     const stream = new ReadableStream({
//       start(controller) {
//         const reader = response.body!.getReader()
        
//         function pump(): Promise<void> {
//           return reader.read().then(({ done, value }) => {
//             if (done) {
//               controller.close()
//               return
//             }
//             controller.enqueue(value)
//             return pump()
//           }).catch(error => {
//             console.error("❌ Stream error:", error)
//             controller.error(error)
//           })
//         }
        
//         return pump()
//       }
//     })
    
//     return new Response(stream, {
//       headers: {
//         "Content-Type": "audio/mpeg",
//         "Transfer-Encoding": "chunked",
//         "Cache-Control": "no-cache",
//         "Connection": "keep-alive",
//       },
//     })
    
//   } catch (error) {
//     console.error("❌ ElevenLabs error:", error)
//     return NextResponse.json({ error: "ElevenLabs TTS failed" }, { status: 500 })
//   }
// }

import { NextRequest, NextResponse } from "next/server"

// ✅ OPTIMIZATION: Cache voice ID to avoid repeated API calls
let cachedLahajatiVoiceId: string | null = null

export async function POST(request: NextRequest) {
  try {
    console.log("🔥 TTS API route called")
    
    const { text, voice_id, language } = await request.json()
    console.log(`📝 Text: ${text.substring(0, 50)}...`)
    console.log(`🎤 Voice ID: ${voice_id}`)
    console.log(`🌍 Language: ${language}`)
    
    // Use Lahajati for Arabic, ElevenLabs for others
    if (language === "ar-SA") {
      return await handleLahajatiTTS(text)
    } else {
      return await handleElevenLabsTTS(text, voice_id)
    }
    
  } catch (error) {
    console.error("❌ Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function handleLahajatiTTS(text: string) {
  const LAHAJATI_API_KEY = process.env.LAHAJATI_API_KEY
  const LAHAJATI_VOICE_ID = process.env.LAHAJATI_VOICE_ID
  
  if (!LAHAJATI_API_KEY) {
    console.error("❌ No Lahajati API key found")
    return NextResponse.json({ error: "Lahajati API key not configured" }, { status: 500 })
  }
  
  try {
    console.log("🚀 Calling Lahajati API...")
    
    // ✅ OPTIMIZED: Use cached voice ID or env variable
    let voiceId = LAHAJATI_VOICE_ID || cachedLahajatiVoiceId
    
    // Only fetch voices list if we don't have a voice ID yet
    if (!voiceId) {
      console.log("📋 Fetching voice list (first time only)...")
      const voicesResponse = await fetch("https://lahajati.ai/api/v1/voices", {
        headers: {
          "Authorization": `Bearer ${LAHAJATI_API_KEY}`,
          "Content-Type": "application/json"
        }
      })
      
      if (!voicesResponse.ok) {
        throw new Error(`Failed to get voices: ${voicesResponse.status}`)
      }
      
      const voices = await voicesResponse.json()
      voiceId = voices.data[0].id_voice
      cachedLahajatiVoiceId = voiceId // Cache for future requests
      console.log(`🎯 Cached voice ID: ${voiceId}`)
    } else {
      console.log(`✨ Using cached voice ID: ${voiceId}`)
    }
    
    // Generate speech (this is the main call)
    const ttsResponse = await fetch("https://lahajati.ai/api/v1/text-to-speech-pro", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LAHAJATI_API_KEY}`,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text: text,
        id_voice: voiceId,
        version: "lahajati_text_to_speech_pro_v1",
        professional_quality: 0,
        speech_speed: 1.0
      })
    })
    
    if (!ttsResponse.ok) {
      throw new Error(`Lahajati TTS failed: ${ttsResponse.status}`)
    }
    
    console.log("✅ Lahajati audio generated")
    
    const audioBuffer = await ttsResponse.arrayBuffer()
    
    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
      },
    })
    
  } catch (error) {
    console.error("❌ Lahajati error:", error)
    return NextResponse.json({ error: "Lahajati TTS failed" }, { status: 500 })
  }
}

async function handleElevenLabsTTS(text: string, voiceId: string) {
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error("❌ No ElevenLabs API key found")
    return NextResponse.json({ error: "ElevenLabs API key not configured" }, { status: 500 })
  }
  
  try {
    console.log("🚀 Calling ElevenLabs Streaming API...")
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_flash_v2_5",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.5,
          use_speaker_boost: true
        },
        output_format: "mp3_22050_32",
        optimize_streaming_latency: 4,
      }),
    })
    
    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }
    
    if (!response.body) {
      throw new Error("No response body received")
    }
    
    console.log("✅ ElevenLabs audio stream received")
    
    const stream = new ReadableStream({
      start(controller) {
        const reader = response.body!.getReader()
        
        function pump(): Promise<void> {
          return reader.read().then(({ done, value }) => {
            if (done) {
              controller.close()
              return
            }
            controller.enqueue(value)
            return pump()
          }).catch(error => {
            console.error("❌ Stream error:", error)
            controller.error(error)
          })
        }
        
        return pump()
      }
    })
    
    return new Response(stream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
    
  } catch (error) {
    console.error("❌ ElevenLabs error:", error)
    return NextResponse.json({ error: "ElevenLabs TTS failed" }, { status: 500 })
  }
}