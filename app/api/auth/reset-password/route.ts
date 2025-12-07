import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("🔄 Password reset attempt")
    
    const response = await fetch("http://localhost:8000/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000)
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { error: data.detail || "Password reset failed" },
        { status: response.status }
      )
    }
  } catch (error: any) {
    console.error("❌ Reset password API error:", error)
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 500 }
    )
  }
}