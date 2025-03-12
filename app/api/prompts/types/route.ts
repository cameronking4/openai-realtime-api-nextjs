import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/prompts/types
 * Get all prompt types with their active versions
 */
export async function GET() {
  try {
    const promptTypes = await prisma.promptType.findMany({
      include: {
        versions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    return NextResponse.json(promptTypes);
  } catch (error) {
    console.error('Failed to fetch prompt types:', error);
    return NextResponse.json({ error: 'Failed to fetch prompt types' }, { status: 500 });
  }
}

/**
 * POST /api/prompts/types
 * Create a new prompt type
 */
export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    
    // Validate input
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    
    // Check if prompt type already exists
    const existingType = await prisma.promptType.findUnique({
      where: { name }
    });
    
    if (existingType) {
      return NextResponse.json({ error: 'Prompt type with this name already exists' }, { status: 409 });
    }
    
    // Create prompt type
    const promptType = await prisma.promptType.create({
      data: { name, description }
    });
    
    return NextResponse.json(promptType);
  } catch (error) {
    console.error('Failed to create prompt type:', error);
    return NextResponse.json({ error: 'Failed to create prompt type' }, { status: 500 });
  }
} 