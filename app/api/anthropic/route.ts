import { Anthropic } from '@anthropic-ai/sdk';

// Initialize the Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * POST handler for Anthropic API requests
 * Expects a JSON body with:
 * - messages: Array of message objects in Anthropic format
 * - model: (optional) Anthropic model to use, defaults to claude-3-opus-20240229
 * - max_tokens: (optional) Maximum tokens to generate, defaults to 4000
 * - temperature: (optional) Sampling temperature, defaults to 0.7
 */
export async function POST(req: Request) {
  try {
    // Parse the request body
    const { 
      messages, 
      model = 'claude-3-opus-20240229', 
      max_tokens = 4000,
      temperature = 0.7,
      system
    } = await req.json();

    // Log the request (optional)
    console.log('Anthropic API request:', { model, max_tokens, temperature });
    
    // Create the Anthropic API request (non-streaming)
    const response = await anthropic.messages.create({
      messages,
      model,
      max_tokens,
      temperature,
      ...(system && { system }),
    });

    // Return the complete response
    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in Anthropic API route:', error);
    return new Response(JSON.stringify({ error: 'Failed to process request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 