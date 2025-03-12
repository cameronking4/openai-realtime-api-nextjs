import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clearPromptCache } from '@/lib/prompt-service';

/**
 * PUT /api/prompts/versions/:id
 * Update a prompt version
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    const data = await request.json();
    
    // Find the prompt version to get its type
    const promptVersion = await prisma.promptVersion.findUnique({
      where: { id },
      include: { promptType: true }
    });
    
    if (!promptVersion) {
      return NextResponse.json({ error: 'Prompt version not found' }, { status: 404 });
    }
    
    // Update the prompt version
    const updatedVersion = await prisma.promptVersion.update({
      where: { id },
      data: {
        content: data.content,
        updatedAt: new Date()
      }
    });
    
    // If this is the active version, clear the cache
    if (promptVersion.isActive) {
      clearPromptCache(promptVersion.promptType.name);
    }
    
    return NextResponse.json(updatedVersion);
  } catch (error) {
    console.error('Failed to update prompt version:', error);
    return NextResponse.json({ error: 'Failed to update prompt version' }, { status: 500 });
  }
}

/**
 * POST /api/prompts/versions/:id/activate
 * Activate a prompt version
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // Find the prompt version to get its type
    const promptVersion = await prisma.promptVersion.findUnique({
      where: { id },
      include: { promptType: true }
    });
    
    if (!promptVersion) {
      return NextResponse.json({ error: 'Prompt version not found' }, { status: 404 });
    }
    
    // Deactivate all versions of this prompt type
    await prisma.promptVersion.updateMany({
      where: { promptTypeId: promptVersion.promptTypeId },
      data: { isActive: false }
    });
    
    // Activate this version
    const activatedVersion = await prisma.promptVersion.update({
      where: { id },
      data: { isActive: true }
    });
    
    // Clear the cache for this prompt type
    clearPromptCache(promptVersion.promptType.name);
    
    return NextResponse.json(activatedVersion);
  } catch (error) {
    console.error('Failed to activate prompt version:', error);
    return NextResponse.json({ error: 'Failed to activate prompt version' }, { status: 500 });
  }
} 