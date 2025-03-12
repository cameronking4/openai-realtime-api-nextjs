// This file is used to load environment variables for the Next.js application
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Path to .env.local file
const envLocalPath = path.resolve(process.cwd(), '.env.local');

// Check if .env.local exists
if (fs.existsSync(envLocalPath)) {
  console.log('Loading environment variables from .env.local');
  const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  
  // Set environment variables
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
    console.log(`Set environment variable: ${key}`);
  }
} else {
  console.warn('.env.local file not found. Environment variables may not be properly set.');
  console.warn('Run "node pull-env.js" to pull environment variables from Vercel.');
}

// Export environment variables for use in other files
module.exports = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  OPENAI_DIRECT_MODE: process.env.OPENAI_DIRECT_MODE
}; 