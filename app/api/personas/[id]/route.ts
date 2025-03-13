import { NextRequest, NextResponse } from 'next/server';
import { 
  getPersonaById, 
  updatePersona, 
  archivePersona, 
  deletePersona,
  PersonaUpdateInput
} from '@/lib/persona-service';

// GET /api/personas/[id] - Get a specific persona by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid persona ID' },
        { status: 400 }
      );
    }
    
    const persona = await getPersonaById(id);
    
    if (!persona) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(persona);
  } catch (error) {
    console.error('Error fetching persona:', error);
    return NextResponse.json(
      { error: 'Failed to fetch persona' },
      { status: 500 }
    );
  }
}

// PUT /api/personas/[id] - Update a persona (full update)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid persona ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // Prepare update data
    const updateData: PersonaUpdateInput = {
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
      tags: body.tags,
      isArchived: body.isArchived
    };
    
    const updatedPersona = await updatePersona(id, updateData);
    
    return NextResponse.json(updatedPersona);
  } catch (error) {
    console.error('Error updating persona:', error);
    
    // Handle not found error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update persona' },
      { status: 500 }
    );
  }
}

// PATCH /api/personas/[id] - Update a persona (partial update)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid persona ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // For PATCH, we only include the fields that are provided
    const updateData: PersonaUpdateInput = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.age !== undefined) updateData.age = body.age;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.cancerType !== undefined) updateData.cancerType = body.cancerType;
    if (body.cancerStage !== undefined) updateData.cancerStage = body.cancerStage;
    if (body.diagnosisDate !== undefined) {
      updateData.diagnosisDate = body.diagnosisDate ? new Date(body.diagnosisDate) : undefined;
    }
    if (body.treatmentStatus !== undefined) updateData.treatmentStatus = body.treatmentStatus;
    if (body.psychologicalProfile !== undefined) updateData.psychologicalProfile = body.psychologicalProfile;
    if (body.communicationStyle !== undefined) updateData.communicationStyle = body.communicationStyle;
    if (body.background !== undefined) updateData.background = body.background;
    if (body.behavioralPatterns !== undefined) updateData.behavioralPatterns = body.behavioralPatterns;
    if (body.personalConcerns !== undefined) updateData.personalConcerns = body.personalConcerns;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.isArchived !== undefined) updateData.isArchived = body.isArchived;
    
    const updatedPersona = await updatePersona(id, updateData);
    
    return NextResponse.json(updatedPersona);
  } catch (error) {
    console.error('Error updating persona:', error);
    
    // Handle not found error
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update persona' },
      { status: 500 }
    );
  }
}

// DELETE /api/personas/[id] - Delete a persona
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid persona ID' },
        { status: 400 }
      );
    }
    
    // Check if this is a soft delete (archive) or hard delete
    const searchParams = request.nextUrl.searchParams;
    const isSoftDelete = searchParams.get('soft') === 'true';
    
    if (isSoftDelete) {
      // Soft delete (archive)
      await archivePersona(id);
    } else {
      // Hard delete
      await deletePersona(id);
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting persona:', error);
    
    // Handle not found error
    if (error instanceof Error && 
        (error.message.includes('Record to delete does not exist') || 
         error.message.includes('Record to update not found'))) {
      return NextResponse.json(
        { error: 'Persona not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete persona' },
      { status: 500 }
    );
  }
} 