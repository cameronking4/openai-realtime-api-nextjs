import { ConversationItem, PatientPersona, SimulationConfig, SimulationResult } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface for the Cancer Chat client
 */
interface CancerChatClient {
  startConversation(): Promise<string>;
  getInitialGreeting(conversationId: string): Promise<string>;
  sendMessage(conversationId: string, message: string): Promise<string>;
  generateAssessment(conversationId: string): Promise<any>;
}

/**
 * Emotional moment in a conversation
 */
interface EmotionalMoment {
  text: string;
  emotion: string;
  intensity: number;
}

/**
 * Simulator for conversations between a patient persona and the cancer chat
 */
export class ConversationSimulator {
  private chatClient: CancerChatClient;
  
  constructor(chatClient?: CancerChatClient) {
    // In a real implementation, this would be injected
    // For now, we'll use a mock if not provided
    this.chatClient = chatClient || this.createMockChatClient();
  }
  
  /**
   * Simulate a conversation between a patient persona and the cancer chat system
   */
  async simulateConversation(
    persona: PatientPersona, 
    config: SimulationConfig
  ): Promise<SimulationResult> {
    // Initialize conversation
    const conversationId = await this.chatClient.startConversation();
    const transcript: ConversationItem[] = [];
    const metrics = this.initializeMetrics();
    
    // Build the Claude persona prompt
    const personaPrompt = this.buildPersonaPrompt(persona, config);
    
    // Get initial greeting from cancer chat
    const greeting = await this.chatClient.getInitialGreeting(conversationId);
    transcript.push({
      role: 'assistant',
      content: greeting,
      timestamp: new Date().toISOString()
    });
    
    // Run conversation loop
    let turnCount = 0;
    let conversationActive = true;
    
    while (conversationActive && turnCount < config.maxTurns) {
      // Get patient response using Claude
      const patientResponseData = await this.getPatientResponse(
        personaPrompt, 
        transcript, 
        config.randomness
      );
      
      const patientResponse = patientResponseData.response;
      metrics.emotionalMoments.push(...patientResponseData.emotionalMoments);
      
      // Add to transcript
      transcript.push({
        role: 'user',
        content: patientResponse,
        timestamp: new Date().toISOString()
      });
      
      // Simulate thinking time
      const delay = this.calculateResponseDelay(persona, patientResponse);
      metrics.responseDelays.push(delay);
      await this.delay(delay);
      
      // Send to cancer chat
      const assistantResponse = await this.chatClient.sendMessage(
        conversationId, 
        patientResponse
      );
      
      // Add to transcript
      transcript.push({
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toISOString()
      });
      
      // Update metrics
      this.updateMetrics(metrics, patientResponse, assistantResponse);
      
      // Check if conversation should end
      conversationActive = !this.shouldEndConversation(
        transcript, 
        turnCount, 
        config
      );
      
      turnCount++;
    }
    
    // Generate assessment
    const assessment = await this.chatClient.generateAssessment(conversationId);
    
    // Save result
    const result: SimulationResult = {
      conversationId,
      transcript,
      assessmentResult: assessment,
      metrics
    };
    
    // In a real implementation, we would save to a database
    // await ConversationDB.saveConversation(result);
    
    return result;
  }
  
  /**
   * Build the prompt for Claude to simulate a patient persona
   */
  private buildPersonaPrompt(persona: PatientPersona, config: SimulationConfig): string {
    return `
    You are roleplaying as a cancer patient with the following profile:
    
    ${JSON.stringify(persona, null, 2)}
    
    You are having a conversation with an AI assistant that specializes in psychological 
    assessments for cancer patients. Respond as this persona would, based on their 
    psychological profile, communication style, and concerns.
    
    Additional guidelines:
    - Stay in character at all times
    - Express emotions naturally based on the persona's profile
    - Don't explicitly state your psychological metrics, but let them show through your responses
    - Answer questions honestly as the persona would
    - If asked about symptoms or feelings, respond according to the persona's profile
    - Your responses should reflect the persona's communication style (articulation level, openness, etc.)
    
    The conversation will continue for multiple turns. For each turn, I'll show you the 
    conversation history and you should respond as the patient.
    `;
  }
  
