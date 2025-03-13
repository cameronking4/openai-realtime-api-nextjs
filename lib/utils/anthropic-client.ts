import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export { anthropicClient }; 