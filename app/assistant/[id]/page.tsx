// "use client"

// import { useState, useRef, useCallback, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Volume2, AlertTriangle, History, ArrowLeft, Mic, MicOff, Square, Play, MessageSquare, AudioLines, User, Download, PlayCircle } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"
// import { Avatar } from "@/components/avatar"
// import Link from "next/link"
// import { useParams, useRouter } from "next/navigation"
// import Image from "next/image"
// import { useLanguage } from "@/hooks/use-language"
// import { getStatus } from "@/utils/status"

// interface ConversationTurn {
//   user: string
//   ai: string
//   timestamp: Date
//   user_audio_path?: string
//   ai_audio_path?: string
// }

// interface AssistantConfig {
//   id: number
//   name: string
//   gender: "Male" | "Female"
//   type: string
//   image: string
//   systemPrompt: string
//   features: string[]
//   color: string
//   bgColor: string
// }

// type AssistantName = "Slah" | "Amira";
// type LanguageCode = "en-US" | "fr-FR" | "ar-SA";

// const VOICE_CONFIG: Record<AssistantName, Record<LanguageCode, string>> = {
//   "Slah": {
//     "en-US": "pNInz6obpgDQGcFmaJgB",
//     "fr-FR": "pNInz6obpgDQGcFmaJgB",
//     "ar-SA": "Qp2PG6sgef1EHtrNQKnf",
//   },
//   "Amira": {
//     "en-US": "21m00Tcm4TlvDq8ikWAM",
//     "fr-FR": "21m00Tcm4TlvDq8ikWAM",
//     "ar-SA": "4wf10lgibMnboGJGCLrP",  
//   }
// }

// export default function VoiceAssistant() {
//   const params = useParams()
//   const router = useRouter()
//   const assistantId = Number.parseInt(params.id as string)
//   const { language, t, isRTL } = useLanguage()

//   // Authentication states
//   const [userId, setUserId] = useState<string | null>(null)
//   const [userEmail, setUserEmail] = useState<string | null>(null)
//   const [authToken, setAuthToken] = useState<string | null>(null)

//   const [isRecording, setIsRecording] = useState(false)
//   const [isProcessing, setIsProcessing] = useState(false)
//   const [transcription, setTranscription] = useState("")
//   const [aiResponse, setAiResponse] = useState("")
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false)
  
//   // Enhanced conversation state management
//   const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([])
//   const [currentSessionId, setCurrentSessionId] = useState<string>("")
//   const [isNewSession, setIsNewSession] = useState(true)
  
//   // Manual control states
//   const [autoMode, setAutoMode] = useState(false)
//   const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
//   const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  
//   // Add this function after useState declarations
// const pollForAudio = useCallback(async (sessionId: string, messageIndex: number) => {
//   const maxAttempts = 10
//   let attempts = 0
  
//   const poll = async () => {
//     if (attempts >= maxAttempts) {
//       console.log("⏱️ Audio polling timeout")
//       return
//     }
    
//     try {
//       const headers: any = {}
//       if (authToken) {
//         headers["Authorization"] = `Bearer ${authToken}`
//       }
      
//       const response = await fetch(`/api/conversation-history/${sessionId}`, { headers })
      
//       if (response.ok) {
//         const history = await response.json()
//         const message = history[messageIndex]
        
//         if (message?.user_audio_path || message?.ai_audio_path) {
//           console.log("✅ Audio paths available, updating UI")
          
//           setConversationHistory(prev => {
//             const updated = [...prev]
//             if (updated[messageIndex]) {
//               updated[messageIndex] = {
//                 ...updated[messageIndex],
//                 user_audio_path: message.user_audio_path,
//                 ai_audio_path: message.ai_audio_path
//               }
//             }
//             return updated
//           })
//           return // Stop polling
//         }
//       }
//     } catch (error) {
//       console.error("Polling error:", error)
//     }
    
//     attempts++
//     setTimeout(poll, 1000) // Poll every second
//   }
  
//   poll()
// }, [authToken])

//   // Audio recording states
//   const mediaRecorderRef = useRef<MediaRecorder | null>(null)
//   const audioChunksRef = useRef<Blob[]>([])
//   const streamRef = useRef<MediaStream | null>(null)
//   const recognitionRef = useRef<any>(null)
//   const finalTranscriptRef = useRef<string>("")
//   const { toast } = useToast()

//   // Check authentication on component mount
//   useEffect(() => {
//     const token = localStorage.getItem("authToken")
//     const storedUserId = localStorage.getItem("userId")
//     const storedEmail = localStorage.getItem("userEmail")
    
//     if (token && storedUserId) {
//       setAuthToken(token)
//       setUserId(storedUserId)
//       setUserEmail(storedEmail)
//     }
//   }, [])

//   // Enhanced session initialization with conversation loading
//   useEffect(() => {
//     const initializeSession = async () => {
//       if (!currentSessionId) {
//         const newSessionId = crypto.randomUUID()
//         setCurrentSessionId(newSessionId)
//         console.log("🆕 Created new session:", newSessionId)
//         setIsNewSession(true)
//       } else {
//         // Always try to load existing conversation history
//         console.log("📚 Checking for existing conversation history...")
//         await loadConversationHistory()
//       }
//     }
    
//     initializeSession()
//   }, [currentSessionId])

//   // Assistant configurations
//   const assistantConfigs: Record<number, AssistantConfig> = {
//     1: {
//       id: 1,
//       name: "Slah",
//       gender: "Male",
//       type: t("assistant.slah.type"),
//       image: "/images/slah.png",
//       systemPrompt: "",
//       features: [],
//       color: "from-blue-200 to-blue-300",
//       bgColor: "bg-blue-25",
//     },
//     2: {
//       id: 2,
//       name: "Amira", 
//       gender: "Female",
//       type: t("assistant.amira.type"),
//       image: "/images/amira.png",
//       systemPrompt: "",
//       features: [],
//       color: "from-pink-200 to-pink-300",
//       bgColor: "bg-pink-25",
//     },
//   }

//   const currentAssistant = assistantConfigs[assistantId] || assistantConfigs[1]

//   // Enhanced loadConversationHistory function
//   const loadConversationHistory = async () => {
//     if (!currentSessionId) {
//       console.log("⚠️ Cannot load history: missing session ID")
//       return
//     }
    
//     try {
//       console.log(`📚 Loading conversation history for session: ${currentSessionId}`)
      
//       const headers: any = {}
//       if (authToken) {
//         headers["Authorization"] = `Bearer ${authToken}`
//       }
      
//       const response = await fetch(`/api/conversation-history/${currentSessionId}`, {
//         headers: headers
//       })
      
//       if (response.ok) {
//         const history = await response.json()
//         console.log("📚 Loaded conversation history:", history.length, "items")
        
//         if (history.length > 0) {
//           const formattedHistory = history.map((item: any) => ({
//             user: item.user_message,
//             ai: item.ai_response,
//             timestamp: new Date(item.timestamp),
//             user_audio_path: item.user_audio_path,
//             ai_audio_path: item.ai_audio_path
//           }))
          
//           setConversationHistory(formattedHistory)
//           setIsNewSession(false)
          
//           console.log(`Restored ${history.length} previous messages`)
//         } else {
//           console.log("📝 No existing conversation found for this session")
//           setIsNewSession(true)
//         }
//       } else if (response.status === 404) {
//         console.log("📝 Session doesn't exist yet")
//         setIsNewSession(true)
//       } else {
//         console.error("Failed to load conversation history:", response.status)
//       }
//     } catch (error) {
//       console.error("Failed to load conversation history:", error)
//     }
//   }

//   // Initialize audio recording
//   const initializeAudioRecording = useCallback(async (): Promise<boolean> => {
//     try {
//       console.log("🎤 Initializing audio recording...")
      
//       if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
//         mediaRecorderRef.current.stop()
//         mediaRecorderRef.current = null
//       }
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach(track => track.stop())
//         streamRef.current = null
//       }

//       const stream = await navigator.mediaDevices.getUserMedia({ 
//         audio: {
//           echoCancellation: true,
//           noiseSuppression: true,
//           sampleRate: 44100,
//           channelCount: 1
//         }
//       })
//       streamRef.current = stream
      
//       audioChunksRef.current = []
      
//       const mimeTypes = [
//         'audio/webm;codecs=opus',
//         'audio/webm', 
//         'audio/mp4',
//         'audio/ogg'
//       ]
      
//       let selectedMimeType = ''
//       for (const mimeType of mimeTypes) {
//         if (MediaRecorder.isTypeSupported(mimeType)) {
//           selectedMimeType = mimeType
//           break
//         }
//       }
      
//       if (!selectedMimeType) {
//         console.error("❌ No supported audio MIME types found")
//         return false
//       }
      
//       const mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMimeType })
      
//       mediaRecorder.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data)
//         }
//       }
      
//       mediaRecorder.onstop = () => {
//         const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0)
//         console.log(`📹 Total audio size: ${totalSize} bytes`)
//       }

