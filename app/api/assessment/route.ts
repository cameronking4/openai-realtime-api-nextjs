import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AI_ASSESSMENT_PROMPT } from '@/prompts/ai-conversation-templates';
import fs from 'fs';

// Helper function to read the Anthropic API key directly from .env file
function readAnthropicApiKey(): string | null {
  try {
    // Try to read from .env.local first
    if (fs.existsSync('.env.local')) {
      const envLocalContent = fs.readFileSync('.env.local', 'utf8');
      const match = envLocalContent.match(/ANTHROPIC_API_KEY=([^\n]+)/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    // Then try the regular .env file
    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf8');
      const match = envContent.match(/ANTHROPIC_API_KEY=([^\n]+)/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error reading API key from .env files:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const { transcript } = await request.json();
    
    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Get API key directly from file instead of environment
    const apiKey = readAnthropicApiKey();
    
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY could not be read from .env or .env.local files');
      return NextResponse.json(
        { 
          error: 'API key configuration error',
          details: 'The Anthropic API key is missing or invalid' 
        },
        { status: 500 }
      );
    }

    // Log API key information (safely)
    const maskedKey = apiKey.substring(0, 10) + '...' + apiKey.substring(apiKey.length - 4);
    console.log(`Using Anthropic API key: ${maskedKey}`);
    console.log(`API key length: ${apiKey.length}`);
    console.log(`API key prefix: ${apiKey.substring(0, 10)}`);

    // Initialize Anthropic client with direct API key
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Combine the assessment prompt with the transcript
    const prompt = `${AI_ASSESSMENT_PROMPT}\n\nHere is the transcript to analyze:\n\n${transcript}\n\nIMPORTANT: Your response MUST be a valid JSON object exactly matching the format specified above. Do not include any text before or after the JSON object.`;

    console.log('Sending assessment request to Anthropic API...');
    
    try {
      // Test API call to verify key is working
      try {
        console.log('Testing API key with a simple request...');
        const testResponse = await anthropic.messages.create({
          model: 'claude-3-opus-20240229',
          max_tokens: 50,
          messages: [
            {
              role: 'user',
              content: 'Hello, this is a test message to verify the API key is working.',
            },
          ],
        });
        console.log('Test API call successful!', testResponse.id);
      } catch (testError: any) {
        console.error('Test API call failed:', testError);
        return NextResponse.json(
          { 
            error: 'Authentication error with Anthropic API',
            details: 'Test API call failed. The API key may be invalid or expired.',
            message: testError.message || 'No additional error details available'
          },
          { status: 401 }
        );
      }

      // Main API call
      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
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
      
      // Handle authentication errors specifically
      if (apiError.status === 401) {
        return NextResponse.json(
          { 
            error: 'Authentication error with Anthropic API',
            details: 'The API key appears to be invalid or expired',
            message: apiError.message || 'No additional error details available'
          },
          { status: 401 }
        );
      }
      
      // Handle other API errors
      return NextResponse.json(
        { 
          error: 'Error calling Anthropic API',
          details: apiError.message || 'Unknown API error',
          status: apiError.status || 500
        },
        { status: apiError.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('Error generating assessment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate assessment',
        details: error.message || 'Unknown error',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 