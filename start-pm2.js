require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local', override: true });

const { spawn } = require('child_process');
const fs = require('fs');

// Import the killProcessOnPort function from kill-port.js
// If the file doesn't exist yet, this will be skipped
try {
  const killProcessOnPort = require('./kill-port');
  // Kill any processes on port 3000 before starting
  killProcessOnPort(3000);
} catch (error) {
  console.log('kill-port.js not found, skipping port check');
}

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
}

// Log the environment variables (excluding sensitive data)
console.log('Starting PM2 with environment variables:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT || 3000}`);
console.log('OPENAI_API_KEY: [Present]', process.env.OPENAI_API_KEY ? '✓' : '✗');

// Create logs directory if it doesn't exist
if (!fs.existsSync('logs')) {
  fs.mkdirSync('logs');
  console.log('Created logs directory');
}

// Start PM2 with the ecosystem.config.js file
const pm2Process = spawn('pm2', ['start', 'ecosystem.config.js'], {
  stdio: 'inherit',
  env: process.env
});

pm2Process.on('close', (code) => {
  console.log(`PM2 process exited with code ${code}`);
}); 