import { PatientPersona, ConversationItem, SimulationConfig, SimulationResult } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { anthropicClient } from '../../utils/anthropic-client'; // Updated path to match main app structure

/**
 * Simulator for cancer patient conversations
 */
export class ConversationSimulator {
  private basePrompt = `
  You are simulating a conversation between a cancer patient and an AI assistant.
  The patient has the following profile:
  
  {{PATIENT_PROFILE}}
  
  Your task is to simulate this patient's side of the conversation with an AI assistant.
  Respond as the patient would, incorporating their psychological profile, communication style, 
  and personal concerns. Be realistic and consistent with the patient's background and behavioral patterns.
  
  The conversation will proceed in turns. For each turn:
  1. I'll show you what the AI assistant says
  2. You respond as the patient would
  
  Remember to:
  - Stay in character as the patient
  - Reflect their communication style (openness, directness, emotional expression)
  - Show their psychological state (anxiety, depression, etc.) through their responses
  - Bring up their personal concerns naturally during the conversation
  - Use behavioral patterns consistent with their profile
  
  Let's begin the conversation:
  `;
  
  private useMockResponses: boolean;
  
  constructor(useMockResponses: boolean = false) {
    this.useMockResponses = useMockResponses;
  }
  
  /**
   * Simulate a conversation with a patient persona
   */
  async simulateConversation(
    persona: PatientPersona, 
    config: SimulationConfig = { maxTurns: 10 }
  ): Promise<SimulationResult> {
    const conversation: ConversationItem[] = [];
    const metrics = {
      totalTurns: 0,
      topicsChanged: 0,
      questionsAsked: 0,
      questionsAnswered: 0,
      emotionalResponses: 0,
      avoidantResponses: 0
    };
    
    // Start with an introduction from the assistant
    const introduction = this.generateIntroduction();
    conversation.push({
      role: 'assistant',
      content: introduction,
      timestamp: new Date().toISOString()
    });
    
    // Simulate the conversation turns
    let currentTurn = 0;
    const maxTurns = config.maxTurns || 10;
    
    while (currentTurn < maxTurns) {
      // Get the last assistant message
      const lastAssistantMessage = conversation.filter(item => item.role === 'assistant').pop();
      
      if (!lastAssistantMessage) break;
      
      // Generate patient response
      const patientResponse = await this.generatePatientResponse(
        persona, 
        conversation,
        config
      );
      
      // Add to conversation
      conversation.push({
        role: 'user',
        content: patientResponse,
        timestamp: new Date().toISOString()
      });
      
      // Update metrics
      metrics.totalTurns += 0.5; // Half a turn (patient's side)
      if (this.containsQuestion(patientResponse)) metrics.questionsAsked++;
      if (this.detectTopicChange(conversation)) metrics.topicsChanged++;
      if (this.detectEmotionalResponse(patientResponse, persona)) metrics.emotionalResponses++;
      if (this.detectAvoidantResponse(patientResponse, persona)) metrics.avoidantResponses++;
      
      // Generate assistant response
      const assistantResponse = await this.generateAssistantResponse(
        persona,
        conversation,
        config
      );
      
      // Add to conversation
      conversation.push({
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date().toISOString()
      });
      
      // Update metrics
      metrics.totalTurns += 0.5; // Half a turn (assistant's side)
      if (this.containsQuestion(assistantResponse)) metrics.questionsAsked++;
      if (this.detectAnswerToQuestion(patientResponse, assistantResponse)) metrics.questionsAnswered++;
      
      currentTurn++;
    }
    
    // Generate an assessment based on the conversation
    const assessment = await this.generateAssessment(persona, conversation);
    
    return {
      id: uuidv4(),
      persona: persona,
      conversation: conversation,
      assessment: assessment,
      metrics: metrics,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Generate the initial introduction from the assistant
   */
  private generateIntroduction(): string {
    return "Hello, I'm here to support you through your cancer journey. How are you feeling today, and is there anything specific you'd like to talk about?";
  }
  
  /**
   * Generate a response from the patient based on their persona
   */
  private async generatePatientResponse(
    persona: PatientPersona,
    conversation: ConversationItem[],
    config: SimulationConfig
  ): Promise<string> {
    if (this.useMockResponses) {
      return this.simulatePatientResponse(persona, conversation);
    }
    
    // Format the conversation history
    const conversationHistory = conversation
      .map(item => `${item.role === 'assistant' ? 'AI Assistant' : 'Patient'}: ${item.content}`)
      .join('\n\n');
    
    // Build the prompt
    const patientProfileJson = JSON.stringify(persona, null, 2);
    let prompt = this.basePrompt.replace('{{PATIENT_PROFILE}}', patientProfileJson);
    prompt += `\n\nConversation so far:\n${conversationHistory}\n\nPatient:`;
    
    // Call Claude API
    try {
      const response = await anthropicClient.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-3-opus-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      
      return response.content[0].text.trim();
    } catch (error) {
      console.error('Error generating patient response:', error);
      return "I'm sorry, I'm not feeling well enough to talk right now.";
    }
  }
  
  /**
   * Generate a response from the assistant based on the conversation
   */
  private async generateAssistantResponse(
    persona: PatientPersona,
    conversation: ConversationItem[],
    config: SimulationConfig
  ): Promise<string> {
    if (this.useMockResponses) {
      return this.simulateAssistantResponse(persona, conversation);
    }
    
    // In a real implementation, this would call the actual cancer chat assistant
    // For now, we'll use a simplified approach with Claude
    
    // Format the conversation history
    const conversationHistory = conversation
      .map(item => `${item.role === 'assistant' ? 'AI Assistant' : 'Patient'}: ${item.content}`)
      .join('\n\n');
    
    // Build the prompt
    const prompt = `
    You are an AI assistant specialized in supporting cancer patients. 
    You're having a conversation with a patient who has the following profile:
    
    ${JSON.stringify(persona, null, 2)}
    
    Here's the conversation so far:
    ${conversationHistory}
    
    Provide a compassionate, helpful response as the AI Assistant. Be empathetic and supportive.
    Focus on addressing the patient's concerns while being sensitive to their psychological state.
    
    AI Assistant:
    `;
    
    // Call Claude API
    try {
      const response = await anthropicClient.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-3-opus-20240229',
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      
      return response.content[0].text.trim();
    } catch (error) {
      console.error('Error generating assistant response:', error);
      return "I understand. Is there anything specific about your treatment or symptoms you'd like to discuss?";
    }
  }
  
  /**
   * Generate an assessment of the patient based on the conversation
   */
  private async generateAssessment(
    persona: PatientPersona,
    conversation: ConversationItem[]
  ): Promise<string> {
    if (this.useMockResponses) {
      return this.simulateAssessment(persona, conversation);
    }
    
    // Format the conversation history
    const conversationHistory = conversation
      .map(item => `${item.role === 'assistant' ? 'AI Assistant' : 'Patient'}: ${item.content}`)
      .join('\n\n');
    
    // Build the prompt
    const prompt = `
    You are a mental health professional specializing in psycho-oncology.
    Review the following conversation between a cancer patient and an AI assistant.
    
    Patient profile:
    ${JSON.stringify(persona, null, 2)}
    
    Conversation transcript:
    ${conversationHistory}
    
    Based on this conversation, provide a professional assessment of the patient's:
    1. Psychological state (anxiety, depression, distress levels)
    2. Coping mechanisms
    3. Support needs
    4. Potential intervention recommendations
    
    Format your assessment as a clinical note that could be shared with a healthcare team.
    `;
    
    // Call Claude API
    try {
      const response = await anthropicClient.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-3-opus-20240229',
        max_tokens: 1500,
        temperature: 0.3,
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      
      return response.content[0].text.trim();
    } catch (error) {
      console.error('Error generating assessment:', error);
      return "Unable to generate assessment due to technical issues.";
    }
  }
  
  /**
   * Detect if a message contains a question
   */
  private containsQuestion(message: string): boolean {
    return message.includes('?') || 
           /\b(what|how|why|when|where|who|can you|could you)\b/i.test(message);
  }
  
  /**
   * Detect if there was a topic change in the conversation
   */
  private detectTopicChange(conversation: ConversationItem[]): boolean {
    if (conversation.length < 3) return false;
    
    const lastMessages = conversation.slice(-3);
    // This is a simplified implementation - in a real system, you would use
    // more sophisticated NLP techniques to detect topic changes
    
    // For now, just check if the last message introduces new keywords
    const previousKeywords = this.extractKeywords(lastMessages[0].content);
    const currentKeywords = this.extractKeywords(lastMessages[2].content);
    
    // Check if there are new keywords not present in previous message
    return currentKeywords.some(keyword => !previousKeywords.includes(keyword));
  }
  
  /**
   * Extract keywords from a message (simplified implementation)
   */
  private extractKeywords(message: string): string[] {
    // This is a very simplified keyword extraction
    // In a real implementation, you would use NLP techniques
    const stopWords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 
                      'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 
                      'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 
                      'itself', 'they', 'them', 'their', 'theirs', 'themselves', 
                      'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 
                      'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 
                      'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 
                      'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 
                      'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 
                      'into', 'through', 'during', 'before', 'after', 'above', 'below', 
                      'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 
                      'under', 'again', 'further', 'then', 'once', 'here', 'there', 
                      'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 
                      'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 
                      'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 
                      's', 't', 'can', 'will', 'just', 'don', 'should', 'now'];
    
    return message.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
  }
  
  /**
   * Detect if a response is emotional based on the persona
   */
  private detectEmotionalResponse(message: string, persona: PatientPersona): boolean {
    // Check if the message contains emotional language
    const emotionalWords = [
      'afraid', 'angry', 'anxious', 'sad', 'worried', 'scared', 'upset',
      'happy', 'excited', 'hopeful', 'grateful', 'thankful', 'relieved',
      'frustrated', 'overwhelmed', 'exhausted', 'tired', 'confused',
      'love', 'hate', 'fear', 'hope', 'despair', 'joy', 'sorrow'
    ];
    
    const emotionalPunctuation = message.includes('!') || message.includes('...');
    const containsEmotionalWords = emotionalWords.some(word => 
      message.toLowerCase().includes(word)
    );
    
    // Consider the persona's emotional expression level
    const isEmotionalPerson = persona.communication.emotionalExpression > 6;
    
    return (emotionalPunctuation || containsEmotionalWords) && isEmotionalPerson;
  }
  
  /**
   * Detect if a response is avoidant based on the persona
   */
  private detectAvoidantResponse(message: string, persona: PatientPersona): boolean {
    // Check for avoidant language patterns
    const avoidantPhrases = [
      'i don\'t know', 'not sure', 'maybe later', 'let\'s talk about something else',
      'i\'d rather not', 'it\'s fine', 'don\'t worry about it', 'it\'s nothing',
      'i\'m okay', 'i\'m fine', 'never mind', 'forget it', 'it doesn\'t matter'
    ];
    
    const containsAvoidantPhrases = avoidantPhrases.some(phrase => 
      message.toLowerCase().includes(phrase)
    );
    
    // Consider the persona's openness level
    const isAvoidantPerson = persona.communication.openness < 5;
    
    return containsAvoidantPhrases && isAvoidantPerson;
  }
  
  /**
   * Detect if a response answers a question
   */
  private detectAnswerToQuestion(question: string, answer: string): boolean {
    // This is a simplified implementation
    // In a real system, you would use more sophisticated NLP techniques
    
    // Check if the previous message had a question
    if (!this.containsQuestion(question)) return false;
    
    // Extract question keywords
    const questionKeywords = this.extractKeywords(question);
    
    // Check if the answer contains any of the question keywords
    return questionKeywords.some(keyword => 
      answer.toLowerCase().includes(keyword)
    );
  }
  
  /**
   * Simulate a patient response for testing
   */
  private simulatePatientResponse(
    persona: PatientPersona, 
    conversation: ConversationItem[]
  ): string {
    // Get the last assistant message
    const lastAssistantMessage = conversation.filter(item => item.role === 'assistant').pop();
    
    if (!lastAssistantMessage) {
      return "I'm not feeling great today. The treatment has been tough.";
    }
    
    // Simple response templates based on persona characteristics
    const highAnxietyResponses = [
      "I'm really worried about my next scan. What if the cancer has spread?",
      "I can't sleep at night thinking about what might happen to my family if things get worse.",
      "The side effects are making me anxious. Is this normal or should I be concerned?",
      "I keep thinking about the worst-case scenarios. It's hard to stay positive."
    ];
    
    const depressionResponses = [
      "I don't see the point in all these treatments sometimes. It feels hopeless.",
      "I used to enjoy spending time with my family, but now I just feel like a burden to them.",
      "Everything feels so overwhelming. I don't have the energy I used to have.",
      "Some days I just can't find the motivation to keep fighting."
    ];
    
    const reservedResponses = [
      "I'm doing okay, I suppose. Just taking it day by day.",
      "The treatment is going as expected. Nothing new to report.",
      "I prefer not to discuss the details. It's just something I have to get through.",
      "It's difficult, but I'm managing. Let's not dwell on it."
    ];
    
    const openResponses = [
      "I've been having a really tough time with the nausea from chemo. It's affecting my ability to enjoy meals with my family.",
      "The support group you recommended has been helpful. I've connected with others who understand what I'm going through.",
      "I had a good conversation with my oncologist yesterday. She adjusted my medication and I'm feeling more hopeful.",
      "I've been journaling about my experience, and it's helping me process my emotions about the diagnosis."
    ];
    
    // Select response based on persona characteristics
    let responsePool: string[] = [];
    
    if (persona.psychologicalProfile.anxiety > 7) {
      responsePool = responsePool.concat(highAnxietyResponses);
    }
    
    if (persona.psychologicalProfile.depression > 7) {
      responsePool = responsePool.concat(depressionResponses);
    }
    
    if (persona.communication.openness < 4) {
      responsePool = responsePool.concat(reservedResponses);
    } else if (persona.communication.openness > 7) {
      responsePool = responsePool.concat(openResponses);
    }
    
    // If no specific responses match, use general responses
    if (responsePool.length === 0) {
      responsePool = [
        "I'm having good days and bad days. Today is somewhere in the middle.",
        "The treatment is challenging, but I'm trying to stay positive.",
        "My family has been supportive, which helps a lot.",
        "I'm concerned about how long this will all take, but I'm committed to the process."
      ];
    }
    
    // Select a random response from the pool
    return responsePool[Math.floor(Math.random() * responsePool.length)];
  }
  
  /**
   * Simulate an assistant response for testing
   */
  private simulateAssistantResponse(
    persona: PatientPersona,
    conversation: ConversationItem[]
  ): string {
    // Get the last patient message
    const lastPatientMessage = conversation.filter(item => item.role === 'user').pop();
    
    if (!lastPatientMessage) {
      return "How are you feeling today?";
    }
    
    // Simple response templates
    const generalResponses = [
      "I understand that must be difficult. How have you been coping with those feelings?",
      "Thank you for sharing that with me. Have you discussed these concerns with your healthcare team?",
      "That's completely understandable given what you're going through. What helps you feel better when you're feeling this way?",
      "I'm here to support you through this. Would it help to talk more about your treatment plan or would you prefer to discuss something else?",
      "Many people in your situation experience similar feelings. What kind of support would be most helpful for you right now?"
    ];
    
    // Select a random response
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  }
  
  /**
   * Simulate an assessment for testing
   */
  private simulateAssessment(
    persona: PatientPersona,
    conversation: ConversationItem[]
  ): string {
    // Create a simulated assessment based on the persona
    return `
    Clinical Assessment Note
    
    Patient: ${persona.name}, ${persona.age}
    Diagnosis: ${persona.diagnosis.cancerType}, ${persona.diagnosis.stage}
    
    Psychological State:
    The patient presents with ${persona.psychologicalProfile.anxiety > 7 ? 'high' : 
      persona.psychologicalProfile.anxiety > 4 ? 'moderate' : 'low'} anxiety and 
    ${persona.psychologicalProfile.depression > 7 ? 'significant' : 
      persona.psychologicalProfile.depression > 4 ? 'moderate' : 'minimal'} depressive symptoms.
    Overall distress level appears ${persona.psychologicalProfile.distress > 7 ? 'severe' : 
      persona.psychologicalProfile.distress > 4 ? 'moderate' : 'mild'}.
    
    Coping Mechanisms:
    Patient demonstrates ${persona.psychologicalProfile.selfEfficacy > 7 ? 'strong' : 
      persona.psychologicalProfile.selfEfficacy > 4 ? 'adequate' : 'limited'} self-efficacy.
    ${persona.communication.openness > 7 ? 'Openly discusses' : 
      persona.communication.openness > 4 ? 'Sometimes shares' : 'Tends to avoid discussing'} concerns and emotions.
    
    Support Needs:
    Support network appears ${persona.psychologicalProfile.supportNetworkStrength > 7 ? 'strong' : 
      persona.psychologicalProfile.supportNetworkStrength > 4 ? 'adequate' : 'limited'}.
    Would benefit from additional support in: 
    ${persona.psychologicalProfile.anxiety > 7 ? 'anxiety management, ' : ''}
    ${persona.psychologicalProfile.depression > 7 ? 'depression management, ' : ''}
    ${persona.psychologicalProfile.selfEfficacy < 5 ? 'building self-efficacy, ' : ''}
    ${persona.psychologicalProfile.supportNetworkStrength < 5 ? 'expanding support network' : ''}
    
    Recommendations:
    1. ${persona.psychologicalProfile.anxiety > 7 ? 'Anxiety management techniques and possible referral to psycho-oncology.' : 
        'Continue monitoring anxiety levels.'}
    2. ${persona.psychologicalProfile.depression > 7 ? 'Depression screening and possible intervention.' : 
        'Regular check-ins regarding mood and emotional state.'}
    3. ${persona.psychologicalProfile.supportNetworkStrength < 5 ? 'Connect with cancer support groups.' : 
        'Encourage continued engagement with existing support network.'}
    4. ${persona.communication.openness < 5 ? 'Gentle encouragement to express concerns and emotions.' : 
        'Maintain open communication channels.'}
    
    Follow-up recommended in 2 weeks to reassess psychological state and coping strategies.
    `;
  }
} 