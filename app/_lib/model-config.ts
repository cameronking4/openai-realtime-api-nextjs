/**
 * Configuration for AI models used in the application
 * This file centralizes all model configuration to make it easy to update
 */

// Default model configuration
const defaultModelConfig = {
  // Model for generating quick reply suggestions (should be fast)
  suggestionModel: 'claude-3-haiku-20240307',
  
  // Model for generating assessments (should be more capable)
  assessmentModel: 'claude-3-7-sonnet-20250219',
  
  // Model for general API usage
  defaultModel: 'claude-3-7-sonnet-20250219',
  
  // Maximum tokens for each model type
  maxTokens: {
    suggestion: 150,
    assessment: 4000,
    default: 4000
  },
  
  // Temperature settings for each model type
  temperature: {
    suggestion: 0.7,
    assessment: 0.7,
    default: 0.7
  }
};

/**
 * Get the model configuration, with environment variable overrides if available
 */
export function getModelConfig() {
  return {
    suggestionModel: process.env.ANTHROPIC_SUGGESTION_MODEL || defaultModelConfig.suggestionModel,
    assessmentModel: process.env.ANTHROPIC_ASSESSMENT_MODEL || defaultModelConfig.assessmentModel,
    defaultModel: process.env.ANTHROPIC_DEFAULT_MODEL || defaultModelConfig.defaultModel,
    maxTokens: {
      suggestion: parseInt(process.env.ANTHROPIC_SUGGESTION_MAX_TOKENS || defaultModelConfig.maxTokens.suggestion.toString()),
      assessment: parseInt(process.env.ANTHROPIC_ASSESSMENT_MAX_TOKENS || defaultModelConfig.maxTokens.assessment.toString()),
      default: parseInt(process.env.ANTHROPIC_DEFAULT_MAX_TOKENS || defaultModelConfig.maxTokens.default.toString())
    },
    temperature: {
      suggestion: parseFloat(process.env.ANTHROPIC_SUGGESTION_TEMPERATURE || defaultModelConfig.temperature.suggestion.toString()),
      assessment: parseFloat(process.env.ANTHROPIC_ASSESSMENT_TEMPERATURE || defaultModelConfig.temperature.assessment.toString()),
      default: parseFloat(process.env.ANTHROPIC_DEFAULT_TEMPERATURE || defaultModelConfig.temperature.default.toString())
    }
  };
}

/**
 * Get the model configuration for suggestions
 */
export function getSuggestionModelConfig() {
  const config = getModelConfig();
  return {
    model: config.suggestionModel,
    maxTokens: config.maxTokens.suggestion,
    temperature: config.temperature.suggestion
  };
}

/**
 * Get the model configuration for assessments
 */
export function getAssessmentModelConfig() {
  const config = getModelConfig();
  return {
    model: config.assessmentModel,
    maxTokens: config.maxTokens.assessment,
    temperature: config.temperature.assessment
  };
}

/**
 * Get the default model configuration
 */
export function getDefaultModelConfig() {
  const config = getModelConfig();
  return {
    model: config.defaultModel,
    maxTokens: config.maxTokens.default,
    temperature: config.temperature.default
  };
} 