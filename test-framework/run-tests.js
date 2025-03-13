/**
 * Script to run multiple test cycles with different configurations
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure test results directory exists
const resultsDir = path.join(__dirname, 'test-results');
if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Test configurations
const testConfigs = [
  {
    name: 'high-anxiety-reserved',
    psychologicalFocus: 'high anxiety',
    communicationStyle: 'reserved',
  },
  {
    name: 'depression-open',
    psychologicalFocus: 'moderate depression',
    communicationStyle: 'open',
  },
  {
    name: 'low-efficacy-analytical',
    psychologicalFocus: 'low self-efficacy',
    communicationStyle: 'analytical',
  },
  {
    name: 'strong-support-emotional',
    psychologicalFocus: 'strong support network',
    communicationStyle: 'emotional',
  },
];

// Function to run a test with a specific configuration
async function runTest(config) {
  return new Promise((resolve, reject) => {
    console.log(`\n\n========================================`);
    console.log(`Running test: ${config.name}`);
    console.log(`Psychological focus: ${config.psychologicalFocus}`);
    console.log(`Communication style: ${config.communicationStyle}`);
    console.log(`========================================\n`);

    // Create a temporary file to modify the index.ts for this test
    const tempIndexPath = path.join(__dirname, 'src', 'temp-index.ts');
    const originalIndexPath = path.join(__dirname, 'src', 'index.ts');
    
    // Read the original index.ts
    const originalIndex = fs.readFileSync(originalIndexPath, 'utf8');
    
    // Modify the persona generation options
    const modifiedIndex = originalIndex.replace(
      /const persona = await personaGenerator\.generatePersona\({[\s\S]*?\}\);/,
      `const persona = await personaGenerator.generatePersona({
    psychologicalFocus: '${config.psychologicalFocus}',
    communicationStyle: '${config.communicationStyle}'
  });`
    );
    
    // Write the modified index to a temporary file
    fs.writeFileSync(tempIndexPath, modifiedIndex);
    
    // Run the test with the modified index
    const testProcess = spawn('npx', ['ts-node', tempIndexPath], {
      stdio: 'inherit',
    });
    
    testProcess.on('close', (code) => {
      // Clean up the temporary file
      fs.unlinkSync(tempIndexPath);
      
      if (code === 0) {
        console.log(`\nTest ${config.name} completed successfully`);
        resolve();
      } else {
        console.error(`\nTest ${config.name} failed with code ${code}`);
        reject(new Error(`Test failed with code ${code}`));
      }
    });
  });
}

// Run all tests sequentially
async function runAllTests() {
  console.log('Starting test suite...');
  
  for (const config of testConfigs) {
    try {
      await runTest(config);
    } catch (error) {
      console.error(`Error running test ${config.name}:`, error);
    }
  }
  
  console.log('\nAll tests completed!');
}

// Start the tests
runAllTests(); 