// "use client"

// import { useState, useEffect } from "react"
// import Link from "next/link"
// import { usePathname, useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { 
//   Home, 
//   Settings, 
//   LogOut, 
//   User, 
//   MessageSquare, 
//   ChevronDown,
//   Phone,
//   Mail
// } from "lucide-react"
// import { useLanguage } from "@/hooks/use-language"

// interface UserData {
//   user_id?: string
//   email?: string
//   phone?: string
//   full_name?: string
//   role?: string
//   avatar_url?: string
// }

// export function Navigation() {
//   const pathname = usePathname()
//   console.log("Current Path:", pathname)
//   const hideAssistant =
//   pathname === "/" || pathname === "" || pathname === undefined || pathname.startsWith("/auth")


//   const router = useRouter()
//   const { language, setLanguage, t } = useLanguage()
  
//   // Authentication state
//   const [isLoggedIn, setIsLoggedIn] = useState(false)
//   const [user, setUser] = useState<UserData | null>(null)

//   useEffect(() => {
//     // Check authentication status on mount and route changes
//     const checkAuth = () => {
//       const token = localStorage.getItem("authToken")
//       const userData: UserData = {
//         user_id: localStorage.getItem("userId") || undefined,
//         email: localStorage.getItem("userEmail") || undefined,
//         phone: localStorage.getItem("userPhone") || undefined,
//         full_name: localStorage.getItem("userFullName") || undefined,
//         role: localStorage.getItem("userRole") || undefined,
//         avatar_url: localStorage.getItem("userAvatar") || undefined
//       }

//       if (token && userData.user_id) {
//         setIsLoggedIn(true)
//         setUser(userData)
//       } else {
//         setIsLoggedIn(false)
//         setUser(null)
//       }
//     }
    
//     checkAuth()
    
//     // Re-check on route change and storage changes
//     window.addEventListener("storage", checkAuth)
//     return () => window.removeEventListener("storage", checkAuth)
//   }, [pathname])

//   const handleLogout = () => {
//     localStorage.clear()
//     setIsLoggedIn(false)
//     setUser(null)
//     router.push("/")
//   }

//   const getUserDisplayName = () => {
//     if (!user) return ""
//     return user.full_name || user.email || "User"
//   }

//   const getUserInitials = () => {
//     if (!user) return "U"
//     const name = user.full_name || user.email || "User"
//     return name
//       .split(" ")
//       .map(word => word[0])
//       .join("")
//       .toUpperCase()
//       .substring(0, 2)
//   }

//   const formatPhoneNumber = (phone: string) => {
//     if (!phone) return ""
//     // Format +21612345678 to +216 12 345 678
//     if (phone.startsWith("+216")) {
//       const number = phone.substring(4)
//       return `+216 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
//     }
//     return phone
//   }

//   const supportedLanguages = [
//     { code: "en-US", name: "English (US)" },
//     { code: "fr-FR", name: "Français (France)" },
//     { code: "ar-SA", name: "العربية (السعودية)" },
//   ]

//   return (
//     <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
//       <div className="w-full px-4 py-3">
//         <div className="flex items-center justify-between">
//           {/* Logo and Brand */}
//           <div className="flex items-center">
//             <Link href="/" className="flex items-center">
//               <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
//                 <span className="text-white font-bold text-sm">AI</span>
//               </div>
//               <span className="font-semibold text-gray-900 ml-2">{t("nav.voiceAssistant")}</span>
//             </Link>
//           </div>

//           {/* Navigation and Controls */}
//           <div className="flex items-center gap-2">
//             {/* Show Dashboard only for admin users */}
//             {isLoggedIn && user?.role === "admin" && (
//               <Button asChild variant={pathname === "/dashboard" ? "default" : "ghost"} size="sm">
//                 <Link href="/dashboard" className="flex items-center gap-2">
//                   <Settings className="w-4 h-4" />
//                   <span>{t("nav.dashboard")}</span>
//                 </Link>
//               </Button>
//             )}

//             {/* Show My Chats ONLY for regular users (not admins) */}
//             {isLoggedIn && user?.role === "user" && (
//               <Button asChild variant={pathname === "/dashboard/user" ? "default" : "ghost"} size="sm">
//                 <Link href="/dashboard/user" className="flex items-center gap-2">
//                   <MessageSquare className="w-4 h-4" />
//                   <span>My Chats</span>
//                 </Link>
//               </Button>
//             )}

//             {!hideAssistant && (
//             <Button asChild variant={pathname.includes("/assistant") ? "default" : "ghost"} size="sm">
//               <Link href="/assistant" className="flex items-center gap-2">
//                 <Home className="w-4 h-4" />
//                 <span>{t("nav.assistant")}</span>
//               </Link>
//             </Button>
//           )}



