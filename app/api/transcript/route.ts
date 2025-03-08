import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Transcript } from '@/app/_lib/transcript-service';

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
    
    // Check if we're in a production environment (Vercel)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    if (isProduction) {
      // In production (Vercel), we can't write to the filesystem
      console.log(`Production environment detected. Transcript ${transcript.id} would be saved, but filesystem is read-only.`);
      
      // Return success without actually writing to the filesystem
      return NextResponse.json({ 
        success: true, 
        message: 'Transcript received (not saved in production environment)',
        transcriptId: transcript.id,
        environment: 'production'
      });
    } else {
      // In development, save transcript to file
      try {
        const filePath = path.join(TRANSCRIPTS_DIR, `${transcript.id}.json`);
        fs.writeFileSync(filePath, JSON.stringify(transcript, null, 2));
        
        console.log(`Transcript saved to ${filePath}`);
        
        return NextResponse.json({ 
          success: true, 
          message: 'Transcript saved successfully',
          transcriptId: transcript.id,
          environment: 'development'
        });
      } catch (writeError: any) {
        console.error('Error writing transcript file:', writeError);
        return NextResponse.json(
          { error: `Failed to save transcript: ${writeError.message || writeError}` },
          { status: 500 }
        );
      }
    }
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
    // Check if we're in a production environment (Vercel)
    const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
    
    if (isProduction) {
      // In production (Vercel), we can't read from the filesystem directory
      console.log('Production environment detected. Returning empty transcripts array.');
      return NextResponse.json({ 
        transcripts: [],
        environment: 'production'
      });
    }
    
    // Check if directory exists
    if (!fs.existsSync(TRANSCRIPTS_DIR)) {
      return NextResponse.json({ 
        transcripts: [],
        environment: 'development'
      });
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
    
    return NextResponse.json({ 
      transcripts,
      environment: 'development'
    });
  } catch (error: any) {
    console.error('Error retrieving transcripts:', error);
    return NextResponse.json(
      { error: `Failed to retrieve transcripts: ${error.message || error}` },
      { status: 500 }
    );
  }
} 