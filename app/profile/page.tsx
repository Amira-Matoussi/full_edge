// "use client"

// import { useState, useEffect, useRef } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import { Badge } from "@/components/ui/badge"
// import { Separator } from "@/components/ui/separator"
// import { useToast } from "@/hooks/use-toast"
// import { 
//   User, 
//   Mail, 
//   Phone, 
//   Calendar, 
//   Shield,
//   Camera,
//   ArrowLeft,
//   Save,
//   Edit2,
//   CheckCircle,
//   AlertCircle
// } from "lucide-react"

// interface UserProfile {
//   user_id: string
//   email: string
//   phone?: string
//   full_name?: string
//   role: string
//   created_at: string
//   last_login?: string
//   phone_verified: boolean
//   email_verified: boolean
//   avatar_url?: string
// }

// export default function ProfilePage() {
//   const router = useRouter()
//   const { toast } = useToast()
//   const fileInputRef = useRef<HTMLInputElement>(null)
  
//   const [profile, setProfile] = useState<UserProfile | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [isEditing, setIsEditing] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
//   const [editForm, setEditForm] = useState({
//     full_name: "",
//     phone: ""
//   })

//   useEffect(() => {
//     const token = localStorage.getItem("authToken")
//     if (!token) {
//       router.push("/auth/login")
//       return
//     }
    
//     fetchProfile()
//   }, [])

//   const fetchProfile = async () => {
//     const token = localStorage.getItem("authToken")
//     if (!token) return

//     try {
//       // First get from localStorage for immediate display
//       const localProfile: UserProfile = {
//         user_id: localStorage.getItem("userId") || "",
//         email: localStorage.getItem("userEmail") || "",
//         phone: localStorage.getItem("userPhone") || "",
//         full_name: localStorage.getItem("userFullName") || "",
//         role: localStorage.getItem("userRole") || "user",
//         avatar_url: localStorage.getItem("userAvatar") || "",
//         created_at: new Date().toISOString(),
//         phone_verified: false,
//         email_verified: false
//       }

//       // Set local data first for better UX
//       if (localProfile.email) {
//         setProfile(localProfile)
//         setEditForm({
//           full_name: localProfile.full_name || "",
//           phone: localProfile.phone || ""
//         })
//         setIsLoading(false)
//       }

//       // Then try to fetch from API for complete data
//       try {
//         const response = await fetch("/api/profile", {
//           headers: {
//             "Authorization": `Bearer ${token}`
//           }
//         })

//         if (response.ok) {
//           const data = await response.json()
//           setProfile(data)
//           setEditForm({
//             full_name: data.full_name || "",
//             phone: data.phone || ""
//           })
//         }
//       } catch (apiError) {
//         console.log("API not available, using local storage data")
//       }

//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to load profile",
//         variant: "destructive"
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleSaveProfile = async () => {
//     const token = localStorage.getItem("authToken")
//     if (!token) return

//     setIsSaving(true)
//     try {
//       // Update localStorage immediately for better UX
//       localStorage.setItem("userFullName", editForm.full_name || "")
//       localStorage.setItem("userPhone", editForm.phone || "")

//       // Update local state
//       setProfile(prev => prev ? {
//         ...prev,
//         full_name: editForm.full_name,
//         phone: editForm.phone
//       } : null)

//       // Try to update via API
//       try {
//         const response = await fetch("/api/profile", {
//           method: "PUT",
//           headers: {
//             "Authorization": `Bearer ${token}`,
//             "Content-Type": "application/json"
//           },
//           body: JSON.stringify(editForm)
//         })

//         if (response.ok) {
//           const updatedProfile = await response.json()
//           setProfile(updatedProfile)
//         }
//       } catch (apiError) {
//         console.log("API not available, using local storage")
//       }

//       setIsEditing(false)
//       toast({
//         title: "Profile Updated",
//         description: "Your profile has been successfully updated"
//       })

//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to update profile",
//         variant: "destructive"
//       })
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0]
//     if (!file) return

