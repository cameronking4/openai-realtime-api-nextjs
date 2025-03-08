import { NextResponse } from 'next/server';
import { AI_ASSESSMENT_PROMPT } from '@/prompts/ai-conversation-templates';
import { callAnthropicAPI } from '../../_lib/anthropic-client';

// Helper function to truncate transcript if it's too large
function truncateTranscript(transcript: string, maxLength: number = 5000): string {
  if (transcript.length <= maxLength) {
    return transcript;
  }
  
  console.log(`Transcript is too large (${transcript.length} chars), truncating to ${maxLength} chars`);
  
  // Try to truncate at a natural boundary like a newline
  const halfLength = Math.floor(maxLength / 2);
  const firstHalf = transcript.substring(0, halfLength);
  const secondHalf = transcript.substring(transcript.length - halfLength);
  
  return `${firstHalf}\n\n[... TRANSCRIPT TRUNCATED DUE TO LENGTH ...]\n\n${secondHalf}`;
}

// Helper function to create a simplified prompt for faster processing
function createSimplifiedPrompt(transcript: string): string {
  // Create a more concise prompt that will process faster
  return `${AI_ASSESSMENT_PROMPT}\n\nHere is a brief transcript to analyze. Focus on the key indicators and provide a concise assessment:\n\n${transcript}\n\nProvide your assessment in JSON format.`;
}

