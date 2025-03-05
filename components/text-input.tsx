"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mic, MicOff } from "lucide-react"
import { useModalityContext } from "@/contexts/modality-context"

interface TextInputProps {
  onSubmit: (text: string) => void
  disabled?: boolean
  onVoiceToggle?: (isActive: boolean) => void
  isVoiceActive?: boolean
}

export function TextInput({ 
  onSubmit, 
  disabled = false, 
  onVoiceToggle,
  isVoiceActive = false
}: TextInputProps) {
  const [text, setText] = useState("")
  const { modality, isAudioEnabled } = useModalityContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim()) {
      onSubmit(text.trim())
      setText("")
    }
  }

  const handleVoiceToggle = () => {
    if (onVoiceToggle) {
      onVoiceToggle(!isVoiceActive);
    }
  };

  const handleQuickResponse = (response: string) => {
    onSubmit(response);
  };

  return (
    <div className="space-y-3 w-full">
      {/* Quick response buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleQuickResponse("Yes")}
          disabled={disabled}
          className="text-sm px-3 py-1 h-8 bg-white dark:bg-slate-800"
        >
          Yes
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleQuickResponse("No")}
          disabled={disabled}
          className="text-sm px-3 py-1 h-8 bg-white dark:bg-slate-800"
        >
          No
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleQuickResponse("Not sure")}
          disabled={disabled}
          className="text-sm px-3 py-1 h-8 bg-white dark:bg-slate-800"
        >
          Not sure
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleQuickResponse("Can you explain more?")}
          disabled={disabled}
          className="text-sm px-3 py-1 h-8 bg-white dark:bg-slate-800"
        >
          Can you explain more?
        </Button>
      </div>

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
            onClick={handleVoiceToggle}
            size="icon"
            className={isVoiceActive ? "bg-blue-500 hover:bg-blue-600 text-white" : "text-gray-500"}
          >
            {isVoiceActive ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
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
