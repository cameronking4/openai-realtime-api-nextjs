import { prisma } from './prisma';

// Cache for active prompts to reduce database queries
let promptCache: Record<string, { content: string; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get the active prompt for a given prompt type
 * @param promptTypeName The name of the prompt type
 * @returns The content of the active prompt
 */
export async function getActivePrompt(promptTypeName: string): Promise<string> {
  // Check cache first
  const cacheKey = `active:${promptTypeName}`;
  const cachedPrompt = promptCache[cacheKey];
  
  if (cachedPrompt && Date.now() - cachedPrompt.timestamp < CACHE_TTL) {
    console.log(`Using cached prompt for ${promptTypeName}`);
    return cachedPrompt.content;
  }
  
  console.log(`Fetching active prompt for ${promptTypeName} from database`);
  
  // Fetch from database if not in cache or cache expired
  const promptType = await prisma.promptType.findFirst({
    where: { name: promptTypeName },
    include: {
      versions: {
        where: { isActive: true },
        orderBy: { updatedAt: 'desc' },
        take: 1
      }
    }
  });
  
  if (!promptType || promptType.versions.length === 0) {
    console.error(`No active prompt found for type: ${promptTypeName}`);
    throw new Error(`No active prompt found for type: ${promptTypeName}`);
  }
  
  const content = promptType.versions[0].content;
  
  // Update cache
  promptCache[cacheKey] = {
    content,
    timestamp: Date.now()
  };
  
  return content;
}

/**
 * Get all prompt types with their active versions
 * @returns Array of prompt types with their active versions
 */
export async function getAllPromptTypes() {
  return prisma.promptType.findMany({
    include: {
      versions: {
        where: { isActive: true },
        take: 1
      }
    }
  });
}

/**
 * Get all versions of a prompt type
 * @param promptTypeId The ID of the prompt type
 * @returns Array of prompt versions
 */
export async function getPromptVersions(promptTypeId: number) {
  return prisma.promptVersion.findMany({
    where: { promptTypeId },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Create a new prompt version
 * @param data The prompt version data
 * @returns The created prompt version
 */
export async function createPromptVersion(data: {
  promptTypeId: number;
  versionName: string;
  description?: string;
  content: string;
  author?: string;
  isActive?: boolean;
}) {
  // If this version is active, deactivate all other versions
  if (data.isActive) {
    await prisma.promptVersion.updateMany({
      where: { promptTypeId: data.promptTypeId },
      data: { isActive: false }
    });
    
    // Clear cache for this prompt type
    clearPromptCache(await getPromptTypeName(data.promptTypeId));
  }
  
  return prisma.promptVersion.create({
    data
  });
}

/**
 * Activate a prompt version
 * @param versionId The ID of the version to activate
 * @returns The activated prompt version
 */
export async function activatePromptVersion(versionId: number) {
  // Get the prompt type ID for this version
  const version = await prisma.promptVersion.findUnique({
    where: { id: versionId }
  });
  
  if (!version) {
    throw new Error(`Prompt version not found: ${versionId}`);
  }
  
  // Deactivate all versions for this prompt type
  await prisma.promptVersion.updateMany({
    where: { promptTypeId: version.promptTypeId },
    data: { isActive: false }
  });
  
  // Activate the selected version
  const activatedVersion = await prisma.promptVersion.update({
    where: { id: versionId },
    data: { isActive: true }
  });
  
  // Clear cache for this prompt type
  clearPromptCache(await getPromptTypeName(version.promptTypeId));
  
  return activatedVersion;
}

/**
 * Get the name of a prompt type by ID
 * @param promptTypeId The ID of the prompt type
 * @returns The name of the prompt type
 */
async function getPromptTypeName(promptTypeId: number): Promise<string> {
  const promptType = await prisma.promptType.findUnique({
    where: { id: promptTypeId }
  });
  
  return promptType?.name || '';
}

/**
 * Clear the prompt cache
 * @param promptTypeName Optional prompt type name to clear only that cache
 */
export function clearPromptCache(promptTypeName?: string) {
  if (promptTypeName) {
    delete promptCache[`active:${promptTypeName}`];
    console.log(`Cleared cache for prompt type: ${promptTypeName}`);
  } else {
    promptCache = {};
    console.log('Cleared all prompt caches');
  }
} 