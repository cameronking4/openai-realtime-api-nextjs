import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const filePath = url.searchParams.get('file');
  
  if (!filePath) {
    return NextResponse.json({ error: 'No file specified' }, { status: 400 });
  }
  
  // Ensure the file is from the public directory and is a JavaScript file
  if (!filePath.endsWith('.js') || filePath.includes('..')) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
  }
  
  try {
    const fullPath = path.join(process.cwd(), 'public', filePath);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    
    return new NextResponse(fileContents, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error serving worklet file:', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
} 