  /**
   * Simulate getting a patient response from Claude
   * In a real implementation, this would call the Claude API
   */
  private async getPatientResponse(
    personaPrompt: string, 
    transcript: ConversationItem[],
    randomness: number
  ): Promise<{response: string, emotionalMoments: EmotionalMoment[]}> {
    // This is a mock for development; would be replaced with actual Claude API call
    
    // Prepare a simplified version of the transcript for logging
    const lastAssistantMessage = transcript[transcript.length - 1];
    
    // For demo purposes, generate some simple responses based on the last message
    let response = "I'm not sure what to say about that.";
    const emotionalMoments: EmotionalMoment[] = [];
    
    // Very simple response generation logic for demonstration
    if (lastAssistantMessage.content.includes("how are you feeling")) {
      response = "I've been feeling pretty tired lately. The treatments take a lot out of me, and I'm not sleeping well.";
      emotionalMoments.push({
        text: "I've been feeling pretty tired lately",
        emotion: "fatigue",
        intensity: 7
      });
    } else if (lastAssistantMessage.content.includes("anxiety")) {
      response = "Yes, I do feel anxious a lot, especially at night. I worry about my family and how they're coping with all this.";
      emotionalMoments.push({
        text: "I do feel anxious a lot, especially at night",
        emotion: "anxiety",
        intensity: 8
      });
      emotionalMoments.push({
        text: "I worry about my family and how they're coping with all this",
        emotion: "concern",
        intensity: 6
      });
    } else if (lastAssistantMessage.content.includes("support")) {
      response = "My spouse has been amazing through all of this. I don't know what I'd do without them. But sometimes I feel like I'm becoming a burden.";
      emotionalMoments.push({
        text: "I don't know what I'd do without them",
        emotion: "gratitude",
        intensity: 7
      });
      emotionalMoments.push({
        text: "sometimes I feel like I'm becoming a burden",
        emotion: "guilt",
        intensity: 6
      });
    } else if (lastAssistantMessage.content.includes("treatment")) {
      response = "The treatments are tough. The side effects are worse than I expected. Some days I wonder if it's all worth it, but I keep going for my family.";
      emotionalMoments.push({
        text: "The treatments are tough. The side effects are worse than I expected",
        emotion: "distress",
        intensity: 7
      });
      emotionalMoments.push({
        text: "Some days I wonder if it's all worth it",
        emotion: "hopelessness",
        intensity: 5
      });
      emotionalMoments.push({
        text: "but I keep going for my family",
        emotion: "determination",
        intensity: 6
      });
    } else {
      // Default responses for other situations
      const defaultResponses = [
        "I'm taking it one day at a time. Some days are better than others.",
        "It's hard to explain how I feel sometimes. There are just so many emotions.",
        "I try to stay positive, but it's not always easy. You know?",
        "My doctor says the treatment is going as expected, but it's hard to tell from my side.",
        "I'm trying to maintain my normal routine as much as possible, but it's challenging."
      ];
      
      response = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      emotionalMoments.push({
        text: response,
        emotion: "mixed",
        intensity: 5
      });
    }
    
    return { 
      response,
      emotionalMoments 
    };
  }
  
  /**
   * Initialize metrics for a new conversation
   */
  private initializeMetrics(): SimulationResult['metrics'] {
    return {
      conversationLength: 0,
      responseDelays: [],
      topicChanges: 0,
      questionsAsked: 0,
      questionsAnswered: 0,
      emotionalMoments: []
    };
  }
  
