//       {/* Connection Status Indicator */}
//       {connectionStatus && (
//         <div className={`flex items-center justify-center p-2 rounded-md text-xs ${
//           connectionStatus === "connected" 
//             ? "bg-green-50 text-green-700" 
//             : connectionStatus === "disconnected"
//             ? "bg-red-50 text-red-700"
//             : "bg-yellow-50 text-yellow-700"
//         }`}>
//           {connectionStatus === "connected" && <CheckCircle className="w-3 h-3 mr-1" />}
//           {connectionStatus === "disconnected" && <AlertCircle className="w-3 h-3 mr-1" />}
//           {connectionStatus === "checking" && <div className="w-3 h-3 mr-1 border border-yellow-600 border-t-transparent rounded-full animate-spin" />}
          
//           {connectionStatus === "connected" && "Server Connected"}
//           {connectionStatus === "disconnected" && "Server Disconnected"}
//           {connectionStatus === "checking" && "Checking Connection..."}
//         </div>
//       )}
//     </CardHeader>
    
//     <CardContent className="space-y-4">
//       {/* Login Method Tabs */}
//       <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as "email" | "phone")} className="w-full">
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="email" className="flex items-center gap-2">
//             <Mail className="w-4 h-4" />
//             Email
//           </TabsTrigger>
//           <TabsTrigger value="phone" className="flex items-center gap-2">
//             <Phone className="w-4 h-4" />
//             Phone
//           </TabsTrigger>
//         </TabsList>

//         <form onSubmit={handleLogin} className="space-y-4 mt-4">
//           {/* Email Login */}
//           <TabsContent value="email" className="space-y-4 mt-4">
//             <div className="space-y-2">
//               <Label htmlFor="email" className="text-sm font-medium text-gray-700">
//                 {t("login.emailLabel") || "Email Address"}
//               </Label>
//               <div className="relative">
//                 <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder={t("login.emailPlaceholder") || "Enter your email"}
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                   className="pl-10"
//                   required={loginMethod === "email"}
//                   disabled={isLoading}
//                 />
//               </div>
//             </div>
//           </TabsContent>

//           {/* Phone Login */}
//           <TabsContent value="phone" className="space-y-4 mt-4">
//             <div className="space-y-2">
//               <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
//                 Phone Number
//               </Label>
//               <div className="relative">
//                 <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <Input
//                   id="phone"
//                   type="tel"
//                   placeholder="+216 XX XXX XXX"
//                   value={formData.phone}
//                   onChange={handlePhoneChange}
//                   className="pl-10"
//                   required={loginMethod === "phone"}
//                   disabled={isLoading}
//                 />
//               </div>
//               <p className="text-xs text-gray-500">
//                 Format: +216 followed by your 8-digit number
//               </p>
//             </div>
//           </TabsContent>

//           {/* Password Field */}
//           <div className="space-y-2">
//             <Label htmlFor="password" className="text-sm font-medium text-gray-700">
//               {t("login.passwordLabel") || "Password"}
//             </Label>
//             <div className="relative">
//               <Input
//                 id="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder={t("login.passwordPlaceholder") || "Enter your password"}
//                 value={formData.password}
//                 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 className="pr-10"
//                 required
//                 disabled={isLoading}
//                 minLength={6}
//               />
//               <button
//                 type="button"
//                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                 onClick={() => setShowPassword(!showPassword)}
//                 disabled={isLoading}
//               >
//                 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//               </button>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <Button 
//             type="submit" 
//             className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5"
//             disabled={isLoading || connectionStatus === "disconnected"}
//           >
//             {isLoading ? (
//               <div className="flex items-center gap-2">
//                 <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 {t("login.loggingIn") || "Signing In..."}
//               </div>
//             ) : (
//               t("login.button") || "Sign In"
//             )}
//           </Button>
//         </form>
//       </Tabs>

//       {/* Links and Actions */}
//       <div className="space-y-4 pt-2">
//         {/* Forgot Password */}
//         <div className="text-center">
//           <Link 
//             href="/auth/forgot-password" 
//             className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
//           >
//             Forgot your password?
//           </Link>
//         </div>

//         {/* Divider */}
//         <div className="relative">
//           <div className="absolute inset-0 flex items-center">
//             <span className="w-full border-t border-gray-300" />
//           </div>
//           <div className="relative flex justify-center text-xs uppercase">
//             <span className="bg-white px-2 text-gray-500">
//               {t("common.or") || "Or"}
//             </span>
//           </div>
//         </div>

