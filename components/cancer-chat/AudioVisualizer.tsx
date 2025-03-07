"use client";

import React from "react";

interface AudioVisualizerProps {
  volume: number;
  isActive: boolean;
}

export function AudioVisualizer({ volume, isActive }: AudioVisualizerProps) {
  // Render function for visualization bars
  const renderBars = () => {
    return Array.from({ length: 10 }).map((_, i) => {
      // Calculate height based on position and volume
      const position = i < 5 ? i : 9 - i; // 0,1,2,3,4,4,3,2,1,0
      const scale = 0.5 + position * 0.1; // Vary scale by position
      
      // Adjust height and width based on volume and position
      const maxHeight = 16; // maximum height in pixels
      const height = isActive 
        ? Math.max(2, Math.min(maxHeight, volume * maxHeight * 4 * scale)) 
        : 2;
      const width = Math.max(1, height / 4);
      
      return (
        <div
          key={i}
          className="bg-cancer-voice rounded-full transition-all duration-150"
          style={{
            height: `${height}px`,
            width: `${width}px`,
            opacity: (!isActive || volume < 0.01) ? 0.3 : 1
          }}
        />
      );
    });
  };
  
  return (
    <div className="flex items-center justify-center h-8 gap-1 px-4 py-2 bg-gray-50 rounded-md">
      {renderBars()}
    </div>
  );
} 