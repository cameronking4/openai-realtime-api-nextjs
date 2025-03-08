import { NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { AI_ASSESSMENT_PROMPT } from '@/prompts/ai-conversation-templates';
import fs from 'fs';

// Initialize the Anthropic client with API key from environment variables
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Helper function to log environment information
function logEnvironmentInfo() {
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Vercel environment:', process.env.VERCEL === '1' ? 'true' : 'false');
  
  // Log API key information (safely)
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  if (apiKey) {
    const maskedKey = apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 4);
    console.log(`Using Anthropic API key: ${maskedKey}`);
    console.log(`API key length: ${apiKey.length}`);
    
    // Check if the API key looks valid (basic format check)
    const isValidFormat = apiKey.startsWith('sk-ant-') && apiKey.length > 20;
    console.log(`API key format appears valid: ${isValidFormat}`);
  } else {
    console.log('ANTHROPIC_API_KEY not found in environment variables');
  }
}

export async function POST(request: Request) {
  try {
    // Log environment information
    logEnvironmentInfo();
    
    // Parse request body with explicit error handling
    let transcript: string;
    try {
      const body = await request.json();
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
    } catch (parseError: any) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          details: parseError.message || 'Could not parse JSON request body',
          environment: process.env.NODE_ENV || 'unknown',
          vercel: process.env.VERCEL === '1' ? 'true' : 'false'
        },
        { status: 400 }
      );
    }

    // Check if API key is available
    if (!process.env.ANTHROPIC_API_KEY) {
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

    // Combine the assessment prompt with the transcript
    const prompt = `${AI_ASSESSMENT_PROMPT}\n\nHere is the transcript to analyze:\n\n${transcript}\n\nIMPORTANT: Your response MUST be a valid JSON object exactly matching the format specified above. Do not include any text before or after the JSON object.`;

    console.log('Sending assessment request to Anthropic API...');
    
    try {
      // Main API call
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 4000,
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
          prompt: prompt,
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