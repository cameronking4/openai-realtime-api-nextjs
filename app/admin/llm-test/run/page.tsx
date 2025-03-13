'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RunTestsPage() {
  const [loading, setLoading] = useState(false);
  const [testConfig, setTestConfig] = useState({
    personaCount: 3,
    promptVersion: 'v1.2',
    cancerTypes: ['any'],
    psychologicalFocus: ['any'],
    communicationStyle: ['any'],
    maxTurnsPerConversation: 10,
    randomnessFactor: 0.3
  });
  const [availablePrompts, setAvailablePrompts] = useState<any[]>([]);
  const [testProgress, setTestProgress] = useState<any | null>(null);
  const [testResults, setTestResults] = useState<any | null>(null);
  
  // Load available prompts
  useEffect(() => {
    // In a real app, you would fetch the available prompts from an API
    // For now, we'll create mock data
    const mockPrompts = [
      { id: 'v1.2', name: 'Assessment Prompt v1.2' },
      { id: 'v1.1', name: 'Assessment Prompt v1.1' },
      { id: 'v1.0', name: 'Assessment Prompt v1.0' }
    ];
    
    setAvailablePrompts(mockPrompts);
  }, []);
  
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTestConfig(prev => ({
      ...prev,
      [name]: name === 'personaCount' || name === 'maxTurnsPerConversation' 
        ? parseInt(value) 
        : name === 'randomnessFactor' 
          ? parseFloat(value) 
          : value
    }));
  };
  
  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setTestConfig(prev => ({
      ...prev,
      [name]: selectedValues
    }));
  };
  
  const startTests = () => {
    setLoading(true);
    setTestProgress({
      stage: 'generating-personas',
      completed: 0,
      total: testConfig.personaCount,
      currentPersona: null,
      currentStep: 'Generating patient personas'
    });
    
    // Simulate the test process
    simulateTestProcess();
  };
  
  const simulateTestProcess = () => {
    // Step 1: Generate personas
    setTimeout(() => {
      const personas = [];
      for (let i = 0; i < testConfig.personaCount; i++) {
        personas.push({
          id: `persona-${i + 1}`,
          name: ['Margaret Wilson', 'Robert Johnson', 'Sarah Chen', 'James Miller', 'Emily Davis'][i % 5],
          age: Math.floor(Math.random() * 40) + 35,
          cancerType: ['Breast cancer', 'Prostate cancer', 'Colorectal cancer', 'Lung cancer', 'Ovarian cancer'][i % 5],
          stage: ['Stage I', 'Stage II', 'Stage III', 'Stage IV'][Math.floor(Math.random() * 4)]
        });
      }
      
      setTestProgress({
        stage: 'simulating-conversations',
        completed: 0,
        total: testConfig.personaCount,
        currentPersona: personas[0],
        personas,
        currentStep: 'Simulating conversations'
      });
      
      // Step 2: Simulate conversations
      simulateConversations(personas, 0, []);
    }, 2000);
  };
  
  const simulateConversations = (personas: any[], index: number, conversations: any[]) => {
    if (index >= personas.length) {
      // Move to evaluation stage
      setTestProgress({
        stage: 'evaluating-assessments',
        completed: 0,
        total: personas.length,
        currentPersona: personas[0],
        personas,
        conversations,
        currentStep: 'Evaluating assessments'
      });
      
      // Step 3: Evaluate assessments
      simulateEvaluations(personas, conversations, 0, []);
      return;
    }
    
    setTimeout(() => {
      const conversation = {
        id: `conversation-${personas[index].id}`,
        personaId: personas[index].id,
        messages: [
          {
            role: 'assistant',
            content: "Hello, I'm here to support you through your cancer journey. How are you feeling today, and is there anything specific you'd like to talk about?"
          },
          {
            role: 'user',
            content: "I'm really worried about my next scan. What if the cancer has spread?"
          },
          {
            role: 'assistant',
            content: "I understand that must be difficult. It's completely normal to feel anxious about upcoming scans. Many people experience what's called 'scanxiety'. Would it help to talk about what's specifically concerning you about the results?"
          },
          {
            role: 'user',
            content: "I can't sleep at night thinking about what might happen to my family if things get worse."
          }
        ],
        assessment: `
Clinical Assessment Note

Patient: ${personas[index].name}, ${personas[index].age}
Diagnosis: ${personas[index].cancerType}, ${personas[index].stage}

Psychological State:
The patient presents with moderate to high anxiety, particularly regarding upcoming scans ("scanxiety").
Overall distress level appears moderate, with notable sleep disturbance reported.

Coping Mechanisms:
Patient demonstrates limited self-efficacy.
Sometimes shares concerns and emotions, but expresses reluctance to "burden" family members with worries.

Support Needs:
Support network appears strong, with family as primary support.
Would benefit from additional support in: 
- Anxiety management, particularly related to upcoming scans
- Developing communication strategies with family about concerns
- Sleep improvement techniques

Recommendations:
1. Implement anxiety management techniques specifically for scan-related anxiety.
2. Regular check-ins regarding mood, emotional state, and sleep quality.
3. Encourage continued engagement with existing support network.
4. Consider sleep hygiene education if disturbance persists.

Follow-up recommended in 2 weeks to reassess psychological state and coping strategies.
        `
      };
      
      conversations.push(conversation);
      
      setTestProgress((prev: any) => ({
        ...prev,
        completed: index + 1,
        currentPersona: index + 1 < personas.length ? personas[index + 1] : null
      }));
      
      // Process next persona
      simulateConversations(personas, index + 1, conversations);
    }, 1500);
  };
  
  const simulateEvaluations = (personas: any[], conversations: any[], index: number, evaluations: any[]) => {
    if (index >= personas.length) {
      // Complete the test process
      setTestProgress({
        stage: 'completed',
        completed: personas.length,
        total: personas.length,
        currentStep: 'Test cycle completed'
      });
      
      // Generate test results summary
      const results = {
        id: `test-cycle-${Date.now()}`,
        timestamp: new Date().toISOString(),
        config: testConfig,
        personas,
        conversations,
        evaluations,
        summary: {
          overallScore: evaluations.reduce((sum, evaluation) => sum + evaluation.scores.overallScore, 0) / evaluations.length,
          accuracyScore: evaluations.reduce((sum, evaluation) => sum + evaluation.scores.accuracy, 0) / evaluations.length,
          empathyScore: evaluations.reduce((sum, evaluation) => sum + evaluation.scores.empathy, 0) / evaluations.length,
          clarityScore: evaluations.reduce((sum, evaluation) => sum + evaluation.scores.clarity, 0) / evaluations.length,
          bestPerforming: personas[evaluations.findIndex(e => 
            e.scores.overallScore === Math.max(...evaluations.map(ev => ev.scores.overallScore))
          )].name,
          worstPerforming: personas[evaluations.findIndex(e => 
            e.scores.overallScore === Math.min(...evaluations.map(ev => ev.scores.overallScore))
          )].name
        }
      };
      
      setTestResults(results);
      setLoading(false);
      return;
    }
    
    setTimeout(() => {
      const evaluation = {
        id: `evaluation-${personas[index].id}`,
        personaId: personas[index].id,
        conversationId: `conversation-${personas[index].id}`,
        scores: {
          accuracy: 0.7 + Math.random() * 0.2,
          empathy: 0.65 + Math.random() * 0.25,
          clarity: 0.75 + Math.random() * 0.15,
          overallScore: 0.7 + Math.random() * 0.2
        },
        strengths: [
          "Accurate identification of anxiety as a primary concern",
          "Clear structure with specific, actionable recommendations"
        ],
        weaknesses: [
          "Limited focus on family communication strategies",
          "Could provide more specific anxiety management techniques"
        ],
        suggestedImprovements: [
          "Add recommendation for family communication strategies",
          "Provide more concrete anxiety management techniques"
        ]
      };
      
      evaluations.push(evaluation);
      
      setTestProgress((prev: any) => ({
        ...prev,
        completed: index + 1,
        currentPersona: index + 1 < personas.length ? personas[index + 1] : null
      }));
      
      // Process next evaluation
      simulateEvaluations(personas, conversations, index + 1, evaluations);
    }, 1500);
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Run Complete Test Cycle</h2>
        <p className="text-gray-600 mb-6">
          Configure and run an end-to-end test cycle that generates personas, simulates conversations, 
          and evaluates the resulting assessments.
        </p>
        
        {!loading && !testResults ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="personaCount" className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Personas to Generate
                </label>
                <input
                  type="number"
                  id="personaCount"
                  name="personaCount"
                  min="1"
                  max="10"
                  value={testConfig.personaCount}
                  onChange={handleConfigChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="promptVersion" className="block text-sm font-medium text-gray-700 mb-1">
                  Prompt Version to Test
                </label>
                <select
                  id="promptVersion"
                  name="promptVersion"
                  value={testConfig.promptVersion}
                  onChange={handleConfigChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {availablePrompts.map(prompt => (
                    <option key={prompt.id} value={prompt.id}>
                      {prompt.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="cancerTypes" className="block text-sm font-medium text-gray-700 mb-1">
                  Cancer Types (hold Ctrl/Cmd to select multiple)
                </label>
                <select
                  id="cancerTypes"
                  name="cancerTypes"
                  multiple
                  size={4}
                  value={testConfig.cancerTypes}
                  onChange={handleMultiSelectChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="any">Any Type</option>
                  <option value="breast">Breast Cancer</option>
                  <option value="prostate">Prostate Cancer</option>
                  <option value="colorectal">Colorectal Cancer</option>
                  <option value="lung">Lung Cancer</option>
                  <option value="ovarian">Ovarian Cancer</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="psychologicalFocus" className="block text-sm font-medium text-gray-700 mb-1">
                  Psychological Focus (hold Ctrl/Cmd to select multiple)
                </label>
                <select
                  id="psychologicalFocus"
                  name="psychologicalFocus"
                  multiple
                  size={4}
                  value={testConfig.psychologicalFocus}
                  onChange={handleMultiSelectChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="any">Any Focus</option>
                  <option value="anxiety">High Anxiety</option>
                  <option value="depression">Depression</option>
                  <option value="support">Low Support Network</option>
                  <option value="newly-diagnosed">Newly Diagnosed</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="maxTurnsPerConversation" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Turns Per Conversation
                </label>
                <input
                  type="number"
                  id="maxTurnsPerConversation"
                  name="maxTurnsPerConversation"
                  min="3"
                  max="20"
                  value={testConfig.maxTurnsPerConversation}
                  onChange={handleConfigChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="randomnessFactor" className="block text-sm font-medium text-gray-700 mb-1">
                  Randomness Factor (0-1)
                </label>
                <input
                  type="number"
                  id="randomnessFactor"
                  name="randomnessFactor"
                  min="0"
                  max="1"
                  step="0.1"
                  value={testConfig.randomnessFactor}
                  onChange={handleConfigChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Higher values create more varied responses</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={startTests}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Start Test Cycle
              </button>
            </div>
          </div>
        ) : loading && testProgress ? (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800 mb-2">Test Cycle in Progress</h3>
              <p className="text-sm text-blue-600 mb-4">{testProgress.currentStep}</p>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(testProgress.completed / testProgress.total) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>Progress: {testProgress.completed} of {testProgress.total} {testProgress.stage === 'generating-personas' ? 'personas' : testProgress.stage === 'simulating-conversations' ? 'conversations' : 'evaluations'}</span>
                <span>{Math.round((testProgress.completed / testProgress.total) * 100)}% complete</span>
              </div>
              
              {testProgress.currentPersona && (
                <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
                  <div className="text-sm font-medium">Currently Processing:</div>
                  <div className="text-sm">{testProgress.currentPersona.name}, {testProgress.currentPersona.age}</div>
                  <div className="text-sm text-gray-500">{testProgress.currentPersona.cancerType}, {testProgress.currentPersona.stage}</div>
                </div>
              )}
            </div>
          </div>
        ) : testResults ? (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-md border border-green-100">
              <h3 className="text-lg font-medium text-green-800 mb-2">Test Cycle Completed</h3>
              <p className="text-sm text-green-600">
                Successfully tested {testResults.personas.length} personas with prompt version {testConfig.promptVersion}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Results Summary</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500">Overall Score</div>
                  <div className="text-2xl font-bold">{(testResults.summary.overallScore * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Accuracy</div>
                  <div className="text-2xl font-bold">{(testResults.summary.accuracyScore * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Empathy</div>
                  <div className="text-2xl font-bold">{(testResults.summary.empathyScore * 100).toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Clarity</div>
                  <div className="text-2xl font-bold">{(testResults.summary.clarityScore * 100).toFixed(0)}%</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500">Best Performing Persona</div>
                  <div className="text-lg font-medium">{testResults.summary.bestPerforming}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Worst Performing Persona</div>
                  <div className="text-lg font-medium">{testResults.summary.worstPerforming}</div>
                </div>
              </div>
              
              <h4 className="text-md font-medium mb-2">Individual Results</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {testResults.evaluations.map((evaluation: any, index: number) => (
                  <div key={evaluation.id} className="flex items-center p-2 bg-gray-50 rounded">
                    <div className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full mr-3">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{testResults.personas[index].name}</div>
                      <div className="text-xs text-gray-500">{testResults.personas[index].cancerType}, {testResults.personas[index].stage}</div>
                    </div>
                    <div 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        evaluation.scores.overallScore >= 0.8 ? 'bg-green-100 text-green-800' :
                        evaluation.scores.overallScore >= 0.6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {(evaluation.scores.overallScore * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between">
              <Link 
                href="/admin/llm-test/dashboard"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Dashboard
              </Link>
              
              <div className="space-x-3">
                <button
                  onClick={() => {
                    setTestResults(null);
                    setTestProgress(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Configure New Test
                </button>
                
                <Link 
                  href="/admin/llm-test/refinement"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Refine Prompts
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
} 