# LLM Prompt Testing Framework

This framework provides tools for testing and refining LLM prompts for cancer patient interactions. It allows you to generate realistic patient personas, simulate conversations, evaluate the quality of assessments, and refine prompts based on the results.

## Features

- **Patient Persona Generation**: Create diverse, realistic patient personas with different cancer types, psychological profiles, and communication styles.
- **Conversation Simulation**: Simulate conversations between patients and an AI assistant, capturing metrics like topic changes and emotional responses.
- **Assessment Evaluation**: Evaluate the accuracy and quality of AI-generated assessments of patient psychological states.
- **Result Storage**: Save and analyze test results for continuous improvement.
- **Prompt Refinement**: Iteratively improve prompts based on evaluation results.

## Directory Structure

```
lib/prompt-testing/
├── index.ts                # Main entry point and orchestration
├── types.ts                # Type definitions
├── run-tests.ts            # Script to run multiple tests
├── personas/
│   └── persona-generator.ts # Patient persona generation
├── simulator/
│   └── conversation-simulator.ts # Conversation simulation
├── evaluator/
│   └── assessment-evaluator.ts # Assessment evaluation
└── utils/
    └── result-storage.ts   # Test result storage and retrieval
```

## Usage

### Basic Usage

```typescript
import { PromptTester } from './lib/prompt-testing';

// Create a tester instance
const tester = new PromptTester({
  useMockResponses: true, // Use mock responses for development
  resultDirectory: './test-results'
});

// Run a single test cycle
const result = await tester.runTestCycle({
  personaOptions: {
    psychologicalFocus: 'high anxiety',
    communicationStyle: 'reserved'
  },
  simulationConfig: {
    maxTurns: 10
  },
  saveOptions: {
    createSummary: true,
    includeFullConversation: true
  }
});

console.log(`Test completed for ${result.persona.name}`);
console.log(`Assessment accuracy: ${result.evaluationResult.assessmentAccuracy.score}/10`);
```

### Running Multiple Tests

```typescript
import { runAllTests } from './lib/prompt-testing/run-tests';

// Run all predefined test configurations
const results = await runAllTests();
```

## Configuration Options

### Persona Generation Options

- `cancerType`: Specific cancer type
- `psychologicalFocus`: Focus area like 'high anxiety', 'depression', etc.
- `communicationStyle`: Style like 'reserved', 'open', 'analytical', etc.
- `age`: Age or age range
- `gender`: Gender preference
- `treatmentStatus`: Treatment phase

### Simulation Configuration

- `maxTurns`: Maximum conversation turns
- `randomness`: Controls variation in responses (0-1)

### Save Options

- `createSummary`: Generate a markdown summary
- `includeFullConversation`: Include the complete conversation
- `includeFullPersona`: Include all persona details
- `formatJson`: Format JSON with indentation

## Integration with Main App

This framework is designed to integrate with the main cancer chat application, sharing resources and allowing for direct testing of the production prompts and models.

## Development

To extend the framework:

1. Add new persona characteristics in `persona-generator.ts`
2. Enhance conversation metrics in `conversation-simulator.ts`
3. Improve evaluation criteria in `assessment-evaluator.ts`
4. Add visualization capabilities for test results

## License

This project is proprietary and confidential. 