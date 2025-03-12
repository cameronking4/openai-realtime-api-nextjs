/**
 * POST handler for generating quick response suggestions using Anthropic Haiku
 * Expects a JSON body with:
 * - message: The AI message to generate suggestions for
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';
import { getActivePrompt } from '@/lib/prompt-service';
import { callAnthropicSuggestionAPI } from '@/app/_lib/anthropic-client';
import { getSuggestionModelConfig } from '@/app/_lib/model-config';

// Define response type for better type safety
interface SuggestionsResponse {
  suggestions: string[];
  source: 'api' | 'pattern-matching' | 'default' | 'error-fallback';
  matchedPattern?: string;
}

// Helper function to read the Anthropic API key directly from .env file
function readAnthropicApiKey(): string | null {
  try {
    // Try to read from .env.local first
    if (fs.existsSync('.env.local')) {
      const envLocalContent = fs.readFileSync('.env.local', 'utf8');
      
      // Use a regex that handles quoted values
      const match = envLocalContent.match(/ANTHROPIC_API_KEY="([^"]*)"/);
      if (match && match[1]) {
        // Clean the key by removing any whitespace or newlines
        return match[1].replace(/\s+/g, '').trim();
      }
    }
    
    // Then try the regular .env file
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      
      // Use a regex that handles quoted values
      const match = envContent.match(/ANTHROPIC_API_KEY="([^"]*)"/);
      if (match && match[1]) {
        // Clean the key by removing any whitespace or newlines
        return match[1].replace(/\s+/g, '').trim();
      }
    }
    
    // Fall back to environment variable
    if (process.env.ANTHROPIC_API_KEY) {
      return process.env.ANTHROPIC_API_KEY.replace(/\s+/g, '').trim();
    }
    
    return null;
  } catch (error) {
    console.error('Error reading API key from .env files:', error);
    return null;
  }
}

export async function POST(req: Request) {
  let message: string = "";
  try {
    // Parse the request body
    const requestBody = await req.json();
    message = requestBody.message;
    
    // Log the request (optional)
    console.log('Generating suggestions for message:', message ? (message.substring(0, 50) + (message.length > 50 ? '...' : '')) : 'empty message');
    
    // If message is empty or not a string, return default suggestions
    if (!message || typeof message !== 'string' || !message.trim()) {
      console.log('Using default suggestions for empty message');
      const response: SuggestionsResponse = {
        suggestions: [
          "Yes, I'd like to know more about that",
          "No, let's talk about something else",
          "Could you explain that in more detail?",
          "Why do you think that's important?"
        ],
        source: 'default'
      };
      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get API key directly from file
    const apiKey = readAnthropicApiKey();
    
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY could not be read from .env or .env.local files');
      // Fall back to pattern matching if API key is not available
      return generatePatternMatchedSuggestions(message);
    }
    
    // Log API key information (safely)
    const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4);
    console.log(`Using Anthropic API key: ${maskedKey}`);
    console.log(`API key length: ${apiKey.length}`);
    console.log(`API key prefix: ${apiKey.substring(0, 10)}`);
    
    try {
      // Get the prompt from the database
      let promptContent;
      try {
        promptContent = await getActivePrompt('QUICK_ANSWERS_SUGGESTION');
        console.log('Using prompt from database');
      } catch (promptError) {
        console.error('Error fetching prompt from database:', promptError);
        // Fall back to hardcoded prompt if database fetch fails
        promptContent = `Generate 4 short (less than 10 words each) possible replies to the following message from an AI assistant. 
        The replies should be from the perspective of a patient with cancer talking to a support assistant. 
        The replies should address the last question of the analyzed question message. 
        Replies should represent spectrum of responses from a patient with cancer that will help to assess their status - one should be very positive, one should be very negative, one should be neutral, one should be a question to specify the question asked.
        
        AI Message: "{message}"
        
        Provide exactly 4 short responses that a patient might use to reply to this message. Each should represent different levels of distress and engagement.
        Your output must be in a JSON format with just an array of strings called "suggestions".
        For example: {"suggestions": ["Response 1", "Response 2", "Response 3", "Response 4"]}
        Nothing else - just a valid JSON object.`;
        console.log('Using fallback hardcoded prompt');
      }
      
      // Replace {message} placeholder with actual message
      const formattedPrompt = promptContent.replace('{message}', message);
      
      // Call Anthropic API using our specialized suggestion function
      console.log('Calling Anthropic API for suggestions...');
      const response = await callAnthropicSuggestionAPI(apiKey, formattedPrompt);
      
      // Extract the text content from the response
      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
      console.log('Received response from Anthropic API:', responseText);
      
      // Try to parse the JSON from the response
      try {
        // Extract JSON from the response text
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const jsonData = JSON.parse(jsonMatch[0]);
          
          if (jsonData && jsonData.suggestions && Array.isArray(jsonData.suggestions) && jsonData.suggestions.length > 0) {
            console.log('Successfully extracted suggestions from API response');
            
            // Return the suggestions
            const apiResponse: SuggestionsResponse = {
              suggestions: jsonData.suggestions.slice(0, 4), // Ensure we only get 4 suggestions
              source: 'api'
            };
            
            return new Response(JSON.stringify(apiResponse), {
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }
        
        console.warn('Failed to extract suggestions from API response, falling back to pattern matching');
        return generatePatternMatchedSuggestions(message);
      } catch (parseError) {
        console.error('Error parsing API response:', parseError);
        return generatePatternMatchedSuggestions(message);
      }
    } catch (apiError) {
      console.error('Error calling Anthropic API:', apiError);
      return generatePatternMatchedSuggestions(message);
    }
  } catch (error) {
    console.error('Error generating suggestions:', error);
    // Fall back to pattern matching
    return generatePatternMatchedSuggestions(message || "");
  }
}

// Separate function for pattern-matched suggestions to improve code organization
function generatePatternMatchedSuggestions(message: string): Response {
  // Enhanced pattern matching with more specific contexts
  let suggestions: string[] = [];
  let matchedPattern: string | undefined;
  
  // Convert message to lowercase for case-insensitive matching
  const lowerMessage = message.toLowerCase();
  
  // Check for specific question patterns
  if (lowerMessage.includes("how have you been feeling")) {
    suggestions = [
      "I've been feeling anxious about my diagnosis",
      "I'm struggling with fatigue most days",
      "Some days are better than others",
      "I'm trying to stay positive but it's difficult"
    ];
    matchedPattern = "feeling-inquiry";
  } 
  else if (lowerMessage.includes("describe your mood")) {
    suggestions = [
      "My mood has been quite low lately",
      "I have good and bad days",
      "I feel overwhelmed by emotions sometimes",
      "I'm trying to focus on positive moments"
    ];
    matchedPattern = "mood-description";
  }
  else if (lowerMessage.includes("what aspects") && lowerMessage.includes("challenging")) {
    suggestions = [
      "The uncertainty about my prognosis is hardest",
      "Managing treatment side effects is difficult",
      "I worry about being a burden to my family",
      "The financial stress adds to everything else"
    ];
    matchedPattern = "challenges";
  }
  else if (lowerMessage.includes("confident") && lowerMessage.includes("managing")) {
    suggestions = [
      "I don't feel very confident managing symptoms",
      "I'm learning but still need guidance",
      "Some symptoms I can handle, others overwhelm me",
      "I need more information about what to expect"
    ];
    matchedPattern = "self-efficacy";
  }
  else if (lowerMessage.includes("who do you turn to") || (lowerMessage.includes("support") && lowerMessage.includes("network"))) {
    suggestions = [
      "My spouse has been my main support",
      "I have a few close friends I can rely on",
      "I've joined an online support group",
      "I feel isolated and don't have much support"
    ];
    matchedPattern = "support-network";
  }
  // More general patterns below
  else if (lowerMessage.includes("how are you") || lowerMessage.includes("feeling")) {
    if (lowerMessage.includes("treatment") || lowerMessage.includes("therapy")) {
      suggestions = [
        "The treatment is harder than I expected",
        "I'm managing the side effects okay so far",
        "I'm worried about long-term effects",
        "I need more information about what to expect"
      ];
      matchedPattern = "treatment-feelings";
    } else {
      suggestions = [
        "I'm doing okay today, thanks for asking",
        "Not great, I've been struggling lately",
        "Better than yesterday, making progress",
        "Let's talk about something specific that's bothering me"
      ];
      matchedPattern = "general-feelings";
    }
  } 
  else if (lowerMessage.includes("anxiety") || lowerMessage.includes("worried") || lowerMessage.includes("stress")) {
    if (lowerMessage.includes("family") || lowerMessage.includes("loved ones")) {
      suggestions = [
        "I worry about how my illness affects my family",
        "My family tries to help but doesn't understand",
        "I'm trying to protect them from my worries",
        "We're all learning to cope together"
      ];
      matchedPattern = "family-anxiety";
    } else {
      suggestions = [
        "Yes, I've been feeling anxious about several things lately",
        "Sometimes I feel anxious, especially before appointments",
        "Not really anxious, but I do feel overwhelmed at times",
        "Can you help me understand why I might be feeling this way?"
      ];
      matchedPattern = "general-anxiety";
    }
  } 
  else if (lowerMessage.includes("depression") || lowerMessage.includes("sad") || lowerMessage.includes("mood")) {
    if (lowerMessage.includes("treatment") || lowerMessage.includes("medication")) {
      suggestions = [
        "I'm considering medication for my mood",
        "The antidepressants have helped somewhat",
        "I'm hesitant about taking more medications",
        "What other options might help with depression?"
      ];
      matchedPattern = "depression-treatment";
    } else {
      suggestions = [
        "I've been feeling down for the past few weeks",
        "My mood varies throughout the day, sometimes better, sometimes worse",
        "I don't think I'm depressed, just going through a rough patch",
        "I could use some support and strategies to improve my mood"
      ];
      matchedPattern = "general-mood";
    }
  } 
  else if (lowerMessage.includes("treatment") || lowerMessage.includes("therapy") || lowerMessage.includes("medication")) {
    if (lowerMessage.includes("side effects")) {
      suggestions = [
        "The side effects are affecting my daily life",
        "I'm managing the side effects but they're challenging",
        "I'm not sure which symptoms are from treatment versus the illness",
        "Are there ways to reduce these side effects?"
      ];
      matchedPattern = "side-effects";
    } else {
      suggestions = [
        "The treatment seems to be helping, but I have some questions",
        "I'm experiencing some side effects I'd like to discuss",
        "It doesn't seem to be working as well as I hoped",
        "Could you tell me more about how this treatment is supposed to work?"
      ];
      matchedPattern = "general-treatment";
    }
  } 
  else if (lowerMessage.includes("support") || lowerMessage.includes("help")) {
    if (lowerMessage.includes("resources") || lowerMessage.includes("services")) {
      suggestions = [
        "What support services are available through the hospital?",
        "Are there financial assistance programs I should know about?",
        "I'd like to find a local support group",
        "Can you recommend online resources for my condition?"
      ];
      matchedPattern = "support-resources";
    } else {
      suggestions = [
        "My family has been very supportive during this difficult time",
        "I feel alone in dealing with these challenges",
        "I think I need more professional support than I'm currently getting",
        "What resources would you recommend for someone in my situation?"
      ];
      matchedPattern = "general-support";
    }
  } 
  else if (lowerMessage.includes("pain") || lowerMessage.includes("symptoms")) {
    if (lowerMessage.includes("manage") || lowerMessage.includes("coping")) {
      suggestions = [
        "What pain management techniques do you recommend?",
        "The medications aren't controlling my pain well",
        "I'm trying to avoid taking too many pain medications",
        "Are there non-medication approaches I could try?"
      ];
      matchedPattern = "pain-management";
    } else {
      suggestions = [
        "Yes, I'm experiencing pain that's affecting my daily activities",
        "The symptoms are manageable but still concerning",
        "My symptoms seem to be getting worse over time",
        "I'd appreciate advice on how to manage these symptoms better"
      ];
      matchedPattern = "general-symptoms";
    }
  } 
  else if (lowerMessage.includes("?")) {
    // If it's a question, try to determine what kind
    if (lowerMessage.includes("recommend") || lowerMessage.includes("suggest") || lowerMessage.includes("advice")) {
      suggestions = [
        "That sounds helpful, I'd like to try that",
        "I've tried something similar before without success",
        "Could you explain more about how that would help?",
        "Are there alternatives I could consider?"
      ];
      matchedPattern = "recommendation-response";
    } else {
      suggestions = [
        "Yes, that's exactly how I feel about it",
        "No, that doesn't quite match my experience",
        "I'm not sure, could you help me think through this?",
        "Can you explain what you mean by that in more detail?"
      ];
      matchedPattern = "general-question";
    }
  } 
  else {
    // Default suggestions
    suggestions = [
      "Yes, I'd like to explore this topic further",
      "No, but I have some related concerns",
      "Could you tell me more about what you're suggesting?",
      "I need help understanding how this applies to my situation"
    ];
    matchedPattern = "default";
  }
  
  console.log('Returning pattern-matched suggestions:', suggestions, 'matched pattern:', matchedPattern);
  
  const response: SuggestionsResponse = {
    suggestions,
    source: 'pattern-matching',
    matchedPattern
  };
  
  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' },
  });
} 