//       mediaRecorder.onerror = (event) => {
//         console.error("📹 MediaRecorder error:", event)
//       }
      
//       mediaRecorderRef.current = mediaRecorder
//       mediaRecorder.start(250)
      
//       return true
//     } catch (error) {
//       console.error("❌ Failed to initialize audio recording:", error)
//       toast({
//   title: t("error.processingFailed"),
//   description: t("error.loadingFailed"),
//   variant: "destructive"
// })
//       return false
//     }
//   }, [toast])

//   // Stop audio recording and return blob
//   const stopAudioRecording = useCallback((): Blob | null => {
//     if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//       mediaRecorderRef.current.stop()
//     }
    
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop())
//       streamRef.current = null
//     }

//     if (audioChunksRef.current.length > 0) {
//       const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
//       const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
//       audioChunksRef.current = []
//       return audioBlob
//     }
//     return null
//   }, [])

//   // Convert audio blob to base64
//   const blobToBase64 = (blob: Blob): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader()
//       reader.onloadend = () => {
//         const result = reader.result as string
//         console.log(`🔄 FileReader result length: ${result.length}`)
//         console.log(`🔄 FileReader result start: ${result.substring(0, 50)}...`)
//         resolve(result) // Return the full data URL with prefix
//       }
//       reader.onerror = (error) => {
//         console.error("🔄 FileReader error:", error)
//         reject(error)
//       }
//       reader.readAsDataURL(blob)
//     })
//   }

//   // Initialize speech recognition
//   const initializeSpeechRecognition = useCallback(() => {
//     if (!speechRecognitionSupported) return null

//     try {
//       const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
//       const recognition = new SpeechRecognition()

//       recognition.continuous = false
//       recognition.interimResults = false
//       recognition.lang = language === "ar-SA" ? "ar-EG" : language
//       recognition.maxAlternatives = 1

//       recognition.onstart = async () => {
//         console.log("🎤 Speech recognition started")
//         setIsRecording(true)
//         setTranscription("")
//         finalTranscriptRef.current = ""
        
//         const success = await initializeAudioRecording()
//         if (!success) {
//           console.error("Failed to start audio recording")
//         }
//       }

//       recognition.onresult = (event: any) => {
//         const transcript = event.results[0][0].transcript
//         console.log("🎤 Speech recognition result:", transcript)
//         setTranscription(transcript)
//         finalTranscriptRef.current = transcript
//       }

//       recognition.onend = () => {
//         console.log("🎤 Speech recognition ended")
//         setIsRecording(false)
        
//         const audioBlob = stopAudioRecording()
//         const finalTranscript = finalTranscriptRef.current
        
//         if (finalTranscript) {
//           processTranscription(finalTranscript, audioBlob)
//         }
//         finalTranscriptRef.current = ""
//       }

//       recognition.onerror = (event: any) => {
//         console.error("🎤 Speech recognition error:", event.error)
//         setIsRecording(false)
//         setIsProcessing(false)
//         setIsPlaying(false)
//         finalTranscriptRef.current = ""
//         stopAudioRecording()

//         switch (event.error) {
//           case "no-speech":
//             console.log("👂 No speech detected")
//             break
//           case "audio-capture":
//             toast({
//   title: t("error.processingFailed"),
//   description: t("error.loadingFailed"),
//   variant: "destructive",
// })
//             break
//           case "not-allowed":
//             toast({
//   title: t("error.processingFailed"), 
//   description: t("error.loadingFailed"),
//   variant: "destructive",
// })
//             break
//           default:
//             toast({
//               title: "Recognition Issue",
//               description: "Please try again.",
//               variant: "default",
//             })
//         }
//       }

//       return recognition
//     } catch (error) {
//       console.error("Failed to initialize speech recognition:", error)
//       return null
//     }
//   }, [speechRecognitionSupported, language, toast, initializeAudioRecording, stopAudioRecording])

//   // Start recording
//   const startRecording = useCallback(() => {
//     const recognition = initializeSpeechRecognition()
//     if (recognition) {
//       recognitionRef.current = recognition
//       recognition.start()
//     }
//   }, [initializeSpeechRecognition])

//   // Stop recording
//   const stopRecording = useCallback(() => {
//     if (recognitionRef.current && isRecording) {
//       recognitionRef.current.stop()
//     }
//   }, [isRecording])

//   // Enhanced processTranscription function with dual audio support
//   // Enhanced processTranscription function with dual audio support + background polling
// const processTranscription = async (transcript: string, audioBlob: Blob | null = null) => {
//   setIsProcessing(true)
//   try {
//     console.log(`📤 Processing transcription: "${transcript}"`)
//     console.log(`📤 Using session: ${currentSessionId}`)
//     console.log(`📚 Current history length: ${conversationHistory.length}`)
    
//     // Get audio data if available
//     let audioData = null
//     if (audioBlob && audioBlob.size > 0) {
//       try {
//         console.log(`🔊 Converting audio blob to base64 - Size: ${audioBlob.size} bytes, Type: ${audioBlob.type}`)
//         audioData = await blobToBase64(audioBlob)
//         console.log(`✅ Audio converted - Base64 length: ${audioData.length}`)
        
//         // Verify the base64 data looks correct
//         if (audioData.startsWith('data:audio')) {
//           console.log(`✅ Audio data format looks correct: ${audioData.substring(0, 50)}...`)
//         } else {
//           console.log(`⚠️ Audio data format may be incorrect: ${audioData.substring(0, 50)}...`)
//         }
//       } catch (error) {
//         console.error("📹 Failed to convert audio to base64:", error)
//         audioData = null
//       }
//     } else {
//       console.log("⚠️ No audio blob provided or blob is empty")
//     }

//     // Use authenticated endpoint if logged in
//     const endpoint = authToken ? "/api/voice-pipeline-auth" : "/api/voice-pipeline"
//     const headers: any = { "Content-Type": "application/json" }
    
//     if (authToken) {
//       headers["Authorization"] = `Bearer ${authToken}`
//     }

//     // Send current conversation history to maintain context
//     const requestBody = {
//       transcription: transcript,
//       history: conversationHistory.map((c) => ({ user: c.user, ai: c.ai })),
//       language: language,
//       sessionId: currentSessionId,
//       assistantId: assistantId,
//       audioData: audioData, // Include the base64 audio data
//     }

//     console.log(`📤 Sending request to ${endpoint}`)
//     console.log(`📤 Request body - Audio included: ${!!audioData}`)

//     const response = await fetch(endpoint, {
//       method: "POST",
//       headers: headers,
//       body: JSON.stringify(requestBody),
//     })

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`)
//     }

//     const result = await response.json()
//     console.log("📤 Response received:", result)
//     console.log("📤 Audio was saved:", result.audioSaved)
    
//     setAiResponse(result.aiResponse)
    
//     // ========== NEW: Start polling for audio in background ==========
//     // Calculate the message index for polling
//     const messageIndex = conversationHistory.length
//     console.log(`🔄 Starting audio polling for message index: ${messageIndex}`)
//     pollForAudio(currentSessionId, messageIndex)
//     // ================================================================
    
//     // Use the complete conversation history returned by the backend
//     if (result.conversationHistory && Array.isArray(result.conversationHistory)) {
//       console.log("🔄 Updating with complete backend history:", result.conversationHistory.length, "items")
      
//       // Convert backend format to frontend format with dual audio support
//       const backendHistory = result.conversationHistory.map((item: any) => ({
//         user: item.user || item.user_message,
//         ai: item.ai || item.ai_response,
//         timestamp: new Date(item.timestamp || Date.now()),
//         user_audio_path: item.user_audio_path,
//         ai_audio_path: item.ai_audio_path
//       }))
      
//       setConversationHistory(backendHistory)
//     } else {
//       // Fallback: add current turn to existing history
//       const newTurn: ConversationTurn = {
//         user: transcript,
//         ai: result.aiResponse,
//         timestamp: new Date(),
//         user_audio_path: result.audioSaved?.user ? result.audioSaved.user : undefined,
//         ai_audio_path: result.audioSaved?.ai ? result.audioSaved.ai : undefined
//       }
      
//       setConversationHistory((prev) => [...prev, newTurn])
//     }
    
//     setIsNewSession(false)
//     setIsProcessing(false)

//     // Play response using enhanced speakText function
//     await speakText(result.aiResponse)

//   } catch (error) {
//     console.error("❌ Error processing transcription:", error)
//     toast({
//       title: t("error.processingFailed"),
//       description: error instanceof Error ? error.message : t("error.loadingFailed"),
//       variant: "destructive",
//     })
//     setIsProcessing(false)
//   }
// }
// //   const processTranscription = async (transcript: string, audioBlob: Blob | null = null) => {
// //     setIsProcessing(true)
// //     try {
// //       console.log(`📤 Processing transcription: "${transcript}"`)
// //       console.log(`📤 Using session: ${currentSessionId}`)
// //       console.log(`📚 Current history length: ${conversationHistory.length}`)
      
// //       // Get audio data if available
// //       let audioData = null
// //       if (audioBlob && audioBlob.size > 0) {
// //         try {
// //           console.log(`🔊 Converting audio blob to base64 - Size: ${audioBlob.size} bytes, Type: ${audioBlob.type}`)
// //           audioData = await blobToBase64(audioBlob)
// //           console.log(`✅ Audio converted - Base64 length: ${audioData.length}`)
          
// //           // Verify the base64 data looks correct
// //           if (audioData.startsWith('data:audio')) {
// //             console.log(`✅ Audio data format looks correct: ${audioData.substring(0, 50)}...`)
// //           } else {
// //             console.log(`⚠️ Audio data format may be incorrect: ${audioData.substring(0, 50)}...`)
// //           }
// //         } catch (error) {
// //           console.error("📹 Failed to convert audio to base64:", error)
// //           audioData = null
// //         }
// //       } else {
// //         console.log("⚠️ No audio blob provided or blob is empty")
// //       }

// //       // Use authenticated endpoint if logged in
// //       const endpoint = authToken ? "/api/voice-pipeline-auth" : "/api/voice-pipeline"
// //       const headers: any = { "Content-Type": "application/json" }
      
// //       if (authToken) {
// //         headers["Authorization"] = `Bearer ${authToken}`
// //       }

// //       // Send current conversation history to maintain context
// //       const requestBody = {
// //         transcription: transcript,
// //         history: conversationHistory.map((c) => ({ user: c.user, ai: c.ai })),
// //         language: language,
// //         sessionId: currentSessionId,
// //         assistantId: assistantId,
// //         audioData: audioData, // Include the base64 audio data
// //       }

// //       console.log(`📤 Sending request to ${endpoint}`)
// //       console.log(`📤 Request body - Audio included: ${!!audioData}`)

// //       const response = await fetch(endpoint, {
// //         method: "POST",
// //         headers: headers,
// //         body: JSON.stringify(requestBody),
// //       })

// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`)
// //       }

