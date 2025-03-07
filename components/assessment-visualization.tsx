"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface MetricScore {
  score: number;
  confidence: number;
  justification: string;
}

interface AssessmentData {
  metrics: {
    anxiety: MetricScore;
    depression: MetricScore;
    distress: MetricScore;
    efficacy: MetricScore;
    support: MetricScore;
    collaboration: MetricScore;
    alliance: MetricScore;
    risk: MetricScore;
  };
  communication?: {
    sentiment: string;
    patterns: string[];
  };
  summaries?: {
    clinical: string;
    patient: string;
  };
}

interface AssessmentVisualizationProps {
  assessment: string | null;
  isLoading: boolean;
  onViewFullAssessment: () => void;
}

export default function AssessmentVisualization({
  assessment,
  isLoading,
  onViewFullAssessment,
}: AssessmentVisualizationProps) {
  const [parsedData, setParsedData] = React.useState<AssessmentData | null>(null);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [patientMessage, setPatientMessage] = React.useState<string | null>(null);

  // Parse the assessment data
  React.useEffect(() => {
    if (assessment) {
      try {
        // First, try to extract JSON from the text response
        // The API might return text with JSON embedded in it
        const jsonRegex = /{[\s\S]*}/;
        const match = assessment.match(jsonRegex);
        
        let jsonString = match ? match[0] : assessment;
        
        // Clean up the string - sometimes there are escaped quotes or newlines
        jsonString = jsonString.replace(/\\"/g, '"').replace(/\\n/g, '');
        
        console.log("Attempting to parse:", jsonString.substring(0, 100) + "...");
        
        // Try to parse the JSON
        const assessmentObj = JSON.parse(jsonString);
        
        // Validate that it has the expected structure
        if (assessmentObj && assessmentObj.metrics) {
          console.log("Successfully parsed assessment data");
          setParsedData(assessmentObj);
          setParseError(null);
          setPatientMessage(null); // Reset patient message when parse succeeds
        } else {
          console.error("Assessment data is missing required metrics", assessmentObj);
          setParseError("Assessment data is missing required metrics");
          setParsedData(null);
        }
      } catch (e) {
        console.error("Failed to parse assessment JSON:", e);
        
        // Try a more aggressive approach to extract JSON
        try {
          const startIdx = assessment.indexOf('{');
          const endIdx = assessment.lastIndexOf('}');
          
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const jsonCandidate = assessment.substring(startIdx, endIdx + 1);
            console.log("Trying alternative extraction:", jsonCandidate.substring(0, 100) + "...");
            
            const assessmentObj = JSON.parse(jsonCandidate);
            
            if (assessmentObj && assessmentObj.metrics) {
              console.log("Successfully parsed assessment data with alternative method");
              setParsedData(assessmentObj);
              setParseError(null);
              setPatientMessage(null); // Reset patient message when parse succeeds
              return;
            }
          }
        } catch (e2) {
          console.error("Alternative parsing also failed:", e2);
        }
        
        setParseError("Could not parse assessment data");
        setParsedData(null);
      }
    } else {
      setParsedData(null);
      setParseError(null);
      setPatientMessage(null);
    }
  }, [assessment]);

  // Extract patient message from the assessment text when there's a parse error
  React.useEffect(() => {
    if (assessment && parseError) {
      try {
        // Try to find patient message using regex
        const patientMessageRegex = /"patient":\s*"([^"]*)"/;
        const match = assessment.match(patientMessageRegex);
        
        if (match && match[1]) {
          setPatientMessage(match[1]);
        } else {
          // Alternative approach - look for a section that might be the patient message
          if (assessment.includes("patient-friendly summary") || 
              assessment.includes("Patient Summary") || 
              assessment.includes("Patient Message")) {
            
            const lines = assessment.split('\n');
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes("patient-friendly summary") || 
                  lines[i].includes("Patient Summary") || 
                  lines[i].includes("Patient Message")) {
                // Take the next few lines as the patient message
                const message = lines.slice(i+1, i+6).join('\n').trim();
                if (message) {
                  setPatientMessage(message);
                  break;
                }
              }
            }
          } else {
            // If no patient message found, set to null
            setPatientMessage(null);
          }
        }
      } catch (e) {
        console.error("Error extracting patient message:", e);
        setPatientMessage(null);
      }
    } else if (!parseError) {
      // Reset patient message when there's no parse error
      setPatientMessage(null);
    }
  }, [assessment, parseError]);

  // Additional debounced logging for debugging
  React.useEffect(() => {
    if (assessment) {
      console.log('AssessmentVisualization: assessment prop changed', assessment.substring(0, 50) + '...');
    } else {
      console.log('AssessmentVisualization: assessment prop is null');
    }
  }, [assessment]);

  // Additional logging for state changes
  React.useEffect(() => {
    console.log('AssessmentVisualization: parseError state changed', parseError);
  }, [parseError]);

  React.useEffect(() => {
    console.log('AssessmentVisualization: parsedData state changed', parsedData ? 'contains data' : 'null');
  }, [parsedData]);

  React.useEffect(() => {
    console.log('AssessmentVisualization: patientMessage state changed', patientMessage);
  }, [patientMessage]);

  if (isLoading) {
    return (
      <div className="w-full p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Generating psychological assessment...
          </p>
        </div>
      </div>
    );
  }

  if (parseError) {
    return (
      <div className="w-full p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <div className="flex items-center text-amber-500 mb-4">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Assessment Format Issue</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          {parseError}. The assessment was generated but couldn't be visualized in the standard format.
        </p>
        
        {/* Patient Message (if found) */}
        {patientMessage && (
          <div className="mb-4">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Patient Message
            </h4>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-md text-sm">
              {patientMessage}
            </div>
          </div>
        )}
        
        {/* Fallback visualization - simple text display */}
        {assessment && (
          <div className="mb-4">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Assessment Text
            </h4>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-md text-sm max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {assessment}
              </pre>
            </div>
          </div>
        )}
        
        <button 
          onClick={onViewFullAssessment}
          className="text-primary hover:underline mt-2"
        >
          View Full Assessment
        </button>
      </div>
    );
  }

  if (!parsedData) {
    return (
      <div className="w-full p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <div className="flex items-center text-amber-500 mb-4">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <h3 className="font-medium">No Assessment Data</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          No assessment data is available for visualization.
        </p>
        
        {assessment && (
          <div className="mb-4">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Assessment Text
            </h4>
            <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-md text-sm max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-xs">
                {assessment}
              </pre>
            </div>
          </div>
        )}
        
        <button 
          onClick={onViewFullAssessment}
          className="text-primary hover:underline mt-2"
        >
          View Full Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
        Psychological Assessment Results
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {Object.entries(parsedData.metrics).map(([key, metric]) => (
          <MetricGauge 
            key={key}
            name={key}
            score={metric.score}
            confidence={metric.confidence}
            justification={metric.justification}
          />
        ))}
      </div>
      
      {parsedData.communication && (
        <div className="mb-6">
          <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
            Communication Sentiment
          </h4>
          <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md">
            {parsedData.communication.sentiment}
          </div>
        </div>
      )}
      
      {parsedData.summaries && (
        <>
          <div className="mb-4">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Clinical Summary
            </h4>
            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md text-sm">
              {parsedData.summaries.clinical}
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-2">
              Patient Message
            </h4>
            <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-md text-sm">
              {parsedData.summaries.patient}
            </div>
          </div>
        </>
      )}
      
      <button 
        onClick={onViewFullAssessment}
        className="text-primary hover:underline mt-2"
      >
        View Full Assessment
      </button>
    </div>
  );
}

