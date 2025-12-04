
// import { type NextRequest, NextResponse } from "next/server"

// export async function POST(request: NextRequest) {
//   try {
//     const { transcription, history, language, systemPrompt, sessionId } = (await request.json()) as {
//       transcription: string
//       history: Array<{ user: string; ai: string }>
//       language: string
//       systemPrompt?: string
//       sessionId?: string
//     }

//     if (!transcription?.trim()) {
//       return NextResponse.json({ error: "No transcription provided" }, { status: 400 })
//     }

//     const currentSessionId = sessionId || crypto.randomUUID()

//     console.log(`Processing voice request - Session: ${currentSessionId}`)
//     console.log(`Transcription: ${transcription.substring(0, 50)}...`)

//     // Call your Python RAG server
//     try {
//       const ragResponse = await fetch("http://localhost:8000/api/voice-pipeline", {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//           "Accept": "application/json"
//         },
//         body: JSON.stringify({
//           transcription,
//           history: history || [],
//           language,
//           sessionId: currentSessionId,
//           assistantId: 1,
//         }),
//         // Add timeout
//         signal: AbortSignal.timeout(30000) // 30 second timeout
//       })

//       if (!ragResponse.ok) {
//         const errorText = await ragResponse.text()
//         console.error(`RAG server error: ${ragResponse.status} - ${errorText}`)
//         throw new Error(`RAG server returned ${ragResponse.status}`)
//       }

//       const ragResult = await ragResponse.json()
      
//       console.log(`RAG response received: ${ragResult.aiResponse?.substring(0, 50)}...`)

//       return NextResponse.json({
//         transcription,
//         aiResponse: ragResult.aiResponse,
//         sessionId: currentSessionId,
//         memoryContext: {
//           conversationLength: ragResult.conversationHistory?.length || 0,
//         },
//       })

//     } catch (ragError) {
//       console.error("RAG server connection failed:", ragError)
      
//       // Fallback response when RAG server is down
//       const fallbackResponse = getFallbackResponse(transcription, language)
      
//       return NextResponse.json({
//         transcription,
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
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { transcription, history, language, systemPrompt, sessionId, audioData } = (await request.json()) as {
      transcription: string
      history: Array<{ user: string; ai: string }>
      language: string
      systemPrompt?: string
      sessionId?: string
      audioData?: string  // Add this field
    }

    if (!transcription?.trim()) {
      return NextResponse.json({ error: "No transcription provided" }, { status: 400 })
    }

    const currentSessionId = sessionId || crypto.randomUUID()

    console.log(`Processing voice request - Session: ${currentSessionId}`)
    console.log(`Transcription: ${transcription.substring(0, 50)}...`)
    console.log(`Has audio data: ${!!audioData}`) // Add this log

    // Call your Python RAG server
    try {
      const requestPayload = {
        transcription,
        history: history || [],
        language,
        sessionId: currentSessionId,
        assistantId: 1,
        audioData: audioData // Include audio data
      }

      console.log(`Sending to Python backend - Audio data size: ${audioData ? audioData.length : 0}`)

      const ragResponse = await fetch("http://localhost:8000/api/voice-pipeline", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestPayload),
        // Add timeout
        signal: AbortSignal.timeout(30000) // 30 second timeout
      })

      if (!ragResponse.ok) {
        const errorText = await ragResponse.text()
        console.error(`RAG server error: ${ragResponse.status} - ${errorText}`)
        throw new Error(`RAG server returned ${ragResponse.status}`)
      }

      const ragResult = await ragResponse.json()
      
      console.log(`RAG response received: ${ragResult.aiResponse?.substring(0, 50)}...`)
      console.log(`Audio saved: ${ragResult.audioSaved}`)

      return NextResponse.json({
        transcription,
        aiResponse: ragResult.aiResponse,
        sessionId: currentSessionId,
        conversationHistory: ragResult.conversationHistory,
        audioSaved: ragResult.audioSaved,
        memoryContext: {
          conversationLength: ragResult.conversationHistory?.length || 0,
        },
      })

    } catch (ragError) {
      console.error("RAG server connection failed:", ragError)
      
      // Fallback response when RAG server is down
      const fallbackResponse = getFallbackResponse(transcription, language)
      
      return NextResponse.json({
        transcription,
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
    "fr-FR": `J'ai entendu: "${transcription}". J'ai des problèmes techniques pour me connectner à ma base de connaissances. Veuillez réessayer dans un moment ou contacter notre équipe de support.`,
    "ar-SA": `سمعت: "${transcription}". أواجه مشاكل تقنية في الاتصال بقاعدة معرفتي. يرجى المحاولة مرة أخرى أو الاتصال بفريق الدعم.`
  }
  
  return responses[language as keyof typeof responses] || responses["en-US"]
}