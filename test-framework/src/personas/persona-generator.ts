import { PatientPersona } from '../types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Options for persona generation
 */
export interface PersonaGenerationOptions {
  cancerType?: string;
  psychologicalFocus?: string; // e.g., 'high anxiety', 'depression', 'strong support network'
  communicationStyle?: string; // e.g., 'reserved', 'open', 'detailed', 'avoidant'
  age?: number | { min: number; max: number };
  gender?: string;
  treatmentStatus?: string;
  minProfileScore?: number; // minimum score for psychological aspects (1-10)
  maxProfileScore?: number; // maximum score for psychological aspects (1-10)
}

/**
 * Generator for patient personas
 */
export class PersonaGenerator {
  private basePrompt = `
  You are a medical professional creating realistic personas for cancer patients.
  Generate a detailed patient profile with the following characteristics:
  - Age between 30-80
  - Specific cancer diagnosis and stage
  - Psychological profile (anxiety, depression, etc.)
  - Communication style and behavioral patterns
  - Background and support system
  
  Make this persona realistic and include subtle psychological patterns that would be important 
  for a mental health assessment to detect. Include both strengths and vulnerabilities.
  
  Format your response as a JSON object following this structure exactly:
  {
    "name": "Full Name",
    "age": Number,
    "gender": "Male/Female/Non-binary",
    "diagnosis": {
      "cancerType": "Specific cancer type",
      "stage": "Stage (I-IV or early/advanced)",
      "timeOfDiagnosis": "When diagnosed (e.g., '3 months ago')"
    },
    "treatmentStatus": "One of: pre-treatment, in-treatment, post-treatment, or palliative",
    "psychologicalProfile": {
      "anxiety": Number (1-10 scale),
      "depression": Number (1-10 scale),
      "distress": Number (1-10 scale),
      "selfEfficacy": Number (1-10 scale),
      "supportNetworkStrength": Number (1-10 scale)
    },
    "communication": {
      "articulationLevel": Number (1-10 scale),
      "openness": Number (1-10 scale),
      "directness": Number (1-10 scale),
      "emotionalExpression": Number (1-10 scale)
    },
    "background": {
      "familyStatus": "Brief description",
      "occupation": "Current or former occupation",
      "importantLifeEvents": ["Event 1", "Event 2", "Event 3"],
      "supportSystem": ["Support person/group 1", "Support person/group 2"]
    },
    "behavioralPatterns": ["Pattern 1", "Pattern 2", "Pattern 3"],
    "personalConcerns": ["Concern 1", "Concern 2", "Concern 3"]
  }
  
  When setting psychological profile scores, use this guide:
  - 1-3: Low levels
  - 4-6: Moderate levels
  - 7-10: High levels
  
  For self-efficacy and support network strength, higher scores are positive. 
  For anxiety, depression, and distress, higher scores indicate more severe issues.
  `;

  /**
   * Generate a single patient persona
   */
  async generatePersona(options: PersonaGenerationOptions = {}): Promise<PatientPersona> {
    // In a real implementation, this would call the Claude LLM API
    // For now, we'll simulate it
    
    const simulatedLLMResponse = this.simulateClaudeResponse(options);
    
    // Parse the response into a PatientPersona object
    const parsedPersona = this.parsePersonaFromText(simulatedLLMResponse);
    
    // Add a unique ID
    const persona: PatientPersona = {
      ...parsedPersona,
      id: uuidv4(),
    };
    
    // Save to database (in real implementation)
    // await PersonaDB.savePersona(persona);
    
    return persona;
  }
  
  /**
   * Build the customized prompt based on provided options
   */
  private buildPrompt(options: PersonaGenerationOptions): string {
    let prompt = this.basePrompt;
    
    if (options.cancerType) {
      prompt += `\nThis patient should have ${options.cancerType} cancer.`;
    }
    
    if (options.psychologicalFocus) {
      prompt += `\nEnsure the psychological profile emphasizes ${options.psychologicalFocus}.`;
    }
    
    if (options.communicationStyle) {
      prompt += `\nThe patient should have a communication style that is ${options.communicationStyle}.`;
    }
    
    if (options.age) {
      if (typeof options.age === 'number') {
        prompt += `\nThe patient should be ${options.age} years old.`;
      } else {
        prompt += `\nThe patient should be between ${options.age.min} and ${options.age.max} years old.`;
      }
    }
    
    if (options.gender) {
      prompt += `\nThe patient's gender should be ${options.gender}.`;
    }
    
    if (options.treatmentStatus) {
      prompt += `\nThe patient should be in the ${options.treatmentStatus} phase.`;
    }
    
    if (options.minProfileScore && options.maxProfileScore) {
      prompt += `\nThe psychological profile scores should be between ${options.minProfileScore} and ${options.maxProfileScore}.`;
    }
    
    return prompt;
  }
  
  /**
   * Parse persona from text response (extract and parse JSON)
   */
  private parsePersonaFromText(text: string): Omit<PatientPersona, 'id'> {
    // In a real implementation, this would extract JSON from the response
    // Here we'll assume our simulation returns a valid JSON object
    return JSON.parse(text);
  }
  
