import { EvaluationResult, PatientPersona, SimulationResult } from '../types';

/**
 * Options for assessment evaluation
 */
export interface EvaluationOptions {
  evaluationDepth: 'basic' | 'detailed';
  focusAreas?: string[];  // Specific areas to focus evaluation on
  customPrompt?: string;  // Custom prompt for the evaluation
}

/**
 * Evaluates the quality and accuracy of assessments generated from simulated conversations
 */
export class AssessmentEvaluator {
  private basePrompt = `
  You are an expert psycho-oncology evaluator analyzing the quality and accuracy of a psychological assessment.
  
  You have two pieces of information:
  1. A cancer patient persona with known psychological characteristics
  2. An assessment generated based on a conversation with this simulated patient
  
  Your task is to evaluate how accurately the assessment captured the patient's psychological state and needs.
  
  Consider the following in your evaluation:
  - How well did the assessment identify the actual psychological profile (anxiety, depression, etc.)?
  - Were there any false positives (issues identified that weren't in the persona)?
  - Were there any false negatives (issues in the persona that weren't detected)?
  - How natural and effective was the conversation?
  - How much burden was placed on the patient during the assessment?
  - How complete was the coverage of important psychological domains?
  
  Please provide specific, actionable feedback that could improve the assessment process.
  
  Format your response as a JSON object with the structure below. Include explanations and justifications for your ratings:
  
  {
    "promptEffectiveness": {
      "naturalness": number (1-10),
      "efficiency": number (1-10),
      "userBurden": number (1-10, lower is better),
      "coverageOfDomains": number (percentage)
    },
    "assessmentAccuracy": {
      "overallAccuracy": number (1-10),
      "domainSpecificAccuracy": {
        "anxiety": number (1-10),
        "depression": number (1-10),
        "distress": number (1-10),
        "selfEfficacy": number (1-10),
        "supportNetworkStrength": number (1-10)
      },
      "falsePositives": ["issue 1", "issue 2"],
      "falseNegatives": ["issue 1", "issue 2"]
    },
    "qualitativeAnalysis": "Detailed analysis text",
    "promptImprovementSuggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
  }
  `;
  
  /**
   * Evaluate the accuracy of an assessment compared to the known persona
   */
  async evaluateAssessment(
    persona: PatientPersona,
    simulationResult: SimulationResult,
    options: EvaluationOptions = { evaluationDepth: 'detailed' }
  ): Promise<EvaluationResult> {
    // In a real implementation, this would call the Claude LLM API
    // For now, we'll simulate it
    
    // Build the evaluation prompt
    const prompt = this.buildEvaluationPrompt(persona, simulationResult, options);
    
    // Get the evaluation from Claude (simulated for now)
    const evaluationJson = await this.simulateClaudeEvaluation(persona, simulationResult);
    
    // Parse the evaluation and add IDs
    const evaluation: EvaluationResult = {
      personaId: persona.id,
      conversationId: simulationResult.conversationId,
      ...evaluationJson
    };
    
    return evaluation;
  }
  
  /**
   * Build the evaluation prompt based on persona, simulation result, and options
   */
  private buildEvaluationPrompt(
    persona: PatientPersona,
    simulationResult: SimulationResult,
    options: EvaluationOptions
  ): string {
    let prompt = options.customPrompt || this.basePrompt;
    
    // Add focus areas if specified
    if (options.focusAreas && options.focusAreas.length > 0) {
      prompt += `\n\nPlease pay special attention to these areas: ${options.focusAreas.join(', ')}`;
    }
    
    // Add depth-specific instructions
    if (options.evaluationDepth === 'detailed') {
      prompt += `\n\nProvide a detailed evaluation with specific examples and quotes from the conversation.`;
    } else {
      prompt += `\n\nProvide a concise evaluation focusing on the key strengths and weaknesses.`;
    }
    
    // Add the patient persona and conversation transcript
    prompt += `\n\nPATIENT PERSONA:\n${JSON.stringify(persona, null, 2)}`;
    
    // Add the transcript
    prompt += `\n\nCONVERSATION TRANSCRIPT:\n`;
    simulationResult.transcript.forEach(item => {
      prompt += `\n${item.role.toUpperCase()}: ${item.content}`;
    });
    
    // Add the assessment result
    prompt += `\n\nASSESSMENT RESULT:\n${JSON.stringify(simulationResult.assessmentResult, null, 2)}`;
    
    return prompt;
  }
  
