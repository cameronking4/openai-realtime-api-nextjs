"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  connectionStatus: string;
}

export function LoadingScreen({ connectionStatus }: LoadingScreenProps) {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto'
      }}
    >
      <div className="text-center space-y-6 max-w-md px-6 py-8 bg-white rounded-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="/ai-avatar.png"
            alt="AI Therapist"
            width={120}
            height={120}
            className="rounded-full shadow-md object-cover object-center"
            priority
          />
        </div>
        
        <h2 className="text-2xl font-semibold text-cancer-text">
          Preparing Your Healing Space
        </h2>
        
        <motion.div 
          className="flex items-center justify-center gap-3 text-cancer-accent mt-4"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>{connectionStatus || "Establishing connection..."}</p>
        </motion.div>
        
        <div className="mt-8 space-y-3 text-sm text-cancer-subtle bg-gray-50 p-5 rounded-lg shadow-sm">
          <p>Your conversation is completely private and secure.</p>
          <p className="font-medium">Feel free to take your time and share at your own pace.</p>
        </div>
      </div>
    </motion.div>
  );
} 