// //       const result = await response.json()
// //       console.log("📤 Response received:", result)
// //       console.log("📤 Audio was saved:", result.audioSaved)
      
// //       setAiResponse(result.aiResponse)
      
// //       // Use the complete conversation history returned by the backend
// //       if (result.conversationHistory && Array.isArray(result.conversationHistory)) {
// //         console.log("🔄 Updating with complete backend history:", result.conversationHistory.length, "items")
        
// //         // Convert backend format to frontend format with dual audio support
// //         const backendHistory = result.conversationHistory.map((item: any) => ({
// //           user: item.user || item.user_message,
// //           ai: item.ai || item.ai_response,
// //           timestamp: new Date(item.timestamp || Date.now()),
// //           user_audio_path: item.user_audio_path,
// //           ai_audio_path: item.ai_audio_path
// //         }))
        
// //         setConversationHistory(backendHistory)
// //       } else {
// //         // Fallback: add current turn to existing history
// //         const newTurn: ConversationTurn = {
// //           user: transcript,
// //           ai: result.aiResponse,
// //           timestamp: new Date(),
// //           user_audio_path: result.audioSaved?.user ? result.audioSaved.user : undefined,
// //           ai_audio_path: result.audioSaved?.ai ? result.audioSaved.ai : undefined
// //         }
        
// //         setConversationHistory((prev) => [...prev, newTurn])
// //       }
      
// //       setIsNewSession(false)
// //       setIsProcessing(false)

// //       // Play response using enhanced speakText function
// //       await speakText(result.aiResponse)

// //     } catch (error) {
// //       console.error("❌ Error processing transcription:", error)
// //       toast({
// //   title: t("error.processingFailed"),
// //   description: error instanceof Error ? error.message : t("error.loadingFailed"),
// //   variant: "destructive",
// // })
// //       setIsProcessing(false)
// //     }
// //   }

//   // Enhanced startNewConversation function
//   const startNewConversation = () => {
//     const newSessionId = crypto.randomUUID()
//     setCurrentSessionId(newSessionId)
//     setConversationHistory([]) // Clear existing history
//     setTranscription("")
//     setAiResponse("")
//     setIsNewSession(true)
    
//     // Stop any current audio
//     if (currentAudio) {
//       currentAudio.pause()
//       setCurrentAudio(null)
//       setIsPlaying(false)
//       setPlayingAudio(null)
//     }
    
//     console.log("🆕 Started new conversation:", newSessionId)
    
//     toast({
//   title: t("voice.newConversationStarted"),
//   description: t("voice.previousConversationCleared"),
//   variant: "default",
// })
//   }

//   // Enhanced speakText function with pre-generated AI audio support
//   const speakText = async (text: string) => {
//     return new Promise<void>((resolve) => {
//       const playAudio = async () => {
//         try {
//           const assistantName = currentAssistant.name as AssistantName
//           const langCode = language as LanguageCode
//           const voiceId = VOICE_CONFIG[assistantName]?.[langCode] || VOICE_CONFIG["Slah"]["en-US"]
          
//           // Check if we already have AI audio for this message
//           const currentTurn = conversationHistory[conversationHistory.length - 1]
//           if (currentTurn && currentTurn.ai_audio_path && currentTurn.ai === text) {
//             // Use pre-generated audio from backend
//             console.log("🔊 Using pre-generated AI audio:", currentTurn.ai_audio_path)
//             const audioUrl = `http://localhost:8000/recordings/${currentTurn.ai_audio_path}`
//             const audio = new Audio(audioUrl)
            
//             setCurrentAudio(audio)
//             setIsPlaying(true)
//             setPlayingAudio(currentTurn.ai_audio_path)
            
//             audio.onended = () => {
//               setIsPlaying(false)
//               setCurrentAudio(null)
//               setPlayingAudio(null)
//               resolve()
              
//               if (autoMode) {
//                 setTimeout(() => {
//                   startRecording()
//                 }, 500)
//               }
//             }
            
//             audio.onerror = () => {
//               console.warn("Pre-generated audio failed, falling back to TTS")
//               // Fallback to real-time TTS
//               fallbackToTTS()
//             }
            
//             await audio.play()
//             return
//           }
          
//           // Fallback to real-time TTS if no pre-generated audio
//           fallbackToTTS()
          
//           async function fallbackToTTS() {
//             console.log("🔊 Using real-time TTS")
//             const response = await fetch("/api/elevenlabs-tts", {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 text: text,
//                 voice_id: voiceId,
//                 language: language
//               })
//             })

//             if (!response.ok) {
//               throw new Error(`TTS failed: ${response.statusText}`)
//             }

//             const audioBlob = await response.blob()
//             const audioUrl = URL.createObjectURL(audioBlob)
//             const audio = new Audio(audioUrl)
            
//             setCurrentAudio(audio)
//             setIsPlaying(true)
//             setPlayingAudio("real-time-tts")
            
//             audio.onended = () => {
//               setIsPlaying(false)
//               setCurrentAudio(null)
//               setPlayingAudio(null)
//               URL.revokeObjectURL(audioUrl)
//               resolve()
              
//               if (autoMode) {
//                 setTimeout(() => {
//                   startRecording()
//                 }, 500)
//               }
//             }
            
//             audio.onerror = () => {
//               setIsPlaying(false)
//               setCurrentAudio(null)
//               setPlayingAudio(null)
//               URL.revokeObjectURL(audioUrl)
//               resolve()
//             }
            
//             await audio.play()
//           }
          
//         } catch (error) {
//           console.error("TTS error:", error)
//           setIsPlaying(false)
//           setCurrentAudio(null)
//           setPlayingAudio(null)
//           resolve()
//         }
//       }
//       playAudio()
//     })
//   }

//   // Stop audio
//   const stopAudio = useCallback(() => {
//     if (currentAudio) {
//       currentAudio.pause()
//       currentAudio.currentTime = 0
//       setCurrentAudio(null)
//       setIsPlaying(false)
//       setPlayingAudio(null)
//     }
//   }, [currentAudio])

//   // Play recording function for dual audio support
//   const playRecording = (audioPath: string, audioType: 'user' | 'ai') => {
//     if (currentAudio) {
//       currentAudio.pause()
//       setCurrentAudio(null)
//       setIsPlaying(false)
//       setPlayingAudio(null)
//     }
    
//     if (playingAudio === audioPath) {
//       return
//     }
    
//     const audioUrl = `http://localhost:8000/recordings/${audioPath}`
//     const audio = new Audio(audioUrl)
//     setCurrentAudio(audio)
//     setIsPlaying(true)
//     setPlayingAudio(audioPath)
    
//     audio.onended = () => {
//       setIsPlaying(false)
//       setCurrentAudio(null)
//       setPlayingAudio(null)
//     }
    
//     audio.onerror = () => {
//       console.error("Error playing recording")
//       setIsPlaying(false)
//       setCurrentAudio(null)
//       setPlayingAudio(null)
//       toast({
//   title: t("error.playbackFailed"),
//   description: t("dashboard.couldNotPlayAudio"),
//   variant: "destructive"
// })
//     }
    
//     audio.play()
//   }

