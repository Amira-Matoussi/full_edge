// "use client"

// import { useState, useEffect } from "react"
// import { Mic, Volume2, Loader2, Square } from "lucide-react"
// import Image from "next/image"
// import { useLanguage } from "@/hooks/use-language"

// interface AvatarProps {
//   isListening: boolean
//   isProcessing: boolean
//   isSpeaking: boolean
//   onToggleListening: () => void
//   onInterrupt: () => void
//   hasConversationStarted: boolean
//   assistantId?: number // New prop to determine which assistant image to show
//   status: string
// }

// export function Avatar({
//   isListening,
//   isProcessing,
//   isSpeaking,
//   onToggleListening,
//   onInterrupt,
//   hasConversationStarted,
//   assistantId = 1, // Default to Slah
//   status,
// }: AvatarProps) {
//   const { t } = useLanguage()
//   const [pulseIntensity, setPulseIntensity] = useState(0)

//   // Get the appropriate assistant image
//   const getAvatarImage = () => {
//     return assistantId === 2 ? "/images/amira.png" : "/images/slah.png"
//   }

//   const getAssistantName = () => {
//     return assistantId === 2 ? "Amira" : "Slah"
//   }

//   useEffect(() => {
//     let interval: NodeJS.Timeout

//     if (isListening || isSpeaking) {
//       interval = setInterval(() => {
//         setPulseIntensity((prev) => (prev + 1) % 100)
//       }, 50)
//     } else {
//       setPulseIntensity(0)
//     }

//     return () => {
//       if (interval) clearInterval(interval)
//     }
//   }, [isListening, isSpeaking])

//   const getAvatarState = () => {
//     if (isProcessing) return "processing"
//     if (isListening) return "listening"
//     if (isSpeaking) return "speaking"
//     return "idle"
//   }

//   const getAvatarColors = () => {
//     const state = getAvatarState()
//     switch (state) {
//       case "listening":
//         return "from-red-200 to-red-400" // More subtle red
//       case "processing":
//         return "from-yellow-200 to-orange-300" // More subtle yellow/orange
//       case "speaking":
//         return "from-green-200 to-green-400" // More subtle green
//       default:
//         return "from-gray-200 to-gray-400" // Neutral gray
//     }
//   }

//   const getOverlayIcon = () => {
//     const state = getAvatarState()
//     switch (state) {
//       case "listening":
//         return <Mic className="w-12 h-12 text-white drop-shadow-lg" />
//       case "processing":
//         return <Loader2 className="w-12 h-12 text-white animate-spin drop-shadow-lg" />
//       case "speaking":
//         return <Volume2 className="w-12 h-12 text-white drop-shadow-lg" />
//       default:
//         return null
//     }
//   }

//   return (
//     <div className="flex flex-col items-center space-y-6">
//       {/* Avatar Circle */}
//       <div className="relative">
//         {/* Single Outer pulse ring */}
//         {(isListening || isSpeaking) && (
//           <div
//             className={`absolute inset-0 rounded-full bg-gradient-to-br ${getAvatarColors()} opacity-40 animate-ping`}
//             style={{
//               transform: `scale(${1.2 + (pulseIntensity / 100) * 0.3})`,
//               animationDuration: "2s",
//             }}
//           />
//         )}

//         {/* Main Avatar */}
//         <button
//           onClick={onInterrupt}
//           disabled={false}
//           className={`
//             relative w-48 h-48 rounded-full
//             flex items-center justify-center
//             transition-all duration-300 ease-in-out
//             hover:scale-105 active:scale-95
//             shadow-2xl hover:shadow-3xl
//             cursor-pointer
//             overflow-hidden
//             ${isSpeaking ? "ring-4 ring-red-300 ring-opacity-50 animate-pulse" : ""}
//             ${isProcessing ? "opacity-80" : ""}
//           `}
//           style={{
//             transform: isListening || isSpeaking ? `scale(${1 + (pulseIntensity / 100) * 0.1})` : "scale(1)",
//           }}
//         >
//           {/* Assistant Image */}
//           <div className="relative w-full h-full rounded-full overflow-hidden">
//             <Image
//               src={getAvatarImage() || "/placeholder.svg"}
//               alt={`${getAssistantName()} AI Assistant Avatar`}
//               fill
//               className="object-cover"
//               priority
//             />

//             {/* State overlay with gradient */}
//             <div
//               className={`absolute inset-0 bg-gradient-to-br ${getAvatarColors()} opacity-20 transition-opacity duration-300`}
//               style={{
//                 opacity: getAvatarState() === "idle" ? 0 : 0.3,
//               }}
//             />

//             {/* Breathing animation for idle state */}
//             {getAvatarState() === "idle" && (
//               <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-pulse" />
//             )}
//           </div>

//           {/* Overlay Icon */}
//           {getOverlayIcon() && (
//             <div className="absolute inset-0 flex items-center justify-center">
//               <div className="bg-black/30 rounded-full p-4 backdrop-blur-sm">{getOverlayIcon()}</div>
//             </div>
//           )}

//           {/* Interrupt indicator when speaking */}
//           {isSpeaking && (
//             <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
//               <Square className="w-6 h-6 text-white fill-current" />
//             </div>
//           )}

//           {/* Session Memory Indicator (optional, if you want to show it) */}
//           {hasConversationStarted && (
//             <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
//               <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
//             </div>
//           )}
//         </button>
//       </div>

//       {/* Status Text */}
//       <div className="text-center space-y-2">
//         <h2 className="text-2xl font-bold text-gray-800">{status}</h2>
//       </div>

