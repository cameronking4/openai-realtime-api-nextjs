const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute shell commands
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

// Main function to pull environment variables from Vercel
async function pullEnvFromVercel() {
  console.log('Pulling environment variables from Vercel...');
  
  // Check if user is logged in to Vercel
  try {
    const whoamiOutput = runCommand('vercel whoami');
    console.log(`Logged in to Vercel as: ${whoamiOutput.trim()}`);
  } catch (error) {
    console.log('Not logged in to Vercel. Please login first.');
    runCommand('vercel login');
  }
  
  // Link to Vercel project if not already linked
  if (!fs.existsSync('.vercel/project.json')) {
    console.log('Linking to Vercel project...');
    runCommand('vercel link --yes');
  }
  
  // Pull environment variables
  console.log('Pulling environment variables...');
  runCommand('vercel env pull .env.local');
  
  console.log('Environment variables successfully pulled from Vercel to .env.local');
}

// Run the main function
pullEnvFromVercel().catch(error => {
  console.error('Error pulling environment variables:', error);
  process.exit(1);
}); 