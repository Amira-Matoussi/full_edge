import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("🔐 Login attempt")
    
    const response = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000)
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { error: data.detail || "Invalid credentials" },
        { status: response.status }
      )
    }
  } catch (error: any) {
    console.error("❌ Login API error:", error)
    
    if (error.message?.includes('fetch failed') || error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: "Cannot connect to server. Please ensure the backend is running on port 8000." },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: "Authentication service temporarily unavailable" },
      { status: 500 }
    )
  }
}