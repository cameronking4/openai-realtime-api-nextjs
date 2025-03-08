/**
 * Custom Anthropic client to ensure proper API key formatting
 */

import { Anthropic } from '@anthropic-ai/sdk';

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
 * @param model The model to use
 * @param maxTokens The maximum number of tokens to generate
 * @returns The API response
 */
export async function callAnthropicAPI(
  apiKey: string, 
  prompt: string,
  model: string = 'claude-3-7-sonnet-20250219',
  maxTokens: number = 4000
) {
  try {
    // Create the client
    const anthropic = createAnthropicClient(apiKey);
    
    // Make the API call
    return await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      temperature: 0.7,
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
 * Tests the Anthropic API connection
 * @param apiKey The Anthropic API key
 * @returns The API response
 */
export async function testAnthropicAPI(apiKey: string) {
  try {
    // Create the client
    const anthropic = createAnthropicClient(apiKey);
    
    // Make a simple test API call
    return await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
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