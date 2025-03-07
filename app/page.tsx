"use client"

import React, { useEffect, useState } from "react"
import useWebRTCAudioSession from "@/hooks/use-webrtc"
import { tools } from "@/lib/tools"
import { Welcome } from "@/components/welcome"
import { BroadcastButton } from "@/components/broadcast-button"
import { StatusDisplay } from "@/components/status"
import { TextInput } from "@/components/text-input"
import { motion } from "framer-motion"
import { useToolsFunctions } from "@/hooks/use-tools"
import { useVoiceContext } from "../contexts/voice-context"
import { useTokenContext } from "../contexts/token-context"
import { useModalityContext } from "../contexts/modality-context"
import { Message as MessageType } from "@/types"
import Transcriber from "@/components/ui/transcriber"
import { Header } from "@/components/header"
import RealtimeBlock from "@/components/realtime-block"
import ChatBox from "@/components/ChatBox"
import TakeAMomentButton from "@/components/take-a-moment-button"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import NetworkErrorAlert from "@/components/network-error-alert"
import TranscriptModal from "@/components/transcript-modal"
import AssessmentModal from "@/components/assessment-modal"
import AssessmentVisualization from "@/components/assessment-visualization"
import { generateTranscript, saveTranscript, Transcript } from "@/lib/transcript-service"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { X } from "lucide-react"

// Session state type
type SessionState = "pre" | "active" | "post";

