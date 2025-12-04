import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      )
    }

    const response = await fetch("http://localhost:8000/api/auth/me", {
      headers: {
        "Authorization": authHeader,
        "Accept": "application/json"
      }
    })

    if (response.ok) {
      const userData = await response.json()
      return NextResponse.json(userData)
    } else {
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const response = await fetch("http://localhost:8000/api/profile/update", {
      method: "PUT",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body)
    })

    if (response.ok) {
      const updatedProfile = await response.json()
      return NextResponse.json(updatedProfile)
    } else {
      const errorData = await response.json().catch(() => ({ error: "Update failed" }))
      return NextResponse.json(
        { error: errorData.error || "Failed to update profile" },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json(
      { error: "Service temporarily unavailable" },
      { status: 500 }
    )
  }
}