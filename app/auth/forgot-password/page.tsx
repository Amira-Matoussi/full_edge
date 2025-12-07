"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"

type ResetStep = "method" | "verify" | "reset" | "complete"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<ResetStep>("method")
  const [resetMethod, setResetMethod] = useState<"email" | "phone">("phone")
  
  const [formData, setFormData] = useState({
    identifier: "", // email or phone
    verificationCode: "",
    newPassword: "",
    confirmPassword: ""
  })

  const sendResetCode = async () => {
    if (!formData.identifier) {
      toast({
        title: "Input Required",
        description: `Please enter your ${resetMethod}`,
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: resetMethod,
          identifier: formData.identifier
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Reset Code Sent",
          description: data.message || `Reset code sent to your ${resetMethod}`
        })
        setCurrentStep("verify")
      } else {
        toast({
          title: "Failed to Send Code",
          description: data.error || "Please try again",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const verifyCodeAndReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the 6-digit verification code",
        variant: "destructive"
      })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please ensure both passwords match",
        variant: "destructive"
      })
      return
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: resetMethod === "phone" ? formData.identifier : undefined,
          email: resetMethod === "email" ? formData.identifier : undefined,
          verification_code: formData.verificationCode,
          new_password: formData.newPassword
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated successfully"
        })
        setCurrentStep("complete")
        setTimeout(() => router.push("/auth/login"), 3000)
      } else {
        toast({
          title: "Reset Failed",
          description: data.error || "Please try again",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Please check your connection and try again",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (currentStep === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Complete</h2>
            <p className="text-gray-600 mb-4">Your password has been updated. Redirecting to login...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Link href="/auth/login" className="mr-3">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <CardTitle className="text-2xl">
              {currentStep === "method" && "Reset Password"}
              {currentStep === "verify" && "Enter Reset Code"}
              {currentStep === "reset" && "Set New Password"}
            </CardTitle>
          </div>
          <p className="text-center text-gray-600">
            {currentStep === "method" && "Choose how you'd like to reset your password"}
            {currentStep === "verify" && `We sent a code to your ${resetMethod}`}
            {currentStep === "reset" && "Enter your new password"}
          </p>
        </CardHeader>
        <CardContent>
          {currentStep === "method" && (
            <div className="space-y-4">
              <Tabs value={resetMethod} onValueChange={(value) => setResetMethod(value as "email" | "phone")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="phone">Phone</TabsTrigger>
                  <TabsTrigger value="email">Email</TabsTrigger>
                </TabsList>
                
                <TabsContent value="phone" className="mt-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="email" className="mt-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.identifier}
                      onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button onClick={sendResetCode} className="w-full" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Code"}
              </Button>
            </div>
          )}

          {currentStep === "verify" && (
            <form onSubmit={verifyCodeAndReset} className="space-y-4">
              <div>
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6) 
                  })}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                
                <div className="mt-2 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={sendResetCode}
                    disabled={isLoading}
                  >
                    Resend Code
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("method")}
                >
                  Back
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}