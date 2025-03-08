/**
 * Update All Imports Script
 * 
 * This script updates imports in all project files to use the new path aliases.
 * It scans all .ts, .tsx, .js, and .jsx files in the project and updates imports.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import patterns to replace
const importPatterns = [
  {
    // @/app/_components/ui/* -> @/app/_components/ui/*
    pattern: /@\/components\/ui\//g,
    replacement: '@/app/_components/ui/'
  },
  {
    // @/app/_components/layout/* -> @/app/_components/layout/*
    pattern: /@\/components\/layout\//g,
    replacement: '@/app/_components/layout/'
  },
  {
    // @/app/_components/features/cancer-chat/* -> @/app/_components/features/cancer-chat/*
    pattern: /@\/components\/cancer-chat\//g,
    replacement: '@/app/_components/features/cancer-chat/'
  },
  {
    // @/app/_components/shared/* -> @/app/_components/shared/*
    pattern: /@\/components\//g,
    replacement: '@/app/_components/shared/'
  },
  {
    // @/app/_hooks/* -> @/app/_hooks/*
    pattern: /@\/hooks\//g,
    replacement: '@/app/_hooks/'
  },
  {
    // @/app/_lib/* -> @/app/_lib/*
    pattern: /@\/lib\//g,
    replacement: '@/app/_lib/'
  },
  {
    // @/app/_types/* -> @/app/_types/*
    pattern: /@\/types\//g,
    replacement: '@/app/_types/'
  },
  {
    // @/app/_utils/* -> @/app/_utils/*
    pattern: /@\/utils\//g,
    replacement: '@/app/_utils/'
  },
  {
    // @/app/_contexts/* -> @/app/_contexts/*
    pattern: /@\/contexts\//g,
    replacement: '@/app/_contexts/'
  },
  {
    // @/app/_components/providers/* -> @/app/_components/providers/*
    pattern: /@\/providers\//g,
    replacement: '@/app/_components/providers/'
  },
  {
    // "@/app/_components/ui/* -> @/app/_components/ui/*
    pattern: /\.\.\/components\/ui\//g,
    replacement: '@/app/_components/ui/'
  },
  {
    // "@/app/_components/layout/* -> @/app/_components/layout/*
    pattern: /\.\.\/components\/layout\//g,
    replacement: '@/app/_components/layout/'
  },
  {
    // "@/app/_components/features/cancer-chat/* -> @/app/_components/features/cancer-chat/*
    pattern: /\.\.\/components\/cancer-chat\//g,
    replacement: '@/app/_components/features/cancer-chat/'
  },
  {
    // "@/app/_components/shared/* -> @/app/_components/shared/*
    pattern: /\.\.\/components\//g,
    replacement: '@/app/_components/shared/'
  },
  {
    // "@/app/_hooks/* -> @/app/_hooks/*
    pattern: /\.\.\/hooks\//g,
    replacement: '@/app/_hooks/'
  },
  {
    // "@/app/_lib/* -> @/app/_lib/*
    pattern: /\.\.\/lib\//g,
    replacement: '@/app/_lib/'
  },
  {
    // "@/app/_types/* -> @/app/_types/*
    pattern: /\.\.\/types\//g,
    replacement: '@/app/_types/'
  },
  {
    // "@/app/_utils/* -> @/app/_utils/*
    pattern: /\.\.\/utils\//g,
    replacement: '@/app/_utils/'
  },
  {
    // "@/app/_contexts/* -> @/app/_contexts/*
    pattern: /\.\.\/contexts\//g,
    replacement: '@/app/_contexts/'
  },
  {
    // "@/app/_components/providers/* -> @/app/_components/providers/*
    pattern: /\.\.\/providers\//g,
    replacement: '@/app/_components/providers/'
  },
  {
    // "@/app/_components/providers/* -> @/app/_components/providers/*
    pattern: /\.\.\/src\/providers\//g,
    replacement: '@/app/_components/providers/'
  },
  {
    // "./api -> @/app/_types/api
    pattern: /['"]\.\/api['"]/g,
    replacement: "'@/app/_types/api'"
  },
  {
    // "./ui -> @/app/_types/ui
    pattern: /['"]\.\/ui['"]/g,
    replacement: "'@/app/_types/ui'"
  }
];

// Function to get all TypeScript and JavaScript files in the project
function getAllFiles() {
  // Use find command to get all .ts, .tsx, .js, and .jsx files
  const command = 'find . -type f -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/.next/*" \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \\)';
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
  
  // Get all TypeScript and JavaScript files
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