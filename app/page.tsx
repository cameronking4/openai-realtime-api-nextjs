"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { CancerChatInterface } from "@/app/_components/features/cancer-chat/CancerChatInterface";
import { PreSessionOptions } from "@/app/_components/features/cancer-chat/PreSessionOptions";
import { Conversation } from "@/app/_lib/conversations";
import useWebRTCAudioSession from "@/app/_hooks/use-webrtc";
import { useModalityContext } from "@/app/_contexts/modality-context";
import { useVoiceContext } from "@/app/_contexts/voice-context";
import { useToolsFunctions } from "@/app/_hooks/use-tools";
import { tools } from "@/app/_lib/tools";
import { generateTranscript, saveTranscript, Transcript } from "@/app/_lib/transcript-service";
import { Button } from "@/app/_components/ui/button";
import { logger } from '@/app/_utils';

export default function CancerChatPage() {
  // Session state
  const [sessionState, setSessionState] = useState<"pre" | "active" | "post">("pre");
  const [isPaused, setIsPaused] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionInterval, setSessionInterval] = useState<NodeJS.Timeout | null>(null);
  const [sessionEndReason, setSessionEndReason] = useState<string | null>(null);
  
  // Microphone stream reference
  const micStreamRef = useRef<MediaStream | null>(null);
  
  // Connection status for better UX feedback
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Get voice from context
  const { voice } = useVoiceContext();
  
  // Get modality context
  const { modality, setModality, isAudioEnabled } = useModalityContext();

  // Error state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // WebRTC Audio Session Hook
  const {
    status,
    isSessionActive,
    handleStartStopClick,
    msgs,
    conversation,
    sendTextMessage,
    currentVolume,
    updateModality,
    currentModality,
    registerFunction,
    listRegisteredFunctions
  } = useWebRTCAudioSession(voice, tools);

  // Handle ending a session
  const handleEndSession = useCallback((reason?: any) => {
    try {
      console.log("🔴🔴🔴 HANDLEENDSESSION FUNCTION CALLED");
      
      // Check if reason is a React event object (has _reactName property)
      if (reason && reason._reactName) {
        console.log("🔴🔴🔴 REASON IS A REACT EVENT, USING DEFAULT REASON");
        reason = "User ended the session";
      }
      
      // Store the reason for ending the session
      if (reason) {
        console.log("🔴🔴🔴 SESSION END REASON:", reason);
        setSessionEndReason(reason);
      } else {
        console.log("🔴🔴🔴 NO REASON PROVIDED FOR SESSION END");
        setSessionEndReason("No reason provided");
      }
      
      // IMMEDIATELY set session state to post to ensure UI updates
      setSessionState("post");
      console.log("🔴🔴🔴 IMMEDIATELY SET SESSION STATE TO POST");
      
      console.log("🔴 Ending session and cleaning up resources");
      console.log("🔴 Current session state:", sessionState);
      console.log("🔴 Is session active:", isSessionActive);
      
      // Set isPaused to false
      setIsPaused(false);
      
      // Clean up microphone stream if active
      try {
        if (micStreamRef.current) {
          console.log("🔴 Cleaning up microphone stream at session end");
          micStreamRef.current.getTracks().forEach(track => {
            track.stop();
          });
          micStreamRef.current = null;
        } else {
          console.log("🔴 No microphone stream to clean up");
        }
      } catch (micError) {
        console.error("🔴 Error cleaning up microphone stream:", micError);
      }
      
      // Stop WebRTC session if active
      try {
        if (isSessionActive) {
          console.log("🔴 Stopping WebRTC session");
          handleStartStopClick();
        } else {
          console.log("🔴 No active WebRTC session to stop");
        }
      } catch (webrtcError) {
        console.error("🔴 Error stopping WebRTC session:", webrtcError);
      }
      
      // Reset modality to text for next session
      try {
        console.log("🔴 Resetting modality to text");
        setModality("text");
      } catch (modalityError) {
        console.error("🔴 Error resetting modality:", modalityError);
      }
      
      // Generate and save transcript
      try {
        console.log("🔴 Generating and saving transcript");
        const sessionId = `session_${Date.now()}`;
        const transcript = generateTranscript(conversation, sessionId);
        saveTranscript(transcript);
      } catch (transcriptError) {
        console.error("🔴 Error generating/saving transcript:", transcriptError);
      }
      
      console.log("🔴🔴🔴 SESSION END COMPLETE");
    } catch (error) {
      console.error("🔴 Critical error in handleEndSession:", error);
      // Force session state to post even if there was an error
      setSessionState("post");
    }
  }, [isSessionActive, handleStartStopClick, setModality, conversation, sessionState]);

  // Get tool functions with the endSession callback
  const toolsFunctions = useToolsFunctions(handleEndSession);
  
  // Register all functions when the component mounts
  useEffect(() => {
    console.log("🔴 Registering functions - effect triggered");
    
    // Create a stable mapping of function names
    const functionNames: Record<string, string> = {
      timeFunction: 'getCurrentTime',
      backgroundFunction: 'changeBackgroundColor',
      partyFunction: 'partyMode',
      launchWebsite: 'launchWebsite', 
      copyToClipboard: 'copyToClipboard',
      scrapeWebsite: 'scrapeWebsite',
      endSession: 'endSession'
    };
    
    // Register all functions by iterating over the object
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      if (functionNames[name]) {
        console.log(`🔴 Registering function: ${name} as ${functionNames[name]}`);
        registerFunction(functionNames[name], func);
      }
    });
    
    // Verify that endSession is registered
    console.log("🔴 Verifying endSession function registration:");
    const registeredFunctions = listRegisteredFunctions();
    console.log("🔴 All registered functions:", registeredFunctions);
    console.log("🔴 Is endSession registered:", registeredFunctions.includes('endSession'));
    
    if (!registeredFunctions.includes('endSession')) {
      console.error("🔴 endSession function is not registered! Attempting to register it directly.");
      if (toolsFunctions.endSession) {
        registerFunction('endSession', toolsFunctions.endSession);
        console.log("🔴 Registered endSession function directly.");
      } else {
        console.error("🔴 endSession function not found in toolsFunctions!");
      }
    }
    
    // Add a global window function for direct access in case the callback approach fails
    (window as any).forceEndSession = (reason?: string) => {
      console.log("🔴🔴🔴 FORCE END SESSION CALLED FROM WINDOW OBJECT", reason ? `WITH REASON: ${reason}` : "WITHOUT REASON");
      handleEndSession(reason);
    };
    
    // Add a global debug function to check registered functions
    (window as any).debugRegisteredFunctions = () => {
      console.log("🔴🔴🔴 DEBUG: Checking registered functions");
      return listRegisteredFunctions();
    };
    
    // Add a debug function to check the session configuration
    (window as any).debugSession = async () => {
      try {
        console.log("🔴🔴🔴 DEBUG: Checking session configuration");
        const response = await fetch('/api/session/debug');
        const data = await response.json();
        console.log("🔴🔴🔴 SESSION CONFIG:", data);
        return data;
      } catch (error) {
        console.error("🔴🔴🔴 ERROR CHECKING SESSION CONFIG:", error);
        return { error };
      }
    };
    
    // Add a direct test function for the endSession function
    (window as any).testEndSessionFunction = () => {
      console.log("🔴🔴🔴 TEST: Directly calling endSession function");
      
      // Get the registered functions
      const registeredFunctions = listRegisteredFunctions();
      console.log("🔴🔴🔴 TEST: Registered functions:", registeredFunctions);
      
      if (registeredFunctions.includes('endSession')) {
        console.log("🔴🔴🔴 TEST: endSession function is registered");
        
        // Call the endSession function from toolsFunctions directly
        try {
          console.log("🔴🔴🔴 TEST: Calling endSession from toolsFunctions");
          const result = toolsFunctions.endSession({ reason: "test from console" });
          console.log("🔴🔴🔴 TEST: endSession function called successfully, result:", result);
          return result;
        } catch (error) {
          console.error("🔴🔴🔴 TEST: Error calling endSession function:", error);
          return { success: false, error };
        }
      } else {
        console.error("🔴🔴🔴 TEST: endSession function is not registered");
        return { success: false, error: "endSession function is not registered" };
      }
    };
    
    // This effect should only run once when the component mounts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track connection status changes
  useEffect(() => {
    // Update our local connection status from WebRTC status with more descriptive messages
    let displayStatus = status;
    
    // Map status messages to more user-friendly text
    if (status.toLowerCase().includes('connecting')) {
      displayStatus = "Establishing connection...";
    } else if (status.toLowerCase().includes('requesting') || status.toLowerCase().includes('permission')) {
      displayStatus = "Requesting microphone access...";
    } else if (status.toLowerCase().includes('ice') || status.toLowerCase().includes('peer')) {
      displayStatus = "Setting up secure connection...";
    } else if (status.toLowerCase().includes('signaling') || status.toLowerCase().includes('signal')) {
      displayStatus = "Connecting to assistant...";
    } else if (status.toLowerCase().includes('sdp') || status.toLowerCase().includes('offer')) {
      displayStatus = "Negotiating connection...";
    } else if (status.toLowerCase().includes('connected') || status.toLowerCase().includes('ready')) {
      displayStatus = "Connection established!";
    } else if (status.toLowerCase().includes('error') || status.toLowerCase().includes('fail')) {
      displayStatus = "Connection error";
    }
    
    // Update the displayed status
    setConnectionStatus(displayStatus);
    
    // Detect if we're in connecting state
    const connecting = status.toLowerCase().includes('connecting') || 
                     status.toLowerCase().includes('requesting') ||
                     status.toLowerCase().includes('establishing') ||
                     status.toLowerCase().includes('negotiating') ||
                     status.toLowerCase().includes('setup') ||
                     status.toLowerCase().includes('ice') ||
                     status.toLowerCase().includes('sdp') ||
                     status.toLowerCase().includes('offer');
    
    // When session becomes active or connected, clear the connecting state
    if (status.toLowerCase().includes('connected') || 
        status.toLowerCase().includes('ready') || 
        (isSessionActive && conversation.length > 0)) {
      console.log("Connection established, clearing connecting state");
      setIsConnecting(false);
    } else if (connecting) {
      // Show connecting state when appropriate
      setIsConnecting(true);
    }
    
    // Check for errors
    if (status.toLowerCase().includes('error') || status.toLowerCase().includes('connectivity')) {
      setHasError(true);
      setErrorMessage(status);
      // Also clear connecting state on error
      setIsConnecting(false);
    } else {
      setHasError(false);
    }
  }, [status, isSessionActive, conversation]);

  // Force-clear connecting state when messages come in, but with a small delay for smooth transition
  useEffect(() => {
    // Check if we have messages and connecting state is active
    if (conversation.length > 0 && isConnecting) {
      console.log("Messages received - preparing to show conversation");
      
      // Add a short delay before clearing the connecting state
      // This ensures the loading screen doesn't disappear too quickly
      // and creates a smoother transition to the conversation
      const timer = setTimeout(() => {
        console.log("Clearing connecting state after message delay");
        setIsConnecting(false);
        
        // Also update the connection status to reflect that the session is active
        if (modality === "text+audio") {
          setConnectionStatus("Voice session active");
        } else {
          setConnectionStatus("Text session active");
        }
      }, 500); // 500ms delay for smoother transition
      
      return () => clearTimeout(timer);
    }
  }, [conversation, isConnecting, modality]);

  // Safety timeout to ensure loading screen doesn't get stuck
  useEffect(() => {
    let safetyTimer: NodeJS.Timeout | null = null;
    
    // If connecting state is active, set a safety timeout to clear it after a maximum time
    if (isConnecting) {
      logger.debug("Setting safety timeout for connecting state");
      safetyTimer = setTimeout(() => {
        // Only clear if still connecting after timeout
        if (isConnecting) {
          logger.warn("Safety timeout triggered - clearing connecting state");
          setIsConnecting(false);
          setConnectionStatus("Session ready");
        }
      }, 15000); // 15 seconds max wait time
    }
    
    return () => {
      if (safetyTimer) {
        clearTimeout(safetyTimer);
      }
    };
  }, [isConnecting]);

  // Update the WebRTC session when modality changes
  useEffect(() => {
    // Only update if the current modality in the WebRTC session doesn't match the context modality
    if (modality !== currentModality && sessionState === "active") {
      updateModality(modality);
    }
  }, [modality, updateModality, currentModality, sessionState]);

  // Clean up mic stream when component unmounts
  useEffect(() => {
    return () => {
      // Stop all tracks in the microphone stream when component unmounts
      if (micStreamRef.current) {
        console.log("Cleaning up microphone stream");
        micStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        micStreamRef.current = null;
      }
    };
  }, []);

  // Handle session timing
  useEffect(() => {
    if (sessionState === "active" && !isPaused) {
      const interval = setInterval(() => {
        setSessionDuration(prev => prev + 1);
      }, 1000);
      setSessionInterval(interval);
      return () => clearInterval(interval);
    } else if (sessionInterval) {
      clearInterval(sessionInterval);
      setSessionInterval(null);
    }
  }, [sessionState, isPaused]);

  // Track conversation changes to detect when AI stops responding after being asked to end the session
  useEffect(() => {
    // Only run this effect if the session is active
    if (sessionState !== "active") return;
    
    // Get the last few messages
    const lastMessages = conversation.slice(-3);
    
    // Check if the last message is from the user and contains phrases related to ending the session
    const lastMessage = lastMessages[lastMessages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      const text = lastMessage.text.toLowerCase();
      const endSessionPhrases = [
        "end session", 
        "stop session", 
        "finish session", 
        "goodbye", 
        "bye", 
        "thank you",
        "end our conversation",
        "stop our conversation",
        "finish our conversation"
      ];
      
      const containsEndSessionPhrase = endSessionPhrases.some(phrase => text.includes(phrase));
      
      if (containsEndSessionPhrase) {
        console.log("🔴🔴🔴 DETECTED USER REQUEST TO END SESSION:", text);
        
        // Set a timeout to check if the AI has responded
        const timeoutId = setTimeout(() => {
          // Check if the AI has responded since the user's message
          const currentConversation = conversation;
          const lastMessageNow = currentConversation[currentConversation.length - 1];
          
          // If the last message is still from the user, the AI hasn't responded
          if (lastMessageNow && lastMessageNow.role === "user" && lastMessageNow.id === lastMessage.id) {
            console.log("🔴🔴🔴 AI HAS NOT RESPONDED TO END SESSION REQUEST, ENDING SESSION MANUALLY");
            handleEndSession();
          }
        }, 10000); // Wait 10 seconds for the AI to respond
        
        // Clean up the timeout if the component unmounts or the conversation changes
        return () => clearTimeout(timeoutId);
      }
    }
  }, [conversation, sessionState, handleEndSession]);

  // Generic handle starting a session
  const handleStartSession = () => {
    console.log("Starting generic session");
    // Show connecting state immediately for better UX
    setIsConnecting(true);
    setConnectionStatus("Initiating session...");
    
    // Update local state
    setSessionState("active");
    setIsPaused(false);
    setSessionDuration(0);
    
    // Start the WebRTC session
    if (!isSessionActive) {
      console.log("Starting WebRTC session");
      setConnectionStatus("Connecting to server...");
      
      // Start the session right away - no delays
      handleStartStopClick();
    }
  };

  // Handle starting a text-only session
  const handleStartTextSession = () => {
    console.log("Starting text-only session");
    
    // Set modality first then start session
    setModality("text");
    
    // Start session process immediately
    setConnectionStatus("Preparing text-only session...");
    setIsConnecting(true);
    handleStartSession();
    
    // Setup parallel status update for better UX
    const statusSequence = [
      { time: 800, status: "Setting up text channel..." },
      { time: 2000, status: "Connecting to assistant..." },
      { time: 3500, status: "Almost ready..." }
    ];
    
    // Execute status updates in sequence but don't block session starting
    statusSequence.forEach(({ time, status }) => {
      setTimeout(() => {
        if (isConnecting) {
          setConnectionStatus(status);
        }
      }, time);
    });
  };

  // Handle starting a voice+text session
  const handleStartVoiceSession = () => {
    console.log("Starting voice+text session...");
    
    // Set modality first then start session
    setModality("text+audio");
    
    // Start session process immediately
    setConnectionStatus("Preparing voice+text session...");
    setIsConnecting(true);
    handleStartSession();
    
    // Setup parallel status updates for better UX
    const statusSequence = [
      { time: 800, status: "Setting up audio connection..." },
      { time: 1800, status: "Requesting microphone access..." },
      { time: 3000, status: "Connecting to assistant..." },
      { time: 4500, status: "Almost ready..." }
    ];
    
    // Execute status updates in sequence but don't block session starting
    statusSequence.forEach(({ time, status }) => {
      setTimeout(() => {
        if (isConnecting) {
          setConnectionStatus(status);
        }
      }, time);
    });
    
    // Ensure voice mode is activated even if WebRTC doesn't request it automatically
    setTimeout(() => {
      if (isSessionActive && currentModality !== "text+audio") {
        console.log("Ensuring voice mode is active");
        updateModality("text+audio");
      }
    }, 1500); // Shorter delay - more responsive
  };

  // Handle pausing a session
  const handlePauseSession = () => {
    setIsPaused(true);
  };

  // Handle resuming a session
  const handleResumeSession = () => {
    setIsPaused(false);
  };

  // Handle sending a message
  const handleSendMessage = (text: string) => {
    // Use the WebRTC data channel to send text message
    sendTextMessage(text);
  };

  // Handle voice toggle (for the mic button inside chat)
  const handleVoiceToggle = async (isActive: boolean) => {
    console.log(`Voice toggle called: ${isActive ? 'activating' : 'deactivating'} voice`);
    
    // If deactivating voice, clean up any existing stream
    if (!isActive && micStreamRef.current) {
      console.log("Cleaning up microphone stream during toggle");
      micStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      micStreamRef.current = null;
    }
    
    // Show appropriate connection status
    setIsConnecting(true);
    setConnectionStatus(isActive 
      ? "Activating voice capabilities..." 
      : "Switching to text-only mode...");
    
    // Update modality based on voice toggle
    const newModality = isActive ? "text+audio" : "text";
    console.log(`Setting modality to: ${newModality}`);
    
    // Set modality and let WebRTC handle the permissions naturally
    setModality(newModality);
    updateModality(newModality);
    
    // Clear connecting state after a short delay
    setTimeout(() => {
      setIsConnecting(false);
      setConnectionStatus(isActive 
        ? "Voice mode active" 
        : "Text-only mode active");
    }, 1200);
  };

  // Pre-session options component to be displayed inside the chat box
  const preSessionOptionsComponent = (
    <PreSessionOptions 
      onStartTextSession={handleStartTextSession}
      onStartVoiceSession={handleStartVoiceSession}
    />
  );

  // Memoize the AI end session handler to avoid recreating it on every render
  const handleAIEndSession = useCallback((event: CustomEvent<{ reason: string }>) => {
    console.log("🔴🔴🔴 AI REQUESTED TO END SESSION:", event.detail.reason);
    console.log("🔴🔴🔴 CURRENT SESSION STATE BEFORE ENDING:", sessionState);
    console.log("🔴🔴🔴 IS SESSION ACTIVE:", isSessionActive);
    handleEndSession(event.detail.reason);
    console.log("🔴🔴🔴 HANDLEENDSESSION CALLED");
  }, [handleEndSession, sessionState, isSessionActive]);

  // Listen for AI-triggered session end events
  useEffect(() => {
    // Add event listener
    window.addEventListener('ai-end-session', handleAIEndSession as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('ai-end-session', handleAIEndSession as EventListener);
    };
  }, [handleAIEndSession]);

  return (
    <main className="min-h-screen max-h-screen overflow-hidden bg-white">
      {hasError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg">
            <div className="flex items-center">
              <div className="py-1">
                <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Connection Error</p>
                <p className="text-sm">{errorMessage}</p>
                <Button 
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs bg-red-500 hover:bg-red-700 text-white"
                >
                  Reload Page
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <CancerChatInterface
        conversation={conversation}
        onSendMessage={handleSendMessage}
        onVoiceToggle={handleVoiceToggle}
        onStartSession={handleStartSession}
        onStartTextSession={handleStartTextSession}
        onStartVoiceSession={handleStartVoiceSession}
        onPauseSession={handlePauseSession}
        onResumeSession={handleResumeSession}
        onEndSession={handleEndSession}
        sessionState={sessionState}
        isPaused={isPaused}
        isVoiceActive={modality === "text+audio"}
        isVoiceEnabled={true}
        sessionDuration={sessionDuration}
        customPreSessionContent={preSessionOptionsComponent}
        currentVolume={currentVolume}
        isConnecting={isConnecting}
        connectionStatus={connectionStatus}
        sessionEndReason={sessionEndReason}
      />
    </main>
  );
} 