export async function POST(request: Request) {
  try {
    // Get API key from environment (Vercel secrets in production)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not found in environment variables');
      return NextResponse.json(
        { 
          error: 'API key configuration error',
          details: 'The Anthropic API key is missing. Please add ANTHROPIC_API_KEY to your environment variables.',
          environment: process.env.NODE_ENV || 'unknown',
          vercel: process.env.VERCEL === '1' ? 'true' : 'false'
        },
        { status: 500 }
      );
    }
    
    // Log API key information (safely)
    const maskedKey = apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 4);
    console.log(`Using Anthropic API key: ${maskedKey}`);
    console.log(`API key length: ${apiKey.length}`);
    console.log(`API key prefix: ${apiKey.substring(0, 5)}`);
    
    // Parse request body with explicit error handling
    let transcript: string;
    try {
      // First try to get the raw body as text to check for parsing issues
      const rawBody = await request.text();
      console.log(`Raw request body length: ${rawBody.length} characters`);
      
      if (!rawBody || rawBody.trim() === '') {
        console.error('Empty request body received');
        return NextResponse.json(
          { error: 'Empty request body' },
          { status: 400 }
        );
      }
      
      // Try to parse the JSON
      try {
        const body = JSON.parse(rawBody);
        transcript = body.transcript;
        
        if (!transcript) {
          console.error('Transcript is missing from request body');
          return NextResponse.json(
            { error: 'Transcript is required' },
            { status: 400 }
          );
        }
        
        // Log transcript length for debugging
        console.log(`Received transcript with length: ${transcript.length} characters`);
        
        // Truncate transcript if it's too large - use a smaller limit for Vercel
        transcript = truncateTranscript(transcript, 5000);
        
      } catch (jsonError: any) {
        console.error('Error parsing JSON request body:', jsonError);
        return NextResponse.json(
          { 
            error: 'Invalid JSON in request body',
            details: jsonError.message || 'Could not parse JSON request body',
            rawBodyPreview: rawBody.substring(0, 100) + '...'
          },
          { status: 400 }
        );
      }
    } catch (parseError: any) {
      console.error('Error reading request body:', parseError);
      return NextResponse.json(
        { 
          error: 'Error reading request body',
          details: parseError.message || 'Could not read request body',
          environment: process.env.NODE_ENV || 'unknown',
          vercel: process.env.VERCEL === '1' ? 'true' : 'false'
        },
        { status: 400 }
      );
    }

    // Create a simplified prompt for faster processing
    const prompt = createSimplifiedPrompt(transcript);

    console.log('Sending assessment request to Anthropic API...');
    console.log(`Total prompt length: ${prompt.length} characters`);
    
    // Check if we're in Vercel production environment
    const isVercelProduction = process.env.VERCEL === '1' && process.env.NODE_ENV === 'production';
    
    try {
      // Call Anthropic API using our custom client - use haiku model in production for speed
      const model = isVercelProduction ? 'claude-3-haiku-20240307' : 'claude-3-7-sonnet-20250219';
      const maxTokens = isVercelProduction ? 2000 : 4000;
      
      console.log(`Using model: ${model} with max tokens: ${maxTokens}`);
      
      const response = await callAnthropicAPI(apiKey, prompt, model, maxTokens);
      
      // Extract the text content from the response
      const responseText = response.content[0].type === 'text' ? response.content[0].text : 'No text content returned';
      
      console.log('Received response from Anthropic API');
      console.log('Response preview:', responseText.substring(0, 100) + '...');
      
      // Try to extract JSON from the response text
      let assessmentData = responseText;
      let jsonExtracted = false;

      try {
        // Look for JSON pattern in the response
        const jsonRegex = /{[\s\S]*}/;
        const match = responseText.match(jsonRegex);
        
        if (match) {
          // Found JSON-like content, use it directly
          assessmentData = match[0];
          jsonExtracted = true;
          console.log("Extracted JSON from response");
          
          // Validate JSON by parsing it
          try {
            JSON.parse(assessmentData);
            console.log("Successfully validated JSON format");
          } catch (jsonError) {
            console.error("Extracted content is not valid JSON:", jsonError);
            // Still use the extracted content, the client will handle parsing errors
          }
        } else {
          console.log("No JSON pattern found in response");
        }
      } catch (error) {
        console.error("Error extracting JSON from response:", error);
      }

      // Return the assessment along with the prompt and raw response for testing
      const responseData = {
        success: true,
        assessment: assessmentData,
        jsonExtracted: jsonExtracted,
        model: model,
        testData: {
          promptLength: prompt.length,
          responseLength: responseText.length,
          responsePreview: responseText.substring(0, 200) + '...'
        }
      };
      
      console.log("Returning response with assessment data");
      
      return NextResponse.json(responseData);
    } catch (apiError: any) {
      console.error('Anthropic API error:', apiError);
      console.error('Error details:', JSON.stringify({
        message: apiError.message,
        status: apiError.status,
        type: apiError.type,
        stack: apiError.stack,
        name: apiError.name,
        code: apiError.code
      }, null, 2));
      
      // Handle authentication errors specifically
      if (apiError.status === 401) {
        return NextResponse.json(
          { 
            error: 'Authentication error with Anthropic API',
            details: 'The API key appears to be invalid or expired',
            message: apiError.message || 'No additional error details available',
            environment: process.env.NODE_ENV || 'unknown',
            vercel: process.env.VERCEL === '1' ? 'true' : 'false'
          },
          { status: 401 }
        );
      }
      
      // Handle other API errors
      return NextResponse.json(
        { 
          error: 'Error calling Anthropic API',
          details: apiError.message || 'Unknown API error',
          status: apiError.status || 500,
          type: apiError.type || 'unknown',
          code: apiError.code || 'unknown',
          environment: process.env.NODE_ENV || 'unknown',
          vercel: process.env.VERCEL === '1' ? 'true' : 'false'
        },
        { status: apiError.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('Error generating assessment:', error);
    console.error('Error details:', JSON.stringify({
      message: error.message,
      name: error.name,
      stack: error.stack,
      code: error.code
    }, null, 2));
    
    return NextResponse.json(
      { 
        error: 'Failed to generate assessment',
        details: error.message || 'Unknown error',
        name: error.name || 'Unknown error type',
        code: error.code || 'unknown',
        environment: process.env.NODE_ENV || 'unknown',
        vercel: process.env.VERCEL === '1' ? 'true' : 'false',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 