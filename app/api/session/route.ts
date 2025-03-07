import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PSYCHO_ONCOLOGY_ASSESSMENT_PROMPT } from "../../../prompts/ai-conversation-templates";

// Read the API key directly from .env.local file or .env file
let apiKey = '';
try {
  // First try to read from .env.local
  let envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    // If .env.local doesn't exist, try .env
    envPath = path.join(process.cwd(), '.env');
  }
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Use a more robust regex that can handle multiline values
    const apiKeyRegex = /OPENAI_API_KEY=([^\n]*(?:\n[^\n]+)*?)(?=\n\w+=|\n*$)/;
    const match = envContent.match(apiKeyRegex);
    
    if (match && match[1]) {
      // Clean up the key - remove any newlines and trim
      apiKey = match[1].replace(/\n/g, '').trim();
      console.log('Successfully read API key from env file');
    }
  }
  
  // If we still don't have an API key, try process.env
  if (!apiKey) {
    apiKey = process.env.OPENAI_API_KEY || '';
    console.log('Using API key from process.env');
  }
} catch (error) {
  console.error('Error reading env file:', error);
  // Fallback to process.env
  apiKey = process.env.OPENAI_API_KEY || '';
  console.log('Using API key from process.env');
}

export async function POST(request: Request) {
    try {        
        if (!apiKey){
            throw new Error(`OPENAI_API_KEY is not set`);
        }
        
        // Parse request body to get modality if provided
        let modality = "text";
        let requestBody: { modality?: string } = {};
        
        try {
            requestBody = await request.json();
            modality = requestBody.modality || "text";
        } catch (error) {
            console.log("Could not parse request body, using default text modality");
        }

        const modalities = modality === "text" ? ["text"] : ["text", "audio"];
        console.log('Creating session with modalities:', modalities);
        
        // Log truncated API key for debugging
        console.log('Using API key:', apiKey.substring(0, 5) + '...' + apiKey.substring(apiKey.length - 3));
        
        // Construct the session request body
        const sessionRequestBody = {
            model: "gpt-4o-realtime-preview-2024-12-17",
            voice: "alloy",
            modalities: modalities,
            instructions: PSYCHO_ONCOLOGY_ASSESSMENT_PROMPT,
            tool_choice: "auto",
        };
        
        console.log("Session request:", JSON.stringify(sessionRequestBody));
        
        try {
            const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sessionRequestBody),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`API request failed: ${response.status} - ${errorText}`);
                return NextResponse.json(
                    { error: `API request failed: ${response.status} - ${errorText}` }, 
                    { status: response.status }
                );
            }

            const data = await response.json();
            console.log("Successfully created session with ID:", data.id || "unknown");

            // Return the JSON response to the client
            return NextResponse.json(data);
        } catch (fetchError: any) {
            // Handle network connectivity issues
            console.error("Fetch error details:", fetchError);
            
            // Check for DNS resolution issues
            if (fetchError.cause && 
                (fetchError.cause.code === 'ENOTFOUND' || 
                 fetchError.cause.syscall === 'getaddrinfo')) {
                return NextResponse.json(
                    { 
                        error: `Network connectivity issue: Cannot reach OpenAI API. Please check your internet connection.`,
                        details: `${fetchError.message}: ${fetchError.cause.code} - ${fetchError.cause.hostname}`
                    }, 
                    { status: 503 }
                );
            }
            
            // Handle other fetch errors
            return NextResponse.json(
                { 
                    error: `Failed to connect to OpenAI API: ${fetchError.message}`,
                    details: fetchError.toString()
                }, 
                { status: 500 }
            );
        }
    } catch (error: any) {
        console.error("Error fetching session data:", error);
        return NextResponse.json(
            { error: `Failed to fetch session data: ${error.message || error}` }, 
            { status: 500 }
        );
    }
}