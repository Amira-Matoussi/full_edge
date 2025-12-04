import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get authorization header from the request
    const authHeader = request.headers.get("authorization")
    
    if (!body.transcription?.trim()) {
      return NextResponse.json({ error: "No transcription provided" }, { status: 400 })
    }

    const currentSessionId = body.sessionId || crypto.randomUUID()

    console.log(`Processing authenticated voice request - Session: ${currentSessionId}`)
    console.log(`Transcription: ${body.transcription.substring(0, 50)}...`)
    console.log(`Has auth: ${!!authHeader}`)
    console.log(`Has audio data: ${!!body.audioData}`) // Add this log

    // Call your Python RAG server with authentication
    try {
      const headers: any = {
        "Content-Type": "application/json",
        "Accept": "application/json"
      }
      
      // Forward the authorization header if present
      if (authHeader) {
        headers["Authorization"] = authHeader
      }

      // IMPORTANT: Forward the audioData to the Python backend
      const requestPayload = {
        transcription: body.transcription,
        history: body.history || [],
        language: body.language,
        sessionId: currentSessionId,
        assistantId: body.assistantId || 1,
        audioData: body.audioData // This was missing!
      }

      console.log(`Sending to Python backend - Audio data size: ${body.audioData ? body.audioData.length : 0}`)

      const ragResponse = await fetch("http://localhost:8000/api/voice-pipeline-auth", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(requestPayload),
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      if (!ragResponse.ok) {
        const errorText = await ragResponse.text()
        console.error(`RAG server error: ${ragResponse.status} - ${errorText}`)
        
        // If it's an auth error, pass it through
        if (ragResponse.status === 401 || ragResponse.status === 403) {
          return NextResponse.json(
            { error: "Authentication required", details: errorText },
            { status: ragResponse.status }
          )
        }
        
        throw new Error(`RAG server returned ${ragResponse.status}`)
      }

      const ragResult = await ragResponse.json()
      
      console.log(`RAG response received: ${ragResult.aiResponse?.substring(0, 50)}...`)
      console.log(`Audio saved: ${ragResult.audioSaved}`)

      return NextResponse.json({
        transcription: body.transcription,
        aiResponse: ragResult.aiResponse,
        sessionId: currentSessionId,
        conversationHistory: ragResult.conversationHistory,
        user: ragResult.user,
        audioSaved: ragResult.audioSaved, // Include this in response
        memoryContext: {
          conversationLength: ragResult.conversationHistory?.length || 0,
        },
      })

    } catch (ragError: any) {
      console.error("RAG server connection failed:", ragError)
      
      // Check if it's a connection error
      if (ragError.message?.includes('fetch failed') || ragError.code === 'ECONNREFUSED') {
        console.log("RAG server appears to be down, providing fallback response")
      }
      
      // Fallback response when RAG server is down
      const fallbackResponse = getFallbackResponse(body.transcription, body.language)
      
      return NextResponse.json({
        transcription: body.transcription,
        aiResponse: fallbackResponse,
        sessionId: currentSessionId,
        memoryContext: {
          conversationLength: 0,
        },
      })
    }

  } catch (error) {
    console.error("Voice pipeline error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

function getFallbackResponse(transcription: string, language: string): string {
  const responses = {
    "en-US": `I heard: "${transcription}". I'm having technical issues connecting to my knowledge base right now. Please try again in a moment, or contact our support team for immediate assistance.`,
    "fr-FR": `J'ai entendu: "${transcription}". J'ai des problèmes techniques pour me connecter à ma base de connaissances. Veuillez réessayer dans un moment ou contacter notre équipe de support.`,
    "ar-SA": `سمعت: "${transcription}". أواجه مشاكل تقنية في الاتصال بقاعدة معرفتي. يرجى المحاولة مرة أخرى أو الاتصال بفريق الدعم.`
  }
  
  return responses[language as keyof typeof responses] || responses["en-US"]
}
// import { type NextRequest, NextResponse } from "next/server"

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json()
    
//     // Get authorization header from the request
//     const authHeader = request.headers.get("authorization")
    
//     if (!body.transcription?.trim()) {
//       return NextResponse.json({ error: "No transcription provided" }, { status: 400 })
//     }

//     const currentSessionId = body.sessionId || crypto.randomUUID()

//     console.log(`Processing authenticated voice request - Session: ${currentSessionId}`)
//     console.log(`Transcription: ${body.transcription.substring(0, 50)}...`)
//     console.log(`Has auth: ${!!authHeader}`)

//     // Call your Python RAG server with authentication
//     try {
//       const headers: any = {
//         "Content-Type": "application/json",
//         "Accept": "application/json"
//       }
      
//       // Forward the authorization header if present
//       if (authHeader) {
//         headers["Authorization"] = authHeader
//       }

//       const ragResponse = await fetch("http://localhost:8000/api/voice-pipeline-auth", {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify({
//           transcription: body.transcription,
//           history: body.history || [],
//           language: body.language,
//           sessionId: currentSessionId,
//           assistantId: body.assistantId || 1,
//         }),
//         signal: AbortSignal.timeout(30000) // 30 second timeout
//       })

//       if (!ragResponse.ok) {
//         const errorText = await ragResponse.text()
//         console.error(`RAG server error: ${ragResponse.status} - ${errorText}`)
        
//         // If it's an auth error, pass it through
//         if (ragResponse.status === 401 || ragResponse.status === 403) {
//           return NextResponse.json(
//             { error: "Authentication required", details: errorText },
//             { status: ragResponse.status }
//           )
//         }
        
//         throw new Error(`RAG server returned ${ragResponse.status}`)
//       }

//       const ragResult = await ragResponse.json()
      
//       console.log(`RAG response received: ${ragResult.aiResponse?.substring(0, 50)}...`)

//       return NextResponse.json({
//         transcription: body.transcription,
//         aiResponse: ragResult.aiResponse,
//         sessionId: currentSessionId,
//         conversationHistory: ragResult.conversationHistory,
//         user: ragResult.user,
//         memoryContext: {
//           conversationLength: ragResult.conversationHistory?.length || 0,
//         },
//       })

//     } catch (ragError: any) {
//       console.error("RAG server connection failed:", ragError)
      
//       // Check if it's a connection error
//       if (ragError.message?.includes('fetch failed') || ragError.code === 'ECONNREFUSED') {
//         console.log("RAG server appears to be down, providing fallback response")
//       }
      
//       // Fallback response when RAG server is down
//       const fallbackResponse = getFallbackResponse(body.transcription, body.language)
      
//       return NextResponse.json({
//         transcription: body.transcription,
//         aiResponse: fallbackResponse,
//         sessionId: currentSessionId,
//         memoryContext: {
//           conversationLength: 0,
//         },
//       })
//     }

//   } catch (error) {
//     console.error("Voice pipeline error:", error)
//     return NextResponse.json(
//       { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
//       { status: 500 }
//     )
//   }
// }

// function getFallbackResponse(transcription: string, language: string): string {
//   const responses = {
//     "en-US": `I heard: "${transcription}". I'm having technical issues connecting to my knowledge base right now. Please try again in a moment, or contact our support team for immediate assistance.`,
//     "fr-FR": `J'ai entendu: "${transcription}". J'ai des problèmes techniques pour me connecter à ma base de connaissances. Veuillez réessayer dans un moment ou contacter notre équipe de support.`,
//     "ar-SA": `سمعت: "${transcription}". أواجه مشاكل تقنية في الاتصال بقاعدة معرفتي. يرجى المحاولة مرة أخرى أو الاتصال بفريق الدعم.`
//   }
  
//   return responses[language as keyof typeof responses] || responses["en-US"]
// }