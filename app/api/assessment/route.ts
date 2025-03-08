import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { AI_ASSESSMENT_PROMPT } from '@/prompts/ai-conversation-templates';

// Helper function to truncate transcript if it's too large
function truncateTranscript(transcript: string, maxLength: number = 10000): string {
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
    
    // Initialize Anthropic client with direct API key in the exact same way as suggestions API
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });
    
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
        
        // Truncate transcript if it's too large
        transcript = truncateTranscript(transcript);
        
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

    // Combine the assessment prompt with the transcript
    const prompt = `${AI_ASSESSMENT_PROMPT}\n\nHere is the transcript to analyze:\n\n${transcript}\n\nIMPORTANT: Your response MUST be a valid JSON object exactly matching the format specified above. Do not include any text before or after the JSON object.`;

    console.log('Sending assessment request to Anthropic API...');
    console.log(`Total prompt length: ${prompt.length} characters`);
    
    try {
      // Main API call - using the model specified by the user
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        system: "You are a clinical psychologist specializing in psycho-oncology. You analyze conversation transcripts and provide assessments in JSON format. Your responses must be valid JSON objects with no additional text.",
      });

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