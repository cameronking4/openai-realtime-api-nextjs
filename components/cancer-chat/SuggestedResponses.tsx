"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SuggestedResponseButton } from "./SuggestedResponseButton";

interface SuggestedResponsesProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  disabled?: boolean;
  className?: string;
  maxToShow?: number;
  source?: string;
  conversation?: any[]; // To detect when new messages come in
}

export function SuggestedResponses({
  suggestions,
  onSuggestionClick,
  disabled = false,
  className,
  maxToShow = 4,
  source = 'default',
  conversation = []
}: SuggestedResponsesProps) {
  // Track loading state for all buttons
  const [isLoading, setIsLoading] = useState(false);
  
  // Determine if we should show placeholder buttons
  const showPlaceholders = suggestions.length === 0 || suggestions.every(s => !s.trim());
  
  // Generate placeholder suggestions with aesthetic, gentle content
  const placeholderSuggestions = [
    "I understand what you're saying...",
    "That's helpful to know...",
    "I'd like to share more...",
    "Let me think about that..."
  ];
  
  // Limit suggestions to the max number to show
  const limitedSuggestions = suggestions.slice(0, maxToShow);
  
  // Use placeholder suggestions if needed
  const displayedSuggestions = showPlaceholders ? placeholderSuggestions : limitedSuggestions;

  // Get button style based on the source of suggestions
  const getButtonVariant = (source: string, index: number) => {
    // If showing placeholders, use subtle styling
    if (showPlaceholders) {
      return "cancer-subtle";
    }
    
    // Determine the variant based on source and index
    switch(source) {
      case 'api':
        // Different variants for AI-generated suggestions
        return index % 2 === 0 ? "cancer-primary" : "cancer-secondary";
      case 'pattern-matching':
        // Different variants for pattern-matched suggestions
        return index % 2 === 0 ? "cancer-secondary" : "cancer-neutral";
      case 'error-fallback':
        // Error fallback suggestions
        return "cancer-subtle";
      case 'default':
      default:
        // Default suggestions - standard style
        return "cancer-default";
    }
  };

  // Reset loading state when new messages arrive in the conversation
  useEffect(() => {
    if (conversation && conversation.length > 0 && isLoading) {
      // If we're loading and a new message arrives, clear the loading state
      setIsLoading(false);
    }
  }, [conversation, isLoading]);

  // Handle suggestion click with loading state
  const handleSuggestionClick = (suggestion: string) => {
    // Don't do anything if showing placeholders
    if (showPlaceholders) return;
    
    setIsLoading(true);
    
    // Call the actual handler
    onSuggestionClick(suggestion);
  };

  return (
    <div
      className={cn(
        "w-full grid grid-cols-1 sm:grid-cols-2 gap-3",
        className
      )}
      aria-label="Suggested responses"
    >
      {displayedSuggestions.map((suggestion, index) => (
        <SuggestedResponseButton
          key={`suggestion-${index}`}
          text={suggestion}
          onClick={() => handleSuggestionClick(suggestion)}
          disabled={disabled || isLoading || showPlaceholders}
          variant={getButtonVariant(source, index)}
          isLoading={isLoading && !showPlaceholders}
        />
      ))}
    </div>
  );
} 