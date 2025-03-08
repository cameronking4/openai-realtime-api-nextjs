import { NextRequest, NextResponse } from 'next/server';
import { Transcript } from '@/app/_lib/transcript-service';

// GET /api/transcript - Get all transcripts
export async function GET(request: NextRequest) {
  try {
    // In a real app, this would fetch from a database
    const transcripts: Transcript[] = [];
    return NextResponse.json({ transcripts });
  } catch (error) {
    console.error('Error fetching transcripts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcripts' },
      { status: 500 }
    );
  }
}

// POST /api/transcript - Save a transcript
export async function POST(request: NextRequest) {
  try {
    const transcript = await request.json();
    
    // Validate the transcript
    if (!transcript || !transcript.sessionId || !transcript.content) {
      return NextResponse.json(
        { error: 'Invalid transcript data' },
        { status: 400 }
      );
    }
    
    // In a real app, this would save to a database
    // For now, we'll just return success
    return NextResponse.json({ 
      success: true,
      message: 'Transcript saved successfully',
      transcriptId: transcript.id
    });
  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json(
      { error: 'Failed to save transcript' },
      { status: 500 }
    );
  }
} 