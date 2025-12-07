import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasGroqKey: !!process.env.GROQ_API_KEY,
  })
}
