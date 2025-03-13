import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface RefinementRequest {
  currentPrompt: string;
  evaluationResults: Array<{
    personaId: string;
    personaName: string;
    scores: {
      accuracy: number;
      empathy: number;
      clarity: number;
      overall: number;
    };
    strengths: string[];
    weaknesses: string[];
  }>;
  focusAreas?: string[];
}

interface RefinementResponse {
  suggestions: Array<{
    title: string;
    description: string;
    promptText: string;
    expectedImprovements: string[];
  }>;
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { currentPrompt, evaluationResults, focusAreas = [] }: RefinementRequest = await req.json();

    // Validate required fields
    if (!currentPrompt || !evaluationResults || evaluationResults.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: currentPrompt or evaluationResults' },
        { status: 400 }
      );
    }

    // Calculate average scores
    const averageScores = {
      accuracy: 0,
      empathy: 0,
      clarity: 0,
      overall: 0,
    };

    evaluationResults.forEach(result => {
      averageScores.accuracy += result.scores.accuracy;
      averageScores.empathy += result.scores.empathy;
      averageScores.clarity += result.scores.clarity;
      averageScores.overall += result.scores.overall;
    });

    const count = evaluationResults.length;
    averageScores.accuracy /= count;
    averageScores.empathy /= count;
    averageScores.clarity /= count;
    averageScores.overall /= count;

    // Collect all weaknesses
    const allWeaknesses = evaluationResults.flatMap(result => result.weaknesses);

    // Create a prompt for generating refinement suggestions
    const prompt = `
      You are helping to refine a prompt used for generating clinical assessment notes for cancer patients.
      
      CURRENT PROMPT:
      ${currentPrompt}
      
      EVALUATION RESULTS:
      Average Scores (scale 1-10):
      - Accuracy: ${averageScores.accuracy.toFixed(1)}
      - Empathy: ${averageScores.empathy.toFixed(1)}
      - Clarity: ${averageScores.clarity.toFixed(1)}
      - Overall: ${averageScores.overall.toFixed(1)}
      
      Common Weaknesses Identified:
      ${allWeaknesses.map(weakness => `- ${weakness}`).join('\n')}
      
      ${focusAreas.length > 0 ? `SPECIFIC AREAS TO FOCUS ON:\n${focusAreas.map(area => `- ${area}`).join('\n')}` : ''}
      
      TASK:
      Generate 3 different suggestions for refining the prompt. Each suggestion should:
      1. Have a clear focus and approach
      2. Include a complete revised prompt (not just the changes)
      3. Explain how it addresses the weaknesses identified
      4. Predict what specific improvements it will lead to
      
      Format your response as a JSON object with the following structure:
      {
        "suggestions": [
          {
            "title": "Brief descriptive title of the suggestion",
            "description": "A paragraph explaining the approach and rationale",
            "promptText": "The complete revised prompt text",
            "expectedImprovements": ["Specific improvement 1", "Specific improvement 2", ...]
          },
          ...
        ]
      }
    `;

    // Generate the refinement suggestions using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert in prompt engineering and clinical psychology. You help refine prompts to improve the quality of AI-generated clinical assessments for cancer patients."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    // Extract and parse the refinement suggestions
    const resultText = completion.choices[0]?.message?.content?.trim() || '{"suggestions":[]}';
    const result: RefinementResponse = JSON.parse(resultText);

    // Return the refinement suggestions
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating prompt refinement suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt refinement suggestions' },
      { status: 500 }
    );
  }
} 