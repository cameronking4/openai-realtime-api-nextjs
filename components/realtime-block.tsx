"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useWebRTCAudioSession from "@/hooks/use-webrtc";
import { Button } from "@/components/ui/button";
import { Minimize2, Maximize2 } from "lucide-react";
 
const RealtimeBlock: React.FC<{
  voice: string;
  isSessionActive: boolean;
  handleStartStopClick: () => void;
  msgs: any[];
  currentVolume: number;
}> = ({ voice, isSessionActive, handleStartStopClick, msgs, currentVolume }) => {
  const silenceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
 
  const [mode, setMode] = useState<"idle" | "thinking" | "responding" | "volume" | "">(
    "idle"
  );
  const [volumeLevels, setVolumeLevels] = useState([0, 0, 0, 0]);
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
 
  useEffect(() => {
    if (!isSessionActive) return;
 
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
        setVolumeLevels([0, 0, 0, 0]);
      }, 500);
    }
 
    return () => {
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [currentVolume, isSessionActive, mode]);
 
  useEffect(() => {
    if (isSessionActive) {
      const newMessages = msgs.slice(currentEventIndex);
      if (newMessages.length > 0) {
        newMessages.forEach((msg) => {
          if (msg.type === "input_audio_buffer.speech_started") {
            setMode("thinking");
          } else if (msg.type === "conversation.item.created") {
            setMode("responding");
          }
        });
        setCurrentEventIndex(msgs.length);
      }
    } else {
      setMode("idle");
      setVolumeLevels([0, 0, 0, 0]);
    }
  }, [msgs, isSessionActive, currentEventIndex]);

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
 
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex items-center justify-between w-full mb-2">
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {mode === "idle" ? "Idle" : 
           mode === "thinking" ? "Listening..." : 
           mode === "responding" ? "Processing..." : 
           mode === "volume" ? "Hearing you..." : ""}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0" 
          onClick={toggleMinimize}
        >
          {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
        </Button>
      </div>

      {!isMinimized && (
        <div 
          className="relative w-32 h-32 flex items-center justify-center cursor-pointer" 
          onClick={handleStartStopClick}
        >
          {mode === "thinking" ? (
            // Listening animation - simplified and more calming
            <motion.div
              className="flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 0.9, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut"
              }}
            >
              <div className="border-2 border-blue-300 dark:border-blue-600 w-12 h-12 rounded-full" />
            </motion.div>
          ) : mode === "responding" ? (
            // Thinking animation - simplified
            <motion.div
              initial={{ scale: 0.9, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            >
              <svg
                width="100"
                height="100"
                viewBox="-20 0 190 190"
                xmlns="http://www.w3.org/2000/svg"
                className="text-blue-400 dark:text-blue-500"
                fill="currentColor"
              >
                <motion.path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M129.49 114.51C129.121 116.961 128.187 119.293 126.762 121.322C125.337 123.351 123.461 125.021 121.28 126.2C120.676 126.535 120.043 126.816 119.39 127.04C120.22 138.04 102.74 142.04 93.32 139.42L96.82 151.66L87.82 151.98L72.07 129.43C66.76 130.93 60.49 131.65 56.44 125.15C56.0721 124.553 55.7382 123.935 55.44 123.3C54.4098 123.51 53.3614 123.617 52.31 123.62C49.31 123.62 44.31 122.72 41.77 120.96C39.7563 119.625 38.1588 117.75 37.16 115.55C31.75 116.29 27.16 115.02 24.16 111.88C20.36 107.97 19.28 101.51 21.26 94.58C23.87 85.33 31.81 74.91 47.59 71C48.9589 69.2982 50.5972 67.8322 52.44 66.66C62.35 60.31 78.44 59.76 90.65 65.79C95.3836 64.9082 100.27 65.376 104.75 67.14C113.53 70.43 119.91 77.31 121.11 84.3C123.487 85.5317 125.433 87.4568 126.69 89.82C129.32 94.76 129.69 99.71 127.92 103.71C129.587 107.049 130.138 110.835 129.49 114.51Z"
                />
              </svg>
            </motion.div>
          ) : mode === "volume" ? (
            // Voice volume animation - simplified
            <div className="flex space-x-1 items-center justify-center h-full">
              {volumeLevels.map((level, index) => {
                const height = Math.max(20, Math.min(40, level * 0.4));
                return (
                  <motion.div
                    key={index}
                    className="w-2 bg-green-400 dark:bg-green-500 rounded-md"
                    style={{
                      transformOrigin: 'center'
                    }}
                    initial={{ height: 10 }}
                    animate={{ height }}
                    transition={{
                      type: "spring",
                      stiffness: 200,
                      damping: 10,
                      mass: 0.8,
                    }}
                  />
                );
              })}
            </div>
          ) : mode === "idle" ? (
            // Idle animation - simplified
            <motion.div
              className="bg-slate-200 dark:bg-slate-700 rounded-full"
              style={{ width: 40, height: 40 }}
              initial={{ opacity: 0.6 }}
              animate={{ opacity: 0.8 }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
            />
          ) : (
            // Default solid circle
            <motion.div
              className="bg-slate-300 dark:bg-slate-600 rounded-full"
              style={{ width: 36, height: 36 }}
            />
          )}
        </div>
      )}
    </div>
  );
};
 
export default RealtimeBlock; 