import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("🔥 Edge TTS API route called")
    
    const { text, voice_id, language } = await request.json()
    console.log(`📝 Text: ${text.substring(0, 50)}...`)
    console.log(`🎤 Voice ID: ${voice_id}`)
    console.log(`🌍 Language: ${language}`)
    
    console.log("🚀 Calling Edge TTS backend...")
    
    // Call your Python backend
    const response = await fetch(`http://localhost:8000/api/edge-tts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text,
        voice_id: voice_id, // "slah" or "amira"
        language: language  // "en-US", "fr-FR", or "ar-SA"
      }),
    })
    
    console.log(`📡 Edge TTS response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Edge TTS API error:", response.status, errorText)
      return NextResponse.json({ error: `Edge TTS API error: ${errorText}` }, { status: response.status })
    }
    
    if (!response.body) {
      console.error("❌ No response body received")
      return NextResponse.json({ error: "No audio stream received" }, { status: 500 })
    }
    
    console.log("✅ Streaming audio response received")
    
    // Pass through the stream
    return new Response(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    })
    
  } catch (error) {
    console.error("❌ Server error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}