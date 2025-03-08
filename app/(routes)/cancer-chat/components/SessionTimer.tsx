"use client";

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface SessionTimerProps {
  duration: number; // in seconds
}

export function SessionTimer({ duration }: SessionTimerProps) {
  const [displayDuration, setDisplayDuration] = useState(duration);
  
  // Update the timer every second if the component receives an initial duration
  useEffect(() => {
    setDisplayDuration(duration);
    
    // If we're receiving an active duration from props, don't increment locally
    if (duration > 0) {
      return;
    }
    
    // Otherwise, increment the timer locally
    const interval = setInterval(() => {
      setDisplayDuration(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [duration]);
  
  // Format the duration as mm:ss
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center space-x-1 text-sm text-gray-500">
      <Clock className="h-3 w-3" />
      <span>{formatDuration(displayDuration)}</span>
    </div>
  );
} 