import { NextRequest, NextResponse } from 'next/server';
import { 
  getPersonas, 
  createPersona, 
  generatePersonas,
  PersonaGenerationOptions,
  PersonaCreateInput
} from '@/lib/persona-service';

// GET /api/personas - Get all personas with optional filtering
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isArchived = searchParams.get('archived') === 'true';
    const cancerType = searchParams.get('cancerType') || undefined;
    const tagsParam = searchParams.get('tags');
    const tags = tagsParam ? tagsParam.split(',') : undefined;
    const searchTerm = searchParams.get('search') || undefined;

    const personas = await getPersonas({
      isArchived,
      cancerType,
      tags,
      searchTerm
    });

    return NextResponse.json(personas);
  } catch (error) {
    console.error('Error fetching personas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  }
}

// POST /api/personas - Create a new persona
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/personas - Request body:', body);
    
    // Check if this is a generation request or a direct creation request
    if (body.generate) {
      // This is a generation request
      const options: PersonaGenerationOptions = {
        count: body.count || 1,
        cancerType: body.cancerType,
        psychologicalFocus: body.psychologicalFocus,
        communicationStyle: body.communicationStyle,
        ageRange: body.ageRange,
        gender: body.gender
      };
      
      console.log('Generating personas with options:', options);
      
      // Check if OpenAI API key is set and valid
      if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API key not found in environment variables');
        return NextResponse.json(
          { error: 'OpenAI API key not found. Please add your OpenAI API key to the .env.local file.' },
          { status: 503 } // Service Unavailable
        );
      }
      
      if (process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        console.error('OpenAI API key is set to the placeholder value');
        return NextResponse.json(
          { error: 'OpenAI API key is set to the placeholder value. Please replace it with your actual API key in the .env.local file.' },
          { status: 503 } // Service Unavailable
        );
      }
      
      try {
        // Generate personas
        console.log('Calling generatePersonas function');
        const generatedPersonas = await generatePersonas(options);
        console.log(`Generated ${generatedPersonas.length} personas`);
        
        if (!generatedPersonas || generatedPersonas.length === 0) {
          console.error('No personas were generated');
          return NextResponse.json(
            { error: 'No personas were generated. Please try again.' },
            { status: 500 }
          );
        }
        
        // Save personas to database if requested
        if (body.save) {
          console.log('Saving personas to database');
          const savedPersonas = [];
          for (const persona of generatedPersonas) {
            console.log(`Saving persona: ${persona.name}`);
            const savedPersona = await createPersona(persona);
            savedPersonas.push(savedPersona);
          }
          console.log(`Saved ${savedPersonas.length} personas to database`);
          return NextResponse.json(savedPersonas, { status: 201 });
        }
        
        // Otherwise just return the generated personas without saving
        return NextResponse.json(generatedPersonas);
      } catch (error) {
        // Handle OpenAI API errors specifically
        console.error('Error generating personas:', error);
        return NextResponse.json(
          { error: error instanceof Error ? error.message : 'Failed to generate personas with OpenAI' },
          { status: 503 } // Service Unavailable
        );
      }
    } else {
      // This is a direct creation request
      const personaData: PersonaCreateInput = {
        name: body.name,
        age: body.age,
        gender: body.gender,
        description: body.description,
        cancerType: body.cancerType,
        cancerStage: body.cancerStage,
        diagnosisDate: body.diagnosisDate ? new Date(body.diagnosisDate) : undefined,
        treatmentStatus: body.treatmentStatus,
        psychologicalProfile: body.psychologicalProfile,
        communicationStyle: body.communicationStyle,
        background: body.background,
        behavioralPatterns: body.behavioralPatterns,
        personalConcerns: body.personalConcerns,
        tags: body.tags
      };
      
      const persona = await createPersona(personaData);
      return NextResponse.json(persona, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating persona:', error);
    return NextResponse.json(
      { error: 'Failed to create persona' },
      { status: 500 }
    );
  }
} 