import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AI_ASSESSMENT_PROMPT } from '@/prompts/ai-conversation-templates';

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

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

    // Log masked API key for debugging
    console.log(`Using Anthropic API key: ${process.env.ANTHROPIC_API_KEY?.substring(0, 4)}...`);

    // Combine the assessment prompt with the transcript
    const prompt = `${AI_ASSESSMENT_PROMPT}\n\nHere is the transcript to analyze:\n\n${transcript}\n\nIMPORTANT: Your response MUST be a valid JSON object exactly matching the format specified above. Do not include any text before or after the JSON object.`;

    // Call Anthropic API
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
    
    // Try to extract JSON from the response text
    let assessmentData = responseText;
    try {
      // Look for JSON pattern in the response
      const jsonRegex = /{[\s\S]*}/;
      const match = responseText.match(jsonRegex);
      
      if (match) {
        // Found JSON-like content, use it directly
        assessmentData = match[0];
        console.log("Extracted JSON from response");
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
      testData: {
        prompt: prompt,
        rawResponse: JSON.stringify(response, null, 2)
      }
    };
    
    console.log("Returning response with testData:", JSON.stringify(responseData.testData ? true : false));
    
    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error('Error generating assessment:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate assessment',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 