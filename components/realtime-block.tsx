"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MicIcon, PhoneOff } from 'lucide-react';
import { useModalityContext } from "@/contexts/modality-context";
 
const RealtimeBlock: React.FC<{
  voice: string;
  isSessionActive: boolean;
  handleStartStopClick: () => void;
  msgs: any[];
  currentVolume: number;
}> = ({ voice, isSessionActive, handleStartStopClick, msgs, currentVolume }) => {
  const [bars, setBars] = useState(Array(50).fill(5));
  const { isAudioEnabled } = useModalityContext();
 
  useEffect(() => {
    if (isSessionActive && isAudioEnabled) {
      updateBars(currentVolume);
    } else {
      resetBars();
    }
  }, [currentVolume, isSessionActive, isAudioEnabled]);
 
  const updateBars = (volume: number) => {
    if (volume > 0.002) {
      setBars(bars.map(() => Math.random() * volume * 500));
    } else {
      setBars(Array(50).fill(5));
    }
  };
 
  const resetBars = () => {
    setBars(Array(50).fill(5));
  };
 
  const micPulseAnimation = {
    scale: [1, 1.2, 1],
    opacity: [1, 0.8, 1],
    transition: { duration: 0.8, repeat: Infinity }
  };
 
  // If audio is not enabled, don't show this component
  if (!isAudioEnabled) return null;
 
  return (
    <div className="flex items-center justify-center gap-4 p-4 rounded">
      <AnimatePresence>
        {isSessionActive && (
          <motion.div
            className="flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
          >
            <svg width="200px" height="100px" viewBox="0 0 1000 200" preserveAspectRatio="xMidYMid meet">
              {bars.map((height, index) => (
                <React.Fragment key={index}>
                  <rect
                    x={500 + index * 20 - 490}
                    y={100 - height / 2}
                    width="10"
                    height={height}
                    className={`fill-current ${isSessionActive ? 'text-black dark:text-white opacity-70' : 'text-gray-400 opacity-30'}`}
                  />
                  <rect
                    x={500 - index * 20 - 10}
                    y={100 - height / 2}
                    width="10"
                    height={height}
                    className={`fill-current ${isSessionActive ? 'text-black dark:text-white opacity-70' : 'text-gray-400 opacity-30'}`}
                  />
                </React.Fragment>
              ))}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div
        animate={isSessionActive && currentVolume === 0 ? micPulseAnimation : {}}
      >
        <Button onClick={handleStartStopClick} className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg">
          <AnimatePresence>
            {isSessionActive ? (
              <motion.div
                key="phone-off"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <PhoneOff size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="mic-icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <MicIcon size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
};
 
export default RealtimeBlock; 