import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clearPromptCache } from '@/lib/prompt-service';

/**
 * POST /api/prompts/versions/[id]/activate
 * Activate a prompt version
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const versionId = parseInt(params.id);
    
    if (isNaN(versionId)) {
      return NextResponse.json({ error: 'Invalid version ID' }, { status: 400 });
    }
    
    // Get the prompt version
    const version = await prisma.promptVersion.findUnique({
      where: { id: versionId },
      include: { promptType: true }
    });
    
    if (!version) {
      return NextResponse.json({ error: 'Prompt version not found' }, { status: 404 });
    }
    
    // Deactivate all versions for this prompt type
    await prisma.promptVersion.updateMany({
      where: { promptTypeId: version.promptTypeId },
      data: { isActive: false }
    });
    
    // Activate the selected version
    const activatedVersion = await prisma.promptVersion.update({
      where: { id: versionId },
      data: { isActive: true }
    });
    
    // Clear cache for this prompt type
    clearPromptCache(version.promptType.name);
    
    return NextResponse.json({ success: true, version: activatedVersion });
  } catch (error) {
    console.error('Failed to activate prompt version:', error);
    return NextResponse.json({ error: 'Failed to activate prompt version' }, { status: 500 });
  }
} 