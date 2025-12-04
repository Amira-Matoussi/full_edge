
// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { 
//   MessageSquare, PlayCircle, ArrowLeft, Calendar,
//   AudioLines, User, Globe, Square, Download, Eye, X, Headphones, Volume2
// } from "lucide-react"
// import { useLanguage } from "@/hooks/use-language"
// import { useRouter } from "next/navigation"
// import { useToast } from "@/hooks/use-toast"
// import Link from "next/link"

// interface ConversationMessage {
//   id: string
//   user_message: string
//   ai_response: string
//   timestamp: string
//   user_audio_path?: string
//   ai_audio_path?: string
// }

// interface ConversationSession {
//   session_id: string
//   language: string
//   message_count: number
//   first_message: string
//   last_activity: string
// }

// interface UserStats {
//   total_sessions?: number
//   total_conversations?: number
//   total_audio_recordings?: number
//   last_activity?: string
// }

// export default function EnhancedUserDashboard() {
//   const { t } = useLanguage()
//   const router = useRouter()
//   const { toast } = useToast()
  
//   const [isLoading, setIsLoading] = useState(true)
//   const [sessions, setSessions] = useState<ConversationSession[]>([])
//   const [statistics, setStatistics] = useState<UserStats>({})
//   const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null)
//   const [sessionMessages, setSessionMessages] = useState<ConversationMessage[]>([])
//   const [playingAudio, setPlayingAudio] = useState<string | null>(null)
//   const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
//   const [userEmail, setUserEmail] = useState("")

//   useEffect(() => {
//     const userEmail = localStorage.getItem("userEmail")
//     const authToken = localStorage.getItem("authToken")
    
//     if (!authToken || !userEmail) {
//       toast({
//         title: "Login Required",
//         description: "Please login to view your conversations",
//         variant: "destructive"
//       })
//       router.push("/auth/login")
//       return
//     }

//     setUserEmail(userEmail)
//     fetchUserData()
//   }, [])

//   const fetchUserData = async () => {
//     setIsLoading(true)
//     const token = localStorage.getItem("authToken")

//     try {
//       // Fetch user statistics
//       console.log("📊 Fetching user statistics...")
//       const statsResponse = await fetch("http://localhost:8000/api/dashboard/statistics", {
//         headers: { "Authorization": `Bearer ${token}` }
//       })
      
//       if (statsResponse.ok) {
//         const stats = await statsResponse.json()
//         console.log("📊 User statistics received:", stats)
//         setStatistics(stats)
//       }

//       // Fetch user's conversation sessions
//       console.log("📋 Fetching user sessions...")
//       const sessionsResponse = await fetch("http://localhost:8000/api/dashboard/sessions?limit=50", {
//         headers: { "Authorization": `Bearer ${token}` }
//       })

//       if (sessionsResponse.ok) {
//         const sessionsData = await sessionsResponse.json()
//         console.log("📋 User sessions received:", sessionsData.length, "sessions")
//         setSessions(sessionsData)
//       }

