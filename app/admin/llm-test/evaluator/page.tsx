'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function EvaluatorPage() {
  const searchParams = useSearchParams();
  const simulationId = searchParams.get('simulationId');
  
  const [loading, setLoading] = useState(true);
  const [simulationData, setSimulationData] = useState<any | null>(null);
  const [evaluationResults, setEvaluationResults] = useState<any | null>(null);
  const [evaluationInProgress, setEvaluationInProgress] = useState(false);
  const [evaluationComplete, setEvaluationComplete] = useState(false);
  const [evaluationConfig, setEvaluationConfig] = useState({
    accuracyWeight: 0.4,
    empathyWeight: 0.3,
    clarityWeight: 0.3,
  });
  
  // Load simulation data
  useEffect(() => {
    if (simulationId) {
      // In a real app, you would fetch the simulation data from an API
      // For now, we'll create mock data
      setTimeout(() => {
        const mockSimulationData = {
          id: simulationId,
          persona: {
            id: 'persona-123',
            name: 'Margaret Wilson',
            age: 62,
            gender: 'Female',
            diagnosis: {
              cancerType: 'Breast cancer',
              stage: 'Stage II',
              timeOfDiagnosis: '4 months ago'
            },
            treatmentStatus: 'in-treatment',
            psychologicalProfile: {
              anxiety: 7,
              depression: 5,
              distress: 6,
              selfEfficacy: 4,
              supportNetworkStrength: 8
            }
          },
          conversation: [
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
            },
            {
              role: 'assistant',
              content: "I hear your concern about your family. It shows how much you care about them. Have you been able to share these worries with your family or your healthcare team?"
            },
            {
              role: 'user',
              content: "My husband knows I'm worried, but I try not to burden him too much. He's already doing so much to help me."
            },
            {
              role: 'assistant',
              content: "It's thoughtful that you're considering your husband's feelings. Many caregivers actually want to know what their loved ones are experiencing so they can provide better support. Would it be helpful to discuss ways to communicate your concerns with him that might feel less burdensome?"
            }
          ],
          assessment: `
Clinical Assessment Note

Patient: Margaret Wilson, 62
Diagnosis: Breast cancer, Stage II

Psychological State:
The patient presents with moderate anxiety and moderate depressive symptoms.
Overall distress level appears moderate.

Coping Mechanisms:
Patient demonstrates limited self-efficacy.
Sometimes shares concerns and emotions.

Support Needs:
Support network appears strong.
Would benefit from additional support in: 
anxiety management, 
building self-efficacy, 

Recommendations:
1. Continue monitoring anxiety levels.
2. Regular check-ins regarding mood and emotional state.
3. Encourage continued engagement with existing support network.
4. Maintain open communication channels.

Follow-up recommended in 2 weeks to reassess psychological state and coping strategies.
          `
        };
        
        setSimulationData(mockSimulationData);
        setLoading(false);
      }, 1500);
    }
  }, [simulationId]);
  
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEvaluationConfig(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  const startEvaluation = () => {
    if (!simulationData) return;
    
    setEvaluationInProgress(true);
    setEvaluationComplete(false);
    
    // In a real app, you would call the LLM API to evaluate the assessment
    // For now, we'll simulate the evaluation process
    setTimeout(() => {
      const mockEvaluationResults = {
        scores: {
          accuracy: {
            score: 0.82,
            feedback: "The assessment accurately identifies the patient's anxiety and concerns about family. However, it underestimates the severity of sleep disturbance mentioned in the conversation."
          },
          empathy: {
            score: 0.75,
            feedback: "The assessment acknowledges the patient's emotional state but could better reflect the specific concerns about family burden that were central to the conversation."
          },
          clarity: {
            score: 0.88,
            feedback: "The assessment is well-structured and clear, with specific recommendations that follow logically from the identified needs."
          },
          relevance: {
            score: 0.79,
            feedback: "The recommendations are relevant to the patient's situation, though could more directly address the sleep issues and family communication concerns."
          }
        },
        overallScore: 0.81,
        strengths: [
          "Accurate identification of anxiety as a primary concern",
          "Clear structure with specific, actionable recommendations",
          "Recognition of the strong support network"
        ],
        weaknesses: [
          "Insufficient attention to sleep disturbance mentioned in conversation",
          "Limited focus on family communication strategies",
          "Could provide more specific anxiety management techniques"
        ],
        suggestedImprovements: [
          "Include specific mention of sleep disturbance and potential interventions",
          "Add recommendation for family communication strategies",
          "Provide more concrete anxiety management techniques"
        ],
        refinedAssessment: `
Clinical Assessment Note

Patient: Margaret Wilson, 62
Diagnosis: Breast cancer, Stage II

Psychological State:
The patient presents with moderate to high anxiety, particularly regarding upcoming scans ("scanxiety") and moderate depressive symptoms.
Overall distress level appears moderate, with notable sleep disturbance reported.

Coping Mechanisms:
Patient demonstrates limited self-efficacy.
Sometimes shares concerns and emotions, but expresses reluctance to "burden" family members with worries.

Support Needs:
Support network appears strong, with husband as primary caregiver.
Would benefit from additional support in: 
- Anxiety management, particularly related to upcoming scans
- Building self-efficacy
- Developing communication strategies with family about concerns
- Sleep improvement techniques

Recommendations:
1. Implement anxiety management techniques specifically for scan-related anxiety, such as guided imagery and breathing exercises.
2. Regular check-ins regarding mood, emotional state, and sleep quality.
3. Encourage continued engagement with existing support network, with specific guidance on communicating concerns without feeling burdensome.
4. Consider sleep hygiene education and possible referral for sleep assessment if disturbance persists.
5. Explore family counseling options to facilitate open communication about patient's concerns.

Follow-up recommended in 2 weeks to reassess psychological state, sleep quality, and coping strategies.
        `
      };
      
      // Calculate weighted overall score
      const { accuracyWeight, empathyWeight, clarityWeight } = evaluationConfig;
      const weightedScore = (
        mockEvaluationResults.scores.accuracy.score * accuracyWeight +
        mockEvaluationResults.scores.empathy.score * empathyWeight +
        mockEvaluationResults.scores.clarity.score * clarityWeight
      ) / (accuracyWeight + empathyWeight + clarityWeight);
      
      mockEvaluationResults.overallScore = parseFloat(weightedScore.toFixed(2));
      
      setEvaluationResults(mockEvaluationResults);
      setEvaluationInProgress(false);
      setEvaluationComplete(true);
    }, 3000);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Simulation Data & Evaluation Config */}
      <div>
        {loading ? (
          <div className="bg-white p-6 rounded-lg shadow-md flex justify-center items-center h-64">
            <div className="animate-pulse flex space-x-2">
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-bold mb-4">Simulation Data</h2>
              
              {simulationData ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Patient Persona</h3>
                    <p className="text-gray-600">{simulationData.persona.name}, {simulationData.persona.age}</p>
                    <p className="text-gray-600">{simulationData.persona.diagnosis.cancerType}, {simulationData.persona.diagnosis.stage}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Conversation Summary</h3>
                    <p className="text-gray-600">{simulationData.conversation.length} messages exchanged</p>
                    <p className="text-gray-600">Key topics: anxiety, family concerns, upcoming scans</p>
                  </div>
                  
                  <div className="flex space-x-4">
                    <Link 
                      href={`/admin/llm-test/personas?id=${simulationData.persona.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Persona
                    </Link>
                    <Link 
                      href={`/admin/llm-test/simulator?personaId=${simulationData.persona.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Simulation
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No simulation data available.</p>
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-bold mb-4">Evaluation Configuration</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accuracy Weight: {evaluationConfig.accuracyWeight}
                  </label>
                  <input
                    type="range"
                    name="accuracyWeight"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={evaluationConfig.accuracyWeight}
                    onChange={handleConfigChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">How accurately the assessment reflects the conversation</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empathy Weight: {evaluationConfig.empathyWeight}
                  </label>
                  <input
                    type="range"
                    name="empathyWeight"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={evaluationConfig.empathyWeight}
                    onChange={handleConfigChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">How well the assessment captures emotional needs</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clarity Weight: {evaluationConfig.clarityWeight}
                  </label>
                  <input
                    type="range"
                    name="clarityWeight"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={evaluationConfig.clarityWeight}
                    onChange={handleConfigChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">How clear and actionable the assessment is</p>
                </div>
                
                <button
                  onClick={startEvaluation}
                  disabled={!simulationData || evaluationInProgress}
                  className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    !simulationData || evaluationInProgress ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  {evaluationInProgress ? 'Evaluating...' : 'Start Evaluation'}
                </button>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-bold mb-4">Original Assessment</h2>
              
              {simulationData ? (
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{simulationData.assessment}</pre>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <p>No assessment available.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Right Column - Evaluation Results */}
      <div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Evaluation Results</h2>
          
          {evaluationInProgress ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-pulse flex space-x-2 mb-4">
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
              </div>
              <p className="text-gray-500">Evaluating assessment quality...</p>
            </div>
          ) : evaluationComplete && evaluationResults ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">Overall Score</h3>
                  <div className="text-2xl font-bold">
                    {evaluationResults.overallScore * 100}%
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      evaluationResults.overallScore >= 0.8 ? 'bg-green-500' :
                      evaluationResults.overallScore >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} 
                    style={{ width: `${evaluationResults.overallScore * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(evaluationResults.scores).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-medium capitalize">{key}</h4>
                      <span className="text-sm font-bold">{value.score * 100}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                      <div 
                        className={`h-1.5 rounded-full ${
                          value.score >= 0.8 ? 'bg-green-500' :
                          value.score >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${value.score * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">{value.feedback}</p>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-green-700 mb-2">Strengths</h3>
                  <ul className="text-xs space-y-1">
                    {evaluationResults.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-1">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-red-700 mb-2">Weaknesses</h3>
                  <ul className="text-xs space-y-1">
                    {evaluationResults.weaknesses.map((weakness: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-1">✗</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-blue-700 mb-2">Suggested Improvements</h3>
                  <ul className="text-xs space-y-1">
                    {evaluationResults.suggestedImprovements.map((suggestion: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-1">→</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Refined Assessment</h3>
                <div className="prose prose-sm max-w-none bg-green-50 p-4 rounded-lg border border-green-100">
                  <pre className="whitespace-pre-wrap font-sans text-sm">{evaluationResults.refinedAssessment}</pre>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <Link 
                  href="/admin/llm-test/refinement"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Refine Prompts
                </Link>
                <button
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Results
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No evaluation results yet.</p>
              <p className="text-sm mt-2">Configure and start an evaluation to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 