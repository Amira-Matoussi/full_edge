import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phone, action } = await request.json()
    
    const response = await fetch("http://localhost:8000/api/auth/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, action }),
      signal: AbortSignal.timeout(10000)
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { error: "Verification service unavailable" },
      { status: 500 }
    )
  }
}