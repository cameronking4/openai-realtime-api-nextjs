import { NextResponse } from 'next/server';
import { tools } from '../../session/route';

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