"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Play, Pause, StopCircle } from "lucide-react";
import { motion } from "framer-motion";

interface SessionControlsProps {
  sessionState: "pre" | "active" | "post";
  isPaused: boolean;
  onStartSession: () => void;
  onPauseSession: () => void;
  onResumeSession: () => void;
  onEndSession: () => void;
  className?: string;
}

export function SessionControls({
  sessionState,
  isPaused,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onEndSession,
  className,
}: SessionControlsProps) {
  return (
    <motion.div 
      layout
      className={cn(
        "flex justify-center gap-4 w-full",
        className
      )}
    >
      {sessionState === "pre" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onStartSession}
            className="bg-cancer-accent hover:bg-cancer-accent/90 text-white font-medium px-6 py-2 rounded-full transition-all duration-300"
            aria-label="Start session"
          >
            Start Session
          </Button>
        </motion.div>
      )}

      {sessionState === "active" && (
        <>
          {isPaused ? (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onResumeSession}
                className="bg-cancer-active hover:bg-cancer-active/90 text-white flex items-center gap-2 font-medium px-6 py-2 rounded-full transition-all duration-300"
                aria-label="Resume session"
              >
                <Play size={16} />
                Resume
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={onPauseSession}
                className="bg-cancer-paused hover:bg-cancer-paused/90 text-white flex items-center gap-2 font-medium px-6 py-2 rounded-full transition-all duration-300"
                aria-label="Pause session"
              >
                <Pause size={16} />
                Pause
              </Button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onEndSession}
              variant="outline"
              className="border-cancer-subtle text-cancer-text hover:bg-gray-100 flex items-center gap-2 font-medium px-6 py-2 rounded-full transition-all duration-300"
              aria-label="End session"
            >
              <StopCircle size={16} />
              End Session
            </Button>
          </motion.div>
        </>
      )}

      {sessionState === "post" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onStartSession}
            className="bg-cancer-accent hover:bg-cancer-accent/90 text-white font-medium px-6 py-2 rounded-full transition-all duration-300"
            aria-label="Start new session"
          >
            Start New Session
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
} 