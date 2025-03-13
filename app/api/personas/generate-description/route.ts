import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Persona } from '@/lib/persona-service';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY?.replace(/[\s"']+/g, ''),
});

// Helper function to format diagnosis date
function formatDiagnosisDate(date?: Date | string | null): string {
  if (!date) return 'recently';
  
  const diagnosisDate = new Date(date);
  const now = new Date();
  const monthsDiff = (now.getFullYear() - diagnosisDate.getFullYear()) * 12 + 
                     (now.getMonth() - diagnosisDate.getMonth());
  
  if (monthsDiff < 1) {
    return 'within the last month';
  } else if (monthsDiff === 1) {
    return 'about a month ago';
  } else {
    return `about ${monthsDiff} months ago`;
  }
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const persona: Partial<Persona> = await req.json();

    // Validate required fields
    if (!persona.name || !persona.age || !persona.gender || !persona.cancerType || !persona.cancerStage) {
      return NextResponse.json(
        { error: 'Missing required persona fields' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not found. Please add your OpenAI API key to the .env.local file.' },
        { status: 503 }
      );
    }

    // Create a prompt for generating the description
    const prompt = `
      Create a detailed and empathetic description for a cancer patient persona with the following characteristics:
      
      Name: ${persona.name}
      Age: ${persona.age}
      Gender: ${persona.gender}
      Cancer Type: ${persona.cancerType}
      Cancer Stage: ${persona.cancerStage}
      Treatment Status: ${persona.treatmentStatus || 'Unknown'}
      Diagnosis Date: ${formatDiagnosisDate(persona.diagnosisDate)}
      
      Psychological Profile:
      - Anxiety Level (1-10): ${persona.psychologicalProfile?.anxiety || 5}
      - Depression Level (1-10): ${persona.psychologicalProfile?.depression || 5}
      - Distress Level (1-10): ${persona.psychologicalProfile?.distress || 5}
      - Self-Efficacy (1-10): ${persona.psychologicalProfile?.selfEfficacy || 5}
      - Support Network Strength (1-10): ${persona.psychologicalProfile?.supportNetworkStrength || 5}
      
      Communication Style:
      - Articulation Level (1-10): ${persona.communicationStyle?.articulationLevel || 5}
      - Openness (1-10): ${persona.communicationStyle?.openness || 5}
      - Directness (1-10): ${persona.communicationStyle?.directness || 5}
      - Emotional Expression (1-10): ${persona.communicationStyle?.emotionalExpression || 5}
      
      The description should be 3-4 paragraphs long and include:
      1. A brief overview of their cancer journey and current situation, including when they were diagnosed
      2. Their emotional and psychological state
      3. How they typically communicate about their condition
      4. Their main concerns, fears, and hopes
      
      Write in third person as if describing the persona to someone else. Be empathetic, realistic, and nuanced.
    `;

    try {
      // Generate the description using OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an expert in creating realistic patient personas for healthcare simulations. Your descriptions are empathetic, detailed, and psychologically nuanced."
          },
          { 
            role: "user", 
            content: prompt 
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Extract the generated description
      const description = completion.choices[0]?.message?.content?.trim() || '';

      // Return the generated description
      return NextResponse.json({ description });
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return NextResponse.json(
        { error: `OpenAI API error: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}. Please check your API key and internet connection.` },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Error generating persona description:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
} 