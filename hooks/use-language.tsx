

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "en-US" | "fr-FR" | "ar-SA"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  isRTL: boolean
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Complete translation keys type
type TranslationKeys = {
  // Navigation
  "nav.dashboard": string
  "nav.assistant": string
  "nav.voiceAssistant": string
  "nav.backToAssistant": string
  "nav.viewProfile": string
  "nav.myConversations": string
  "nav.adminDashboard": string

  // Dashboard
  "dashboard.title": string
  "dashboard.subtitle": string
  "dashboard.totalConversations": string
  "dashboard.todayConversations": string
  "dashboard.avgResponseTime": string
  "dashboard.successRate": string
  "dashboard.recentConversations": string
  "dashboard.noConversations": string
  "dashboard.export": string
  "dashboard.clear": string
  "dashboard.systemStatus": string
  "dashboard.quickActions": string
  "dashboard.refreshStats": string
  "dashboard.downloadReport": string
  "dashboard.systemSettings": string
  "dashboard.usageTips": string
  "dashboard.totalUsers": string
  "dashboard.totalSessions": string
  "dashboard.activeDays": string
  "dashboard.audioRecordings": string
  "dashboard.adminTitle": string
  "dashboard.adminSubtitle": string
  "dashboard.searchPlaceholder": string
  "dashboard.showingConversations": string
  "dashboard.noConversationsFound": string
  "dashboard.timestamp": string
  "dashboard.user": string
  "dashboard.userMessage": string
  "dashboard.aiResponse": string
  "dashboard.language": string
  "dashboard.audio": string
  "dashboard.guest": string
  "dashboard.noEmail": string
  "dashboard.noAudio": string
  "dashboard.play": string
  "dashboard.playing": string
  "dashboard.accessDenied": string
  "dashboard.adminAccessRequired": string
  "dashboard.errorLoading": string
  "dashboard.failedToLoad": string
  "dashboard.playbackError": string
  "dashboard.couldNotPlayAudio": string
  "dashboard.conversationsCleared": string
  "dashboard.allConversationsRemoved": string
  "dashboard.confirmClear": string

  // User Dashboard specific keys
  "dashboard.myVoiceConversations": string
  "dashboard.welcomeBack": string
  "dashboard.loadingConversations": string
  "dashboard.stop": string
  "dashboard.totalMessages": string
  "dashboard.userAndAiAudio": string
  "dashboard.never": string
  "dashboard.voiceConversationSessions": string
  "dashboard.noVoiceConversations": string
  "dashboard.startTalkingToSeeHistory": string
  "dashboard.startVoiceConversation": string
  "dashboard.voiceSession": string
  "dashboard.firstMessage": string
  "dashboard.session": string
  "dashboard.viewDetails": string
  "dashboard.voiceConversationSessionDetails": string
  "dashboard.sessionId": string
  "dashboard.total": string
  "dashboard.ai": string
  "dashboard.sessionType": string
  "dashboard.voiceConversation": string
  "dashboard.conversationMessages": string
  "dashboard.you": string
  "dashboard.downloadAudio": string
  "dashboard.voiceMessageRecorded": string
  "dashboard.playAi": string
  "dashboard.downloadAiAudio": string
  "dashboard.aiAudioAvailable": string
  "dashboard.lastActivity": string

  // Admin Dashboard
  "admin.dashboard.title": string
  "admin.dashboard.subtitle": string
  "admin.dashboard.totalUsers": string
  "admin.dashboard.sessions": string
  "admin.dashboard.messages": string
  "admin.dashboard.totalAudio": string
  "admin.dashboard.userAudio": string
  "admin.dashboard.aiAudio": string
  "admin.dashboard.searchPlaceholder": string
  "admin.dashboard.refresh": string
  "admin.dashboard.exportCSV": string
  "admin.dashboard.showingSessions": string
  "admin.dashboard.sessionId": string
  "admin.dashboard.user": string
  "admin.dashboard.messagesCount": string
  "admin.dashboard.audioFiles": string
  "admin.dashboard.firstMessage": string
  "admin.dashboard.lastActivity": string
  "admin.dashboard.actions": string
  "admin.dashboard.view": string
  "admin.dashboard.noSessions": string
  "admin.dashboard.sessionDetails": string
  "admin.dashboard.sessionInfo": string
  "admin.dashboard.totalMessages": string
  "admin.dashboard.audioRecordings": string
  "admin.dashboard.conversationMessages": string
  "admin.dashboard.userMessage": string
  "admin.dashboard.aiResponse": string
  "admin.dashboard.play": string
  "admin.dashboard.stop": string
  "admin.dashboard.download": string
  "admin.dashboard.playing": string

  // Profile Page
  "profile.title": string
  "profile.backButton": string
  "profile.editProfile": string
  "profile.profileInfo": string
  "profile.cancel": string
  "profile.saveChanges": string
  "profile.saving": string
  "profile.fullName": string
  "profile.emailAddress": string
  "profile.phoneNumber": string
  "profile.accountType": string
  "profile.memberSince": string
  "profile.lastLogin": string
  "profile.notProvided": string
  "profile.emailNotVerified": string
  "profile.phoneNotVerified": string
  "profile.profileUpdated": string
  "profile.profileUpdateSuccess": string
  "profile.avatarUpdated": string
  "profile.avatarUpdateSuccess": string
  "profile.invalidFile": string
  "profile.selectImage": string
  "profile.fileTooLarge": string
  "profile.fileSizeLimit": string
  "profile.uploadFailed": string
  "profile.failedToUpload": string
  "profile.loadingProfile": string
  "profile.failedToLoadProfile": string
  "profile.goToLogin": string

  // Voice Assistant
  "voice.sessionId": string
  "voice.messages": string
  "voice.playing": string
  "voice.newConversation": string
  "voice.autoMode": string
  "voice.startRecording": string
  "voice.stopRecording": string
  "voice.playResponse": string
  "voice.stopAudio": string
  "voice.conversation": string
  "voice.startConversation": string
  "voice.messagesWillAppear": string
  "voice.currentInteraction": string
  "voice.ready": string
  "voice.readyForNext": string
  "voice.newConversationStarted": string
  "voice.previousConversationCleared": string
  "voice.listening": string
  "voice.thinking": string
  "voice.speaking": string
  "voice.realTimeTTS": string

  // Assistant Selection
  "selection.title": string
  "selection.subtitle": string
  "selection.startChat": string
  "selection.whichAssistant": string
  "selection.chooseSlahB2B": string
  "selection.chooseAmiraB2C": string
  "selection.connecting": string
  "selection.pleaseWait": string

  // Assistant Cards
  "assistant.slah.type": string
  "assistant.slah.description": string
  "assistant.slah.features.enterprise": string
  "assistant.slah.features.integration": string
  "assistant.slah.features.analytics": string
  "assistant.slah.features.documentation": string
  "assistant.slah.features.architecture": string
  "assistant.slah.features.corporateSupport": string

  "assistant.amira.type": string
  "assistant.amira.description": string
  "assistant.amira.features.customerSupport": string
  "assistant.amira.features.productInformation": string
  "assistant.amira.features.orderAssistance": string
  "assistant.amira.features.accountManagement": string
  "assistant.amira.features.billingInquiries": string
  "assistant.amira.features.generalHelp": string

  "assistant.gender.male": string
  "assistant.gender.female": string

  // Comparison Section
  "comparison.enterpriseSolutions": string
  "comparison.technicalIntegrations": string
  "comparison.businessProcessOptimization": string
  "comparison.corporateAccountManagement": string
  "comparison.personalCustomerSupport": string
  "comparison.productRecommendations": string
  "comparison.orderBillingAssistance": string
  "comparison.generalConsumerInquiries": string

  // Assistant Chat
  "chat.backToSelection": string
  "chat.selectLanguage": string
  "chat.limitedBrowser": string
  "chat.speechNotSupported": string
  "chat.youSaid": string
  "chat.response": string
  "chat.conversationHistory": string
  "chat.clearHistory": string
  "chat.specializations": string
  "chat.playing": string
  "chat.replayResponse": string
  "chat.interrupted": string
  "chat.speechStopped": string
  "chat.conversationCleared": string
  "chat.historyReset": string

  // Status messages
  "status.listening": string
  "status.thinking": string
  "status.speaking": string
  "status.ready": string
  "status.clickToStart": string
  "status.rememberConversation": string
  "status.clickToStop": string
  "status.clickToInterrupt": string
  "status.clickAnywhere": string

  // Home Page
  "home.title": string
  "home.subtitle": string
  "home.languageSupport": string
  "home.existingUsers": string
  "home.existingUsersDescription": string
  "home.loginButton": string
  "home.newUsers": string
  "home.newUsersDescription": string
  "home.registerButton": string
  "home.quickAccess": string
  "home.quickAccessDescription": string
  "home.continueAsGuest": string
  "home.demoAccount": string
  "home.demoEmail": string
  "home.demoPassword": string
  "home.featureVoiceInteraction": string
  "home.featureVoiceDescription": string
  "home.featureMultilingual": string
  "home.featureMultilingualDescription": string
  "home.featureSecure": string
  "home.featureSecureDescription": string
  "home.loading": string

  // Login Page
  "login.title": string
  "login.subtitle": string
  "login.emailLabel": string
  "login.emailPlaceholder": string
  "login.passwordLabel": string
  "login.passwordPlaceholder": string
  "login.button": string
  "login.loggingIn": string
  "login.noAccount": string
  "login.registerLink": string
  "login.continueAsGuest": string
  "login.demoAccount": string
  "login.demoEmail": string
  "login.demoPassword": string
  "login.successTitle": string
  "login.successDescription": string
  "login.failedTitle": string
  "login.failedDescription": string

  // Register Page
  "register.title": string
  "register.subtitle": string
  "register.fullNameLabel": string
  "register.fullNamePlaceholder": string
  "register.emailLabel": string
  "register.emailPlaceholder": string
  "register.passwordLabel": string
  "register.passwordPlaceholder": string
  "register.confirmPasswordLabel": string
  "register.confirmPasswordPlaceholder": string
  "register.button": string
  "register.creatingAccount": string
  "register.passwordMismatchTitle": string
  "register.passwordMismatchDescription": string
  "register.weakPasswordTitle": string
  "register.weakPasswordDescription": string
  "register.successTitle": string
  "register.successDescription": string
  "register.failedTitle": string
  "register.failedDescription": string
  "register.alreadyHaveAccount": string
  "register.loginLink": string

  // Auth Pages
  "auth.forgotPassword": string
  "auth.resetPassword": string
  "auth.enterResetCode": string
  "auth.setNewPassword": string
  "auth.resetCodeSent": string
  "auth.resetComplete": string
  "auth.passwordReset": string
  "auth.redirecting": string
  "auth.chooseResetMethod": string
  "auth.phone": string
  "auth.email": string
  "auth.phoneNumber": string
  "auth.emailAddress": string
  "auth.sendResetCode": string
  "auth.verificationCode": string
  "auth.enterCode": string
  "auth.resendCode": string
  "auth.newPassword": string
  "auth.confirmPassword": string
  "auth.back": string

  // Common UI elements
  "common.back": string
  "common.logout": string
  "common.login": string
  "common.signUp": string
  "common.or": string
  "common.refresh": string
  "common.loading": string
  "common.error": string
  "common.success": string
  "common.cancel": string
  "common.confirm": string
  "common.yes": string
  "common.no": string

  // Error Messages
  "error.connectionFailed": string
  "error.serverDisconnected": string
  "error.networkError": string
  "error.loadingFailed": string
  "error.processingFailed": string
  "error.playbackFailed": string
  "error.loginRequired": string
  "error.loginRequiredDescription": string
  "error.failedToLoadData": string
  "error.failedToLoadMessages": string

  [key: string]: string
}

