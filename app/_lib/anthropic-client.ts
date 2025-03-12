/**
 * Custom Anthropic client to ensure proper API key formatting
 */

import Anthropic from '@anthropic-ai/sdk';
import { getAssessmentModelConfig, getDefaultModelConfig, getSuggestionModelConfig } from './model-config';

/**
 * Creates a sanitized Anthropic client that ensures the API key is properly formatted
 * @param apiKey The Anthropic API key
 * @returns A configured Anthropic client
 */
export function createAnthropicClient(apiKey: string): Anthropic {
  // Sanitize the API key to ensure it doesn't have any invalid characters
  const sanitizedKey = apiKey.trim().replace(/\s+/g, '');
  
  // Log information about the key (safely)
  console.log(`Creating Anthropic client with key length: ${sanitizedKey.length}`);
  console.log(`Key prefix: ${sanitizedKey.substring(0, 5)}...`);
  
  // Create the Anthropic client with the sanitized key
  return new Anthropic({
    apiKey: sanitizedKey,
  });
}

/**
 * Safely calls the Anthropic API with proper error handling
 * @param apiKey The Anthropic API key
 * @param prompt The prompt to send to the API
 * @param model The model to use (optional, defaults to assessment model)
 * @param maxTokens The maximum number of tokens to generate (optional)
 * @param temperature The temperature to use (optional)
 * @returns The API response
 */
export async function callAnthropicAPI(
  apiKey: string, 
  prompt: string,
  model?: string,
  maxTokens?: number,
  temperature?: number
) {
  try {
    // Get the assessment model configuration
    const config = getAssessmentModelConfig();
    
    // Create the client
    const anthropic = createAnthropicClient(apiKey);
    
    // Make the API call
    return await anthropic.messages.create({
      model: model || config.model,
      max_tokens: maxTokens || config.maxTokens,
      temperature: temperature || config.temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system: "You are a clinical psychologist specializing in psycho-oncology. You analyze conversation transcripts and provide assessments in JSON format. Your responses must be valid JSON objects with no additional text.",
    });
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    throw error;
  }
}

/**
 * Calls the Anthropic API specifically for generating suggestions
 * @param apiKey The Anthropic API key
 * @param prompt The prompt to send to the API
 * @returns The API response
 */
export async function callAnthropicSuggestionAPI(
  apiKey: string,
  prompt: string
) {
  try {
    // Get the suggestion model configuration
    const config = getSuggestionModelConfig();
    
    // Create the client
    const anthropic = createAnthropicClient(apiKey);
    
    // Make the API call
    return await anthropic.messages.create({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system: "You are a helpful assistant generating possible patient replies to an AI medical assistant's messages. Your responses should be empathetic, diverse, and relevant to a cancer patient's context. Generate only JSON in your response with no other text.",
    });
  } catch (error) {
    console.error('Error calling Anthropic API for suggestions:', error);
    throw error;
  }
}

/**
 * Tests the Anthropic API connection
 * @param apiKey The Anthropic API key
 * @returns The API response
 */
export async function testAnthropicAPI(apiKey: string) {
  try {
    // Get the default model configuration
    const config = getDefaultModelConfig();
    
    // Create the client
    const anthropic = createAnthropicClient(apiKey);
    
    // Make a simple test API call
    return await anthropic.messages.create({
      model: config.model,
      max_tokens: 50,
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message to verify the API key is working.',
        },
      ],
    });
  } catch (error) {
    console.error('Error testing Anthropic API:', error);
    throw error;
  }
} 