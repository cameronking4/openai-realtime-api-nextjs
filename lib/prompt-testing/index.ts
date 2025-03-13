import { v4 as uuidv4 } from 'uuid';
import { PersonaGenerator, PersonaGenerationOptions } from './personas/persona-generator';
import { ConversationSimulator } from './simulator/conversation-simulator';
import { AssessmentEvaluator } from './evaluator/assessment-evaluator';
import { ResultStorage, SaveResultsOptions } from './utils/result-storage';
import { 
  PatientPersona, 
  SimulationConfig, 
  SimulationResult, 
  EvaluationResult, 
  TestCycleResult 
} from './types';

/**
 * Configuration for a test cycle
 */
export interface TestCycleConfig {
  personaOptions?: PersonaGenerationOptions;
  simulationConfig?: SimulationConfig;
  saveOptions?: SaveResultsOptions;
  useMockResponses?: boolean;
  resultDirectory?: string;
}

/**
 * Main class for orchestrating the LLM prompt testing process
 */
export class PromptTester {
  private personaGenerator: PersonaGenerator;
  private conversationSimulator: ConversationSimulator;
  private assessmentEvaluator: AssessmentEvaluator;
  private resultStorage: ResultStorage;
  
  constructor(config: { useMockResponses?: boolean, resultDirectory?: string } = {}) {
    const useMockResponses = config.useMockResponses ?? false;
    const resultDirectory = config.resultDirectory ?? './test-results';
    
    this.personaGenerator = new PersonaGenerator(useMockResponses);
    this.conversationSimulator = new ConversationSimulator(useMockResponses);
    this.assessmentEvaluator = new AssessmentEvaluator(useMockResponses);
    this.resultStorage = new ResultStorage(resultDirectory);
  }
  
  /**
   * Run a complete test cycle
   */
  async runTestCycle(config: TestCycleConfig = {}): Promise<TestCycleResult> {
    console.log('Starting test cycle...');
    
    // Generate a patient persona
    console.log('Generating patient persona...');
    const persona = await this.personaGenerator.generatePersona(config.personaOptions);
    console.log(`Generated persona: ${persona.name}, ${persona.age}, ${persona.diagnosis.cancerType}`);
    
    // Simulate a conversation
    console.log('Simulating conversation...');
    const simulationResult = await this.conversationSimulator.simulateConversation(
      persona,
      config.simulationConfig
    );
    console.log(`Conversation simulation complete. ${simulationResult.conversation.length} messages exchanged.`);
    
    // Evaluate the simulation
    console.log('Evaluating conversation and assessment...');
    const evaluationResult = await this.assessmentEvaluator.evaluateSimulation(simulationResult);
    console.log('Evaluation complete.');
    
    // Create the test cycle result
    const testCycle: TestCycleResult = {
      id: uuidv4(),
      persona,
      simulationResult,
      evaluationResult,
      timestamp: new Date().toISOString(),
      config: {
        personaOptions: config.personaOptions,
        simulationConfig: config.simulationConfig
      }
    };
    
    // Save the results if requested
    if (config.saveOptions) {
      console.log('Saving test results...');
      const filePath = await this.resultStorage.saveTestResults(testCycle, config.saveOptions);
      console.log(`Results saved to: ${filePath}`);
    }
    
    return testCycle;
  }
  
  /**
   * Run multiple test cycles with different configurations
   */
  async runMultipleTests(configs: TestCycleConfig[]): Promise<TestCycleResult[]> {
    const results: TestCycleResult[] = [];
    
    for (let i = 0; i < configs.length; i++) {
      console.log(`Running test ${i + 1} of ${configs.length}...`);
      const result = await this.runTestCycle(configs[i]);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Generate a set of diverse patient personas
   */
  async generatePersonaSet(count: number, options: PersonaGenerationOptions = {}): Promise<PatientPersona[]> {
    return this.personaGenerator.generatePersonaSet(count, options);
  }
  
  /**
   * Get the result storage instance
   */
  getResultStorage(): ResultStorage {
    return this.resultStorage;
  }
} 