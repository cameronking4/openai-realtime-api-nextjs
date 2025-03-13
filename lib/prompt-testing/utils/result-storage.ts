import fs from 'fs';
import path from 'path';
import { PatientPersona, SimulationResult, EvaluationResult, TestCycleResult } from '../types';

/**
 * Options for saving test results
 */
export interface SaveResultsOptions {
  createSummary?: boolean;
  includeFullConversation?: boolean;
  includeFullPersona?: boolean;
  formatJson?: boolean;
}

/**
 * Utility for storing and retrieving test results
 */
export class ResultStorage {
  private baseDir: string;
  
  constructor(baseDir: string = './test-results') {
    this.baseDir = baseDir;
  }
  
  /**
   * Save test cycle results to a file
   */
  async saveTestResults(
    testCycle: TestCycleResult, 
    options: SaveResultsOptions = {}
  ): Promise<string> {
    // Ensure the directory exists
    await this.ensureDirectoryExists();
    
    // Create a filename based on the test ID and timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `test-${testCycle.id}-${timestamp}.json`;
    const filePath = path.join(this.baseDir, filename);
    
    // Create a summary if requested
    if (options.createSummary) {
      await this.createSummary(testCycle, options);
    }
    
    // Write the file
    await this.writeFile(filePath, testCycle, options);
    
    return filePath;
  }
  
  /**
   * Create a summary of the test results
   */
  private async createSummary(
    testCycle: TestCycleResult, 
    options: SaveResultsOptions
  ): Promise<string> {
    // Create a summary filename
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const summaryFilename = `summary-${testCycle.id}-${timestamp}.md`;
    const summaryPath = path.join(this.baseDir, summaryFilename);
    
    // Build the summary content
    let summaryContent = `# Test Cycle Summary: ${testCycle.id}\n\n`;
    summaryContent += `**Timestamp:** ${testCycle.timestamp}\n\n`;
    
    // Add persona information
    summaryContent += `## Patient Persona\n\n`;
    summaryContent += `- **Name:** ${testCycle.persona.name}\n`;
    summaryContent += `- **Age:** ${testCycle.persona.age}\n`;
    summaryContent += `- **Gender:** ${testCycle.persona.gender}\n`;
    summaryContent += `- **Cancer Type:** ${testCycle.persona.diagnosis.cancerType}\n`;
    summaryContent += `- **Stage:** ${testCycle.persona.diagnosis.stage}\n`;
    summaryContent += `- **Treatment Status:** ${testCycle.persona.treatmentStatus}\n\n`;
    
    summaryContent += `### Psychological Profile\n\n`;
    summaryContent += `- **Anxiety:** ${testCycle.persona.psychologicalProfile.anxiety}/10\n`;
    summaryContent += `- **Depression:** ${testCycle.persona.psychologicalProfile.depression}/10\n`;
    summaryContent += `- **Distress:** ${testCycle.persona.psychologicalProfile.distress}/10\n`;
    summaryContent += `- **Self-Efficacy:** ${testCycle.persona.psychologicalProfile.selfEfficacy}/10\n`;
    summaryContent += `- **Support Network:** ${testCycle.persona.psychologicalProfile.supportNetworkStrength}/10\n\n`;
    
    summaryContent += `### Communication Style\n\n`;
    summaryContent += `- **Articulation:** ${testCycle.persona.communication.articulationLevel}/10\n`;
    summaryContent += `- **Openness:** ${testCycle.persona.communication.openness}/10\n`;
    summaryContent += `- **Directness:** ${testCycle.persona.communication.directness}/10\n`;
    summaryContent += `- **Emotional Expression:** ${testCycle.persona.communication.emotionalExpression}/10\n\n`;
    
    // Add simulation metrics
    summaryContent += `## Conversation Metrics\n\n`;
    summaryContent += `- **Total Turns:** ${testCycle.simulationResult.metrics.totalTurns}\n`;
    summaryContent += `- **Topics Changed:** ${testCycle.simulationResult.metrics.topicsChanged}\n`;
    summaryContent += `- **Questions Asked:** ${testCycle.simulationResult.metrics.questionsAsked}\n`;
    summaryContent += `- **Questions Answered:** ${testCycle.simulationResult.metrics.questionsAnswered}\n`;
    summaryContent += `- **Emotional Responses:** ${testCycle.simulationResult.metrics.emotionalResponses}\n`;
    summaryContent += `- **Avoidant Responses:** ${testCycle.simulationResult.metrics.avoidantResponses}\n\n`;
    
    // Add evaluation results
    summaryContent += `## Evaluation Results\n\n`;
    summaryContent += `- **Assessment Accuracy:** ${testCycle.evaluationResult.assessmentAccuracy.score}/10\n`;
    summaryContent += `  ${testCycle.evaluationResult.assessmentAccuracy.explanation}\n\n`;
    
    summaryContent += `- **Conversation Naturalness:** ${testCycle.evaluationResult.conversationNaturalness.score}/10\n`;
    summaryContent += `  ${testCycle.evaluationResult.conversationNaturalness.explanation}\n\n`;
    
    summaryContent += `- **User Burden:** ${testCycle.evaluationResult.userBurden.score}/10\n`;
    summaryContent += `  ${testCycle.evaluationResult.userBurden.explanation}\n\n`;
    
    summaryContent += `### Improvement Suggestions\n\n`;
    testCycle.evaluationResult.improvementSuggestions.forEach((suggestion, index) => {
      summaryContent += `${index + 1}. ${suggestion}\n`;
    });
    summaryContent += '\n';
    
    // Add a sample of the conversation
    summaryContent += `## Conversation Sample\n\n`;
    
    // Get a sample of the conversation (first 3 turns)
    const conversationSample = testCycle.simulationResult.conversation.slice(0, 6);
    
    conversationSample.forEach(item => {
      const role = item.role === 'assistant' ? 'AI Assistant' : 'Patient';
      summaryContent += `**${role}:** ${item.content}\n\n`;
    });
    
    // Add a link to the full results
    summaryContent += `\n[Full test results](${filename})\n`;
    
    // Write the summary file
    await fs.promises.writeFile(summaryPath, summaryContent, 'utf8');
    
    return summaryPath;
  }
  
