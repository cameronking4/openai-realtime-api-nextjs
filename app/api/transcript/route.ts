import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Transcript } from '@/lib/transcript-service';

// Directory to store transcripts
const TRANSCRIPTS_DIR = path.join(process.cwd(), 'data', 'transcripts');

// Ensure the transcripts directory exists
try {
  if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'));
  }
  
  if (!fs.existsSync(TRANSCRIPTS_DIR)) {
    fs.mkdirSync(TRANSCRIPTS_DIR);
  }
} catch (error) {
  console.error('Error creating transcripts directory:', error);
}

/**
 * POST handler to save a transcript
 */
export async function POST(request: Request) {
  try {
    // Parse the request body
    const transcript: Transcript = await request.json();
    
    if (!transcript || !transcript.id || !transcript.content) {
      return NextResponse.json(
        { error: 'Invalid transcript data' },
        { status: 400 }
      );
    }
    
    // Save transcript to file
    const filePath = path.join(TRANSCRIPTS_DIR, `${transcript.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(transcript, null, 2));
    
    console.log(`Transcript saved to ${filePath}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Transcript saved successfully',
      transcriptId: transcript.id
    });
  } catch (error: any) {
    console.error('Error saving transcript:', error);
    return NextResponse.json(
      { error: `Failed to save transcript: ${error.message || error}` },
      { status: 500 }
    );
  }
}

/**
 * GET handler to retrieve all transcripts
 */
export async function GET() {
  try {
    // Check if directory exists
    if (!fs.existsSync(TRANSCRIPTS_DIR)) {
      return NextResponse.json({ transcripts: [] });
    }
    
    // Read all transcript files
    const files = fs.readdirSync(TRANSCRIPTS_DIR);
    const transcripts: Transcript[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(TRANSCRIPTS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const transcript = JSON.parse(content) as Transcript;
        transcripts.push(transcript);
      }
    }
    
    // Sort by creation date (newest first)
    transcripts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json({ transcripts });
  } catch (error: any) {
    console.error('Error retrieving transcripts:', error);
    return NextResponse.json(
      { error: `Failed to retrieve transcripts: ${error.message || error}` },
      { status: 500 }
    );
  }
} 