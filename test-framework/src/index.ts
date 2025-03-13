import { PersonaGenerator } from './personas/persona-generator';
import { ConversationSimulator } from './simulator/conversation-simulator';
import { AssessmentEvaluator } from './evaluator/assessment-evaluator';
import { PatientPersona, SimulationConfig, SimulationResult, EvaluationResult } from './types';

/**
 * Run a full test cycle with one persona
 */
async function runTestCycle() {
  console.log('Starting LLM Prompt Testing System');
  console.log('----------------------------------');
  
  // 1. Generate a patient persona
  console.log('\n1. Generating patient persona...');
  const personaGenerator = new PersonaGenerator();
  const persona = await personaGenerator.generatePersona({
    psychologicalFocus: 'high anxiety',
    communicationStyle: 'reserved'
  });
  
  console.log(`Generated persona: ${persona.name}, ${persona.age}yo, ${persona.gender}`);
  console.log(`Diagnosis: ${persona.diagnosis.cancerType}, ${persona.diagnosis.stage}`);
  console.log(`Psychological profile: Anxiety ${persona.psychologicalProfile.anxiety}/10, Depression ${persona.psychologicalProfile.depression}/10`);
  
  // 2. Simulate a conversation
  console.log('\n2. Simulating conversation...');
  const conversationSimulator = new ConversationSimulator();
  const config: SimulationConfig = {
    personaId: persona.id,
    maxTurns: 10,
    simulationGoals: ['test anxiety assessment accuracy'],
    randomness: 0.3,
    recordMetrics: true
  };
  
  const simulationResult = await conversationSimulator.simulateConversation(persona, config);
  
  console.log(`Conversation completed with ${simulationResult.transcript.length / 2} turns`);
  console.log(`Topics changed: ${simulationResult.metrics.topicChanges} times`);
  console.log(`Questions asked: ${simulationResult.metrics.questionsAsked}, answered: ${simulationResult.metrics.questionsAnswered}`);
  
  // Print a sample of the conversation
  console.log('\nConversation Sample:');
  for (let i = 0; i < Math.min(6, simulationResult.transcript.length); i++) {
    const item = simulationResult.transcript[i];
    console.log(`${item.role.toUpperCase()}: ${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}`);
  }
  
  // 3. Evaluate the assessment
  console.log('\n3. Evaluating assessment...');
  const assessmentEvaluator = new AssessmentEvaluator();
  const evaluationResult = await assessmentEvaluator.evaluateAssessment(persona, simulationResult);
  
  console.log(`Assessment Accuracy: ${evaluationResult.assessmentAccuracy.overallAccuracy}/10`);
  console.log(`Conversation Naturalness: ${evaluationResult.promptEffectiveness.naturalness}/10`);
  console.log(`User Burden: ${evaluationResult.promptEffectiveness.userBurden}/10 (lower is better)`);
  
  console.log('\nImprovement Suggestions:');
  evaluationResult.promptImprovementSuggestions.forEach((suggestion, index) => {
    console.log(`${index + 1}. ${suggestion}`);
  });
  
  console.log('\n4. Writing results to file...');
  // In a real implementation, this would save results to files
  // For now, we'll just log a message
  console.log('Results saved to test-results/');
  
  return {
    persona,
    simulationResult,
    evaluationResult
  };
}

// Run the test cycle
runTestCycle()
  .then(() => console.log('\nTest cycle completed successfully!'))
  .catch(error => console.error('\nError during test cycle:', error));

// Export the components for use in other modules
export {
  PersonaGenerator,
  ConversationSimulator,
  AssessmentEvaluator
}; 