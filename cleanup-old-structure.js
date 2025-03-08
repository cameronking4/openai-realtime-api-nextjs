/**
 * Cleanup Old Structure Script
 * 
 * This script removes the original files after migration.
 * It should only be run after verifying that the new structure works correctly.
 */

const fs = require('fs');
const path = require('path');

// Load the migration plan
const migrationPlan = JSON.parse(fs.readFileSync('migration-plan.json', 'utf8'));

// Directories to clean up
const oldDirectories = [
  'components',
  'src/components',
  'hooks',
  'src/hooks',
  'lib',
  'src/lib',
  'types',
  'src/types',
  'utils',
  'src/utils',
  'contexts',
  'src/contexts',
  'providers',
  'src/providers'
];

// Function to remove a file
function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}

// Function to remove empty directories
function removeEmptyDirectories(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return;
  }
  
  let files = fs.readdirSync(dirPath);
  
  if (files.length > 0) {
    files.forEach(file => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        // Recursively remove empty directories
        removeEmptyDirectories(filePath);
      }
    });
    
    // Check again after removing subdirectories
    files = fs.readdirSync(dirPath);
  }
  
  if (files.length === 0) {
    fs.rmdirSync(dirPath);
    console.log(`Removed empty directory: ${dirPath}`);
  }
}

// Main function
function cleanupOldStructure() {
  console.log('Cleaning up old structure...\n');
  
  // Remove original files
  console.log('Removing original files...');
  let removedFiles = 0;
  
  migrationPlan.forEach((item, index) => {
    try {
      if (removeFile(item.oldPath)) {
        console.log(`${index + 1}/${migrationPlan.length}: Removed ${item.oldPath}`);
        removedFiles++;
      } else {
        console.log(`${index + 1}/${migrationPlan.length}: File not found: ${item.oldPath}`);
      }
    } catch (error) {
      console.error(`Error removing ${item.oldPath}: ${error.message}`);
    }
  });
  
  console.log(`\nRemoved ${removedFiles} files.`);
  
  // Remove empty directories
  console.log('\nRemoving empty directories...');
  oldDirectories.forEach(dir => {
    try {
      removeEmptyDirectories(dir);
    } catch (error) {
      console.error(`Error removing directory ${dir}: ${error.message}`);
    }
  });
  
  console.log('\nCleanup complete!');
}

// Ask for confirmation before running
console.log('WARNING: This script will remove all original files after migration.');
console.log('Make sure you have verified that the new structure works correctly before proceeding.');
console.log('To proceed, run this script with the --confirm flag:');
console.log('  node cleanup-old-structure.js --confirm');

// Check if the --confirm flag is provided
if (process.argv.includes('--confirm')) {
  cleanupOldStructure();
} else {
  console.log('\nAborted. No files were removed.');
} 