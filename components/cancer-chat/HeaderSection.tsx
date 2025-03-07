"use client";

import React from "react";
import Image from "next/image";
import { Clock, Pause, Play, StopCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface HeaderSectionProps {
  sessionActive: boolean;
  sessionPaused: boolean;
  sessionDuration: number; // in seconds
  onPauseSession?: () => void;
  onResumeSession?: () => void;
  onEndSession?: () => void;
  className?: string;
  isConnecting?: boolean; // Add connection state
  connectionStatus?: string; // Add connection status text
}

export function HeaderSection({
  sessionActive,
  sessionPaused,
  sessionDuration,
  onPauseSession,
  onResumeSession,
  onEndSession,
  className,
  isConnecting = false,
  connectionStatus = "",
}: HeaderSectionProps) {
  // Format session duration (convert seconds to MM:SS)
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Determine status color
  const getStatusColor = () => {
    if (isConnecting) return "bg-yellow-400 animate-pulse";
    if (sessionPaused) return "bg-cancer-paused";
    if (sessionActive) return "bg-cancer-active";
    return "bg-cancer-subtle";
  };

  // Determine status text
  const getStatusText = () => {
    // Show connection status when connecting
    if (isConnecting) {
      // Format the connection status for display
      const displayStatus = connectionStatus || "Connecting...";
      return displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1);
    }
    
    // Normal session states
    if (sessionPaused) return "Paused";
    if (sessionActive) return "Active Session";
    return "Not Started";
  };

  return (
    <header className={cn(
      "flex items-center justify-between w-full px-6 py-4 bg-cancer-background shadow-sm",
      className
    )}>
      {/* Logo Section */}
      <div className="flex items-center space-x-2">
        <Image 
          src="/livingwell_logo.png" 
          alt="Living Well with Cancer" 
          width={40} 
          height={40}
          className="object-contain"
        />
        <h1 className="text-lg font-medium text-cancer-text hidden sm:block">
          Living Well with Cancer
        </h1>
      </div>

      {/* Status and Control Section */}
      <div className="flex items-center space-x-4">
        {/* Session Duration */}
        {(sessionActive || sessionPaused) && !isConnecting && (
          <div className="flex items-center text-cancer-text text-sm">
            <Clock className="h-4 w-4 mr-1 text-cancer-subtle" />
            <span>{formatDuration(sessionDuration)}</span>
          </div>
        )}

        {/* Status Indicator */}
        <div className="flex items-center space-x-2">
          <div className={cn(
            "h-3 w-3 rounded-full", 
            getStatusColor()
          )} />
          <span className="text-sm text-cancer-text">
            {getStatusText()}
          </span>
        </div>

        {/* Session Controls in Header */}
        <AnimatePresence>
          {sessionActive && !isConnecting && (
            <div className="flex space-x-2 ml-2">
              {/* Pause/Resume Button */}
              {sessionPaused ? (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onResumeSession}
                  className="bg-cancer-active text-white p-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                  title="Resume Session"
                  aria-label="Resume Session"
                >
                  <Play size={16} />
                </motion.button>
              ) : (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onPauseSession}
                  className="bg-cancer-paused text-white p-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                  title="Pause Session"
                  aria-label="Pause Session"
                >
                  <Pause size={16} />
                </motion.button>
              )}

              {/* End Session Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEndSession}
                className="bg-white border border-cancer-subtle text-cancer-text p-2 rounded-full shadow-sm hover:shadow-md transition-all duration-300"
                title="End Session"
                aria-label="End Session"
              >
                <StopCircle size={16} />
              </motion.button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
} 