//             {/* Language Selector */}
//             <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Select Language" />
//               </SelectTrigger>
//               <SelectContent>
//                 {supportedLanguages.map((lang) => (
//                   <SelectItem key={lang.code} value={lang.code}>
//                     {lang.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>

//             {/* Authentication Section */}
//             {isLoggedIn && user ? (
//               <div className="ml-2 pl-2 border-l">
//                 <DropdownMenu>
//                   <DropdownMenuTrigger asChild>
//                     <Button variant="ghost" className="relative h-10 w-auto px-3 hover:bg-gray-100">
//                       <div className="flex items-center space-x-2">
//                         <Avatar className="h-8 w-8">
//                           <AvatarImage src={user.avatar_url} alt={getUserDisplayName()} />
//                           <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium">
//                             {getUserInitials()}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div className="flex flex-col items-start min-w-0">
//                           <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
//                             {getUserDisplayName()}
//                           </span>
//                           {user.role === "admin" && (
//                             <Badge variant="secondary" className="text-xs h-4 px-1">
//                               Admin
//                             </Badge>
//                           )}
//                         </div>
//                         <ChevronDown className="h-4 w-4 text-gray-400" />
//                       </div>
//                     </Button>
//                   </DropdownMenuTrigger>
//                   <DropdownMenuContent className="w-72" align="end">
//                     {/* User Info Header */}
//                     <div className="p-4 border-b">
//                       <div className="flex items-center space-x-3">
//                         <Avatar className="h-12 w-12">
//                           <AvatarImage src={user.avatar_url} alt={getUserDisplayName()} />
//                           <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
//                             {getUserInitials()}
//                           </AvatarFallback>
//                         </Avatar>
//                         <div className="flex-1 min-w-0">
//                           <p className="text-sm font-medium text-gray-900 truncate">
//                             {getUserDisplayName()}
//                           </p>
//                           {user.role && (
//                             <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs mt-1">
//                               {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
//                             </Badge>
//                           )}
//                         </div>
//                       </div>
                      
//                       {/* Contact Info */}
//                       <div className="mt-3 space-y-1">
//                         {user.email && (
//                           <div className="flex items-center text-xs text-gray-600">
//                             <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
//                             <span className="truncate">{user.email}</span>
//                           </div>
//                         )}
//                         {user.phone && (
//                           <div className="flex items-center text-xs text-gray-600">
//                             <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
//                             <span>{formatPhoneNumber(user.phone)}</span>
//                           </div>
//                         )}
//                       </div>
//                     </div>

//                     {/* Menu Items */}
//                     <DropdownMenuItem asChild>
//                       <Link href="/profile" className="flex items-center w-full px-4 py-2 text-sm cursor-pointer">
//                         <User className="w-4 h-4 mr-3" />
//                         View Profile
//                       </Link>
//                     </DropdownMenuItem>

//                     {/* <DropdownMenuItem asChild>
//                       <Link href="/dashboard/user" className="flex items-center w-full px-4 py-2 text-sm cursor-pointer">
//                         <MessageSquare className="w-4 h-4 mr-3" />
//                         My Conversations
//                       </Link>
//                     </DropdownMenuItem> */}

//                     {user.role === "admin" && (
//                       <DropdownMenuItem asChild>
//                         <Link href="/dashboard" className="flex items-center w-full px-4 py-2 text-sm cursor-pointer">
//                           <Settings className="w-4 h-4 mr-3" />
//                           Admin Dashboard
//                         </Link>
//                       </DropdownMenuItem>
//                     )}

//                     <DropdownMenuSeparator />

//                     <DropdownMenuItem 
//                       onClick={handleLogout}
//                       className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
//                     >
//                       <LogOut className="w-4 h-4 mr-3" />
//                       {t("common.logout") || "Logout"}
//                     </DropdownMenuItem>
//                   </DropdownMenuContent>
//                 </DropdownMenu>
//               </div>
//             ) : (
//               <div className="flex items-center gap-2 ml-2 pl-2 border-l">
//                 <Button asChild variant="ghost" size="sm">
//                   <Link href="/auth/login">{t("common.login")}</Link>
//                 </Button>
//                 <Button asChild size="sm">
//                   <Link href="/auth/register">{t("common.signUp")}</Link>
//                 </Button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Home, 
  Settings, 
  LogOut, 
  User, 
  MessageSquare, 
  ChevronDown,
  Phone,
  Mail
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language"

interface UserData {
  user_id?: string
  email?: string
  phone?: string
  full_name?: string
  role?: string
  avatar_url?: string
}

