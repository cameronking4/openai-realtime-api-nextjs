import { prisma } from './prisma';

// Define Persona type to match the Prisma schema
export type Persona = {
  id: number;
  name: string;
  age: number;
  gender: string;
  description?: string | null;
  cancerType: string;
  cancerStage: string;
  diagnosisDate?: Date | null;
  treatmentStatus: string;
  psychologicalProfile: any;
  communicationStyle: any;
  background?: any;
  behavioralPatterns?: any;
  personalConcerns?: any;
  physicalSymptoms?: any;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  tags: string[];
};

// Type for persona creation with optional fields
export type PersonaCreateInput = {
  name?: string;
  age: number;
  gender: string;
  description?: string;
  cancerType: string;
  cancerStage: string;
  diagnosisDate?: Date;
  treatmentStatus: string;
  psychologicalProfile: any;
  communicationStyle: any;
  background?: any;
  behavioralPatterns?: any;
  personalConcerns?: any;
  physicalSymptoms?: any;
  tags?: string[];
};

// Type for persona update
export type PersonaUpdateInput = Partial<PersonaCreateInput> & {
  isArchived?: boolean;
};

// Type for persona generation options
export type PersonaGenerationOptions = {
  count: number;
  cancerType?: string;
  psychologicalFocus?: string;
  communicationStyle?: string;
  ageRange?: { min: number; max: number };
  gender?: string;
};

