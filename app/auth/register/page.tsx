// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Label } from "@/components/ui/label"
// import { useToast } from "@/hooks/use-toast"
// import Link from "next/link"
// import { useLanguage } from "@/hooks/use-language"

// type RegistrationStep = "details" | "phone_verify" | "complete"

// export default function RegisterPage() {
//   const router = useRouter()
//   const { toast } = useToast()
//   const { t } = useLanguage()
//   const [isLoading, setIsLoading] = useState(false)
//   const [currentStep, setCurrentStep] = useState<RegistrationStep>("details")
  
//   const [formData, setFormData] = useState({
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//     fullName: "",
//     verificationCode: ""
//   })

//   const sendVerificationCode = async () => {
//     if (!formData.phone) {
//       toast({
//         title: "Phone Required",
//         description: "Please enter a valid phone number",
//         variant: "destructive"
//       })
//       return
//     }

//     setIsLoading(true)
//     try {
//       const response = await fetch("/api/auth/verify-phone", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           phone: formData.phone, 
//           action: "register" 
//         })
//       })

//       const data = await response.json()

//       if (response.ok) {
//         toast({
//           title: "Verification Code Sent",
//           description: "Please check your phone for the verification code"
//         })
//         setCurrentStep("phone_verify")
//       } else {
//         toast({
//           title: "Failed to Send Code",
//           description: data.error || "Please try again",
//           variant: "destructive"
//         })
//       }
//     } catch (error) {
//       toast({
//         title: "Network Error",
//         description: "Please check your connection and try again",
//         variant: "destructive"
//       })
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleRegister = async (e: React.FormEvent) => {
//     e.preventDefault()
    
//     if (currentStep === "details") {
//       // Validate form data
//       if (formData.password !== formData.confirmPassword) {
//         toast({
//           title: t("register.passwordMismatchTitle"),
//           description: t("register.passwordMismatchDescription"),
//           variant: "destructive"
//         })
//         return
//       }

//       if (formData.password.length < 6) {
//         toast({
//           title: t("register.weakPasswordTitle"),
//           description: t("register.weakPasswordDescription"),
//           variant: "destructive"
//         })
//         return
//       }

//       // Send verification code
//       await sendVerificationCode()
//       return
//     }

//     if (currentStep === "phone_verify") {
//       if (!formData.verificationCode || formData.verificationCode.length !== 6) {
//         toast({
//           title: "Invalid Code",
//           description: "Please enter the 6-digit verification code",
//           variant: "destructive"
//         })
//         return
//       }

//       // Proceed with registration
//       setIsLoading(true)
//       try {
//         const response = await fetch("/api/auth/register", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({
//             email: formData.email,
//             phone: formData.phone,
//             password: formData.password,
//             full_name: formData.fullName || null,
//             verification_code: formData.verificationCode
//           })
//         })

//         const data = await response.json()

//         if (response.ok) {
//           toast({
//             title: t("register.successTitle"),
//             description: t("register.successDescription")
//           })
//           setCurrentStep("complete")
//           setTimeout(() => router.push("/auth/login"), 2000)
//         } else {
//           toast({
//             title: t("register.failedTitle"),
//             description: data.error || t("register.failedDescription"),
//             variant: "destructive"
//           })
//         }
//       } catch (error: any) {
//         toast({
//           title: t("register.failedTitle"),
//           description: "Network error. Please try again.",
//           variant: "destructive"
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     }
//   }