//     } catch (error) {
//       console.error("❌ Error fetching user data:", error)
//       toast({
//         title: "Error",
//         description: "Failed to load your conversation data",
//         variant: "destructive"
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const fetchSessionMessages = async (sessionId: string) => {
//     const token = localStorage.getItem("authToken")
    
//     try {
//       console.log(`📋 Fetching messages for session: ${sessionId}`)
//       const response = await fetch(`http://localhost:8000/api/dashboard/session/${sessionId}/messages`, {
//         headers: { "Authorization": `Bearer ${token}` }
//       })

//       if (response.ok) {
//         const messages = await response.json()
//         console.log(`📋 Loaded ${messages.length} messages for session`)
        
//         const userAudioCount = messages.filter((m: ConversationMessage) => m.user_audio_path).length
//         const aiAudioCount = messages.filter((m: ConversationMessage) => m.ai_audio_path).length
//         console.log(`🔊 Found ${userAudioCount} user audio + ${aiAudioCount} AI audio recordings`)
        
//         setSessionMessages(messages)
//       }
//     } catch (error) {
//       console.error("❌ Error fetching session messages:", error)
//       toast({
//         title: "Error",
//         description: "Failed to load conversation messages",
//         variant: "destructive"
//       })
//     }
//   }

//   const viewSessionDetails = async (session: ConversationSession) => {
//     setSelectedSession(session)
//     await fetchSessionMessages(session.session_id)
//   }

//   const playAudioRecording = async (audioPath: string) => {
//     if (currentAudio) {
//       currentAudio.pause()
//       setCurrentAudio(null)
//       setPlayingAudio(null)
//     }

//     if (playingAudio === audioPath) {
//       return
//     }

//     try {
//       console.log(`🔊 Playing audio: ${audioPath}`)
//       const audioUrl = `http://localhost:8000/recordings/${audioPath}`
//       const audio = new Audio(audioUrl)
      
//       audio.onended = () => {
//         console.log(`🔊 Audio playback ended: ${audioPath}`)
//         setPlayingAudio(null)
//         setCurrentAudio(null)
//       }
      
//       audio.onerror = (e) => {
//         console.error(`🔊 Audio playback error for ${audioPath}:`, e)
//         toast({
//           title: "Playback Error",
//           description: "Could not play audio recording. The file may not exist.",
//           variant: "destructive"
//         })
//         setPlayingAudio(null)
//         setCurrentAudio(null)
//       }
      
//       await audio.play()
//       setCurrentAudio(audio)
//       setPlayingAudio(audioPath)
//     } catch (error) {
//       console.error("❌ Error playing audio:", error)
//       toast({
//         title: "Playback Error",
//         description: "Could not play audio recording",
//         variant: "destructive"
//       })
//     }
//   }

//   const stopAudio = () => {
//     if (currentAudio) {
//       currentAudio.pause()
//       currentAudio.currentTime = 0
//       setCurrentAudio(null)
//       setPlayingAudio(null)
//       console.log("🔊 Audio stopped by user")
//     }
//   }

//   const downloadAudio = (audioPath: string) => {
//     const link = document.createElement('a')
//     link.href = `http://localhost:8000/recordings/${audioPath}`
//     link.download = audioPath
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//     console.log(`📥 Download initiated for: ${audioPath}`)
//   }

//   const getLanguageDisplay = (lang: string) => {
//     const languages: { [key: string]: string } = {
//       "en-US": "English",
//       "fr-FR": "Français", 
//       "ar-SA": "العربية"
//     }
//     return languages[lang] || lang
//   }

//   const formatTimestamp = (timestamp: string) => {
//     const date = new Date(timestamp)
//     return date.toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   // Calculate total audio recordings from all sessions
//   const calculateTotalAudioRecordings = () => {
//     // This should come from the backend statistics, but as fallback we can calculate
//     return sessionMessages.reduce((total, message) => {
//       let count = 0
//       if (message.user_audio_path) count++
//       if (message.ai_audio_path) count++
//       return total + count
//     }, 0)
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading your conversations...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
//       <div className="max-w-6xl mx-auto px-4 py-8">
        
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">My Voice Conversations</h1>
//             <p className="text-gray-600">Welcome back, {userEmail}</p>
//             {playingAudio && (
//               <div className="flex items-center gap-2 text-blue-600 mt-2">
//                 <Volume2 className="w-4 h-4 animate-pulse" />
//                 <span className="text-sm">Playing: {playingAudio}</span>
//                 <Button onClick={stopAudio} size="sm" variant="outline">
//                   Stop
//                 </Button>
//               </div>
//             )}
//           </div>
//           <Link href="/assistant">
//             <Button variant="outline">
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back to Assistant
//             </Button>
//           </Link>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Total Sessions</p>
//                   <p className="text-2xl font-bold text-gray-900">{statistics.total_sessions || 0}</p>
//                 </div>
//                 <div className="p-3 bg-blue-50 rounded-lg">
//                   <MessageSquare className="w-6 h-6 text-blue-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Total Messages</p>
//                   <p className="text-2xl font-bold text-gray-900">{statistics.total_conversations || 0}</p>
//                 </div>
//                 <div className="p-3 bg-green-50 rounded-lg">
//                   <MessageSquare className="w-6 h-6 text-green-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Audio Recordings</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {statistics.total_audio_recordings || 0}
//                   </p>
//                   <p className="text-xs text-gray-500 mt-1">User + AI Audio</p>
//                 </div>
//                 <div className="p-3 bg-orange-50 rounded-lg">
//                   <Headphones className="w-6 h-6 text-orange-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
//             <CardContent className="pt-6">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm font-medium text-gray-600 mb-1">Last Activity</p>
//                   <p className="text-lg font-bold text-gray-900">
//                     {statistics.last_activity 
//                       ? new Date(statistics.last_activity).toLocaleDateString()
//                       : "Never"
//                     }
//                   </p>
//                 </div>
//                 <div className="p-3 bg-purple-50 rounded-lg">
//                   <Calendar className="w-6 h-6 text-purple-600" />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Conversation Sessions List */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <MessageSquare className="w-5 h-5 mr-2" />
//                 Your Voice Conversation Sessions
//               </div>
//               <Button onClick={fetchUserData} variant="outline" size="sm">
//                 Refresh
//               </Button>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             {sessions.length === 0 ? (
//               <div className="text-center py-12">
//                 <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-600 mb-2">No voice conversations yet</h3>
//                 <p className="text-gray-500 mb-4">Start talking with your AI assistant to see your voice conversation history here.</p>
//                 <Link href="/assistant">
//                   <Button>Start Voice Conversation</Button>
//                 </Link>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {sessions.map((session, index) => {
//                   return (
//                     <Card key={session.session_id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
//                       <CardContent className="pt-4">
//                         <div className="flex items-start justify-between mb-3">
//                           <div className="flex-1">
//                             <div className="flex items-center gap-3 mb-2">
//                               <Badge variant="outline">
//                                 <Globe className="w-3 h-3 mr-1" />
//                                 {getLanguageDisplay(session.language)}
//                               </Badge>
//                               <Badge variant="secondary">
//                                 <MessageSquare className="w-3 h-3 mr-1" />
//                                 {session.message_count} messages
//                               </Badge>
//                               <Badge variant="outline">
//                                 <Headphones className="w-3 h-3 mr-1" />
//                                 Voice Session
//                               </Badge>
//                               <span className="text-sm text-gray-500">
//                                 {formatTimestamp(session.last_activity)}
//                               </span>
//                             </div>
                            
//                             <div className="bg-gray-50 p-3 rounded-lg mb-3">
//                               <p className="text-sm font-medium text-gray-700 mb-1">First message:</p>
//                               <p className="text-gray-800 line-clamp-2">{session.first_message}</p>
//                             </div>
                            
//                             <p className="text-xs text-gray-500 font-mono">
//                               Session: {session.session_id.slice(-12)}...
//                             </p>
//                           </div>
                          
//                           <Button
//                             onClick={() => viewSessionDetails(session)}
//                             variant="outline"
//                             size="sm"
//                             className="ml-4"
//                           >
//                             <Eye className="w-4 h-4 mr-2" />
//                             View Details
//                           </Button>
//                         </div>
//                       </CardContent>
//                     </Card>
//                   )
//                 })}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         {/* Session Details Dialog */}
//         <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
//           <DialogContent className="max-w-5xl max-h-[80vh] overflow-auto">
//             <DialogHeader>
//               <div className="flex items-center justify-between">
//                 <DialogTitle>
//                   Voice Conversation Session Details
//                 </DialogTitle>
//                 <Button 
//                   variant="ghost" 
//                   size="sm"
//                   onClick={() => setSelectedSession(null)}
//                 >
//                   <X className="w-4 h-4" />
//                 </Button>
//               </div>
//             </DialogHeader>
            
//             {selectedSession && (
//               <div className="space-y-4">
//                 {/* Session Info */}
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <div className="grid grid-cols-3 gap-4">
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Session ID</p>
//                       <p className="font-mono text-sm">{selectedSession.session_id}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Language</p>
//                       <p className="text-sm">{getLanguageDisplay(selectedSession.language)}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Messages</p>
//                       <p className="text-sm">{selectedSession.message_count}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Audio Recordings</p>
//                       <div className="text-sm">
//                         <span className="font-medium">{sessionMessages.filter(m => m.user_audio_path || m.ai_audio_path).length} total</span>
//                         <div className="text-xs text-gray-500">
//                           {sessionMessages.filter(m => m.user_audio_path).length} user + {sessionMessages.filter(m => m.ai_audio_path).length} AI
//                         </div>
//                       </div>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Last Activity</p>
//                       <p className="text-sm">{formatTimestamp(selectedSession.last_activity)}</p>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-gray-600">Session Type</p>
//                       <div className="flex items-center">
//                         <Headphones className="w-4 h-4 mr-1 text-orange-500" />
//                         <span className="text-sm">Voice Conversation</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Messages */}
//                 <div className="space-y-4">
//                   <h3 className="font-semibold flex items-center">
//                     <MessageSquare className="w-5 h-5 mr-2" />
//                     Conversation Messages ({sessionMessages.length})
//                   </h3>
//                   <div className="max-h-[400px] overflow-y-auto space-y-4">
//                     {sessionMessages.map((message, index) => (
//                       <div key={message.id} className="space-y-2">
//                         {/* User Message */}
//                         <div className="flex justify-end">
//                           <div className="bg-blue-500 text-white p-3 rounded-lg max-w-[70%]">
//                             <div className="flex items-center justify-between mb-2">
//                               <span className="text-sm font-medium">You</span>
//                               <div className="flex items-center gap-2">
//                                 <span className="text-xs opacity-75">
//                                   {formatTimestamp(message.timestamp)}
//                                 </span>
//                                 {message.user_audio_path && (
//                                   <div className="flex gap-1">
//                                     {playingAudio === message.user_audio_path ? (
//                                       <Button
//                                         size="sm"
//                                         variant="secondary"
//                                         onClick={stopAudio}
//                                       >
//                                         <Square className="w-3 h-3 mr-1" />
//                                         Stop
//                                       </Button>
//                                     ) : (
//                                       <Button
//                                         size="sm"
//                                         variant="secondary"
//                                         onClick={() => playAudioRecording(message.user_audio_path!)}
//                                       >
//                                         <PlayCircle className="w-3 h-3 mr-1" />
//                                         Play
//                                       </Button>
//                                     )}
//                                     <Button
//                                       size="sm"
//                                       variant="ghost"
//                                       onClick={() => downloadAudio(message.user_audio_path!)}
//                                       title="Download audio"
//                                     >
//                                       <Download className="w-3 h-3" />
//                                     </Button>
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                             <p>{message.user_message}</p>
//                             {message.user_audio_path && (
//                               <div className="mt-2 flex items-center text-xs opacity-75">
//                                 <AudioLines className="w-3 h-3 mr-1" />
//                                 <span>Voice message recorded</span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
                        
//                         {/* AI Response */}
//                         <div className="flex justify-start">
//                           <div className="bg-white border p-3 rounded-lg max-w-[70%]">
//                             <div className="flex items-center justify-between mb-2">
//                               <span className="text-sm font-medium text-green-600">AI Response</span>
//                               {message.ai_audio_path && (
//                                 <div className="flex gap-1">
//                                   {playingAudio === message.ai_audio_path ? (
//                                     <Button
//                                       size="sm"
//                                       variant="destructive"
//                                       onClick={stopAudio}
//                                     >
//                                       <Square className="w-3 h-3 mr-1" />
//                                       Stop
//                                     </Button>
//                                   ) : (
//                                     <Button
//                                       size="sm"
//                                       variant="outline"
//                                       onClick={() => playAudioRecording(message.ai_audio_path!)}
//                                     >
//                                       <PlayCircle className="w-3 h-3 mr-1" />
//                                       Play AI
//                                     </Button>
//                                   )}
//                                   <Button
//                                     size="sm"
//                                     variant="ghost"
//                                     onClick={() => downloadAudio(message.ai_audio_path!)}
//                                     title="Download AI audio"
//                                   >
//                                     <Download className="w-3 h-3" />
//                                   </Button>
//                                 </div>
//                               )}
//                             </div>
//                             <p className="text-gray-800">{message.ai_response}</p>
//                             {message.ai_audio_path && (
//                               <div className="mt-2 flex items-center text-xs text-green-600">
//                                 <AudioLines className="w-3 h-3 mr-1" />
//                                 <span>AI audio available</span>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </DialogContent>
//         </Dialog>
//       </div>
//     </div>
//   )
// }
// // "use client"

// // import { useState, useEffect } from "react"
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// // import { Button } from "@/components/ui/button"
// // import { Badge } from "@/components/ui/badge"
// // import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// // import { 
// //   MessageSquare, PlayCircle, ArrowLeft, Calendar,
// //   AudioLines, User, Globe, Square, Download, Eye, X, Headphones, Volume2
// // } from "lucide-react"
// // import { useLanguage } from "@/hooks/use-language"
// // import { useRouter } from "next/navigation"
// // import { useToast } from "@/hooks/use-toast"
// // import Link from "next/link"

// // interface ConversationMessage {
// //   id: string
// //   user_message: string
// //   ai_response: string
// //   timestamp: string
// //   audio_path?: string
// // }

// // interface ConversationSession {
// //   session_id: string
// //   language: string
// //   message_count: number
// //   first_message: string
// //   last_activity: string
// // }

// // interface UserStats {
// //   total_sessions?: number
// //   total_conversations?: number
// //   total_audio_recordings?: number
// //   last_activity?: string
// // }

// // export default function EnhancedUserDashboard() {
// //   const { t } = useLanguage()
// //   const router = useRouter()
// //   const { toast } = useToast()
  
// //   const [isLoading, setIsLoading] = useState(true)
// //   const [sessions, setSessions] = useState<ConversationSession[]>([])
// //   const [statistics, setStatistics] = useState<UserStats>({})
// //   const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null)
// //   const [sessionMessages, setSessionMessages] = useState<ConversationMessage[]>([])
// //   const [playingAudio, setPlayingAudio] = useState<string | null>(null)
// //   const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
// //   const [userEmail, setUserEmail] = useState("")

// //   useEffect(() => {
// //     const userEmail = localStorage.getItem("userEmail")
// //     const authToken = localStorage.getItem("authToken")
    
// //     if (!authToken || !userEmail) {
// //       toast({
// //         title: "Login Required",
// //         description: "Please login to view your conversations",
// //         variant: "destructive"
// //       })
// //       router.push("/auth/login")
// //       return
// //     }

// //     setUserEmail(userEmail)
// //     fetchUserData()
// //   }, [])

// //   const fetchUserData = async () => {
// //     setIsLoading(true)
// //     const token = localStorage.getItem("authToken")

// //     try {
// //       // Fetch user statistics
// //       console.log("📊 Fetching user statistics...")
// //       const statsResponse = await fetch("http://localhost:8000/api/dashboard/statistics", {
// //         headers: { "Authorization": `Bearer ${token}` }
// //       })
      
// //       if (statsResponse.ok) {
// //         const stats = await statsResponse.json()
// //         console.log("📊 User statistics received:", stats)
// //         setStatistics(stats)
// //       }

// //       // Fetch user's conversation sessions
// //       console.log("📋 Fetching user sessions...")
// //       const sessionsResponse = await fetch("http://localhost:8000/api/dashboard/sessions?limit=50", {
// //         headers: { "Authorization": `Bearer ${token}` }
// //       })

// //       if (sessionsResponse.ok) {
// //         const sessionsData = await sessionsResponse.json()
// //         console.log("📋 User sessions received:", sessionsData.length, "sessions")
// //         setSessions(sessionsData)
// //       }

// //     } catch (error) {
// //       console.error("❌ Error fetching user data:", error)
// //       toast({
// //         title: "Error",
// //         description: "Failed to load your conversation data",
// //         variant: "destructive"
// //       })
// //     } finally {
// //       setIsLoading(false)
// //     }
// //   }

// //   const fetchSessionMessages = async (sessionId: string) => {
// //     const token = localStorage.getItem("authToken")
    
// //     try {
// //       console.log(`📋 Fetching messages for session: ${sessionId}`)
// //       const response = await fetch(`http://localhost:8000/api/dashboard/session/${sessionId}/messages`, {
// //         headers: { "Authorization": `Bearer ${token}` }
// //       })

// //       if (response.ok) {
// //         const messages = await response.json()
// //         console.log(`📋 Loaded ${messages.length} messages for session`)
        
// //         const audioCount = messages.filter((m: ConversationMessage) => m.audio_path).length
// //         console.log(`🔊 Found ${audioCount} audio recordings in this session`)
        
// //         setSessionMessages(messages)
// //       }
// //     } catch (error) {
// //       console.error("❌ Error fetching session messages:", error)
// //       toast({
// //         title: "Error",
// //         description: "Failed to load conversation messages",
// //         variant: "destructive"
// //       })
// //     }
// //   }

// //   const viewSessionDetails = async (session: ConversationSession) => {
// //     setSelectedSession(session)
// //     await fetchSessionMessages(session.session_id)
// //   }

// //   const playAudioRecording = async (audioPath: string) => {
// //     if (currentAudio) {
// //       currentAudio.pause()
// //       setCurrentAudio(null)
// //       setPlayingAudio(null)
// //     }

// //     if (playingAudio === audioPath) {
// //       return
// //     }

// //     try {
// //       console.log(`🔊 Playing audio: ${audioPath}`)
// //       const audioUrl = `http://localhost:8000/recordings/${audioPath}`
// //       const audio = new Audio(audioUrl)
      
// //       audio.onended = () => {
// //         console.log(`🔊 Audio playback ended: ${audioPath}`)
// //         setPlayingAudio(null)
// //         setCurrentAudio(null)
// //       }
      
// //       audio.onerror = (e) => {
// //         console.error(`🔊 Audio playback error for ${audioPath}:`, e)
// //         toast({
// //           title: "Playback Error",
// //           description: "Could not play audio recording. The file may not exist.",
// //           variant: "destructive"
// //         })
// //         setPlayingAudio(null)
// //         setCurrentAudio(null)
// //       }
      
// //       await audio.play()
// //       setCurrentAudio(audio)
// //       setPlayingAudio(audioPath)
// //     } catch (error) {
// //       console.error("❌ Error playing audio:", error)
// //       toast({
// //         title: "Playback Error",
// //         description: "Could not play audio recording",
// //         variant: "destructive"
// //       })
// //     }
// //   }

// //   const stopAudio = () => {
// //     if (currentAudio) {
// //       currentAudio.pause()
// //       currentAudio.currentTime = 0
// //       setCurrentAudio(null)
// //       setPlayingAudio(null)
// //       console.log("🔊 Audio stopped by user")
// //     }
// //   }

// //   const downloadAudio = (audioPath: string) => {
// //     const link = document.createElement('a')
// //     link.href = `http://localhost:8000/recordings/${audioPath}`
// //     link.download = audioPath
// //     document.body.appendChild(link)
// //     link.click()
// //     document.body.removeChild(link)
// //     console.log(`📥 Download initiated for: ${audioPath}`)
// //   }

// //   const getLanguageDisplay = (lang: string) => {
// //     const languages: { [key: string]: string } = {
// //       "en-US": "English",
// //       "fr-FR": "Français", 
// //       "ar-SA": "العربية"
// //     }
// //     return languages[lang] || lang
// //   }

// //   const formatTimestamp = (timestamp: string) => {
// //     const date = new Date(timestamp)
// //     return date.toLocaleString('en-US', {
// //       year: 'numeric',
// //       month: 'short',
// //       day: 'numeric',
// //       hour: '2-digit',
// //       minute: '2-digit'
// //     })
// //   }

// //   // Calculate total audio recordings from all sessions
// //   const totalAudioRecordings = sessions.reduce((total, session) => {
// //     return total + (sessionMessages.filter(m => m.audio_path).length || 0)
// //   }, 0)

// //   if (isLoading) {
// //     return (
// //       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
// //         <div className="text-center">
// //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
// //           <p className="mt-4 text-gray-600">Loading your conversations...</p>
// //         </div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
// //       <div className="max-w-6xl mx-auto px-4 py-8">
        
// //         {/* Header */}
// //         <div className="flex items-center justify-between mb-8">
// //           <div>
// //             <h1 className="text-3xl font-bold text-gray-900 mb-2">My Voice Conversations</h1>
// //             <p className="text-gray-600">Welcome back, {userEmail}</p>
// //             {playingAudio && (
// //               <div className="flex items-center gap-2 text-blue-600 mt-2">
// //                 <Volume2 className="w-4 h-4 animate-pulse" />
// //                 <span className="text-sm">Playing: {playingAudio}</span>
// //                 <Button onClick={stopAudio} size="sm" variant="outline">
// //                   Stop
// //                 </Button>
// //               </div>
// //             )}
// //           </div>
// //           <Link href="/assistant">
// //             <Button variant="outline">
// //               <ArrowLeft className="w-4 h-4 mr-2" />
// //               Back to Assistant
// //             </Button>
// //           </Link>
// //         </div>

// //         {/* Stats Cards */}
// //         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
// //           <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
// //             <CardContent className="pt-6">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <p className="text-sm font-medium text-gray-600 mb-1">Total Sessions</p>
// //                   <p className="text-2xl font-bold text-gray-900">{statistics.total_sessions || 0}</p>
// //                 </div>
// //                 <div className="p-3 bg-blue-50 rounded-lg">
// //                   <MessageSquare className="w-6 h-6 text-blue-600" />
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>

// //           <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
// //             <CardContent className="pt-6">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <p className="text-sm font-medium text-gray-600 mb-1">Total Messages</p>
// //                   <p className="text-2xl font-bold text-gray-900">{statistics.total_conversations || 0}</p>
// //                 </div>
// //                 <div className="p-3 bg-green-50 rounded-lg">
// //                   <MessageSquare className="w-6 h-6 text-green-600" />
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>

// //           <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
// //             <CardContent className="pt-6">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <p className="text-sm font-medium text-gray-600 mb-1">Audio Recordings</p>
// //                   <p className="text-2xl font-bold text-gray-900">
// //                     {statistics.total_audio_recordings || totalAudioRecordings || 0}
// //                   </p>
// //                 </div>
// //                 <div className="p-3 bg-orange-50 rounded-lg">
// //                   <Headphones className="w-6 h-6 text-orange-600" />
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>

// //           <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
// //             <CardContent className="pt-6">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <p className="text-sm font-medium text-gray-600 mb-1">Last Activity</p>
// //                   <p className="text-lg font-bold text-gray-900">
// //                     {statistics.last_activity 
// //                       ? new Date(statistics.last_activity).toLocaleDateString()
// //                       : "Never"
// //                     }
// //                   </p>
// //                 </div>
// //                 <div className="p-3 bg-purple-50 rounded-lg">
// //                   <Calendar className="w-6 h-6 text-purple-600" />
// //                 </div>
// //               </div>
// //             </CardContent>
// //           </Card>
// //         </div>

// //         {/* Conversation Sessions List */}
// //         <Card>
// //           <CardHeader>
// //             <CardTitle className="flex items-center justify-between">
// //               <div className="flex items-center">
// //                 <MessageSquare className="w-5 h-5 mr-2" />
// //                 Your Voice Conversation Sessions
// //               </div>
// //               <Button onClick={fetchUserData} variant="outline" size="sm">
// //                 Refresh
// //               </Button>
// //             </CardTitle>
// //           </CardHeader>
// //           <CardContent>
// //             {sessions.length === 0 ? (
// //               <div className="text-center py-12">
// //                 <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
// //                 <h3 className="text-lg font-medium text-gray-600 mb-2">No voice conversations yet</h3>
// //                 <p className="text-gray-500 mb-4">Start talking with your AI assistant to see your voice conversation history here.</p>
// //                 <Link href="/assistant">
// //                   <Button>Start Voice Conversation</Button>
// //                 </Link>
// //               </div>
// //             ) : (
// //               <div className="space-y-4">
// //                 {sessions.map((session, index) => {
// //                   // We can't easily calculate audio count here without fetching messages
// //                   // This would require additional API calls, so we'll show it in the detail view
// //                   return (
// //                     <Card key={session.session_id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
// //                       <CardContent className="pt-4">
// //                         <div className="flex items-start justify-between mb-3">
// //                           <div className="flex-1">
// //                             <div className="flex items-center gap-3 mb-2">
// //                               <Badge variant="outline">
// //                                 <Globe className="w-3 h-3 mr-1" />
// //                                 {getLanguageDisplay(session.language)}
// //                               </Badge>
// //                               <Badge variant="secondary">
// //                                 <MessageSquare className="w-3 h-3 mr-1" />
// //                                 {session.message_count} messages
// //                               </Badge>
// //                               <Badge variant="outline">
// //                                 <Headphones className="w-3 h-3 mr-1" />
// //                                 Audio Session
// //                               </Badge>
// //                               <span className="text-sm text-gray-500">
// //                                 {formatTimestamp(session.last_activity)}
// //                               </span>
// //                             </div>
                            
// //                             <div className="bg-gray-50 p-3 rounded-lg mb-3">
// //                               <p className="text-sm font-medium text-gray-700 mb-1">First message:</p>
// //                               <p className="text-gray-800 line-clamp-2">{session.first_message}</p>
// //                             </div>
                            
// //                             <p className="text-xs text-gray-500 font-mono">
// //                               Session: {session.session_id.slice(-12)}...
// //                             </p>
// //                           </div>
                          
// //                           <Button
// //                             onClick={() => viewSessionDetails(session)}
// //                             variant="outline"
// //                             size="sm"
// //                             className="ml-4"
// //                           >
// //                             <Eye className="w-4 h-4 mr-2" />
// //                             View Details
// //                           </Button>
// //                         </div>
// //                       </CardContent>
// //                     </Card>
// //                   )
// //                 })}
// //               </div>
// //             )}
// //           </CardContent>
// //         </Card>

// //         {/* Session Details Dialog */}
// //         <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
// //           <DialogContent className="max-w-5xl max-h-[80vh] overflow-auto">
// //             <DialogHeader>
// //               <div className="flex items-center justify-between">
// //                 <DialogTitle>
// //                   Voice Conversation Session Details
// //                 </DialogTitle>
// //                 <Button 
// //                   variant="ghost" 
// //                   size="sm"
// //                   onClick={() => setSelectedSession(null)}
// //                 >
// //                   <X className="w-4 h-4" />
// //                 </Button>
// //               </div>
// //             </DialogHeader>
            
// //             {selectedSession && (
// //               <div className="space-y-4">
// //                 {/* Session Info */}
// //                 <div className="bg-gray-50 p-4 rounded-lg">
// //                   <div className="grid grid-cols-3 gap-4">
// //                     <div>
// //                       <p className="text-sm font-medium text-gray-600">Session ID</p>
// //                       <p className="font-mono text-sm">{selectedSession.session_id}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm font-medium text-gray-600">Language</p>
// //                       <p className="text-sm">{getLanguageDisplay(selectedSession.language)}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm font-medium text-gray-600">Messages</p>
// //                       <p className="text-sm">{selectedSession.message_count}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm font-medium text-gray-600">Audio Recordings</p>
// //                       <p className="text-sm">{sessionMessages.filter(m => m.audio_path).length}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm font-medium text-gray-600">Last Activity</p>
// //                       <p className="text-sm">{formatTimestamp(selectedSession.last_activity)}</p>
// //                     </div>
// //                     <div>
// //                       <p className="text-sm font-medium text-gray-600">Session Type</p>
// //                       <div className="flex items-center">
// //                         <Headphones className="w-4 h-4 mr-1 text-orange-500" />
// //                         <span className="text-sm">Voice Conversation</span>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>

// //                 {/* Messages */}
// //                 <div className="space-y-4">
// //                   <h3 className="font-semibold flex items-center">
// //                     <MessageSquare className="w-5 h-5 mr-2" />
// //                     Conversation Messages ({sessionMessages.length})
// //                   </h3>
// //                   <div className="max-h-[400px] overflow-y-auto space-y-4">
// //                     {sessionMessages.map((message, index) => (
// //                       <div key={message.id} className="space-y-2">
// //                         {/* User Message */}
// //                         <div className="flex justify-end">
// //                           <div className="bg-blue-500 text-white p-3 rounded-lg max-w-[70%]">
// //                             <div className="flex items-center justify-between mb-2">
// //                               <span className="text-sm font-medium">You</span>
// //                               <div className="flex items-center gap-2">
// //                                 <span className="text-xs opacity-75">
// //                                   {formatTimestamp(message.timestamp)}
// //                                 </span>
// //                                 {message.audio_path && (
// //                                   <div className="flex gap-1">
// //                                     {playingAudio === message.audio_path ? (
// //                                       <Button
// //                                         size="sm"
// //                                         variant="secondary"
// //                                         onClick={stopAudio}
// //                                       >
// //                                         <Square className="w-3 h-3 mr-1" />
// //                                         Stop
// //                                       </Button>
// //                                     ) : (
// //                                       <Button
// //                                         size="sm"
// //                                         variant="secondary"
// //                                         onClick={() => playAudioRecording(message.audio_path!)}
// //                                       >
// //                                         <PlayCircle className="w-3 h-3 mr-1" />
// //                                         Play
// //                                       </Button>
// //                                     )}
// //                                     <Button
// //                                       size="sm"
// //                                       variant="ghost"
// //                                       onClick={() => downloadAudio(message.audio_path!)}
// //                                       title="Download audio"
// //                                     >
// //                                       <Download className="w-3 h-3" />
// //                                     </Button>
// //                                   </div>
// //                                 )}
// //                               </div>
// //                             </div>
// //                             <p>{message.user_message}</p>
// //                             {message.audio_path && (
// //                               <div className="mt-2 flex items-center text-xs opacity-75">
// //                                 <AudioLines className="w-3 h-3 mr-1" />
// //                                 <span>Voice message recorded</span>
// //                               </div>
// //                             )}
// //                           </div>
// //                         </div>
                        
// //                         {/* AI Response */}
// //                         <div className="flex justify-start">
// //                           <div className="bg-white border p-3 rounded-lg max-w-[70%]">
// //                             <span className="text-sm font-medium text-green-600">AI Response</span>
// //                             <p className="text-gray-800 mt-1">{message.ai_response}</p>
// //                           </div>
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 </div>
// //               </div>
// //             )}
// //           </DialogContent>
// //         </Dialog>
// //       </div>
// //     </div>
// //   )
// // }
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  MessageSquare, PlayCircle, ArrowLeft, Calendar,
  AudioLines, User, Globe, Square, Download, Eye, X, Headphones, Volume2
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface ConversationMessage {
  id: string
  user_message: string
  ai_response: string
  timestamp: string
  user_audio_path?: string
  ai_audio_path?: string
}

interface ConversationSession {
  session_id: string
  language: string
  message_count: number
  first_message: string
  last_activity: string
}

interface UserStats {
  total_sessions?: number
  total_conversations?: number
  total_audio_recordings?: number
  last_activity?: string
}

export default function EnhancedUserDashboard() {
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [sessions, setSessions] = useState<ConversationSession[]>([])
  const [statistics, setStatistics] = useState<UserStats>({})
  const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null)
  const [sessionMessages, setSessionMessages] = useState<ConversationMessage[]>([])
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const userEmail = localStorage.getItem("userEmail")
    const authToken = localStorage.getItem("authToken")
    
    if (!authToken || !userEmail) {
      toast({
        title: t("error.loginRequired"),
        description: t("error.loginRequiredDescription"),
        variant: "destructive"
      })
      router.push("/auth/login")
      return
    }

    setUserEmail(userEmail)
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setIsLoading(true)
    const token = localStorage.getItem("authToken")

    try {
      // Fetch user statistics
      console.log("📊 Fetching user statistics...")
      const statsResponse = await fetch("http://localhost:8000/api/dashboard/statistics", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        console.log("📊 User statistics received:", stats)
        setStatistics(stats)
      }

      // Fetch user's conversation sessions
      console.log("📋 Fetching user sessions...")
      const sessionsResponse = await fetch("http://localhost:8000/api/dashboard/sessions?limit=50", {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        console.log("📋 User sessions received:", sessionsData.length, "sessions")
        setSessions(sessionsData)
      }

    } catch (error) {
      console.error("❌ Error fetching user data:", error)
      toast({
        title: t("error.error"),
        description: t("error.failedToLoadData"),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSessionMessages = async (sessionId: string) => {
    const token = localStorage.getItem("authToken")
    
    try {
      console.log(`📋 Fetching messages for session: ${sessionId}`)
      const response = await fetch(`http://localhost:8000/api/dashboard/session/${sessionId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.ok) {
        const messages = await response.json()
        console.log(`📋 Loaded ${messages.length} messages for session`)
        
        const userAudioCount = messages.filter((m: ConversationMessage) => m.user_audio_path).length
        const aiAudioCount = messages.filter((m: ConversationMessage) => m.ai_audio_path).length
        console.log(`🔊 Found ${userAudioCount} user audio + ${aiAudioCount} AI audio recordings`)
        
        setSessionMessages(messages)
      }
    } catch (error) {
      console.error("❌ Error fetching session messages:", error)
      toast({
        title: t("error.error"),
        description: t("error.failedToLoadMessages"),
        variant: "destructive"
      })
    }
  }

  const viewSessionDetails = async (session: ConversationSession) => {
    setSelectedSession(session)
    await fetchSessionMessages(session.session_id)
  }

  const playAudioRecording = async (audioPath: string) => {
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
      setPlayingAudio(null)
    }

    if (playingAudio === audioPath) {
      return
    }

    try {
      console.log(`🔊 Playing audio: ${audioPath}`)
      const audioUrl = `http://localhost:8000/recordings/${audioPath}`
      const audio = new Audio(audioUrl)
      
      audio.onended = () => {
        console.log(`🔊 Audio playback ended: ${audioPath}`)
        setPlayingAudio(null)
        setCurrentAudio(null)
      }
      
      audio.onerror = (e) => {
        console.error(`🔊 Audio playback error for ${audioPath}:`, e)
        toast({
          title: t("error.playbackError"),
          description: t("error.couldNotPlayAudio"),
          variant: "destructive"
        })
        setPlayingAudio(null)
        setCurrentAudio(null)
      }
      
      await audio.play()
      setCurrentAudio(audio)
      setPlayingAudio(audioPath)
    } catch (error) {
      console.error("❌ Error playing audio:", error)
      toast({
        title: t("error.playbackError"),
        description: t("error.couldNotPlayAudio"),
        variant: "destructive"
      })
    }
  }

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
      setCurrentAudio(null)
      setPlayingAudio(null)
      console.log("🔊 Audio stopped by user")
    }
  }

  const downloadAudio = (audioPath: string) => {
    const link = document.createElement('a')
    link.href = `http://localhost:8000/recordings/${audioPath}`
    link.download = audioPath
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    console.log(`📥 Download initiated for: ${audioPath}`)
  }

  const getLanguageDisplay = (lang: string) => {
    const languages: { [key: string]: string } = {
      "en-US": "English",
      "fr-FR": "Français", 
      "ar-SA": "العربية"
    }
    return languages[lang] || lang
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("dashboard.loadingConversations")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("dashboard.myVoiceConversations")}</h1>
            <p className="text-gray-600">{t("dashboard.welcomeBack")}, {userEmail}</p>
            {playingAudio && (
              <div className="flex items-center gap-2 text-blue-600 mt-2">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span className="text-sm">{t("dashboard.playing")}: {playingAudio}</span>
                <Button onClick={stopAudio} size="sm" variant="outline">
                  {t("dashboard.stop")}
                </Button>
              </div>
            )}
          </div>
          <Link href="/assistant">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("nav.backToAssistant")}
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{t("dashboard.totalSessions")}</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total_sessions || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{t("dashboard.totalMessages")}</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total_conversations || 0}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{t("dashboard.audioRecordings")}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.total_audio_recordings || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{t("dashboard.userAndAiAudio")}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Headphones className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{t("dashboard.lastActivity")}</p>
                  <p className="text-lg font-bold text-gray-900">
                    {statistics.last_activity 
                      ? new Date(statistics.last_activity).toLocaleDateString()
                      : t("dashboard.never")
                    }
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversation Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                {t("dashboard.voiceConversationSessions")}
              </div>
              <Button onClick={fetchUserData} variant="outline" size="sm">
                {t("common.refresh")}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">{t("dashboard.noVoiceConversations")}</h3>
                <p className="text-gray-500 mb-4">{t("dashboard.startTalkingToSeeHistory")}</p>
                <Link href="/assistant">
                  <Button>{t("dashboard.startVoiceConversation")}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session, index) => {
                  return (
                    <Card key={session.session_id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Badge variant="outline">
                                <Globe className="w-3 h-3 mr-1" />
                                {getLanguageDisplay(session.language)}
                              </Badge>
                              <Badge variant="secondary">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                {session.message_count} {t("voice.messages")}
                              </Badge>
                              <Badge variant="outline">
                                <Headphones className="w-3 h-3 mr-1" />
                                {t("dashboard.voiceSession")}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {formatTimestamp(session.last_activity)}
                              </span>
                            </div>
                            
                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                              <p className="text-sm font-medium text-gray-700 mb-1">{t("dashboard.firstMessage")}:</p>
                              <p className="text-gray-800 line-clamp-2">{session.first_message}</p>
                            </div>
                            
                            {/* <p className="text-xs text-gray-500 font-mono">
                              {t("dashboard.session")}: {session.session_id.slice(-12)}...
                            </p> */}
                          </div>
                          
                          <Button
                            onClick={() => viewSessionDetails(session)}
                            variant="outline"
                            size="sm"
                            className="ml-4"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {t("dashboard.viewDetails")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Details Dialog */}
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-auto">
                <br/>
                <DialogTitle>
                  {t("dashboard.voiceConversationSessionDetails")}
                </DialogTitle>

            {/* <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>
                  {t("dashboard.voiceConversationSessionDetails")}
                </DialogTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedSession(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader> */}
            
            {selectedSession && (
              <div className="space-y-4">
                {/* Session Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    {/* <div>
                      <p className="text-sm font-medium text-gray-600">{t("dashboard.sessionId")}</p>
                      <p className="font-mono text-sm">{selectedSession.session_id}</p>
                    </div> */}
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t("dashboard.language")}</p>
                      <p className="text-sm">{getLanguageDisplay(selectedSession.language)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t("voice.messages")}</p>
                      <p className="text-sm">{selectedSession.message_count}</p>
                    </div>
                    <div>
                      {/* <p className="text-sm font-medium text-gray-600">{t("dashboard.audioRecordings")}</p> */}
                      {/* <div className="text-sm">
                        <span className="font-medium">{sessionMessages.filter(m => m.user_audio_path || m.ai_audio_path).length} {t("dashboard.total")}</span>
                        <div className="text-xs text-gray-500">
                          {sessionMessages.filter(m => m.user_audio_path).length} {t("dashboard.user")} + {sessionMessages.filter(m => m.ai_audio_path).length} {t("dashboard.ai")}
                        </div>
                      </div> */}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t("dashboard.lastActivity")}</p>
                      <p className="text-sm">{formatTimestamp(selectedSession.last_activity)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">{t("dashboard.sessionType")}</p>
                      <div className="flex items-center">
                        <Headphones className="w-4 h-4 mr-1 text-orange-500" />
                        <span className="text-sm">{t("dashboard.voiceConversation")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    {t("dashboard.conversationMessages")} ({sessionMessages.length})
                  </h3>
                  <div className="max-h-[400px] overflow-y-auto space-y-4">
                    {sessionMessages.map((message, index) => (
                      <div key={message.id} className="space-y-2">
                        {/* User Message */}
                        <div className="flex justify-end">
                          <div className="bg-blue-500 text-white p-3 rounded-lg max-w-[70%]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium">{t("dashboard.you")}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs opacity-75">
                                  {formatTimestamp(message.timestamp)}
                                </span>
                                {message.user_audio_path && (
                                  <div className="flex gap-1">
                                    {playingAudio === message.user_audio_path ? (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={stopAudio}
                                      >
                                        <Square className="w-3 h-3 mr-1" />
                                        {t("dashboard.stop")}
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => playAudioRecording(message.user_audio_path!)}
                                      >
                                        <PlayCircle className="w-3 h-3 mr-1" />
                                        {t("dashboard.play")}
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => downloadAudio(message.user_audio_path!)}
                                      title={t("dashboard.downloadAudio")}
                                    >
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p>{message.user_message}</p>
                            {message.user_audio_path && (
                              <div className="mt-2 flex items-center text-xs opacity-75">
                                <AudioLines className="w-3 h-3 mr-1" />
                                <span>{t("dashboard.voiceMessageRecorded")}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* AI Response */}
                        <div className="flex justify-start">
                          <div className="bg-white border p-3 rounded-lg max-w-[70%]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-green-600">{t("dashboard.aiResponse")}</span>
                              {message.ai_audio_path && (
                                <div className="flex gap-1">
                                  {playingAudio === message.ai_audio_path ? (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={stopAudio}
                                    >
                                      <Square className="w-3 h-3 mr-1" />
                                      {t("dashboard.stop")}
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => playAudioRecording(message.ai_audio_path!)}
                                    >
                                      <PlayCircle className="w-3 h-3 mr-1" />
                                      {t("dashboard.playAi")}
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => downloadAudio(message.ai_audio_path!)}
                                    title={t("dashboard.downloadAiAudio")}
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-800">{message.ai_response}</p>
                            {message.ai_audio_path && (
                              <div className="mt-2 flex items-center text-xs text-green-600">
                                <AudioLines className="w-3 h-3 mr-1" />
                                <span>{t("dashboard.aiAudioAvailable")}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}