export function Navigation() {
  const pathname = usePathname()
  const hideAssistant = pathname === "/" || pathname.startsWith("/auth")
  const router = useRouter()
  const { language, setLanguage, t, isRTL } = useLanguage() // Get isRTL for layout fixes
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("authToken")
      const userData: UserData = {
        user_id: localStorage.getItem("userId") || undefined,
        email: localStorage.getItem("userEmail") || undefined,
        phone: localStorage.getItem("userPhone") || undefined,
        full_name: localStorage.getItem("userFullName") || undefined,
        role: localStorage.getItem("userRole") || undefined,
        avatar_url: localStorage.getItem("userAvatar") || undefined
      }

      if (token && userData.user_id) {
        setIsLoggedIn(true)
        setUser(userData)
      } else {
        setIsLoggedIn(false)
        setUser(null)
      }
    }
    
    checkAuth()
    
    window.addEventListener("storage", checkAuth)
    return () => window.removeEventListener("storage", checkAuth)
  }, [pathname])

  const handleLogout = () => {
    localStorage.clear()
    setIsLoggedIn(false)
    setUser(null)
    router.push("/")
  }

  const getUserDisplayName = () => {
    if (!user) return ""
    return user.full_name || user.email || "User"
  }

  const getUserInitials = () => {
    if (!user) return "U"
    const name = user.full_name || user.email || "User"
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return ""
    if (phone.startsWith("+216")) {
      const number = phone.substring(4)
      return `+216 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
    }
    return phone
  }

  const supportedLanguages = [
    { code: "en-US", name: "English (US)" },
    { code: "fr-FR", name: "Français (France)" },
    { code: "ar-SA", name: "العربية (السعودية)" },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="w-full px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className={`font-semibold text-gray-900 ${isRTL ? 'mr-2' : 'ml-2'}`}>{t("nav.voiceAssistant")}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn && user?.role === "admin" && (
              <Button asChild variant={pathname === "/dashboard" ? "default" : "ghost"} size="sm">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>{t("nav.dashboard")}</span>
                </Link>
              </Button>
            )}

            {isLoggedIn && user?.role === "user" && (
              <Button asChild variant={pathname === "/dashboard/user" ? "default" : "ghost"} size="sm">
                <Link href="/dashboard/user" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  {/* CHANGED: Translated "My Chats" */}
                  <span>{t("nav.myConversations")}</span>
                </Link>
              </Button>
            )}

            {!hideAssistant && (
              <Button asChild variant={pathname.includes("/assistant") ? "default" : "ghost"} size="sm">
                <Link href="/assistant" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span>{t("nav.assistant")}</span>
                </Link>
              </Button>
            )}

            <Select value={language} onValueChange={(value) => setLanguage(value as any)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {isLoggedIn && user ? (
              <div className={`${isRTL ? 'mr-2 pr-2 border-r' : 'ml-2 pl-2 border-l'}`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-auto px-3 hover:bg-gray-100">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url} alt={getUserDisplayName()} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium">{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start min-w-0">
                          <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{getUserDisplayName()}</span>
                          {user.role === "admin" && <Badge variant="secondary" className="text-xs h-4 px-1">Admin</Badge>}
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-72" align="end">
                    <div className="p-4 border-b">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12"><AvatarImage src={user.avatar_url} alt={getUserDisplayName()} /><AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">{getUserInitials()}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{getUserDisplayName()}</p>
                          {user.role && <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs mt-1">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>}
                        </div>
                      </div>
                      <div className="mt-3 space-y-1">
                        {user.email && <div className="flex items-center text-xs text-gray-600" dir="ltr"><Mail className="w-3 h-3 mr-2 flex-shrink-0" /><span className="truncate">{user.email}</span></div>}
                        {user.phone && <div className="flex items-center text-xs text-gray-600" dir="ltr"><Phone className="w-3 h-3 mr-2 flex-shrink-0" /><span>{formatPhoneNumber(user.phone)}</span></div>}
                      </div>
                    </div>

                    {/* CHANGED: Translated Menu Items */}
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center w-full px-4 py-2 text-sm cursor-pointer">
                        <User className={`${isRTL ? 'ml-3' : 'mr-3'} w-4 h-4`} />
                        {t("nav.viewProfile")}
                      </Link>
                    </DropdownMenuItem>

                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center w-full px-4 py-2 text-sm cursor-pointer">
                          <Settings className={`${isRTL ? 'ml-3' : 'mr-3'} w-4 h-4`} />
                          {t("nav.adminDashboard")}
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuSeparator />

                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className={`${isRTL ? 'ml-3' : 'mr-3'} w-4 h-4`} />
                      {t("common.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className={`flex items-center gap-2 ${isRTL ? 'mr-2 pr-2 border-r' : 'ml-2 pl-2 border-l'}`}>
                <Button asChild variant="ghost" size="sm"><Link href="/auth/login">{t("common.login")}</Link></Button>
                <Button asChild size="sm"><Link href="/auth/register">{t("common.signUp")}</Link></Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}