//         {/* Register Link */}
//         <div className="text-center text-sm text-gray-600">
//           {t("login.noAccount") || "Don't have an account?"}{" "}
//           <Link href="/auth/register" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
//             {t("login.registerLink") || "Sign up"}
//           </Link>
//         </div>

//         {/* Guest Access */}
//         <div className="text-center text-sm">
//           <Link href="/assistant" className="text-gray-500 hover:text-gray-700 hover:underline">
//             {t("login.continueAsGuest") || "Continue as Guest"}
//           </Link>
//         </div>
//       </div>

//       {/* Demo Credentials */}
//       <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
//         <div className="text-center space-y-2">
//           <p className="font-semibold text-blue-900 text-sm">
//             {t("login.demoAccount") || "Demo Account"}
//           </p>
//           <div className="space-y-1 text-blue-700 text-xs">
//             <p className="font-mono">
//               {t("login.demoEmail") || "Email: admin@ooredoo.com"}
//             </p>
//             <p className="font-mono">
//               {t("login.demoPassword") || "Password: admin123"}
//             </p>
//           </div>
//           <p className="text-blue-600 text-xs">
//             Use these credentials for testing
//           </p>
//         </div>
//       </div>

//       {/* Connection Help */}
//       {connectionStatus === "disconnected" && (
//         <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
//           <div className="flex items-start gap-2">
//             <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
//             <div className="text-xs text-red-700 space-y-1">
//               <p className="font-medium">Cannot connect to authentication server</p>
//               <p>Please ensure:</p>
//               <ul className="list-disc list-inside space-y-0.5 text-red-600">
//                 <li>Python backend is running on port 8000</li>
//                 <li>Your internet connection is stable</li>
//                 <li>No firewall is blocking the connection</li>
//               </ul>
//               <Button
//                 onClick={checkConnection}
//                 size="sm"
//                 variant="outline"
//                 className="mt-2 text-xs border-red-300 text-red-700 hover:bg-red-100"
//               >
//                 Retry Connection
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </CardContent>
//   </Card>
// </div>
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useLanguage } from "@/hooks/use-language"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t, isRTL } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected" | null>(null)
  
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: ""
  })

  const checkConnection = async () => {
    setConnectionStatus("checking")
    try {
      const response = await fetch("/api/check-config", { method: "GET", signal: AbortSignal.timeout(5000) })
      if (response.ok) {
        setConnectionStatus("connected")
        return true
      } else {
        setConnectionStatus("disconnected")
        return false
      }
    } catch (error) {
      setConnectionStatus("disconnected")
      return false
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const isConnected = await checkConnection()
    if (!isConnected) {
      // CHANGED: Translated toast
      toast({
        title: t("error.connectionFailed"),
        description: t("error.serverDisconnected"),
        variant: "destructive"
      })
      setIsLoading(false)
      return
    }

    try {
      const identifier = loginMethod === "email" ? formData.email : formData.phone
      if (!identifier || !formData.password) {
        // CHANGED: Translated toast
        toast({
          title: t("error.processingFailed"),
          description: `Please enter your ${loginMethod} and password`, // This remains dynamic
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      const loginData = loginMethod === "email" 
        ? { email: formData.email, password: formData.password }
        : { phone: formData.phone, password: formData.password }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(loginData),
        signal: AbortSignal.timeout(15000)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Network error" }))
        throw new Error(errorData.error || `Login failed (${response.status})`)
      }

      const data = await response.json()
      if (!data.token || !data.user_id) {
        throw new Error("Invalid response from server. Please try again.")
      }

      localStorage.setItem("authToken", data.token)
      localStorage.setItem("userId", data.user_id?.toString() || "")
      localStorage.setItem("userEmail", data.email || "")
      localStorage.setItem("userPhone", data.phone || "")
      localStorage.setItem("userRole", data.role || "user")
      localStorage.setItem("userFullName", data.full_name || "")

      toast({
        title: t("login.successTitle"),
        description: t("login.successDescription").replace("{name}", data.full_name || data.email || "User")
      })

      setTimeout(() => {
        router.push("/assistant")
      }, 500)

    } catch (error: any) {
      toast({
        title: t("login.failedTitle"),
        description: error.message || t("login.failedDescription"),
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (digits.length > 0 && !digits.startsWith('216')) {
      if (digits.startsWith('0')) { return '+216' + digits.substring(1) } 
      else if (digits.length <= 8) { return '+216' + digits }
    }
    if (digits.startsWith('216')) { return '+' + digits }
    return value.startsWith('+') ? value : '+' + digits
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData({ ...formData, phone: formatted })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-gray-900">{t("login.title")}</CardTitle>
          <p className="text-center text-gray-600 text-sm">{t("login.subtitle")}</p>
          
          {connectionStatus && (
            <div className={`flex items-center justify-center p-2 rounded-md text-xs ${
              connectionStatus === "connected" ? "bg-green-50 text-green-700" 
              : connectionStatus === "disconnected" ? "bg-red-50 text-red-700"
              : "bg-yellow-50 text-yellow-700"
            }`}>
              {connectionStatus === "connected" && <CheckCircle className="w-3 h-3 me-1" />}
              {connectionStatus === "disconnected" && <AlertCircle className="w-3 h-3 me-1" />}
              {connectionStatus === "checking" && <div className="w-3 h-3 me-1 border border-yellow-600 border-t-transparent rounded-full animate-spin" />}
              
              {/* CHANGED: Translated connection statuses */}
              {connectionStatus === "connected" && t("common.success")}
              {connectionStatus === "disconnected" && t("error.serverDisconnected")}
              {connectionStatus === "checking" && t("common.loading")}
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Tabs value={loginMethod} onValueChange={(value) => setLoginMethod(value as "email" | "phone")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              {/* CHANGED: Translated tabs */}
              <TabsTrigger value="email" className="flex items-center gap-2"><Mail className="w-4 h-4" />{t("auth.email")}</TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2"><Phone className="w-4 h-4" />{t("auth.phone")}</TabsTrigger>
            </TabsList>

            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <TabsContent value="email" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">{t("login.emailLabel")}</Label>
                  <div className="relative">
                    <Mail className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input id="email" type="email" placeholder={t("login.emailPlaceholder")} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={`${isRTL ? 'pr-10' : 'pl-10'}`} required={loginMethod === "email"} disabled={isLoading} />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="phone" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">{t("auth.phoneNumber")}</Label>
                  <div className="relative">
                    <Phone className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input id="phone" type="tel" placeholder="+216 XX XXX XXX" value={formData.phone} onChange={handlePhoneChange} className={`${isRTL ? 'pr-10' : 'pl-10'}`} required={loginMethod === "phone"} disabled={isLoading} dir="ltr" />
                  </div>
                </div>
              </TabsContent>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">{t("login.passwordLabel")}</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder={t("login.passwordPlaceholder")} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={`${isRTL ? 'pl-10' : 'pr-10'}`} required disabled={isLoading} minLength={6} />
                  <button type="button" className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`} onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-2.5" disabled={isLoading || connectionStatus === "disconnected"}>
                {isLoading ? (<div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t("login.loggingIn")}</div>) : (t("login.button"))}
              </Button>
            </form>
          </Tabs>

          <div className="space-y-4 pt-2">
            <div className="text-center">
              {/* CHANGED: Translated link */}
              <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">{t("auth.forgotPassword")}</Link>
            </div>
            <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-300" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">{t("common.or")}</span></div></div>
            <div className="text-center text-sm text-gray-600">{t("login.noAccount")}{" "}<Link href="/auth/register" className="text-blue-600 hover:text-blue-800 hover:underline font-medium">{t("login.registerLink")}</Link></div>
            <div className="text-center text-sm"><Link href="/assistant" className="text-gray-500 hover:text-gray-700 hover:underline">{t("login.continueAsGuest")}</Link></div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="text-center space-y-2">
              <p className="font-semibold text-blue-900 text-sm">{t("login.demoAccount")}</p>
              <div className="space-y-1 text-blue-700 text-xs" dir="ltr">
                <p className="font-mono">{t("login.demoEmail")}</p>
                <p className="font-mono">{t("login.demoPassword")}</p>
              </div>
              {/* This part does not have a direct translation key, so we'll leave it in English as it's a developer note */}
              <p className="text-blue-600 text-xs">Use these credentials for testing</p>
            </div>
          </div>

          {connectionStatus === "disconnected" && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-700 space-y-1">
                  {/* CHANGED: Translated connection help text */}
                  <p className="font-medium">{t("error.connectionFailed")}</p>
                  <p>{t("error.serverDisconnected")}:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-red-600">
                    <li>Python backend is running on port 8000</li>
                    <li>Your internet connection is stable</li>
                  </ul>
                  <Button onClick={checkConnection} size="sm" variant="outline" className="mt-2 text-xs border-red-300 text-red-700 hover:bg-red-100">{t("common.refresh")}</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}