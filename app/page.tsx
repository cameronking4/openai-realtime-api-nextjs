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

const App: React.FC = () => {
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
    sendTextMessage
  } = useWebRTCAudioSession(voice, tools)

  // Update token context with messages
  useEffect(() => {
    updateMessages(msgs);
    // Update header messages
    setHeaderMessages(msgs);
  }, [msgs, updateMessages]);

  // Reset token usage when starting a new session
  useEffect(() => {
    if (!isSessionActive) {
      // Don't reset when the component first mounts
      if (msgs.length > 0) {
        // Only reset when a session ends, not on initial load
        resetTokenUsage();
      }
    }
  }, [isSessionActive, msgs.length, resetTokenUsage]);

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
  }, [registerFunction, toolsFunctions])

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
          <Welcome />
          
          <motion.div 
            className="w-full max-w-xl bg-card text-card-foreground rounded-xl border shadow-sm p-6 space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <div className="flex flex-col items-center gap-4">
              <BroadcastButton 
                isSessionActive={isSessionActive} 
                onClick={handleStartStopClick}
              />
            </div>
            <motion.div 
              className="w-full flex flex-col gap-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Transcriber shows the conversation */}
              <Transcriber conversation={conversation} />
              <TextInput 
                onSubmit={sendTextMessage}
                disabled={!isSessionActive}
              />
            </motion.div>
          </motion.div>
          
          <StatusDisplay status={status || "Ready to start a session"} />
        </motion.div>
      </main>
    </>
  )
}

export default App;