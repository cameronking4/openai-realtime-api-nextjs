import { Conversation } from "./conversations";

/**
 * Interface for transcript data
 */
export interface Transcript {
  id: string;
  sessionId: string;
  createdAt: string;
  content: string;
  metadata: {
    messageCount: number;
    userMessageCount: number;
    assistantMessageCount: number;
    duration: number; // in seconds
  };
}

/**
 * Generate a transcript from conversation data
 */
export function generateTranscript(
  conversation: Conversation[],
  sessionId: string
): Transcript {
  // Filter out non-final messages and sort by timestamp
  const finalMessages = conversation
    .filter((msg) => msg.isFinal && msg.text.trim().length > 0)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Calculate metadata
  const userMessages = finalMessages.filter((msg) => msg.role === "user");
  const assistantMessages = finalMessages.filter((msg) => msg.role === "assistant");
  
  // Calculate session duration (if there are messages)
  let duration = 0;
  if (finalMessages.length >= 2) {
    const firstTimestamp = new Date(finalMessages[0].timestamp).getTime();
    const lastTimestamp = new Date(finalMessages[finalMessages.length - 1].timestamp).getTime();
    duration = Math.round((lastTimestamp - firstTimestamp) / 1000);
  }

  // Format the transcript content
  let content = "";
  
  finalMessages.forEach((msg) => {
    const time = new Date(msg.timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
    });
    const speaker = msg.role === "user" ? "Patient" : "Eve";
    content += `[${time}] ${speaker}: ${msg.text}\n\n`;
  });

  return {
    id: `transcript_${Date.now()}`,
    sessionId,
    createdAt: new Date().toISOString(),
    content,
    metadata: {
      messageCount: finalMessages.length,
      userMessageCount: userMessages.length,
      assistantMessageCount: assistantMessages.length,
      duration,
    },
  };
}

/**
 * Save transcript to localStorage (client-side storage)
 */
export function saveTranscript(transcript: Transcript): void {
  try {
    // Get existing transcripts or initialize empty array
    const existingTranscriptsJson = localStorage.getItem("transcripts");
    const existingTranscripts: Transcript[] = existingTranscriptsJson 
      ? JSON.parse(existingTranscriptsJson) 
      : [];
    
    // Add new transcript
    existingTranscripts.push(transcript);
    
    // Save back to localStorage
    localStorage.setItem("transcripts", JSON.stringify(existingTranscripts));
    
    console.log(`Transcript saved to localStorage with ID: ${transcript.id}`);
    
    // Also save to server (if available)
    saveTranscriptToServer(transcript).catch(error => {
      console.error("Error saving transcript to server:", error);
    });
  } catch (error) {
    console.error("Error saving transcript to localStorage:", error);
  }
}

/**
 * Save transcript to server via API
 */
export async function saveTranscriptToServer(transcript: Transcript): Promise<void> {
  try {
    const response = await fetch('/api/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transcript),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Server error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Transcript saved to server with ID: ${data.transcriptId}`);
  } catch (error) {
    console.error('Failed to save transcript to server:', error);
    throw error; // Re-throw to allow caller to handle
  }
}

/**
 * Get all saved transcripts from localStorage
 */
export function getTranscripts(): Transcript[] {
  try {
    const transcriptsJson = localStorage.getItem("transcripts");
    return transcriptsJson ? JSON.parse(transcriptsJson) : [];
  } catch (error) {
    console.error("Error retrieving transcripts from localStorage:", error);
    return [];
  }
}

/**
 * Get all saved transcripts from server
 */
export async function getTranscriptsFromServer(): Promise<Transcript[]> {
  try {
    const response = await fetch('/api/transcript');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Server error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    return data.transcripts || [];
  } catch (error) {
    console.error('Failed to retrieve transcripts from server:', error);
    return []; // Return empty array on error
  }
}

/**
 * Get a specific transcript by ID
 */
export function getTranscriptById(id: string): Transcript | null {
  try {
    const transcripts = getTranscripts();
    return transcripts.find(transcript => transcript.id === id) || null;
  } catch (error) {
    console.error("Error retrieving transcript by ID:", error);
    return null;
  }
} 