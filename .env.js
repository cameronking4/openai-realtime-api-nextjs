// This file is used to load environment variables for the Next.js application
const fs = require('fs');

// Read the API key from .env.local file directly
let apiKey = '';
try {
  const envLocalContent = fs.readFileSync('.env.local', 'utf8');
  const apiKeyMatch = envLocalContent.match(/OPENAI_API_KEY=([^\n]+)/);
  if (apiKeyMatch && apiKeyMatch[1]) {
    apiKey = apiKeyMatch[1];
    console.log('Successfully read API key from .env.local');
  }
} catch (error) {
  console.error('Error reading .env.local file:', error);
}

// Set the API key in the environment
if (apiKey) {
  process.env.OPENAI_API_KEY = apiKey;
  console.log('OPENAI_API_KEY set in environment');
} else {
  console.error('Failed to set OPENAI_API_KEY in environment');
}

module.exports = {
  apiKey
}; 