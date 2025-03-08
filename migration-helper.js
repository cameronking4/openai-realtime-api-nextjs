/**
 * Migration Helper Script
 * 
 * This script helps with migrating components from the old structure to the new one.
 * It lists all components in the old structure and provides a plan for migration.
 */

const fs = require('fs');
const path = require('path');

// Directories to scan
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

// New directory mapping
const newDirectoryMapping = {
  'components/ui': 'app/_components/ui',
  'components/layout': 'app/_components/layout',
  'components/cancer-chat': 'app/_components/features/cancer-chat',
  'components': 'app/_components/shared',
  'src/components/ui': 'app/_components/ui',
  'src/components/layout': 'app/_components/layout',
  'src/components/features/cancer-chat': 'app/_components/features/cancer-chat',
  'src/components/shared': 'app/_components/shared',
  'hooks': 'app/_hooks',
  'src/hooks': 'app/_hooks',
  'lib': 'app/_lib',
  'src/lib': 'app/_lib',
  'types': 'app/_types',
  'src/types': 'app/_types',
  'utils': 'app/_utils',
  'src/utils': 'app/_utils',
  'contexts': 'app/_contexts',
  'src/contexts': 'app/_contexts',
  'providers': 'app/_components/providers',
  'src/providers': 'app/_components/providers'
};

// Function to get all files in a directory recursively
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      fileList = getAllFiles(filePath, fileList);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

// Function to determine the new path for a file
function getNewPath(filePath) {
  for (const [oldDir, newDir] of Object.entries(newDirectoryMapping)) {
    if (filePath.startsWith(oldDir)) {
      return filePath.replace(oldDir, newDir);
    }
  }
  
  // If no mapping found, use a default
  const dir = path.dirname(filePath);
  const fileName = path.basename(filePath);
  
  if (dir.includes('components')) {
    return path.join('app/_components/shared', fileName);
  } else if (dir.includes('hooks')) {
    return path.join('app/_hooks', fileName);
  } else if (dir.includes('lib')) {
    return path.join('app/_lib', fileName);
  } else if (dir.includes('types')) {
    return path.join('app/_types', fileName);
  } else if (dir.includes('utils')) {
    return path.join('app/_utils', fileName);
  } else if (dir.includes('contexts')) {
    return path.join('app/_contexts', fileName);
  } else if (dir.includes('providers')) {
    return path.join('app/_components/providers', fileName);
  }
  
  return path.join('app/_components/shared', fileName);
}

// Main function
function generateMigrationPlan() {
  console.log('Generating migration plan...\n');
  
  let allFiles = [];
  
  // Get all files in the old directories
  oldDirectories.forEach(dir => {
    allFiles = allFiles.concat(getAllFiles(dir));
  });
  
  // Generate migration plan
  const migrationPlan = allFiles.map(file => {
    const newPath = getNewPath(file);
    return {
      oldPath: file,
      newPath,
      fileName: path.basename(file)
    };
  });
  
  // Print migration plan
  console.log('Migration Plan:');
  console.log('===============\n');
  
  migrationPlan.forEach((item, index) => {
    console.log(`${index + 1}. ${item.fileName}`);
    console.log(`   From: ${item.oldPath}`);
    console.log(`   To:   ${item.newPath}`);
    console.log('');
  });
  
  console.log(`Total files to migrate: ${migrationPlan.length}`);
  
  // Write migration plan to file
  fs.writeFileSync('migration-plan.json', JSON.stringify(migrationPlan, null, 2));
  console.log('\nMigration plan written to migration-plan.json');
}

// Run the main function
generateMigrationPlan(); 