  /**
   * Calculate a realistic response delay based on persona and message
   */
  private calculateResponseDelay(persona: PatientPersona, message: string): number {
    // Base delay influenced by message length and complexity
    const baseDelay = 1000 + (message.length / 10);
    
    // Persona factors that influence response time
    const personalityFactor = (11 - persona.communication.articulationLevel) * 200;
    
    // Randomness factor (simulates natural variation)
    const randomFactor = Math.random() * 1000;
    
    // Combined delay (in milliseconds)
    return Math.floor(baseDelay + personalityFactor + randomFactor);
  }
  
  /**
   * Simulate a delay (sleeping) for the specified milliseconds
   */
  private async delay(ms: number): Promise<void> {
    // In a real implementation, this would use something like:
    // return new Promise(resolve => setTimeout(resolve, ms));
    
    // For this mock, we'll just return immediately
    return Promise.resolve();
  }
  
  /**
   * Update metrics based on the latest exchange
   */
  private updateMetrics(
    metrics: SimulationResult['metrics'],
    patientMessage: string,
    assistantMessage: string
  ): void {
    // Update conversation length
    metrics.conversationLength += 1;
    
    // Count questions asked by assistant
    const assistantQuestions = (assistantMessage.match(/\?/g) || []).length;
    metrics.questionsAsked += assistantQuestions;
    
    // Count questions answered by patient
    if (assistantQuestions > 0 && patientMessage.length > 20) {
      // Simple heuristic: assume patient answered if their response is substantial
      metrics.questionsAnswered += 1;
    }
    
    // Detect topic changes (very simple heuristic)
    // A more sophisticated implementation would use semantic analysis
    const topics = [
      'symptom', 'pain', 'treatment', 'family', 'work', 
      'emotion', 'anxiety', 'depression', 'sleep', 'appetite'
    ];
    
    let previousTopics = new Set<string>();
    let currentTopics = new Set<string>();
    
    // Check for topics in the assistant's message
    topics.forEach(topic => {
      if (assistantMessage.toLowerCase().includes(topic)) {
        previousTopics.add(topic);
      }
    });
    
    // Check for topics in the patient's response
    topics.forEach(topic => {
      if (patientMessage.toLowerCase().includes(topic)) {
        currentTopics.add(topic);
      }
    });
    
    // If patient introduced topics not mentioned by assistant, count as a topic change
    let newTopicsIntroduced = false;
    currentTopics.forEach(topic => {
      if (!previousTopics.has(topic)) {
        newTopicsIntroduced = true;
      }
    });
    
    if (newTopicsIntroduced) {
      metrics.topicChanges += 1;
    }
  }
  
