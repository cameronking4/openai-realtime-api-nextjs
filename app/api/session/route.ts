import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PSYCHO_ONCOLOGY_ASSESSMENT_PROMPT } from "../../../prompts/ai-conversation-templates";

// Read the API key directly from .env.local file
let apiKey = '';
try {
  const envLocalPath = path.join(process.cwd(), '.env.local');
  const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
  const apiKeyMatch = envLocalContent.match(/OPENAI_API_KEY=([^\n]+)/);
  if (apiKeyMatch && apiKeyMatch[1]) {
    apiKey = apiKeyMatch[1].trim();
    console.log('Successfully read API key from .env.local');
  } else {
    // Fallback to process.env
    apiKey = process.env.OPENAI_API_KEY || '';
    console.log('Using API key from process.env');
  }
} catch (error) {
  console.error('Error reading .env.local file:', error);
  // Fallback to process.env
  apiKey = process.env.OPENAI_API_KEY || '';
  console.log('Using API key from process.env');
}

export async function POST() {
    try {        
        if (!apiKey){
            throw new Error(`OPENAI_API_KEY is not set`);
        }
        
        console.log('Using API key:', apiKey.substring(0, 10) + '...');
        
        const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-realtime-preview-2024-12-17",
                voice: "alloy",
                modalities: ["audio", "text"],
                instructions: PSYCHO_ONCOLOGY_ASSESSMENT_PROMPT,
                tool_choice: "auto",
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
        }

        const data = await response.json();

        // Return the JSON response to the client
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching session data:", error);
        return NextResponse.json({ error: "Failed to fetch session data" }, { status: 500 });
    }
}