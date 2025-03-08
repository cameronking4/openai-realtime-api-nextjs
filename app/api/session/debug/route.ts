import { NextResponse } from 'next/server';

// Define the tools that will be available to the AI
const tools = [
  {
    type: "function",
    name: "endSession",
    description: "Ends the current session with the patient. Use this when the assessment is complete or when the patient explicitly requests to end the session.",
    parameters: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          description: "The reason for ending the session (e.g., 'assessment complete', 'patient request', etc.)"
        }
      },
      required: ["reason"]
    }
  }
];

export async function GET() {
    try {
        // Return the tools configuration
        return NextResponse.json({
            tools,
            message: 'Session configuration retrieved successfully'
        });
    } catch (error: any) {
        console.error("Error retrieving session configuration:", error);
        return NextResponse.json(
            { error: `Failed to retrieve session configuration: ${error.message || error}` }, 
            { status: 500 }
        );
    }
} 