// This script checks if all required environment variables are set
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Required environment variables
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'PERPLEXITY_API_KEY',
  'GEMINI_API_KEY',
  'OPENAI_DIRECT_MODE'
];

// Path to .env.local file
const envLocalPath = path.resolve(process.cwd(), '.env.local');

// Check if .env.local exists
if (!fs.existsSync(envLocalPath)) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: .env.local file not found.');
  console.log('Run "node pull-env.js" to pull environment variables from Vercel.');
  process.exit(1);
}

// Load environment variables from .env.local
const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));

// Check if all required environment variables are set
const missingEnvVars = [];
for (const envVar of requiredEnvVars) {
  if (!envConfig[envVar]) {
    missingEnvVars.push(envVar);
  }
}

if (missingEnvVars.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', 'Error: The following required environment variables are missing:');
  missingEnvVars.forEach(envVar => {
    console.error(`  - ${envVar}`);
  });
  console.log('Make sure these variables are set in your Vercel project and run "node pull-env.js" again.');
  process.exit(1);
} else {
  console.log('\x1b[32m%s\x1b[0m', 'Success: All required environment variables are set.');
}

// Check for placeholder values
const placeholderValues = [];
for (const envVar of requiredEnvVars) {
  const value = envConfig[envVar];
  if (value && (value.includes('your_') || value.includes('placeholder'))) {
    placeholderValues.push(envVar);
  }
}

if (placeholderValues.length > 0) {
  console.warn('\x1b[33m%s\x1b[0m', 'Warning: The following environment variables have placeholder values:');
  placeholderValues.forEach(envVar => {
    console.warn(`  - ${envVar}`);
  });
  console.log('Make sure to replace these placeholder values with actual API keys.');
} 