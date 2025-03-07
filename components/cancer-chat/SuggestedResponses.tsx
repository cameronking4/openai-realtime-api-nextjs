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
  // Track if we've sent a message and are waiting for a response
  const [waitingForResponse, setWaitingForResponse] = useState(false);
  // Track the last conversation length to detect new messages
  const [lastConversationLength, setLastConversationLength] = useState(0);
  
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

  // Monitor conversation changes to detect new messages
  useEffect(() => {
    // Check if conversation length has increased
    if (conversation.length > lastConversationLength) {
      // New message received, update state
      setLastConversationLength(conversation.length);
      
      // If we were waiting for a response, we got it
      if (waitingForResponse) {
        // Clear loading and waiting states
        setIsLoading(false);
        setWaitingForResponse(false);
      }
    } else {
      // Just update the length tracker
      setLastConversationLength(conversation.length);
    }
  }, [conversation, lastConversationLength, waitingForResponse]);

  // Handle suggestion click with loading state
  const handleSuggestionClick = (suggestion: string) => {
    // Don't do anything if showing placeholders
    if (showPlaceholders) return;
    
    // Set loading state for buttons
    setIsLoading(true);
    // Set waiting state to track that we're expecting a response
    setWaitingForResponse(true);
    
    // Call the actual handler
    onSuggestionClick(suggestion);
  };

  return (
    <div className="space-y-3">
      {/* Loading message to explain what's happening */}
      {isLoading && waitingForResponse && (
        <div className="text-center text-sm text-gray-500 mb-2 animate-pulse">
          Waiting for response... New suggestions will appear soon
        </div>
      )}
      
      {/* Suggestion buttons grid */}
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
            disabled={disabled || (isLoading && waitingForResponse) || showPlaceholders}
            variant={getButtonVariant(source, index)}
            isLoading={isLoading && waitingForResponse}
          />
        ))}
      </div>
    </div>
  );
} 