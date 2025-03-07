"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Conversation } from "@/lib/conversations";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { HeaderSection } from "./HeaderSection";
import { MessageBubble } from "./MessageBubble";
import { InputSection } from "./InputSection";
import { SuggestedResponses } from "./SuggestedResponses";
import { SessionControls } from "./SessionControls";
import { AudioVisualizer } from "./AudioVisualizer";
import { AudioSettings } from "./AudioSettings";
import { LoadingScreen } from "./LoadingScreen";
import RealtimeBlock from "@/components/realtime-block";
import { Button } from "@/components/ui/button";
import { FileText, Download, Settings } from "lucide-react";
import TranscriptModal from "@/components/transcript-modal";
import { generateTranscript, Transcript } from "@/lib/transcript-service";

interface CancerChatInterfaceProps {
  conversation: Conversation[];
  onSendMessage: (text: string) => void;
  onVoiceToggle?: (isActive: boolean) => void;
  onStartSession: () => void;
  onStartTextSession: () => void;
  onStartVoiceSession: () => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onEndSession: () => void;
  sessionState: "pre" | "active" | "post";
  isPaused: boolean;
  isVoiceActive?: boolean;
  isVoiceEnabled?: boolean;
  sessionDuration: number; // in seconds
  className?: string;
  customPreSessionContent?: React.ReactNode;
  currentVolume?: number; // Add this to receive the current audio volume
  isConnecting?: boolean; // Add this to indicate connection in progress
  connectionStatus?: string; // Add this to show connection status
}

// Define types for API response
interface SuggestionsResponse {
  suggestions: string[];
  source: 'api' | 'pattern-matching' | 'default' | 'error-fallback';
  matchedPattern?: string;
}

// Cache suggestions to prevent unnecessary API calls
const suggestionsCache = new Map<string, {
  suggestions: string[],
  source: string,
  matchedPattern?: string
}>();

