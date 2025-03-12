import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { clearPromptCache } from '@/lib/prompt-service';

/**
 * GET /api/prompts/versions?promptTypeId=1
 * Get all versions for a prompt type
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const promptTypeId = searchParams.get('promptTypeId');
    
    if (!promptTypeId) {
      return NextResponse.json({ error: 'promptTypeId is required' }, { status: 400 });
    }
    
    const versions = await prisma.promptVersion.findMany({
      where: { promptTypeId: parseInt(promptTypeId) },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(versions);
  } catch (error) {
    console.error('Failed to fetch prompt versions:', error);
    return NextResponse.json({ error: 'Failed to fetch prompt versions' }, { status: 500 });
  }
}

/**
 * POST /api/prompts/versions
 * Create a new prompt version
 */
export async function POST(request: Request) {
  try {
    const { promptTypeId, versionName, description, content, author, isActive } = await request.json();
    
    // Validate input
    if (!promptTypeId || !versionName || !content) {
      return NextResponse.json({ error: 'promptTypeId, versionName, and content are required' }, { status: 400 });
    }
    
    // Check if prompt type exists
    const promptType = await prisma.promptType.findUnique({
      where: { id: promptTypeId }
    });
    
    if (!promptType) {
      return NextResponse.json({ error: 'Prompt type not found' }, { status: 404 });
    }
    
    // If this version is active, deactivate all other versions
    if (isActive) {
      await prisma.promptVersion.updateMany({
        where: { promptTypeId },
        data: { isActive: false }
      });
      
      // Clear cache for this prompt type
      clearPromptCache(promptType.name);
    }
    
    // Create prompt version
    const promptVersion = await prisma.promptVersion.create({
      data: {
        promptTypeId,
        versionName,
        description,
        content,
        author,
        isActive: isActive || false
      }
    });
    
    return NextResponse.json(promptVersion);
  } catch (error) {
    console.error('Failed to create prompt version:', error);
    return NextResponse.json({ error: 'Failed to create prompt version' }, { status: 500 });
  }
} 