//   if (currentStep === "complete") {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
//         <Card className="w-full max-w-md">
//           <CardContent className="pt-6 text-center">
//             <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//               <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//               </svg>
//             </div>
//             <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
//             <p className="text-gray-600 mb-4">Your account has been created successfully. Redirecting to login...</p>
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl text-center">
//             {currentStep === "details" ? t("register.title") : "Verify Phone Number"}
//           </CardTitle>
//           <p className="text-center text-gray-600 mt-2">
//             {currentStep === "details" 
//               ? t("register.subtitle") 
//               : `Enter the verification code sent to ${formData.phone}`
//             }
//           </p>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleRegister} className="space-y-4">
//             {currentStep === "details" && (
//               <>
//                 <div>
//                   <Label htmlFor="fullName">{t("register.fullNameLabel")}</Label>
//                   <Input
//                     id="fullName"
//                     type="text"
//                     placeholder={t("register.fullNamePlaceholder")}
//                     value={formData.fullName}
//                     onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="email">{t("register.emailLabel")}</Label>
//                   <Input
//                     id="email"
//                     type="email"
//                     placeholder={t("register.emailPlaceholder")}
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     required
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="phone">Phone Number *</Label>
//                   <Input
//                     id="phone"
//                     type="tel"
//                     placeholder="+1234567890"
//                     value={formData.phone}
//                     onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//                     required
//                   />
//                 </div>
                
//                 <div>
//                   <Label htmlFor="password">{t("register.passwordLabel")}</Label>
//                   <Input
//                     id="password"
//                     type="password"
//                     placeholder={t("register.passwordPlaceholder")}
//                     value={formData.password}
//                     onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                     required
//                     minLength={6}
//                   />
//                 </div>

//                 <div>
//                   <Label htmlFor="confirmPassword">{t("register.confirmPasswordLabel")}</Label>
//                   <Input
//                     id="confirmPassword"
//                     type="password"
//                     placeholder={t("register.confirmPasswordPlaceholder")}
//                     value={formData.confirmPassword}
//                     onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
//                     required
//                     minLength={6}
//                   />
//                 </div>
//               </>
//             )}

//             {currentStep === "phone_verify" && (
//               <div>
//                 <Label htmlFor="verificationCode">Verification Code</Label>
//                 <Input
//                   id="verificationCode"
//                   type="text"
//                   placeholder="Enter 6-digit code"
//                   value={formData.verificationCode}
//                   onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
//                   required
//                   maxLength={6}
//                   className="text-center text-lg tracking-widest"
//                 />
                
//                 <div className="mt-2 text-center">
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="sm"
//                     onClick={sendVerificationCode}
//                     disabled={isLoading}
//                   >
//                     Resend Code
//                   </Button>
//                 </div>
//               </div>
//             )}

//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading 
//                 ? "Processing..." 
//                 : currentStep === "details" 
//                   ? "Send Verification Code" 
//                   : "Complete Registration"
//               }
//             </Button>
//           </form>

//           {currentStep === "details" && (
//             <div className="mt-4 text-center text-sm">
//               {t("register.alreadyHaveAccount")}{" "}
//               <Link href="/auth/login" className="text-blue-600 hover:underline">
//                 {t("register.loginLink")}
//               </Link>
//             </div>
//           )}

//           {currentStep === "phone_verify" && (
//             <div className="mt-4 text-center">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={() => setCurrentStep("details")}
//               >
//                 Back to Details
//               </Button>
//             </div>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
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

