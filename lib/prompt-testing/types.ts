/**
 * Types for the LLM-driven testing and prompt refinement system
 */

/**
 * Patient persona for testing
 */
export interface PatientPersona {
  id: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: {
    cancerType: string;
    stage: string;
    timeOfDiagnosis: string;
  };
  treatmentStatus: string;
  psychologicalProfile: {
    anxiety: number;
    depression: number;
    distress: number;
    selfEfficacy: number;
    supportNetworkStrength: number;
  };
  communication: {
    articulationLevel: number;
    openness: number;
    directness: number;
    emotionalExpression: number;
  };
  background: {
    familyStatus: string;
    occupation: string;
    importantLifeEvents: string[];
    supportSystem: string[];
  };
  behavioralPatterns: string[];
  personalConcerns: string[];
}

/**
 * Single item in a conversation
 */
export interface ConversationItem {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

/**
 * Configuration for conversation simulation
 */
export interface SimulationConfig {
  personaId?: string;
  maxTurns?: number;
  simulationGoals?: string[];
  randomness?: number;
  recordMetrics?: boolean;
}

/**
 * Metrics collected during conversation simulation
 */
export interface ConversationMetrics {
  totalTurns: number;
  topicsChanged: number;
  questionsAsked: number;
  questionsAnswered: number;
  emotionalResponses: number;
  avoidantResponses: number;
  conversationLength?: number;
  responseDelays?: number[];
  topicChanges?: number;
  emotionalMoments?: {
    text: string;
    emotion: string;
    intensity: number;
  }[];
}

/**
 * Result of a conversation simulation
 */
export interface SimulationResult {
  id: string;
  persona: PatientPersona;
  conversation: ConversationItem[];
  assessment: string;
  metrics: ConversationMetrics;
  timestamp: string;
}

/**
 * Score for a specific metric
 */
export interface MetricScore {
  score: number;
  explanation: string;
}

/**
 * Result of an evaluation
 */
export interface EvaluationResult {
  id: string;
  assessmentAccuracy: MetricScore;
  conversationNaturalness: MetricScore;
  userBurden: MetricScore;
  improvementSuggestions: string[];
  timestamp: string;
  overallAccuracy?: number;
  domainSpecificAccuracy?: Record<string, number>;
  falsePositives?: string[];
  falseNegatives?: string[];
  promptImprovementSuggestions?: string[];
}

/**
 * Configuration for prompt refinement
 */
export interface PromptRefinementConfig {
  targetMetrics: {
    assessmentAccuracy?: number;
    conversationNaturalness?: number;
    userBurden?: number;
  };
  maxIterations: number;
  refinementStrategy: 'incremental' | 'generative' | 'hybrid';
}

/**
 * Version of a prompt
 */
export interface PromptVersion {
  id: string;
  promptText: string;
  performance: {
    assessmentAccuracy: number;
    conversationNaturalness: number;
    userBurden: number;
  };
  timestamp: string;
  parentId?: string;
}

/**
 * Data for the monitoring dashboard
 */
export interface DashboardData {
  metricsOverTime: {
    timestamp: string;
    assessmentAccuracy: number;
    conversationNaturalness: number;
    userBurden: number;
  }[];
  recentConversations: {
    id: string;
    personaName: string;
    timestamp: string;
    metrics: ConversationMetrics;
  }[];
  promptVersions: PromptVersion[];
}

/**
 * Result of a complete test cycle
 */
export interface TestCycleResult {
  id: string;
  persona: PatientPersona;
  simulationResult: SimulationResult;
  evaluationResult: EvaluationResult;
  timestamp: string;
  config: {
    personaOptions?: any;
    simulationConfig?: SimulationConfig;
  };
} 