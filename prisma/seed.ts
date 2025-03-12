import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Read the prompt templates directly from the file
function readPromptFile() {
  const filePath = path.join(process.cwd(), 'prompts', 'ai-conversation-templates.ts');
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Extract the prompts using regex
  const psychoOncologyMatch = fileContent.match(/export const PSYCHO_ONCOLOGY_ASSESSMENT_PROMPT = `([\s\S]*?)`;/);
  const defaultGreetingMatch = fileContent.match(/export const DEFAULT_GREETING_PROMPT = `([\s\S]*?)`;/);
  const aiAssessmentMatch = fileContent.match(/export const AI_ASSESSMENT_PROMPT = `([\s\S]*?)`;/);
  
  return {
    PSYCHO_ONCOLOGY_ASSESSMENT_PROMPT: psychoOncologyMatch ? psychoOncologyMatch[1] : '',
    DEFAULT_GREETING_PROMPT: defaultGreetingMatch ? defaultGreetingMatch[1] : '',
    AI_ASSESSMENT_PROMPT: aiAssessmentMatch ? aiAssessmentMatch[1] : ''
  };
}

async function main() {
  try {
    console.log('Starting to seed the database...');
    
    // Read prompts from file
    const prompts = readPromptFile();
    console.log('Read prompts from file');
    
    if (!prompts.PSYCHO_ONCOLOGY_ASSESSMENT_PROMPT || 
        !prompts.DEFAULT_GREETING_PROMPT || 
        !prompts.AI_ASSESSMENT_PROMPT) {
      throw new Error('Failed to extract prompts from file');
    }

    // Create prompt types
    const psychoOncologyType = await prisma.promptType.upsert({
      where: { name: 'PSYCHO_ONCOLOGY_ASSESSMENT' },
      update: {},
      create: {
        name: 'PSYCHO_ONCOLOGY_ASSESSMENT',
        description: 'Prompt for conducting mental health assessments for cancer patients'
      }
    });
    
    const defaultGreetingType = await prisma.promptType.upsert({
      where: { name: 'DEFAULT_GREETING' },
      update: {},
      create: {
        name: 'DEFAULT_GREETING',
        description: 'Default greeting prompt for general-purpose conversations'
      }
    });
    
    const aiAssessmentType = await prisma.promptType.upsert({
      where: { name: 'AI_ASSESSMENT' },
      update: {},
      create: {
        name: 'AI_ASSESSMENT',
        description: 'Prompt for analyzing conversation transcripts'
      }
    });
    
    console.log('Created prompt types');
    
    // Deactivate all existing versions
    await prisma.promptVersion.updateMany({
      where: {
        promptTypeId: {
          in: [
            psychoOncologyType.id,
            defaultGreetingType.id,
            aiAssessmentType.id
          ]
        }
      },
      data: {
        isActive: false
      }
    });
    
    // Create initial versions
    const psychoOncologyVersion = await prisma.promptVersion.create({
      data: {
        promptTypeId: psychoOncologyType.id,
        versionName: 'Original',
        description: 'Initial implementation',
        content: prompts.PSYCHO_ONCOLOGY_ASSESSMENT_PROMPT,
        author: 'System',
        isActive: true
      }
    });
    
    const defaultGreetingVersion = await prisma.promptVersion.create({
      data: {
        promptTypeId: defaultGreetingType.id,
        versionName: 'Original',
        description: 'Initial implementation',
        content: prompts.DEFAULT_GREETING_PROMPT,
        author: 'System',
        isActive: true
      }
    });
    
    const aiAssessmentVersion = await prisma.promptVersion.create({
      data: {
        promptTypeId: aiAssessmentType.id,
        versionName: 'Original',
        description: 'Initial implementation',
        content: prompts.AI_ASSESSMENT_PROMPT,
        author: 'System',
        isActive: true
      }
    });
    
    console.log('Created prompt versions');
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .then(() => console.log('Seeding complete'))
  .catch((e) => {
    console.error('Error in seed script:', e);
    process.exit(1);
  }); 