//     // Validate file
//     if (!file.type.startsWith('image/')) {
//       toast({
//         title: "Invalid File",
//         description: "Please select an image file",
//         variant: "destructive"
//       })
//       return
//     }

//     if (file.size > 5 * 1024 * 1024) { // 5MB limit
//       toast({
//         title: "File Too Large",
//         description: "Please select an image smaller than 5MB",
//         variant: "destructive"
//       })
//       return
//     }

//     setIsUploadingAvatar(true)
//     try {
//       // Create a local URL for immediate preview
//       const localUrl = URL.createObjectURL(file)
      
//       // Update state immediately for better UX
//       setProfile(prev => prev ? { ...prev, avatar_url: localUrl } : null)
//       localStorage.setItem("userAvatar", localUrl)

//       // Try to upload to API
//       const token = localStorage.getItem("authToken")
//       if (token) {
//         try {
//           const formData = new FormData()
//           formData.append('avatar', file)

//           const response = await fetch("/api/profile/avatar", {
//             method: "POST",
//             headers: {
//               "Authorization": `Bearer ${token}`
//             },
//             body: formData
//           })

//           if (response.ok) {
//             const data = await response.json()
//             setProfile(prev => prev ? { ...prev, avatar_url: data.avatar_url } : null)
//             localStorage.setItem("userAvatar", data.avatar_url)
//           }
//         } catch (apiError) {
//           console.log("Avatar API not available, using local preview")
//         }
//       }
      
//       toast({
//         title: "Avatar Updated",
//         description: "Your profile picture has been updated"
//       })

//     } catch (error) {
//       toast({
//         title: "Upload Failed",
//         description: "Failed to upload avatar",
//         variant: "destructive"
//       })
//     } finally {
//       setIsUploadingAvatar(false)
//     }
//   }

//   const getUserInitials = () => {
//     if (!profile) return "U"
//     const name = profile.full_name || profile.email || "User"
//     return name
//       .split(" ")
//       .map(word => word[0])
//       .join("")
//       .toUpperCase()
//       .substring(0, 2)
//   }

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   const formatPhoneNumber = (phone: string) => {
//     if (!phone) return ""
//     if (phone.startsWith("+216")) {
//       const number = phone.substring(4)
//       return `+216 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
//     }
//     return phone
//   }

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading profile...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!profile) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
//           <p className="text-gray-600">Failed to load profile</p>
//           <Button onClick={() => router.push("/auth/login")} className="mt-4">
//             Go to Login
//           </Button>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
//       <div className="max-w-4xl mx-auto px-4 py-8">
        
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div className="flex items-center">
//             <Button variant="outline" onClick={() => router.back()} className="mr-4">
//               <ArrowLeft className="w-4 h-4 mr-2" />
//               Back
//             </Button>
//             <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
//           </div>
          
//           {!isEditing && (
//             <Button onClick={() => setIsEditing(true)}>
//               <Edit2 className="w-4 h-4 mr-2" />
//               Edit Profile
//             </Button>
//           )}
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
//           {/* Profile Card */}
//           <Card className="lg:col-span-1">
//             <CardContent className="pt-6">
//               <div className="flex flex-col items-center text-center">
//                 <div className="relative">
//                   <Avatar className="h-24 w-24 mb-4">
//                     <AvatarImage src={profile.avatar_url} alt={profile.full_name || profile.email} />
//                     <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-medium">
//                       {getUserInitials()}
//                     </AvatarFallback>
//                   </Avatar>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
//                     onClick={() => fileInputRef.current?.click()}
//                     disabled={isUploadingAvatar}
//                   >
//                     <Camera className="w-4 h-4" />
//                   </Button>
//                   <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleAvatarUpload}
//                     accept="image/*"
//                     className="hidden"
//                   />
//                 </div>
                
//                 {isUploadingAvatar && (
//                   <div className="text-sm text-gray-500 mb-2">Uploading...</div>
//                 )}
                
//                 <h2 className="text-xl font-semibold text-gray-900 mb-1">
//                   {profile.full_name || "User"}
//                 </h2>
                
