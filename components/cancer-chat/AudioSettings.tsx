"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AudioSettingsProps {
  isActive: boolean;
}

export function AudioSettings({ isActive }: AudioSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [noiseGate, setNoiseGate] = useState(0.01);
  
  const toggleSettings = () => {
    setIsOpen(prev => !prev);
  };
  
  const handleNoiseGateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setNoiseGate(value);
    // In a real implementation, you would call an API to update the noise gate setting
  };
  
  if (!isActive) return null;
  
  return (
    <div className="absolute bottom-4 right-4 z-30">
      <Button
        onClick={toggleSettings}
        className="rounded-full w-10 h-10 bg-gray-100 hover:bg-gray-200 text-cancer-text shadow-md"
        title="Audio settings"
      >
        <Settings size={18} />
      </Button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-12 right-0 bg-white shadow-lg rounded-lg p-4 w-72"
          >
            <h4 className="text-sm font-medium mb-3">Audio Settings</h4>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Noise Gate Threshold
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    min="0" 
                    max="0.1" 
                    step="0.001" 
                    value={noiseGate} 
                    onChange={handleNoiseGateChange} 
                    className="w-full accent-cancer-voice"
                  />
                  <span className="text-xs w-12 text-right">
                    {(noiseGate * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Higher values filter out more background noise
                </p>
              </div>
              
              <div className="pt-2 border-t border-gray-100">
                <h5 className="text-xs font-medium mb-2">Audio Status</h5>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs">Voice input active</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 