
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  BarChart3, Users, MessageSquare, Clock, Settings, Download, 
  Trash2, RefreshCw, Search, Calendar, PlayCircle,
  AudioLines, Eye, X, Square, Volume2, Headphones, ArrowLeft
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
  user_email?: string
  full_name?: string
  language: string
  message_count: number
  first_message: string
  last_activity: string
  user_audio_count?: number
  ai_audio_count?: number
  total_audio_count?: number
}

interface Statistics {
  total_users?: number
  total_sessions?: number
  total_conversations?: number
  total_audio_recordings?: number
  user_audio_recordings?: number
  ai_audio_recordings?: number
  active_days?: number
}

export default function CompleteAdminDashboard() {
  const { t } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isLoading, setIsLoading] = useState(true)
  const [sessions, setSessions] = useState<ConversationSession[]>([])
  const [filteredSessions, setFilteredSessions] = useState<ConversationSession[]>([])
  const [statistics, setStatistics] = useState<Statistics>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState("")
  const [selectedSession, setSelectedSession] = useState<ConversationSession | null>(null)
  const [sessionMessages, setSessionMessages] = useState<ConversationMessage[]>([])
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)

  useEffect(() => {
    const userRole = localStorage.getItem("userRole")
    const authToken = localStorage.getItem("authToken")
    
    if (!authToken || userRole !== "admin") {
      toast({
        title: t("dashboard.accessDenied"),
        description: t("dashboard.adminAccessRequired"),
        variant: "destructive"
      })
      router.push("/")
      return
    }

    fetchDashboardData()
  }, [t, toast, router])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    const token = localStorage.getItem("authToken")

    try {
      // Fetch statistics
      console.log("📊 Fetching admin statistics...")
      const statsResponse = await fetch("http://localhost:8000/api/dashboard/statistics", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      
      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        console.log("📊 Admin statistics received:", stats)
        setStatistics(stats)
      } else {
        console.error("❌ Failed to fetch statistics")
      }

      // Fetch sessions with audio counts
      console.log("📋 Fetching admin sessions...")
      const sessionsResponse = await fetch("http://localhost:8000/api/dashboard/sessions", {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        console.log("📋 Admin sessions received:", sessionsData.length, "sessions")
        
        setSessions(sessionsData)
        setFilteredSessions(sessionsData)
      } else {
        const errorText = await sessionsResponse.text()
        console.error("❌ Sessions endpoint failed:", errorText)
      }

    } catch (error) {
      console.error("❌ Error fetching admin dashboard data:", error)
      toast({
        title: t("dashboard.errorLoading"),
        description: t("dashboard.failedToLoad"),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Search and filter functionality
  useEffect(() => {
    let filtered = sessions

    if (searchTerm) {
      filtered = filtered.filter(session => 
        session.first_message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (dateFilter) {
      filtered = filtered.filter(session => 
        session.last_activity?.startsWith(dateFilter)
      )
    }

    setFilteredSessions(filtered)
  }, [searchTerm, dateFilter, sessions])

  const fetchSessionMessages = async (sessionId: string) => {
    const token = localStorage.getItem("authToken")
    
    try {
      console.log(`📋 Fetching messages for session: ${sessionId}`)
      const response = await fetch(`http://localhost:8000/api/dashboard/session/${sessionId}/messages`, {
        headers: { "Authorization": `Bearer ${token}` }
      })

      if (response.ok) {
        const messages = await response.json()
        console.log(`📋 Loaded ${messages.length} messages for session ${sessionId}`)
        
        // Count audio recordings in this session
        const userAudioCount = messages.filter((m: ConversationMessage) => m.user_audio_path).length
        const aiAudioCount = messages.filter((m: ConversationMessage) => m.ai_audio_path).length
        console.log(`🔊 Found ${userAudioCount} user audio + ${aiAudioCount} AI audio recordings`)
        
        setSessionMessages(messages)
      } else {
        console.error("❌ Failed to fetch session messages")
        toast({
          title: t("dashboard.errorLoading"),
          description: t("dashboard.failedToLoad"),
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("❌ Error fetching session messages:", error)
      toast({
        title: t("dashboard.errorLoading"),
        description: t("dashboard.failedToLoad"),
        variant: "destructive"
      })
    }
  }

  const viewSessionDetails = async (session: ConversationSession) => {
    setSelectedSession(session)
    await fetchSessionMessages(session.session_id)
  }

  const playAudioRecording = async (audioPath: string) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause()
      setCurrentAudio(null)
      setPlayingAudio(null)
    }

    // If clicking on the same audio, just stop it
    if (playingAudio === audioPath) {
      return
    }

    try {
      console.log(`🔊 Playing audio: ${audioPath}`)
      const audioUrl = `http://localhost:8000/recordings/${audioPath}`
      const audio = new Audio(audioUrl)
      
      // Set up event handlers
      audio.onloadstart = () => console.log(`🔊 Audio loading: ${audioPath}`)
      audio.oncanplay = () => console.log(`🔊 Audio ready: ${audioPath}`)
      audio.onended = () => {
        console.log(`🔊 Audio ended: ${audioPath}`)
        setPlayingAudio(null)
        setCurrentAudio(null)
      }
      audio.onerror = (e) => {
        console.error(`🔊 Audio error: ${audioPath}`, e)
        toast({
          title: t("dashboard.playbackError"),
          description: t("dashboard.couldNotPlayAudio"),
          variant: "destructive"
        })
        setPlayingAudio(null)
        setCurrentAudio(null)
      }
      
      await audio.play()
      setCurrentAudio(audio)
      setPlayingAudio(audioPath)
      console.log(`🔊 Audio playing: ${audioPath}`)
    } catch (error) {
      console.error("❌ Error playing audio:", error)
      toast({
        title: t("dashboard.playbackError"),
        description: t("dashboard.couldNotPlayAudio"),
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
      console.log("🔊 Audio stopped by admin")
    }
  }

  const downloadAudio = (audioPath: string) => {
    const link = document.createElement('a')
    link.href = `http://localhost:8000/recordings/${audioPath}`
    link.download = audioPath
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    console.log(`📥 Admin audio download initiated: ${audioPath}`)
  }

  const exportToCSV = () => {
    const csv = [
      [
        t("admin.dashboard.sessionId"), 
        t("dashboard.user") + " Email", 
        t("profile.fullName"), 
        t("dashboard.language"), 
        t("admin.dashboard.messagesCount"), 
        t("admin.dashboard.userAudio"), 
        t("admin.dashboard.aiAudio"), 
        t("admin.dashboard.totalAudio"), 
        t("admin.dashboard.firstMessage"), 
        t("admin.dashboard.lastActivity")
      ],
      ...filteredSessions.map(session => {
        const userAudioCount = session.user_audio_count || 0
        const aiAudioCount = session.ai_audio_count || 0
        return [
          session.session_id,
          session.user_email || t("dashboard.guest"),
          session.full_name || t("profile.notProvided"),
          session.language,
          session.message_count.toString(),
          userAudioCount.toString(),
          aiAudioCount.toString(),
          (userAudioCount + aiAudioCount).toString(),
          session.first_message,
          session.last_activity
        ]
      })
    ].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `admin-voice-sessions-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    console.log("📊 Admin CSV export completed")
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

  const handleLogout = () => {
    localStorage.clear()
    router.push("/auth/login")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("common.loading")} {t("admin.dashboard.title").toLowerCase()}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("admin.dashboard.title")}
            </h1>
            <p className="text-gray-600">{t("admin.dashboard.subtitle")}</p>
            {playingAudio && (
              <div className="flex items-center gap-2 text-blue-600 mt-2">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span className="text-sm">{t("admin.dashboard.playing")}: {playingAudio}</span>
                <Button onClick={stopAudio} size="sm" variant="outline">
                  {t("admin.dashboard.stop")}
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/assistant">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("nav.backToAssistant")}
              </Button>
            </Link>
            <Button onClick={handleLogout} variant="destructive">
              {t("common.logout")}
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("admin.dashboard.totalUsers")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total_users || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("admin.dashboard.sessions")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total_sessions || 0}</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("admin.dashboard.messages")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.total_conversations || 0}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("admin.dashboard.totalAudio")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.total_audio_recordings || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{t("admin.dashboard.userAudio")} + {t("admin.dashboard.aiAudio")}</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("admin.dashboard.userAudio")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.user_audio_recordings || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{t("dashboard.user")} {t("dashboard.audioRecordings")}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <AudioLines className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {t("admin.dashboard.aiAudio")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.ai_audio_recordings || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">AI {t("dashboard.aiResponse")}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Volume2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 flex-wrap items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder={t("admin.dashboard.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-[200px]"
                placeholder="Filter by date"
              />

              <Button onClick={fetchDashboardData} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                {t("admin.dashboard.refresh")}
              </Button>

              <Button onClick={exportToCSV} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                {t("admin.dashboard.exportCSV")}
              </Button>

              {/* Audio Control Display */}
              {playingAudio && (
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <Volume2 className="w-4 h-4 animate-pulse text-blue-600" />
                  <span className="text-sm text-blue-600">{t("admin.dashboard.playing")}: {playingAudio}</span>
                  <Button onClick={stopAudio} variant="destructive" size="sm">
                    <Square className="w-4 h-4 mr-1" />
                    {t("admin.dashboard.stop")}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
              <span>{t("admin.dashboard.showingSessions").replace("{count}", filteredSessions.length.toString())}</span>
              <span>{t("admin.dashboard.totalAudio")}: {statistics.total_audio_recordings || 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                {t("admin.dashboard.conversationMessages")}
              </div>
              <Badge variant="outline">{filteredSessions.length} {t("admin.dashboard.sessions")}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-white border-b z-10">
                  <tr>
                    {/* <th className="text-left p-4 bg-gray-50 font-medium">{t("admin.dashboard.sessionId")}</th> */}
                    <th className="text-left p-4 bg-gray-50 font-medium">{t("admin.dashboard.user")}</th>
                    <th className="text-left p-4 bg-gray-50 font-medium">{t("admin.dashboard.messagesCount")}</th>
                    {/* <th className="text-left p-4 bg-gray-50 font-medium">{t("admin.dashboard.audioFiles")}</th> */}
                    <th className="text-left p-4 bg-gray-50 font-medium">{t("admin.dashboard.firstMessage")}</th>
                    <th className="text-left p-4 bg-gray-50 font-medium">{t("dashboard.language")}</th>
                    <th className="text-left p-4 bg-gray-50 font-medium">{t("admin.dashboard.lastActivity")}</th>
                    <th className="text-left p-4 bg-gray-50 font-medium">{t("admin.dashboard.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSessions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-500">
                        <div className="flex flex-col items-center">
                          <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                          <p className="text-lg font-medium mb-2">{t("admin.dashboard.noSessions")}</p>
                          <p className="text-sm">Try adjusting your search or date filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSessions.map((session) => {
                      const userAudioCount = session.user_audio_count || 0
                      const aiAudioCount = session.ai_audio_count || 0
                      const totalAudio = userAudioCount + aiAudioCount
                      
                      return (
                        <tr key={session.session_id} className="border-b hover:bg-gray-50 transition-colors">
                          {/* <td className="p-4 text-sm">
                            <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
                              {session.session_id.slice(-12)}...
                            </span>
                          </td> */}
                          <td className="p-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-900">
                                {session.full_name || t("dashboard.guest")}
                              </p>
                              <p className="text-gray-500 text-xs">
                                {session.user_email || t("dashboard.noEmail")}
                              </p>
                            </div>
                          </td>
                          <td className="p-4 text-sm">
                            <Badge variant="secondary" className="text-xs">
                              {session.message_count} {t("admin.dashboard.messages")}
                            </Badge>
                          </td>
                          {/* <td className="p-4 text-sm">
                            {totalAudio > 0 ? (
                              <div className="flex items-center gap-2">
                                <Headphones className="w-4 h-4 text-orange-500" />
                                <div className="text-xs">
                                  <span className="font-medium text-orange-600">{totalAudio} total</span>
                                  <div className="text-gray-500">
                                    {userAudioCount}👤 + {aiAudioCount}🤖
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-xs">{t("dashboard.noAudio")}</span>
                            )}
                          </td> */}
                          <td className="p-4 text-sm max-w-[200px]">
                            <p className="truncate" title={session.first_message}>
                              {session.first_message}
                            </p>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="text-xs">
                              {getLanguageDisplay(session.language)}
                            </Badge>
                          </td>
                          <td className="p-4 text-sm">
                            <div className="text-xs text-gray-600">
                              {formatTimestamp(session.last_activity)}
                            </div>
                          </td>
                          <td className="p-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewSessionDetails(session)}
                              className="text-xs"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              {t("admin.dashboard.view")}
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Session Details Dialog */}
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="max-w-6xl max-h-[85vh] overflow-auto">
            <br/>
            <DialogTitle className="text-xl">
                  {t("admin.dashboard.sessionDetails")}
            </DialogTitle>
            {/* <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">
                  {t("admin.dashboard.sessionDetails")}
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
              <div className="space-y-6">
                {/* Enhanced Session Info */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg border">
                  <h3 className="text-lg font-semibold mb-4">{t("admin.dashboard.sessionInfo")}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {/* <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{t("admin.dashboard.sessionId")}</p>
                      <p className="font-mono text-sm bg-white px-2 py-1 rounded border">
                        {selectedSession.session_id}
                      </p>
                    </div> */}
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{t("admin.dashboard.user")}</p>
                      <div className="text-sm">
                        <p className="font-medium">{selectedSession.full_name || t("dashboard.guest")}</p>
                        <p className="text-gray-500 text-xs">{selectedSession.user_email || t("dashboard.noEmail")}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{t("dashboard.language")}</p>
                      <Badge variant="outline">{getLanguageDisplay(selectedSession.language)}</Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{t("admin.dashboard.totalMessages")}</p>
                      <p className="text-lg font-bold text-blue-600">{selectedSession.message_count}</p>
                    </div>
                    {/* <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{t("admin.dashboard.audioRecordings")}</p>
                      <div className="text-sm">
                        <span className="font-medium text-orange-600">
                          {sessionMessages.filter(m => m.user_audio_path || m.ai_audio_path).length} total
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {sessionMessages.filter(m => m.user_audio_path).length} {t("dashboard.user")} • {" "}
                          {sessionMessages.filter(m => m.ai_audio_path).length} AI
                        </div>
                      </div>
                    </div> */}
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">{t("admin.dashboard.lastActivity")}</p>
                      <p className="text-sm">{formatTimestamp(selectedSession.last_activity)}</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Messages Display */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold flex items-center">
                      <MessageSquare className="w-5 h-5 mr-2" />
                      {t("admin.dashboard.conversationMessages")} ({sessionMessages.length})
                    </h3>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        {sessionMessages.filter(m => m.user_audio_path).length} {t("admin.dashboard.userAudio")}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {sessionMessages.filter(m => m.ai_audio_path).length} {t("admin.dashboard.aiAudio")}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="max-h-[500px] overflow-y-auto space-y-6 pr-2 border rounded-lg p-4 bg-gray-50">
                    {sessionMessages.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p>{t("dashboard.noConversationsFound")}</p>
                      </div>
                    ) : (
                      sessionMessages.map((message, index) => (
                        <div key={message.id} className="space-y-4 border-b border-gray-200 pb-6 last:border-b-0">
                          {/* User Message */}
                          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-blue-700">
                                  👤 {t("admin.dashboard.userMessage")} #{index + 1}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(message.timestamp)}
                                </span>
                                {message.user_audio_path && (
                                  <div className="flex gap-1">
                                    {playingAudio === message.user_audio_path ? (
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={stopAudio}
                                      >
                                        <Square className="w-3 h-3 mr-1" />
                                        {t("admin.dashboard.stop")}
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => playAudioRecording(message.user_audio_path!)}
                                      >
                                        <PlayCircle className="w-3 h-3 mr-1" />
                                        {t("admin.dashboard.play")}
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => downloadAudio(message.user_audio_path!)}
                                      title={t("admin.dashboard.download") + " user audio"}
                                    >
                                      <Download className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-800 leading-relaxed">{message.user_message}</p>
                            {message.user_audio_path && (
                              <div className="mt-3 flex items-center text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                <AudioLines className="w-3 h-3 mr-1" />
                                <span>Audio file: {message.user_audio_path}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* AI Response */}
                          <div className="bg-green-50 border border-green-200 p-4 rounded-lg ml-8">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-green-700">
                                  🤖 {t("admin.dashboard.aiResponse")}
                                </span>
                              </div>
                              {message.ai_audio_path && (
                                <div className="flex gap-1">
                                  {playingAudio === message.ai_audio_path ? (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={stopAudio}
                                    >
                                      <Square className="w-3 h-3 mr-1" />
                                      {t("admin.dashboard.stop")}
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => playAudioRecording(message.ai_audio_path!)}
                                    >
                                      <Volume2 className="w-3 h-3 mr-1" />
                                      {t("admin.dashboard.play")} AI
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => downloadAudio(message.ai_audio_path!)}
                                    title={t("admin.dashboard.download") + " AI audio"}
                                  >
                                    <Download className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            <p className="text-gray-800 leading-relaxed">{message.ai_response}</p>
                            {message.ai_audio_path && (
                              <div className="mt-3 flex items-center text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                <AudioLines className="w-3 h-3 mr-1" />
                                <span>AI audio: {message.ai_audio_path}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
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