//                 <p className="text-gray-600 mb-3">{profile.email}</p>
                
//                 <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
//                   {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
//                 </Badge>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Details Card */}
//           <Card className="lg:col-span-2">
//             <CardHeader>
//               <CardTitle className="flex items-center justify-between">
//                 <span>Profile Information</span>
//                 {isEditing && (
//                   <div className="flex gap-2">
//                     <Button variant="outline" onClick={() => setIsEditing(false)}>
//                       Cancel
//                     </Button>
//                     <Button onClick={handleSaveProfile} disabled={isSaving}>
//                       {isSaving ? (
//                         <>
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
//                           Saving...
//                         </>
//                       ) : (
//                         <>
//                           <Save className="w-4 h-4 mr-2" />
//                           Save Changes
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 )}
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
              
//               {/* Full Name */}
//               <div>
//                 <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
//                   <User className="w-4 h-4 mr-2" />
//                   Full Name
//                 </Label>
//                 {isEditing ? (
//                   <Input
//                     value={editForm.full_name}
//                     onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
//                     placeholder="Enter your full name"
//                   />
//                 ) : (
//                   <p className="text-gray-900">{profile.full_name || "Not provided"}</p>
//                 )}
//               </div>

//               <Separator />

//               {/* Email */}
//               <div>
//                 <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
//                   <Mail className="w-4 h-4 mr-2" />
//                   Email Address
//                   {profile.email_verified && (
//                     <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
//                   )}
//                 </Label>
//                 <p className="text-gray-900">{profile.email}</p>
//                 {!profile.email_verified && (
//                   <p className="text-sm text-amber-600 mt-1">Email not verified</p>
//                 )}
//               </div>

//               <Separator />

//               {/* Phone */}
//               <div>
//                 <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
//                   <Phone className="w-4 h-4 mr-2" />
//                   Phone Number
//                   {profile.phone_verified && (
//                     <CheckCircle className="w-4 h-4 ml-2 text-green-500" />
//                   )}
//                 </Label>
//                 {isEditing ? (
//                   <Input
//                     value={editForm.phone}
//                     onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
//                     placeholder="+216 XX XXX XXX"
//                     type="tel"
//                   />
//                 ) : (
//                   <div>
//                     <p className="text-gray-900">
//                       {profile.phone ? formatPhoneNumber(profile.phone) : "Not provided"}
//                     </p>
//                     {profile.phone && !profile.phone_verified && (
//                       <p className="text-sm text-amber-600 mt-1">Phone not verified</p>
//                     )}
//                   </div>
//                 )}
//               </div>

//               <Separator />

//               {/* Role */}
//               <div>
//                 <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
//                   <Shield className="w-4 h-4 mr-2" />
//                   Account Type
//                 </Label>
//                 <Badge variant={profile.role === "admin" ? "default" : "secondary"}>
//                   {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
//                 </Badge>
//               </div>

//               <Separator />

//               {/* Account Created */}
//               <div>
//                 <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
//                   <Calendar className="w-4 h-4 mr-2" />
//                   Member Since
//                 </Label>
//                 <p className="text-gray-900">{formatDate(profile.created_at)}</p>
//               </div>

//               {/* Last Login */}
//               {profile.last_login && (
//                 <>
//                   <Separator />
//                   <div>
//                     <Label className="text-sm font-medium text-gray-700 flex items-center mb-2">
//                       <Calendar className="w-4 h-4 mr-2" />
//                       Last Login
//                     </Label>
//                     <p className="text-gray-900">{formatDate(profile.last_login)}</p>
//                   </div>
//                 </>
//               )}
              
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   )
// }
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield,
  Camera,
  ArrowLeft,
  Save,
  Edit2,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useLanguage } from "@/hooks/use-language" // ADDED: Import the language hook

