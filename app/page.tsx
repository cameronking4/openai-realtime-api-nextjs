"use client"

import React, { useEffect, useState } from "react"
import useWebRTCAudioSession from "@/hooks/use-webrtc"
import { tools } from "@/lib/tools"
import { Welcome } from "@/components/welcome"
import { BroadcastButton } from "@/components/broadcast-button"
import { StatusDisplay } from "@/components/status"
import { TextInput } from "@/components/text-input"
import { motion } from "framer-motion"
import { useToolsFunctions } from "@/hooks/use-tools"
import { useVoiceContext } from "../contexts/voice-context"
import { useTokenContext } from "../contexts/token-context"
import { Message as MessageType } from "@/types"
import Transcriber from "@/components/ui/transcriber"
import { Header } from "@/components/header"
import RealtimeBlock from "@/components/realtime-block"
import ChatBox from "@/components/ChatBox"
import TakeAMomentButton from "@/components/take-a-moment-button"
import { Button } from "@/components/ui/button"

// Session state type
type SessionState = "pre" | "active" | "post";

const App: React.FC = () => {
  // Session state
  const [sessionState, setSessionState] = useState<SessionState>("pre");
  const [isPaused, setIsPaused] = useState(false);
  
  // Get voice from context
  const { voice } = useVoiceContext();
  
  // Get token context
  const { updateMessages, resetTokenUsage } = useTokenContext();
  
  // State to store messages for the header
  const [headerMessages, setHeaderMessages] = useState<MessageType[]>([]);

  // WebRTC Audio Session Hook
  const {
    status,
    isSessionActive,
    registerFunction,
    handleStartStopClick,
    msgs,
    conversation,
    sendTextMessage,
    currentVolume
  } = useWebRTCAudioSession(voice, tools)

  // Update token context with messages
  useEffect(() => {
    updateMessages(msgs);
    // Update header messages
    setHeaderMessages(msgs);
  }, [msgs, updateMessages]);

  // Get all tools functions
  const toolsFunctions = useToolsFunctions();

  useEffect(() => {
    // Register all functions by iterating over the object
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      const functionNames: Record<string, string> = {
        timeFunction: 'getCurrentTime',
        backgroundFunction: 'changeBackgroundColor',
        partyFunction: 'partyMode',
        launchWebsite: 'launchWebsite', 
        copyToClipboard: 'copyToClipboard',
        scrapeWebsite: 'scrapeWebsite'
      };
      
      registerFunction(functionNames[name], func);
    });
  }, [registerFunction, toolsFunctions]);

  // Start session handler
  const handleStartSession = () => {
    setSessionState("active");
    if (!isSessionActive) {
      handleStartStopClick();
    }
  };

  // End session handler
  const handleEndSession = () => {
    setSessionState("post");
    if (isSessionActive) {
      handleStartStopClick();
    }
  };

  // Handle voice toggle
  const handleVoiceToggle = (isActive: boolean) => {
    if (isActive !== isSessionActive) {
      handleStartStopClick();
    }
  };

  // Handle pause/resume
  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  // Render different content based on session state
  const renderSessionContent = () => {
    switch (sessionState) {
      case "pre":
        return (
          <motion.div 
            className="flex flex-col items-center justify-center text-center space-y-6 p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              Psycho-Oncology Assessment
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-md">
              This assessment will help us understand your wellbeing and mental health status. 
              Your responses will be used to provide personalized support through your cancer journey.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
              The session will take approximately 30 minutes. You can pause at any time if you need a break.
            </p>
            <Button 
              onClick={handleStartSession}
              size="lg"
              className="mt-4"
            >
              Begin Assessment
            </Button>
          </motion.div>
        );
      
      case "active":
        return (
          <>
            <ChatBox conversation={conversation}>
              <div className="flex justify-between items-center">
                <div className="w-1/3">
                  <TakeAMomentButton onPause={handlePause} onResume={handleResume} />
                </div>
                <div className="w-1/3 flex justify-center">
                  <RealtimeBlock 
                    voice={voice}
                    isSessionActive={isSessionActive && !isPaused}
                    handleStartStopClick={handleStartStopClick}
                    msgs={msgs}
                    currentVolume={currentVolume}
                  />
                </div>
                <div className="w-1/3 flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={handleEndSession}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    End Session
                  </Button>
                </div>
              </div>
            </ChatBox>
            
            <div className="mt-4 w-full">
              <TextInput 
                onSubmit={sendTextMessage}
                disabled={!isSessionActive || isPaused}
                onVoiceToggle={handleVoiceToggle}
                isVoiceActive={isSessionActive}
              />
            </div>
            
            <StatusDisplay status={isPaused ? "Session paused" : (status || "Active session")} />
          </>
        );
      
      case "post":
        return (
          <motion.div 
            className="flex flex-col items-center justify-center text-center space-y-6 p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              Assessment Complete
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-md">
              Thank you for completing the assessment. Your responses will help us provide personalized support.
            </p>
            <div className="flex gap-4 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setSessionState("pre")}
              >
                Start New Assessment
              </Button>
              <Button 
                onClick={() => setSessionState("active")}
              >
                Review Conversation
              </Button>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Header messages={headerMessages} />
      <main className="flex flex-1 justify-center items-center w-full">
        <motion.div 
          className="container flex flex-col items-center justify-center mx-auto max-w-4xl my-10 p-8 border rounded-lg shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderSessionContent()}
        </motion.div>
      </main>
    </>
  )
}

export default App;