/**
 * Anthropic API utility functions
 * This module provides helper functions for interacting with the Anthropic API
 */

/**
 * Interface for message objects in Anthropic format
 */
export interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Interface for Anthropic API request parameters
 */
export interface AnthropicRequestParams {
  messages: AnthropicMessage[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
  system?: string;
}

/**
 * Interface for Anthropic API response
 */
export interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  stop_sequence: string | null;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Send a request to the Anthropic API
 * @param params - The request parameters
 * @returns The Anthropic API response
 */
export async function sendAnthropicRequest(params: AnthropicRequestParams): Promise<AnthropicResponse> {
  const response = await fetch('/api/anthropic', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      `Anthropic API request failed with status ${response.status}: ${
        errorData?.error || 'Unknown error'
      }`
    );
  }

  return response.json();
}

/**
 * Extract text content from Anthropic response
 * @param response - The Anthropic API response
 * @returns The extracted text content
 */
export function extractTextFromResponse(response: AnthropicResponse): string {
  return response.content
    .filter(item => item.type === 'text')
    .map(item => item.text)
    .join('');
}

/**
 * Send a simple message to Anthropic and get the text response
 * @param message - The user message
 * @param options - Additional options for the request
 * @returns The text response from Anthropic
 */
export async function askAnthropicSimple(
  message: string,
  options: Omit<AnthropicRequestParams, 'messages'> = {}
): Promise<string> {
  const response = await sendAnthropicRequest({
    messages: [{ role: 'user', content: message }],
    ...options,
  });
  
  return extractTextFromResponse(response);
} 