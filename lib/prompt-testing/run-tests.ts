import { PromptTester, TestCycleConfig } from './index';
import fs from 'fs';
import path from 'path';

// Ensure test results directory exists
const TEST_RESULTS_DIR = './test-results';
if (!fs.existsSync(TEST_RESULTS_DIR)) {
  fs.mkdirSync(TEST_RESULTS_DIR, { recursive: true });
}

// Define test configurations
const testConfigurations: TestCycleConfig[] = [
  {
    // High anxiety, reserved communication style
    personaOptions: {
      psychologicalFocus: 'high anxiety',
      communicationStyle: 'reserved'
    },
    simulationConfig: {
      maxTurns: 10,
      randomness: 0.3
    },
    saveOptions: {
      createSummary: true,
      includeFullConversation: true,
      formatJson: true
    },
    useMockResponses: true // Use mock responses for development
  },
  {
    // Depression, open communication style
    personaOptions: {
      psychologicalFocus: 'moderate depression',
      communicationStyle: 'open'
    },
    simulationConfig: {
      maxTurns: 10,
      randomness: 0.3
    },
    saveOptions: {
      createSummary: true,
      includeFullConversation: true,
      formatJson: true
    },
    useMockResponses: true
  },
  {
    // Low self-efficacy, analytical communication style
    personaOptions: {
      psychologicalFocus: 'low self-efficacy',
      communicationStyle: 'analytical'
    },
    simulationConfig: {
      maxTurns: 10,
      randomness: 0.3
    },
    saveOptions: {
      createSummary: true,
      includeFullConversation: true,
      formatJson: true
    },
    useMockResponses: true
  },
  {
    // Strong support network, emotional communication style
    personaOptions: {
      psychologicalFocus: 'strong support network',
      communicationStyle: 'emotional'
    },
    simulationConfig: {
      maxTurns: 10,
      randomness: 0.3
    },
    saveOptions: {
      createSummary: true,
      includeFullConversation: true,
      formatJson: true
    },
    useMockResponses: true
  }
];

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('Starting test suite...');
  
  const tester = new PromptTester({
    useMockResponses: true,
    resultDirectory: TEST_RESULTS_DIR
  });
  
  const results = await tester.runMultipleTests(testConfigurations);
  
  console.log(`Completed ${results.length} tests.`);
  console.log(`Results saved to: ${TEST_RESULTS_DIR}`);
  
  // Print a summary of the results
  results.forEach((result, index) => {
    const config = testConfigurations[index];
    console.log(`\nTest ${index + 1}: ${config.personaOptions?.psychologicalFocus}, ${config.personaOptions?.communicationStyle}`);
    console.log(`Persona: ${result.persona.name}, ${result.persona.age}, ${result.persona.diagnosis.cancerType}`);
    console.log(`Assessment Accuracy: ${result.evaluationResult.assessmentAccuracy.score}/10`);
    console.log(`Conversation Naturalness: ${result.evaluationResult.conversationNaturalness.score}/10`);
    console.log(`User Burden: ${result.evaluationResult.userBurden.score}/10`);
    console.log('Improvement Suggestions:');
    result.evaluationResult.improvementSuggestions.forEach((suggestion, i) => {
      console.log(`  ${i + 1}. ${suggestion}`);
    });
  });
  
  return results;
}

// Run the tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Error running tests:', error);
    process.exit(1);
  });
}

export { runAllTests, testConfigurations }; 