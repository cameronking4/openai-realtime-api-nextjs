"use client"

import React, { useState } from "react"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Send, Mic, MicOff } from "lucide-react"
import { useModalityContext } from "@/app/_contexts/modality-context"
import { MessageSuggestions } from "@/app/_components/shared/message-suggestions"

interface TextInputProps {
  onSubmit: (text: string) => void
  disabled?: boolean
  onVoiceToggle?: (isActive: boolean) => void
  isVoiceActive?: boolean
  lastAssistantMessage?: string
}

export function TextInput({ 
  onSubmit, 
  disabled = false, 
  onVoiceToggle,
  isVoiceActive = false,
  lastAssistantMessage = ""
}: TextInputProps) {
  const [text, setText] = useState("")
  const { modality, isAudioEnabled } = useModalityContext();
  const [isMicMuted, setIsMicMuted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onSubmit(text.trim())
      setText("")
    }
  }

  const handleMicToggle = () => {
    // When in text+audio mode, toggle mic mute state
    if (isAudioEnabled && isVoiceActive) {
      setIsMicMuted(!isMicMuted);
      
      // Get all audio tracks and mute/unmute them
      const audioTracks = navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(stream => {
          stream.getAudioTracks().forEach(track => {
            track.enabled = !isMicMuted;
          });
        })
        .catch(err => console.error("Error accessing microphone:", err));
    } 
    // When not in text+audio mode or session not active, use the original toggle behavior
    else if (onVoiceToggle) {
      onVoiceToggle(!isVoiceActive);
    }
  };

  const handleQuickResponse = (response: string) => {
    onSubmit(response);
  };

  // Get button appearance based on state
  const getMicButtonClass = () => {
    if (!isAudioEnabled || !isVoiceActive) {
      return "text-gray-500"; // Default state when not in audio mode
    }
    
    return isMicMuted
      ? "bg-red-500 hover:bg-red-600 text-white" // Muted state
      : "bg-blue-500 hover:bg-blue-600 text-white"; // Unmuted state
  };
  
  const getMicButtonTitle = () => {
    if (!isAudioEnabled) {
      return "Voice mode disabled";
    }
    
    if (!isVoiceActive) {
      return "Enable voice mode";
    }
    
    return isMicMuted ? "Unmute microphone" : "Mute microphone";
  };

  return (
    <div className="space-y-3 w-full">
      {/* Dynamic message suggestions based on last assistant message */}
      <MessageSuggestions 
        message={lastAssistantMessage}
        onSuggestionClick={handleQuickResponse}
        disabled={disabled}
        className="mb-2"
      />

      {/* Text input with voice toggle */}
      <form onSubmit={handleSubmit} className="flex w-full gap-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          className="flex-1"
        />
        
        {isAudioEnabled && onVoiceToggle && (
          <Button 
            type="button" 
            variant={isVoiceActive ? "default" : "outline"}
            disabled={disabled}
            onClick={handleMicToggle}
            size="icon"
            className={getMicButtonClass()}
            title={getMicButtonTitle()}
          >
            {isVoiceActive ? 
              (isMicMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />) 
              : <MicOff className="h-4 w-4" />
            }
          </Button>
        )}
        
        <Button 
          type="submit" 
          disabled={disabled || !text.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}
