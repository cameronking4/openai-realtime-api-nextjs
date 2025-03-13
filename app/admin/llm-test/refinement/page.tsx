'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RefinementPage() {
  const [loading, setLoading] = useState(true);
  const [promptData, setPromptData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('current');
  const [editedPrompt, setEditedPrompt] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // Load prompt data
  useEffect(() => {
    // In a real app, you would fetch the prompt data from an API
    // For now, we'll create mock data
    setTimeout(() => {
      const mockPromptData = {
        id: 'assessment-prompt-1',
        name: 'Patient Assessment Prompt',
        description: 'Prompt used to generate clinical assessments based on patient conversations',
        currentVersion: {
          id: 'v1.2',
          content: `You are an expert in psycho-oncology with extensive experience in assessing cancer patients' psychological states.

Based on the conversation transcript provided, create a clinical assessment note that includes:

1. Patient information (name, age, diagnosis)
2. Psychological state assessment (anxiety, depression, distress levels)
3. Coping mechanisms evaluation
4. Support needs identification
5. Specific recommendations for psychological support

Your assessment should be concise, clinically relevant, and focused on actionable insights for the healthcare team.`,
          createdAt: '2023-11-15T10:30:00Z',
          performance: {
            accuracy: 0.78,
            empathy: 0.72,
            clarity: 0.85,
            overallScore: 0.78
          }
        },
        versions: [
          {
            id: 'v1.2',
            content: `You are an expert in psycho-oncology with extensive experience in assessing cancer patients' psychological states.

Based on the conversation transcript provided, create a clinical assessment note that includes:

1. Patient information (name, age, diagnosis)
2. Psychological state assessment (anxiety, depression, distress levels)
3. Coping mechanisms evaluation
4. Support needs identification
5. Specific recommendations for psychological support

Your assessment should be concise, clinically relevant, and focused on actionable insights for the healthcare team.`,
            createdAt: '2023-11-15T10:30:00Z',
            performance: {
              accuracy: 0.78,
              empathy: 0.72,
              clarity: 0.85,
              overallScore: 0.78
            }
          },
          {
            id: 'v1.1',
            content: `You are a psycho-oncology specialist. Create a clinical assessment note based on the patient conversation provided. Include psychological state, coping mechanisms, support needs, and recommendations.`,
            createdAt: '2023-10-20T14:15:00Z',
            performance: {
              accuracy: 0.65,
              empathy: 0.60,
              clarity: 0.70,
              overallScore: 0.65
            }
          },
          {
            id: 'v1.0',
            content: `Create a clinical assessment for a cancer patient based on the conversation.`,
            createdAt: '2023-09-05T09:45:00Z',
            performance: {
              accuracy: 0.52,
              empathy: 0.48,
              clarity: 0.55,
              overallScore: 0.52
            }
          }
        ]
      };
      
      setPromptData(mockPromptData);
      setEditedPrompt(mockPromptData.currentVersion.content);
      setLoading(false);
      
      // Mock test results
      const mockTestResults = [
        {
          id: 'test-1',
          date: '2023-11-16T15:30:00Z',
          persona: 'Margaret Wilson, 62, Breast Cancer Stage II',
          promptVersion: 'v1.2',
          scores: {
            accuracy: 0.82,
            empathy: 0.75,
            clarity: 0.88,
            overallScore: 0.81
          }
        },
        {
          id: 'test-2',
          date: '2023-11-16T16:45:00Z',
          persona: 'Robert Johnson, 58, Prostate Cancer Stage III',
          promptVersion: 'v1.2',
          scores: {
            accuracy: 0.76,
            empathy: 0.70,
            clarity: 0.84,
            overallScore: 0.77
          }
        },
        {
          id: 'test-3',
          date: '2023-11-17T09:15:00Z',
          persona: 'Sarah Chen, 45, Colorectal Cancer Stage I',
          promptVersion: 'v1.2',
          scores: {
            accuracy: 0.79,
            empathy: 0.73,
            clarity: 0.82,
            overallScore: 0.78
          }
        }
      ];
      
      setTestResults(mockTestResults);
    }, 1500);
  }, []);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'current' && promptData) {
      setEditedPrompt(promptData.currentVersion.content);
    }
  };
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedPrompt(e.target.value);
  };
  
  const generateSuggestions = () => {
    setIsGeneratingSuggestions(true);
    setSuggestions([]);
    
    // In a real app, you would call the LLM API to generate suggestions
    // For now, we'll simulate the process
    setTimeout(() => {
      const mockSuggestions = [
        `You are an expert in psycho-oncology with extensive experience in assessing cancer patients' psychological states.

Based on the conversation transcript provided, create a detailed clinical assessment note that includes:

1. Patient information (name, age, diagnosis)
2. Psychological state assessment (anxiety, depression, distress levels, sleep quality)
3. Coping mechanisms evaluation (including communication patterns with family)
4. Support needs identification (specific to patient's situation)
5. Specific, actionable recommendations for psychological support, including:
   - Anxiety management techniques
   - Communication strategies with family/caregivers
   - Sleep improvement approaches if needed
   - Referrals to specific support services if appropriate

Your assessment should be concise, clinically relevant, and focused on actionable insights for the healthcare team. Pay special attention to subtle emotional cues and unspoken concerns in the conversation.`,
        
        `As a senior psycho-oncology specialist, your task is to create a comprehensive clinical assessment based on the patient conversation transcript.

Your assessment must include:

1. Patient demographics and cancer diagnosis details
2. Psychological evaluation:
   - Anxiety levels (general and specific triggers like "scanxiety")
   - Depression indicators
   - Sleep disturbances
   - Overall distress measurement

3. Communication patterns analysis:
   - How the patient discusses their condition
   - Family communication dynamics
   - Potential barriers to expressing concerns

4. Support system evaluation:
   - Existing support network
   - Caregiver dynamics
   - Gaps in support

5. Detailed recommendations:
   - Specific anxiety management techniques tailored to identified triggers
   - Communication improvement strategies
   - Sleep hygiene interventions if needed
   - Family support approaches
   - Potential referrals with rationale

Format your assessment in clear clinical language with distinct sections and bullet points for recommendations. Focus on providing actionable guidance that addresses both explicit and implicit needs revealed in the conversation.`,
        
        `You are creating a clinical psychological assessment for a cancer patient based on their conversation with a support assistant.

Provide a structured assessment that includes:

1. PATIENT PROFILE:
   - Name, age, gender
   - Cancer type, stage, treatment phase
   
2. PSYCHOLOGICAL STATUS:
   - Quantify anxiety (1-10) with specific triggers identified
   - Assess depression indicators
   - Evaluate sleep quality and disturbances
   - Note specific fears or concerns (e.g., scan results, family impact)
   
3. INTERPERSONAL DYNAMICS:
   - Communication patterns with healthcare team
   - Family/caregiver relationships and communication style
   - Self-perception as "burden" if present
   
4. COPING ASSESSMENT:
   - Effective strategies currently employed
   - Maladaptive patterns
   - Self-efficacy evaluation
   
5. SUPPORT RECOMMENDATIONS:
   - Prioritized by urgency/impact
   - Specific techniques or interventions for identified issues
   - Communication strategy improvements
   - Sleep interventions if needed
   - Follow-up timeline and goals

Use clinical terminology while ensuring recommendations are concrete and implementable. Note both strengths and areas for support.`
      ];
      
      setSuggestions(mockSuggestions);
      setIsGeneratingSuggestions(false);
    }, 3000);
  };
  
  const savePrompt = () => {
    setIsSaving(true);
    
    // In a real app, you would call an API to save the prompt
    // For now, we'll simulate the process
    setTimeout(() => {
      // Update the mock data
      if (promptData) {
        const newVersion = {
          id: `v${parseFloat(promptData.currentVersion.id.substring(1)) + 0.1}`,
          content: editedPrompt,
          createdAt: new Date().toISOString(),
          performance: {
            accuracy: 0,
            empathy: 0,
            clarity: 0,
            overallScore: 0
          }
        };
        
        setPromptData({
          ...promptData,
          currentVersion: newVersion,
          versions: [newVersion, ...promptData.versions]
        });
      }
      
      setIsSaving(false);
      setSavedSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSavedSuccess(false);
      }, 3000);
    }, 1500);
  };
  
  const applySuggestion = (index: number) => {
    setEditedPrompt(suggestions[index]);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Prompt Editor */}
      <div className="lg:col-span-2">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Prompt Editor</h2>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleTabChange('current')}
                className={`px-3 py-1 text-sm rounded-md ${
                  activeTab === 'current' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Current Version
              </button>
              <button
                onClick={() => handleTabChange('edit')}
                className={`px-3 py-1 text-sm rounded-md ${
                  activeTab === 'edit' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Edit Prompt
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="h-64 flex justify-center items-center">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          ) : promptData ? (
            <>
              {activeTab === 'current' ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">{promptData.name}</h3>
                    <p className="text-gray-500 text-sm">{promptData.description}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <span>Version {promptData.currentVersion.id}</span>
                      <span className="mx-2">•</span>
                      <span>
                        Last updated {new Date(promptData.currentVersion.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                    <pre className="whitespace-pre-wrap font-sans text-sm">{promptData.currentVersion.content}</pre>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Performance Metrics</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Overall</div>
                        <div className="text-lg font-bold text-blue-700">
                          {(promptData.currentVersion.performance.overallScore * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                        <div className="text-lg font-bold text-blue-700">
                          {(promptData.currentVersion.performance.accuracy * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Empathy</div>
                        <div className="text-lg font-bold text-blue-700">
                          {(promptData.currentVersion.performance.empathy * 100).toFixed(0)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Clarity</div>
                        <div className="text-lg font-bold text-blue-700">
                          {(promptData.currentVersion.performance.clarity * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleTabChange('edit')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit Prompt
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="promptEditor" className="block text-sm font-medium text-gray-700 mb-1">
                      Edit Prompt Content
                    </label>
                    <textarea
                      id="promptEditor"
                      rows={15}
                      value={editedPrompt}
                      onChange={handlePromptChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex justify-between">
                    <button
                      onClick={generateSuggestions}
                      disabled={isGeneratingSuggestions}
                      className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                        isGeneratingSuggestions ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-50'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {isGeneratingSuggestions ? 'Generating...' : 'Generate Suggestions'}
                    </button>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleTabChange('current')}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={savePrompt}
                        disabled={isSaving}
                        className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                          isSaving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                      >
                        {isSaving ? 'Saving...' : 'Save as New Version'}
                      </button>
                    </div>
                  </div>
                  
                  {savedSuccess && (
                    <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-md">
                      Prompt saved successfully as a new version!
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No prompt data available.</p>
            </div>
          )}
        </div>
        
        {activeTab === 'edit' && suggestions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">AI-Generated Suggestions</h2>
            
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="bg-yellow-50 p-4 rounded-md border border-yellow-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-yellow-800">Suggestion {index + 1}</h3>
                    <button
                      onClick={() => applySuggestion(index)}
                      className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2 py-1 rounded"
                    >
                      Apply
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs">{suggestion}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Right Column - Version History & Test Results */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Version History</h2>
          
          {loading ? (
            <div className="h-40 flex justify-center items-center">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          ) : promptData ? (
            <div className="space-y-4">
              {promptData.versions.map((version: any) => (
                <div 
                  key={version.id}
                  className={`p-3 rounded-md border ${
                    version.id === promptData.currentVersion.id 
                      ? 'border-blue-200 bg-blue-50' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-medium">Version {version.id}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(version.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-xs text-gray-500">Score:</div>
                    <div 
                      className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                        version.performance.overallScore >= 0.8 ? 'bg-green-100 text-green-800' :
                        version.performance.overallScore >= 0.6 ? 'bg-yellow-100 text-yellow-800' :
                        version.performance.overallScore > 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {version.performance.overallScore > 0 
                        ? `${(version.performance.overallScore * 100).toFixed(0)}%` 
                        : 'Not tested'}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 line-clamp-2">
                    {version.content.substring(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No version history available.</p>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Recent Test Results</h2>
          
          {loading ? (
            <div className="h-40 flex justify-center items-center">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              </div>
            </div>
          ) : testResults.length > 0 ? (
            <div className="space-y-4">
              {testResults.map((test) => (
                <div key={test.id} className="p-3 rounded-md border border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-medium">{test.persona}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(test.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="text-xs text-gray-500">Version:</div>
                    <div className="text-xs font-medium bg-gray-200 px-1.5 py-0.5 rounded-full">
                      {test.promptVersion}
                    </div>
                    <div className="text-xs text-gray-500 ml-2">Score:</div>
                    <div 
                      className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                        test.scores.overallScore >= 0.8 ? 'bg-green-100 text-green-800' :
                        test.scores.overallScore >= 0.6 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {(test.scores.overallScore * 100).toFixed(0)}%
                    </div>
                  </div>
                  
                  <Link 
                    href={`/admin/llm-test/evaluator?simulationId=${test.id}`}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    View evaluation details
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No test results available.</p>
              <Link 
                href="/admin/llm-test/run"
                className="text-blue-600 hover:text-blue-800 block mt-2 text-sm"
              >
                Run tests
              </Link>
            </div>
          )}
          
          <div className="mt-4">
            <Link 
              href="/admin/llm-test/run"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span>Run new tests with current prompt</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 