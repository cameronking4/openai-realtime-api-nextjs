"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/app/_lib/utils";
import ThreeDotsWave from "@/app/_components/ui/three-dots-wave";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";

interface MessageBubbleProps {
  isUser: boolean;
  text: string;
  timestamp: Date | string;
  isProcessing?: boolean;
  isSpeaking?: boolean;
}

export function MessageBubble({
  isUser,
  text,
  timestamp,
  isProcessing = false,
  isSpeaking = false,
}: MessageBubbleProps) {
  // Format timestamp
  const formattedTime = typeof timestamp === 'string' 
    ? new Date(timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })
    : timestamp.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex items-start gap-3 mb-4",
        isUser ? "justify-end" : ""
      )}
    >
      {/* AI Avatar */}
      {!isUser && (
        <Avatar className="w-8 h-8 shrink-0 shadow-sm overflow-hidden">
          <AvatarImage 
            src="/ai-avatar.png" 
            alt="AI Therapist" 
            className="object-cover object-center"
          />
          <AvatarFallback className="bg-cancer-ai-message text-cancer-text">AI</AvatarFallback>
        </Avatar>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          "px-4 py-3 rounded-2xl max-w-[75%] shadow-md",
          isUser 
            ? "bg-cancer-user-message text-cancer-text" 
            : "bg-cancer-ai-message text-cancer-text"
        )}
        style={{ backdropFilter: 'none' }}
      >
        {isProcessing || isSpeaking ? (
          // Show wave animation for processing or speaking status
          <ThreeDotsWave />
        ) : (
          // Otherwise, show the message text
          <p className="leading-relaxed text-base">{text}</p>
        )}

        {/* Timestamp below */}
        <div className="text-xs text-cancer-subtle mt-1">
          {formattedTime}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <Avatar className="w-8 h-8 shrink-0 shadow-sm">
          <AvatarFallback className="bg-cancer-user-message text-cancer-text">You</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
} 