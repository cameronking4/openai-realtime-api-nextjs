'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SimulatorPage() {
  const searchParams = useSearchParams();
  const personaId = searchParams.get('personaId');
  
  const [persona, setPersona] = useState<any | null>(null);
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [simulationConfig, setSimulationConfig] = useState({
    maxTurns: 10,
    randomness: 0.3,
  });
  const [currentTurn, setCurrentTurn] = useState(0);
  const [assessment, setAssessment] = useState('');
  const [metrics, setMetrics] = useState({
    totalTurns: 0,
    topicsChanged: 0,
    questionsAsked: 0,
    questionsAnswered: 0,
    emotionalResponses: 0,
    avoidantResponses: 0,
  });

  // Load persona if personaId is provided
  useEffect(() => {
    if (personaId) {
      // In a real app, you would fetch the persona from an API or state management
      // For now, we'll create a mock persona
      const mockPersona = {
        id: personaId,
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
        },
        communication: {
          articulationLevel: 7,
          openness: 5,
          directness: 4,
          emotionalExpression: 6
        },
        background: {
          familyStatus: 'Married with two adult children',
          occupation: 'Retired teacher',
          importantLifeEvents: [
            'Husband had heart attack 2 years ago',
            'Birth of first grandchild last year',
            'Retirement 3 years ago'
          ],
          supportSystem: [
            'Husband (primary caregiver)',
            'Daughter (visits weekly)',
            'Church community group'
          ]
        },
        behavioralPatterns: [
          'Tends to minimize physical symptoms',
          'Changes subject when discussing mortality',
          'Takes notes during medical appointments'
        ],
        personalConcerns: [
          'Worried about being a burden to family',
          'Anxious about treatment side effects',
          'Concerned about missing grandchild\'s early years'
        ]
      };
      
      setPersona(mockPersona);
    }
  }, [personaId]);

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSimulationConfig(prev => ({
      ...prev,
      [name]: name === 'maxTurns' ? parseInt(value) : parseFloat(value)
    }));
  };

  const startSimulation = () => {
    if (!persona) return;
    
    setIsSimulating(true);
    setSimulationComplete(false);
    setCurrentTurn(0);
    setConversation([{
      role: 'assistant',
      content: "Hello, I'm here to support you through your cancer journey. How are you feeling today, and is there anything specific you'd like to talk about?"
    }]);
    
    // Reset metrics
    setMetrics({
      totalTurns: 0,
      topicsChanged: 0,
      questionsAsked: 0,
      questionsAnswered: 0,
      emotionalResponses: 0,
      avoidantResponses: 0,
    });
    
    // Start the simulation loop
    simulateNextTurn(0);
  };

  const simulateNextTurn = (turn: number) => {
    if (turn >= simulationConfig.maxTurns) {
      // Simulation complete
      setIsSimulating(false);
      setSimulationComplete(true);
      generateAssessment();
      return;
    }
    
    // Simulate patient response
    setTimeout(() => {
      const patientResponse = generatePatientResponse();
      setConversation(prev => [...prev, { role: 'user', content: patientResponse }]);
      
      // Update metrics
      setMetrics(prev => ({
        ...prev,
        totalTurns: prev.totalTurns + 0.5,
        questionsAsked: prev.questionsAsked + (patientResponse.includes('?') ? 1 : 0),
        emotionalResponses: prev.emotionalResponses + (Math.random() > 0.7 ? 1 : 0),
        topicsChanged: prev.topicsChanged + (Math.random() > 0.7 ? 1 : 0),
      }));
      
      // Simulate assistant response
      setTimeout(() => {
        const assistantResponse = generateAssistantResponse();
        setConversation(prev => [...prev, { role: 'assistant', content: assistantResponse }]);
        
        // Update metrics
        setMetrics(prev => ({
          ...prev,
          totalTurns: prev.totalTurns + 0.5,
          questionsAsked: prev.questionsAsked + (assistantResponse.includes('?') ? 1 : 0),
          questionsAnswered: prev.questionsAnswered + (Math.random() > 0.3 ? 1 : 0),
        }));
        
        setCurrentTurn(turn + 1);
        simulateNextTurn(turn + 1);
      }, 1000);
    }, 1000);
  };

  const generatePatientResponse = () => {
    // In a real app, this would call the LLM API
    // For now, we'll use mock responses based on the persona
    const anxietyResponses = [
      "I'm really worried about my next scan. What if the cancer has spread?",
      "I can't sleep at night thinking about what might happen to my family if things get worse.",
      "The side effects are making me anxious. Is this normal or should I be concerned?",
      "I keep thinking about the worst-case scenarios. It's hard to stay positive."
    ];
    
    const generalResponses = [
      "I'm having good days and bad days. Today is somewhere in the middle.",
      "The treatment is challenging, but I'm trying to stay positive.",
      "My family has been supportive, which helps a lot.",
      "I'm concerned about how long this will all take, but I'm committed to the process.",
      "I've been trying to maintain some normalcy in my life, but it's difficult.",
      "I'm not sure what questions I should be asking my doctors.",
      "Sometimes I feel like I'm just going through the motions."
    ];
    
    // Choose response based on persona's anxiety level
    if (persona?.psychologicalProfile.anxiety > 6 && Math.random() > 0.5) {
      return anxietyResponses[Math.floor(Math.random() * anxietyResponses.length)];
    } else {
      return generalResponses[Math.floor(Math.random() * generalResponses.length)];
    }
  };

  const generateAssistantResponse = () => {
    // In a real app, this would call the cancer chat API
    // For now, we'll use mock responses
    const responses = [
      "I understand that must be difficult. How have you been coping with those feelings?",
      "Thank you for sharing that with me. Have you discussed these concerns with your healthcare team?",
      "That's completely understandable given what you're going through. What helps you feel better when you're feeling this way?",
      "I'm here to support you through this. Would it help to talk more about your treatment plan or would you prefer to discuss something else?",
      "Many people in your situation experience similar feelings. What kind of support would be most helpful for you right now?",
      "It sounds like you're dealing with a lot. Have you found any strategies that help you manage the uncertainty?",
      "I hear your concerns. Is there a specific aspect of your treatment that's causing you the most worry?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generateAssessment = () => {
    // In a real app, this would call the LLM API to generate an assessment
    // For now, we'll use a mock assessment
    const mockAssessment = `
Clinical Assessment Note

Patient: ${persona?.name}, ${persona?.age}
Diagnosis: ${persona?.diagnosis.cancerType}, ${persona?.diagnosis.stage}

Psychological State:
The patient presents with ${persona?.psychologicalProfile.anxiety > 7 ? 'high' : 
  persona?.psychologicalProfile.anxiety > 4 ? 'moderate' : 'low'} anxiety and 
${persona?.psychologicalProfile.depression > 7 ? 'significant' : 
  persona?.psychologicalProfile.depression > 4 ? 'moderate' : 'minimal'} depressive symptoms.
Overall distress level appears ${persona?.psychologicalProfile.distress > 7 ? 'severe' : 
  persona?.psychologicalProfile.distress > 4 ? 'moderate' : 'mild'}.

Coping Mechanisms:
Patient demonstrates ${persona?.psychologicalProfile.selfEfficacy > 7 ? 'strong' : 
  persona?.psychologicalProfile.selfEfficacy > 4 ? 'adequate' : 'limited'} self-efficacy.
${persona?.communication.openness > 7 ? 'Openly discusses' : 
  persona?.communication.openness > 4 ? 'Sometimes shares' : 'Tends to avoid discussing'} concerns and emotions.

Support Needs:
Support network appears ${persona?.psychologicalProfile.supportNetworkStrength > 7 ? 'strong' : 
  persona?.psychologicalProfile.supportNetworkStrength > 4 ? 'adequate' : 'limited'}.
Would benefit from additional support in: 
${persona?.psychologicalProfile.anxiety > 7 ? 'anxiety management, ' : ''}
${persona?.psychologicalProfile.depression > 7 ? 'depression management, ' : ''}
${persona?.psychologicalProfile.selfEfficacy < 5 ? 'building self-efficacy, ' : ''}
${persona?.psychologicalProfile.supportNetworkStrength < 5 ? 'expanding support network' : ''}

Recommendations:
1. ${persona?.psychologicalProfile.anxiety > 7 ? 'Anxiety management techniques and possible referral to psycho-oncology.' : 
    'Continue monitoring anxiety levels.'}
2. ${persona?.psychologicalProfile.depression > 7 ? 'Depression screening and possible intervention.' : 
    'Regular check-ins regarding mood and emotional state.'}
3. ${persona?.psychologicalProfile.supportNetworkStrength < 5 ? 'Connect with cancer support groups.' : 
    'Encourage continued engagement with existing support network.'}
4. ${persona?.communication.openness < 5 ? 'Gentle encouragement to express concerns and emotions.' : 
    'Maintain open communication channels.'}

Follow-up recommended in 2 weeks to reassess psychological state and coping strategies.
    `;
    
    setAssessment(mockAssessment);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Persona & Config */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Patient Persona</h2>
          
          {persona ? (
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium">{persona.name}</h3>
                <p className="text-gray-500">{persona.age} years old, {persona.gender}</p>
                <p className="text-gray-500">{persona.diagnosis.cancerType}, {persona.diagnosis.stage}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm font-medium">Anxiety</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${persona.psychologicalProfile.anxiety * 10}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Depression</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${persona.psychologicalProfile.depression * 10}%` }}></div>
                  </div>
                </div>
              </div>
              
              <Link 
                href={`/admin/llm-test/personas?id=${persona.id}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View full persona details
              </Link>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <p>No persona selected.</p>
              <Link 
                href="/admin/llm-test/personas"
                className="text-blue-600 hover:text-blue-800 block mt-2"
              >
                Select a persona
              </Link>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Simulation Config</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="maxTurns" className="block text-sm font-medium text-gray-700 mb-1">
                Max Conversation Turns
              </label>
              <input
                type="number"
                id="maxTurns"
                name="maxTurns"
                min="1"
                max="20"
                value={simulationConfig.maxTurns}
                onChange={handleConfigChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="randomness" className="block text-sm font-medium text-gray-700 mb-1">
                Randomness (0-1)
              </label>
              <input
                type="number"
                id="randomness"
                name="randomness"
                min="0"
                max="1"
                step="0.1"
                value={simulationConfig.randomness}
                onChange={handleConfigChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Higher values create more varied responses</p>
            </div>
            
            <button
              onClick={startSimulation}
              disabled={!persona || isSimulating}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                !persona || isSimulating ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isSimulating ? 'Simulating...' : 'Start Simulation'}
            </button>
          </div>
        </div>
        
        {simulationComplete && (
          <div className="bg-white p-6 rounded-lg shadow-md mt-6">
            <h2 className="text-xl font-bold mb-4">Simulation Metrics</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Turns:</span>
                <span className="font-medium">{metrics.totalTurns}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Topics Changed:</span>
                <span className="font-medium">{metrics.topicsChanged}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Questions Asked:</span>
                <span className="font-medium">{metrics.questionsAsked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Questions Answered:</span>
                <span className="font-medium">{metrics.questionsAnswered}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Emotional Responses:</span>
                <span className="font-medium">{metrics.emotionalResponses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avoidant Responses:</span>
                <span className="font-medium">{metrics.avoidantResponses}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <Link 
                href={`/admin/llm-test/evaluator?simulationId=${persona?.id}-${Date.now()}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Evaluate Results
              </Link>
            </div>
          </div>
        )}
      </div>
      
      {/* Middle Column - Conversation */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md h-full">
          <h2 className="text-xl font-bold mb-4">Conversation</h2>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {conversation.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No conversation yet.</p>
                <p className="text-sm mt-2">Start a simulation to see the conversation.</p>
              </div>
            ) : (
              conversation.map((message, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg ${
                    message.role === 'assistant' 
                      ? 'bg-blue-50 border border-blue-100' 
                      : 'bg-green-50 border border-green-100 ml-4'
                  }`}
                >
                  <div className="text-xs font-medium mb-1 text-gray-500">
                    {message.role === 'assistant' ? 'AI Assistant' : persona?.name}
                  </div>
                  <div>{message.content}</div>
                </div>
              ))
            )}
            
            {isSimulating && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            {isSimulating && (
              <div>Simulating turn {currentTurn + 1} of {simulationConfig.maxTurns}...</div>
            )}
            {simulationComplete && (
              <div>Simulation complete. {conversation.length} messages exchanged.</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right Column - Assessment */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">AI Assessment</h2>
          
          {assessment ? (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm">{assessment}</pre>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No assessment generated yet.</p>
              <p className="text-sm mt-2">Complete a simulation to generate an assessment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 