//   // Download audio function
//   const downloadAudio = (audioPath: string) => {
//     const link = document.createElement('a')
//     link.href = `http://localhost:8000/recordings/${audioPath}`
//     link.download = audioPath
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   // Handle logout
//   const handleLogout = () => {
//     localStorage.clear()
//     router.push("/auth/login")
//   }

//   // Check browser support
//   useEffect(() => {
//     const speechSupported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window
//     setSpeechRecognitionSupported(speechSupported)
//   }, [])

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
//         mediaRecorderRef.current.stop()
//       }
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach(track => track.stop())
//       }
//     }
//   }, [])

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20">
//       <div className="max-w-6xl mx-auto px-4 py-8">
        
//         {/* Header with Controls */}
//         <div className="flex items-center justify-between mb-8">
//           <Link href="/assistant">
//             <Button variant="outline" size="sm">
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               {t("common.back")}
//             </Button>
//           </Link>
          
//           {/* Controls */}
//           <div className="flex items-center gap-4">
//             <Button 
//               onClick={startNewConversation}
//               variant="outline" 
//               size="sm"
//               disabled={isRecording || isProcessing}
//             >
//               {t("voice.newConversation")}
//             </Button>
            
//             {/* <label className="flex items-center">
//   <input
//     type="checkbox"
//     checked={autoMode}
//     onChange={(e) => setAutoMode(e.target.checked)}
//   />
//   {t("voice.autoMode")}
// </label> */}
//           </div>
//         </div>

//         {/* Session Info */}
//         {/* Session Info */}
// {/* <div className="text-center mb-4">
//   <p className="text-sm text-gray-600">
//     {t("voice.messages")}: {conversationHistory.length}
//     {playingAudio && (
//       <span className="ml-2 text-blue-600">
//         • {t("voice.playing")}: {playingAudio === 'real-time-tts' ? t("voice.realTimeTTS") : playingAudio}
//       </span>
//     )}
//   </p>
// </div> */}

//         {/* Manual Control Buttons */}
//         <div className="flex justify-center mb-8">
//           <div className="flex gap-4">
//             {/* {!isRecording ? (
//               <Button
//                 onClick={startRecording}
//                 disabled={isProcessing || isPlaying}
//                 className="bg-red-500 hover:bg-red-600 text-white px-6 py-3"
//               >
//                 <Mic className="w-5 h-5 mr-2" />
//                 Start Recording
//               </Button>
//             ) : (
//               <Button
//                 onClick={stopRecording}
//                 className="bg-red-700 hover:bg-red-800 text-white px-6 py-3"
//               >
//                 <MicOff className="w-5 h-5 mr-2" />
//                 Stop Recording
//               </Button>
//             )}

//             {aiResponse && !isPlaying && (
//               <Button
//                 onClick={() => speakText(aiResponse)}
//                 disabled={isRecording || isProcessing}
//                 className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
//               >
//                 <Play className="w-5 h-5 mr-2" />
//                 Play Response
//               </Button>
//             )}

//             {isPlaying && (
//               <Button
//                 onClick={stopAudio}
//                 className="bg-red-500 hover:bg-red-600 text-white px-6 py-3"
//               >
//                 <Square className="w-5 h-5 mr-2" />
//                 Stop Audio
//               </Button>
//             )} */}
//             {!isRecording ? (
//   <Button
//     onClick={startRecording}
//     disabled={isProcessing || isPlaying}
//     className="bg-red-500 hover:bg-red-600 text-white px-6 py-3"
//   >
//     <Mic className="w-5 h-5 mr-2" />
//     {t("voice.startRecording")}
//   </Button>
// ) : (
//   <Button
//     onClick={stopRecording}
//     className="bg-red-700 hover:bg-red-800 text-white px-6 py-3"
//   >
//     <MicOff className="w-5 h-5 mr-2" />
//     {t("voice.stopRecording")}
//   </Button>
// )}

// {aiResponse && !isPlaying && (
//   <Button
//     onClick={() => speakText(aiResponse)}
//     disabled={isRecording || isProcessing}
//     className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
//   >
//     <Play className="w-5 h-5 mr-2" />
//     {t("voice.playResponse")}
//   </Button>
// )}

// {isPlaying && (
//   <Button
//     onClick={stopAudio}
//     className="bg-red-500 hover:bg-red-600 text-white px-6 py-3"
//   >
//     <Square className="w-5 h-5 mr-2" />
//     {t("voice.stopAudio")}
//   </Button>
// )}
//           </div>
//         </div>

//         {/* Avatar */}
//         <div className="flex justify-center mb-8">
//           <Avatar
//             assistantId={assistantId}
//             isListening={isRecording}
//             isProcessing={isProcessing}
//             isSpeaking={isPlaying}
//             hasConversationStarted={conversationHistory.length > 0}
//             status={getStatus(isRecording, isProcessing, isPlaying, conversationHistory.length)}
//             onToggleListening={() => {}}
//             onInterrupt={() => {}}
//           />
//         </div>

//         {/* Enhanced Full Conversation History Display with Dual Audio */}
//         <div className="max-w-4xl mx-auto mb-8">
//           <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-6">
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-gray-800 flex items-center">
//   <MessageSquare className="w-5 h-5 mr-2" />
//   {t("voice.conversation")}
// </h3>

//               <div className="flex items-center space-x-2 text-sm text-gray-600">
//   <span className="bg-blue-100 px-2 py-1 rounded-full">
//     {conversationHistory.length} {t("voice.messages")}
//   </span>
// </div>
//             </div>
            
//             {conversationHistory.length === 0 ? (
//               <div className="text-center py-12">
//                 <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
//                   <MessageSquare className="w-8 h-8 text-indigo-600" />
//                 </div>
//                 <p className="text-gray-500 text-lg mb-2">{t("voice.startConversation")}</p>
//                 <p className="text-gray-400 text-sm">{t("voice.messagesWillAppear")}</p>
//               </div>
//             ) : (
//               <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
//                 {conversationHistory.map((turn, index) => (
//                   <div key={index} className="space-y-3">
//                     {/* User Message */}
//                     <div className="flex justify-end">
//                       <div className="group max-w-[75%]">
//                         <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg">
//                           <p className="text-sm leading-relaxed">{turn.user}</p>
//                         </div>
//                         <div className="flex items-center justify-end mt-1 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                           <span className="text-xs text-gray-400">
//                             {turn.timestamp.toLocaleTimeString([], { 
//                               hour: '2-digit', 
//                               minute: '2-digit' 
//                             })}
//                           </span>
//                           {turn.user_audio_path && (
//                             <div className="flex items-center gap-1">
//                               {playingAudio === turn.user_audio_path ? (
//                                 <Button
//                                   size="sm"
//                                   variant="secondary"
//                                   onClick={stopAudio}
//                                   className="h-6 px-2"
//                                 >
//                                   <Square className="w-3 h-3" />
//                                 </Button>
//                               ) : (
//                                 <Button
//                                   size="sm"
//                                   variant="secondary"
//                                   onClick={() => playRecording(turn.user_audio_path!, 'user')}
//                                   className="h-6 px-2"
//                                 >
//                                   <PlayCircle className="w-3 h-3" />
//                                 </Button>
//                               )}
//                               <Button
//   size="sm"
//   variant="ghost"
//   onClick={() => downloadAudio(turn.user_audio_path!)}
//   className="h-6 px-2"
//   title={t("dashboard.downloadAudio")}
// >
//   <Download className="w-3 h-3" />
// </Button>
//                             </div>
//                           )}
//                           <User className="w-3 h-3 text-gray-400" />
//                         </div>
//                       </div>
//                     </div>
                    
//                     {/* AI Response */}
//                     <div className="flex justify-start">
//                       <div className="group max-w-[75%]">
//                         <div className="flex items-start space-x-3">
//                           <div className="flex-shrink-0">
//                             <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md">
//                               <Image
//                                 src={currentAssistant.image}
//                                 alt={currentAssistant.name}
//                                 width={32}
//                                 height={32}
//                                 className="w-full h-full object-cover"
//                               />
//                             </div>
//                           </div>
//                           <div className="flex-1">
//                             <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
//                               <div className="flex items-center mb-1">
//                                 <span className="text-xs font-medium text-gray-600">
//                                   {currentAssistant.name}
//                                 </span>
//                               </div>
//                               <p className="text-sm text-gray-800 leading-relaxed">{turn.ai}</p>
//                             </div>
//                             <div className="flex items-center mt-1 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                               <span className="text-xs text-gray-400">
//                                 {turn.timestamp.toLocaleTimeString([], { 
//                                   hour: '2-digit', 
//                                   minute: '2-digit' 
//                                 })}
//                               </span>
//                               {turn.ai_audio_path && (
//                                 <div className="flex items-center gap-1">
//                                   {playingAudio === turn.ai_audio_path ? (
//                                     <Button
//                                       size="sm"
//                                       variant="secondary"
//                                       onClick={stopAudio}
//                                       className="h-6 px-2"
//                                     >
//                                       <Square className="w-3 h-3" />
//                                     </Button>
//                                   ) : (
//                                     <Button
//                                       size="sm"
//                                       variant="secondary"
//                                       onClick={() => playRecording(turn.ai_audio_path!, 'ai')}
//                                       className="h-6 px-2"
//                                     >
//                                       <Volume2 className="w-3 h-3" />
//                                     </Button>
//                                   )}
//                                   <Button
//   size="sm"
//   variant="ghost"
//   onClick={() => downloadAudio(turn.ai_audio_path!)}
//   className="h-6 px-2"
//   title={t("dashboard.downloadAiAudio")}
// >
//   <Download className="w-3 h-3" />
// </Button>
//                                 </div>
//                               )}
//                               <div className="w-2 h-2 bg-green-400 rounded-full"></div>
//                               <span className="text-xs text-gray-400">AI Assistant</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Current Interaction Bubble (if active) */}
//         {/* {(transcription || (aiResponse && conversationHistory.length === 0)) && (
//           <div className="max-w-4xl mx-auto mb-6">
//             <div className="bg-gradient-to-r from-indigo-50 to-purple-50 backdrop-blur-md rounded-2xl border border-indigo-200 shadow-xl p-6">
//               <div className="flex items-center mb-4">
//                 <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse mr-2"></div>
//                 <span className="text-sm font-medium text-indigo-700">{t("voice.currentInteraction")}</span>
//               </div>
              
