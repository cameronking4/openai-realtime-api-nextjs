import fs from 'fs';
import path from 'path';
import { PatientPersona, SimulationResult, EvaluationResult } from '../types';

/**
 * Options for saving test results
 */
interface SaveResultsOptions {
  outputDir?: string;
  includeTimestamp?: boolean;
  format?: 'json' | 'csv';
  createSummary?: boolean;
}

/**
 * Complete test cycle result
 */
interface TestCycleResult {
  persona: PatientPersona;
  simulationResult: SimulationResult;
  evaluationResult: EvaluationResult;
  timestamp: string;
  config: {
    psychologicalFocus?: string;
    communicationStyle?: string;
    maxTurns?: number;
    randomness?: number;
  };
}

/**
 * Utility for saving test results to files
 */
export class ResultStorage {
  private baseDir: string;
  
  constructor(baseDir: string = './test-results') {
    this.baseDir = baseDir;
    this.ensureDirectoryExists(this.baseDir);
  }
  
  /**
   * Save a complete test cycle result
   */
  async saveTestResult(
    result: TestCycleResult,
    options: SaveResultsOptions = {}
  ): Promise<string> {
    const {
      outputDir = this.baseDir,
      includeTimestamp = true,
      format = 'json',
      createSummary = true
    } = options;
    
    // Create a directory for this test
    const timestamp = includeTimestamp 
      ? new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '')
      : '';
    
    const testId = `${result.persona.id.substring(0, 8)}_${timestamp}`;
    const testDir = path.join(outputDir, testId);
    this.ensureDirectoryExists(testDir);
    
    // Save the full result
    const fullResultPath = path.join(testDir, `full-result.${format}`);
    await this.writeFile(fullResultPath, result);
    
    // Save individual components
    await this.writeFile(path.join(testDir, `persona.${format}`), result.persona);
    await this.writeFile(path.join(testDir, `transcript.${format}`), result.simulationResult.transcript);
    await this.writeFile(path.join(testDir, `assessment.${format}`), result.simulationResult.assessmentResult);
    await this.writeFile(path.join(testDir, `evaluation.${format}`), result.evaluationResult);
    
    // Create a summary file
    if (createSummary) {
      const summary = this.createSummary(result);
      await this.writeFile(path.join(testDir, `summary.${format}`), summary);
    }
    
    return testDir;
  }
  
  /**
   * Create a summary of the test result
   */
  private createSummary(result: TestCycleResult): any {
    return {
      testId: `${result.persona.id.substring(0, 8)}_${result.timestamp}`,
      persona: {
        name: result.persona.name,
        age: result.persona.age,
        gender: result.persona.gender,
        diagnosis: result.persona.diagnosis,
        psychologicalProfile: result.persona.psychologicalProfile
      },
      conversation: {
        turns: result.simulationResult.transcript.length / 2,
        topicChanges: result.simulationResult.metrics.topicChanges,
        questionsAsked: result.simulationResult.metrics.questionsAsked,
        questionsAnswered: result.simulationResult.metrics.questionsAnswered
      },
      evaluation: {
        overallAccuracy: result.evaluationResult.assessmentAccuracy.overallAccuracy,
        naturalness: result.evaluationResult.promptEffectiveness.naturalness,
        efficiency: result.evaluationResult.promptEffectiveness.efficiency,
        userBurden: result.evaluationResult.promptEffectiveness.userBurden,
        coverageOfDomains: result.evaluationResult.promptEffectiveness.coverageOfDomains,
        improvementSuggestions: result.evaluationResult.promptImprovementSuggestions
      },
      config: result.config
    };
  }
  
  /**
   * Ensure a directory exists, creating it if necessary
   */
  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  
  /**
   * Write data to a file
   */
  private async writeFile(filePath: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const content = JSON.stringify(data, null, 2);
      fs.writeFile(filePath, content, 'utf8', (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
  
  /**
   * Load a test result from a file
   */
  async loadTestResult(testId: string): Promise<TestCycleResult | null> {
    const testDir = path.join(this.baseDir, testId);
    if (!fs.existsSync(testDir)) {
      return null;
    }
    
    const fullResultPath = path.join(testDir, 'full-result.json');
    if (!fs.existsSync(fullResultPath)) {
      return null;
    }
    
    return new Promise((resolve, reject) => {
      fs.readFile(fullResultPath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          try {
            const result = JSON.parse(data);
            resolve(result);
          } catch (parseErr) {
            reject(parseErr);
          }
        }
      });
    });
  }
  
  /**
   * List all test results
   */
  async listTestResults(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(this.baseDir, (err, files) => {
        if (err) {
          reject(err);
        } else {
          resolve(files);
        }
      });
    });
  }
} 