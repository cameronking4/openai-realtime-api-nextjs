import { Anthropic } from '@anthropic-ai/sdk';

// Initialize the Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * GET handler for testing the Anthropic API integration
 */
export async function GET() {
  try {
    // Log the API key (masked for security)
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    console.log('Using Anthropic API key:', apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 3)}` : 'Not found');
    
    // Create a simple test request to the Anthropic API
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 300,
      messages: [
        { role: 'user', content: 'Hello, Claude! This is a test message. Please respond with a short greeting.' }
      ],
    });

    // Return the response
    return new Response(JSON.stringify({
      success: true,
      message: 'Anthropic API test successful',
      response: {
        id: response.id,
        model: response.model,
        content: response.content,
      }
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in Anthropic API test:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 