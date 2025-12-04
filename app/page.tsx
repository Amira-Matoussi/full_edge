
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useLanguage } from "@/hooks/use-language"
import { ArrowRight, Mic, Shield, Globe } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken")
      if (token) {
        // Verify token is still valid by calling the backend
        try {
          const response = await fetch("http://localhost:8000/api/auth/me", {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          })
          
          if (response.ok) {
            // Token is valid, redirect to assistant
            router.push("/assistant")
            return
          }
        } catch (error) {
          // Token is invalid or server is down
          localStorage.clear()
        }
      }
      setIsChecking(false)
    }
    
    checkAuth()
  }, [router])

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("home.loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            {t("home.title")}
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {t("home.subtitle")}
          </p>
          
          {/* Language Support Badge */}
          <div className="flex justify-center gap-4 mb-8">
            <Badge variant="secondary" className="px-4 py-2">
              <Globe className="w-4 h-4 mr-2" />
              {t("home.languageSupport")}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                {t("home.existingUsers")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                {t("home.existingUsersDescription")}
              </p>
              <Link href="/auth/login" className="block">
                <Button className="w-full" size="lg">
                  {t("home.loginButton")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Register Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mic className="w-5 h-5 mr-2 text-green-600" />
                {t("home.newUsers")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                {t("home.newUsersDescription")}
              </p>
              <Link href="/auth/register" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  {t("home.registerButton")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Guest Access */}
        <Card className="mt-6 bg-gray-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-3">{t("home.quickAccess")}</h3>
              <p className="text-gray-600 mb-4">
                {t("home.quickAccessDescription")}
              </p>
              <Link href="/assistant">
                <Button variant="ghost" size="lg" className="hover:bg-white">
                  {t("home.continueAsGuest")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="font-semibold text-blue-900 mb-2">{t("home.demoAccount")}</p>
              <div className="text-blue-700 text-sm space-y-1">
                <p>{t("home.demoEmail")}</p>
                <p>{t("home.demoPassword")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <div className="bg-white/50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">{t("home.featureVoiceInteraction")}</h3>
              <p className="text-gray-600 text-sm">{t("home.featureVoiceDescription")}</p>
            </div>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">{t("home.featureMultilingual")}</h3>
              <p className="text-gray-600 text-sm">{t("home.featureMultilingualDescription")}</p>
            </div>
            
            <div className="p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">{t("home.featureSecure")}</h3>
              <p className="text-gray-600 text-sm">{t("home.featureSecureDescription")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}