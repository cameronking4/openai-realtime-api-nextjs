/**
 * Fix Imports Script
 * 
 * This script automatically fixes import paths that need to be updated after the refactor.
 * It scans all TypeScript files and updates imports from old paths to new paths.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import patterns to replace
const importPatterns = [
  {
    // @/types -> @/app/_types
    pattern: /@\/types/g,
    replacement: '@/app/_types'
  },
  {
    // ./ui/* -> @/app/_components/ui/*
    pattern: /from ['"]\.\/ui\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_components/ui/$1"'
  },
  {
    // ../ui/* -> @/app/_components/ui/*
    pattern: /from ['"]\.\.\/ui\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_components/ui/$1"'
  },
  {
    // ../components/ui/* -> @/app/_components/ui/*
    pattern: /from ['"]\.\.\/components\/ui\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_components/ui/$1"'
  },
  {
    // ../components/shared/* -> @/app/_components/shared/*
    pattern: /from ['"]\.\.\/components\/shared\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_components/shared/$1"'
  },
  {
    // ../hooks/* -> @/app/_hooks/*
    pattern: /from ['"]\.\.\/hooks\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_hooks/$1"'
  },
  {
    // ../lib/* -> @/app/_lib/*
    pattern: /from ['"]\.\.\/lib\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_lib/$1"'
  },
  {
    // ../contexts/* -> @/app/_contexts/*
    pattern: /from ['"]\.\.\/contexts\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_contexts/$1"'
  },
  {
    // ../utils/* -> @/app/_utils/*
    pattern: /from ['"]\.\.\/utils\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_utils/$1"'
  },
  {
    // ../types/* -> @/app/_types/*
    pattern: /from ['"]\.\.\/types\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_types/$1"'
  },
  {
    // ../../../components/ui/* -> @/app/_components/ui/*
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/components\/ui\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_components/ui/$1"'
  },
  {
    // ../../../components/shared/* -> @/app/_components/shared/*
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/components\/shared\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_components/shared/$1"'
  },
  {
    // ../../../hooks/* -> @/app/_hooks/*
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/hooks\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_hooks/$1"'
  },
  {
    // ../../../lib/* -> @/app/_lib/*
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/lib\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_lib/$1"'
  },
  {
    // ../../../contexts/* -> @/app/_contexts/*
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/contexts\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_contexts/$1"'
  },
  {
    // ../../../utils/* -> @/app/_utils/*
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/utils\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_utils/$1"'
  },
  {
    // ../../../types/* -> @/app/_types/*
    pattern: /from ['"]\.\.\/\.\.\/\.\.\/types\/([^'"]+)['"]/g,
    replacement: 'from "@/app/_types/$1"'
  },
  {
    // Fix any paths with ../@/app which is invalid
    pattern: /from ['"]\.\.\/\@\/app/g,
    replacement: 'from "@/app'
  }
];

// Function to get all TypeScript files in the project
function getAllFiles() {
  // Use find command to get all .ts, .tsx files
  const command = 'find ./app -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" \\( -name "*.ts" -o -name "*.tsx" \\)';
  const output = execSync(command).toString();
  return output.split('\n').filter(Boolean);
}

// Function to update imports in a file
function updateImports(filePath) {
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Apply all import patterns
  importPatterns.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });
  
  // Only write the file if it was changed
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  
  return false;
}

// Main function
function executeImportUpdates() {
  console.log('Updating imports in all project files...\n');
  
  // Get all TypeScript files
  const allFiles = getAllFiles();
  
  // Update imports in all files
  let updatedFiles = 0;
  
  allFiles.forEach((filePath, index) => {
    try {
      const wasUpdated = updateImports(filePath);
      if (wasUpdated) {
        console.log(`${index + 1}/${allFiles.length}: Updated imports in ${filePath}`);
        updatedFiles++;
      }
    } catch (error) {
      console.error(`Error updating imports in ${filePath}: ${error.message}`);
    }
  });
  
  console.log(`\nUpdated imports in ${updatedFiles} files out of ${allFiles.length} total files.`);
  console.log('\nImport updates complete!');
}

// Run the main function
executeImportUpdates(); 