//               {transcription && (
//                 <div className="space-y-3 mb-4">
//                   <div className="flex justify-end">
//                     <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg max-w-[75%]">
//                       <p className="text-sm leading-relaxed italic">"{transcription}"</p>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {aiResponse && conversationHistory.length === 0 && (
//                 <div className="space-y-3">
//                   <div className="flex justify-start">
//                     <div className="flex items-start space-x-3 max-w-[75%]">
//                       <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md">
//                         <Image
//                           src={currentAssistant.image}
//                           alt={currentAssistant.name}
//                           width={32}
//                           height={32}
//                           className="w-full h-full object-cover"
//                         />
//                       </div>
//                       <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
//                         <div className="flex items-center mb-1">
//                           <span className="text-xs font-medium text-gray-600">
//                             {currentAssistant.name}
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-800 leading-relaxed">{aiResponse}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         )} */}

//         {/* Status Display */}
//         <div className="text-center text-lg font-medium text-gray-700">
//           {isRecording && t("voice.listening")}
//           {isProcessing && t("voice.thinking")}
//           {isPlaying && t("voice.speaking")}
//           {!isRecording && !isProcessing && !isPlaying && (
//   conversationHistory.length === 0 ? t("voice.readyForNext") : t("voice.ready")
// )}
//         </div>
//       </div>

//       {/* Custom Scrollbar Styles */}
//       <style jsx>{`
//         .custom-scrollbar::-webkit-scrollbar {
//           width: 6px;
//         }
        
//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: #f1f5f9;
//           border-radius: 3px;
//         }
        
//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #cbd5e1;
//           border-radius: 3px;
//         }
        
//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #94a3b8;
//         }
//       `}</style>
//     </div>
//   )
// }

"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Volume2, AlertTriangle, History, ArrowLeft, Mic, MicOff, Square, Play, MessageSquare, AudioLines, User, Download, PlayCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Avatar } from "@/components/avatar"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { useLanguage } from "@/hooks/use-language"
import { getStatus } from "@/utils/status"

interface ConversationTurn {
  user: string
  ai: string
  timestamp: Date
  user_audio_path?: string
  ai_audio_path?: string
}

interface AssistantConfig {
  id: number
  name: string
  gender: "Male" | "Female"
  type: string
  image: string
  systemPrompt: string
  features: string[]
  color: string
  bgColor: string
}

type AssistantName = "Slah" | "Amira";
type LanguageCode = "en-US" | "fr-FR" | "ar-SA";

// const VOICE_CONFIG: Record<AssistantName, Record<LanguageCode, string>> = {
//   "Slah": {
//     "en-US": "pNInz6obpgDQGcFmaJgB",
//     "fr-FR": "pNInz6obpgDQGcFmaJgB",
//     "ar-SA": "Qp2PG6sgef1EHtrNQKnf",
//   },
//   "Amira": {
//     "en-US": "21m00Tcm4TlvDq8ikWAM",
//     "fr-FR": "21m00Tcm4TlvDq8ikWAM",
//     "ar-SA": "4wf10lgibMnboGJGCLrP",  
//   }
// }

export default function VoiceAssistant() {
  const params = useParams()
  const router = useRouter()
  const assistantId = Number.parseInt(params.id as string)
  const { language, t, isRTL } = useLanguage()

  // Authentication states
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcription, setTranscription] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isPlaying, setIsPlaying] = useState(false)
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false)
  
  // Enhanced conversation state management
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [isNewSession, setIsNewSession] = useState(true)
  
  // Manual control states
  const [autoMode, setAutoMode] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  
  // Add this function after useState declarations
const pollForAudio = useCallback(async (sessionId: string, messageIndex: number) => {
  const maxAttempts = 10
  let attempts = 0
  
  const poll = async () => {
    if (attempts >= maxAttempts) {
      console.log("⏱️ Audio polling timeout")
      return
    }
    
    try {
      const headers: any = {}
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }
      
      const response = await fetch(`/api/conversation-history/${sessionId}`, { headers })
      
      if (response.ok) {
        const history = await response.json()
        const message = history[messageIndex]
        
        if (message?.user_audio_path || message?.ai_audio_path) {
          console.log("✅ Audio paths available, updating UI")
          
          setConversationHistory(prev => {
            const updated = [...prev]
            if (updated[messageIndex]) {
              updated[messageIndex] = {
                ...updated[messageIndex],
                user_audio_path: message.user_audio_path,
                ai_audio_path: message.ai_audio_path
              }
            }
            return updated
          })
          return // Stop polling
        }
      }
    } catch (error) {
      console.error("Polling error:", error)
    }
    
    attempts++
    setTimeout(poll, 1000) // Poll every second
  }
  
  poll()
}, [authToken])

  // Audio recording states
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recognitionRef = useRef<any>(null)
  const finalTranscriptRef = useRef<string>("")
  const { toast } = useToast()

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const storedUserId = localStorage.getItem("userId")
    const storedEmail = localStorage.getItem("userEmail")
    
    if (token && storedUserId) {
      setAuthToken(token)
      setUserId(storedUserId)
      setUserEmail(storedEmail)
    }
  }, [])

  // Enhanced session initialization with conversation loading
  useEffect(() => {
    const initializeSession = async () => {
      if (!currentSessionId) {
        const newSessionId = crypto.randomUUID()
        setCurrentSessionId(newSessionId)
        console.log("🆕 Created new session:", newSessionId)
        setIsNewSession(true)
      } else {
        // Always try to load existing conversation history
        console.log("📚 Checking for existing conversation history...")
        await loadConversationHistory()
      }
    }
    
    initializeSession()
  }, [currentSessionId])

  // Assistant configurations
  const assistantConfigs: Record<number, AssistantConfig> = {
    1: {
      id: 1,
      name: "Slah",
      gender: "Male",
      type: t("assistant.slah.type"),
      image: "/images/slah.png",
      systemPrompt: "",
      features: [],
      color: "from-blue-200 to-blue-300",
      bgColor: "bg-blue-25",
    },
    2: {
      id: 2,
      name: "Amira", 
      gender: "Female",
      type: t("assistant.amira.type"),
      image: "/images/amira.png",
      systemPrompt: "",
      features: [],
      color: "from-pink-200 to-pink-300",
      bgColor: "bg-pink-25",
    },
  }

  const currentAssistant = assistantConfigs[assistantId] || assistantConfigs[1]

  // Enhanced loadConversationHistory function
  const loadConversationHistory = async () => {
    if (!currentSessionId) {
      console.log("⚠️ Cannot load history: missing session ID")
      return
    }
    
    try {
      console.log(`📚 Loading conversation history for session: ${currentSessionId}`)
      
      const headers: any = {}
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }
      
      const response = await fetch(`/api/conversation-history/${currentSessionId}`, {
        headers: headers
      })
      
      if (response.ok) {
        const history = await response.json()
        console.log("📚 Loaded conversation history:", history.length, "items")
        
        if (history.length > 0) {
          const formattedHistory = history.map((item: any) => ({
            user: item.user_message,
            ai: item.ai_response,
            timestamp: new Date(item.timestamp),
            user_audio_path: item.user_audio_path,
            ai_audio_path: item.ai_audio_path
          }))
          
          setConversationHistory(formattedHistory)
          setIsNewSession(false)
          
          console.log(`Restored ${history.length} previous messages`)
        } else {
          console.log("📝 No existing conversation found for this session")
          setIsNewSession(true)
        }
      } else if (response.status === 404) {
        console.log("📝 Session doesn't exist yet")
        setIsNewSession(true)
      } else {
        console.error("Failed to load conversation history:", response.status)
      }
    } catch (error) {
      console.error("Failed to load conversation history:", error)
    }
  }

  // Initialize audio recording
  const initializeAudioRecording = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🎤 Initializing audio recording...")
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
        mediaRecorderRef.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        }
      })
      streamRef.current = stream
      
      audioChunksRef.current = []
      
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm', 
        'audio/mp4',
        'audio/ogg'
      ]
      
      let selectedMimeType = ''
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType
          break
        }
      }
      
      if (!selectedMimeType) {
        console.error("❌ No supported audio MIME types found")
        return false
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: selectedMimeType })
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }
      
      mediaRecorder.onstop = () => {
        const totalSize = audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0)
        console.log(`📹 Total audio size: ${totalSize} bytes`)
      }

      mediaRecorder.onerror = (event) => {
        console.error("📹 MediaRecorder error:", event)
      }
      
      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(250)
      
      return true
    } catch (error) {
      console.error("❌ Failed to initialize audio recording:", error)
      toast({
  title: t("error.processingFailed"),
  description: t("error.loadingFailed"),
  variant: "destructive"
})
      return false
    }
  }, [toast])

  // Stop audio recording and return blob
  const stopAudioRecording = useCallback((): Blob | null => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    if (audioChunksRef.current.length > 0) {
      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
      audioChunksRef.current = []
      return audioBlob
    }
    return null
  }, [])

  // Convert audio blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        console.log(`🔄 FileReader result length: ${result.length}`)
        console.log(`🔄 FileReader result start: ${result.substring(0, 50)}...`)
        resolve(result) // Return the full data URL with prefix
      }
      reader.onerror = (error) => {
        console.error("🔄 FileReader error:", error)
        reject(error)
      }
      reader.readAsDataURL(blob)
    })
  }

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!speechRecognitionSupported) return null

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = language === "ar-SA" ? "ar-EG" : language
      recognition.maxAlternatives = 1

      recognition.onstart = async () => {
        console.log("🎤 Speech recognition started")
        setIsRecording(true)
        setTranscription("")
        finalTranscriptRef.current = ""
        
        const success = await initializeAudioRecording()
        if (!success) {
          console.error("Failed to start audio recording")
        }
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        console.log("🎤 Speech recognition result:", transcript)
        setTranscription(transcript)
        finalTranscriptRef.current = transcript
      }

      recognition.onend = () => {
        console.log("🎤 Speech recognition ended")
        setIsRecording(false)
        
        const audioBlob = stopAudioRecording()
        const finalTranscript = finalTranscriptRef.current
        
        if (finalTranscript) {
          processTranscription(finalTranscript, audioBlob)
        }
        finalTranscriptRef.current = ""
      }

      recognition.onerror = (event: any) => {
        console.error("🎤 Speech recognition error:", event.error)
        setIsRecording(false)
        setIsProcessing(false)
        setIsPlaying(false)
        finalTranscriptRef.current = ""
        stopAudioRecording()

        switch (event.error) {
          case "no-speech":
            console.log("👂 No speech detected")
            break
          case "audio-capture":
            toast({
  title: t("error.processingFailed"),
  description: t("error.loadingFailed"),
  variant: "destructive",
})
            break
          case "not-allowed":
            toast({
  title: t("error.processingFailed"), 
  description: t("error.loadingFailed"),
  variant: "destructive",
})
            break
          default:
            toast({
              title: "Recognition Issue",
              description: "Please try again.",
              variant: "default",
            })
        }
      }

      return recognition
    } catch (error) {
      console.error("Failed to initialize speech recognition:", error)
      return null
    }
  }, [speechRecognitionSupported, language, toast, initializeAudioRecording, stopAudioRecording])

  // Start recording
  const startRecording = useCallback(() => {
    const recognition = initializeSpeechRecognition()
    if (recognition) {
      recognitionRef.current = recognition
      recognition.start()
    }
  }, [initializeSpeechRecognition])

  // Stop recording
  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop()
    }
  }, [isRecording])

  // Enhanced processTranscription function with dual audio support
  // Enhanced processTranscription function with dual audio support + background polling
