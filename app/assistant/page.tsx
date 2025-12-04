"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Building2, Users, MessageSquare, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/hooks/use-language"
import { useRouter } from "next/navigation"

export default function AssistantSelector() {
  const { isRTL, t } = useLanguage()
  const router = useRouter()
  const [selectedAssistant, setSelectedAssistant] = useState<number | null>(null)

  const assistants = [
    {
      id: 1,
      name: "Slah",
      gender: "Male",
      type: t("assistant.slah.type"),
      image: "/images/slah.png",
      description: t("assistant.slah.description"),
      features: [
        t("assistant.slah.features.enterprise"),
        t("assistant.slah.features.integration"),
        t("assistant.slah.features.analytics"),
        t("assistant.slah.features.documentation"),
        t("assistant.slah.features.architecture"),
        t("assistant.slah.features.corporateSupport"),
      ],
      color: "from-blue-200 to-blue-300",
      bgColor: "bg-blue-25",
      borderColor: "border-blue-100",
    },
    {
      id: 2,
      name: "Amira",
      gender: "Female",
      type: t("assistant.amira.type"),
      image: "/images/amira.png",
      description: t("assistant.amira.description"),
      features: [
        t("assistant.amira.features.customerSupport"),
        t("assistant.amira.features.productInformation"),
        t("assistant.amira.features.orderAssistance"),
        t("assistant.amira.features.accountManagement"),
        t("assistant.amira.features.billingInquiries"),
        t("assistant.amira.features.generalHelp"),
      ],
      color: "from-pink-200 to-pink-300",
      bgColor: "bg-pink-25",
      borderColor: "border-pink-100",
    },
  ]

  const handleSelectAssistant = (assistantId: number) => {
    setSelectedAssistant(assistantId)
    setTimeout(() => {
      router.push(`/assistant/${assistantId}`)
    }, 500)
  }

  if (selectedAssistant) {
    const assistant = assistants.find((a) => a.id === selectedAssistant)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src={assistant?.image || "/images/slah.png"}
                alt={`${assistant?.name || "Assistant"} - Avatar`}
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("selection.connecting")} {assistant?.name}...
            </h1>
            <p className="text-gray-600">
              {t("selection.pleaseWait")} {assistant?.type.toLowerCase()}
            </p>
            <div className="mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("selection.title")}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("selection.subtitle")}</p>
        </div>

        {/* Assistant Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {assistants.map((assistant) => (
            <Card
              key={assistant.id}
              className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${assistant.bgColor} ${assistant.borderColor} border-2 rounded-2xl overflow-hidden`}
            >
              <CardHeader className={`text-center pb-4 relative ${isRTL ? "text-right" : "text-left"}`}>
                {/* Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${assistant.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Assistant Image */}
                <div className="relative z-10 mb-4">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={assistant.image || "/placeholder.svg"}
                      alt={`${assistant.name} - Avatar`}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Assistant Info */}
                <div className="relative z-10">
                  <CardTitle className="text-2xl font-bold text-gray-800 mb-2">{assistant.name}</CardTitle>
                  <Badge variant="secondary" className="mb-3 text-sm font-medium">
                    {t(`assistant.gender.${assistant.gender.toLowerCase()}`)} • {assistant.type}
                  </Badge>
                  <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">{assistant.description}</p>
                </div>
              </CardHeader>

              <CardContent className="pt-0 relative z-10">
                {/* Features */}
                <div className="mb-6">
                  <h4
                    className={`font-semibold text-gray-700 mb-3 flex items-center ${isRTL ? "flex-row-reverse justify-end" : "justify-start"}`}
                  >
                    {assistant.id === 1 ? (
                      <Building2 className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    ) : (
                      <Users className={`w-4 h-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                    )}
                    {t("chat.specializations")}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {assistant.features.map((feature, index) => (
                      <div
                        key={index}
                        className={`text-sm text-gray-600 bg-white/70 px-3 py-2 rounded-lg border ${isRTL ? "text-right" : "text-left"}`}
                      >
                        • {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={() => handleSelectAssistant(assistant.id)}
                  disabled={selectedAssistant !== null}
                  className={`w-full bg-gradient-to-r ${assistant.color} hover:shadow-lg text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 group-hover:scale-105 flex items-center justify-center`}
                >
                  <MessageSquare className={`w-5 h-5 ${isRTL ? "ml-2" : "mr-2"}`} />
                  {t("selection.startChat")} {assistant.name}
                  <ArrowRight
                    className={`w-5 h-5 ${isRTL ? "rotate-180 mr-2" : "ml-2"} group-hover:translate-x-1 transition-transform duration-300`}
                  />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Comparison Section */}
        <Card className="bg-white/70 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle className={`text-center text-2xl font-bold text-gray-800 ${isRTL ? "text-right" : "text-left"}`}>
              {t("selection.whichAssistant")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className={`text-center ${isRTL ? "text-right" : "text-left"}`}>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{t("selection.chooseSlahB2B")}</h3>
                <ul className={`text-gray-600 space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <li>{t("comparison.enterpriseSolutions")}</li>
                  <li>{t("comparison.technicalIntegrations")}</li>
                  <li>{t("comparison.businessProcessOptimization")}</li>
                  <li>{t("comparison.corporateAccountManagement")}</li>
                </ul>
              </div>

              <div className={`text-center ${isRTL ? "text-right" : "text-left"}`}>
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{t("selection.chooseAmiraB2C")}</h3>
                <ul className={`text-gray-600 space-y-2 ${isRTL ? "text-right" : "text-left"}`}>
                  <li>{t("comparison.personalCustomerSupport")}</li>
                  <li>{t("comparison.productRecommendations")}</li>
                  <li>{t("comparison.orderBillingAssistance")}</li>
                  <li>{t("comparison.generalConsumerInquiries")}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