  /**
   * Simulate Claude API response for development
   * In the real implementation, this would be replaced with actual API calls
   */
  private async simulateClaudeEvaluation(
    persona: PatientPersona,
    simulationResult: SimulationResult
  ): Promise<Omit<EvaluationResult, 'personaId' | 'conversationId'>> {
    // This is a simplified simulation that generates a somewhat realistic evaluation
    // In reality, this would be a call to Claude with the full prompt
    
    // Compare the persona's psychological profile with the assessment metrics
    const assessmentMetrics = simulationResult.assessmentResult.metrics;
    
    // Calculate accuracy by comparing persona to assessment
    const anxietyAccuracy = this.calculateAccuracy(
      persona.psychologicalProfile.anxiety, 
      assessmentMetrics.anxiety.score
    );
    
    const depressionAccuracy = this.calculateAccuracy(
      persona.psychologicalProfile.depression, 
      assessmentMetrics.depression.score
    );
    
    const distressAccuracy = this.calculateAccuracy(
      persona.psychologicalProfile.distress, 
      assessmentMetrics.distress.score
    );
    
    const efficacyAccuracy = this.calculateAccuracy(
      persona.psychologicalProfile.selfEfficacy, 
      assessmentMetrics.efficacy.score
    );
    
    const supportAccuracy = this.calculateAccuracy(
      persona.psychologicalProfile.supportNetworkStrength, 
      assessmentMetrics.support.score
    );
    
    // Overall accuracy is the average of the domain accuracies
    const overallAccuracy = Math.round(
      (anxietyAccuracy + depressionAccuracy + distressAccuracy + efficacyAccuracy + supportAccuracy) / 5
    );
    
    // Generate false positives and negatives based on comparisons
    const falsePositives = [];
    const falseNegatives = [];
    
    // Example logic: if anxiety was significantly overestimated
    if (assessmentMetrics.anxiety.score > persona.psychologicalProfile.anxiety + 3) {
      falsePositives.push("High anxiety level");
    }
    
    // Example logic: if depression was significantly underestimated
    if (assessmentMetrics.depression.score < persona.psychologicalProfile.depression - 3 && 
        persona.psychologicalProfile.depression > 6) {
      falseNegatives.push("Clinical depression symptoms");
    }
    
    // Generate sample evaluation
    return {
      promptEffectiveness: {
        naturalness: 7,  // Sample value
        efficiency: 6,   // Sample value
        userBurden: 4,   // Sample value
        coverageOfDomains: 80  // Sample percentage
      },
      assessmentAccuracy: {
        overallAccuracy,
        domainSpecificAccuracy: {
          anxiety: anxietyAccuracy,
          depression: depressionAccuracy,
          distress: distressAccuracy,
          selfEfficacy: efficacyAccuracy,
          supportNetworkStrength: supportAccuracy
        },
        falsePositives,
        falseNegatives
      },
      qualitativeAnalysis: this.generateQualitativeAnalysis(
        persona, 
        simulationResult, 
        overallAccuracy
      ),
      promptImprovementSuggestions: this.generateImprovementSuggestions(
        persona, 
        simulationResult, 
        overallAccuracy
      )
    };
  }
  
  /**
   * Calculate accuracy on a 1-10 scale based on the difference between actual and assessed values
   */
  private calculateAccuracy(actualValue: number, assessedValue: number): number {
    const difference = Math.abs(actualValue - assessedValue);
    
    // Perfect match = 10, maximum difference (9 points) = 1
    const accuracy = 10 - difference;
    
    // Ensure accuracy is in the 1-10 range
    return Math.max(1, Math.min(10, accuracy));
  }
  
  /**
   * Generate a qualitative analysis of the assessment
   */
  private generateQualitativeAnalysis(
    persona: PatientPersona,
    simulationResult: SimulationResult,
    overallAccuracy: number
  ): string {
    // This is a simplified simulation
    // In a real implementation, this would be generated by Claude based on detailed analysis
    
    if (overallAccuracy >= 8) {
      return `The assessment successfully captured the key psychological characteristics of the patient. The conversation flowed naturally and covered all major domains. The assessment accurately identified the patient's anxiety level (${persona.psychologicalProfile.anxiety}/10) and support network strength (${persona.psychologicalProfile.supportNetworkStrength}/10). The recommendations were well-aligned with the patient's needs based on their profile.`;
    } else if (overallAccuracy >= 5) {
      return `The assessment partially captured the patient's psychological profile but missed some important nuances. While anxiety and depression were reasonably assessed, the patient's self-efficacy was somewhat mischaracterized. The conversation was somewhat efficient but occasionally placed unnecessary burden on the patient when discussing sensitive topics. The recommendations were generally helpful but could be better tailored to the patient's specific needs.`;
    } else {
      return `The assessment significantly mischaracterized the patient's psychological profile. Key aspects like the patient's high distress level and low self-efficacy were not adequately captured. The conversation felt mechanical and placed considerable burden on the patient. Many questions were either too direct or not sufficiently focused on the patient's specific situation. The recommendations do not align well with what would be most beneficial based on the patient's actual profile.`;
    }
  }
  
  /**
   * Generate improvement suggestions based on the evaluation
   */
  private generateImprovementSuggestions(
    persona: PatientPersona,
    simulationResult: SimulationResult,
    overallAccuracy: number
  ): string[] {
    // This is a simplified simulation
    // In a real implementation, this would be generated by Claude based on detailed analysis
    
    const suggestions = [];
    
    // Add some generic suggestions
    suggestions.push("Include more open-ended questions about emotional state before asking for numerical ratings");
    suggestions.push("Reduce the number of direct questions about sensitive topics like mortality");
    
    // Add accuracy-based suggestions
    if (overallAccuracy < 7) {
      suggestions.push("Improve detection of self-efficacy by asking more questions about the patient's confidence in managing specific aspects of their care");
      suggestions.push("Better distinguish between generalized anxiety and specific cancer-related fears");
    }
    
    // Add persona-specific suggestions
    if (persona.communication.openness < 5) {
      suggestions.push("Adapt questioning approach for patients who exhibit reservation in sharing personal information");
    }
    
    if (persona.psychologicalProfile.anxiety > 7) {
      suggestions.push("Enhance the prompt's ability to identify high anxiety without requiring explicit statements from the patient");
    }
    
    return suggestions;
  }
} 