import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/navigation"
import { LanguageProvider } from "@/hooks/use-language"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Voice AI Assistant",
  description: "A web-based voice-to-voice AI assistant using Whisper and GPT",
  generator: "studio-ai",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <LanguageProvider>
          <Navigation />
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  )
}