  /**
   * Generate a set of diverse personas
   */
  async generatePersonaSet(count: number, options: PersonaGenerationOptions = {}): Promise<PatientPersona[]> {
    const personas: PatientPersona[] = [];
    
    const cancerTypes = [
      'Breast', 'Lung', 'Prostate', 'Colorectal', 'Melanoma', 
      'Bladder', 'Kidney', 'Pancreatic', 'Thyroid', 'Leukemia'
    ];
    
    const psychologicalFocuses = [
      'high anxiety', 'moderate depression', 'low self-efficacy',
      'strong support network', 'severe distress', 'moderate anxiety',
      'mild depression', 'high resilience', 'isolation', 'grief'
    ];
    
    const communicationStyles = [
      'reserved', 'open', 'detailed', 'vague', 'emotional',
      'stoic', 'analytical', 'avoidant', 'confrontational', 'optimistic'
    ];
    
    for (let i = 0; i < count; i++) {
      // Mix options to ensure diversity
      const diverseOptions = {
        ...options,
        cancerType: options.cancerType || cancerTypes[i % cancerTypes.length],
        psychologicalFocus: options.psychologicalFocus || psychologicalFocuses[i % psychologicalFocuses.length],
        communicationStyle: options.communicationStyle || communicationStyles[i % communicationStyles.length],
        variation: i  // Ensure diversity in the set
      };
      
      const persona = await this.generatePersona(diverseOptions);
      personas.push(persona);
    }
    
    return personas;
  }
  
  /**
   * Simulate Claude API response for development
   * In the real implementation, this would be replaced with actual API calls
   */
  private simulateClaudeResponse(options: PersonaGenerationOptions): string {
    // This is just for development/testing; would be replaced with actual Claude API call
    const simulatedPersonas = [
      {
        name: "Margaret Wilson",
        age: 62,
        gender: "Female",
        diagnosis: {
          cancerType: options.cancerType || "Breast cancer",
          stage: "Stage II",
          timeOfDiagnosis: "4 months ago"
        },
        treatmentStatus: options.treatmentStatus || "in-treatment",
        psychologicalProfile: {
          anxiety: 7,
          depression: 5,
          distress: 6,
          selfEfficacy: 4,
          supportNetworkStrength: 8
        },
        communication: {
          articulationLevel: 7,
          openness: 5,
          directness: 4,
          emotionalExpression: 6
        },
        background: {
          familyStatus: "Married with two adult children",
          occupation: "Retired teacher",
          importantLifeEvents: [
            "Husband had heart attack 2 years ago",
            "Birth of first grandchild last year",
            "Retirement 3 years ago"
          ],
          supportSystem: [
            "Husband (primary caregiver)",
            "Daughter (visits weekly)",
            "Church community group"
          ]
        },
        behavioralPatterns: [
          "Tends to minimize physical symptoms",
          "Changes subject when discussing mortality",
          "Takes notes during medical appointments"
        ],
        personalConcerns: [
          "Worried about being a burden to family",
          "Anxious about treatment side effects",
          "Concerned about missing grandchild's early years"
        ]
      },
      {
        name: "Robert Chen",
        age: 45,
        gender: "Male",
        diagnosis: {
          cancerType: options.cancerType || "Colorectal cancer",
          stage: "Stage III",
          timeOfDiagnosis: "6 months ago"
        },
        treatmentStatus: options.treatmentStatus || "in-treatment",
        psychologicalProfile: {
          anxiety: 8,
          depression: 7,
          distress: 8,
          selfEfficacy: 3,
          supportNetworkStrength: 4
        },
        communication: {
          articulationLevel: 9,
          openness: 3,
          directness: 7,
          emotionalExpression: 2
        },
        background: {
          familyStatus: "Recently divorced, two children (10 and 12)",
          occupation: "Software engineer",
          importantLifeEvents: [
            "Divorce finalized 8 months ago",
            "Promotion to senior engineer 1 year ago",
            "Father died of cancer 5 years ago"
          ],
          supportSystem: [
            "Sister (lives in another state)",
            "One close colleague",
            "Online cancer support group"
          ]
        },
        behavioralPatterns: [
          "Researches medical information extensively",
          "Difficulty asking for help",
          "Works during treatment to avoid thinking about diagnosis"
        ],
        personalConcerns: [
          "Worried about children's well-being if condition worsens",
          "Financial stress from medical bills",
          "Fear of career impact due to treatment schedule"
        ]
      }
    ];
    
    // Select one of the simulated personas
    const selectedPersona = simulatedPersonas[Math.floor(Math.random() * simulatedPersonas.length)];
    
    // Apply any specific options
    if (options.psychologicalFocus === 'high anxiety') {
      selectedPersona.psychologicalProfile.anxiety = 9;
    } else if (options.psychologicalFocus === 'depression') {
      selectedPersona.psychologicalProfile.depression = 8;
    }
    
    if (options.communicationStyle === 'reserved') {
      selectedPersona.communication.openness = 2;
      selectedPersona.communication.emotionalExpression = 3;
    } else if (options.communicationStyle === 'open') {
      selectedPersona.communication.openness = 8;
      selectedPersona.communication.emotionalExpression = 7;
    }
    
    return JSON.stringify(selectedPersona);
  }
} 