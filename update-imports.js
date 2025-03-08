/**
 * Update Imports Script
 * 
 * This script updates imports in the migrated files to use the new path aliases.
 */

const fs = require('fs');
const path = require('path');

// Load the migration plan
const migrationPlan = JSON.parse(fs.readFileSync('migration-plan.json', 'utf8'));

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
    pattern: /\.\.\/\.\.\/\.\.\/components\/ui\//g,
    replacement: '@/app/_components/ui/'
  },
  {
    // "@/app/_components/layout/* -> @/app/_components/layout/*
    pattern: /\.\.\/\.\.\/\.\.\/components\/layout\//g,
    replacement: '@/app/_components/layout/'
  },
  {
    // "@/app/_components/features/cancer-chat/* -> @/app/_components/features/cancer-chat/*
    pattern: /\.\.\/\.\.\/\.\.\/components\/cancer-chat\//g,
    replacement: '@/app/_components/features/cancer-chat/'
  },
  {
    // "@/app/_components/shared/* -> @/app/_components/shared/*
    pattern: /\.\.\/\.\.\/\.\.\/components\//g,
    replacement: '@/app/_components/shared/'
  },
  {
    // "@/app/_hooks/* -> @/app/_hooks/*
    pattern: /\.\.\/\.\.\/\.\.\/hooks\//g,
    replacement: '@/app/_hooks/'
  },
  {
    // "@/app/_lib/* -> @/app/_lib/*
    pattern: /\.\.\/\.\.\/\.\.\/lib\//g,
    replacement: '@/app/_lib/'
  },
  {
    // "@/app/_types/* -> @/app/_types/*
    pattern: /\.\.\/\.\.\/\.\.\/types\//g,
    replacement: '@/app/_types/'
  },
  {
    // "@/app/_utils/* -> @/app/_utils/*
    pattern: /\.\.\/\.\.\/\.\.\/utils\//g,
    replacement: '@/app/_utils/'
  },
  {
    // "@/app/_contexts/* -> @/app/_contexts/*
    pattern: /\.\.\/\.\.\/\.\.\/contexts\//g,
    replacement: '@/app/_contexts/'
  },
  {
    // "@/app/_components/providers/* -> @/app/_components/providers/*
    pattern: /\.\.\/\.\.\/\.\.\/providers\//g,
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

// Function to update imports in a file
function updateImports(filePath) {
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Apply all import patterns
  importPatterns.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, content);
}

// Main function
function executeImportUpdates() {
  console.log('Updating imports in migrated files...\n');
  
  // Update imports in all migrated files
  migrationPlan.forEach((item, index) => {
    try {
      updateImports(item.newPath);
      console.log(`${index + 1}/${migrationPlan.length}: Updated imports in ${item.fileName}`);
    } catch (error) {
      console.error(`Error updating imports in ${item.fileName}: ${error.message}`);
    }
  });
  
  console.log('\nImport updates complete!');
}

// Run the main function
executeImportUpdates(); 