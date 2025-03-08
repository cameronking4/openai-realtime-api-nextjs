"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/app/_lib/utils";

interface SuggestedResponseButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'cancer-default' | 'cancer-primary' | 'cancer-secondary' | 'cancer-neutral' | 'cancer-subtle';
  isLoading?: boolean;
}

export function SuggestedResponseButton({
  text,
  onClick,
  disabled = false,
  className,
  variant = 'cancer-default',
  isLoading = false,
}: SuggestedResponseButtonProps) {
  // Track when button is actively clicked
  const [isActive, setIsActive] = useState(false);
  
  // Handle click with visual feedback
  const handleClick = () => {
    setIsActive(true);
    onClick();
    
    // Reset active state after a brief delay
    setTimeout(() => {
      setIsActive(false);
    }, 300);
  };

  // All buttons use white background with dark grey border as requested
  // Different variants only affect slight text color variations on the dark grey base
  const getVariantStyles = () => {
    // All text is dark grey as requested, with slight variations based on variant
    switch(variant) {
      case 'cancer-primary':
        return "text-gray-800";
      case 'cancer-secondary':
        return "text-gray-700";
      case 'cancer-neutral':
        return "text-gray-700";
      case 'cancer-subtle':
        return "text-gray-600";
      case 'cancer-default':
      default:
        return "text-gray-700";
    }
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "px-4 py-3 rounded-xl text-left",
        "bg-white border-[1.5px] border-gray-600", // White background with dark grey border
        "transition-all duration-200",
        "focus:outline-none focus:ring-1",
        "min-w-[100px] max-w-full",
        "text-base font-normal",
        "relative overflow-hidden", // For loading animation
        getVariantStyles(),
        isActive ? "ring-2 ring-cancer-accent border-cancer-accent" : "",
        disabled && !isLoading ? "opacity-70 border-gray-400 cursor-not-allowed" : "",
        className
      )}
      aria-label={`Suggested response: ${text}`}
    >
      {/* Content container */}
      <div className="relative">
        {/* Actual text content - hidden when loading */}
        <span className={cn(
          "block",
          isLoading ? "invisible" : "",
          disabled && !isLoading ? "italic text-gray-500" : ""
        )}>
          {text}
        </span>
        
        {/* Google-style text placeholder - only shown when loading */}
        {isLoading && (
          <div className="absolute inset-0">
            {/* Create multiple lines of placeholder with different widths */}
            <div className="flex flex-col gap-1.5">
              {/* First line - longer */}
              <div className="h-3 bg-gray-200 rounded w-[85%] relative overflow-hidden">
                <div className="shimmer-effect absolute inset-0"></div>
              </div>
              
              {/* Second line - shorter */}
              <div className="h-3 bg-gray-200 rounded w-[65%] relative overflow-hidden">
                <div className="shimmer-effect absolute inset-0"></div>
              </div>
              
              {/* For longer text, add a third very short line */}
              {text.length > 30 && (
                <div className="h-3 bg-gray-200 rounded w-[40%] relative overflow-hidden">
                  <div className="shimmer-effect absolute inset-0"></div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.button>
  );
} 