//       {/* Visual indicators */}
//       <div className="flex items-center space-x-4">
//         <div
//           className={`w-3 h-3 rounded-full transition-colors duration-300 ${
//             isListening ? "bg-red-500 animate-pulse" : "bg-gray-300"
//           }`}
//         />
//         <div
//           className={`w-3 h-3 rounded-full transition-colors duration-300 ${
//             isProcessing ? "bg-yellow-500 animate-pulse" : "bg-gray-300"
//           }`}
//         />
//         <div
//           className={`w-3 h-3 rounded-full transition-colors duration-300 ${
//             isSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-300"
//           }`}
//         />
//       </div>
//     </div>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import { Mic, Volume2, Loader2, Square } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/hooks/use-language"

interface AvatarProps {
  isListening: boolean
  isProcessing: boolean
  isSpeaking: boolean
  onToggleListening: () => void
  onInterrupt: () => void
  hasConversationStarted: boolean
  assistantId?: number // New prop to determine which assistant image to show
  status: string
}

export function Avatar({
  isListening,
  isProcessing,
  isSpeaking,
  onToggleListening,
  onInterrupt,
  hasConversationStarted,
  assistantId = 1, // Default to Slah
  status,
}: AvatarProps) {
  const { t } = useLanguage()
  const [pulseIntensity, setPulseIntensity] = useState(0)

  // Get the appropriate assistant image
  const getAvatarImage = () => {
    return assistantId === 2 ? "/images/amira.png" : "/images/slah.png"
  }

  const getAssistantName = () => {
    return assistantId === 2 ? "Amira" : "Slah"
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isListening || isSpeaking) {
      interval = setInterval(() => {
        setPulseIntensity((prev) => (prev + 1) % 100)
      }, 50)
    } else {
      setPulseIntensity(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isListening, isSpeaking])

  const getAvatarState = () => {
    if (isProcessing) return "processing"
    if (isListening) return "listening"
    if (isSpeaking) return "speaking"
    return "idle"
  }

  const getAvatarColors = () => {
    const state = getAvatarState()
    switch (state) {
      case "listening":
        return "from-red-200 to-red-400" // More subtle red
      case "processing":
        return "from-yellow-200 to-orange-300" // More subtle yellow/orange
      case "speaking":
        return "from-green-200 to-green-400" // More subtle green
      default:
        return "from-gray-200 to-gray-400" // Neutral gray
    }
  }

  const getOverlayIcon = () => {
    const state = getAvatarState()
    switch (state) {
      case "listening":
        return <Mic className="w-12 h-12 text-white drop-shadow-lg" />
      case "processing":
        return <Loader2 className="w-12 h-12 text-white animate-spin drop-shadow-lg" />
      case "speaking":
        return <Volume2 className="w-12 h-12 text-white drop-shadow-lg" />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Avatar Circle */}
      <div className="relative">
        {/* Single Outer pulse ring */}
        {(isListening || isSpeaking) && (
          <div
            className={`absolute inset-0 rounded-full bg-gradient-to-br ${getAvatarColors()} opacity-40 animate-ping`}
            style={{
              transform: `scale(${1.2 + (pulseIntensity / 100) * 0.3})`,
              animationDuration: "2s",
            }}
          />
        )}

        {/* Main Avatar */}
        <button
          onClick={onInterrupt}
          disabled={false}
          className={`
            relative w-48 h-48 rounded-full
            flex items-center justify-center
            transition-all duration-300 ease-in-out
            hover:scale-105 active:scale-95
            shadow-2xl hover:shadow-3xl
            cursor-pointer
            overflow-hidden
            ${isSpeaking ? "ring-4 ring-red-300 ring-opacity-50 animate-pulse" : ""}
            ${isProcessing ? "opacity-80" : ""}
          `}
          style={{
            transform: isListening || isSpeaking ? `scale(${1 + (pulseIntensity / 100) * 0.1})` : "scale(1)",
          }}
        >
          {/* Assistant Image */}
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src={getAvatarImage() || "/placeholder.svg"}
              alt={`${getAssistantName()} AI Assistant Avatar`}
              fill
              className="object-cover"
              priority
            />

            {/* State overlay with gradient */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${getAvatarColors()} opacity-20 transition-opacity duration-300`}
              style={{
                opacity: getAvatarState() === "idle" ? 0 : 0.3,
              }}
            />

            {/* Breathing animation for idle state */}
            {getAvatarState() === "idle" && (
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-pulse" />
            )}
          </div>

          {/* Overlay Icon */}
          {getOverlayIcon() && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/30 rounded-full p-4 backdrop-blur-sm">{getOverlayIcon()}</div>
            </div>
          )}

          {/* Interrupt indicator when speaking */}
          {isSpeaking && (
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Square className="w-6 h-6 text-white fill-current" />
            </div>
          )}

          {/* Session Memory Indicator (optional, if you want to show it) */}
          {hasConversationStarted && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            </div>
          )}
        </button>
      </div>

      {/* Status Text */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {t(`status.${status}`)}
        </h2>
      </div>

      {/* Visual indicators */}
      <div className="flex items-center space-x-4">
        <div
          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            isListening ? "bg-red-500 animate-pulse" : "bg-gray-300"
          }`}
        />
        <div
          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            isProcessing ? "bg-yellow-500 animate-pulse" : "bg-gray-300"
          }`}
        />
        <div
          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            isSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-300"
          }`}
        />
      </div>
    </div>
  )
}