export function CancerChatInterface({
  conversation,
  onSendMessage,
  onVoiceToggle,
  onStartSession,
  onStartTextSession,
  onStartVoiceSession,
  onPauseSession,
  onResumeSession,
  onEndSession,
  sessionState,
  isPaused,
  isVoiceActive = false,
  isVoiceEnabled = true,
  sessionDuration = 0,
  className,
  customPreSessionContent,
  currentVolume = 0, // Default to 0 if not provided
  isConnecting = false,
  connectionStatus = ""
}: CancerChatInterfaceProps) {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [defaultSuggestions, setDefaultSuggestions] = useState<string[]>([
    "I'm feeling very anxious about my diagnosis",
    "How can I manage my treatment side effects?",
    "I need help talking to my family about this",
    "I'm worried about what comes next"
  ]);
  
  // Suggestions state
  const [dynamicSuggestions, setDynamicSuggestions] = useState<string[]>(defaultSuggestions);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionsSource, setSuggestionsSource] = useState<string>('default');
  
  // Post-session UI state
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [transcript, setTranscript] = useState<Transcript | null>(null);

  // Get the last assistant message for generating suggestions
  const lastAssistantMessage = useMemo(() => {
    return conversation
      .filter(msg => msg.role === "assistant" && msg.isFinal && msg.text.trim().length > 0)
      .pop();
  }, [conversation]);

  // Update suggestions when the last assistant message changes
  useEffect(() => {
    if (!lastAssistantMessage || !lastAssistantMessage.text) {
      return;
    }
    
    const message = lastAssistantMessage.text;
    console.log(`Fetching suggestions for message: ${message.substring(0, 30)}...`);
    
    // Check cache first
    const cacheKey = message.trim();
    if (suggestionsCache.has(cacheKey)) {
      const cached = suggestionsCache.get(cacheKey);
      if (cached) {
        console.log(`Using cached suggestions (source: ${cached.source})`);
        setDynamicSuggestions(cached.suggestions);
        setSuggestionsSource(cached.source);
        return;
      }
    }
    
    // Set loading state
    setLoadingSuggestions(true);
    
    // Fetch suggestions from API
    const fetchSuggestions = async () => {
      try {
        console.log("Calling suggestion API...");
        const response = await fetch('/api/anthropic/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });
        
        setLoadingSuggestions(false);
        
        if (!response.ok) {
          console.warn("Failed to fetch suggestions, using defaults");
          // Cache the fallback
          suggestionsCache.set(cacheKey, {
            suggestions: defaultSuggestions,
            source: 'error-fallback'
          });
          return;
        }
        
        const data: SuggestionsResponse = await response.json();
        
        if (data.suggestions?.length > 0) {
          console.log("Setting fetched suggestions:", data.suggestions);
          setDynamicSuggestions(data.suggestions);
          setSuggestionsSource(data.source);
          
          // Cache for future use
          suggestionsCache.set(cacheKey, {
            suggestions: data.suggestions,
            source: data.source,
            matchedPattern: data.matchedPattern
          });
        } else {
          console.log("No suggestions returned, keeping defaults");
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setLoadingSuggestions(false);
        
        // Cache the error fallback
        suggestionsCache.set(cacheKey, {
          suggestions: defaultSuggestions,
          source: 'error-fallback'
        });
      }
    };
    
    // Execute fetch
    fetchSuggestions();
  }, [lastAssistantMessage, defaultSuggestions]);

  // Monitor voice state changes for debugging
  useEffect(() => {
    console.log(`CancerChatInterface: Voice state changed to ${isVoiceActive ? 'active' : 'inactive'}`);
  }, [isVoiceActive]);
  
  // Scroll to bottom when conversation updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation]);

  // Generate transcript for post-session view
  useEffect(() => {
    if (sessionState === "post" && conversation.length > 0 && !transcript) {
      // Generate a unique session ID if one doesn't exist
      const sessionId = `session_${Date.now()}`;
      const generatedTranscript = generateTranscript(conversation, sessionId);
      setTranscript(generatedTranscript);
    }
  }, [sessionState, conversation, transcript]);

  // Filter out messages that we do not want to display
  const displayableMessages = conversation.filter(msg => {
    if (msg.role === "assistant") {
      return true;
    } else {
      // For user messages
      if (msg.status === "speaking" || msg.status === "processing") {
        return true;
      }
      if (msg.isFinal && msg.text.trim().length > 0) {
        return true;
      }
      return false;
    }
  });

  // Function for RealtimeBlock's voice toggle
  const handleVoiceToggleClick = () => {
    if (onVoiceToggle && sessionState === "active") {
      // Log the state change for debugging
      console.log(`Toggling voice from ${isVoiceActive ? 'active' : 'inactive'} to ${!isVoiceActive ? 'active' : 'inactive'}`);
      
      // Call the parent component's voice toggle handler
      onVoiceToggle(!isVoiceActive);
    }
  };
  
  // Handle transcript view
  const handleViewTranscript = () => {
    setIsTranscriptModalOpen(true);
  };
  
  // Handle transcript download
  const handleDownloadTranscript = () => {
    if (!transcript) return;
    
    const fileName = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    const fileContent = transcript.content;
    
    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Render post-session actions
  const renderPostSessionActions = () => {
    return (
      <div className="mt-6 flex flex-col items-center gap-4">
        <h3 className="font-medium text-lg text-center">Your session has ended</h3>
        <p className="text-center text-muted-foreground mb-2">
          Thank you for sharing your journey with us. You can view or download your conversation transcript.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            onClick={handleViewTranscript}
            className="bg-cancer-accent hover:bg-cancer-accent/90 text-white font-medium px-6 py-2 rounded-full flex items-center gap-2"
          >
            <FileText size={16} />
            View Transcript
          </Button>
          <Button
            onClick={handleDownloadTranscript}
            variant="outline"
            className="border-cancer-subtle text-cancer-text hover:bg-gray-100 flex items-center gap-2 font-medium px-6 py-2 rounded-full"
          >
            <Download size={16} />
            Download Transcript
          </Button>
          <Button
            onClick={onStartSession}
            className="bg-cancer-active hover:bg-cancer-active/90 text-white font-medium px-6 py-2 rounded-full"
          >
            Start New Session
          </Button>
        </div>
      </div>
    );
  };

  // Check if there's at least one AI message that can be displayed
  const hasAIMessage = useMemo(() => {
    return conversation.some(msg => 
      msg.role === "assistant" && msg.isFinal && msg.text.trim().length > 0
    );
  }, [conversation]);

  // Input Section with RealtimeBlock for voice mode - only shown when session is active and AI has responded
  const renderInputSection = () => {
    // Only render when:
    // 1. Session is active
    // 2. There's at least one AI message or we're connecting
    // 3. Not in post-session state
    const shouldRender = sessionState === "active" && (hasAIMessage || isConnecting) && !isPaused;
    
    if (!shouldRender) return null;
    
    return (
      <>
        {/* Just audio visualizer above the input box - Only shown in active session with voice mode */}
        <AnimatePresence>
          {isVoiceActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-2 flex justify-center"
            >
              <AudioVisualizer 
                volume={currentVolume} 
                isActive={!isPaused && isVoiceActive}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div 
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <InputSection
                onSubmit={onSendMessage}
                disabled={isPaused}
                placeholder="Type a message..."
                className="shadow-sm transition-all duration-300"
              />
            </div>
            
            {/* Mic button - positioned to the right of the input box */}
            <div className="flex-shrink-0">
              <RealtimeBlock
                voice={isVoiceActive ? "alloy" : "none"}
                isSessionActive={!isPaused}
                handleStartStopClick={handleVoiceToggleClick}
                msgs={[]}
                currentVolume={currentVolume}
                showVoiceVisualizer={false} // Don't show visualizer in the button, we have it above the input
                compact={true}
              />
            </div>
          </div>

          {/* Suggested Responses - Only shown when we have AI messages and are not paused */}
          <AnimatePresence>
            {hasAIMessage && !isPaused && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: "1rem" }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {/* Loading overlay for suggestions */}
                {loadingSuggestions && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded z-10">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-cancer-accent rounded-full animate-ping"></div>
                      <p className="text-sm text-cancer-text">Loading suggestions...</p>
                    </div>
                  </div>
                )}
                
                <SuggestedResponses
                  suggestions={dynamicSuggestions}
                  onSuggestionClick={onSendMessage}
                  disabled={false}
                  maxToShow={4}
                  source={suggestionsSource}
                  conversation={conversation}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </>
    );
  };

  return (
    <div 
      className={cn(
        "flex flex-col w-full h-screen max-h-screen bg-cancer-background text-cancer-text overflow-hidden",
        "max-w-4xl mx-auto relative",
        className
      )}
    >
      {/* Header Section - now with session controls */}
      <HeaderSection 
        sessionActive={sessionState === "active"}
        sessionPaused={isPaused}
        sessionDuration={sessionDuration}
        onPauseSession={sessionState === "active" ? onPauseSession : undefined}
        onResumeSession={sessionState === "active" ? onResumeSession : undefined}
        onEndSession={sessionState === "active" ? onEndSession : undefined}
        className="border-b border-gray-100 shadow-sm relative z-20"
        isConnecting={isConnecting}
        connectionStatus={connectionStatus}
      />

      {/* Main Container - ensures no scrolling needed on desktop */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden relative z-20">
        {/* Chat Display Area with Footer Image at Bottom */}
        <motion.div 
          ref={chatContainerRef}
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 overflow-y-auto mb-4 px-6 py-6 rounded-lg border border-gray-100 shadow-md bg-white relative"
          aria-label="Chat conversation"
        >
          {/* Position loading screen container */}
          {(isConnecting || (sessionState === "active" && displayableMessages.length === 0)) && (
            <div className="absolute inset-0 overflow-hidden z-40">
              <LoadingScreen connectionStatus={connectionStatus} />
            </div>
          )}
          
          {/* Footer image positioned at the bottom of the chatbox */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-center pointer-events-none z-0">
            <Image
              src="/footer-image.webp"
              alt="Footer decoration"
              width={800}
              height={180}
              className="object-contain opacity-30"
              priority
            />
          </div>
          
          {/* Chat content positioned above the footer image with transparent background */}
          <div className="relative z-10 bg-transparent">
            <AnimatePresence mode="wait">
              {/* Only show the pre-session content when not connecting and no messages AND in pre-session state */}
              {displayableMessages.length === 0 && !isConnecting && sessionState === "pre" ? (
                <motion.div 
                  key="pre-session"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center justify-center min-h-[400px] relative z-20"
                >
                  <div className="max-w-xl text-center space-y-6 bg-transparent p-6">
                    <h2 className="text-2xl font-semibold text-cancer-text bg-transparent inline-block px-4 py-2">
                      Your Healing Check-in
                    </h2>

                    {/* AI Avatar Image below the title */}
                    <div className="flex justify-center my-4">
                      <Image
                        src="/ai-avatar.png"
                        alt="AI Therapist"
                        width={120}
                        height={120}
                        className="rounded-full shadow-md object-cover object-center"
                        priority
                      />
                    </div>
                    
                    <p className="text-cancer-text text-base bg-transparent px-4 py-2 inline-block">
                      This assessment will help us understand your wellbeing 
                      and mental health status. Your responses will be used 
                      to provide personalized support through your cancer journey.
                    </p>
                    <p className="text-cancer-text text-base bg-transparent px-4 py-2 inline-block">
                      The session will take <strong>approximately 5-10 minutes</strong>.
                    </p>
                    
                    {/* Mode selection info */}
                    <p className="text-sm text-cancer-subtle mt-4 mb-2 bg-transparent px-4 py-2 inline-block">
                      You can switch between text and voice modes at any time during the session.
                    </p>
                    
                    {/* Render custom pre-session content if provided */}
                    {customPreSessionContent}
                  </div>
                </motion.div>
              ) : displayableMessages.length > 0 ? (
                <motion.div
                  key="active-session"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-transparent"
                >
                  {displayableMessages.map(message => (
                    <MessageBubble
                      key={message.id}
                      isUser={message.role === "user"}
                      text={message.text}
                      timestamp={message.timestamp}
                      isProcessing={message.status === "processing"}
                      isSpeaking={message.status === "speaking"}
                    />
                  ))}
                </motion.div>
              ) : null /* Don't render anything during connection transition */}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Render Input Section if session is active and has AI message */}
        {renderInputSection()}
        
        {/* Post-session UI */}
        {sessionState === "post" && renderPostSessionActions()}
      </div>
      
      {/* Audio settings button in the right bottom corner */}
      <AudioSettings isActive={sessionState === "active" && isVoiceActive} />
      
      {/* Transcript Modal */}
      {isTranscriptModalOpen && transcript && (
        <TranscriptModal
          transcript={transcript}
          isOpen={isTranscriptModalOpen}
          onClose={() => setIsTranscriptModalOpen(false)}
        />
      )}
    </div>
  );
} 