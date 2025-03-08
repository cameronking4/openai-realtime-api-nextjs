"use client";

import React, { useState, useEffect, useRef } from "react";
import { Conversation } from "@/app/_lib/conversations";
import useWebRTCAudioSession from "@/app/_hooks/use-webrtc";
import { useModalityContext } from "@/app/_contexts/modality-context";
import { useVoiceContext } from "@/app/_contexts/voice-context";
import { tools } from "@/app/_lib/tools";
import { CancerChatContainer } from "./CancerChatContainer";

interface CancerChatPageClientProps {
  initialModality?: 'text' | 'text+audio';
  hasCompletedOnboarding?: boolean;
}

export function CancerChatPageClient({ 
  initialModality = 'text',
  hasCompletedOnboarding = false
}: CancerChatPageClientProps) {
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
  
  // Set initial modality from server props
  useEffect(() => {
    if (initialModality) {
      setModality(initialModality);
    }
  }, [initialModality, setModality]);
  
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
  };

  // Handle starting a voice+text session
  const handleStartVoiceSession = () => {
    console.log("Starting voice+text session...");
    
    // Set modality first then start session
    setModality("text+audio");
    
    // Start session process immediately
    setConnectionStatus("Preparing voice session...");
    setIsConnecting(true);
    
    // Request microphone access
    navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(stream => {
        console.log("Microphone access granted");
        // Store the stream for later cleanup
        micStreamRef.current = stream;
        
        // Now start the session
        handleStartSession();
      })
      .catch(err => {
        console.error("Microphone access denied:", err);
        setHasError(true);
        setErrorMessage("Microphone access denied. Please allow microphone access and try again.");
        setIsConnecting(false);
      });
  };

  // Handle ending a session
  const handleEndSession = () => {
    console.log("Ending session");
    
    // Stop the WebRTC session
    if (isSessionActive) {
      handleStartStopClick();
    }
    
    // Update local state
    setSessionState("post");
    setIsPaused(false);
    
    // Clean up microphone stream if it exists
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      micStreamRef.current = null;
    }
  };

  // Handle pausing a session
  const handlePauseSession = () => {
    console.log("Pausing session");
    setIsPaused(true);
  };

  // Handle resuming a session
  const handleResumeSession = () => {
    console.log("Resuming session");
    setIsPaused(false);
  };

  // Handle voice toggle
  const handleVoiceToggle = (isActive: boolean) => {
    console.log("Toggling voice:", isActive);
    setModality(isActive ? "text+audio" : "text");
  };

  // Handle sending a text message
  const handleSendMessage = (text: string) => {
    console.log("Sending message:", text);
    
    // Send the message via WebRTC
    sendTextMessage(text);
  };

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

  // Render the component
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <CancerChatContainer
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
        isVoiceEnabled={isAudioEnabled}
        sessionDuration={sessionDuration}
        currentVolume={currentVolume}
        isConnecting={isConnecting}
        connectionStatus={connectionStatus}
      />
    </div>
  );
} 