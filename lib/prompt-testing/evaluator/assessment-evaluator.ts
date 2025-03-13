import { PatientPersona, ConversationItem, EvaluationResult, MetricScore, SimulationResult } from '../types';
import { anthropicClient } from '../../utils/anthropic-client'; // Updated path to match main app structure

/**
 * Evaluator for assessing the quality of AI-patient conversations and assessments
 */
export class AssessmentEvaluator {
  private basePrompt = `
  You are an expert in psycho-oncology and mental health assessment evaluation.
  Your task is to evaluate the accuracy and quality of an AI assistant's assessment 
  of a cancer patient's psychological state based on a conversation transcript.
  
  You will be provided with:
  1. The patient's actual profile (ground truth)
  2. A conversation transcript between the patient and an AI assistant
  3. The AI assistant's assessment of the patient
  
  Please evaluate the assessment on the following criteria:
  
  1. Assessment Accuracy (1-10 scale):
     - How accurately did the AI identify the patient's psychological state?
     - Did it correctly recognize anxiety, depression, and distress levels?
     - Did it correctly identify coping mechanisms and support needs?
  
  2. Conversation Naturalness (1-10 scale):
     - How natural and empathetic was the conversation?
     - Did the AI respond appropriately to emotional cues?
     - Was the conversation flow smooth and coherent?
  
  3. User Burden (1-10 scale, lower is better):
     - How much effort did the patient need to expend to communicate their state?
     - Did the AI ask appropriate questions or require excessive explanation?
     - Was the conversation efficient in gathering relevant information?
  
  4. Improvement Suggestions:
     - Provide 3-5 specific suggestions for improving the AI's assessment capabilities
     - Identify any missed opportunities or misinterpretations
     - Suggest prompt refinements that could lead to better assessments
  
  Format your evaluation as a structured report with numerical scores and detailed explanations.
  `;
  
  private useMockResponses: boolean;
  
  constructor(useMockResponses: boolean = false) {
    this.useMockResponses = useMockResponses;
  }
  