// Get all personas (with optional filtering)
export async function getPersonas(options?: {
  isArchived?: boolean;
  cancerType?: string;
  tags?: string[];
  searchTerm?: string;
}) {
  const { isArchived = false, cancerType, tags, searchTerm } = options || {};
  
  return prisma.persona.findMany({
    where: {
      isArchived,
      ...(cancerType && { cancerType }),
      ...(tags && tags.length > 0 && { tags: { hasEvery: tags } }),
      ...(searchTerm && {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { cancerType: { contains: searchTerm, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Get a single persona by ID
export async function getPersonaById(id: number) {
  return prisma.persona.findUnique({
    where: { id },
  });
}

// Create a new persona
export async function createPersona(data: PersonaCreateInput) {
  return prisma.persona.create({
    data: {
      name: data.name || 'Unnamed Patient',
      age: data.age,
      gender: data.gender,
      description: data.description,
      cancerType: data.cancerType,
      cancerStage: data.cancerStage,
      diagnosisDate: data.diagnosisDate,
      treatmentStatus: data.treatmentStatus,
      psychologicalProfile: data.psychologicalProfile,
      communicationStyle: data.communicationStyle,
      background: data.background,
      behavioralPatterns: data.behavioralPatterns,
      personalConcerns: data.personalConcerns,
      physicalSymptoms: data.physicalSymptoms,
      tags: data.tags || [],
    },
  });
}

// Update an existing persona
export async function updatePersona(id: number, data: PersonaUpdateInput) {
  return prisma.persona.update({
    where: { id },
    data,
  });
}

// Archive a persona (soft delete)
export async function archivePersona(id: number) {
  return prisma.persona.update({
    where: { id },
    data: { isArchived: true },
  });
}

// Permanently delete a persona
export async function deletePersona(id: number) {
  return prisma.persona.delete({
    where: { id },
  });
}

// Generate a realistic name based on age, gender, and cancer type
export async function generatePersonaName(age: number, gender: string): Promise<string> {
  // In a real implementation, this would call an LLM API
  // For now, we'll use a simple mock implementation
  
  const maleFirstNames = ['James', 'Robert', 'John', 'Michael', 'William', 'David', 'Richard', 'Joseph', 'Thomas', 'Charles'];
  const femaleFirstNames = ['Mary', 'Patricia', 'Jennifer', 'Linda', 'Elizabeth', 'Barbara', 'Susan', 'Jessica', 'Sarah', 'Karen'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  
  const firstNames = gender.toLowerCase() === 'male' ? maleFirstNames : femaleFirstNames;
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return `${firstName} ${lastName}`;
}

// Generate a realistic description for a persona
export async function generatePersonaDescription(persona: Partial<Persona>): Promise<string> {
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key not found, cannot generate description');
    throw new Error('OpenAI API key not found. Please add your OpenAI API key to the .env.local file.');
  }
  
  // Initialize OpenAI client using direct OpenAI SDK
  const OpenAI = require('openai');
  
  // Clean the API key by removing any whitespace, newlines, and quotes
  const apiKey = process.env.OPENAI_API_KEY?.replace(/[\s"']+/g, '');
  
  const openai = new OpenAI({
    apiKey: apiKey,
  });
  
  // Format diagnosis date
  let diagnosisDateText = 'recently';
  if (persona.diagnosisDate) {
    const diagnosisDate = new Date(persona.diagnosisDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - diagnosisDate.getFullYear()) * 12 + 
                       (now.getMonth() - diagnosisDate.getMonth());
    
    if (monthsDiff < 1) {
      diagnosisDateText = 'within the last month';
    } else if (monthsDiff === 1) {
      diagnosisDateText = 'about a month ago';
    } else {
      diagnosisDateText = `about ${monthsDiff} months ago`;
    }
  }
  
  // Create a prompt for generating the description
  const prompt = `
    Create a detailed and empathetic description for a cancer patient persona with the following characteristics:
    
    Name: ${persona.name || 'Unknown'}
    Age: ${persona.age || 'Unknown'}
    Gender: ${persona.gender || 'Unknown'}
    Cancer Type: ${persona.cancerType || 'Unknown'}
    Cancer Stage: ${persona.cancerStage || 'Unknown'}
    Treatment Status: ${persona.treatmentStatus || 'Unknown'}
    Diagnosis Date: ${diagnosisDateText}
    
    Psychological Profile:
    - Anxiety Level (1-10): ${persona.psychologicalProfile?.anxiety || 5}
    - Depression Level (1-10): ${persona.psychologicalProfile?.depression || 5}
    - Distress Level (1-10): ${persona.psychologicalProfile?.distress || 5}
    - Self-Efficacy (1-10): ${persona.psychologicalProfile?.selfEfficacy || 5}
    - Support Network Strength (1-10): ${persona.psychologicalProfile?.supportNetworkStrength || 5}
    
    Communication Style:
    - Articulation Level (1-10): ${persona.communicationStyle?.articulationLevel || 5}
    - Openness (1-10): ${persona.communicationStyle?.openness || 5}
    - Directness (1-10): ${persona.communicationStyle?.directness || 5}
    - Emotional Expression (1-10): ${persona.communicationStyle?.emotionalExpression || 5}
    
    Behavioral Patterns:
    ${persona.behavioralPatterns ? persona.behavioralPatterns.map((pattern: string) => `- ${pattern}`).join('\n    ') : '- Not specified'}
    
    Personal Concerns:
    ${persona.personalConcerns ? persona.personalConcerns.map((concern: string) => `- ${concern}`).join('\n    ') : '- Not specified'}
    
    The description should be 3-4 paragraphs long and include:
    1. A brief overview of their cancer journey and current situation, including when they were diagnosed
    2. Their emotional and psychological state
    3. How they typically communicate about their condition
    4. Their main concerns, fears, and hopes
    
    Write in third person as if describing the persona to someone else. Be empathetic, realistic, and nuanced.
  `;
  
  try {
    // Generate the description using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert in creating realistic patient personas for healthcare simulations. Your descriptions are empathetic, detailed, and psychologically nuanced."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });
    
    // Extract the generated description
    const description = completion.choices[0]?.message?.content?.trim();
    
    if (!description) {
      console.error('No description generated by OpenAI');
      throw new Error('OpenAI did not generate a description. Please try again.');
    }
    
    return description;
  } catch (error) {
    console.error('Error generating description with OpenAI:', error);
    throw new Error(`Failed to generate description with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key and internet connection.`);
  }
}

// Generate realistic personas using LLM
export async function generatePersonas(options: PersonaGenerationOptions): Promise<PersonaCreateInput[]> {
  const { count, cancerType, psychologicalFocus, communicationStyle, ageRange, gender } = options;
  
  console.log('Starting persona generation with options:', options);
  
  // Check if OpenAI API key is available
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key not found in environment variables');
    throw new Error('OPENAI_API_KEY not found. Please add your OpenAI API key to the .env.local file.');
  }
  
  // Check if OpenAI API key is the placeholder value
  if (process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
    console.error('OpenAI API key is set to the placeholder value');
    throw new Error('OpenAI API key is set to the placeholder value. Please replace it with your actual API key in the .env.local file.');
  }
  
  console.log('Initializing OpenAI client');
  
  // Initialize OpenAI client
  const OpenAI = require('openai');
  
  // Clean the API key by removing any whitespace, newlines, and quotes
  const apiKey = process.env.OPENAI_API_KEY?.replace(/[\s"']+/g, '');
  console.log('API key length after cleaning:', apiKey?.length);
  
  const openai = new OpenAI({
    apiKey: apiKey,
  });
  
  // Test the API key with a simple request
  try {
    console.log('Testing OpenAI API key with a simple request...');
    const testResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello, this is a test." }],
      max_tokens: 5
    });
    console.log('API key test successful:', !!testResponse.choices[0]?.message?.content);
  } catch (testError) {
    console.error('API key test failed:', testError);
    throw new Error(`OpenAI API key test failed: ${testError instanceof Error ? testError.message : 'Unknown error'}. Please check your API key.`);
  }
  
  // Create a prompt for generating personas
  const prompt = `
    Generate ${count} realistic cancer patient personas with the following constraints:
    
    ${cancerType ? `Cancer Type: ${cancerType}` : 'Varied cancer types'}
    ${psychologicalFocus ? `Psychological Focus: ${psychologicalFocus}` : 'Varied psychological profiles'}
    ${communicationStyle ? `Communication Style: ${communicationStyle}` : 'Varied communication styles'}
    ${ageRange ? `Age Range: ${ageRange.min}-${ageRange.max}` : 'Varied ages'}
    ${gender ? `Gender: ${gender}` : 'Varied genders'}
    
    Each persona should include:
    1. Basic demographics (name, age, gender)
    2. Cancer details (type, stage, treatment status)
    3. Psychological profile (anxiety, depression, distress, self-efficacy, support network strength on a scale of 1-10)
    4. Communication style (articulation level, openness, directness, emotional expression on a scale of 1-10)
    5. Background (family status, occupation, important life events, support system)
    6. Behavioral patterns (4-6 specific behaviors related to their condition)
    7. Personal concerns (3-5 specific concerns related to their condition)
    8. Physical symptoms (5-8 specific symptoms or side effects related to their cancer type, stage, and treatment status)
    
    Important guidelines:
    - Create coherent personas where all attributes make sense together
    - Ensure physical symptoms accurately reflect the cancer type, stage, and treatment status
    - Not all patients should have all possible symptoms - be selective and realistic
    - Include both cancer symptoms and treatment side effects where appropriate
    - Adjust psychological attributes to realistically match the physical condition
    - Ensure demographic details are appropriate for the cancer type (e.g., age distributions, gender prevalence)
    - Create diverse personas that represent the real cancer population
    
    IMPORTANT: You MUST format your response as a valid JSON object with a "personas" array containing the generated personas.
    
    The JSON structure MUST be:
    {
      "personas": [
        {
          "name": "string",
          "age": number,
          "gender": "string",
          "cancerType": "string",
          "cancerStage": "string",
          "treatmentStatus": "string",
          "psychologicalProfile": {
            "anxiety": number,
            "depression": number,
            "distress": number,
            "selfEfficacy": number,
            "supportNetworkStrength": number
          },
          "communicationStyle": {
            "articulationLevel": number,
            "openness": number,
            "directness": number,
            "emotionalExpression": number
          },
          "background": {
            "familyStatus": "string",
            "occupation": "string",
            "importantLifeEvents": ["string"],
            "supportSystem": ["string"]
          },
          "behavioralPatterns": ["string"],
          "personalConcerns": ["string"],
          "physicalSymptoms": [
            {
              "name": "string",
              "severity": number,
              "relatedTo": "cancer|treatment|both",
              "description": "string"
            }
          ],
          "tags": ["string"]
        }
      ]
    }
    
    Do not include any explanations or text outside of the JSON object. The response must be a valid JSON object that can be parsed with JSON.parse().
  `;
  
  console.log('Sending request to OpenAI with prompt:', prompt.substring(0, 200) + '...');
  
  try {
    // Generate personas using Vercel AI SDK
    console.log('About to call OpenAI API with model: gpt-4o');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: "You are an expert in oncology and clinical psychology, specializing in creating realistic patient personas for healthcare simulations. Your personas are medically accurate, psychologically nuanced, and demographically representative of the real cancer population. You MUST return a valid JSON object with a 'personas' array containing the generated personas."
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });
    
    console.log('Received response from OpenAI with status:', completion?.choices?.length ? 'Success' : 'No choices returned');
    
    // Extract and parse the generated personas
    const resultText = completion.choices[0]?.message?.content?.trim() || '{"personas":[]}';
    console.log('Raw response content length:', resultText.length);
    console.log('Raw response content start:', resultText.substring(0, 200) + '...');
    console.log('Raw response content end:', '...' + resultText.substring(resultText.length - 200));
    
    try {
      // Ensure we have valid JSON
      if (!resultText || resultText === '') {
        console.error('Empty response from OpenAI');
        throw new Error('OpenAI returned an empty response');
      }
      
      // Try to parse the JSON
      let result;
      try {
        result = JSON.parse(resultText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Invalid JSON received:', resultText);
        throw new Error('Failed to parse OpenAI response as JSON');
      }
      
      console.log('Parsed result successfully. Result structure:', Object.keys(result).join(', '));
      
      // Check if we have personas array
      if (!result.personas) {
        console.error('No personas array in result:', result);
        
        // If there's no personas array but there's something that looks like personas at the top level
        if (Array.isArray(result) && result.length > 0 && result[0].name) {
          console.log('Found personas at top level, using those instead');
          result = { personas: result };
        } else {
          throw new Error('OpenAI response did not include a personas array');
        }
      }
      
      console.log('Number of personas in result:', result.personas?.length || 0);
      
      // Check if we have personas
      if (!result.personas || result.personas.length === 0) {
        console.error('No personas were returned from OpenAI');
        throw new Error('OpenAI did not generate any personas. Please try again or check your API key.');
      }
      
      // Process the personas to ensure they have all required fields
      const personas = await Promise.all(result.personas.map(async (persona: any) => {
        console.log('Processing persona:', persona.name);
        
        // Generate a diagnosis date within the last 6 months
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        const randomTimestamp = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
        persona.diagnosisDate = new Date(randomTimestamp);
        
        try {
          // Generate description using OpenAI (synchronously with await)
          persona.description = await generatePersonaDescription(persona);
          console.log(`Generated description for ${persona.name}`);
        } catch (error) {
          console.error('Error generating persona description:', error);
          // We don't fall back here, just log the error and continue
        }
        
        // Ensure tags are properly set
        persona.tags = persona.tags || [
          persona.cancerType,
          persona.cancerStage,
          persona.treatmentStatus,
          persona.age < 40 ? 'young-adult' : persona.age < 65 ? 'middle-aged' : 'elderly',
          persona.gender.toLowerCase()
        ];
        
        return persona;
      }));
      
      console.log(`Successfully generated ${personas.length} personas`);
      return personas;
    } catch (error) {
      console.error('Error parsing result from OpenAI:', error);
      throw new Error('Error parsing result from OpenAI');
    }
  } catch (error) {
    console.error('Error generating personas with OpenAI:', error);
    
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // If it's an OpenAI API error, log more details
      if ('status' in error) {
        console.error('OpenAI API status:', (error as any).status);
      }
      if ('headers' in error) {
        console.error('OpenAI API response headers:', (error as any).headers);
      }
    }
    
    throw new Error(`Failed to generate personas with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key, internet connection, and try again.`);
  }
}

// Mock implementation for persona generation (used as fallback)
async function generateMockPersonas(options: PersonaGenerationOptions): Promise<PersonaCreateInput[]> {
  // This is the original implementation, renamed to be used as a fallback
  const { count, cancerType, psychologicalFocus, communicationStyle, ageRange, gender } = options;
  
  // Cancer type age distributions (based on epidemiological data)
  const cancerAgeDistributions: Record<string, { min: number; max: number; peak: number }> = {
    'Breast cancer': { min: 30, max: 85, peak: 62 },
    'Lung cancer': { min: 45, max: 90, peak: 70 },
    'Colorectal cancer': { min: 40, max: 85, peak: 67 },
    'Prostate cancer': { min: 50, max: 90, peak: 66 },
    'Melanoma': { min: 25, max: 80, peak: 65 },
    'Ovarian cancer': { min: 40, max: 80, peak: 63 },
    'Pancreatic cancer': { min: 50, max: 85, peak: 70 },
    'Leukemia': { min: 20, max: 85, peak: 67 },
    'Lymphoma': { min: 20, max: 80, peak: 60 },
    'Bladder cancer': { min: 55, max: 85, peak: 73 },
  };
  
  // Cancer gender distributions
  const cancerGenderDistributions: Record<string, { male: number; female: number }> = {
    'Breast cancer': { male: 0.01, female: 0.99 },
    'Lung cancer': { male: 0.52, female: 0.48 },
    'Colorectal cancer': { male: 0.57, female: 0.43 },
    'Prostate cancer': { male: 1, female: 0 },
    'Melanoma': { male: 0.55, female: 0.45 },
    'Ovarian cancer': { male: 0, female: 1 },
    'Pancreatic cancer': { male: 0.52, female: 0.48 },
    'Leukemia': { male: 0.57, female: 0.43 },
    'Lymphoma': { male: 0.55, female: 0.45 },
    'Bladder cancer': { male: 0.75, female: 0.25 },
  };
  
  const personas: PersonaCreateInput[] = [];
  
  for (let i = 0; i < count; i++) {
    // Determine cancer type
    const cancerTypes = Object.keys(cancerAgeDistributions);
    const selectedCancerType = cancerType || cancerTypes[Math.floor(Math.random() * cancerTypes.length)];
    
    // Determine gender based on cancer type distribution
    const genderDistribution = cancerGenderDistributions[selectedCancerType] || { male: 0.5, female: 0.5 };
    const selectedGender = gender || (Math.random() < genderDistribution.male ? 'Male' : 'Female');
    
    // Determine age based on cancer type distribution
    const ageDistribution = cancerAgeDistributions[selectedCancerType] || { min: 30, max: 85, peak: 65 };
    const minAge = ageRange?.min || ageDistribution.min;
    const maxAge = ageRange?.max || ageDistribution.max;
    
    // Generate age with bell curve distribution around peak age
    const u1 = 1 - Math.random();
    const u2 = 1 - Math.random();
    const randStdNormal = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const stdDev = (maxAge - minAge) / 4;
    let age = Math.round(randStdNormal * stdDev + ageDistribution.peak);
    age = Math.max(minAge, Math.min(maxAge, age));
    
    // Generate cancer stage with distribution
    const stages = ['Stage I', 'Stage II', 'Stage III', 'Stage IV'];
    const stageWeights = [0.25, 0.35, 0.25, 0.15];
    const stageIndex = weightedRandom(stageWeights);
    const cancerStage = stages[stageIndex];
    
    // Generate treatment status based on stage
    const treatmentStatuses = ['pre-treatment', 'in-treatment', 'post-treatment', 'palliative'];
    const treatmentStatusWeights = 
      cancerStage === 'Stage IV' ? [0.1, 0.4, 0.1, 0.4] :
      cancerStage === 'Stage III' ? [0.2, 0.5, 0.2, 0.1] :
      cancerStage === 'Stage II' ? [0.2, 0.5, 0.3, 0] :
      [0.2, 0.4, 0.4, 0];
    const treatmentStatusIndex = weightedRandom(treatmentStatusWeights);
    const treatmentStatus = treatmentStatuses[treatmentStatusIndex];
    
    // Generate psychological profile
    let anxiety = Math.floor(Math.random() * 10) + 1;
    let depression = Math.floor(Math.random() * 10) + 1;
    let distress = Math.floor(Math.random() * 10) + 1;
    let selfEfficacy = Math.floor(Math.random() * 10) + 1;
    let supportNetworkStrength = Math.floor(Math.random() * 10) + 1;
    
    // Adjust based on psychological focus
    if (psychologicalFocus === 'high anxiety') {
      anxiety = Math.min(10, anxiety + 3);
      distress = Math.min(10, distress + 2);
    } else if (psychologicalFocus === 'moderate depression') {
      depression = Math.min(10, depression + 3);
      selfEfficacy = Math.max(1, selfEfficacy - 2);
    } else if (psychologicalFocus === 'low self-efficacy') {
      selfEfficacy = Math.max(1, selfEfficacy - 3);
      anxiety = Math.min(10, anxiety + 1);
    } else if (psychologicalFocus === 'strong support network') {
      supportNetworkStrength = Math.min(10, supportNetworkStrength + 3);
      depression = Math.max(1, depression - 2);
    }
    
    // Adjust based on cancer stage
    if (cancerStage === 'Stage IV') {
      anxiety = Math.min(10, anxiety + 2);
      depression = Math.min(10, depression + 2);
      distress = Math.min(10, distress + 2);
    }
    
    // Generate communication style
    let articulationLevel = Math.floor(Math.random() * 10) + 1;
    let openness = Math.floor(Math.random() * 10) + 1;
    let directness = Math.floor(Math.random() * 10) + 1;
    let emotionalExpression = Math.floor(Math.random() * 10) + 1;
    
    // Adjust based on communication style preference
    if (communicationStyle === 'reserved') {
      openness = Math.max(1, openness - 3);
      emotionalExpression = Math.max(1, emotionalExpression - 3);
    } else if (communicationStyle === 'open') {
      openness = Math.min(10, openness + 3);
      emotionalExpression = Math.min(10, emotionalExpression + 2);
    } else if (communicationStyle === 'analytical') {
      articulationLevel = Math.min(10, articulationLevel + 3);
      emotionalExpression = Math.max(1, emotionalExpression - 2);
      directness = Math.min(10, directness + 2);
    } else if (communicationStyle === 'emotional') {
      emotionalExpression = Math.min(10, emotionalExpression + 3);
      openness = Math.min(10, openness + 2);
    } else if (communicationStyle === 'avoidant') {
      directness = Math.max(1, directness - 3);
      openness = Math.max(1, openness - 2);
    }
    
    // Create persona object
    const persona: PersonaCreateInput = {
      age,
      gender: selectedGender,
      cancerType: selectedCancerType,
      cancerStage,
      treatmentStatus,
      psychologicalProfile: {
        anxiety,
        depression,
        distress,
        selfEfficacy,
        supportNetworkStrength
      },
      communicationStyle: {
        articulationLevel,
        openness,
        directness,
        emotionalExpression
      },
      // Generate diagnosis date within the last 6 months
      diagnosisDate: (() => {
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        const randomTimestamp = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
        return new Date(randomTimestamp);
      })(),
      // Generate tags based on characteristics
      tags: [
        selectedCancerType,
        cancerStage,
        treatmentStatus,
        anxiety > 7 ? 'high-anxiety' : anxiety < 4 ? 'low-anxiety' : 'moderate-anxiety',
        depression > 7 ? 'high-depression' : depression < 4 ? 'low-depression' : 'moderate-depression',
        supportNetworkStrength > 7 ? 'strong-support' : supportNetworkStrength < 4 ? 'weak-support' : 'moderate-support',
        age < 40 ? 'young-adult' : age < 65 ? 'middle-aged' : 'elderly',
        selectedGender.toLowerCase()
      ]
    };
    
    // Generate name
    persona.name = await generatePersonaName(age, selectedGender);
    
    // Generate background information
    persona.background = generateBackground(persona);
    
    // Generate behavioral patterns
    persona.behavioralPatterns = generateBehavioralPatterns(persona);
    
    // Generate personal concerns
    persona.personalConcerns = generatePersonalConcerns(persona);
    
    // Generate physical symptoms
    persona.physicalSymptoms = generatePhysicalSymptoms(persona);
    
    // Generate description
    persona.description = await generatePersonaDescription(persona as Partial<Persona>);
    
    personas.push(persona);
  }
  
  return personas;
}

// Generate background information
function generateBackground(persona: PersonaCreateInput): any {
  const { age, gender, psychologicalProfile } = persona;
  const psych = psychologicalProfile as any;
  
  // Family status options based on age
  const familyStatusOptions = [
    'Single',
    'Married with no children',
    'Married with young children',
    'Married with adult children',
    'Divorced',
    'Widowed',
    'In a long-term relationship'
  ];
  
  // Weight family status options based on age
  let familyStatusWeights;
  if (age < 35) {
    familyStatusWeights = [0.4, 0.2, 0.2, 0, 0.1, 0, 0.1];
  } else if (age < 50) {
    familyStatusWeights = [0.1, 0.1, 0.4, 0.1, 0.2, 0.05, 0.05];
  } else if (age < 65) {
    familyStatusWeights = [0.05, 0.1, 0.1, 0.4, 0.2, 0.1, 0.05];
  } else {
    familyStatusWeights = [0.05, 0.1, 0, 0.4, 0.15, 0.25, 0.05];
  }
  
  const familyStatusIndex = weightedRandom(familyStatusWeights);
  const familyStatus = familyStatusOptions[familyStatusIndex];
  
  // Occupation options
  const occupationOptions = [
    'Retired',
    'Healthcare professional',
    'Teacher/Educator',
    'Business professional',
    'Service industry worker',
    'Skilled tradesperson',
    'Technology professional',
    'Homemaker',
    'Unemployed',
    'Student'
  ];
  
  // Weight occupation options based on age
  let occupationWeights;
  if (age < 25) {
    occupationWeights = [0, 0.05, 0.05, 0.05, 0.2, 0.05, 0.1, 0, 0.1, 0.4];
  } else if (age < 40) {
    occupationWeights = [0, 0.15, 0.15, 0.2, 0.15, 0.15, 0.15, 0.05, 0.05, 0.05];
  } else if (age < 65) {
    occupationWeights = [0.05, 0.15, 0.15, 0.2, 0.15, 0.15, 0.1, 0.1, 0.05, 0];
  } else {
    occupationWeights = [0.7, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0];
  }
  
  const occupationIndex = weightedRandom(occupationWeights);
  const occupation = occupationOptions[occupationIndex];
  
  // Generate important life events
  const lifeEvents = [];
  
  // Add family-related events
  if (familyStatus.includes('Married')) {
    lifeEvents.push(`Married ${Math.floor(Math.random() * 30) + 5} years ago`);
    
    if (familyStatus.includes('children')) {
      const childCount = Math.floor(Math.random() * 3) + 1;
      lifeEvents.push(`Has ${childCount} ${familyStatus.includes('young') ? 'young' : 'adult'} ${childCount === 1 ? 'child' : 'children'}`);
      
      if (familyStatus.includes('adult') && Math.random() > 0.5) {
        lifeEvents.push(`Birth of first grandchild ${Math.floor(Math.random() * 5) + 1} years ago`);
      }
    }
  } else if (familyStatus === 'Divorced') {
    lifeEvents.push(`Divorced ${Math.floor(Math.random() * 10) + 2} years ago`);
  } else if (familyStatus === 'Widowed') {
    lifeEvents.push(`Lost spouse ${Math.floor(Math.random() * 10) + 1} years ago`);
  }
  
  // Add career-related events
  if (occupation === 'Retired') {
    lifeEvents.push(`Retirement ${Math.floor(Math.random() * 10) + 1} years ago`);
  } else if (occupation !== 'Unemployed' && occupation !== 'Student' && Math.random() > 0.5) {
    lifeEvents.push(`Career change ${Math.floor(Math.random() * 10) + 2} years ago`);
  }
  
  // Add health-related events (besides cancer)
  if (Math.random() > 0.7) {
    const healthEvents = [
      'Heart attack',
      'Major surgery',
      'Chronic condition diagnosis',
      'Serious accident',
      'Mental health crisis'
    ];
    const healthEvent = healthEvents[Math.floor(Math.random() * healthEvents.length)];
    lifeEvents.push(`${healthEvent} ${Math.floor(Math.random() * 10) + 2} years ago`);
  }
  
  // Generate support system
  const supportSystem = [];
  
  // Add family support based on family status
  if (familyStatus.includes('Married')) {
    supportSystem.push(`Spouse (${Math.random() > 0.7 ? 'primary caregiver' : 'supportive'})`);
  }
  
  if (familyStatus.includes('children')) {
    if (familyStatus.includes('adult')) {
      supportSystem.push(`Adult ${Math.random() > 0.5 ? 'daughter' : 'son'} (${Math.random() > 0.5 ? 'visits regularly' : 'calls frequently'})`);
    } else {
      supportSystem.push(`Young ${Math.random() > 0.5 ? 'daughter' : 'son'}`);
    }
  }
  
  // Add other support based on support network strength
  const supportStrength = psych.supportNetworkStrength || 5;
  
  if (supportStrength > 3) {
    supportSystem.push(`${Math.random() > 0.5 ? 'Close friend' : 'Sibling'} (${Math.random() > 0.5 ? 'emotionally supportive' : 'helps with practical needs'})`);
  }
  
  if (supportStrength > 5) {
    supportSystem.push(`${Math.random() > 0.5 ? 'Neighbor' : 'Coworker'} (helps with ${Math.random() > 0.5 ? 'transportation' : 'meals'})`);
  }
  
  if (supportStrength > 7) {
    supportSystem.push(`${Math.random() > 0.5 ? 'Church' : 'Community'} group (provides social support)`);
  }
  
  return {
    familyStatus,
    occupation,
    importantLifeEvents: lifeEvents,
    supportSystem
  };
}

// Generate behavioral patterns
function generateBehavioralPatterns(persona: PersonaCreateInput): string[] {
  const { psychologicalProfile, communicationStyle } = persona;
  const psych = psychologicalProfile as any;
  const comm = communicationStyle as any;
  
  const patterns = [];
  
  // Anxiety-related patterns
  if (psych.anxiety > 7) {
    patterns.push('Frequently asks for reassurance');
    patterns.push('Researches symptoms extensively online');
  } else if (psych.anxiety < 4) {
    patterns.push('Appears calm when discussing diagnosis');
    patterns.push('Rarely expresses worry about the future');
  }
  
  // Depression-related patterns
  if (psych.depression > 7) {
    patterns.push('Often cancels or reschedules appointments');
    patterns.push('Reports difficulty sleeping and loss of appetite');
  } else if (psych.depression < 4) {
    patterns.push('Maintains regular daily routines despite diagnosis');
    patterns.push('Actively engages in self-care activities');
  }
  
  // Communication-related patterns
  if (comm.openness > 7) {
    patterns.push('Readily shares personal details and emotions');
    patterns.push('Asks direct questions about prognosis');
  } else if (comm.openness < 4) {
    patterns.push('Reluctant to discuss emotional impact of diagnosis');
    patterns.push('Changes subject when conversation becomes too personal');
  }
  
  if (comm.articulationLevel > 7) {
    patterns.push('Takes notes during medical appointments');
    patterns.push('Uses medical terminology accurately');
  } else if (comm.articulationLevel < 4) {
    patterns.push('Struggles to explain symptoms clearly');
    patterns.push('Relies on family members to communicate with medical team');
  }
  
  // Self-efficacy related patterns
  if (psych.selfEfficacy > 7) {
    patterns.push('Actively participates in treatment decisions');
    patterns.push('Follows treatment plan meticulously');
  } else if (psych.selfEfficacy < 4) {
    patterns.push('Defers to doctors for all decisions');
    patterns.push('Expresses doubt about ability to manage treatment');
  }
  
  // Randomly select 4-6 patterns to avoid overwhelming detail
  const selectedPatterns = [];
  const patternCount = Math.floor(Math.random() * 3) + 4; // 4-6 patterns
  
  while (selectedPatterns.length < patternCount && patterns.length > 0) {
    const index = Math.floor(Math.random() * patterns.length);
    selectedPatterns.push(patterns[index]);
    patterns.splice(index, 1);
  }
  
  return selectedPatterns;
}

// Generate personal concerns
function generatePersonalConcerns(persona: PersonaCreateInput): string[] {
  const { age, gender, cancerType, cancerStage, treatmentStatus, psychologicalProfile } = persona;
  const psych = psychologicalProfile as any;
  
  const concerns = [];
  
  // Treatment-related concerns
  if (treatmentStatus === 'pre-treatment' || treatmentStatus === 'in-treatment') {
    concerns.push(`Worried about ${treatmentStatus === 'pre-treatment' ? 'potential' : 'current'} treatment side effects`);
    
    if (cancerType === 'Breast cancer' || cancerType === 'Prostate cancer') {
      concerns.push(`Concerned about changes to ${gender === 'Male' ? 'sexual function' : 'body image'}`);
    }
  }
  
  // Financial concerns
  if (Math.random() > 0.5) {
    concerns.push('Anxious about medical costs and insurance coverage');
  }
  
  // Family-related concerns
  if (age < 50) {
    concerns.push('Worried about impact on young family');
  } else if (age > 65) {
    concerns.push('Concerned about being a burden to family members');
  }
  
  // Mortality concerns based on stage
  if (cancerStage === 'Stage III' || cancerStage === 'Stage IV') {
    concerns.push('Thinking about mortality and legacy');
    
    if (psych.anxiety > 6) {
      concerns.push('Fearful about disease progression');
    }
  }
  
  // Work-related concerns
  if (age < 65 && treatmentStatus !== 'palliative') {
    concerns.push('Uncertain about returning to work and career impact');
  }
  
  // Quality of life concerns
  if (treatmentStatus === 'post-treatment' || treatmentStatus === 'palliative') {
    concerns.push('Focused on maintaining quality of life');
  }
  
  // Recurrence concerns
  if (treatmentStatus === 'post-treatment') {
    concerns.push('Anxious about possibility of recurrence');
  }
  
  // Randomly select 3-5 concerns
  const selectedConcerns = [];
  const concernCount = Math.floor(Math.random() * 3) + 3; // 3-5 concerns
  
  while (selectedConcerns.length < concernCount && concerns.length > 0) {
    const index = Math.floor(Math.random() * concerns.length);
    selectedConcerns.push(concerns[index]);
    concerns.splice(index, 1);
  }
  
  return selectedConcerns;
}

// Generate physical symptoms based on cancer type, stage, and treatment status
function generatePhysicalSymptoms(persona: PersonaCreateInput): any[] {
  const { cancerType, cancerStage, treatmentStatus } = persona;
  
  // Common symptoms by cancer type
  const cancerSymptoms: Record<string, string[]> = {
    'Breast cancer': ['Breast lump', 'Breast pain', 'Nipple discharge', 'Skin changes', 'Swelling'],
    'Lung cancer': ['Persistent cough', 'Chest pain', 'Shortness of breath', 'Wheezing', 'Hoarseness', 'Coughing up blood'],
    'Colorectal cancer': ['Change in bowel habits', 'Rectal bleeding', 'Abdominal pain', 'Fatigue', 'Unexplained weight loss'],
    'Prostate cancer': ['Urinary frequency', 'Weak urine flow', 'Erectile dysfunction', 'Blood in urine', 'Pelvic discomfort'],
    'Melanoma': ['Changing mole', 'Itching or burning sensation', 'Skin lesion', 'Swollen lymph nodes'],
    'Ovarian cancer': ['Abdominal bloating', 'Pelvic pain', 'Urinary urgency', 'Fatigue', 'Changes in menstruation'],
    'Pancreatic cancer': ['Jaundice', 'Abdominal pain', 'Back pain', 'Weight loss', 'Loss of appetite'],
    'Leukemia': ['Fatigue', 'Frequent infections', 'Easy bruising', 'Bone pain', 'Swollen lymph nodes', 'Nosebleeds'],
    'Lymphoma': ['Swollen lymph nodes', 'Night sweats', 'Unexplained weight loss', 'Itchy skin', 'Fatigue'],
    'Bladder cancer': ['Blood in urine', 'Painful urination', 'Pelvic pain', 'Back pain', 'Frequent urination']
  };
  
  // Common treatment side effects
  const treatmentSideEffects: Record<string, string[]> = {
    'pre-treatment': [],
    'in-treatment': ['Nausea', 'Vomiting', 'Hair loss', 'Fatigue', 'Loss of appetite', 'Mouth sores', 'Skin changes', 'Neuropathy', 'Diarrhea', 'Constipation'],
    'post-treatment': ['Fatigue', 'Pain', 'Lymphedema', 'Memory problems', 'Neuropathy', 'Emotional distress'],
    'palliative': ['Pain', 'Fatigue', 'Shortness of breath', 'Loss of appetite', 'Nausea', 'Constipation']
  };
  
  // Stage-specific symptoms (more severe in later stages)
  const stageSpecificSymptoms: Record<string, string[]> = {
    'Stage I': [],
    'Stage II': ['Mild pain', 'Occasional fatigue'],
    'Stage III': ['Moderate pain', 'Persistent fatigue', 'Weight loss'],
    'Stage IV': ['Severe pain', 'Extreme fatigue', 'Significant weight loss', 'Weakness', 'Confusion']
  };
  
  // Select cancer-specific symptoms
  const specificSymptoms = cancerSymptoms[cancerType] || [];
  const selectedCancerSymptoms = specificSymptoms.filter(() => Math.random() > 0.4);
  
  // Select treatment side effects
  const sideEffects = treatmentSideEffects[treatmentStatus] || [];
  const selectedSideEffects = sideEffects.filter(() => Math.random() > 0.6);
  
  // Select stage-specific symptoms
  const stageSymptoms = stageSpecificSymptoms[cancerStage] || [];
  const selectedStageSymptoms = stageSymptoms.filter(() => Math.random() > 0.3);
  
  // Combine all selected symptoms
  const allSymptoms = [
    ...selectedCancerSymptoms.map(name => ({
      name,
      severity: Math.floor(Math.random() * 10) + 1,
      relatedTo: 'cancer',
      description: `${name} related to ${cancerType}`
    })),
    ...selectedSideEffects.map(name => ({
      name,
      severity: Math.floor(Math.random() * 10) + 1,
      relatedTo: 'treatment',
      description: `${name} as a side effect of treatment`
    })),
    ...selectedStageSymptoms.map(name => ({
      name,
      severity: Math.floor(Math.random() * 10) + 1,
      relatedTo: 'both',
      description: `${name} due to disease progression`
    }))
  ];
  
  // Ensure we have at least 2 symptoms
  if (allSymptoms.length < 2) {
    allSymptoms.push({
      name: 'Fatigue',
      severity: Math.floor(Math.random() * 10) + 1,
      relatedTo: 'both',
      description: 'General fatigue related to condition and treatment'
    });
  }
  
  return allSymptoms;
}

// Helper function for weighted random selection
function weightedRandom(weights: number[]): number {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return i;
    }
  }
  
  return weights.length - 1;
} 