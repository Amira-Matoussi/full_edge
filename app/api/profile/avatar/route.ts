// app/api/profile/avatar/route.ts
import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('avatar') as File
    
    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory already exists, which is fine
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = path.extname(file.name)
    const filename = `avatar_${timestamp}_${randomString}${extension}`
    
    // Save file to local storage
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = path.join(uploadsDir, filename)
    
    await writeFile(filePath, buffer)
    
    // Public URL for the avatar
    const avatarUrl = `/uploads/avatars/${filename}`
    
    // Update user avatar in backend
    const updateResponse = await fetch("http://localhost:8000/api/profile/avatar", {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        avatar_url: avatarUrl
      })
    })

    if (!updateResponse.ok) {
      // If backend update fails, still return success since file is uploaded
      console.warn("Backend avatar update failed, but file uploaded successfully")
    }

    return NextResponse.json({
      message: "Avatar uploaded successfully",
      avatar_url: avatarUrl
    })

  } catch (error) {
    console.error("Avatar upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      )
    }

    // Remove avatar from backend
    const response = await fetch("http://localhost:8000/api/profile/avatar", {
      method: "DELETE",
      headers: {
        "Authorization": authHeader,
      }
    })

    if (response.ok) {
      return NextResponse.json({
        message: "Avatar removed successfully"
      })
    } else {
      return NextResponse.json(
        { error: "Failed to remove avatar" },
        { status: response.status }
      )
    }

  } catch (error) {
    console.error("Avatar delete error:", error)
    return NextResponse.json(
      { error: "Failed to remove avatar" },
      { status: 500 }
    )
  }
}