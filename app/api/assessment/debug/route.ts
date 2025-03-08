import { NextResponse } from 'next/server';

// Custom function to test Anthropic API directly without the SDK
async function testAnthropicAPI(apiKey: string) {
  console.log('DEBUG: Testing Anthropic API directly...');
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 50,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: 'Hello, this is a test message to verify the API key is working.'
        }
      ]
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`DEBUG: Anthropic API error: ${response.status} - ${errorText}`);
    throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
  }
  
  return await response.json();
}

/**
 * GET handler for debugging the assessment API
 * This endpoint will test the Anthropic API configuration and return detailed information
 * about the environment and any errors encountered
 */
export async function GET() {
  try {
    // Log environment information
    console.log('DEBUG: Environment:', process.env.NODE_ENV);
    console.log('DEBUG: Vercel environment:', process.env.VERCEL === '1' ? 'true' : 'false');
    
    // Get API key from environment (Vercel secrets in production)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('DEBUG: ANTHROPIC_API_KEY not found in environment variables');
      return NextResponse.json(
        { 
          success: false,
          error: 'API key configuration error',
          details: 'The Anthropic API key is missing. Please add ANTHROPIC_API_KEY to your environment variables.',
          environment: process.env.NODE_ENV || 'unknown',
          vercel: process.env.VERCEL === '1' ? 'true' : 'false',
          envVars: Object.keys(process.env).filter(key => 
            !key.includes('API_KEY') && !key.includes('KEY') && !key.includes('SECRET')
          )
        },
        { status: 500 }
      );
    }
    
    // Get and mask API key for logging
    const maskedKey = apiKey ? `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}` : 'not set';
    console.log(`DEBUG: Using Anthropic API key: ${maskedKey}`);
    console.log(`DEBUG: API key length: ${apiKey.length}`);
    console.log(`DEBUG: API key prefix: ${apiKey.substring(0, 5)}`);
    
    // Check if the API key looks valid (basic format check)
    const isValidFormat = apiKey.startsWith('sk-ant-') && apiKey.length > 20;
    console.log(`DEBUG: API key format appears valid: ${isValidFormat}`);
    
    if (!isValidFormat) {
      console.warn('DEBUG: API key does not match expected format (should start with sk-ant-)');
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid API key format',
          details: 'The Anthropic API key does not match the expected format. It should start with "sk-ant-".',
          keyPrefix: apiKey.substring(0, 7) + '...'
        },
        { status: 400 }
      );
    }
    
    // Try a simple API call to test connectivity
    try {
      console.log('DEBUG: Testing API key with a simple request...');
      const response = await testAnthropicAPI(apiKey);
      
      console.log('DEBUG: Test API call successful!', response.id);
      
      // Return success response with details
      return NextResponse.json({
        success: true,
        message: 'Anthropic API test successful',
        details: {
          model: 'claude-3-7-sonnet-20250219',
          responseId: response.id,
          environment: process.env.NODE_ENV || 'unknown',
          vercel: process.env.VERCEL === '1' ? 'true' : 'false',
          textPreview: response.content[0].text || 'No text content',
        }
      });
    } catch (apiError: any) {
      console.error('DEBUG: API test call failed:', apiError);
      
      // Try to log as much detail as possible
      try {
        console.error('DEBUG: Error details:', JSON.stringify({
          message: apiError.message,
          status: apiError.status,
          type: apiError.type,
          code: apiError.code,
          name: apiError.name,
          stack: apiError.stack,
        }, null, 2));
      } catch (logError) {
        console.error('DEBUG: Error stringifying apiError:', logError);
      }
      
      // Return detailed error information
      return NextResponse.json(
        { 
          success: false,
          error: 'Anthropic API test failed',
          details: {
            message: apiError.message || 'No message available',
            status: apiError.status || 'No status available',
            type: apiError.type || 'No type available',
            code: apiError.code || 'No code available',
            name: apiError.name || 'Unknown error',
            environment: process.env.NODE_ENV || 'unknown',
            vercel: process.env.VERCEL === '1' ? 'true' : 'false',
          }
        },
        { status: apiError.status || 500 }
      );
    }
  } catch (error: any) {
    console.error('DEBUG: Error in debug endpoint:', error);
    
    // Log error details
    try {
      console.error('DEBUG: Error details:', JSON.stringify({
        message: error.message,
        name: error.name,
        stack: error.stack,
        code: error.code
      }, null, 2));
    } catch (logError) {
      console.error('DEBUG: Error stringifying error:', logError);
    }
    
    // Return error response
    return NextResponse.json(
      { 
        success: false,
        error: 'Debug endpoint error',
        details: {
          message: error.message || 'Unknown error',
          name: error.name || 'Unknown error type',
          code: error.code || 'unknown',
          environment: process.env.NODE_ENV || 'unknown',
          vercel: process.env.VERCEL === '1' ? 'true' : 'false',
        }
      },
      { status: 500 }
    );
  }
} 