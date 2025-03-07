"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PreSessionOptionsProps {
  onStartTextSession: () => void;
  onStartVoiceSession: () => void;
  className?: string;
}

export function PreSessionOptions({
  onStartTextSession,
  onStartVoiceSession,
  className,
}: PreSessionOptionsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn("w-full flex flex-col items-center mt-8 relative z-20", className)}
    >
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md bg-transparent p-4">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartTextSession}
          className="bg-cancer-accent text-white font-medium shadow-md border-0 hover:bg-cancer-accent/90 transition-all duration-300 w-full px-6 py-3 rounded-full relative z-20"
          aria-label="Start text-only session"
        >
          Text-Only Mode
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartVoiceSession}
          className="bg-cancer-active text-white font-medium shadow-md border-0 hover:bg-cancer-active/90 transition-all duration-300 w-full px-6 py-3 rounded-full relative z-20"
          aria-label="Start voice session"
        >
          Voice + Text Mode
        </motion.button>
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-sm text-cancer-subtle mt-4 bg-white px-4 py-2 rounded-lg shadow-sm relative z-10"
      >
        Choose your preferred mode to begin
      </motion.p>
    </motion.div>
  );
} 