  /**
   * Evaluate a simulation result
   */
  async evaluateSimulation(simulationResult: SimulationResult): Promise<EvaluationResult> {
    if (this.useMockResponses) {
      return this.simulateEvaluation(simulationResult);
    }
    
    // Format the conversation for the prompt
    const conversationText = simulationResult.conversation
      .map(item => `${item.role === 'assistant' ? 'AI Assistant' : 'Patient'}: ${item.content}`)
      .join('\n\n');
    
    // Build the prompt
    const prompt = `
    ${this.basePrompt}
    
    PATIENT PROFILE (GROUND TRUTH):
    ${JSON.stringify(simulationResult.persona, null, 2)}
    
    CONVERSATION TRANSCRIPT:
    ${conversationText}
    
    AI ASSESSMENT:
    ${simulationResult.assessment}
    
    Please provide your evaluation:
    `;
    
    try {
      // Call Claude API
      const response = await anthropicClient.messages.create({
        model: process.env.CLAUDE_MODEL || 'claude-3-opus-20240229',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          { role: 'user', content: prompt }
        ]
      });
      
      const evaluationText = response.content[0].text;
      
      // Parse the evaluation text to extract scores and suggestions
      return this.parseEvaluationResponse(evaluationText, simulationResult);
    } catch (error) {
      console.error('Error evaluating simulation:', error);
      
      // Return a default evaluation in case of error
      return {
        id: simulationResult.id,
        assessmentAccuracy: { score: 5, explanation: "Unable to evaluate due to API error" },
        conversationNaturalness: { score: 5, explanation: "Unable to evaluate due to API error" },
        userBurden: { score: 5, explanation: "Unable to evaluate due to API error" },
        improvementSuggestions: ["Unable to generate suggestions due to API error"],
        timestamp: new Date().toISOString()
      };
    }
  }
  
  /**
   * Parse the evaluation response from Claude
   */
  private parseEvaluationResponse(
    evaluationText: string, 
    simulationResult: SimulationResult
  ): EvaluationResult {
    // Extract scores using regex
    const accuracyMatch = evaluationText.match(/Assessment Accuracy.*?(\d+)/s);
    const naturalnessMatch = evaluationText.match(/Conversation Naturalness.*?(\d+)/s);
    const burdenMatch = evaluationText.match(/User Burden.*?(\d+)/s);
    
    // Extract improvement suggestions
    const suggestionsMatch = evaluationText.match(/Improvement Suggestions:[\s\S]*?((?:\d+\..*\n)+)/);
    
    // Extract explanations
    const accuracyExplanationMatch = evaluationText.match(/Assessment Accuracy.*?(\d+)[\s\S]*?(?=Conversation Naturalness|$)/s);
    const naturalnessExplanationMatch = evaluationText.match(/Conversation Naturalness.*?(\d+)[\s\S]*?(?=User Burden|$)/s);
    const burdenExplanationMatch = evaluationText.match(/User Burden.*?(\d+)[\s\S]*?(?=Improvement Suggestions|$)/s);
    
    // Parse suggestions into an array
    let suggestions: string[] = [];
    if (suggestionsMatch && suggestionsMatch[1]) {
      suggestions = suggestionsMatch[1]
        .split(/\d+\./)
        .filter(s => s.trim().length > 0)
        .map(s => s.trim());
    }
    
    // If no suggestions were found, try another pattern
    if (suggestions.length === 0) {
      const bulletSuggestions = evaluationText.match(/Improvement Suggestions:[\s\S]*?((?:-.*\n)+)/);
      if (bulletSuggestions && bulletSuggestions[1]) {
        suggestions = bulletSuggestions[1]
          .split('-')
          .filter(s => s.trim().length > 0)
          .map(s => s.trim());
      }
    }
    
    // If still no suggestions, look for a paragraph of suggestions
    if (suggestions.length === 0) {
      const paragraphSuggestions = evaluationText.match(/Improvement Suggestions:([\s\S]*?)(?=\n\n|$)/);
      if (paragraphSuggestions && paragraphSuggestions[1]) {
        suggestions = [paragraphSuggestions[1].trim()];
      }
    }
    
    // Default suggestions if none found
    if (suggestions.length === 0) {
      suggestions = [
        "Improve detection of emotional cues",
        "Ask more open-ended questions",
        "Provide more personalized responses",
        "Better track conversation context",
        "Enhance assessment of psychological state"
      ];
    }
    
    // Create the evaluation result
    return {
      id: simulationResult.id,
      assessmentAccuracy: {
        score: accuracyMatch ? parseInt(accuracyMatch[1]) : 7,
        explanation: accuracyExplanationMatch 
          ? this.cleanExplanation(accuracyExplanationMatch[0]) 
          : "Assessment was generally accurate but could be improved"
      },
      conversationNaturalness: {
        score: naturalnessMatch ? parseInt(naturalnessMatch[1]) : 7,
        explanation: naturalnessExplanationMatch 
          ? this.cleanExplanation(naturalnessExplanationMatch[0]) 
          : "Conversation flowed naturally with some areas for improvement"
      },
      userBurden: {
        score: burdenMatch ? parseInt(burdenMatch[1]) : 4,
        explanation: burdenExplanationMatch 
          ? this.cleanExplanation(burdenExplanationMatch[0]) 
          : "Patient needed to provide moderate effort to communicate their state"
      },
      improvementSuggestions: suggestions,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Clean up explanation text
   */
  private cleanExplanation(text: string): string {
    // Remove the score and heading
    return text
      .replace(/.*?(\d+)/s, '')
      .replace(/Assessment Accuracy|Conversation Naturalness|User Burden/g, '')
      .trim();
  }
  
  /**
   * Simulate an evaluation for testing
   */
  private simulateEvaluation(simulationResult: SimulationResult): EvaluationResult {
    // Generate a simulated evaluation based on the persona and conversation
    const persona = simulationResult.persona;
    
    // Simulate assessment accuracy based on persona complexity
    const assessmentAccuracyScore = Math.min(9, Math.max(6, 
      // Base score
      8 - 
      // Reduce score for complex psychological profiles
      (persona.psychologicalProfile.anxiety > 7 && persona.psychologicalProfile.depression > 7 ? 1 : 0) -
      // Reduce score for reserved communication styles
      (persona.communication.openness < 4 ? 1 : 0)
    ));
    
    // Simulate conversation naturalness
    const conversationNaturalnessScore = 7; // Consistent baseline
    
    // Simulate user burden based on communication style
    const userBurdenScore = Math.min(7, Math.max(3,
      // Base score (lower is better)
      5 -
      // Reduce burden for open communicators
      (persona.communication.openness > 7 ? 1 : 0) +
      // Increase burden for reserved communicators
      (persona.communication.openness < 4 ? 1 : 0) +
      // Increase burden for high anxiety
      (persona.psychologicalProfile.anxiety > 7 ? 1 : 0)
    ));
    
    // Generate improvement suggestions based on persona characteristics
    const improvementSuggestions: string[] = [];
    
    if (persona.psychologicalProfile.anxiety > 7) {
      improvementSuggestions.push("Incorporate more techniques for anxiety management in conversations with highly anxious patients");
    }
    
    if (persona.psychologicalProfile.depression > 7) {
      improvementSuggestions.push("Improve detection and response to depressive language and thought patterns");
    }
    
    if (persona.communication.openness < 5) {
      improvementSuggestions.push("Develop better strategies for engaging reserved patients who may not volunteer information");
    }
    
    if (persona.psychologicalProfile.selfEfficacy < 5) {
      improvementSuggestions.push("Incorporate more empowerment and self-efficacy building in conversations");
    }
    
    // Add general suggestions if we don't have enough specific ones
    if (improvementSuggestions.length < 3) {
      improvementSuggestions.push("Incorporate more open-ended questions to elicit deeper responses");
      improvementSuggestions.push("Reduce direct inquiries about sensitive topics with more gradual approach");
      improvementSuggestions.push("Adapt questioning approach based on detected communication style");
      improvementSuggestions.push("Enhance prompt's ability to identify psychological states from subtle cues");
    }
    
    // Limit to 5 suggestions
    const finalSuggestions = improvementSuggestions.slice(0, 5);
    
    return {
      id: simulationResult.id,
      assessmentAccuracy: {
        score: assessmentAccuracyScore,
        explanation: `The assessment captured many key aspects of the patient's psychological state, but ${
          assessmentAccuracyScore < 8 ? "missed some nuances in their emotional presentation" : "was highly accurate"
        }.`
      },
      conversationNaturalness: {
        score: conversationNaturalnessScore,
        explanation: "The conversation flowed naturally with appropriate responses to emotional cues, though some transitions could be improved."
      },
      userBurden: {
        score: userBurdenScore,
        explanation: `The patient needed to ${
          userBurdenScore > 5 ? "expend significant effort" : "provide only moderate input"
        } to communicate their psychological state.`
      },
      improvementSuggestions: finalSuggestions,
      timestamp: new Date().toISOString()
    };
  }
} 