  /**
   * Determine if the conversation should end
   */
  private shouldEndConversation(
    transcript: ConversationItem[],
    turnCount: number,
    config: SimulationConfig
  ): boolean {
    // End if we've reached the maximum turns
    if (turnCount >= config.maxTurns - 1) {
      return true;
    }
    
    // Check for explicit end signals in the last assistant message
    const lastMessage = transcript[transcript.length - 1];
    if (lastMessage.role === 'assistant') {
      const content = lastMessage.content.toLowerCase();
      
      // Check for phrases indicating the assistant is ending the conversation
      const endPhrases = [
        'thank you for your time',
        'thank you for speaking with me today',
        'session is complete',
        'assessment is complete',
        'would you like to end our session',
        'end session'
      ];
      
      for (const phrase of endPhrases) {
        if (content.includes(phrase)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Create a mock Cancer Chat client for development
   */
  private createMockChatClient(): CancerChatClient {
    return {
      startConversation: async () => {
        return uuidv4(); // Generate a random conversation ID
      },
      
      getInitialGreeting: async (conversationId: string) => {
        return "Hello, I'm Eve, an AI assistant focused on cancer patient wellbeing. I'm here to conduct a brief wellbeing assessment with you today. How are you feeling today?";
      },
      
      sendMessage: async (conversationId: string, message: string) => {
        // Simple response generation based on patient's message
        if (message.toLowerCase().includes("tired") || message.toLowerCase().includes("fatigue")) {
          return "I understand that fatigue can be challenging. How has your energy level been affecting your daily activities?";
        } else if (message.toLowerCase().includes("anxiety") || message.toLowerCase().includes("worry")) {
          return "Thank you for sharing that. Can you tell me more about what aspects of your cancer experience are causing you the most anxiety?";
        } else if (message.toLowerCase().includes("family") || message.toLowerCase().includes("spouse")) {
          return "Your family sounds important to you. How would you describe your current support network, both from family and others?";
        } else if (message.toLowerCase().includes("treatment") || message.toLowerCase().includes("side effect")) {
          return "Treatment side effects can be difficult to cope with. How confident do you feel in managing these symptoms?";
        } else {
          // Default responses
          const defaultResponses = [
            "Thank you for sharing that. How would you rate your anxiety level on a scale from 1 to 10, with 10 being the highest?",
            "I appreciate you telling me about your experience. How have you been coping with difficult emotions during your cancer journey?",
            "That's helpful information. Have you noticed any changes in your sleep patterns or appetite recently?",
            "I understand. Who do you usually turn to when you need support or someone to talk to?",
            "Thank you for sharing. How well do you feel you're managing the day-to-day challenges related to your cancer?"
          ];
          
          return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
        }
      },
      
      generateAssessment: async (conversationId: string) => {
        // Return a mocked assessment result
        return {
          "metrics": {
            "anxiety": {"score": 7, "confidence": 0.8, "justification": "Patient expressed significant worry multiple times"},
            "depression": {"score": 5, "confidence": 0.7, "justification": "Patient showed some signs of low mood but maintains hope"},
            "distress": {"score": 6, "confidence": 0.8, "justification": "Patient described moderate distress related to treatment"},
            "efficacy": {"score": 4, "confidence": 0.6, "justification": "Patient expressed some doubts about managing symptoms"},
            "support": {"score": 7, "confidence": 0.9, "justification": "Patient has strong support from spouse but feels like a burden"},
            "collaboration": {"score": 8, "confidence": 0.8, "justification": "Patient engaged well with assessment questions"},
            "alliance": {"score": 7, "confidence": 0.7, "justification": "Patient was fairly open during the conversation"},
            "risk": {"score": 3, "confidence": 0.6, "justification": "No indication of high risk factors"}
          },
          "communication": {
            "sentiment": "Mixed, with predominant anxiety and fatigue",
            "patterns": ["Answers questions directly", "Expresses worry about being a burden", "Focuses on physical symptoms"],
            "copingMechanisms": ["Family support", "Taking one day at a time", "Maintaining routine when possible"],
            "temporalPatterns": ["More positive in the beginning of conversation", "More fatigue expressed as conversation continued"],
            "engagementChanges": "Maintained consistent engagement throughout"
          },
          "supportResources": [
            {"resource": "Spouse", "type": "personal", "strength": 9},
            {"resource": "Family", "type": "personal", "strength": 7},
            {"resource": "Medical team", "type": "professional", "strength": 6}
          ],
          "supportGaps": ["Peer support from other cancer patients", "Mental health professional"],
          "riskFactors": ["Treatment side effect burden", "Self-perception as burden to others", "Sleep difficulties"],
          "recommendations": {
            "patient": [
              "Consider joining a cancer support group",
              "Discuss sleep issues with healthcare provider",
              "Practice daily self-care activities"
            ],
            "clinician": [
              "Evaluate for anxiety disorder",
              "Assess sleep quality and potential interventions",
              "Discuss palliative care options for symptom management"
            ]
          },
          "summaries": {
            "clinical": "Patient presents with moderate anxiety and distress centered around treatment side effects and burden on family. Good family support but lacking peer support. Sleep disturbances reported. Recommend anxiety evaluation and sleep intervention.",
            "patient": "You're showing great resilience during this challenging time. While you have wonderful support from your family, connecting with others who understand your cancer experience might help with the anxiety you're feeling. Taking care of your sleep and finding moments for self-care could help improve your energy levels."
          }
        };
      }
    };
  }
} 