// Complete translation dictionary
const translations: Record<Language, TranslationKeys> = {
  "en-US": {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.assistant": "Assistant",
    "nav.voiceAssistant": "Voice Assistant",
    "nav.backToAssistant": "Back to Assistant",
    "nav.viewProfile": "View Profile",
    "nav.myConversations": "My Conversations",
    "nav.adminDashboard": "Admin Dashboard",

    // Dashboard
    "dashboard.title": "Voice AI Assistant Dashboard",
    "dashboard.subtitle": "Monitor and manage your Voice AI Assistant",
    "dashboard.totalConversations": "Total Conversations",
    "dashboard.todayConversations": "Today's Conversations",
    "dashboard.avgResponseTime": "Avg Response Time",
    "dashboard.successRate": "Success Rate",
    "dashboard.recentConversations": "Recent Conversations",
    "dashboard.noConversations": "No conversations yet",
    "dashboard.export": "Export",
    "dashboard.clear": "Clear",
    "dashboard.systemStatus": "System Status",
    "dashboard.quickActions": "Quick Actions",
    "dashboard.refreshStats": "Refresh Stats",
    "dashboard.downloadReport": "Download Report",
    "dashboard.systemSettings": "System Settings",
    "dashboard.usageTips": "Usage Tips",
    "dashboard.totalUsers": "Total Users",
    "dashboard.totalSessions": "Total Sessions",
    "dashboard.activeDays": "Active Days",
    "dashboard.audioRecordings": "Audio Recordings",
    "dashboard.adminTitle": "Admin Dashboard",
    "dashboard.adminSubtitle": "Complete overview of your AI Assistant system",
    "dashboard.searchPlaceholder": "Search conversations...",
    "dashboard.showingConversations": "Showing {filtered} of {total} conversations",
    "dashboard.noConversationsFound": "No conversations found",
    "dashboard.timestamp": "Timestamp",
    "dashboard.user": "User",
    "dashboard.userMessage": "User Message",
    "dashboard.aiResponse": "AI Response",
    "dashboard.language": "Language",
    "dashboard.audio": "Audio",
    "dashboard.guest": "Guest",
    "dashboard.noEmail": "No email",
    "dashboard.noAudio": "No audio",
    "dashboard.play": "Play",
    "dashboard.playing": "Playing",
    "dashboard.accessDenied": "Access Denied",
    "dashboard.adminAccessRequired": "Admin access required",
    "dashboard.errorLoading": "Error",
    "dashboard.failedToLoad": "Failed to load dashboard data",
    "dashboard.playbackError": "Playback Error",
    "dashboard.couldNotPlayAudio": "Could not play audio recording",
    "dashboard.conversationsCleared": "Conversations Cleared",
    "dashboard.allConversationsRemoved": "All conversation logs have been removed",
    "dashboard.confirmClear": "Are you sure you want to clear all conversations? This cannot be undone.",

    // User Dashboard specific keys
    "dashboard.myVoiceConversations": "My Voice Conversations",
    "dashboard.welcomeBack": "Welcome back",
    "dashboard.loadingConversations": "Loading your conversations...",
    "dashboard.stop": "Stop",
    "dashboard.totalMessages": "Total Messages",
    "dashboard.userAndAiAudio": "User + AI Audio",
    "dashboard.never": "Never",
    "dashboard.voiceConversationSessions": "Your Voice Conversation Sessions",
    "dashboard.noVoiceConversations": "No voice conversations yet",
    "dashboard.startTalkingToSeeHistory": "Start talking with your AI assistant to see your voice conversation history here.",
    "dashboard.startVoiceConversation": "Start Voice Conversation",
    "dashboard.voiceSession": "Voice Session",
    "dashboard.firstMessage": "First message",
    "dashboard.session": "Session",
    "dashboard.viewDetails": "View Details",
    "dashboard.voiceConversationSessionDetails": "Voice Conversation Session Details",
    "dashboard.sessionId": "Session ID",
    "dashboard.total": "total",
    "dashboard.ai": "AI",
    "dashboard.sessionType": "Session Type",
    "dashboard.voiceConversation": "Voice Conversation",
    "dashboard.conversationMessages": "Conversation Messages",
    "dashboard.you": "You",
    "dashboard.downloadAudio": "Download audio",
    "dashboard.voiceMessageRecorded": "Voice message recorded",
    "dashboard.playAi": "Play AI",
    "dashboard.downloadAiAudio": "Download AI audio",
    "dashboard.aiAudioAvailable": "AI audio available",
    "dashboard.lastActivity": "Last Activity",

    // Admin Dashboard
    "admin.dashboard.title": "Admin Dashboard",
    "admin.dashboard.subtitle": "Voice AI Assistant Analytics & Session Management",
    "admin.dashboard.totalUsers": "Total Users",
    "admin.dashboard.sessions": "Sessions",
    "admin.dashboard.messages": "Messages",
    "admin.dashboard.totalAudio": "Total Audio",
    "admin.dashboard.userAudio": "User Audio",
    "admin.dashboard.aiAudio": "AI Audio",
    "admin.dashboard.searchPlaceholder": "Search sessions by user, message, or email...",
    "admin.dashboard.refresh": "Refresh",
    "admin.dashboard.exportCSV": "Export CSV",
    "admin.dashboard.showingSessions": "Showing {count} sessions",
    "admin.dashboard.sessionId": "Session ID",
    "admin.dashboard.user": "User",
    "admin.dashboard.messagesCount": "Messages",
    "admin.dashboard.audioFiles": "Audio Files",
    "admin.dashboard.firstMessage": "First Message",
    "admin.dashboard.lastActivity": "Last Activity",
    "admin.dashboard.actions": "Actions",
    "admin.dashboard.view": "View",
    "admin.dashboard.noSessions": "No conversation sessions found",
    "admin.dashboard.sessionDetails": "Voice Conversation Session Details",
    "admin.dashboard.sessionInfo": "Session Information",
    "admin.dashboard.totalMessages": "Total Messages",
    "admin.dashboard.audioRecordings": "Audio Recordings",
    "admin.dashboard.conversationMessages": "Conversation Messages",
    "admin.dashboard.userMessage": "User Message",
    "admin.dashboard.aiResponse": "AI Assistant Response",
    "admin.dashboard.play": "Play",
    "admin.dashboard.stop": "Stop",
    "admin.dashboard.download": "Download",
    "admin.dashboard.playing": "Playing",

    // Profile Page
    "profile.title": "My Profile",
    "profile.backButton": "Back",
    "profile.editProfile": "Edit Profile",
    "profile.profileInfo": "Profile Information",
    "profile.cancel": "Cancel",
    "profile.saveChanges": "Save Changes",
    "profile.saving": "Saving...",
    "profile.fullName": "Full Name",
    "profile.emailAddress": "Email Address",
    "profile.phoneNumber": "Phone Number",
    "profile.accountType": "Account Type",
    "profile.memberSince": "Member Since",
    "profile.lastLogin": "Last Login",
    "profile.notProvided": "Not provided",
    "profile.emailNotVerified": "Email not verified",
    "profile.phoneNotVerified": "Phone not verified",
    "profile.profileUpdated": "Profile Updated",
    "profile.profileUpdateSuccess": "Your profile has been successfully updated",
    "profile.avatarUpdated": "Avatar Updated",
    "profile.avatarUpdateSuccess": "Your profile picture has been updated",
    "profile.invalidFile": "Invalid File",
    "profile.selectImage": "Please select an image file",
    "profile.fileTooLarge": "File Too Large",
    "profile.fileSizeLimit": "Please select an image smaller than 5MB",
    "profile.uploadFailed": "Upload Failed",
    "profile.failedToUpload": "Failed to upload avatar",
    "profile.loadingProfile": "Loading profile...",
    "profile.failedToLoadProfile": "Failed to load profile",
    "profile.goToLogin": "Go to Login",

    // Voice Assistant
    "voice.sessionId": "Session",
    "voice.messages": "messages",
    "voice.playing": "Playing",
    "voice.newConversation": "New Conversation",
    "voice.autoMode": "Auto Mode",
    "voice.startRecording": "Start Recording",
    "voice.stopRecording": "Stop Recording",
    "voice.playResponse": "Play Response",
    "voice.stopAudio": "Stop Audio",
    "voice.conversation": "Conversation",
    "voice.startConversation": "Start a conversation",
    "voice.messagesWillAppear": "Your messages will appear here",
    "voice.currentInteraction": "Current Interaction",
    "voice.ready": "Ready for next message",
    "voice.readyForNext": "Ready to start conversation",
    "voice.newConversationStarted": "New Conversation Started",
    "voice.previousConversationCleared": "Previous conversation history cleared",
    "voice.listening": "Listening...",
    "voice.thinking": "Thinking...",
    "voice.speaking": "Speaking...",
    "voice.realTimeTTS": "Real-time TTS",

    // Assistant Selection
    "selection.title": "Choose Your AI Assistant",
    "selection.subtitle": "Select the assistant that best matches your needs. Each assistant is specialized to provide you with the most relevant support.",
    "selection.startChat": "Start Chat with",
    "selection.whichAssistant": "Which Assistant is Right for You?",
    "selection.chooseSlahB2B": "Choose Slah for B2B",
    "selection.chooseAmiraB2C": "Choose Amira for B2C",
    "selection.connecting": "Connecting to",
    "selection.pleaseWait": "Please wait while we set up your",

    // Assistant Cards
    "assistant.slah.type": "B2B Assistant",
    "assistant.slah.description": "Specialized in business-to-business solutions and enterprise support",
    "assistant.slah.features.enterprise": "Enterprise Solutions",
    "assistant.slah.features.integration": "Technical Integration",
    "assistant.slah.features.analytics": "Business Analytics",
    "assistant.slah.features.documentation": "API Documentation",
    "assistant.slah.features.architecture": "System Architecture",
    "assistant.slah.features.corporateSupport": "Corporate Support",

    "assistant.amira.type": "B2C Assistant",
    "assistant.amira.description": "Focused on consumer support and customer service excellence",
    "assistant.amira.features.customerSupport": "Customer Support",
    "assistant.amira.features.productInformation": "Product Information",
    "assistant.amira.features.orderAssistance": "Order Assistance",
    "assistant.amira.features.accountManagement": "Account Management",
    "assistant.amira.features.billingInquiries": "Billing Inquiries",
    "assistant.amira.features.generalHelp": "General Help",

    "assistant.gender.male": "Male",
    "assistant.gender.female": "Female",

    // Comparison Section
    "comparison.enterpriseSolutions": "Enterprise-level solutions",
    "comparison.technicalIntegrations": "Technical integrations",
    "comparison.businessProcessOptimization": "Business process optimization",
    "comparison.corporateAccountManagement": "Corporate account management",
    "comparison.personalCustomerSupport": "Personal customer support",
    "comparison.productRecommendations": "Product recommendations",
    "comparison.orderBillingAssistance": "Order and billing assistance",
    "comparison.generalConsumerInquiries": "General consumer inquiries",

    // Assistant Chat
    "chat.backToSelection": "Back to Selection",
    "chat.selectLanguage": "Select Language",
    "chat.limitedBrowser": "Limited Browser Support",
    "chat.speechNotSupported": "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for the best experience.",
    "chat.youSaid": "You said:",
    "chat.response": "Response:",
    "chat.conversationHistory": "Conversation History",
    "chat.clearHistory": "Clear History",
    "chat.specializations": "Specializations",
    "chat.playing": "Playing...",
    "chat.replayResponse": "Replay Response",
    "chat.interrupted": "Interrupted",
    "chat.speechStopped": "Speech stopped. You can speak now!",
    "chat.conversationCleared": "Conversation Cleared",
    "chat.historyReset": "Your conversation history has been reset.",

    // Status messages
    "status.listening": "I'm listening...",
    "status.thinking": "is thinking...",
    "status.speaking": "is speaking...",
    "status.ready": "Ready for your next question!",
    "status.clickToStart": "Click on the button to start talking",
    "status.rememberConversation": "(I remember our conversation)",
    "status.clickToStop": "(click to stop)",
    "status.clickToInterrupt": "(click to interrupt when I start speaking)",
    "status.clickAnywhere": "(click anywhere on me to interrupt)",

    // Home Page
    "home.title": "Ooredoo AI Voice Assistant",
    "home.subtitle": "Experience intelligent customer support with our multilingual voice-powered AI assistants",
    "home.languageSupport": "English • Français • العربية",
    "home.existingUsers": "Existing Users",
    "home.existingUsersDescription": "Access your conversation history and personalized experience",
    "home.loginButton": "Login to Your Account",
    "home.newUsers": "New Users",
    "home.newUsersDescription": "Create an account to save your conversations and preferences",
    "home.registerButton": "Create New Account",
    "home.quickAccess": "Quick Access",
    "home.quickAccessDescription": "Try our AI assistants without creating an account",
    "home.continueAsGuest": "Continue as Guest",
    "home.demoAccount": "Demo Account Available",
    "home.demoEmail": "Email: admin@ooredoo.com",
    "home.demoPassword": "Password: admin123",
    "home.featureVoiceInteraction": "Voice Interaction",
    "home.featureVoiceDescription": "Natural voice conversations with AI",
    "home.featureMultilingual": "Multilingual Support",
    "home.featureMultilingualDescription": "Available in English, French, and Arabic",
    "home.featureSecure": "Secure & Private",
    "home.featureSecureDescription": "Your conversations are protected",
    "home.loading": "Loading...",

    // Login Page
    "login.title": "Sign In",
    "login.subtitle": "Enter your credentials to access your account",
    "login.emailLabel": "Email Address",
    "login.emailPlaceholder": "Enter your email",
    "login.passwordLabel": "Password",
    "login.passwordPlaceholder": "Enter your password",
    "login.button": "Sign In",
    "login.loggingIn": "Signing In...",
    "login.noAccount": "Don't have an account?",
    "login.registerLink": "Sign up",
    "login.continueAsGuest": "Continue as Guest",
    "login.demoAccount": "Demo Account",
    "login.demoEmail": "Email: admin@ooredoo.com",
    "login.demoPassword": "Password: admin123",
    "login.successTitle": "Login Successful",
    "login.successDescription": "Welcome back, {name}!",
    "login.failedTitle": "Login Failed",
    "login.failedDescription": "Please check your credentials and try again.",

    // Register Page
    "register.title": "Create Your Account",
    "register.subtitle": "Join Ooredoo AI Assistant",
    "register.fullNameLabel": "Full Name (Optional)",
    "register.fullNamePlaceholder": "John Doe",
    "register.emailLabel": "Email *",
    "register.emailPlaceholder": "you@example.com",
    "register.passwordLabel": "Password * (min 6 characters)",
    "register.passwordPlaceholder": "Enter your password",
    "register.confirmPasswordLabel": "Confirm Password *",
    "register.confirmPasswordPlaceholder": "Confirm your password",
    "register.button": "Register",
    "register.creatingAccount": "Creating Account...",
    "register.passwordMismatchTitle": "Password Mismatch",
    "register.passwordMismatchDescription": "Passwords do not match.",
    "register.weakPasswordTitle": "Weak Password",
    "register.weakPasswordDescription": "Password must be at least 6 characters long.",
    "register.successTitle": "Registration Successful",
    "register.successDescription": "Your account has been created. Please login.",
    "register.failedTitle": "Registration Failed",
    "register.failedDescription": "Please try again with different credentials.",
    "register.alreadyHaveAccount": "Already have an account?",
    "register.loginLink": "Login here",

    // Auth Pages
    "auth.forgotPassword": "Forgot your password?",
    "auth.resetPassword": "Reset Password",
    "auth.enterResetCode": "Enter Reset Code",
    "auth.setNewPassword": "Set New Password",
    "auth.resetCodeSent": "Reset Code Sent",
    "auth.resetComplete": "Password Reset Complete",
    "auth.passwordReset": "Your password has been updated successfully",
    "auth.redirecting": "Redirecting to login...",
    "auth.chooseResetMethod": "Choose how you'd like to reset your password",
    "auth.phone": "Phone",
    "auth.email": "Email",
    "auth.phoneNumber": "Phone Number",
    "auth.emailAddress": "Email Address",
    "auth.sendResetCode": "Send Reset Code",
    "auth.verificationCode": "Verification Code",
    "auth.enterCode": "Enter 6-digit code",
    "auth.resendCode": "Resend Code",
    "auth.newPassword": "New Password",
    "auth.confirmPassword": "Confirm New Password",
    "auth.back": "Back",

    // Common UI elements
    "common.back": "Back",
    "common.logout": "Logout",
    "common.login": "Login",
    "common.signUp": "Sign Up",
    "common.or": "Or",
    "common.refresh": "Refresh",
    "common.loading": "Loading",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.yes": "Yes",
    "common.no": "No",

    // Error Messages
    "error.connectionFailed": "Connection Error",
    "error.serverDisconnected": "Server Disconnected",
    "error.networkError": "Network Error",
    "error.loadingFailed": "Failed to load",
    "error.processingFailed": "Processing Failed",
    "error.playbackFailed": "Playback Error",
    "error.loginRequired": "Login Required",
    "error.loginRequiredDescription": "Please login to view your conversations",
    "error.failedToLoadData": "Failed to load your conversation data",
    "error.failedToLoadMessages": "Failed to load conversation messages"
  },

  "fr-FR": {
    // Navigation
    "nav.dashboard": "Tableau de bord",
    "nav.assistant": "Assistant",
    "nav.voiceAssistant": "Assistant Vocal",
    "nav.backToAssistant": "Retour à l'Assistant",
    "nav.viewProfile": "Voir le profil",
    "nav.myConversations": "Mes Conversations",
    "nav.adminDashboard": "Tableau de bord Admin",
    
    
    // Dashboard
    "dashboard.title": "Tableau de bord Assistant IA Vocal",
    "dashboard.subtitle": "Surveillez et gérez votre Assistant IA Vocal",
    "dashboard.totalConversations": "Conversations totales",
    "dashboard.todayConversations": "Conversations d'aujourd'hui",
    "dashboard.avgResponseTime": "Temps de réponse moyen",
    "dashboard.successRate": "Taux de réussite",
    "dashboard.recentConversations": "Conversations récentes",
    "dashboard.noConversations": "Aucune conversation pour le moment",
    "dashboard.export": "Exporter",
    "dashboard.clear": "Effacer",
    "dashboard.systemStatus": "État du système",
    "dashboard.quickActions": "Actions rapides",
    "dashboard.refreshStats": "Actualiser les statistiques",
    "dashboard.downloadReport": "Télécharger le rapport",
    "dashboard.systemSettings": "Paramètres système",
    "dashboard.usageTips": "Conseils d'utilisation",
    "dashboard.totalUsers": "Utilisateurs totaux",
    "dashboard.totalSessions": "Sessions totales",
    "dashboard.activeDays": "Jours actifs",
    "dashboard.audioRecordings": "Enregistrements audio",
    "dashboard.adminTitle": "Tableau de bord administrateur",
    "dashboard.adminSubtitle": "Vue d'ensemble complète de votre système d'assistant IA",
    "dashboard.searchPlaceholder": "Rechercher des conversations...",
    "dashboard.showingConversations": "Affichage de {filtered} conversations sur {total}",
    "dashboard.noConversationsFound": "Aucune conversation trouvée",
    "dashboard.timestamp": "Horodatage",
    "dashboard.user": "Utilisateur",
    "dashboard.userMessage": "Message de l'utilisateur",
    "dashboard.aiResponse": "Réponse de l'IA",
    "dashboard.language": "Langue",
    "dashboard.audio": "Audio",
    "dashboard.guest": "Invité",
    "dashboard.noEmail": "Aucun e-mail",
    "dashboard.noAudio": "Aucun audio",
    "dashboard.play": "Lire",
    "dashboard.playing": "En lecture",
    "dashboard.accessDenied": "Accès refusé",
    "dashboard.adminAccessRequired": "Accès administrateur requis",
    "dashboard.errorLoading": "Erreur",
    "dashboard.failedToLoad": "Échec du chargement des données du tableau de bord",
    "dashboard.playbackError": "Erreur de lecture",
    "dashboard.couldNotPlayAudio": "Impossible de lire l'enregistrement audio",
    "dashboard.conversationsCleared": "Conversations supprimées",
    "dashboard.allConversationsRemoved": "Tous les journaux de conversation ont été supprimés",
    "dashboard.confirmClear": "Êtes-vous sûr de vouloir supprimer toutes les conversations ? Cette action est irréversible.",

    // User Dashboard specific keys
    "dashboard.myVoiceConversations": "Mes Conversations Vocales",
    "dashboard.welcomeBack": "Bienvenue",
    "dashboard.loadingConversations": "Chargement de vos conversations...",
    "dashboard.stop": "Arrêter",
    "dashboard.totalMessages": "Messages Totaux",
    "dashboard.userAndAiAudio": "Audio Utilisateur + IA",
    "dashboard.never": "Jamais",
    "dashboard.voiceConversationSessions": "Vos Sessions de Conversation Vocale",
    "dashboard.noVoiceConversations": "Aucune conversation vocale pour le moment",
    "dashboard.startTalkingToSeeHistory": "Commencez à parler avec votre assistant IA pour voir votre historique de conversations vocales ici.",
    "dashboard.startVoiceConversation": "Commencer une Conversation Vocale",
    "dashboard.voiceSession": "Session Vocale",
    "dashboard.firstMessage": "Premier message",
    "dashboard.session": "Session",
    "dashboard.viewDetails": "Voir les Détails",
    "dashboard.voiceConversationSessionDetails": "Détails de la Session de Conversation Vocale",
    "dashboard.sessionId": "ID de Session",
    "dashboard.total": "total",
    "dashboard.ai": "IA",
    "dashboard.sessionType": "Type de Session",
    "dashboard.voiceConversation": "Conversation Vocale",
    "dashboard.conversationMessages": "Messages de Conversation",
    "dashboard.you": "Vous",
    "dashboard.downloadAudio": "Télécharger l'audio",
    "dashboard.voiceMessageRecorded": "Message vocal enregistré",
    "dashboard.playAi": "Lire IA",
    "dashboard.downloadAiAudio": "Télécharger l'audio IA",
    "dashboard.aiAudioAvailable": "Audio IA disponible",
    "dashboard.lastActivity": "Dernière Activité",

    // Admin Dashboard
    "admin.dashboard.title": "Tableau de bord administrateur",
    "admin.dashboard.subtitle": "Analyses et gestion des sessions de l'assistant IA vocal",
    "admin.dashboard.totalUsers": "Utilisateurs totaux",
    "admin.dashboard.sessions": "Sessions",
    "admin.dashboard.messages": "Messages",
    "admin.dashboard.totalAudio": "Audio total",
    "admin.dashboard.userAudio": "Audio utilisateur",
    "admin.dashboard.aiAudio": "Audio IA",
    "admin.dashboard.searchPlaceholder": "Rechercher des sessions par utilisateur, message ou e-mail...",
    "admin.dashboard.refresh": "Actualiser",
    "admin.dashboard.exportCSV": "Exporter CSV",
    "admin.dashboard.showingSessions": "Affichage de {count} sessions",
    "admin.dashboard.sessionId": "ID de session",
    "admin.dashboard.user": "Utilisateur",
    "admin.dashboard.messagesCount": "Messages",
    "admin.dashboard.audioFiles": "Fichiers audio",
    "admin.dashboard.firstMessage": "Premier message",
    "admin.dashboard.lastActivity": "Dernière activité",
    "admin.dashboard.actions": "Actions",
    "admin.dashboard.view": "Voir",
    "admin.dashboard.noSessions": "Aucune session de conversation trouvée",
    "admin.dashboard.sessionDetails": "Détails de la session de conversation vocale",
    "admin.dashboard.sessionInfo": "Informations sur la session",
    "admin.dashboard.totalMessages": "Messages totaux",
    "admin.dashboard.audioRecordings": "Enregistrements audio",
    "admin.dashboard.conversationMessages": "Messages de conversation",
    "admin.dashboard.userMessage": "Message utilisateur",
    "admin.dashboard.aiResponse": "Réponse de l'assistant IA",
    "admin.dashboard.play": "Lire",
    "admin.dashboard.stop": "Arrêter",
    "admin.dashboard.download": "Télécharger",
    "admin.dashboard.playing": "En lecture",

    // Profile Page
    "profile.title": "Mon profil",
    "profile.backButton": "Retour",
    "profile.editProfile": "Modifier le profil",
    "profile.profileInfo": "Informations du profil",
    "profile.cancel": "Annuler",
    "profile.saveChanges": "Enregistrer les modifications",
    "profile.saving": "Enregistrement...",
    "profile.fullName": "Nom complet",
    "profile.emailAddress": "Adresse e-mail",
    "profile.phoneNumber": "Numéro de téléphone",
    "profile.accountType": "Type de compte",
    "profile.memberSince": "Membre depuis",
    "profile.lastLogin": "Dernière connexion",
    "profile.notProvided": "Non fourni",
    "profile.emailNotVerified": "E-mail non vérifié",
    "profile.phoneNotVerified": "Téléphone non vérifié",
    "profile.profileUpdated": "Profil mis à jour",
    "profile.profileUpdateSuccess": "Votre profil a été mis à jour avec succès",
    "profile.avatarUpdated": "Avatar mis à jour",
    "profile.avatarUpdateSuccess": "Votre photo de profil a été mise à jour",
    "profile.invalidFile": "Fichier invalide",
    "profile.selectImage": "Veuillez sélectionner un fichier image",
    "profile.fileTooLarge": "Fichier trop volumineux",
    "profile.fileSizeLimit": "Veuillez sélectionner une image de moins de 5 Mo",
    "profile.uploadFailed": "Échec du téléchargement",
    "profile.failedToUpload": "Échec du téléchargement de l'avatar",
    "profile.loadingProfile": "Chargement du profil...",
    "profile.failedToLoadProfile": "Échec du chargement du profil",
    "profile.goToLogin": "Aller à la connexion",

    // Voice Assistant
    "voice.sessionId": "Session",
    "voice.messages": "messages",
    "voice.playing": "En lecture",
    "voice.newConversation": "Nouvelle conversation",
    "voice.autoMode": "Mode automatique",
    "voice.startRecording": "Commencer l'enregistrement",
    "voice.stopRecording": "Arrêter l'enregistrement",
    "voice.playResponse": "Lire la réponse",
    "voice.stopAudio": "Arrêter l'audio",
    "voice.conversation": "Conversation",
    "voice.startConversation": "Commencer une conversation",
    "voice.messagesWillAppear": "Vos messages apparaîtront ici",
    "voice.currentInteraction": "Interaction actuelle",
    "voice.ready": "Prêt pour le prochain message",
    "voice.readyForNext": "Prêt à commencer la conversation",
    "voice.newConversationStarted": "Nouvelle conversation commencée",
    "voice.previousConversationCleared": "Historique de conversation précédent effacé",
    "voice.listening": "J'écoute...",
    "voice.thinking": "Réflexion...",
    "voice.speaking": "Parle...",
    "voice.realTimeTTS": "TTS en temps réel",

    // Assistant Selection
    "selection.title": "Choisissez votre Assistant IA",
    "selection.subtitle": "Sélectionnez l'assistant qui correspond le mieux à vos besoins. Chaque assistant est spécialisé pour vous fournir le support le plus pertinent.",
    "selection.startChat": "Commencer le chat avec",
    "selection.whichAssistant": "Quel assistant vous convient le mieux ?",
    "selection.chooseSlahB2B": "Choisissez Slah pour B2B",
    "selection.chooseAmiraB2C": "Choisissez Amira pour B2C",
    "selection.connecting": "Connexion à",
    "selection.pleaseWait": "Veuillez patienter pendant que nous configurons votre",

    // Assistant Cards
    "assistant.slah.type": "Assistant B2B",
    "assistant.slah.description": "Spécialisé dans les solutions inter-entreprises et le support d'entreprise",
    "assistant.slah.features.enterprise": "Solutions d'entreprise",
    "assistant.slah.features.integration": "Intégration technique",
    "assistant.slah.features.analytics": "Analyses commerciales",
    "assistant.slah.features.documentation": "Documentation API",
    "assistant.slah.features.architecture": "Architecture système",
    "assistant.slah.features.corporateSupport": "Support d'entreprise",

    "assistant.amira.type": "Assistant B2C",
    "assistant.amira.description": "Axée sur le support client et l'excellence du service client",
    "assistant.amira.features.customerSupport": "Support client",
    "assistant.amira.features.productInformation": "Informations produit",
    "assistant.amira.features.orderAssistance": "Assistance commande",
    "assistant.amira.features.accountManagement": "Gestion de compte",
    "assistant.amira.features.billingInquiries": "Demandes de facturation",
    "assistant.amira.features.generalHelp": "Aide générale",

    "assistant.gender.male": "Homme",
    "assistant.gender.female": "Femme",

    // Comparison Section
    "comparison.enterpriseSolutions": "Solutions de niveau entreprise",
    "comparison.technicalIntegrations": "Intégrations techniques",
    "comparison.businessProcessOptimization": "Optimisation des processus métier",
    "comparison.corporateAccountManagement": "Gestion de compte d'entreprise",
    "comparison.personalCustomerSupport": "Support client personnel",
    "comparison.productRecommendations": "Recommandations de produits",
    "comparison.orderBillingAssistance": "Assistance commande et facturation",
    "comparison.generalConsumerInquiries": "Demandes générales des consommateurs",

    // Assistant Chat
    "chat.backToSelection": "Retour à la sélection",
    "chat.selectLanguage": "Sélectionner la langue",
    "chat.limitedBrowser": "Support de navigateur limité",
    "chat.speechNotSupported": "La reconnaissance vocale n'est pas prise en charge dans ce navigateur. Veuillez utiliser Chrome, Edge ou Safari pour une meilleure expérience.",
    "chat.youSaid": "Vous avez dit :",
    "chat.response": "Réponse :",
    "chat.conversationHistory": "Historique des conversations",
    "chat.clearHistory": "Effacer l'historique",
    "chat.specializations": "Spécialisations",
    "chat.playing": "En cours de lecture...",
    "chat.replayResponse": "Rejouer la réponse",
    "chat.interrupted": "Interrompu",
    "chat.speechStopped": "Parole arrêtée. Vous pouvez parler maintenant !",
    "chat.conversationCleared": "Conversation effacée",
    "chat.historyReset": "Votre historique de conversation a été réinitialisé.",

    // Status messages
    "status.listening": "J'écoute...",
    "status.thinking": "réfléchit...",
    "status.speaking": "parle...",
    "status.ready": "Prêt pour votre prochaine question !",
    "status.clickToStart": "Cliquez sur le bouton pour commencer à parler",
    "status.rememberConversation": "(Je me souviens de notre conversation)",
    "status.clickToStop": "(cliquez pour arrêter)",
    "status.clickToInterrupt": "(cliquez pour interrompre quand je commence à parler)",
    "status.clickAnywhere": "(cliquez n'importe où sur moi pour interrompre)",

    // Home Page
    "home.title": "Assistant Vocal IA d'Ooredoo",
    "home.subtitle": "Découvrez un support client intelligent avec nos assistants IA vocaux multilingues",
    "home.languageSupport": "Anglais • Français • العربية",
    "home.existingUsers": "Utilisateurs existants",
    "home.existingUsersDescription": "Accédez à votre historique de conversations et à une expérience personnalisée",
    "home.loginButton": "Connectez-vous à votre compte",
    "home.newUsers": "Nouveaux utilisateurs",
    "home.newUsersDescription": "Créez un compte pour sauvegarder vos conversations et préférences",
    "home.registerButton": "Créer un nouveau compte",
    "home.quickAccess": "Accès rapide",
    "home.quickAccessDescription": "Essayez nos assistants IA sans créer de compte",
    "home.continueAsGuest": "Continuer en tant qu'invité",
    "home.demoAccount": "Compte de démonstration disponible",
    "home.demoEmail": "Email : admin@ooredoo.com",
    "home.demoPassword": "Mot de passe : admin123",
    "home.featureVoiceInteraction": "Interaction vocale",
    "home.featureVoiceDescription": "Conversations vocales naturelles avec l'IA",
    "home.featureMultilingual": "Support multilingue",
    "home.featureMultilingualDescription": "Disponible en anglais, français et arabe",
    "home.featureSecure": "Sécurisé et privé",
    "home.featureSecureDescription": "Vos conversations sont protégées",
    "home.loading": "Chargement...",

    // Login Page
    "login.title": "Se connecter",
    "login.subtitle": "Entrez vos identifiants pour accéder à votre compte",
    "login.emailLabel": "Adresse e-mail",
    "login.emailPlaceholder": "Entrez votre e-mail",
    "login.passwordLabel": "Mot de passe",
    "login.passwordPlaceholder": "Entrez votre mot de passe",
    "login.button": "Se connecter",
    "login.loggingIn": "Connexion en cours...",
    "login.noAccount": "Vous n'avez pas de compte ?",
    "login.registerLink": "S'inscrire",
    "login.continueAsGuest": "Continuer en tant qu'invité",
    "login.demoAccount": "Compte de démonstration",
    "login.demoEmail": "Email : admin@ooredoo.com",
    "login.demoPassword": "Mot de passe : admin123",
    "login.successTitle": "Connexion réussie",
    "login.successDescription": "Bienvenue, {name} !",
    "login.failedTitle": "Échec de la connexion",
    "login.failedDescription": "Veuillez vérifier vos identifiants et réessayer.",

    // Register Page
    "register.title": "Créer votre compte",
    "register.subtitle": "Rejoignez l'Assistant IA d'Ooredoo",
    "register.fullNameLabel": "Nom complet (facultatif)",
    "register.fullNamePlaceholder": "Jean Dupont",
    "register.emailLabel": "Email *",
    "register.emailPlaceholder": "vous@exemple.com",
    "register.passwordLabel": "Mot de passe * (minimum 6 caractères)",
    "register.passwordPlaceholder": "Entrez votre mot de passe",
    "register.confirmPasswordLabel": "Confirmer le mot de passe *",
    "register.confirmPasswordPlaceholder": "Confirmez votre mot de passe",
    "register.button": "S'inscrire",
    "register.creatingAccount": "Création du compte...",
    "register.passwordMismatchTitle": "Non-concordance des mots de passe",
    "register.passwordMismatchDescription": "Les mots de passe ne correspondent pas.",
    "register.weakPasswordTitle": "Mot de passe faible",
    "register.weakPasswordDescription": "Le mot de passe doit comporter au moins 6 caractères.",
    "register.successTitle": "Inscription réussie",
    "register.successDescription": "Votre compte a été créé. Veuillez vous connecter.",
    "register.failedTitle": "Échec de l'inscription",
    "register.failedDescription": "Veuillez réessayer avec des identifiants différents.",
    "register.alreadyHaveAccount": "Vous avez déjà un compte ?",
    "register.loginLink": "Connectez-vous ici",

    // Auth Pages
    "auth.forgotPassword": "Mot de passe oublié ?",
    "auth.resetPassword": "Réinitialiser le mot de passe",
    "auth.enterResetCode": "Entrez le code de réinitialisation",
    "auth.setNewPassword": "Définir un nouveau mot de passe",
    "auth.resetCodeSent": "Code de réinitialisation envoyé",
    "auth.resetComplete": "Réinitialisation du mot de passe terminée",
    "auth.passwordReset": "Votre mot de passe a été mis à jour avec succès",
    "auth.redirecting": "Redirection vers la connexion...",
    "auth.chooseResetMethod": "Choisissez comment vous souhaitez réinitialiser votre mot de passe",
    "auth.phone": "Téléphone",
    "auth.email": "E-mail",
    "auth.phoneNumber": "Numéro de téléphone",
    "auth.emailAddress": "Adresse e-mail",
    "auth.sendResetCode": "Envoyer le code de réinitialisation",
    "auth.verificationCode": "Code de vérification",
    "auth.enterCode": "Entrez le code à 6 chiffres",
    "auth.resendCode": "Renvoyer le code",
    "auth.newPassword": "Nouveau mot de passe",
    "auth.confirmPassword": "Confirmer le nouveau mot de passe",
    "auth.back": "Retour",

    // Common UI elements
    "common.back": "Retour",
    "common.logout": "Déconnexion",
    "common.login": "Connexion",
    "common.signUp": "S'inscrire",
    "common.or": "Ou",
    "common.refresh": "Actualiser",
    "common.loading": "Chargement",
    "common.error": "Erreur",
    "common.success": "Succès",
    "common.cancel": "Annuler",
    "common.confirm": "Confirmer",
    "common.yes": "Oui",
    "common.no": "Non",

    // Error Messages
    "error.connectionFailed": "Erreur de connexion",
    "error.serverDisconnected": "Serveur déconnecté",
    "error.networkError": "Erreur réseau",
    "error.loadingFailed": "Échec du chargement",
    "error.processingFailed": "Échec du traitement",
    "error.playbackFailed": "Erreur de lecture",
    "error.loginRequired": "Connexion Requise",
    "error.loginRequiredDescription": "Veuillez vous connecter pour voir vos conversations",
    "error.failedToLoadData": "Échec du chargement de vos données de conversation",
    "error.failedToLoadMessages": "Échec du chargement des messages de conversation"
  },

  "ar-SA": {
    // Navigation
    "nav.dashboard": "لوحة القيادة",
    "nav.assistant": "المساعد",
    "nav.voiceAssistant": "المساعد الصوتي",
    "nav.backToAssistant": "العودة إلى المساعد",
    "nav.viewProfile": "عرض الملف الشخصي",
    "nav.myConversations": "محادثاتي",
    "nav.adminDashboard": "لوحة تحكم المشرف",

    // Dashboard
    "dashboard.title": "لوحة قيادة المساعد الصوتي بالذكاء الاصطناعي",
    "dashboard.subtitle": "مراقبة وإدارة مساعدك الصوتي بالذكاء الاصطناعي",
    "dashboard.totalConversations": "إجمالي المحادثات",
    "dashboard.todayConversations": "محادثات اليوم",
    "dashboard.avgResponseTime": "متوسط وقت الاستجابة",
    "dashboard.successRate": "معدل النجاح",
    "dashboard.recentConversations": "المحادثات الأخيرة",
    "dashboard.noConversations": "لا توجد محادثات بعد",
    "dashboard.export": "تصدير",
    "dashboard.clear": "مسح",
    "dashboard.systemStatus": "حالة النظام",
    "dashboard.quickActions": "إجراءات سريعة",
    "dashboard.refreshStats": "تحديث الإحصائيات",
    "dashboard.downloadReport": "تنزيل التقرير",
    "dashboard.systemSettings": "إعدادات النظام",
    "dashboard.usageTips": "نصائح الاستخدام",
    "dashboard.totalUsers": "إجمالي المستخدمين",
    "dashboard.totalSessions": "إجمالي الجلسات",
    "dashboard.activeDays": "الأيام النشطة",
    "dashboard.audioRecordings": "التسجيلات الصوتية",
    "dashboard.adminTitle": "لوحة تحكم المشرف",
    "dashboard.adminSubtitle": "نظرة عامة كاملة على نظام المساعد الذكي",
    "dashboard.searchPlaceholder": "البحث في المحادثات...",
    "dashboard.showingConversations": "عرض {filtered} من أصل {total} محادثة",
    "dashboard.noConversationsFound": "لم يتم العثور على محادثات",
    "dashboard.timestamp": "الطابع الزمني",
    "dashboard.user": "المستخدم",
    "dashboard.userMessage": "رسالة المستخدم",
    "dashboard.aiResponse": "رد الذكاء الاصطناعي",
    "dashboard.language": "اللغة",
    "dashboard.audio": "الصوت",
    "dashboard.guest": "ضيف",
    "dashboard.noEmail": "لا يوجد بريد إلكتروني",
    "dashboard.noAudio": "لا يوجد صوت",
    "dashboard.play": "تشغيل",
    "dashboard.playing": "جاري التشغيل",
    "dashboard.accessDenied": "تم رفض الوصول",
    "dashboard.adminAccessRequired": "يتطلب وصول المشرف",
    "dashboard.errorLoading": "خطأ",
    "dashboard.failedToLoad": "فشل في تحميل بيانات لوحة القيادة",
    "dashboard.playbackError": "خطأ في التشغيل",
    "dashboard.couldNotPlayAudio": "تعذر تشغيل التسجيل الصوتي",
    "dashboard.conversationsCleared": "تم مسح المحادثات",
    "dashboard.allConversationsRemoved": "تم إزالة جميع سجلات المحادثات",
    "dashboard.confirmClear": "هل أنت متأكد من أنك تريد مسح جميع المحادثات؟ لا يمكن التراجع عن هذا الإجراء.",

    // User Dashboard specific keys
    "dashboard.myVoiceConversations": "محادثاتي الصوتية",
    "dashboard.welcomeBack": "مرحباً بعودتك",
    "dashboard.loadingConversations": "جاري تحميل محادثاتك...",
    "dashboard.stop": "إيقاف",
    "dashboard.totalMessages": "إجمالي الرسائل",
    "dashboard.userAndAiAudio": "صوت المستخدم + الذكاء الاصطناعي",
    "dashboard.never": "أبداً",
    "dashboard.voiceConversationSessions": "جلسات المحادثة الصوتية",
    "dashboard.noVoiceConversations": "لا توجد محادثات صوتية بعد",
    "dashboard.startTalkingToSeeHistory": "ابدأ الحديث مع مساعدك الذكي لرؤية سجل محادثاتك الصوتية هنا.",
    "dashboard.startVoiceConversation": "بدء محادثة صوتية",
    "dashboard.voiceSession": "جلسة صوتية",
    "dashboard.firstMessage": "الرسالة الأولى",
    "dashboard.session": "الجلسة",
    "dashboard.viewDetails": "عرض التفاصيل",
    "dashboard.voiceConversationSessionDetails": "تفاصيل جلسة المحادثة الصوتية",
    "dashboard.sessionId": "معرف الجلسة",
    "dashboard.total": "إجمالي",
    "dashboard.ai": "ذكاء اصطناعي",
    "dashboard.sessionType": "نوع الجلسة",
    "dashboard.voiceConversation": "محادثة صوتية",
    "dashboard.conversationMessages": "رسائل المحادثة",
    "dashboard.you": "أنت",
    "dashboard.downloadAudio": "تنزيل الصوت",
    "dashboard.voiceMessageRecorded": "تم تسجيل رسالة صوتية",
    "dashboard.playAi": "تشغيل الذكاء الاصطناعي",
    "dashboard.downloadAiAudio": "تنزيل صوت الذكاء الاصطناعي",
    "dashboard.aiAudioAvailable": "صوت الذكاء الاصطناعي متاح",
    "dashboard.lastActivity": "آخر نشاط",

    // Admin Dashboard
    "admin.dashboard.title": "لوحة تحكم المشرف",
    "admin.dashboard.subtitle": "تحليلات وإدارة جلسات المساعد الصوتي بالذكاء الاصطناعي",
    "admin.dashboard.totalUsers": "إجمالي المستخدمين",
    "admin.dashboard.sessions": "الجلسات",
    "admin.dashboard.messages": "الرسائل",
    "admin.dashboard.totalAudio": "إجمالي الصوت",
    "admin.dashboard.userAudio": "صوت المستخدم",
    "admin.dashboard.aiAudio": "صوت الذكاء الاصطناعي",
    "admin.dashboard.searchPlaceholder": "البحث في الجلسات بواسطة المستخدم أو الرسالة أو البريد الإلكتروني...",
    "admin.dashboard.refresh": "تحديث",
    "admin.dashboard.exportCSV": "تصدير CSV",
    "admin.dashboard.showingSessions": "عرض {count} جلسة",
    "admin.dashboard.sessionId": "معرف الجلسة",
    "admin.dashboard.user": "المستخدم",
    "admin.dashboard.messagesCount": "الرسائل",
    "admin.dashboard.audioFiles": "ملفات صوتية",
    "admin.dashboard.firstMessage": "الرسالة الأولى",
    "admin.dashboard.lastActivity": "آخر نشاط",
    "admin.dashboard.actions": "الإجراءات",
    "admin.dashboard.view": "عرض",
    "admin.dashboard.noSessions": "لم يتم العثور على جلسات محادثة",
    "admin.dashboard.sessionDetails": "تفاصيل جلسة المحادثة الصوتية",
    "admin.dashboard.sessionInfo": "معلومات الجلسة",
    "admin.dashboard.totalMessages": "إجمالي الرسائل",
    "admin.dashboard.audioRecordings": "التسجيلات الصوتية",
    "admin.dashboard.conversationMessages": "رسائل المحادثة",
    "admin.dashboard.userMessage": "رسالة المستخدم",
    "admin.dashboard.aiResponse": "رد المساعد الذكي",
    "admin.dashboard.play": "تشغيل",
    "admin.dashboard.stop": "إيقاف",
    "admin.dashboard.download": "تنزيل",
    "admin.dashboard.playing": "جاري التشغيل",

    // Profile Page
    "profile.title": "ملفي الشخصي",
    "profile.backButton": "عودة",
    "profile.editProfile": "تحرير الملف الشخصي",
    "profile.profileInfo": "معلومات الملف الشخصي",
    "profile.cancel": "إلغاء",
    "profile.saveChanges": "حفظ التغييرات",
    "profile.saving": "جاري الحفظ...",
    "profile.fullName": "الاسم الكامل",
    "profile.emailAddress": "عنوان البريد الإلكتروني",
    "profile.phoneNumber": "رقم الهاتف",
    "profile.accountType": "نوع الحساب",
    "profile.memberSince": "عضو منذ",
    "profile.lastLogin": "آخر تسجيل دخول",
    "profile.notProvided": "غير مقدم",
    "profile.emailNotVerified": "البريد الإلكتروني غير مؤكد",
    "profile.phoneNotVerified": "الهاتف غير مؤكد",
    "profile.profileUpdated": "تم تحديث الملف الشخصي",
    "profile.profileUpdateSuccess": "تم تحديث ملفك الشخصي بنجاح",
    "profile.avatarUpdated": "تم تحديث الصورة الرمزية",
    "profile.avatarUpdateSuccess": "تم تحديث صورة ملفك الشخصي",
    "profile.invalidFile": "ملف غير صالح",
    "profile.selectImage": "الرجاء تحديد ملف صورة",
    "profile.fileTooLarge": "الملف كبير جداً",
    "profile.fileSizeLimit": "الرجاء تحديد صورة أصغر من 5 ميجابايت",
    "profile.uploadFailed": "فشل التحميل",
    "profile.failedToUpload": "فشل في تحميل الصورة الرمزية",
    "profile.loadingProfile": "جاري تحميل الملف الشخصي...",
    "profile.failedToLoadProfile": "فشل في تحميل الملف الشخصي",
    "profile.goToLogin": "الذهاب إلى تسجيل الدخول",

    // Voice Assistant
    "voice.sessionId": "الجلسة",
    "voice.messages": "رسائل",
    "voice.playing": "جاري التشغيل",
    "voice.newConversation": "محادثة جديدة",
    "voice.autoMode": "الوضع التلقائي",
    "voice.startRecording": "بدء التسجيل",
    "voice.stopRecording": "إيقاف التسجيل",
    "voice.playResponse": "تشغيل الرد",
    "voice.stopAudio": "إيقاف الصوت",
    "voice.conversation": "المحادثة",
    "voice.startConversation": "بدء محادثة",
    "voice.messagesWillAppear": "ستظهر رسائلك هنا",
    "voice.currentInteraction": "التفاعل الحالي",
    "voice.ready": "جاهز للرسالة التالية",
    "voice.readyForNext": "جاهز لبدء المحادثة",
    "voice.newConversationStarted": "تم بدء محادثة جديدة",
    "voice.previousConversationCleared": "تم مسح سجل المحادثة السابقة",
    "voice.listening": "أستمع...",
    "voice.thinking": "أفكر...",
    "voice.speaking": "أتحدث...",
    "voice.realTimeTTS": "تحويل النص إلى كلام في الوقت الفعلي",

    // Assistant Selection
    "selection.title": "اختر مساعدك بالذكاء الاصطناعي",
    "selection.subtitle": "اختر المساعد الذي يناسب احتياجاتك. كل مساعد متخصص ليوفر لك الدعم الأكثر صلة.",
    "selection.startChat": "بدء الدردشة مع",
    "selection.whichAssistant": "أي مساعد هو الأنسب لك؟",
    "selection.chooseSlahB2B": "اختر صلاح لـ B2B",
    "selection.chooseAmiraB2C": "اختر أميرة لـ B2C",
    "selection.connecting": "جاري الاتصال بـ",
    "selection.pleaseWait": "الرجاء الانتظار بينما نقوم بإعداد مساعدك",

    // Assistant Cards
    "assistant.slah.type": "مساعد B2B",
    "assistant.slah.description": "متخصص في حلول الأعمال التجارية ودعم الشركات",
    "assistant.slah.features.enterprise": "حلول المؤسسات",
    "assistant.slah.features.integration": "التكامل التقني",
    "assistant.slah.features.analytics": "تحليلات الأعمال",
    "assistant.slah.features.documentation": "وثائق API",
    "assistant.slah.features.architecture": "هندسة النظم",
    "assistant.slah.features.corporateSupport": "دعم الشركات",

    "assistant.amira.type": "مساعد B2C",
    "assistant.amira.description": "يركز على دعم المستهلكين وتميز خدمة العملاء",
    "assistant.amira.features.customerSupport": "دعم العملاء",
    "assistant.amira.features.productInformation": "معلومات المنتج",
    "assistant.amira.features.orderAssistance": "مساعدة الطلبات",
    "assistant.amira.features.accountManagement": "إدارة الحساب",
    "assistant.amira.features.billingInquiries": "استفسارات الفواتير",
    "assistant.amira.features.generalHelp": "مساعدة عامة",

    "assistant.gender.male": "ذكر",
    "assistant.gender.female": "أنثى",

    // Comparison Section
    "comparison.enterpriseSolutions": "حلول على مستوى المؤسسة",
    "comparison.technicalIntegrations": "تكاملات تقنية",
    "comparison.businessProcessOptimization": "تحسين عمليات الأعمال",
    "comparison.corporateAccountManagement": "إدارة حسابات الشركات",
    "comparison.personalCustomerSupport": "دعم العملاء الشخصي",
    "comparison.productRecommendations": "توصيات المنتج",
    "comparison.orderBillingAssistance": "مساعدة الطلبات والفواتير",
    "comparison.generalConsumerInquiries": "استفسارات المستهلكين العامة",

    // Assistant Chat
    "chat.backToSelection": "العودة إلى الاختيار",
    "chat.selectLanguage": "اختر اللغة",
    "chat.limitedBrowser": "دعم متصفح محدود",
    "chat.speechNotSupported": "التعرف على الكلام غير مدعوم في هذا المتصفح. يرجى استخدام Chrome أو Edge أو Safari للحصول على أفضل تجربة.",
    "chat.youSaid": "قلت:",
    "chat.response": "الرد:",
    "chat.conversationHistory": "سجل المحادثات",
    "chat.clearHistory": "مسح السجل",
    "chat.specializations": "التخصصات",
    "chat.playing": "جاري التشغيل...",
    "chat.replayResponse": "إعادة تشغيل الرد",
    "chat.interrupted": "تمت المقاطعة",
    "chat.speechStopped": "توقف الكلام. يمكنك التحدث الآن!",
    "chat.conversationCleared": "تم مسح المحادثة",
    "chat.historyReset": "تمت إعادة تعيين سجل محادثاتك.",

    // Status messages
    "status.listening": "أنا أستمع...",
    "status.thinking": "يفكر...",
    "status.speaking": "يتحدث...",
    "status.ready": "جاهز لسؤالك التالي!",
    "status.clickToStart": "انقر على الزر لبدء التحدث",
    "status.rememberConversation": "(أتذكر محادثتنا)",
    "status.clickToStop": "(انقر للإيقاف)",
    "status.clickToInterrupt": "(انقر للمقاطعة عندما أبدأ في التحدث)",
    "status.clickAnywhere": "(انقر في أي مكان عليّ للمقاطعة)",

    // Home Page
    "home.title": "مساعد أوريدو الصوتي بالذكاء الاصطناعي",
    "home.subtitle": "استمتع بدعم عملاء ذكي مع مساعدينا الصوتيين متعددي اللغات المدعومين بالذكاء الاصطناعي",
    "home.languageSupport": "الإنجليزية • الفرنسية • العربية",
    "home.existingUsers": "المستخدمون الحاليون",
    "home.existingUsersDescription": "الوصول إلى سجل محادثاتك وتجربة مخصصة",
    "home.loginButton": "تسجيل الدخول إلى حسابك",
    "home.newUsers": "مستخدمون جدد",
    "home.newUsersDescription": "إنشاء حساب لحفظ محادثاتك وتفضيلاتك",
    "home.registerButton": "إنشاء حساب جديد",
    "home.quickAccess": "الوصول السريع",
    "home.quickAccessDescription": "جرب مساعدينا بالذكاء الاصطناعي دون إنشاء حساب",
    "home.continueAsGuest": "الاستمرار كضيف",
    "home.demoAccount": "حساب تجريبي متاح",
    "home.demoEmail": "البريد الإلكتروني: admin@ooredoo.com",
    "home.demoPassword": "كلمة المرور: admin123",
    "home.featureVoiceInteraction": "التفاعل الصوتي",
    "home.featureVoiceDescription": "محادثات صوتية طبيعية مع الذكاء الاصطناعي",
    "home.featureMultilingual": "دعم متعدد اللغات",
    "home.featureMultilingualDescription": "متوفر بالإنجليزية والفرنسية والعربية",
    "home.featureSecure": "آمن وخاص",
    "home.featureSecureDescription": "محادثاتك محمية",
    "home.loading": "جاري التحميل...",

    // Login Page
    "login.title": "تسجيل الدخول",
    "login.subtitle": "أدخل بياناتك للوصول إلى حسابك",
    "login.emailLabel": "عنوان البريد الإلكتروني",
    "login.emailPlaceholder": "أدخل بريدك الإلكتروني",
    "login.passwordLabel": "كلمة المرور",
    "login.passwordPlaceholder": "أدخل كلمة المرور",
    "login.button": "تسجيل الدخول",
    "login.loggingIn": "جاري تسجيل الدخول...",
    "login.noAccount": "ليس لديك حساب؟",
    "login.registerLink": "إنشاء حساب",
    "login.continueAsGuest": "الاستمرار كضيف",
    "login.demoAccount": "حساب تجريبي",
    "login.demoEmail": "البريد الإلكتروني: admin@ooredoo.com",
    "login.demoPassword": "كلمة المرور: admin123",
    "login.successTitle": "تسجيل الدخول ناجح",
    "login.successDescription": "مرحبًا بعودتك، {name}!",
    "login.failedTitle": "فشل تسجيل الدخول",
    "login.failedDescription": "يرجى التحقق من بياناتك ومحاولة مرة أخرى.",

    // Register Page
    "register.title": "إنشاء حسابك",
    "register.subtitle": "انضم إلى مساعد أوريدو بالذكاء الاصطناعي",
    "register.fullNameLabel": "الاسم الكامل (اختياري)",
    "register.fullNamePlaceholder": "أحمد محمد",
    "register.emailLabel": "البريد الإلكتروني *",
    "register.emailPlaceholder": "you@example.com",
    "register.passwordLabel": "كلمة المرور * (6 أحرف على الأقل)",
    "register.passwordPlaceholder": "أدخل كلمة المرور",
    "register.confirmPasswordLabel": "تأكيد كلمة المرور *",
    "register.confirmPasswordPlaceholder": "أكد كلمة المرور",
    "register.button": "تسجيل",
    "register.creatingAccount": "جاري إنشاء الحساب...",
    "register.passwordMismatchTitle": "عدم تطابق كلمة المرور",
    "register.passwordMismatchDescription": "كلمات المرور غير متطابقة.",
    "register.weakPasswordTitle": "كلمة مرور ضعيفة",
    "register.weakPasswordDescription": "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
    "register.successTitle": "تسجيل ناجح",
    "register.successDescription": "تم إنشاء حسابك. يرجى تسجيل الدخول.",
    "register.failedTitle": "فشل التسجيل",
    "register.failedDescription": "يرجى المحاولة مرة أخرى ببيانات مختلفة.",
    "register.alreadyHaveAccount": "هل لديك حساب بالفعل؟",
    "register.loginLink": "تسجيل الدخول هنا",

    // Auth Pages
    "auth.forgotPassword": "نسيت كلمة المرور؟",
    "auth.resetPassword": "إعادة تعيين كلمة المرور",
    "auth.enterResetCode": "أدخل رمز الإعادة التعيين",
    "auth.setNewPassword": "تعيين كلمة مرور جديدة",
    "auth.resetCodeSent": "تم إرسال رمز إعادة التعيين",
    "auth.resetComplete": "تمت إعادة تعيين كلمة المرور",
    "auth.passwordReset": "تم تحديث كلمة المرور بنجاح",
    "auth.redirecting": "جاري التوجيه إلى تسجيل الدخول...",
    "auth.chooseResetMethod": "اختر كيفية إعادة تعيين كلمة المرور",
    "auth.phone": "الهاتف",
    "auth.email": "البريد الإلكتروني",
    "auth.phoneNumber": "رقم الهاتف",
    "auth.emailAddress": "عنوان البريد الإلكتروني",
    "auth.sendResetCode": "إرسال رمز الإعادة التعيين",
    "auth.verificationCode": "رمز التحقق",
    "auth.enterCode": "أدخل الرمز المكون من 6 أرقام",
    "auth.resendCode": "إعادة إرسال الرمز",
    "auth.newPassword": "كلمة المرور الجديدة",
    "auth.confirmPassword": "تأكيد كلمة المرور الجديدة",
    "auth.back": "عودة",

    // Common UI elements
    "common.back": "عودة",
    "common.logout": "تسجيل الخروج",
    "common.login": "تسجيل الدخول",
    "common.signUp": "إنشاء حساب",
    "common.or": "أو",
    "common.refresh": "تحديث",
    "common.loading": "جاري التحميل",
    "common.error": "خطأ",
    "common.success": "نجح",
    "common.cancel": "إلغاء",
    "common.confirm": "تأكيد",
    "common.yes": "نعم",
    "common.no": "لا",

    // Error Messages
    "error.connectionFailed": "خطأ في الاتصال",
    "error.serverDisconnected": "انقطع الاتصال بالخادم",
    "error.networkError": "خطأ في الشبكة",
    "error.loadingFailed": "فشل في التحميل",
    "error.processingFailed": "فشل في المعالجة",
    "error.playbackFailed": "خطأ في التشغيل",
    "error.loginRequired": "مطلوب تسجيل الدخول",
    "error.loginRequiredDescription": "يرجى تسجيل الدخول لعرض محادثاتك",
    "error.failedToLoadData": "فشل في تحميل بيانات محادثاتك",
    "error.failedToLoadMessages": "فشل في تحميل رسائل المحادثة"
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en-US")
  const isRTL = language === "ar-SA"

  // Load saved language preference
  useEffect(() => {
    const saved = localStorage.getItem("preferred-language") as Language
    if (saved && ["en-US", "fr-FR", "ar-SA"].includes(saved)) {
      setLanguage(saved)
    }
  }, [])

  // Update HTML lang and dir attributes
  useEffect(() => {
    const htmlElement = document.documentElement
    htmlElement.lang = language
    htmlElement.dir = isRTL ? "rtl" : "ltr"

    if (isRTL) {
      document.body.classList.add("rtl")
      document.body.classList.remove("ltr")
    } else {
      document.body.classList.add("ltr")
      document.body.classList.remove("rtl")
    }
  }, [language, isRTL])

  // Save language preference
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("preferred-language", lang)
  }

  // Translation function with proper type safety
  const t = (key: string): string => {
    const langTranslations = translations[language]
    if (langTranslations && key in langTranslations) {
      return langTranslations[key as keyof TranslationKeys]
    }
    
    // Fallback to English
    const englishTranslations = translations["en-US"]
    if (englishTranslations && key in englishTranslations) {
      return englishTranslations[key as keyof TranslationKeys]
    }
    
    // Final fallback to the key itself
    return key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

// "use client"

// import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// type Language = "en-US" | "fr-FR" | "ar-SA"

// interface LanguageContextType {
//   language: Language
//   setLanguage: (lang: Language) => void
//   isRTL: boolean
//   t: (key: string) => string
// }

// const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// // Define the translation type structure
// type TranslationKeys = {
//   // Navigation
//   "nav.dashboard": string
//   "nav.assistant": string
//   "nav.voiceAssistant": string

//   // Dashboard
//   "dashboard.title": string
//   "dashboard.subtitle": string
//   "dashboard.totalConversations": string
//   "dashboard.todayConversations": string
//   "dashboard.avgResponseTime": string
//   "dashboard.successRate": string
//   "dashboard.recentConversations": string
//   "dashboard.noConversations": string
//   "dashboard.export": string
//   "dashboard.clear": string
//   "dashboard.systemStatus": string
//   "dashboard.quickActions": string
//   "dashboard.refreshStats": string
//   "dashboard.downloadReport": string
//   "dashboard.systemSettings": string
//   "dashboard.usageTips": string
//   "dashboard.totalUsers": string
//   "dashboard.totalSessions": string
//   "dashboard.activeDays": string
//   "dashboard.audioRecordings": string
//   "dashboard.adminTitle": string
//   "dashboard.adminSubtitle": string
//   "dashboard.searchPlaceholder": string
//   "dashboard.showingConversations": string
//   "dashboard.noConversationsFound": string
//   "dashboard.timestamp": string
//   "dashboard.user": string
//   "dashboard.userMessage": string
//   "dashboard.aiResponse": string
//   "dashboard.language": string
//   "dashboard.audio": string
//   "dashboard.guest": string
//   "dashboard.noEmail": string
//   "dashboard.noAudio": string
//   "dashboard.play": string
//   "dashboard.playing": string
//   "dashboard.accessDenied": string
//   "dashboard.adminAccessRequired": string
//   "dashboard.errorLoading": string
//   "dashboard.failedToLoad": string
//   "dashboard.playbackError": string
//   "dashboard.couldNotPlayAudio": string
//   "dashboard.conversationsCleared": string
//   "dashboard.allConversationsRemoved": string
//   "dashboard.confirmClear": string

//   // Assistant Selection
//   "selection.title": string
//   "selection.subtitle": string
//   "selection.startChat": string
//   "selection.whichAssistant": string
//   "selection.chooseSlahB2B": string
//   "selection.chooseAmiraB2C": string
//   "selection.connecting": string
//   "selection.pleaseWait": string

//   // Assistant Cards
//   "assistant.slah.type": string
//   "assistant.slah.description": string
//   "assistant.slah.features.enterprise": string
//   "assistant.slah.features.integration": string
//   "assistant.slah.features.analytics": string
//   "assistant.slah.features.documentation": string
//   "assistant.slah.features.architecture": string
//   "assistant.slah.features.corporateSupport": string

//   "assistant.amira.type": string
//   "assistant.amira.description": string
//   "assistant.amira.features.customerSupport": string
//   "assistant.amira.features.productInformation": string
//   "assistant.amira.features.orderAssistance": string
//   "assistant.amira.features.accountManagement": string
//   "assistant.amira.features.billingInquiries": string
//   "assistant.amira.features.generalHelp": string

//   "assistant.gender.male": string
//   "assistant.gender.female": string

//   // Comparison Section
//   "comparison.enterpriseSolutions": string
//   "comparison.technicalIntegrations": string
//   "comparison.businessProcessOptimization": string
//   "comparison.corporateAccountManagement": string
//   "comparison.personalCustomerSupport": string
//   "comparison.productRecommendations": string
//   "comparison.orderBillingAssistance": string
//   "comparison.generalConsumerInquiries": string

//   // Assistant Chat
//   "chat.backToSelection": string
//   "chat.selectLanguage": string
//   "chat.limitedBrowser": string
//   "chat.speechNotSupported": string
//   "chat.youSaid": string
//   "chat.response": string
//   "chat.conversationHistory": string
//   "chat.clearHistory": string
//   "chat.specializations": string
//   "chat.playing": string
//   "chat.replayResponse": string
//   "chat.interrupted": string
//   "chat.speechStopped": string
//   "chat.conversationCleared": string
//   "chat.historyReset": string

//   // Status messages
//   "status.listening": string
//   "status.thinking": string
//   "status.speaking": string
//   "status.ready": string
//   "status.clickToStart": string
//   "status.rememberConversation": string
//   "status.clickToStop": string
//   "status.clickToInterrupt": string
//   "status.clickAnywhere": string

//   // Home Page
//   "home.title": string
//   "home.subtitle": string
//   "home.languageSupport": string
//   "home.existingUsers": string
//   "home.existingUsersDescription": string
//   "home.loginButton": string
//   "home.newUsers": string
//   "home.newUsersDescription": string
//   "home.registerButton": string
//   "home.quickAccess": string
//   "home.quickAccessDescription": string
//   "home.continueAsGuest": string
//   "home.demoAccount": string
//   "home.demoEmail": string
//   "home.demoPassword": string
//   "home.featureVoiceInteraction": string
//   "home.featureVoiceDescription": string
//   "home.featureMultilingual": string
//   "home.featureMultilingualDescription": string
//   "home.featureSecure": string
//   "home.featureSecureDescription": string
//   "home.loading": string

//   // Login Page
//   "login.title": string
//   "login.subtitle": string
//   "login.emailLabel": string
//   "login.emailPlaceholder": string
//   "login.passwordLabel": string
//   "login.passwordPlaceholder": string
//   "login.button": string
//   "login.loggingIn": string
//   "login.noAccount": string
//   "login.registerLink": string
//   "login.continueAsGuest": string
//   "login.demoAccount": string
//   "login.demoEmail": string
//   "login.demoPassword": string
//   "login.successTitle": string
//   "login.successDescription": string
//   "login.failedTitle": string
//   "login.failedDescription": string

//   // Register Page
//   "register.title": string
//   "register.subtitle": string
//   "register.fullNameLabel": string
//   "register.fullNamePlaceholder": string
//   "register.emailLabel": string
//   "register.emailPlaceholder": string
//   "register.passwordLabel": string
//   "register.passwordPlaceholder": string
//   "register.confirmPasswordLabel": string
//   "register.confirmPasswordPlaceholder": string
//   "register.button": string
//   "register.creatingAccount": string
//   "register.passwordMismatchTitle": string
//   "register.passwordMismatchDescription": string
//   "register.weakPasswordTitle": string
//   "register.weakPasswordDescription": string
//   "register.successTitle": string
//   "register.successDescription": string
//   "register.failedTitle": string
//   "register.failedDescription": string
//   "register.alreadyHaveAccount": string
//   "register.loginLink": string

//   // Common UI elements
//   "common.back": string
//   "common.logout": string
//   "common.login": string
//   "common.signUp": string
//   "common.or": string
//   "common.refresh": string
//   "common.loading": string
//   "common.error": string
//   "common.success": string
//   "common.cancel": string
//   "common.confirm": string
//   "common.yes": string
//   "common.no": string

//   [key: string]: string
// }

// // Translation dictionary with proper typing
// const translations: Record<Language, TranslationKeys> = {
//   "en-US": {
//     // Navigation
//     "nav.dashboard": "Dashboard",
//     "nav.assistant": "Assistant",
//     "nav.voiceAssistant": "Voice Assistant",

//     // Dashboard
//     "dashboard.title": "Voice AI Assistant Dashboard",
//     "dashboard.subtitle": "Monitor and manage your Voice AI Assistant",
//     "dashboard.totalConversations": "Total Conversations",
//     "dashboard.todayConversations": "Today's Conversations",
//     "dashboard.avgResponseTime": "Avg Response Time",
//     "dashboard.successRate": "Success Rate",
//     "dashboard.recentConversations": "Recent Conversations",
//     "dashboard.noConversations": "No conversations yet",
//     "dashboard.export": "Export",
//     "dashboard.clear": "Clear",
//     "dashboard.systemStatus": "System Status",
//     "dashboard.quickActions": "Quick Actions",
//     "dashboard.refreshStats": "Refresh Stats",
//     "dashboard.downloadReport": "Download Report",
//     "dashboard.systemSettings": "System Settings",
//     "dashboard.usageTips": "Usage Tips",
//     "dashboard.totalUsers": "Total Users",
//     "dashboard.totalSessions": "Total Sessions",
//     "dashboard.activeDays": "Active Days",
//     "dashboard.audioRecordings": "Audio Recordings",
//     "dashboard.adminTitle": "Admin Dashboard",
//     "dashboard.adminSubtitle": "Complete overview of your AI Assistant system",
//     "dashboard.searchPlaceholder": "Search conversations...",
//     "dashboard.showingConversations": "Showing {filtered} of {total} conversations",
//     "dashboard.noConversationsFound": "No conversations found",
//     "dashboard.timestamp": "Timestamp",
//     "dashboard.user": "User",
//     "dashboard.userMessage": "User Message",
//     "dashboard.aiResponse": "AI Response",
//     "dashboard.language": "Language",
//     "dashboard.audio": "Audio",
//     "dashboard.guest": "Guest",
//     "dashboard.noEmail": "No email",
//     "dashboard.noAudio": "No audio",
//     "dashboard.play": "Play",
//     "dashboard.playing": "Playing",
//     "dashboard.accessDenied": "Access Denied",
//     "dashboard.adminAccessRequired": "Admin access required",
//     "dashboard.errorLoading": "Error",
//     "dashboard.failedToLoad": "Failed to load dashboard data",
//     "dashboard.playbackError": "Playback Error",
//     "dashboard.couldNotPlayAudio": "Could not play audio recording",
//     "dashboard.conversationsCleared": "Conversations Cleared",
//     "dashboard.allConversationsRemoved": "All conversation logs have been removed",
//     "dashboard.confirmClear": "Are you sure you want to clear all conversations? This cannot be undone.",

//     // Assistant Selection
//     "selection.title": "Choose Your AI Assistant",
//     "selection.subtitle": "Select the assistant that best matches your needs. Each assistant is specialized to provide you with the most relevant support.",
//     "selection.startChat": "Start Chat with",
//     "selection.whichAssistant": "Which Assistant is Right for You?",
//     "selection.chooseSlahB2B": "Choose Slah for B2B",
//     "selection.chooseAmiraB2C": "Choose Amira for B2C",
//     "selection.connecting": "Connecting to",
//     "selection.pleaseWait": "Please wait while we set up your",

//     // Assistant Cards
//     "assistant.slah.type": "B2B Assistant",
//     "assistant.slah.description": "Specialized in business-to-business solutions and enterprise support",
//     "assistant.slah.features.enterprise": "Enterprise Solutions",
//     "assistant.slah.features.integration": "Technical Integration",
//     "assistant.slah.features.analytics": "Business Analytics",
//     "assistant.slah.features.documentation": "API Documentation",
//     "assistant.slah.features.architecture": "System Architecture",
//     "assistant.slah.features.corporateSupport": "Corporate Support",

//     "assistant.amira.type": "B2C Assistant",
//     "assistant.amira.description": "Focused on consumer support and customer service excellence",
//     "assistant.amira.features.customerSupport": "Customer Support",
//     "assistant.amira.features.productInformation": "Product Information",
//     "assistant.amira.features.orderAssistance": "Order Assistance",
//     "assistant.amira.features.accountManagement": "Account Management",
//     "assistant.amira.features.billingInquiries": "Billing Inquiries",
//     "assistant.amira.features.generalHelp": "General Help",

//     "assistant.gender.male": "Male",
//     "assistant.gender.female": "Female",

//     // Comparison Section
//     "comparison.enterpriseSolutions": "Enterprise-level solutions",
//     "comparison.technicalIntegrations": "Technical integrations",
//     "comparison.businessProcessOptimization": "Business process optimization",
//     "comparison.corporateAccountManagement": "Corporate account management",
//     "comparison.personalCustomerSupport": "Personal customer support",
//     "comparison.productRecommendations": "Product recommendations",
//     "comparison.orderBillingAssistance": "Order and billing assistance",
//     "comparison.generalConsumerInquiries": "General consumer inquiries",

//     // Assistant Chat
//     "chat.backToSelection": "Back to Selection",
//     "chat.selectLanguage": "Select Language",
//     "chat.limitedBrowser": "Limited Browser Support",
//     "chat.speechNotSupported": "Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari for the best experience.",
//     "chat.youSaid": "You said:",
//     "chat.response": "Response:",
//     "chat.conversationHistory": "Conversation History",
//     "chat.clearHistory": "Clear History",
//     "chat.specializations": "Specializations",
//     "chat.playing": "Playing...",
//     "chat.replayResponse": "Replay Response",
//     "chat.interrupted": "Interrupted",
//     "chat.speechStopped": "Speech stopped. You can speak now!",
//     "chat.conversationCleared": "Conversation Cleared",
//     "chat.historyReset": "Your conversation history has been reset.",

//     // Status messages
//     "status.listening": "I'm listening...",
//     "status.thinking": "is thinking...",
//     "status.speaking": "is speaking...",
//     "status.ready": "Ready for your next question!",
//     "status.clickToStart": "Click me to start talking",
//     "status.rememberConversation": "(I remember our conversation)",
//     "status.clickToStop": "(click to stop)",
//     "status.clickToInterrupt": "(click to interrupt when I start speaking)",
//     "status.clickAnywhere": "(click anywhere on me to interrupt)",

//     // Home Page
//     "home.title": "Ooredoo AI Voice Assistant",
//     "home.subtitle": "Experience intelligent customer support with our multilingual voice-powered AI assistants",
//     "home.languageSupport": "English • Français • العربية",
//     "home.existingUsers": "Existing Users",
//     "home.existingUsersDescription": "Access your conversation history and personalized experience",
//     "home.loginButton": "Login to Your Account",
//     "home.newUsers": "New Users",
//     "home.newUsersDescription": "Create an account to save your conversations and preferences",
//     "home.registerButton": "Create New Account",
//     "home.quickAccess": "Quick Access",
//     "home.quickAccessDescription": "Try our AI assistants without creating an account",
//     "home.continueAsGuest": "Continue as Guest",
//     "home.demoAccount": "🔐 Demo Account Available",
//     "home.demoEmail": "Email: admin@ooredoo.com",
//     "home.demoPassword": "Password: admin123",
//     "home.featureVoiceInteraction": "Voice Interaction",
//     "home.featureVoiceDescription": "Natural voice conversations with AI",
//     "home.featureMultilingual": "Multilingual Support",
//     "home.featureMultilingualDescription": "Available in English, French, and Arabic",
//     "home.featureSecure": "Secure & Private",
//     "home.featureSecureDescription": "Your conversations are protected",
//     "home.loading": "Loading...",

//     // Login Page
//     "login.title": "Welcome to Ooredoo AI Assistant",
//     "login.subtitle": "Login to access your conversation history",
//     "login.emailLabel": "Email",
//     "login.emailPlaceholder": "you@example.com",
//     "login.passwordLabel": "Password",
//     "login.passwordPlaceholder": "••••••••",
//     "login.button": "Login",
//     "login.loggingIn": "Logging in...",
//     "login.noAccount": "Don't have an account?",
//     "login.registerLink": "Register here",
//     "login.continueAsGuest": "continue as guest",
//     "login.demoAccount": "Demo Account:",
//     "login.demoEmail": "Email: admin@ooredoo.com",
//     "login.demoPassword": "Password: admin123",
//     "login.successTitle": "Login Successful",
//     "login.successDescription": "Welcome back, {name}!",
//     "login.failedTitle": "Login Failed",
//     "login.failedDescription": "Please check your credentials and try again.",

//     // Register Page
//     "register.title": "Create Your Account",
//     "register.subtitle": "Join Ooredoo AI Assistant",
//     "register.fullNameLabel": "Full Name (Optional)",
//     "register.fullNamePlaceholder": "John Doe",
//     "register.emailLabel": "Email *",
//     "register.emailPlaceholder": "you@example.com",
//     "register.passwordLabel": "Password * (min 6 characters)",
//     "register.passwordPlaceholder": "••••••••",
//     "register.confirmPasswordLabel": "Confirm Password *",
//     "register.confirmPasswordPlaceholder": "••••••••",
//     "register.button": "Register",
//     "register.creatingAccount": "Creating Account...",
//     "register.passwordMismatchTitle": "Password Mismatch",
//     "register.passwordMismatchDescription": "Passwords do not match.",
//     "register.weakPasswordTitle": "Weak Password",
//     "register.weakPasswordDescription": "Password must be at least 6 characters long.",
//     "register.successTitle": "Registration Successful",
//     "register.successDescription": "Your account has been created. Please login.",
//     "register.failedTitle": "Registration Failed",
//     "register.failedDescription": "Please try again with different credentials.",
//     "register.alreadyHaveAccount": "Already have an account?",
//     "register.loginLink": "Login here",

//     // Common UI elements
//     "common.back": "Back",
//     "common.logout": "Logout",
//     "common.login": "Login",
//     "common.signUp": "Sign Up",
//     "common.or": "Or",
//     "common.refresh": "Refresh",
//     "common.loading": "Loading",
//     "common.error": "Error",
//     "common.success": "Success",
//     "common.cancel": "Cancel",
//     "common.confirm": "Confirm",
//     "common.yes": "Yes",
//     "common.no": "No"
//   },

//   "fr-FR": {
//     // Navigation
//     "nav.dashboard": "Tableau de bord",
//     "nav.assistant": "Assistant",
//     "nav.voiceAssistant": "Assistant Vocal",

//     // Dashboard
//     "dashboard.title": "Tableau de bord Assistant IA Vocal",
//     "dashboard.subtitle": "Surveillez et gérez votre Assistant IA Vocal",
//     "dashboard.totalConversations": "Conversations totales",
//     "dashboard.todayConversations": "Conversations d'aujourd'hui",
//     "dashboard.avgResponseTime": "Temps de réponse moyen",
//     "dashboard.successRate": "Taux de réussite",
//     "dashboard.recentConversations": "Conversations récentes",
//     "dashboard.noConversations": "Aucune conversation pour le moment",
//     "dashboard.export": "Exporter",
//     "dashboard.clear": "Effacer",
//     "dashboard.systemStatus": "État du système",
//     "dashboard.quickActions": "Actions rapides",
//     "dashboard.refreshStats": "Actualiser les statistiques",
//     "dashboard.downloadReport": "Télécharger le rapport",
//     "dashboard.systemSettings": "Paramètres système",
//     "dashboard.usageTips": "Conseils d'utilisation",
//     "dashboard.totalUsers": "Utilisateurs totaux",
//     "dashboard.totalSessions": "Sessions totales",
//     "dashboard.activeDays": "Jours actifs",
//     "dashboard.audioRecordings": "Enregistrements audio",
//     "dashboard.adminTitle": "Tableau de bord administrateur",
//     "dashboard.adminSubtitle": "Vue d'ensemble complète de votre système d'assistant IA",
//     "dashboard.searchPlaceholder": "Rechercher des conversations...",
//     "dashboard.showingConversations": "Affichage de {filtered} conversations sur {total}",
//     "dashboard.noConversationsFound": "Aucune conversation trouvée",
//     "dashboard.timestamp": "Horodatage",
//     "dashboard.user": "Utilisateur",
//     "dashboard.userMessage": "Message de l'utilisateur",
//     "dashboard.aiResponse": "Réponse de l'IA",
//     "dashboard.language": "Langue",
//     "dashboard.audio": "Audio",
//     "dashboard.guest": "Invité",
//     "dashboard.noEmail": "Aucun e-mail",
//     "dashboard.noAudio": "Aucun audio",
//     "dashboard.play": "Lire",
//     "dashboard.playing": "En lecture",
//     "dashboard.accessDenied": "Accès refusé",
//     "dashboard.adminAccessRequired": "Accès administrateur requis",
//     "dashboard.errorLoading": "Erreur",
//     "dashboard.failedToLoad": "Échec du chargement des données du tableau de bord",
//     "dashboard.playbackError": "Erreur de lecture",
//     "dashboard.couldNotPlayAudio": "Impossible de lire l'enregistrement audio",
//     "dashboard.conversationsCleared": "Conversations supprimées",
//     "dashboard.allConversationsRemoved": "Tous les journaux de conversation ont été supprimés",
//     "dashboard.confirmClear": "Êtes-vous sûr de vouloir supprimer toutes les conversations ? Cette action est irréversible.",

//     // Assistant Selection
//     "selection.title": "Choisissez votre Assistant IA",
//     "selection.subtitle": "Sélectionnez l'assistant qui correspond le mieux à vos besoins. Chaque assistant est spécialisé pour vous fournir le support le plus pertinent.",
//     "selection.startChat": "Commencer le chat avec",
//     "selection.whichAssistant": "Quel assistant vous convient le mieux ?",
//     "selection.chooseSlahB2B": "Choisissez Slah pour B2B",
//     "selection.chooseAmiraB2C": "Choisissez Amira pour B2C",
//     "selection.connecting": "Connexion à",
//     "selection.pleaseWait": "Veuillez patienter pendant que nous configurons votre",

//     // Assistant Cards
//     "assistant.slah.type": "Assistant B2B",
//     "assistant.slah.description": "Spécialisé dans les solutions inter-entreprises et le support d'entreprise",
//     "assistant.slah.features.enterprise": "Solutions d'entreprise",
//     "assistant.slah.features.integration": "Intégration technique",
//     "assistant.slah.features.analytics": "Analyses commerciales",
//     "assistant.slah.features.documentation": "Documentation API",
//     "assistant.slah.features.architecture": "Architecture système",
//     "assistant.slah.features.corporateSupport": "Support d'entreprise",

//     "assistant.amira.type": "Assistant B2C",
//     "assistant.amira.description": "Axée sur le support client et l'excellence du service client",
//     "assistant.amira.features.customerSupport": "Support client",
//     "assistant.amira.features.productInformation": "Informations produit",
//     "assistant.amira.features.orderAssistance": "Assistance commande",
//     "assistant.amira.features.accountManagement": "Gestion de compte",
//     "assistant.amira.features.billingInquiries": "Demandes de facturation",
//     "assistant.amira.features.generalHelp": "Aide générale",

//     "assistant.gender.male": "Homme",
//     "assistant.gender.female": "Femme",

//     // Comparison Section
//     "comparison.enterpriseSolutions": "Solutions de niveau entreprise",
//     "comparison.technicalIntegrations": "Intégrations techniques",
//     "comparison.businessProcessOptimization": "Optimisation des processus métier",
//     "comparison.corporateAccountManagement": "Gestion de compte d'entreprise",
//     "comparison.personalCustomerSupport": "Support client personnel",
//     "comparison.productRecommendations": "Recommandations de produits",
//     "comparison.orderBillingAssistance": "Assistance commande et facturation",
//     "comparison.generalConsumerInquiries": "Demandes générales des consommateurs",

//     // Assistant Chat
//     "chat.backToSelection": "Retour à la sélection",
//     "chat.selectLanguage": "Sélectionner la langue",
//     "chat.limitedBrowser": "Support de navigateur limité",
//     "chat.speechNotSupported": "La reconnaissance vocale n'est pas prise en charge dans ce navigateur. Veuillez utiliser Chrome, Edge ou Safari pour une meilleure expérience.",
//     "chat.youSaid": "Vous avez dit :",
//     "chat.response": "Réponse :",
//     "chat.conversationHistory": "Historique des conversations",
//     "chat.clearHistory": "Effacer l'historique",
//     "chat.specializations": "Spécialisations",
//     "chat.playing": "En cours de lecture...",
//     "chat.replayResponse": "Rejouer la réponse",
//     "chat.interrupted": "Interrompu",
//     "chat.speechStopped": "Parole arrêtée. Vous pouvez parler maintenant !",
//     "chat.conversationCleared": "Conversation effacée",
//     "chat.historyReset": "Votre historique de conversation a été réinitialisé.",

//     // Status messages
//     "status.listening": "J'écoute...",
//     "status.thinking": "réfléchit...",
//     "status.speaking": "parle...",
//     "status.ready": "Prêt pour votre prochaine question !",
//     "status.clickToStart": "Cliquez sur moi pour commencer à parler",
//     "status.rememberConversation": "(Je me souviens de notre conversation)",
//     "status.clickToStop": "(cliquez pour arrêter)",
//     "status.clickToInterrupt": "(cliquez pour interrompre quand je commence à parler)",
//     "status.clickAnywhere": "(cliquez n'importe où sur moi pour interrompre)",

//     // Home Page
//     "home.title": "Assistant Vocal IA d'Ooredoo",
//     "home.subtitle": "Découvrez un support client intelligent avec nos assistants IA vocaux multilingues",
//     "home.languageSupport": "Anglais • Français • العربية",
//     "home.existingUsers": "Utilisateurs existants",
//     "home.existingUsersDescription": "Accédez à votre historique de conversations et à une expérience personnalisée",
//     "home.loginButton": "Connectez-vous à votre compte",
//     "home.newUsers": "Nouveaux utilisateurs",
//     "home.newUsersDescription": "Créez un compte pour sauvegarder vos conversations et préférences",
//     "home.registerButton": "Créer un nouveau compte",
//     "home.quickAccess": "Accès rapide",
//     "home.quickAccessDescription": "Essayez nos assistants IA sans créer de compte",
//     "home.continueAsGuest": "Continuer en tant qu'invité",
//     "home.demoAccount": "🔐 Compte de démonstration disponible",
//     "home.demoEmail": "Email : admin@ooredoo.com",
//     "home.demoPassword": "Mot de passe : admin123",
//     "home.featureVoiceInteraction": "Interaction vocale",
//     "home.featureVoiceDescription": "Conversations vocales naturelles avec l'IA",
//     "home.featureMultilingual": "Support multilingue",
//     "home.featureMultilingualDescription": "Disponible en anglais, français et arabe",
//     "home.featureSecure": "Sécurisé et privé",
//     "home.featureSecureDescription": "Vos conversations sont protégées",
//     "home.loading": "Chargement...",

//     // Login Page
//     "login.title": "Bienvenue sur l'Assistant IA d'Ooredoo",
//     "login.subtitle": "Connectez-vous pour accéder à votre historique de conversations",
//     "login.emailLabel": "Email",
//     "login.emailPlaceholder": "vous@exemple.com",
//     "login.passwordLabel": "Mot de passe",
//     "login.passwordPlaceholder": "••••••••",
//     "login.button": "Connexion",
//     "login.loggingIn": "Connexion en cours...",
//     "login.noAccount": "Vous n'avez pas de compte ?",
//     "login.registerLink": "Inscrivez-vous ici",
//     "login.continueAsGuest": "continuer en tant qu'invité",
//     "login.demoAccount": "Compte de démonstration :",
//     "login.demoEmail": "Email : admin@ooredoo.com",
//     "login.demoPassword": "Mot de passe : admin123",
//     "login.successTitle": "Connexion réussie",
//     "login.successDescription": "Bienvenue, {name} !",
//     "login.failedTitle": "Échec de la connexion",
//     "login.failedDescription": "Veuillez vérifier vos identifiants et réessayer.",

//     // Register Page
//     "register.title": "Créer votre compte",
//     "register.subtitle": "Rejoignez l'Assistant IA d'Ooredoo",
//     "register.fullNameLabel": "Nom complet (facultatif)",
//     "register.fullNamePlaceholder": "Jean Dupont",
//     "register.emailLabel": "Email *",
//     "register.emailPlaceholder": "vous@exemple.com",
//     "register.passwordLabel": "Mot de passe * (minimum 6 caractères)",
//     "register.passwordPlaceholder": "••••••••",
//     "register.confirmPasswordLabel": "Confirmer le mot de passe *",
//     "register.confirmPasswordPlaceholder": "••••••••",
//     "register.button": "S'inscrire",
//     "register.creatingAccount": "Création du compte...",
//     "register.passwordMismatchTitle": "Non-concordance des mots de passe",
//     "register.passwordMismatchDescription": "Les mots de passe ne correspondent pas.",
//     "register.weakPasswordTitle": "Mot de passe faible",
//     "register.weakPasswordDescription": "Le mot de passe doit comporter au moins 6 caractères.",
//     "register.successTitle": "Inscription réussie",
//     "register.successDescription": "Votre compte a été créé. Veuillez vous connecter.",
//     "register.failedTitle": "Échec de l'inscription",
//     "register.failedDescription": "Veuillez réessayer avec des identifiants différents.",
//     "register.alreadyHaveAccount": "Vous avez déjà un compte ?",
//     "register.loginLink": "Connectez-vous ici",

//     // Common UI elements
//     "common.back": "Retour",
//     "common.logout": "Déconnexion",
//     "common.login": "Connexion",
//     "common.signUp": "S'inscrire",
//     "common.or": "Ou",
//     "common.refresh": "Actualiser",
//     "common.loading": "Chargement",
//     "common.error": "Erreur",
//     "common.success": "Succès",
//     "common.cancel": "Annuler",
//     "common.confirm": "Confirmer",
//     "common.yes": "Oui",
//     "common.no": "Non"
//   },

//   "ar-SA": {
//     // Navigation
//     "nav.dashboard": "لوحة القيادة",
//     "nav.assistant": "المساعد",
//     "nav.voiceAssistant": "المساعد الصوتي بالذكاء الاصطناعي",

    
//     // Dashboard
//     "dashboard.title": "لوحة قيادة المساعد الصوتي بالذكاء الاصطناعي",
//     "dashboard.subtitle": "مراقبة وإدارة مساعدك الصوتي بالذكاء الاصطناعي",
//     "dashboard.totalConversations": "إجمالي المحادثات",
//     "dashboard.todayConversations": "محادثات اليوم",
//     "dashboard.avgResponseTime": "متوسط وقت الاستجابة",
//     "dashboard.successRate": "معدل النجاح",
//     "dashboard.recentConversations": "المحادثات الأخيرة",
//     "dashboard.noConversations": "لا توجد محادثات بعد",
//     "dashboard.export": "تصدير",
//     "dashboard.clear": "مسح",
//     "dashboard.systemStatus": "حالة النظام",
//     "dashboard.quickActions": "إجراءات سريعة",
//     "dashboard.refreshStats": "تحديث الإحصائيات",
//     "dashboard.downloadReport": "تنزيل التقرير",
//     "dashboard.systemSettings": "إعدادات النظام",
//     "dashboard.usageTips": "نصائح الاستخدام",
//     "dashboard.totalUsers": "إجمالي المستخدمين",
//     "dashboard.totalSessions": "إجمالي الجلسات",
//     "dashboard.activeDays": "الأيام النشطة",
//     "dashboard.audioRecordings": "التسجيلات الصوتية",
//     "dashboard.adminTitle": "لوحة تحكم المشرف",
//     "dashboard.adminSubtitle": "نظرة عامة كاملة على نظام المساعد الذكي",
//     "dashboard.searchPlaceholder": "البحث في المحادثات...",
//     "dashboard.showingConversations": "عرض {filtered} من أصل {total} محادثة",
//     "dashboard.noConversationsFound": "لم يتم العثور على محادثات",
//     "dashboard.timestamp": "الطابع الزمني",
//     "dashboard.user": "المستخدم",
//     "dashboard.userMessage": "رسالة المستخدم",
//     "dashboard.aiResponse": "رد الذكاء الاصطناعي",
//     "dashboard.language": "اللغة",
//     "dashboard.audio": "الصوت",
//     "dashboard.guest": "ضيف",
//     "dashboard.noEmail": "لا يوجد بريد إلكتروني",
//     "dashboard.noAudio": "لا يوجد صوت",
//     "dashboard.play": "تشغيل",
//     "dashboard.playing": "جاري التشغيل",
//     "dashboard.accessDenied": "تم رفض الوصول",
//     "dashboard.adminAccessRequired": "يتطلب وصول المشرف",
//     "dashboard.errorLoading": "خطأ",
//     "dashboard.failedToLoad": "فشل في تحميل بيانات لوحة القيادة",
//     "dashboard.playbackError": "خطأ في التشغيل",
//     "dashboard.couldNotPlayAudio": "تعذر تشغيل التسجيل الصوتي",
//     "dashboard.conversationsCleared": "تم مسح المحادثات",
//     "dashboard.allConversationsRemoved": "تم إزالة جميع سجلات المحادثات",
//     "dashboard.confirmClear": "هل أنت متأكد من أنك تريد مسح جميع المحادثات؟ لا يمكن التراجع عن هذا الإجراء.",

//     // Assistant Selection
//     "selection.title": "اختر مساعدك بالذكاء الاصطناعي",
//     "selection.subtitle": "اختر المساعد الذي يناسب احتياجاتك. كل مساعد متخصص ليوفر لك الدعم الأكثر صلة.",
//     "selection.startChat": "بدء الدردشة مع",
//     "selection.whichAssistant": "أي مساعد هو الأنسب لك؟",
//     "selection.chooseSlahB2B": "اختر صلاح لـ B2B",
//     "selection.chooseAmiraB2C": "اختر أميرة لـ B2C",
//     "selection.connecting": "جاري الاتصال بـ",
//     "selection.pleaseWait": "الرجاء الانتظار بينما نقوم بإعداد مساعدك",

//     // Assistant Cards
//     "assistant.slah.type": "مساعد B2B",
//     "assistant.slah.description": "متخصص في حلول الأعمال التجارية ودعم الشركات",
//     "assistant.slah.features.enterprise": "حلول المؤسسات",
//     "assistant.slah.features.integration": "التكامل التقني",
//     "assistant.slah.features.analytics": "تحليلات الأعمال",
//     "assistant.slah.features.documentation": "وثائق API",
//     "assistant.slah.features.architecture": "هندسة النظم",
//     "assistant.slah.features.corporateSupport": "دعم الشركات",

//     "assistant.amira.type": "مساعد B2C",
//     "assistant.amira.description": "يركز على دعم المستهلكين وتميز خدمة العملاء",
//     "assistant.amira.features.customerSupport": "دعم العملاء",
//     "assistant.amira.features.productInformation": "معلومات المنتج",
//     "assistant.amira.features.orderAssistance": "مساعدة الطلبات",
//     "assistant.amira.features.accountManagement": "إدارة الحساب",
//     "assistant.amira.features.billingInquiries": "استفسارات الفواتير",
//     "assistant.amira.features.generalHelp": "مساعدة عامة",

//     "assistant.gender.male": "ذكر",
//     "assistant.gender.female": "أنثى",

//     // Comparison Section
//     "comparison.enterpriseSolutions": "حلول على مستوى المؤسسة",
//     "comparison.technicalIntegrations": "تكاملات تقنية",
//     "comparison.businessProcessOptimization": "تحسين عمليات الأعمال",
//     "comparison.corporateAccountManagement": "إدارة حسابات الشركات",
//     "comparison.personalCustomerSupport": "دعم العملاء الشخصي",
//     "comparison.productRecommendations": "توصيات المنتج",
//     "comparison.orderBillingAssistance": "مساعدة الطلبات والفواتير",
//     "comparison.generalConsumerInquiries": "استفسارات المستهلكين العامة",

//     // Assistant Chat
//     "chat.backToSelection": "العودة إلى الاختيار",
//     "chat.selectLanguage": "اختر اللغة",
//     "chat.limitedBrowser": "دعم متصفح محدود",
//     "chat.speechNotSupported": "التعرف على الكلام غير مدعوم في هذا المتصفح. يرجى استخدام Chrome أو Edge أو Safari للحصول على أفضل تجربة.",
//     "chat.youSaid": "قلت:",
//     "chat.response": "الرد:",
//     "chat.conversationHistory": "سجل المحادثات",
//     "chat.clearHistory": "مسح السجل",
//     "chat.specializations": "التخصصات",
//     "chat.playing": "جاري التشغيل...",
//     "chat.replayResponse": "إعادة تشغيل الرد",
//     "chat.interrupted": "تمت المقاطعة",
//     "chat.speechStopped": "توقف الكلام. يمكنك التحدث الآن!",
//     "chat.conversationCleared": "تم مسح المحادثة",
//     "chat.historyReset": "تمت إعادة تعيين سجل محادثاتك.",

//     // Status messages
//     "status.listening": "أنا أستمع...",
//     "status.thinking": "يفكر...",
//     "status.speaking": "يتحدث...",
//     "status.ready": "جاهز لسؤالك التالي!",
//     "status.clickToStart": "انقر عليّ لبدء التحدث",
//     "status.rememberConversation": "(أتذكر محادثتنا)",
//     "status.clickToStop": "(انقر للإيقاف)",
//     "status.clickToInterrupt": "(انقر للمقاطعة عندما أبدأ في التحدث)",
//     "status.clickAnywhere": "(انقر في أي مكان عليّ للمقاطعة)",

//     // Home Page
//     "home.title": "مساعد أوريدو الصوتي بالذكاء الاصطناعي",
//     "home.subtitle": "استمتع بدعم عملاء ذكي مع مساعدينا الصوتيين متعددي اللغات المدعومين بالذكاء الاصطناعي",
//     "home.languageSupport": "الإنجليزية • الفرنسية • العربية",
//     "home.existingUsers": "المستخدمون الحاليون",
//     "home.existingUsersDescription": "الوصول إلى سجل محادثاتك وتجربة مخصصة",
//     "home.loginButton": "تسجيل الدخول إلى حسابك",
//     "home.newUsers": "مستخدمون جدد",
//     "home.newUsersDescription": "إنشاء حساب لحفظ محادثاتك وتفضيلاتك",
//     "home.registerButton": "إنشاء حساب جديد",
//     "home.quickAccess": "الوصول السريع",
//     "home.quickAccessDescription": "جرب مساعدينا بالذكاء الاصطناعي دون إنشاء حساب",
//     "home.continueAsGuest": "الاستمرار كضيف",
//     "home.demoAccount": "🔐 حساب تجريبي متاح",
//     "home.demoEmail": "البريد الإلكتروني: admin@ooredoo.com",
//     "home.demoPassword": "كلمة المرور: admin123",
//     "home.featureVoiceInteraction": "التفاعل الصوتي",
//     "home.featureVoiceDescription": "محادثات صوتية طبيعية مع الذكاء الاصطناعي",
//     "home.featureMultilingual": "دعم متعدد اللغات",
//     "home.featureMultilingualDescription": "متوفر بالإنجليزية والفرنسية والعربية",
//     "home.featureSecure": "آمن وخاص",
//     "home.featureSecureDescription": "محادثاتك محمية",
//     "home.loading": "جاري التحميل...",

//     // Login Page
//     "login.title": "مرحبًا بك في مساعد أوريدو بالذكاء الاصطناعي",
//     "login.subtitle": "تسجيل الدخول للوصول إلى سجل محادثاتك",
//     "login.emailLabel": "البريد الإلكتروني",
//     "login.emailPlaceholder": "you@example.com",
//     "login.passwordLabel": "كلمة المرور",
//     "login.passwordPlaceholder": "••••••••",
//     "login.button": "تسجيل الدخول",
//     "login.loggingIn": "جاري تسجيل الدخول...",
//     "login.noAccount": "ليس لديك حساب؟",
//     "login.registerLink": "سجل هنا",
//     "login.continueAsGuest": "الاستمرار كضيف",
//     "login.demoAccount": "حساب تجريبي:",
//     "login.demoEmail": "البريد الإلكتروني: admin@ooredoo.com",
//     "login.demoPassword": "كلمة المرور: admin123",
//     "login.successTitle": "تسجيل الدخول ناجح",
//     "login.successDescription": "مرحبًا بعودتك، {name}!",
//     "login.failedTitle": "فشل تسجيل الدخول",
//     "login.failedDescription": "يرجى التحقق من بياناتك ومحاولة مرة أخرى.",

//     // Register Page
//     "register.title": "إنشاء حسابك",
//     "register.subtitle": "انضم إلى مساعد أوريدو بالذكاء الاصطناعي",
//     "register.fullNameLabel": "الاسم الكامل (اختياري)",
//     "register.fullNamePlaceholder": "أحمد محمد",
//     "register.emailLabel": "البريد الإلكتروني *",
//     "register.emailPlaceholder": "you@example.com",
//     "register.passwordLabel": "كلمة المرور * (6 أحرف على الأقل)",
//     "register.passwordPlaceholder": "••••••••",
//     "register.confirmPasswordLabel": "تأكيد كلمة المرور *",
//     "register.confirmPasswordPlaceholder": "••••••••",
//     "register.button": "تسجيل",
//     "register.creatingAccount": "جاري إنشاء الحساب...",
//     "register.passwordMismatchTitle": "عدم تطابق كلمة المرور",
//     "register.passwordMismatchDescription": "كلمات المرور غير متطابقة.",
//     "register.weakPasswordTitle": "كلمة مرور ضعيفة",
//     "register.weakPasswordDescription": "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.",
//     "register.successTitle": "تسجيل ناجح",
//     "register.successDescription": "تم إنشاء حسابك. يرجى تسجيل الدخول.",
//     "register.failedTitle": "فشل التسجيل",
//     "register.failedDescription": "يرجى المحاولة مرة أخرى ببيانات مختلفة.",
//     "register.alreadyHaveAccount": "هل لديك حساب بالفعل؟",
//     "register.loginLink": "تسجيل الدخول هنا",

//     // Common UI elements
//     "common.back": "عودة",
//     "common.logout": "تسجيل الخروج",
//     "common.login": "تسجيل الدخول",
//     "common.signUp": "إنشاء حساب",
//     "common.or": "أو",
//     "common.refresh": "تحديث",
//     "common.loading": "جاري التحميل",
//     "common.error": "خطأ",
//     "common.success": "نجح",
//     "common.cancel": "إلغاء",
//     "common.confirm": "تأكيد",
//     "common.yes": "نعم",
//     "common.no": "لا"
//   }
// }

// export function LanguageProvider({ children }: { children: ReactNode }) {
//   const [language, setLanguage] = useState<Language>("en-US")
//   const isRTL = language === "ar-SA"

//   // Load saved language preference
//   useEffect(() => {
//     const saved = localStorage.getItem("preferred-language") as Language
//     if (saved && ["en-US", "fr-FR", "ar-SA"].includes(saved)) {
//       setLanguage(saved)
//     }
//   }, [])

//   // Update HTML lang and dir attributes
//   useEffect(() => {
//     const htmlElement = document.documentElement
//     htmlElement.lang = language
//     htmlElement.dir = isRTL ? "rtl" : "ltr"

//     if (isRTL) {
//       document.body.classList.add("rtl")
//       document.body.classList.remove("ltr")
//     } else {
//       document.body.classList.add("ltr")
//       document.body.classList.remove("rtl")
//     }
//   }, [language, isRTL])

//   // Save language preference
//   const handleSetLanguage = (lang: Language) => {
//     setLanguage(lang)
//     localStorage.setItem("preferred-language", lang)
//   }

//   // Translation function with proper type safety
//   const t = (key: string): string => {
//     const langTranslations = translations[language]
//     if (langTranslations && key in langTranslations) {
//       return langTranslations[key as keyof TranslationKeys]
//     }
    
//     // Fallback to English
//     const englishTranslations = translations["en-US"]
//     if (englishTranslations && key in englishTranslations) {
//       return englishTranslations[key as keyof TranslationKeys]
//     }
    
//     // Final fallback to the key itself
//     return key
//   }

//   return (
//     <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, isRTL, t }}>
//       {children}
//     </LanguageContext.Provider>
//   )
// }

// export function useLanguage() {
//   const context = useContext(LanguageContext)
//   if (context === undefined) {
//     throw new Error("useLanguage must be used within a LanguageProvider")
//   }
//   return context
// }