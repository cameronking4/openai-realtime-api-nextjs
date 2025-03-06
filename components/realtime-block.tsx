"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MicIcon, MicOffIcon } from 'lucide-react';
import { useModalityContext } from "@/contexts/modality-context";
import useWebRTCAudioSession from "@/hooks/use-webrtc";
import GateSettings from '@/components/gate-settings';
 
const RealtimeBlock: React.FC<{
  voice: string;
  isSessionActive: boolean;
  handleStartStopClick: () => void;
  msgs: any[];
  currentVolume: number;
}> = ({ voice, isSessionActive, handleStartStopClick, msgs, currentVolume }) => {
  const [bars, setBars] = useState(Array(50).fill(5));
  const { modality, setModality, isAudioEnabled } = useModalityContext();
  const [isChangingModality, setIsChangingModality] = useState(false);
  const { 
    updateModality, 
    setGateThreshold, 
    setAiSpeakingThreshold, 
    gateThreshold, 
    aiSpeakingThreshold,
    turnDetectionThreshold,
    setTurnDetectionThreshold,
    silenceDurationMs,
    setSilenceDurationMs,
    updateTurnDetectionSettings,
    audioProcessingEnabled,
    setAudioProcessingEnabled
  } = useWebRTCAudioSession(voice);
  const lastModalityChangeTime = useRef<number>(0);
 
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

  // Handle button click
  const handleButtonClick = async () => {
    // Prevent rapid modality changes (debounce)
    const now = Date.now();
    if (now - lastModalityChangeTime.current < 1000) {
      console.log("Ignoring rapid modality change request");
      return;
    }
    lastModalityChangeTime.current = now;
    
    if (!isSessionActive) {
      // Start session if not active
      handleStartStopClick();
    } else {
      // Toggle modality if session is active
      setIsChangingModality(true);
      const newModality = modality === "text" ? "text+audio" : "text";
      
      try {
        console.log(`Changing modality from ${modality} to ${newModality}`);
        
        // First update the context
        setModality(newModality);
        
        // Then update the WebRTC session
        await updateModality(newModality);
        
        console.log(`Modality changed successfully to ${newModality}`);
      } catch (error) {
        console.error("Error changing modality:", error);
      } finally {
        setIsChangingModality(false);
      }
    }
  };
  
  // Get button appearance based on state
  const getButtonClass = () => {
    if (isChangingModality) {
      return "bg-yellow-500 hover:bg-yellow-600 text-white";
    }
    
    if (!isSessionActive) {
      return "bg-primary hover:bg-primary/90";
    }
    
    return isAudioEnabled 
      ? "bg-red-500 hover:bg-red-600 text-white" 
      : "bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600";
  };
  
  const getButtonTitle = () => {
    if (isChangingModality) {
      return "Changing modality...";
    }
    
    if (!isSessionActive) {
      return "Start Session";
    }
    
    return isAudioEnabled ? "Switch to Text Only" : "Enable Voice";
  };
 
  return (
    <div className="flex items-center justify-center gap-4 p-4 rounded">
      <AnimatePresence>
        {isSessionActive && isAudioEnabled && (
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
        animate={isSessionActive && isAudioEnabled && currentVolume === 0 ? micPulseAnimation : {}}
      >
        <Button 
          onClick={handleButtonClick}
          disabled={isChangingModality}
          className={`flex items-center justify-center w-12 h-12 rounded-full shadow-lg ${getButtonClass()}`}
          title={getButtonTitle()}
        >
          <AnimatePresence>
            {isChangingModality ? (
              <motion.div
                key="changing-modality"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, rotate: 360 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              </motion.div>
            ) : !isSessionActive ? (
              <motion.div
                key="start-session"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <MicIcon size={24} />
              </motion.div>
            ) : isAudioEnabled ? (
              <motion.div
                key="session-active-audio"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <MicIcon size={24} />
              </motion.div>
            ) : (
              <motion.div
                key="session-active-text"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <MicOffIcon size={24} />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
      
      {/* Add the GateSettings component */}
      {isSessionActive && isAudioEnabled && (
        <GateSettings
          onThresholdChange={setGateThreshold}
          onAiThresholdChange={setAiSpeakingThreshold}
          initialThreshold={gateThreshold}
          initialAiThreshold={aiSpeakingThreshold}
          turnDetectionThreshold={turnDetectionThreshold}
          onTurnDetectionThresholdChange={setTurnDetectionThreshold}
          silenceDurationMs={silenceDurationMs}
          onSilenceDurationMsChange={setSilenceDurationMs}
          updateTurnDetectionSettings={updateTurnDetectionSettings}
          onAudioProcessingChange={setAudioProcessingEnabled}
        />
      )}
    </div>
  );
};
 
export default RealtimeBlock; 