interface MetricGaugeProps {
  name: string;
  score: number;
  confidence: number;
  justification: string;
}

function MetricGauge({ name, score, confidence, justification }: MetricGaugeProps) {
  // Format the name to be more readable
  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };
  
  // Determine color based on the metric and score
  const getColor = (name: string, score: number) => {
    // For metrics where higher is worse (anxiety, depression, distress, risk)
    if (['anxiety', 'depression', 'distress', 'risk'].includes(name)) {
      if (score <= 3) return 'bg-green-500';
      if (score <= 6) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    // For metrics where higher is better (efficacy, support, collaboration, alliance)
    else {
      if (score >= 7) return 'bg-green-500';
      if (score >= 4) return 'bg-yellow-500';
      return 'bg-red-500';
    }
  };
  
  const color = getColor(name, score);
  
  return (
    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-base font-medium text-slate-700 dark:text-slate-300">
          {formatName(name)}
        </span>
        <div className="flex items-center">
          <span className="text-lg font-semibold text-slate-700 dark:text-slate-300 mr-2">
            {score}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            /10
          </span>
        </div>
      </div>
      
      <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 mb-3">
        <motion.div 
          className={`h-3 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      
      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-3">
        <span>Confidence: {(confidence * 10).toFixed(1)}/10</span>
      </div>
      
      <div className="mt-2">
        <h5 className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
          Justification:
        </h5>
        <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-600 p-2 rounded-md min-h-[80px]">
          {justification}
        </div>
      </div>
    </div>
  );
} 