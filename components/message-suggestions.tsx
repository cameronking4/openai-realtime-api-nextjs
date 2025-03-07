"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Define types for API response
interface SuggestionsResponse {
  suggestions: string[];
  source: 'api' | 'pattern-matching' | 'default' | 'error-fallback';
  matchedPattern?: string;
}

// Global cache to persist suggestions between component mounts
// Add a timestamp to prevent long-term caching (refresh every 5 minutes)
const getCacheKey = (message: string) => {
  const timestamp = Math.floor(Date.now() / (5 * 60 * 1000)); // 5-minute buckets
  return `${message}-${timestamp}`;
};

const globalSuggestionsCache = new Map<string, {
  suggestions: string[], 
  source: string,
  matchedPattern?: string
}>();

interface MessageSuggestionsProps {
  message: string;
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
  disabled?: boolean;
}

export function MessageSuggestions({ 
  message, 
  onSuggestionClick, 
  className = "", 
  disabled = false 
}: MessageSuggestionsProps) {
  // Default suggestions that will always be shown immediately
  const defaultSuggestions = [
    "Yes, I'd like to know more about that",
    "No, let's talk about something else",
    "Could you explain that in more detail?",
    "Why do you think that's important?"
  ];
  
  const [suggestions, setSuggestions] = useState<string[]>(defaultSuggestions);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<string>('default');
  const [matchedPattern, setMatchedPattern] = useState<string | undefined>(undefined);
  
  // Debug mode - set to true to show more information about the matched pattern
  const debugMode = true;
  
  // Use a ref to track if the component is mounted
  const isMounted = React.useRef(true);
  const componentId = React.useRef(`msg-sugg-${Math.random().toString(36).substring(2, 9)}`);
  
  // Log when component mounts
  console.log(`MessageSuggestions mounted: ${componentId.current} for message: ${message?.substring(0, 30) || 'empty'}...`);
  
  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;
    
    // Set isMounted to false when component unmounts
    return () => {
      console.log(`MessageSuggestions unmounting: ${componentId.current}`);
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    console.log(`MessageSuggestions effect running: ${componentId.current}`);
    
    // Always start with default suggestions to ensure something is displayed
    setSuggestions(defaultSuggestions);
    setSource('default');
    setMatchedPattern(undefined);
    
    // Don't fetch if message is empty
    if (!message?.trim()) {
      console.log(`Empty message, using defaults: ${componentId.current}`);
      return;
    }
    
    // Check global cache first with timestamp-based key
    const cacheKey = getCacheKey(message);
    
    // Temporarily disable cache for testing
    /*
    if (globalSuggestionsCache.has(cacheKey)) {
      const cached = globalSuggestionsCache.get(cacheKey);
      console.log(`Using cached suggestions (source: ${cached?.source}, pattern: ${cached?.matchedPattern}): ${componentId.current}`);
      if (cached) {
        setSuggestions(cached.suggestions);
        setSource(cached.source);
        setMatchedPattern(cached.matchedPattern);
      }
      return;
    }
    */
    
    // Set a flag to track if we should show loading state
    // Only show loading after a delay to prevent flashing
    let shouldShowLoading = true;
    const loadingTimeout = setTimeout(() => {
      if (shouldShowLoading && isMounted.current) {
        setLoading(true);
      }
    }, 200);
    
    const fetchSuggestions = async () => {
      try {
        console.log(`Fetching suggestions: ${componentId.current}`);
        
        const response = await fetch('/api/anthropic/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });
        
        // Cancel loading indicator regardless of response
        shouldShowLoading = false;
        if (isMounted.current) {
          setLoading(false);
        }
        
        if (!response.ok) {
          console.warn(`Failed to fetch suggestions, using fallbacks: ${componentId.current}`);
          // Cache the fallback suggestions
          globalSuggestionsCache.set(cacheKey, {
            suggestions: defaultSuggestions,
            source: 'error-fallback'
          });
          return; // Will use the default suggestions
        }
        
        const data: SuggestionsResponse = await response.json();
        
        // Debug log to see what's coming from the API
        console.log('API Response data:', {
          suggestions: data.suggestions, 
          source: data.source,
          matchedPattern: data.matchedPattern
        });
        
        // Only update state if component is still mounted
        if (isMounted.current) {
          const fetchedSuggestions = data.suggestions || [];
          if (fetchedSuggestions.length > 0) {
            console.log(`Setting fetched suggestions: ${componentId.current}`, fetchedSuggestions, `source: ${data.source}`, `pattern: ${data.matchedPattern}`);
            setSuggestions(fetchedSuggestions);
            console.log('Setting source to:', data.source);
            setSource(data.source);
            setMatchedPattern(data.matchedPattern);
            // Cache the suggestions globally
            globalSuggestionsCache.set(cacheKey, {
              suggestions: fetchedSuggestions,
              source: data.source,
              matchedPattern: data.matchedPattern
            });
          } else {
            console.log(`No suggestions returned, keeping defaults: ${componentId.current}`);
            // Cache the fallback suggestions
            globalSuggestionsCache.set(cacheKey, {
              suggestions: defaultSuggestions,
              source: 'default'
            });
          }
        } else {
          console.log(`Component unmounted before suggestions fetched: ${componentId.current}`);
          // Still cache the results for future mounts
          if (data.suggestions?.length > 0) {
            globalSuggestionsCache.set(cacheKey, {
              suggestions: data.suggestions,
              source: data.source,
              matchedPattern: data.matchedPattern
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching suggestions: ${componentId.current}`, error);
        // Cancel loading indicator
        shouldShowLoading = false;
        if (isMounted.current) {
          setLoading(false);
        }
        // Cache the fallback suggestions
        globalSuggestionsCache.set(cacheKey, {
          suggestions: defaultSuggestions,
          source: 'error-fallback'
        });
      }
    };
    
    // Start fetching immediately
    fetchSuggestions();
    
    return () => {
      // Clean up loading timeout
      clearTimeout(loadingTimeout);
      // Signal that we don't want to show loading anymore
      shouldShowLoading = false;
      console.log(`Cleanup effect: ${componentId.current}`);
    };
  }, [message]);
  
  // Add a badge to show the source of suggestions
  const getSourceBadge = (source: string) => {
    switch(source) {
      case 'api':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">AI Generated</span>;
      case 'pattern-matching':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">Pattern Match</span>;
      case 'default':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">Default</span>;
      case 'error-fallback':
        return <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200">Error Fallback</span>;
      default:
        return null;
    }
  };
  
  // Enhance the button style for API suggestions
  const getButtonStyle = (source: string, index: number) => {
    // Base styles for different sources
    let baseStyle = "";
    
    switch(source) {
      case 'api':
        // Different shades of green for API suggestions based on index
        const greenShades = [
          "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800",
          "bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800",
          "bg-teal-50 dark:bg-teal-900/20 hover:bg-teal-100 dark:hover:bg-teal-900/30 border-teal-200 dark:border-teal-800",
          "bg-lime-50 dark:bg-lime-900/20 hover:bg-lime-100 dark:hover:bg-lime-900/30 border-lime-200 dark:border-lime-800"
        ];
        baseStyle = greenShades[index % greenShades.length];
        break;
      case 'pattern-matching':
        // Different shades of blue for pattern matching based on index
        const blueShades = [
          "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800",
          "bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800",
          "bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 border-cyan-200 dark:border-cyan-800",
          "bg-sky-50 dark:bg-sky-900/20 hover:bg-sky-100 dark:hover:bg-sky-900/30 border-sky-200 dark:border-sky-800"
        ];
        baseStyle = blueShades[index % blueShades.length];
        break;
      case 'default':
        baseStyle = "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700";
        break;
      case 'error-fallback':
        baseStyle = "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border-red-200 dark:border-red-800";
        break;
      default:
        baseStyle = "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700";
    }
    
    return baseStyle;
  };
  
  // Always show suggestions, even if loading
  console.log(`Rendering suggestions: ${componentId.current}`, suggestions, `source: ${source}`, `pattern: ${matchedPattern}`);
  
  // Add a very visible debug log
  console.log('🔍 RENDERING MESSAGE SUGGESTIONS WITH SOURCE:', source);
  
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Source indicator - always show for debugging */}
      <div className="text-xs text-center mb-1">
        <div className="flex items-center justify-center gap-2">
          {getSourceBadge(source)}
          {source === 'pattern-matching' && matchedPattern && (
            <span className="text-gray-500 dark:text-gray-400">({matchedPattern})</span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-3xl mx-auto">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion)}
            disabled={disabled}
            className={`text-sm px-4 py-2 h-auto min-h-[2.5rem] whitespace-normal text-left justify-start ${getButtonStyle(source, index)}`}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
} 