"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useWebRTCAudioSession from "@/hooks/use-webrtc";
import { Button } from "@/components/ui/button";
import { Minimize2, Maximize2 } from "lucide-react";
import { useModalityContext } from "@/contexts/modality-context";
 
const RealtimeBlock: React.FC<{
  voice: string;
  isSessionActive: boolean;
  handleStartStopClick: () => void;
  msgs: any[];
  currentVolume: number;
}> = ({ voice, isSessionActive, handleStartStopClick, msgs, currentVolume }) => {
  const silenceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const { isAudioEnabled } = useModalityContext();
 
  const [mode, setMode] = useState<"idle" | "thinking" | "responding" | "volume" | "">(
    "idle"
  );
  const [volumeLevels, setVolumeLevels] = useState([0, 0, 0, 0]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
 
  useEffect(() => {
    if (!isSessionActive || !isAudioEnabled) return;
 
    if (currentVolume > 0.02) {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      setMode("volume");
      setVolumeLevels((prev) =>
        prev.map(() =>
          Math.min(100, Math.max(10, currentVolume * Math.random() * 5))
        )
      );
    } else if (mode === "volume") {
      silenceTimeoutRef.current = setTimeout(() => {
        setMode("idle");
      }, 500);
    }
 
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [currentVolume, isSessionActive, mode, isAudioEnabled]);
 
  useEffect(() => {
    if (!isSessionActive || !isAudioEnabled) {
      setMode("idle");
      return;
    }
 
    const newMsgs = msgs.slice(currentEventIndex);
    setCurrentEventIndex(msgs.length);
 
    if (newMsgs.some((msg) => msg.type === "error")) {
      setMode("idle");
    } else if (
      newMsgs.some((msg) => msg.type === "response.output_item.added")
    ) {
      setMode("responding");
    } else if (
      newMsgs.some((msg) => msg.type === "response.created")
    ) {
      setMode("thinking");
    }
  }, [msgs, currentEventIndex, isSessionActive, isAudioEnabled]);
 
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
 
  // If audio is not enabled, don't show this component
  if (!isAudioEnabled) return null;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-0 right-0 z-10"
        onClick={toggleMinimize}
      >
        {isMinimized ? (
          <Maximize2 className="h-4 w-4" />
        ) : (
          <Minimize2 className="h-4 w-4" />
        )}
      </Button>
 
      {!isMinimized && (
        <div className="flex flex-col items-center p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {mode === "idle" && "Listening..."}
            {mode === "thinking" && "Thinking..."}
            {mode === "responding" && "Responding..."}
            {mode === "volume" && "Hearing you..."}
          </div>
 
          <div
            className={`flex items-end justify-center h-16 w-24 gap-1 ${
              isSessionActive ? "" : "opacity-50"
            }`}
          >
            {mode === "volume" ? (
              // Volume visualization
              volumeLevels.map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-blue-500"
                  initial={{ height: 4 }}
                  animate={{ height: h }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 5,
                  }}
                />
              ))
            ) : mode === "thinking" ? (
              // Thinking animation (three dots)
              Array(3)
                .fill(0)
                .map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-gray-400"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))
            ) : mode === "responding" ? (
              // Responding animation (wave)
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-green-500"
                    animate={{
                      height: [5, 15, 5],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  />
                ))
            ) : (
              // Idle animation (low waves)
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-gray-300"
                    animate={{
                      height: [3, 6, 3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
 
export default RealtimeBlock; 