import { Anthropic } from '@anthropic-ai/sdk';

// Initialize the Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

/**
 * POST handler for Anthropic API streaming requests
 * Expects a JSON body with:
 * - messages: Array of message objects in Anthropic format
 * - model: (optional) Anthropic model to use, defaults to claude-3-opus-20240229
 * - max_tokens: (optional) Maximum tokens to generate, defaults to 5000
 * - temperature: (optional) Sampling temperature, defaults to 0.7
 */
export async function POST(req: Request) {
  try {
    // Parse the request body
    const { 
      messages, 
      model = 'claude-3-opus-20240229', 
      max_tokens = 5000,
      temperature = 0.7,
      system
    } = await req.json();

    // Log the request (optional)
    console.log('Anthropic API streaming request:', { model, max_tokens, temperature });
    
    // Create a TransformStream to handle the streaming response
    const encoder = new TextEncoder();
    
    // Create a ReadableStream for the SSE response
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Use the messages.stream helper instead of messages.create with stream: true
          const stream = await anthropic.messages.stream({
            messages,
            model,
            max_tokens,
            temperature,
            ...(system && { system }),
          });

          // Handle text events
          stream.on('text', (text) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          });

          // Handle the end of the stream
          stream.on('end', () => {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          });

          // Handle errors
          stream.on('error', (error) => {
            console.error('Stream error:', error);
            controller.error(error);
          });

          // Wait for the stream to complete
          await stream.finalMessage();
        } catch (error) {
          console.error('Error processing stream:', error);
          controller.error(error);
        }
      },
    });

    // Return the streaming response
    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in Anthropic API streaming route:', error);
    return new Response(JSON.stringify({ error: 'Failed to process streaming request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 