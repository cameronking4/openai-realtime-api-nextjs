import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Persona } from '@/lib/persona-service';
import { ChatCompletionMessageParam } from 'openai/resources';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SimulationRequest {
  persona: Persona;
  conversation: Array<{ role: string; content: string }>;
  currentTopic?: string;
  randomnessFactor?: number; // 0-1, higher means more random/unpredictable responses
}

interface SimulationResponse {
  response: string;
  metadata: {
    emotionalState: string;
    topicChange: boolean;
    newTopic?: string;
    questionAsked: boolean;
    avoidance: number; // 0-10 scale
  };
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const { persona, conversation, currentTopic = '', randomnessFactor = 0.3 }: SimulationRequest = await req.json();

    // Validate required fields
    if (!persona || !conversation || conversation.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: persona or conversation' },
        { status: 400 }
      );
    }

    // Create a system prompt that defines the patient persona
    const systemPrompt = `
      You are roleplaying as a cancer patient with the following characteristics:
      
      Name: ${persona.name}
      Age: ${persona.age}
      Gender: ${persona.gender}
      Cancer Type: ${persona.cancerType}
      Cancer Stage: ${persona.cancerStage}
      Treatment Status: ${persona.treatmentStatus || 'Unknown'}
      
      Psychological Profile:
      - Anxiety Level (1-10): ${persona.psychologicalProfile?.anxiety || 5}
      - Depression Level (1-10): ${persona.psychologicalProfile?.depression || 5}
      - Distress Level (1-10): ${persona.psychologicalProfile?.distress || 5}
      - Self-Efficacy (1-10): ${persona.psychologicalProfile?.selfEfficacy || 5}
      - Support Network Strength (1-10): ${persona.psychologicalProfile?.supportNetworkStrength || 5}
      
      Communication Style:
      - Articulation Level (1-10): ${persona.communicationStyle?.articulationLevel || 5}
      - Openness (1-10): ${persona.communicationStyle?.openness || 5}
      - Directness (1-10): ${persona.communicationStyle?.directness || 5}
      - Emotional Expression (1-10): ${persona.communicationStyle?.emotionalExpression || 5}
      
      ${persona.background ? `
      Background:
      - Family Status: ${persona.background.familyStatus || 'Unknown'}
      - Occupation: ${persona.background.occupation || 'Unknown'}
      - Important Life Events: ${persona.background.importantLifeEvents?.join(', ') || 'None specified'}
      ` : ''}
      
      ${persona.behavioralPatterns ? `
      Behavioral Patterns:
      ${persona.behavioralPatterns.map((pattern: string) => `- ${pattern}`).join('\n')}
      ` : ''}
      
      ${persona.personalConcerns ? `
      Personal Concerns:
      ${persona.personalConcerns.map((concern: string) => `- ${concern}`).join('\n')}
      ` : ''}
      
      Current Topic of Conversation: ${currentTopic || 'General cancer experience'}
      
      IMPORTANT GUIDELINES:
      1. Respond as this patient would, with their specific communication style, psychological profile, and concerns.
      2. Use natural, conversational language appropriate to the patient's education and articulation level.
      3. Express emotions consistent with the patient's psychological profile and emotional expression level.
      4. Occasionally introduce new concerns or topics that would be relevant to this patient.
      5. Sometimes ask questions of your own, as real patients do.
      6. If the patient has high anxiety or depression, occasionally show avoidance or reluctance to discuss difficult topics.
      7. Keep responses relatively brief (1-3 paragraphs maximum).
      8. Do not break character under any circumstances.
      
      In addition to your response, you will provide metadata about your response in a JSON format at the end, surrounded by triple backticks. The metadata should include:
      - emotionalState: The primary emotional state expressed in the response
      - topicChange: Whether you introduced a new topic (true/false)
      - newTopic: If topicChange is true, what is the new topic
      - questionAsked: Whether you asked a question (true/false)
      - avoidance: On a scale of 0-10, how much avoidance behavior is shown in the response
      
      Example metadata format:
      \`\`\`json
      {
        "emotionalState": "anxious",
        "topicChange": true,
        "newTopic": "side effects of chemotherapy",
        "questionAsked": true,
        "avoidance": 3
      }
      \`\`\`
    `;

    // Format the conversation history for the API call
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
    ];

    // Add the conversation history
    conversation.forEach(msg => {
      messages.push({
        role: msg.role === 'patient' ? 'assistant' : 'user',
        content: msg.content
      } as ChatCompletionMessageParam);
    });

    // Generate the patient response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7 + (randomnessFactor * 0.3), // Adjust temperature based on randomness factor
      max_tokens: 1000,
    });

    // Extract the response and metadata
    const fullResponse = completion.choices[0]?.message?.content?.trim() || '';
    
    // Parse the response to extract the metadata JSON
    const metadataMatch = fullResponse.match(/```json\s*([\s\S]*?)\s*```$/);
    let metadata = {
      emotionalState: "neutral",
      topicChange: false,
      questionAsked: false,
      avoidance: 0
    };
    
    let response = fullResponse;
    
    if (metadataMatch && metadataMatch[1]) {
      try {
        // Remove the metadata section from the response
        response = fullResponse.replace(/```json\s*[\s\S]*?\s*```$/, '').trim();
        
        // Parse the metadata
        metadata = JSON.parse(metadataMatch[1]);
      } catch (error) {
        console.error('Error parsing metadata:', error);
      }
    }

    // Return the patient response and metadata
    return NextResponse.json({
      response,
      metadata
    });
  } catch (error) {
    console.error('Error simulating patient response:', error);
    return NextResponse.json(
      { error: 'Failed to simulate patient response' },
      { status: 500 }
    );
  }
} 