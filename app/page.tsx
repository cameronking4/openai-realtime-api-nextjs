"use client";

import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { CancerChatInterface } from "@/components/cancer-chat/CancerChatInterface";
import { PreSessionOptions } from "@/components/cancer-chat/PreSessionOptions";
import { Conversation } from "@/lib/conversations";
import useWebRTCAudioSession from "@/hooks/use-webrtc";
import { useModalityContext } from "@/contexts/modality-context";
import { useVoiceContext } from "@/contexts/voice-context";
import { tools } from "@/lib/tools";
import { generateTranscript, saveTranscript, Transcript } from "@/lib/transcript-service";
import { Button } from "@/components/ui/button";

export default function CancerChatPage() {
  // Session state
  const [sessionState, setSessionState] = useState<"pre" | "active" | "post">("pre");
  const [isPaused, setIsPaused] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionInterval, setSessionInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Microphone stream reference
  const micStreamRef = useRef<MediaStream | null>(null);
  
  // Connection status for better UX feedback
  const [connectionStatus, setConnectionStatus] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Get voice from context
  const { voice } = useVoiceContext();
  
  // Get modality context
  const { modality, setModality, isAudioEnabled } = useModalityContext();
  
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
    currentModality
  } = useWebRTCAudioSession(voice, tools);

  // Error state
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      console.log("Setting safety timeout for connecting state");
      safetyTimer = setTimeout(() => {
        console.log("Safety timeout triggered - clearing connecting state");
        setIsConnecting(false);
        setConnectionStatus("Session ready");
      }, 8000); // 8 seconds max wait time (reduced from 10 for faster response)
    }
    
    // Cleanup timer when component unmounts or connecting state changes
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

  // Handle ending a session
  const handleEndSession = () => {
    console.log("Ending session and cleaning up resources");
    
    setSessionState("post");
    setIsPaused(false);
    
    // Clean up microphone stream if active
    if (micStreamRef.current) {
      console.log("Cleaning up microphone stream at session end");
      micStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      micStreamRef.current = null;
    }
    
    if (isSessionActive) {
      // Stop the WebRTC session
      handleStartStopClick();
    }
    
    // Reset modality to text for next session
    setModality("text");
    
    // Generate and save transcript
    const sessionId = `session_${Date.now()}`;
    const transcript = generateTranscript(conversation, sessionId);
    saveTranscript(transcript);
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
      />
    </main>
  );
} 