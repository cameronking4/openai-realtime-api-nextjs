import { NextResponse } from 'next/server';
import { generatePersonas, PersonaGenerationOptions } from '@/lib/persona-service';

export async function POST(req: Request) {
  try {
    // Parse the request body
    const options: PersonaGenerationOptions = await req.json();
    
    // Validate required fields
    if (!options.count || options.count < 1) {
      return NextResponse.json(
        { error: 'Count must be at least 1' },
        { status: 400 }
      );
    }
    
    // Generate personas using the LLM
    const personas = await generatePersonas(options);
    
    // Return the generated personas
    return NextResponse.json({ personas });
  } catch (error) {
    console.error('Error in persona generation API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate personas' },
      { status: 503 }
    );
  }
} 