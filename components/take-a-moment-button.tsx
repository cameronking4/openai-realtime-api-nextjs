"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface TakeAMomentButtonProps {
  onPause: () => void;
  onResume: () => void;
}

export default function TakeAMomentButton({ onPause, onResume }: TakeAMomentButtonProps) {
  const [isPaused, setIsPaused] = useState(false);
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);

  const handleClick = () => {
    if (isPaused) {
      setShowBreathingExercise(false);
      // Give a moment for the breathing exercise to animate out
      setTimeout(() => {
        setIsPaused(false);
        onResume();
      }, 500);
    } else {
      setIsPaused(true);
      onPause();
      // Show breathing exercise after a short delay
      setTimeout(() => {
        setShowBreathingExercise(true);
      }, 300);
    }
  };

  return (
    <div className="relative">
      <Button
        variant={isPaused ? "default" : "outline"}
        onClick={handleClick}
        className={`flex items-center gap-2 transition-all ${
          isPaused ? "bg-blue-500 hover:bg-blue-600 text-white" : "text-blue-500 hover:text-blue-600"
        }`}
      >
        {isPaused ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Resume Session
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Take a Moment
          </>
        )}
      </Button>

      <AnimatePresence>
        {showBreathingExercise && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-12 right-0 z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-80 border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-lg font-medium mb-3 text-slate-800 dark:text-slate-100">Take a deep breath</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-4">
              Breathe in for 4 seconds, hold for 4 seconds, then exhale for 6 seconds.
            </p>
            
            <div className="flex justify-center mb-4">
              <BreathingAnimation />
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Take as much time as you need. Click "Resume Session" when you're ready to continue.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple breathing animation component
function BreathingAnimation() {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.3, 1.3, 1],
          opacity: [0.5, 0.8, 0.8, 0.5],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "loop",
          times: [0, 0.4, 0.6, 1],
        }}
        className="absolute inset-0 rounded-full bg-blue-100 dark:bg-blue-900"
      />
      <motion.div
        animate={{
          scale: [1, 1.2, 1.2, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "loop",
          times: [0, 0.4, 0.6, 1],
        }}
        className="text-blue-500 dark:text-blue-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </motion.div>
    </div>
  );
} 