interface UserProfile {
  user_id: string
  email: string
  phone?: string
  full_name?: string
  role: string
  created_at: string
  last_login?: string
  phone_verified: boolean
  email_verified: boolean
  avatar_url?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage() // ADDED: Initialize the hook to get the 't' function
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  
  const [editForm, setEditForm] = useState({
    full_name: "",
    phone: ""
  })

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/auth/login")
      return
    }
    
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    try {
      const localProfile: UserProfile = {
        user_id: localStorage.getItem("userId") || "",
        email: localStorage.getItem("userEmail") || "",
        phone: localStorage.getItem("userPhone") || "",
        full_name: localStorage.getItem("userFullName") || "",
        role: localStorage.getItem("userRole") || "user",
        avatar_url: localStorage.getItem("userAvatar") || "",
        created_at: new Date().toISOString(),
        phone_verified: false,
        email_verified: false
      }

      if (localProfile.email) {
        setProfile(localProfile)
        setEditForm({ full_name: localProfile.full_name || "", phone: localProfile.phone || "" })
        setIsLoading(false)
      }

      try {
        const response = await fetch("/api/profile", { headers: { "Authorization": `Bearer ${token}` } })
        if (response.ok) {
          const data = await response.json()
          setProfile(data)
          setEditForm({ full_name: data.full_name || "", phone: data.phone || "" })
        }
      } catch (apiError) {
        console.log("API not available, using local storage data")
      }
    } catch (error) {
      // CHANGED: Translated toast
      toast({
        title: t("common.error"),
        description: t("profile.failedToLoadProfile"),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) return

    setIsSaving(true)
    try {
      localStorage.setItem("userFullName", editForm.full_name || "")
      localStorage.setItem("userPhone", editForm.phone || "")
      setProfile(prev => prev ? { ...prev, full_name: editForm.full_name, phone: editForm.phone } : null)

      try {
        const response = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify(editForm)
        })
        if (response.ok) {
          setProfile(await response.json())
        }
      } catch (apiError) {
        console.log("API not available, using local storage")
      }

      setIsEditing(false)
      // CHANGED: Translated toast
      toast({
        title: t("profile.profileUpdated"),
        description: t("profile.profileUpdateSuccess")
      })
    } catch (error) {
      // CHANGED: Translated toast
      toast({
        title: t("common.error"),
        description: t("profile.failedToUpload"),
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      // CHANGED: Translated toast
      toast({ title: t("profile.invalidFile"), description: t("profile.selectImage"), variant: "destructive" })
      return
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      // CHANGED: Translated toast
      toast({ title: t("profile.fileTooLarge"), description: t("profile.fileSizeLimit"), variant: "destructive" })
      return
    }

    setIsUploadingAvatar(true)
    try {
      const localUrl = URL.createObjectURL(file)
      setProfile(prev => prev ? { ...prev, avatar_url: localUrl } : null)
      localStorage.setItem("userAvatar", localUrl)

      const token = localStorage.getItem("authToken")
      if (token) {
        try {
          const formData = new FormData()
          formData.append('avatar', file)
          const response = await fetch("/api/profile/avatar", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
          })
          if (response.ok) {
            const data = await response.json()
            setProfile(prev => prev ? { ...prev, avatar_url: data.avatar_url } : null)
            localStorage.setItem("userAvatar", data.avatar_url)
          }
        } catch (apiError) {
          console.log("Avatar API not available, using local preview")
        }
      }
      
      // CHANGED: Translated toast
      toast({
        title: t("profile.avatarUpdated"),
        description: t("profile.avatarUpdateSuccess")
      })
    } catch (error) {
      // CHANGED: Translated toast
      toast({
        title: t("profile.uploadFailed"),
        description: t("profile.failedToUpload"),
        variant: "destructive"
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const getUserInitials = () => {
    if (!profile) return "U"
    const name = profile.full_name || profile.email || "User"
    return name.split(" ").map(word => word[0]).join("").toUpperCase().substring(0, 2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return ""
    if (phone.startsWith("+216")) {
      const number = phone.substring(4)
      return `+216 ${number.substring(0, 2)} ${number.substring(2, 5)} ${number.substring(5)}`
    }
    return phone
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          {/* CHANGED: Translated text */}
          <p className="mt-4 text-gray-600">{t("profile.loadingProfile")}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          {/* CHANGED: Translated text */}
          <p className="text-gray-600">{t("profile.failedToLoadProfile")}</p>
          <Button onClick={() => router.push("/auth/login")} className="mt-4">
            {t("profile.goToLogin")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            {/* CHANGED: Translated button */}
            <Button variant="outline" onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("profile.backButton")}
            </Button>
            {/* CHANGED: Translated title */}
            <h1 className="text-3xl font-bold text-gray-900">{t("profile.title")}</h1>
          </div>
          
          {!isEditing && (
            // CHANGED: Translated button
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="w-4 h-4 mr-2" />
              {t("profile.editProfile")}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name || profile.email} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-medium">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0" onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar}><Camera className="w-4 h-4" /></Button>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
                </div>
                
                {isUploadingAvatar && (
                  // CHANGED: Translated text
                  <div className="text-sm text-gray-500 mb-2">{t("profile.saving")}</div>
                )}
                
                <h2 className="text-xl font-semibold text-gray-900 mb-1">{profile.full_name || t("dashboard.user")}</h2>
                <p className="text-gray-600 mb-3">{profile.email}</p>
                <Badge variant={profile.role === "admin" ? "default" : "secondary"}>{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {/* CHANGED: Translated title */}
                <span>{t("profile.profileInfo")}</span>
                {isEditing && (
                  <div className="flex gap-2">
                    {/* CHANGED: Translated buttons */}
                    <Button variant="outline" onClick={() => setIsEditing(false)}>{t("profile.cancel")}</Button>
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          {t("profile.saving")}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t("profile.saveChanges")}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Full Name */}
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center mb-2"><User className="w-4 h-4 mr-2" />{t("profile.fullName")}</Label>
                {isEditing ? (
                  <Input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} placeholder={t("register.fullNamePlaceholder")} />
                ) : (
                  <p className="text-gray-900">{profile.full_name || t("profile.notProvided")}</p>
                )}
              </div>
              <Separator />

              {/* Email */}
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center mb-2"><Mail className="w-4 h-4 mr-2" />{t("profile.emailAddress")}{profile.email_verified && (<CheckCircle className="w-4 h-4 ml-2 text-green-500" />)}</Label>
                <p className="text-gray-900">{profile.email}</p>
                {!profile.email_verified && (<p className="text-sm text-amber-600 mt-1">{t("profile.emailNotVerified")}</p>)}
              </div>
              <Separator />

              {/* Phone */}
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center mb-2"><Phone className="w-4 h-4 mr-2" />{t("profile.phoneNumber")}{profile.phone_verified && (<CheckCircle className="w-4 h-4 ml-2 text-green-500" />)}</Label>
                {isEditing ? (
                  <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} placeholder="+216 XX XXX XXX" type="tel" />
                ) : (
                  <div>
                    <p className="text-gray-900">{profile.phone ? formatPhoneNumber(profile.phone) : t("profile.notProvided")}</p>
                    {profile.phone && !profile.phone_verified && (<p className="text-sm text-amber-600 mt-1">{t("profile.phoneNotVerified")}</p>)}
                  </div>
                )}
              </div>
              <Separator />

              {/* Role */}
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center mb-2"><Shield className="w-4 h-4 mr-2" />{t("profile.accountType")}</Label>
                <Badge variant={profile.role === "admin" ? "default" : "secondary"}>{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</Badge>
              </div>
              <Separator />

              {/* Account Created */}
              <div>
                <Label className="text-sm font-medium text-gray-700 flex items-center mb-2"><Calendar className="w-4 h-4 mr-2" />{t("profile.memberSince")}</Label>
                <p className="text-gray-900">{formatDate(profile.created_at)}</p>
              </div>

              {/* Last Login */}
              {profile.last_login && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-gray-700 flex items-center mb-2"><Calendar className="w-4 h-4 mr-2" />{t("profile.lastLogin")}</Label>
                    <p className="text-gray-900">{formatDate(profile.last_login)}</p>
                  </div>
                </>
              )}
              
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}