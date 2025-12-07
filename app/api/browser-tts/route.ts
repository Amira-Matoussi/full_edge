import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, voice_config, language } = await request.json()
    
    // Return the text and voice configuration for browser-side synthesis
    return NextResponse.json({
      text,
      voice_config,
      language,
      method: "browser_synthesis"
    })
    
  } catch (error) {
    console.error("Browser TTS API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}