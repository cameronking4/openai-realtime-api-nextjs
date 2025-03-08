/**
 * Utility functions for debugging the assessment API
 */

/**
 * Test the assessment API debug endpoint and return the results
 */
export async function testAssessmentAPI(): Promise<any> {
  try {
    // Call the test endpoint instead of debug
    const response = await fetch('/api/assessment/test');
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Assessment API test failed:', response.status, errorText);
      
      try {
        // Try to parse the error as JSON
        const errorJson = JSON.parse(errorText);
        return {
          success: false,
          status: response.status,
          error: errorJson
        };
      } catch (parseError) {
        // Return raw error if cannot parse
        return {
          success: false,
          status: response.status,
          error: errorText
        };
      }
    }
    
    // Parse the response as JSON
    const data = await response.json();
    console.log('Assessment API test result:', data);
    
    return {
      success: true,
      status: response.status,
      data
    };
  } catch (error: any) {
    console.error('Error testing assessment API:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Test generating an assessment with a minimal transcript
 */
export async function testGenerateAssessment(): Promise<any> {
  try {
    // Create a minimal test transcript
    const testTranscript = `
User: Hello, I'm dealing with cancer diagnosis.
AI: I understand this must be difficult. How are you coping with the news?
User: Some days are better than others. I'm trying to stay positive.
AI: That's understandable. What kind of support do you have?
User: My family has been supportive, but I sometimes feel alone in this journey.
`;

    // Call the assessment API
    const response = await fetch('/api/assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transcript: testTranscript })
    });
    
    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Assessment generation test failed:', response.status, errorText);
      
      try {
        // Try to parse the error as JSON
        const errorJson = JSON.parse(errorText);
        return {
          success: false,
          status: response.status,
          error: errorJson
        };
      } catch (parseError) {
        // Return raw error if cannot parse
        return {
          success: false,
          status: response.status,
          error: errorText
        };
      }
    }
    
    // Parse the response as JSON
    const data = await response.json();
    console.log('Assessment generation test result:', data);
    
    return {
      success: true,
      status: response.status,
      data
    };
  } catch (error: any) {
    console.error('Error generating assessment:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
} 