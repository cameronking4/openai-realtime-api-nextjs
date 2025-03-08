"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic as MicIcon, MicOff as MicOffIcon } from "lucide-react";

// Gate settings component for audio threshold controls
interface GateSettingsProps {
  onThresholdChange?: (value: number) => void;
}

const GateSettings: React.FC<GateSettingsProps> = ({ 
  onThresholdChange = () => {} 
}) => {
  const [localThreshold, setLocalThreshold] = useState(0.01);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setLocalThreshold(value);
    onThresholdChange(value);
  };
  
  return (
    <div className="mt-2 text-xs text-gray-500">
      <div className="flex items-center gap-2">
        <span>Noise Gate:</span>
        <input 
          type="range" 
          min="0" 
          max="0.1" 
          step="0.001" 
          value={localThreshold} 
          onChange={handleChange} 
          className="w-full accent-cancer-voice"
        />
        <span>{(localThreshold * 100).toFixed(1)}%</span>
      </div>
    </div>
  );
};

const RealtimeBlock: React.FC<{
  voice: string;
  isSessionActive: boolean;
  handleStartStopClick: () => void;
  msgs: any[];
  currentVolume: number;
  showVoiceVisualizer?: boolean;
  compact?: boolean;
}> = ({ 
  voice, 
  isSessionActive, 
  handleStartStopClick, 
  msgs, 
  currentVolume,
  showVoiceVisualizer = false,
  compact = true,
}) => {
  const [gateThreshold, setGateThreshold] = useState(0.01);
  
  // Simple handler for the button click
  const handleButtonClick = async () => {
    // Simply call the parent's handler
    handleStartStopClick();
  };

  const getButtonClass = () => {
    // Base classes
    let classes = "rounded-full flex items-center justify-center transition-all duration-200 ";
    
    // Sizing classes based on compact mode
    classes += compact ? "w-10 h-10 " : "w-12 h-12 ";
    
    // State-specific classes
    if (!isSessionActive) {
      // Disabled state - grey when disabled
      classes += "bg-gray-200 text-gray-500 cursor-not-allowed ";
    } else if (voice === "none") {
      // Text-only mode - blue button
      classes += "bg-cancer-accent hover:bg-cancer-accent/80 text-white ";
    } else {
      // Voice mode (active) - green button
      classes += "bg-cancer-voice hover:bg-cancer-voice/80 text-white ";
      
      // Add pulse animation if there's voice activity
      if (currentVolume > 0.05) {
        classes += "animate-pulse ";
      }
    }
    
    return classes;
  };

  const getButtonTitle = () => {
    if (!isSessionActive) {
      return "Voice input not available";
    }
    if (voice === "none") {
      return "Enable voice input";
    }
    return "Disable voice input";
  };

  // Return compact version (just the button) if compact=true
  if (compact) {
    // Only log when state changes to reduce noise
    const stateRef = useRef({ voice, isSessionActive });
    
    useEffect(() => {
      // Only log if there's an actual state change
      if (stateRef.current.voice !== voice || stateRef.current.isSessionActive !== isSessionActive) {
        console.log(`RealtimeBlock state changed: voice=${voice}, isSessionActive=${isSessionActive}`);
        stateRef.current = { voice, isSessionActive };
      }
    }, [voice, isSessionActive]);
    
    return (
      <button
        onClick={isSessionActive ? handleButtonClick : undefined}
        className={getButtonClass()}
        title={getButtonTitle()}
        disabled={!isSessionActive}
        aria-label={getButtonTitle()}
        data-voice-state={voice !== "none" ? "active" : "inactive"}
      >
        {voice !== "none" ? <MicIcon size={20} /> : <MicOffIcon size={20} />}
      </button>
    );
  }

  // Return full version with visualizer
  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full mb-2 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {showVoiceVisualizer && voice !== "none" && isSessionActive ? (
              <div className="flex items-center justify-center h-8 gap-1">
                {/* Create visualization bars with inline styles based on current volume */}
                {Array.from({length: 10}).map((_, i) => {
                  // Calculate height based on position and volume
                  const position = i < 5 ? i : 9 - i; // 0,1,2,3,4,4,3,2,1,0
                  const scale = 0.5 + position * 0.1; // Vary scale by position
                  const maxHeight = 16; // Maximum height in pixels
                  const height = Math.max(2, Math.min(maxHeight, currentVolume * maxHeight * 4 * scale));
                  const width = Math.max(1, height / 4);
                  
                  return (
                    <div
                      key={i}
                      className="bg-cancer-voice rounded-full transition-all duration-150"
                      style={{
                        height: `${height}px`,
                        width: `${width}px`,
                        opacity: currentVolume < 0.01 ? 0.3 : 1
                      }}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center">
                {!isSessionActive 
                  ? "Voice input not available" 
                  : voice === "none" 
                    ? "Voice input is disabled" 
                    : "Voice input is enabled"}
              </div>
            )}
          </div>
          <button
            onClick={isSessionActive ? handleButtonClick : undefined}
            className={getButtonClass()}
            disabled={!isSessionActive}
            aria-label={getButtonTitle()}
          >
            {voice !== "none" ? <MicIcon size={20} /> : <MicOffIcon size={20} />}
          </button>
        </div>
        
        {/* Only show gate settings in full version and when session is active */}
        {!compact && isSessionActive && voice !== "none" && (
          <GateSettings
            onThresholdChange={setGateThreshold}
          />
        )}
      </div>
    </div>
  );
};

export default RealtimeBlock; 