type RegistrationStep = "details" | "phone_verify" | "complete"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t, isRTL } = useLanguage()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("details")
  
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    verificationCode: ""
  })

  const sendVerificationCode = async () => {
    if (!formData.phone) {
      // CHANGED: Translated toast
      toast({
        title: t("register.failedTitle"),
        description: "Please enter a valid phone number",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, action: "register" })
      })
      const data = await response.json()
      if (response.ok) {
        // CHANGED: Translated toast
        toast({
          title: t("auth.resetCodeSent"),
          description: "Please check your phone for the verification code"
        })
        setCurrentStep("phone_verify")
      } else {
        toast({ title: t("register.failedTitle"), description: data.error || "Please try again", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: t("error.networkError"), description: "Please check your connection and try again", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentStep === "details") {
      if (formData.password !== formData.confirmPassword) {
        toast({ title: t("register.passwordMismatchTitle"), description: t("register.passwordMismatchDescription"), variant: "destructive" });
        return;
      }
      if (formData.password.length < 6) {
        toast({ title: t("register.weakPasswordTitle"), description: t("register.weakPasswordDescription"), variant: "destructive" });
        return;
      }
      await sendVerificationCode()
      return
    }

    if (currentStep === "phone_verify") {
      if (!formData.verificationCode || formData.verificationCode.length !== 6) {
        toast({ title: "Invalid Code", description: "Please enter the 6-digit verification code", variant: "destructive" });
        return;
      }

      setIsLoading(true)
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            full_name: formData.fullName || null,
            verification_code: formData.verificationCode
          })
        })
        const data = await response.json()
        if (response.ok) {
          toast({ title: t("register.successTitle"), description: t("register.successDescription") })
          setCurrentStep("complete")
          setTimeout(() => router.push("/auth/login"), 2000)
        } else {
          toast({ title: t("register.failedTitle"), description: data.error || t("register.failedDescription"), variant: "destructive" })
        }
      } catch (error: any) {
        toast({ title: t("register.failedTitle"), description: "Network error. Please try again.", variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }
  }

  if (currentStep === "complete") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            {/* CHANGED: Translated completion text */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("auth.resetComplete")}</h2>
            <p className="text-gray-600 mb-4">{t("register.successDescription")} {t("auth.redirecting")}</p>
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
          <CardTitle className="text-2xl text-center">
            {/* CHANGED: Translated title */}
            {currentStep === "details" ? t("register.title") : t("auth.enterResetCode")}
          </CardTitle>
          <p className="text-center text-gray-600 mt-2">
            {/* CHANGED: Translated subtitle */}
            {currentStep === "details" 
              ? t("register.subtitle") 
              : `${t("auth.enterCode")} ${formData.phone}`
            }
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {currentStep === "details" && (
              <>
                <div>
                  <Label htmlFor="fullName">{t("register.fullNameLabel")}</Label>
                  <Input id="fullName" type="text" placeholder={t("register.fullNamePlaceholder")} value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">{t("register.emailLabel")}</Label>
                  <Input id="email" type="email" placeholder={t("register.emailPlaceholder")} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div>
                  {/* CHANGED: Translated label */}
                  <Label htmlFor="phone">{t("auth.phoneNumber")} *</Label>
                  <Input id="phone" type="tel" placeholder="+1234567890" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required dir="ltr" />
                </div>
                <div>
                  <Label htmlFor="password">{t("register.passwordLabel")}</Label>
                  <Input id="password" type="password" placeholder={t("register.passwordPlaceholder")} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={6} />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">{t("register.confirmPasswordLabel")}</Label>
                  <Input id="confirmPassword" type="password" placeholder={t("register.confirmPasswordPlaceholder")} value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required minLength={6} />
                </div>
              </>
            )}

            {currentStep === "phone_verify" && (
              <div>
                {/* CHANGED: Translated label and placeholder */}
                <Label htmlFor="verificationCode">{t("auth.verificationCode")}</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  placeholder={t("auth.enterCode")}
                  value={formData.verificationCode}
                  onChange={(e) => setFormData({ ...formData, verificationCode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  required
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                  dir="ltr"
                />
                
                <div className="mt-2 text-center">
                  <Button type="button" variant="ghost" size="sm" onClick={sendVerificationCode} disabled={isLoading}>
                    {/* CHANGED: Translated button */}
                    {t("auth.resendCode")}
                  </Button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {/* CHANGED: Translated button text */}
              {isLoading 
                ? t("common.loading")
                : currentStep === "details" 
                  ? t("auth.sendResetCode") 
                  : t("register.button")
              }
            </Button>
          </form>

          {currentStep === "details" && (
            <div className="mt-4 text-center text-sm">
              {t("register.alreadyHaveAccount")}{" "}
              <Link href="/auth/login" className="text-blue-600 hover:underline">{t("register.loginLink")}</Link>
            </div>
          )}

          {currentStep === "phone_verify" && (
            <div className="mt-4 text-center">
              <Button type="button" variant="outline" onClick={() => setCurrentStep("details")}>
                {/* CHANGED: Translated button */}
                {t("common.back")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}