const processTranscription = async (transcript: string, audioBlob: Blob | null = null) => {
  setIsProcessing(true)
  try {
    console.log(`📤 Processing transcription: "${transcript}"`)
    console.log(`📤 Using session: ${currentSessionId}`)
    console.log(`📚 Current history length: ${conversationHistory.length}`)
    
    // Get audio data if available
    let audioData = null
    if (audioBlob && audioBlob.size > 0) {
      try {
        console.log(`🔊 Converting audio blob to base64 - Size: ${audioBlob.size} bytes, Type: ${audioBlob.type}`)
        audioData = await blobToBase64(audioBlob)
        console.log(`✅ Audio converted - Base64 length: ${audioData.length}`)
        
        // Verify the base64 data looks correct
        if (audioData.startsWith('data:audio')) {
          console.log(`✅ Audio data format looks correct: ${audioData.substring(0, 50)}...`)
        } else {
          console.log(`⚠️ Audio data format may be incorrect: ${audioData.substring(0, 50)}...`)
        }
      } catch (error) {
        console.error("📹 Failed to convert audio to base64:", error)
        audioData = null
      }
    } else {
      console.log("⚠️ No audio blob provided or blob is empty")
    }

    // Use authenticated endpoint if logged in
    const endpoint = authToken ? "/api/voice-pipeline-auth" : "/api/voice-pipeline"
    const headers: any = { "Content-Type": "application/json" }
    
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`
    }

    // Send current conversation history to maintain context
    const requestBody = {
      transcription: transcript,
      history: conversationHistory.map((c) => ({ user: c.user, ai: c.ai })),
      language: language,
      sessionId: currentSessionId,
      assistantId: assistantId,
      audioData: audioData, // Include the base64 audio data
    }

    console.log(`📤 Sending request to ${endpoint}`)
    console.log(`📤 Request body - Audio included: ${!!audioData}`)

    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log("📤 Response received:", result)
    console.log("📤 Audio was saved:", result.audioSaved)
    
    setAiResponse(result.aiResponse)
    
    // ========== NEW: Start polling for audio in background ==========
    // Calculate the message index for polling
    const messageIndex = conversationHistory.length
    console.log(`🔄 Starting audio polling for message index: ${messageIndex}`)
    pollForAudio(currentSessionId, messageIndex)
    // ================================================================
    
    // Use the complete conversation history returned by the backend
    if (result.conversationHistory && Array.isArray(result.conversationHistory)) {
      console.log("🔄 Updating with complete backend history:", result.conversationHistory.length, "items")
      
      // Convert backend format to frontend format with dual audio support
      const backendHistory = result.conversationHistory.map((item: any) => ({
        user: item.user || item.user_message,
        ai: item.ai || item.ai_response,
        timestamp: new Date(item.timestamp || Date.now()),
        user_audio_path: item.user_audio_path,
        ai_audio_path: item.ai_audio_path
      }))
      
      setConversationHistory(backendHistory)
    } else {
      // Fallback: add current turn to existing history
      const newTurn: ConversationTurn = {
        user: transcript,
        ai: result.aiResponse,
        timestamp: new Date(),
        user_audio_path: result.audioSaved?.user ? result.audioSaved.user : undefined,
        ai_audio_path: result.audioSaved?.ai ? result.audioSaved.ai : undefined
      }
      
      setConversationHistory((prev) => [...prev, newTurn])
    }
    
    setIsNewSession(false)
    setIsProcessing(false)

    // Play response using enhanced speakText function
    await speakText(result.aiResponse)

  } catch (error) {
    console.error("❌ Error processing transcription:", error)
    toast({
      title: t("error.processingFailed"),
      description: error instanceof Error ? error.message : t("error.loadingFailed"),
      variant: "destructive",
    })
    setIsProcessing(false)
  }
}
//   const processTranscription = async (transcript: string, audioBlob: Blob | null = null) => {
//     setIsProcessing(true)
//     try {
//       console.log(`📤 Processing transcription: "${transcript}"`)
//       console.log(`📤 Using session: ${currentSessionId}`)
//       console.log(`📚 Current history length: ${conversationHistory.length}`)
      
//       // Get audio data if available
//       let audioData = null
//       if (audioBlob && audioBlob.size > 0) {
//         try {
//           console.log(`🔊 Converting audio blob to base64 - Size: ${audioBlob.size} bytes, Type: ${audioBlob.type}`)
//           audioData = await blobToBase64(audioBlob)
//           console.log(`✅ Audio converted - Base64 length: ${audioData.length}`)
          
//           // Verify the base64 data looks correct
//           if (audioData.startsWith('data:audio')) {
//             console.log(`✅ Audio data format looks correct: ${audioData.substring(0, 50)}...`)
//           } else {
//             console.log(`⚠️ Audio data format may be incorrect: ${audioData.substring(0, 50)}...`)
//           }
//         } catch (error) {
//           console.error("📹 Failed to convert audio to base64:", error)
//           audioData = null
//         }
//       } else {
//         console.log("⚠️ No audio blob provided or blob is empty")
//       }

//       // Use authenticated endpoint if logged in
//       const endpoint = authToken ? "/api/voice-pipeline-auth" : "/api/voice-pipeline"
//       const headers: any = { "Content-Type": "application/json" }
      
//       if (authToken) {
//         headers["Authorization"] = `Bearer ${authToken}`
//       }

//       // Send current conversation history to maintain context
//       const requestBody = {
//         transcription: transcript,
//         history: conversationHistory.map((c) => ({ user: c.user, ai: c.ai })),
//         language: language,
//         sessionId: currentSessionId,
//         assistantId: assistantId,
//         audioData: audioData, // Include the base64 audio data
//       }

//       console.log(`📤 Sending request to ${endpoint}`)
//       console.log(`📤 Request body - Audio included: ${!!audioData}`)

//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: headers,
//         body: JSON.stringify(requestBody),
//       })

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }

//       const result = await response.json()
//       console.log("📤 Response received:", result)
//       console.log("📤 Audio was saved:", result.audioSaved)
      
//       setAiResponse(result.aiResponse)
      
//       // Use the complete conversation history returned by the backend
//       if (result.conversationHistory && Array.isArray(result.conversationHistory)) {
//         console.log("🔄 Updating with complete backend history:", result.conversationHistory.length, "items")
        
//         // Convert backend format to frontend format with dual audio support
//         const backendHistory = result.conversationHistory.map((item: any) => ({
//           user: item.user || item.user_message,
//           ai: item.ai || item.ai_response,
//           timestamp: new Date(item.timestamp || Date.now()),
//           user_audio_path: item.user_audio_path,
//           ai_audio_path: item.ai_audio_path
//         }))
        
//         setConversationHistory(backendHistory)
//       } else {
//         // Fallback: add current turn to existing history
//         const newTurn: ConversationTurn = {
//           user: transcript,
//           ai: result.aiResponse,
//           timestamp: new Date(),
//           user_audio_path: result.audioSaved?.user ? result.audioSaved.user : undefined,
//           ai_audio_path: result.audioSaved?.ai ? result.audioSaved.ai : undefined
//         }
        
//         setConversationHistory((prev) => [...prev, newTurn])
//       }
      
//       setIsNewSession(false)
//       setIsProcessing(false)

//       // Play response using enhanced speakText function
//       await speakText(result.aiResponse)

//     } catch (error) {
//       console.error("❌ Error processing transcription:", error)
//       toast({
//   title: t("error.processingFailed"),
//   description: error instanceof Error ? error.message : t("error.loadingFailed"),
//   variant: "destructive",
// })
//       setIsProcessing(false)
//     }
//   }

  // Enhanced startNewConversation function
  const startNewConversation = () => {
    const newSessionId = crypto.randomUUID()
    setCurrentSessionId(newSessionId)
    setConversationHistory([]) // Clear existing history
    setTranscription("")
    setAiResponse("")
    setIsNewSession(true)
    
    // Stop any current audio
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
      setIsPlaying(false)
      setPlayingAudio(null)
    }
    
    console.log("🆕 Started new conversation:", newSessionId)
    
    toast({
  title: t("voice.newConversationStarted"),
  description: t("voice.previousConversationCleared"),
  variant: "default",
})
  }

  // Enhanced speakText function with pre-generated AI audio support
  // const speakText = async (text: string) => {
  //   return new Promise<void>((resolve) => {
  //     const playAudio = async () => {
  //       try {
  //         const assistantName = currentAssistant.name as AssistantName
  //         const langCode = language as LanguageCode
  //         const voiceId = assistantName.toLowerCase() // "slah" or "amira"
          
  //         // Check if we already have AI audio for this message
  //         const currentTurn = conversationHistory[conversationHistory.length - 1]
  //         if (currentTurn && currentTurn.ai_audio_path && currentTurn.ai === text) {
  //           // Use pre-generated audio from backend
  //           console.log("🔊 Using pre-generated AI audio:", currentTurn.ai_audio_path)
  //           const audioUrl = `http://localhost:8000/recordings/${currentTurn.ai_audio_path}`
  //           const audio = new Audio(audioUrl)
            
  //           setCurrentAudio(audio)
  //           setIsPlaying(true)
  //           setPlayingAudio(currentTurn.ai_audio_path)
            
  //           audio.onended = () => {
  //             setIsPlaying(false)
  //             setCurrentAudio(null)
  //             setPlayingAudio(null)
  //             resolve()
              
  //             if (autoMode) {
  //               setTimeout(() => {
  //                 startRecording()
  //               }, 500)
  //             }
  //           }
            
  //           audio.onerror = () => {
  //             console.warn("Pre-generated audio failed, falling back to TTS")
  //             // Fallback to real-time TTS
  //             fallbackToTTS()
  //           }
            
  //           await audio.play()
  //           return
  //         }
          
  //         // Fallback to real-time TTS if no pre-generated audio
  //         fallbackToTTS()
          
  //         async function fallbackToTTS() {
  //           console.log("🔊 Using real-time TTS")
  //           const response = await fetch("/api/edge-tts", {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({
  //               text: text,
  //               voice_id: voiceId,
  //               language: language
  //             })
  //           })

  //           if (!response.ok) {
  //             throw new Error(`TTS failed: ${response.statusText}`)
  //           }

  //           const audioBlob = await response.blob()
  //           const audioUrl = URL.createObjectURL(audioBlob)
  //           const audio = new Audio(audioUrl)
            
  //           setCurrentAudio(audio)
  //           setIsPlaying(true)
  //           setPlayingAudio("real-time-tts")
            
  //           audio.onended = () => {
  //             setIsPlaying(false)
  //             setCurrentAudio(null)
  //             setPlayingAudio(null)
  //             URL.revokeObjectURL(audioUrl)
  //             resolve()
              
  //             if (autoMode) {
  //               setTimeout(() => {
  //                 startRecording()
  //               }, 500)
  //             }
  //           }
            
  //           audio.onerror = () => {
  //             setIsPlaying(false)
  //             setCurrentAudio(null)
  //             setPlayingAudio(null)
  //             URL.revokeObjectURL(audioUrl)
  //             resolve()
  //           }
            
  //           await audio.play()
  //         }
          
  //       } catch (error) {
  //         console.error("TTS error:", error)
  //         setIsPlaying(false)
  //         setCurrentAudio(null)
  //         setPlayingAudio(null)
  //         resolve()
  //       }
  //     }
  //     playAudio()
  //   })
  // }
  // Enhanced speakText function with pre-generated AI audio support
const speakText = async (text: string) => {
  return new Promise<void>((resolve) => {
    const playAudio = async () => {
      try {
        const assistantName = currentAssistant.name as AssistantName
        const langCode = language as LanguageCode
        const voiceId = assistantName.toLowerCase() // ← CHANGED: Simple "slah" or "amira"
        
        // Check if we already have AI audio for this message
        const currentTurn = conversationHistory[conversationHistory.length - 1]
        if (currentTurn && currentTurn.ai_audio_path && currentTurn.ai === text) {
          // Use pre-generated audio from backend
          console.log("🔊 Using pre-generated AI audio:", currentTurn.ai_audio_path)
          const audioUrl = `http://localhost:8000/recordings/${currentTurn.ai_audio_path}`
          const audio = new Audio(audioUrl)
          
          setCurrentAudio(audio)
          setIsPlaying(true)
          setPlayingAudio(currentTurn.ai_audio_path)
          
          audio.onended = () => {
            setIsPlaying(false)
            setCurrentAudio(null)
            setPlayingAudio(null)
            resolve()
            
            if (autoMode) {
              setTimeout(() => {
                startRecording()
              }, 500)
            }
          }
          
          audio.onerror = () => {
            console.warn("Pre-generated audio failed, falling back to TTS")
            // Fallback to real-time TTS
            fallbackToTTS()
          }
          
          await audio.play()
          return
        }
        
        // Fallback to real-time TTS if no pre-generated audio
        fallbackToTTS()
        
        async function fallbackToTTS() {
          console.log("🔊 Using real-time TTS")
          const response = await fetch("/api/edge-tts", {  // ← CHANGED: New endpoint
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: text,
              voice_id: voiceId,  // Now "slah" or "amira"
              language: language  // ← CORRECT: Already using "language" not "selectedLanguage"
            })
          })

          if (!response.ok) {
            throw new Error(`TTS failed: ${response.statusText}`)
          }

          const audioBlob = await response.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const audio = new Audio(audioUrl)
          
          setCurrentAudio(audio)
          setIsPlaying(true)
          setPlayingAudio("real-time-tts")
          
          audio.onended = () => {
            setIsPlaying(false)
            setCurrentAudio(null)
            setPlayingAudio(null)
            URL.revokeObjectURL(audioUrl)
            resolve()
            
            if (autoMode) {
              setTimeout(() => {
                startRecording()
              }, 500)
            }
          }
          
          audio.onerror = () => {
            setIsPlaying(false)
            setCurrentAudio(null)
            setPlayingAudio(null)
            URL.revokeObjectURL(audioUrl)
            resolve()
          }
          
          await audio.play()
        }
        
      } catch (error) {
        console.error("TTS error:", error)
        setIsPlaying(false)
        setCurrentAudio(null)
        setPlayingAudio(null)
        resolve()
      }
    }
    playAudio()
  })
}

  // Stop audio
  const stopAudio = useCallback(() => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      setIsPlaying(false)
      setPlayingAudio(null)
    }
  }, [currentAudio])

  // Play recording function for dual audio support
  const playRecording = (audioPath: string, audioType: 'user' | 'ai') => {
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
      setIsPlaying(false)
      setPlayingAudio(null)
    }
    
    if (playingAudio === audioPath) {
      return
    }
    
    const audioUrl = `http://localhost:8000/recordings/${audioPath}`
    const audio = new Audio(audioUrl)
    setCurrentAudio(audio)
    setIsPlaying(true)
    setPlayingAudio(audioPath)
    
    audio.onended = () => {
      setIsPlaying(false)
      setCurrentAudio(null)
      setPlayingAudio(null)
    }
    
    audio.onerror = () => {
      console.error("Error playing recording")
      setIsPlaying(false)
      setCurrentAudio(null)
      setPlayingAudio(null)
      toast({
  title: t("error.playbackFailed"),
  description: t("dashboard.couldNotPlayAudio"),
  variant: "destructive"
})
    }
    
    audio.play()
  }

  // Download audio function
  const downloadAudio = (audioPath: string) => {
    const link = document.createElement('a')
    link.href = `http://localhost:8000/recordings/${audioPath}`
    link.download = audioPath
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.clear()
    router.push("/auth/login")
  }

  // Check browser support
  useEffect(() => {
    const speechSupported = "webkitSpeechRecognition" in window || "SpeechRecognition" in window
    setSpeechRecognitionSupported(speechSupported)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header with Controls */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/assistant">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
          </Link>
          
          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={startNewConversation}
              variant="outline" 
              size="sm"
              disabled={isRecording || isProcessing}
            >
              {t("voice.newConversation")}
            </Button>
            
            {/* <label className="flex items-center">
  <input
    type="checkbox"
    checked={autoMode}
    onChange={(e) => setAutoMode(e.target.checked)}
  />
  {t("voice.autoMode")}
</label> */}
          </div>
        </div>

        {/* Session Info */}
        {/* Session Info */}
{/* <div className="text-center mb-4">
  <p className="text-sm text-gray-600">
    {t("voice.messages")}: {conversationHistory.length}
    {playingAudio && (
      <span className="ml-2 text-blue-600">
        • {t("voice.playing")}: {playingAudio === 'real-time-tts' ? t("voice.realTimeTTS") : playingAudio}
      </span>
    )}
  </p>
</div> */}

        {/* Manual Control Buttons */}
        <div className="flex justify-center mb-8">
          <div className="flex gap-4">
            {/* {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isProcessing || isPlaying}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                className="bg-red-700 hover:bg-red-800 text-white px-6 py-3"
              >
                <MicOff className="w-5 h-5 mr-2" />
                Stop Recording
              </Button>
            )}

            {aiResponse && !isPlaying && (
              <Button
                onClick={() => speakText(aiResponse)}
                disabled={isRecording || isProcessing}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
              >
                <Play className="w-5 h-5 mr-2" />
                Play Response
              </Button>
            )}

            {isPlaying && (
              <Button
                onClick={stopAudio}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop Audio
              </Button>
            )} */}
            {!isRecording ? (
  <Button
    onClick={startRecording}
    disabled={isProcessing || isPlaying}
    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3"
  >
    <Mic className="w-5 h-5 mr-2" />
    {t("voice.startRecording")}
  </Button>
) : (
  <Button
    onClick={stopRecording}
    className="bg-red-700 hover:bg-red-800 text-white px-6 py-3"
  >
    <MicOff className="w-5 h-5 mr-2" />
    {t("voice.stopRecording")}
  </Button>
)}

{aiResponse && !isPlaying && (
  <Button
    onClick={() => speakText(aiResponse)}
    disabled={isRecording || isProcessing}
    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3"
  >
    <Play className="w-5 h-5 mr-2" />
    {t("voice.playResponse")}
  </Button>
)}

{isPlaying && (
  <Button
    onClick={stopAudio}
    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3"
  >
    <Square className="w-5 h-5 mr-2" />
    {t("voice.stopAudio")}
  </Button>
)}
          </div>
        </div>

        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <Avatar
            assistantId={assistantId}
            isListening={isRecording}
            isProcessing={isProcessing}
            isSpeaking={isPlaying}
            hasConversationStarted={conversationHistory.length > 0}
            status={getStatus(isRecording, isProcessing, isPlaying, conversationHistory.length)}
            onToggleListening={() => {}}
            onInterrupt={() => {}}
          />
        </div>

        {/* Enhanced Full Conversation History Display with Dual Audio */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
  <MessageSquare className="w-5 h-5 mr-2" />
  {t("voice.conversation")}
</h3>

              <div className="flex items-center space-x-2 text-sm text-gray-600">
  <span className="bg-blue-100 px-2 py-1 rounded-full">
    {conversationHistory.length} {t("voice.messages")}
  </span>
</div>
            </div>
            
            {conversationHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="text-gray-500 text-lg mb-2">{t("voice.startConversation")}</p>
                <p className="text-gray-400 text-sm">{t("voice.messagesWillAppear")}</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {conversationHistory.map((turn, index) => (
                  <div key={index} className="space-y-3">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="group max-w-[75%]">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg">
                          <p className="text-sm leading-relaxed">{turn.user}</p>
                        </div>
                        <div className="flex items-center justify-end mt-1 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs text-gray-400">
                            {turn.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {turn.user_audio_path && (
                            <div className="flex items-center gap-1">
                              {playingAudio === turn.user_audio_path ? (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={stopAudio}
                                  className="h-6 px-2"
                                >
                                  <Square className="w-3 h-3" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => playRecording(turn.user_audio_path!, 'user')}
                                  className="h-6 px-2"
                                >
                                  <PlayCircle className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
  size="sm"
  variant="ghost"
  onClick={() => downloadAudio(turn.user_audio_path!)}
  className="h-6 px-2"
  title={t("dashboard.downloadAudio")}
>
  <Download className="w-3 h-3" />
</Button>
                            </div>
                          )}
                          <User className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                    </div>
                    
                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="group max-w-[75%]">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md">
                              <Image
                                src={currentAssistant.image}
                                alt={currentAssistant.name}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                              <div className="flex items-center mb-1">
                                <span className="text-xs font-medium text-gray-600">
                                  {currentAssistant.name}
                                </span>
                              </div>
                              <p className="text-sm text-gray-800 leading-relaxed">{turn.ai}</p>
                            </div>
                            <div className="flex items-center mt-1 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-xs text-gray-400">
                                {turn.timestamp.toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                              {turn.ai_audio_path && (
                                <div className="flex items-center gap-1">
                                  {playingAudio === turn.ai_audio_path ? (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={stopAudio}
                                      className="h-6 px-2"
                                    >
                                      <Square className="w-3 h-3" />
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => playRecording(turn.ai_audio_path!, 'ai')}
                                      className="h-6 px-2"
                                    >
                                      <Volume2 className="w-3 h-3" />
                                    </Button>
                                  )}
                                  <Button
  size="sm"
  variant="ghost"
  onClick={() => downloadAudio(turn.ai_audio_path!)}
  className="h-6 px-2"
  title={t("dashboard.downloadAiAudio")}
>
  <Download className="w-3 h-3" />
</Button>
                                </div>
                              )}
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-xs text-gray-400">AI Assistant</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Current Interaction Bubble (if active) */}
        {/* {(transcription || (aiResponse && conversationHistory.length === 0)) && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 backdrop-blur-md rounded-2xl border border-indigo-200 shadow-xl p-6">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium text-indigo-700">{t("voice.currentInteraction")}</span>
              </div>
              
              {transcription && (
                <div className="space-y-3 mb-4">
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 shadow-lg max-w-[75%]">
                      <p className="text-sm leading-relaxed italic">"{transcription}"</p>
                    </div>
                  </div>
                </div>
              )}

              {aiResponse && conversationHistory.length === 0 && (
                <div className="space-y-3">
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-3 max-w-[75%]">
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-md">
                        <Image
                          src={currentAssistant.image}
                          alt={currentAssistant.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg">
                        <div className="flex items-center mb-1">
                          <span className="text-xs font-medium text-gray-600">
                            {currentAssistant.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">{aiResponse}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )} */}

        {/* Status Display */}
        <div className="text-center text-lg font-medium text-gray-700">
          {isRecording && t("voice.listening")}
          {isProcessing && t("voice.thinking")}
          {isPlaying && t("voice.speaking")}
          {!isRecording && !isProcessing && !isPlaying && (
  conversationHistory.length === 0 ? t("voice.readyForNext") : t("voice.ready")
)}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  )
}