"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Conversation } from "@/app/_lib/conversations";
import { MessageDisplay } from "./MessageDisplay";
import { cn } from "@/app/_lib/utils";

interface CancerChatContainerProps {
  conversation: Conversation[];
  onSendMessage: (text: string) => void;
  onVoiceToggle: (isActive: boolean) => void;
  onStartSession: () => void;
  onStartTextSession: () => void;
  onStartVoiceSession: () => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onEndSession: () => void;
  sessionState: "pre" | "active" | "post";
  isPaused: boolean;
  isVoiceActive: boolean;
  isVoiceEnabled: boolean;
  sessionDuration: number;
  currentVolume?: number;
  isConnecting?: boolean;
  connectionStatus?: string;
  className?: string;
}

export function CancerChatContainer({
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
  isVoiceActive,
  isVoiceEnabled,
  sessionDuration,
  currentVolume = 0,
  isConnecting = false,
  connectionStatus = "",
  className,
}: CancerChatContainerProps) {
  // Generate a session ID if one doesn't exist
  const [sessionId] = useState(() => uuidv4());
  
  return (
    <div className={cn("flex flex-col h-full max-w-4xl mx-auto", className)}>
      {/* Header Section */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Your Healing Check-in</h1>
          <div className="flex space-x-2">
            {sessionState === "active" && (
              <>
                {isPaused ? (
                  <button 
                    onClick={onResumeSession}
                    className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                  >
                    Resume
                  </button>
                ) : (
                  <button 
                    onClick={onPauseSession}
                    className="px-2 py-1 bg-yellow-500 text-white rounded text-sm"
                  >
                    Pause
                  </button>
                )}
                <button 
                  onClick={onEndSession}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                >
                  End
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-lg shadow-md">
        {/* Loading Screen */}
        {isConnecting && (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-medium text-gray-700">{connectionStatus || "Connecting..."}</p>
          </div>
        )}
        
        {/* Pre-Session Options */}
        {sessionState === "pre" && !isConnecting && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md p-4">
              <button
                onClick={onStartTextSession}
                className="bg-blue-500 text-white font-medium shadow-md border-0 hover:bg-blue-600 transition-all duration-300 w-full px-6 py-3 rounded-full"
              >
                Text-Only Mode
              </button>
              <button
                onClick={onStartVoiceSession}
                className="bg-purple-500 text-white font-medium shadow-md border-0 hover:bg-purple-600 transition-all duration-300 w-full px-6 py-3 rounded-full"
              >
                Voice + Text Mode
              </button>
            </div>
          </div>
        )}
        
        {/* Active Session Content */}
        {(sessionState === "active" || sessionState === "post") && !isConnecting && (
          <>
            {/* Messages Display */}
            <MessageDisplay 
              conversation={conversation}
              isConnecting={isConnecting}
            />
            
            {/* Suggested Responses */}
            {sessionState === "active" && conversation.length > 0 && (
              <div className="p-3 border-t">
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => onSendMessage("Tell me more about that")}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                  >
                    Tell me more about that
                  </button>
                  <button 
                    onClick={() => onSendMessage("How can I manage this?")}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                  >
                    How can I manage this?
                  </button>
                  <button 
                    onClick={() => onSendMessage("What are my options?")}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                  >
                    What are my options?
                  </button>
                </div>
              </div>
            )}
            
            {/* Post-Session Actions */}
            {sessionState === "post" && (
              <div className="p-4 border-t">
                <h3 className="text-lg font-medium mb-2">Session Complete</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Thank you for completing your session. You can download or save your transcript below.
                </p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Download Transcript
                  </button>
                  <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
                    Save Transcript
                  </button>
                </div>
              </div>
            )}
            
            {/* Input Section - Only show during active session */}
            {sessionState === "active" && (
              <div className="border-t p-4">
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                        onSendMessage((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600"
                    onClick={() => {
                      const input = document.querySelector('input') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        onSendMessage(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    Send
                  </button>
                  <button
                    className={`ml-2 p-2 rounded-md ${isVoiceActive ? 'bg-purple-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => onVoiceToggle(!isVoiceActive)}
                  >
                    {isVoiceActive ? 'Mic On' : 'Mic Off'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Session Controls */}
      {sessionState === "active" && (
        <div className="p-3 border-t flex justify-between items-center text-sm">
          <div>
            Session time: {formatDuration(sessionDuration)}
          </div>
          <div className="flex items-center">
            {isPaused ? (
              <span className="text-yellow-500 font-medium">Paused</span>
            ) : (
              <span className="text-green-500 font-medium">Active</span>
            )}
            {isVoiceActive && (
              <div className="ml-4 flex items-center">
                <span className="mr-2">Volume:</span>
                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${Math.min(currentVolume * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Format the duration as mm:ss
function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
} 