const App: React.FC = () => {
  // Session state
  const [sessionState, setSessionState] = useState<SessionState>("pre");
  const [isPaused, setIsPaused] = useState(false);
  
  // Get voice from context
  const { voice } = useVoiceContext();
  
  // Get token context
  const { updateMessages, resetTokenUsage } = useTokenContext();

  // Get modality context
  const { modality, setModality, isAudioEnabled } = useModalityContext();
  
  // State to store messages for the header
  const [headerMessages, setHeaderMessages] = useState<MessageType[]>([]);

  // WebRTC Audio Session Hook
  const {
    status,
    isSessionActive,
    registerFunction,
    handleStartStopClick,
    msgs,
    conversation,
    sendTextMessage,
    currentVolume,
    updateModality,
    currentModality
  } = useWebRTCAudioSession(voice, tools)

  // State to track network connectivity issues
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [networkErrorMessage, setNetworkErrorMessage] = useState("");

  // State for transcript and modal
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);
  const [assessment, setAssessment] = useState<string | null>(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [assessmentLoading, setAssessmentLoading] = useState(false);
  const [testData, setTestData] = useState<{ prompt: string; rawResponse: string } | null>(null);
  const [assessmentSummary, setAssessmentSummary] = useState<string | null>(null);
  const [assessmentError, setAssessmentError] = useState<string | null>(null);
  const [patientSummary, setPatientSummary] = useState<string | null>(null);
  const [pendingAnalysis, setPendingAnalysis] = useState(false);
  const [showFullAssessment, setShowFullAssessment] = useState(false);

  // Update token context with messages
  useEffect(() => {
    updateMessages(msgs);
    // Update header messages
    setHeaderMessages(msgs);
  }, [msgs, updateMessages]);

  // Update the WebRTC session when modality changes
  useEffect(() => {
    // Only update if the current modality in the WebRTC session doesn't match the context modality
    if (modality !== currentModality) {
      updateModality(modality);
    }
  }, [modality, updateModality, currentModality]);

  // Get all tools functions
  const toolsFunctions = useToolsFunctions();

  useEffect(() => {
    // Register all functions by iterating over the object
    Object.entries(toolsFunctions).forEach(([name, func]) => {
      const functionNames: Record<string, string> = {
        timeFunction: 'getCurrentTime',
        backgroundFunction: 'changeBackgroundColor',
        partyFunction: 'partyMode',
        launchWebsite: 'launchWebsite', 
        copyToClipboard: 'copyToClipboard',
        scrapeWebsite: 'scrapeWebsite'
      };
      
      registerFunction(functionNames[name], func);
    });
  }, [registerFunction, toolsFunctions]);

  // Monitor status for network connectivity issues
  useEffect(() => {
    const isNetworkError = status.toLowerCase().includes('network connectivity') || 
                          status.toLowerCase().includes('cannot reach') ||
                          status.toLowerCase().includes('enotfound');
    
    if (isNetworkError) {
      setHasNetworkError(true);
      setNetworkErrorMessage(status);
    } else {
      setHasNetworkError(false);
    }
  }, [status]);

  // Start session handler
  const handleStartSession = () => {
    setSessionState("active");
    
    // Always start the WebRTC session, even in text-only mode
    // This ensures the data channel is created for text messages
    if (!isSessionActive) {
      handleStartStopClick();
    }
  };

  // End session handler
  const handleEndSession = () => {
    setSessionState("post");
    if (isSessionActive) {
      handleStartStopClick();
    }
    
    // Generate and save transcript
    const sessionId = `session_${Date.now()}`;
    const newTranscript = generateTranscript(conversation, sessionId);
    saveTranscript(newTranscript);
    setTranscript(newTranscript);
  };

  // Handle voice toggle
  const handleVoiceToggle = (isActive: boolean) => {
    if (isActive !== isSessionActive) {
      handleStartStopClick();
    }
  };

  // Handle modality toggle
  const handleModalityToggle = (isChecked: boolean) => {
    const newModality = isChecked ? "text+audio" : "text";
    console.log(`Switching modality to: ${newModality}`);
    setModality(newModality);
  };

  // Handle pause/resume
  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  // Generate assessment from transcript
  const generateAssessment = async () => {
    if (conversation.length < 2) {
      // Need at least one user message and one assistant response
      setAssessmentError('Conversation needs at least one exchange before generating an assessment');
      return;
    }
    
    setAssessmentLoading(true);
    setAssessmentError(null);
    setAssessment(null);
    
    try {
      // Get the transcript content
      const transcriptContent = conversation.map(item => 
        `${item.role.toUpperCase()}: ${item.text}`
      ).join('\n\n');
      
      console.log("Generating assessment for transcript...");
      
      // Call the assessment API
      const response = await fetch('/api/assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: transcriptContent }),
      });
      
      if (!response.ok) {
        let errorMessage = `API error: ${response.status} ${response.statusText}`;
        
        // Try to parse error details from the response
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = `API error: ${errorData.error}`;
            if (errorData.details) {
              errorMessage += ` - ${errorData.details}`;
            }
          }
        } catch (jsonError) {
          console.error("Failed to parse error response:", jsonError);
        }
        
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!data.success || !data.assessment) {
        throw new Error('Invalid response from assessment API');
      }
      
      console.log("Received assessment data. JSON extracted:", data.jsonExtracted);
      setAssessment(data.assessment);
      
      // Try to extract a summary from the assessment
      try {
        // Look for JSON pattern in the assessment
        const jsonRegex = /{[\s\S]*}/;
        const match = data.assessment.match(jsonRegex);
        
        if (match) {
          try {
            const assessmentObj = JSON.parse(match[0]);
            if (assessmentObj.summaries && assessmentObj.summaries.patient) {
              setPatientSummary(assessmentObj.summaries.patient);
            }
          } catch (parseError) {
            console.error("Failed to parse extracted JSON:", parseError);
          }
        }
      } catch (error) {
        console.error("Error extracting summary from assessment:", error);
      }
      
      setPendingAnalysis(false);
    } catch (error) {
      console.error("Error generating assessment:", error);
      setAssessmentError(error instanceof Error ? error.message : String(error));
    } finally {
      setAssessmentLoading(false);
    }
  };

  // Render different content based on session state
  const renderSessionContent = () => {
    switch (sessionState) {
      case "pre":
        return (
          <motion.div 
            className="flex flex-col items-center justify-center text-center space-y-6 p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              Psycho-Oncology Assessment
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-md">
              This assessment will help us understand your wellbeing and mental health status. 
              Your responses will be used to provide personalized support through your cancer journey.
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
              The session will take approximately 5-10 minutes. You can pause at any time if you need a break.
            </p>
            <div className="flex flex-col items-center space-y-2 mt-4 mb-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="modality-toggle"
                  checked={modality === "text+audio"}
                  onCheckedChange={handleModalityToggle}
                />
                <Label htmlFor="modality-toggle">{modality === "text+audio" ? "Voice conversation enabled" : "Text-only conversation"}</Label>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can switch between text and voice modes at any time during the session.
              </p>
            </div>
            <Button 
              onClick={handleStartSession}
              size="lg"
              className="mt-4"
            >
              Begin Assessment
            </Button>
          </motion.div>
        );
      
      case "active":
        return (
          <>
            <ChatBox conversation={conversation}>
              <div className="flex justify-between items-center">
                <div className="w-1/3">
                  <TakeAMomentButton onPause={handlePause} onResume={handleResume} />
                </div>
                <div className="w-1/3 flex justify-center">
                  <RealtimeBlock 
                    voice={voice}
                    isSessionActive={isSessionActive && !isPaused}
                    handleStartStopClick={handleStartStopClick}
                    msgs={msgs}
                    currentVolume={currentVolume}
                  />
                </div>
                <div className="w-1/3 flex justify-end space-x-2">
                  {sessionState !== "active" && sessionState !== "post" && (
                    <div className="flex items-center space-x-2 bg-white dark:bg-slate-800 px-3 py-1 rounded-lg shadow-sm">
                      <Switch
                        id="modality-toggle-active"
                        checked={modality === "text+audio"}
                        onCheckedChange={handleModalityToggle}
                      />
                      <Label htmlFor="modality-toggle-active" className="text-sm">
                        {modality === "text+audio" ? "Voice enabled" : "Text only"}
                      </Label>
                    </div>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={handleEndSession}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    End Session
                  </Button>
                </div>
              </div>
            </ChatBox>
            
            <div className="mt-4 w-full">
              <TextInput 
                onSubmit={sendTextMessage}
                disabled={!isSessionActive || isPaused}
                onVoiceToggle={isAudioEnabled ? handleVoiceToggle : undefined}
                isVoiceActive={isAudioEnabled && isSessionActive}
                lastAssistantMessage={conversation.length > 0 
                  ? conversation.filter(msg => msg.role === 'assistant' && msg.isFinal).pop()?.text || ""
                  : ""}
              />
            </div>
            
            <StatusDisplay status={isPaused ? "Session paused" : (status || "Active session")} />
          </>
        );
      
      case "post":
        return (
          <motion.div 
            className="flex flex-col items-center justify-center text-center space-y-6 p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              Assessment Complete
            </h2>
            <p className="text-slate-600 dark:text-slate-300 max-w-md">
              Thank you for completing your assessment. Your responses have been recorded.
            </p>
            
            {/* Assessment Section */}
            <div className="mt-8 w-full max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment</CardTitle>
                  <CardDescription>
                    Generate a psychological assessment based on the conversation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col space-y-4">
                    {!transcript && (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md">
                        <p>No transcript available. Complete a session first to generate an assessment.</p>
                      </div>
                    )}
                    
                    <div className="flex space-x-4">
                      <Button 
                        variant={assessment ? "outline" : "default"}
                        onClick={generateAssessment}
                        disabled={!transcript || assessmentLoading}
                      >
                        {assessmentLoading ? 'Generating...' : (assessment ? 'Regenerate Assessment' : 'Generate Assessment')}
                      </Button>
                      
                      {assessment && (
                        <Button variant="outline" onClick={() => setShowFullAssessment(true)}>
                          View Full Assessment
                        </Button>
                      )}
                    </div>
                    
                    {assessmentError && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-md">
                        <p>{assessmentError}</p>
                      </div>
                    )}
                    
                    {assessment && (
                      <AssessmentVisualization 
                        assessment={assessment}
                        isLoading={assessmentLoading}
                        onViewFullAssessment={() => setShowFullAssessment(true)}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex space-x-4 mt-4">
              <Button 
                variant="outline"
                onClick={() => setIsTranscriptModalOpen(true)}
              >
                View Transcript
              </Button>
              <Button 
                onClick={() => {
                  setSessionState("pre");
                  resetTokenUsage();
                }}
              >
                Start New Session
              </Button>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <NetworkErrorAlert 
        isVisible={hasNetworkError} 
        message={networkErrorMessage} 
      />
      <Header messages={headerMessages} />
      <main className="flex flex-1 justify-center items-center w-full">
        <motion.div 
          className="container flex flex-col items-center justify-center mx-auto max-w-4xl my-10 p-8 border rounded-lg shadow-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {renderSessionContent()}
        </motion.div>
      </main>
      
      {/* Transcript Modal */}
      <TranscriptModal 
        transcript={transcript}
        isOpen={isTranscriptModalOpen}
        onClose={() => setIsTranscriptModalOpen(false)}
      />
      
      {/* Assessment Modal */}
      <AssessmentModal 
        assessment={assessment}
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        isLoading={assessmentLoading}
        testData={testData}
      />
      
      {/* Full Assessment Modal */}
      {showFullAssessment && assessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Full Assessment</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowFullAssessment(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm">
                {assessment}
              </pre>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowFullAssessment(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App;