  /**
   * Ensure the results directory exists
   */
  private async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.promises.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      console.error(`Error creating directory ${this.baseDir}:`, error);
      throw new Error(`Failed to create directory: ${this.baseDir}`);
    }
  }
  
  /**
   * Write test results to a file
   */
  private async writeFile(
    filePath: string, 
    data: TestCycleResult, 
    options: SaveResultsOptions
  ): Promise<void> {
    try {
      // Create a copy of the data to modify
      const processedData = { ...data };
      
      // Optionally remove the full conversation to save space
      if (!options.includeFullConversation && processedData.simulationResult.conversation) {
        // Keep only the first and last few messages as a sample
        const conversation = processedData.simulationResult.conversation;
        const sampleSize = 3; // Number of messages to keep from start and end
        
        if (conversation.length > sampleSize * 2) {
          processedData.simulationResult.conversation = [
            ...conversation.slice(0, sampleSize),
            { 
              role: 'system', 
              content: `... ${conversation.length - (sampleSize * 2)} messages omitted ...`,
              timestamp: new Date().toISOString()
            },
            ...conversation.slice(conversation.length - sampleSize)
          ];
        }
      }
      
      // Optionally simplify the persona to save space
      if (!options.includeFullPersona) {
        // Keep only essential persona information
        const { id, name, age, gender, diagnosis, treatmentStatus, psychologicalProfile, communication } = processedData.persona;
        processedData.persona = { 
          id, name, age, gender, diagnosis, treatmentStatus, 
          psychologicalProfile, communication 
        } as PatientPersona;
      }
      
      // Format the JSON with indentation if requested
      const jsonData = options.formatJson 
        ? JSON.stringify(processedData, null, 2) 
        : JSON.stringify(processedData);
      
      await fs.promises.writeFile(filePath, jsonData, 'utf8');
    } catch (error) {
      console.error(`Error writing file ${filePath}:`, error);
      throw new Error(`Failed to write file: ${filePath}`);
    }
  }
  
  /**
   * Load test results from a file
   */
  async loadTestResults(filename: string): Promise<TestCycleResult> {
    try {
      const filePath = path.join(this.baseDir, filename);
      const fileContent = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(fileContent) as TestCycleResult;
    } catch (error) {
      console.error(`Error loading test results from ${filename}:`, error);
      throw new Error(`Failed to load test results: ${filename}`);
    }
  }
  
  /**
   * List all test result files
   */
  async listTestResults(): Promise<string[]> {
    try {
      await this.ensureDirectoryExists();
      const files = await fs.promises.readdir(this.baseDir);
      return files.filter(file => file.endsWith('.json') && file.startsWith('test-'));
    } catch (error) {
      console.error(`Error listing test results:`, error);
      throw new Error('Failed to list test results');
    }
  }
  
  /**
   * List all summary files
   */
  async listSummaries(): Promise<string[]> {
    try {
      await this.ensureDirectoryExists();
      const files = await fs.promises.readdir(this.baseDir);
      return files.filter(file => file.endsWith('.md') && file.startsWith('summary-'));
    } catch (error) {
      console.error(`Error listing summaries:`, error);
      throw new Error('Failed to list summaries');
    }
  }
  
  /**
   * Delete a test result file
   */
  async deleteTestResult(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.baseDir, filename);
      await fs.promises.unlink(filePath);
    } catch (error) {
      console.error(`Error deleting test result ${filename}:`, error);
      throw new Error(`Failed to delete test result: ${filename}`);
    }
  }
  
  /**
   * Get the base directory for test results
   */
  getBaseDirectory(): string {
    return this.baseDir;
  }
} 