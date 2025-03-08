"use client";

import React, { useState, useEffect, useRef } from 'react';

// Define the props interface
interface GateSettingsProps {
  onThresholdChange: (threshold: number) => void;
  onAiThresholdChange: (threshold: number) => void;
  initialThreshold?: number;
  initialAiThreshold?: number;
  // Add turn detection props
  turnDetectionThreshold?: number;
  onTurnDetectionThresholdChange?: (threshold: number) => void;
  silenceDurationMs?: number;
  onSilenceDurationMsChange?: (duration: number) => void;
  updateTurnDetectionSettings?: () => void;
  // Add prop for enabling/disabling audio processing
  onAudioProcessingChange?: (enabled: boolean) => void;
}

const GateSettings: React.FC<GateSettingsProps> = ({
  onThresholdChange,
  onAiThresholdChange,
  initialThreshold = -30, // Default threshold in dB
  initialAiThreshold = -40, // Default AI threshold in dB
  // Add turn detection props with defaults
  turnDetectionThreshold = 0.5,
  onTurnDetectionThresholdChange = () => {},
  silenceDurationMs = 500,
  onSilenceDurationMsChange = () => {},
  updateTurnDetectionSettings = () => {},
  // Add prop for enabling/disabling audio processing
  onAudioProcessingChange = () => {}
}) => {
  // State for the threshold values
  const [threshold, setThreshold] = useState(initialThreshold);
  const [aiThreshold, setAiThreshold] = useState(initialAiThreshold);
  const [isExpanded, setIsExpanded] = useState(false); // Default to collapsed
  
  // State for turn detection settings
  const [turnThreshold, setTurnThreshold] = useState(turnDetectionThreshold);
  const [silenceDuration, setSilenceDuration] = useState(silenceDurationMs);
  const [showTurnSettings, setShowTurnSettings] = useState(false);
  
  // State for monitoring gate activity (for visualization)
  const [gateOpen, setGateOpen] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [micLevel, setMicLevel] = useState(-60);
  const [aiLevel, setAiLevel] = useState(-60);
  const [micPeakLevel, setMicPeakLevel] = useState(-60); // Peak level with slow decay
  
  // Add state for audio level history
  const [micLevelHistory, setMicLevelHistory] = useState<number[]>(Array(60).fill(-60)); // More data points
  
  // Add state for processed audio (what's being sent to OpenAI)
  const [processedLevel, setProcessedLevel] = useState(-60);
  const [processedPeakLevel, setProcessedPeakLevel] = useState(-60);
  const [processedLevelHistory, setProcessedLevelHistory] = useState<number[]>(Array(60).fill(-60));
  
  // Show AI threshold settings
  const [showAiSettings, setShowAiSettings] = useState(false);
  
  // State for showing OpenAI input meter
  const [showOpenAiMeter, setShowOpenAiMeter] = useState(true);
  
  // State for showing/hiding the entire component
  const [isVisible, setIsVisible] = useState(false); // Hide by default
  
  // State for enabling/disabling audio processing
  const [audioProcessingEnabled, setAudioProcessingEnabled] = useState(false); // Disabled by default

  // Update parent component when threshold changes
  useEffect(() => {
    onThresholdChange(threshold);
  }, [threshold, onThresholdChange]);

  // Update parent component when AI threshold changes
  useEffect(() => {
    onAiThresholdChange(aiThreshold);
  }, [aiThreshold, onAiThresholdChange]);
  
  // Update turn detection settings when they change
  useEffect(() => {
    onTurnDetectionThresholdChange(turnThreshold);
  }, [turnThreshold, onTurnDetectionThresholdChange]);
  
  useEffect(() => {
    onSilenceDurationMsChange(silenceDuration);
  }, [silenceDuration, onSilenceDurationMsChange]);
  
  // Update parent component when audio processing status changes
  useEffect(() => {
    onAudioProcessingChange(audioProcessingEnabled);
  }, [audioProcessingEnabled, onAudioProcessingChange]);

  // Listen for console logs about gate state changes
  useEffect(() => {
    // Skip processing if audio processing is disabled
    if (!audioProcessingEnabled) return;
    
    const originalConsoleLog = console.log;
    console.log = function(...args) {
      originalConsoleLog.apply(console, args);
      
      // Check if this is a gate state change log
      if (typeof args[0] === 'string') {
        const logMessage = args[0];
        
        // Parse gate state check logs
        if (logMessage.includes('Gate state check')) {
          try {
            // Extract values using regex
            const micLevelMatch = logMessage.match(/Mic level: ([-\d.]+) dB/);
            const thresholdMatch = logMessage.match(/Threshold: ([-\d.]+) dB/);
            const aiLevelMatch = logMessage.match(/AI level: ([-\d.]+) dB/);
            const aiThresholdMatch = logMessage.match(/AI threshold: ([-\d.]+) dB/);
            const aiSpeakingMatch = logMessage.match(/AI speaking: (true|false)/);
            
            // Updated regex to match the new format
            const gateOpenMatch = logMessage.match(/Gate should be: (OPEN|CLOSED)/i);
            const gainMatch = logMessage.match(/Current gain: ([0-9.]+)/);
            
            if (micLevelMatch) {
              const newLevel = parseFloat(micLevelMatch[1]);
              setMicLevel(newLevel);
              
              // Update peak level with slow decay
              if (newLevel > micPeakLevel) {
                setMicPeakLevel(newLevel);
              } else {
                setMicPeakLevel(prev => Math.max(newLevel, prev - 0.05));
              }

              // Calculate processed level based on gate state and gain
              // This represents what's actually sent to OpenAI after the gate
              const isGateOpen = gateOpenMatch ? gateOpenMatch[1].toUpperCase() === 'OPEN' : false;
              const gain = gainMatch ? parseFloat(gainMatch[1]) : 0;
              
              // If we have a gain value, use it to calculate the processed level
              // gain of 0 = silence (-60dB), gain of 1 = full level
              const newProcessedLevel = gain > 0 ? newLevel : -60;
              
              console.log(`UI DEBUG: Gate is ${isGateOpen ? 'OPEN' : 'CLOSED'}, gain: ${gain}, mic: ${newLevel}dB, processed: ${newProcessedLevel}dB`);
              
              setProcessedLevel(newProcessedLevel);
              setGateOpen(isGateOpen);
              
              // Update processed peak level
              if (newProcessedLevel > processedPeakLevel) {
                setProcessedPeakLevel(newProcessedLevel);
              } else {
                setProcessedPeakLevel(prev => Math.max(newProcessedLevel, prev - 0.05));
              }
              
              // Update processed history
              setProcessedLevelHistory(prev => [...prev.slice(1), newProcessedLevel]);
            }
            
            if (aiLevelMatch) {
              setAiLevel(parseFloat(aiLevelMatch[1]));
            }
            
            if (aiSpeakingMatch) setAiSpeaking(aiSpeakingMatch[1] === 'true');
            
            // Update history arrays
            if (micLevelMatch) {
              const newLevel = parseFloat(micLevelMatch[1]);
              setMicLevelHistory(prev => [...prev.slice(1), newLevel]);
            }
          } catch (e) {
            // Ignore parsing errors
          }
        }
      }
    };
    
    // Update level history periodically even when no new logs
    const historyInterval = setInterval(() => {
      setMicLevelHistory(prev => [...prev.slice(1), micLevel]);
      
      // Update processed history (what's sent to OpenAI)
      const newProcessedLevel = gateOpen ? micLevel : -60;
      setProcessedLevelHistory(prev => [...prev.slice(1), newProcessedLevel]);
      
      // Decay peak levels over time
      setMicPeakLevel(prev => Math.max(micLevel, prev - 0.1));
      setProcessedPeakLevel(prev => Math.max(processedLevel, prev - 0.1));
    }, 100);
    
    return () => {
      console.log = originalConsoleLog;
      clearInterval(historyInterval);
    };
  }, [micLevel, micPeakLevel, processedLevel, processedPeakLevel, gateOpen, audioProcessingEnabled]);

  // Define fixed dB scale for professional metering
  const minDb = -60; // Back to original minimum
  const maxDb = +12;  // Extended maximum to +12 dB to show louder speech
  const dbRange = maxDb - minDb;

  // Convert a dB value to a percentage height for visualization
  const dbToPercent = (db: number) => {
    return Math.max(0, Math.min(100, ((db - minDb) / dbRange) * 100));
  };
  
  // Get color for level based on value
  const getLevelColor = (db: number) => {
    if (db > +6) return 'bg-purple-500 dark:bg-purple-600'; // Very loud
    if (db > 0) return 'bg-red-500 dark:bg-red-600'; // Loud
    if (db > -6) return 'bg-yellow-500 dark:bg-yellow-600'; // Hot but good
    if (db > -18) return 'bg-green-500 dark:bg-green-600'; // Ideal level
    if (db > -36) return 'bg-blue-500 dark:bg-blue-600'; // Good level
    return 'bg-gray-500 dark:bg-gray-600'; // Low level
  };
  
  // Toggle button to show/hide the component
  const FloatingToggleButton = () => (
    <button 
      onClick={() => setIsVisible(!isVisible)}
      className="fixed bottom-4 right-4 z-50 bg-blue-600 dark:bg-blue-700 text-white rounded-full p-2 shadow-lg"
      aria-label={isVisible ? "Hide audio settings" : "Show audio settings"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    </button>
  );

  // If component is not visible, only show the toggle button
  if (!isVisible) {
    return <FloatingToggleButton />;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-md w-full">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audio Gate Settings</h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Hide settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isExpanded ? '▼' : '▲'}
          </button>
        </div>
      </div>
      
      {/* Audio processing toggle */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Audio Processing
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={audioProcessingEnabled} 
            onChange={() => setAudioProcessingEnabled(!audioProcessingEnabled)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            {audioProcessingEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>
      
      {isExpanded && (
        <>
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Gate Threshold ({threshold} dB)
              </span>
              <div className="flex items-center gap-2">
                <span className={`inline-block w-16 text-center text-sm font-medium rounded px-2 py-1 ${gateOpen ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                  {gateOpen ? 'OPEN' : 'CLOSED'}
                </span>
                <span className={`inline-block w-20 text-center text-sm font-medium rounded px-2 py-1 ${aiSpeaking ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}`}>
                  {aiSpeaking ? 'AI ACTIVE' : 'AI SILENT'}
                </span>
              </div>
            </div>
            
            {/* Toggle button for OpenAI input meter */}
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowOpenAiMeter(!showOpenAiMeter)}
                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {showOpenAiMeter ? 'Hide OpenAI Input Meter' : 'Show OpenAI Input Meter'}
              </button>
            </div>
            
            {/* Mic level visualization - professional audio meter style */}
            <div className="relative h-40 mb-2 bg-gray-900 rounded overflow-hidden border border-gray-700">
              {/* dB scale markers */}
              {[+12, +9, +6, +3, 0, -3, -6, -9, -12, -18, -24, -36, -48, -60].map(db => (
                <div key={db} className="absolute w-full h-px bg-gray-600 z-0 flex items-center justify-end" 
                     style={{ bottom: `${dbToPercent(db)}%` }}>
                  <span className="text-xs text-gray-400 pr-1 font-mono">{db > 0 ? `+${db}` : db}</span>
                </div>
              ))}
              
              {/* Threshold line */}
              <div 
                className="absolute h-0.5 w-full bg-red-500 border-t border-b border-red-600 border-dashed z-20"
                style={{ bottom: `${dbToPercent(threshold)}%` }}
              >
                <span className="absolute right-0 -top-5 text-xs text-red-400 font-mono">
                  Gate: {threshold} dB
                </span>
              </div>
              
              {/* AI Threshold line */}
              {showAiSettings && (
                <div 
                  className="absolute h-0.5 w-full bg-blue-500 border-t border-b border-blue-600 border-dashed z-20"
                  style={{ bottom: `${dbToPercent(aiThreshold)}%` }}
                >
                  <span className="absolute left-0 -top-5 text-xs text-blue-400 font-mono">
                    AI: {aiThreshold} dB
                  </span>
                </div>
              )}
              
              {/* Current level - vertical bar meter */}
              <div className="absolute left-2 bottom-0 w-6 h-full bg-gray-800 border-x border-gray-700">
                {/* Level fill */}
                <div 
                  className={`absolute left-0 bottom-0 w-full transition-all duration-100 ${getLevelColor(micLevel)}`}
                  style={{ height: `${dbToPercent(micLevel)}%` }}
                />
                
                {/* Peak indicator */}
                <div 
                  className="absolute left-0 h-0.5 w-full bg-white transition-all duration-300"
                  style={{ bottom: `${dbToPercent(micPeakLevel)}%` }}
                />
              </div>
              
              {/* OpenAI Input level - vertical bar meter */}
              {showOpenAiMeter && (
                <div className="absolute left-10 bottom-0 w-6 h-full bg-gray-800 border-x border-gray-700">
                  <div 
                    className={`absolute left-0 bottom-0 w-full transition-all duration-100 ${getLevelColor(processedLevel)}`}
                    style={{ height: `${dbToPercent(processedLevel)}%` }}
                  />
                  
                  {/* Processed Peak indicator */}
                  <div 
                    className="absolute left-0 h-0.5 w-full bg-orange-500 transition-all duration-300"
                    style={{ bottom: `${dbToPercent(processedPeakLevel)}%` }}
                  />
                  
                  {/* Label */}
                  <div className="absolute -bottom-5 left-0 text-center w-full text-xs font-mono text-orange-400">
                    OpenAI
                  </div>
                </div>
              )}
              
              {/* AI level - vertical bar meter */}
              {showAiSettings && (
                <div className={`absolute ${showOpenAiMeter ? 'left-18' : 'left-10'} bottom-0 w-6 h-full bg-gray-800 border-x border-gray-700`}>
                  {/* Level fill */}
                  <div 
                    className="absolute left-0 bottom-0 w-full transition-all duration-100 bg-blue-500"
                    style={{ height: `${dbToPercent(aiLevel)}%` }}
                  />
                </div>
              )}
              
              {/* Level history - horizontal scrolling view */}
              <div className={`absolute ${showOpenAiMeter ? 'left-20' : (showAiSettings ? 'left-20' : 'left-12')} right-0 bottom-0 h-full flex items-end overflow-hidden`}>
                <div className="flex h-full items-end w-full">
                  {micLevelHistory.map((level, i) => {
                    const heightPercent = dbToPercent(level);
                    
                    return (
                      <div 
                        key={i} 
                        className={`flex-1 mx-px ${getLevelColor(level)}`}
                        style={{ 
                          height: `${heightPercent}%`,
                          opacity: (i / micLevelHistory.length) * 0.5 + 0.5 // Fade older values
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              
              {/* OpenAI Input History (if enabled) */}
              {showOpenAiMeter && (
                <div className="absolute right-0 bottom-0 h-full w-1/3 flex items-end overflow-hidden border-l border-gray-700">
                  <div className="flex h-full items-end w-full">
                    {processedLevelHistory.map((level, i) => {
                      const heightPercent = dbToPercent(level);
                      
                      return (
                        <div 
                          key={i} 
                          className={`flex-1 mx-px ${getLevelColor(level)}`}
                          style={{ 
                            height: `${heightPercent}%`,
                            opacity: (i / processedLevelHistory.length) * 0.5 + 0.5
                          }}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Label for OpenAI input history */}
                  <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-mono text-white z-30">
                    To OpenAI: {processedLevel.toFixed(1)} dB
                  </div>
                </div>
              )}
              
              {/* Current level text */}
              <div className="absolute top-2 left-2 bg-black/70 px-2 py-1 rounded text-xs font-mono text-white z-30">
                {micLevel.toFixed(1)} dB
              </div>
              
              {/* AI level text */}
              {showAiSettings && (
                <div className="absolute top-2 left-20 bg-black/70 px-2 py-1 rounded text-xs font-mono text-white z-30">
                  AI: {aiLevel.toFixed(1)} dB
                </div>
              )}
            </div>
            
            <input
              type="range"
              min={-60}
              max={+12} // Increase the upper range to +12 dB for threshold to allow for higher settings
              step="1"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Adjust the threshold to determine when your microphone is active. Higher values (closer to 0 or positive dB) make the gate less sensitive and will filter out more background noise.
            </p>
          </div>
          
          <div className="mb-4">
            <button
              onClick={() => setShowAiSettings(!showAiSettings)}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showAiSettings ? 'Hide AI Threshold Settings' : 'Show AI Threshold Settings'}
            </button>
            
            {showAiSettings && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    AI Speaking Threshold ({aiThreshold} dB)
                  </label>
                  <input
                    type="range"
                    min={-60}
                    max={+12} // Increase the upper range to +12 dB for AI threshold
                    step="1"
                    value={aiThreshold}
                    onChange={(e) => setAiThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Adjust the threshold to determine when the AI is speaking. Higher values (closer to 0 or positive dB) make the system less sensitive to AI audio.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <button
              onClick={() => setShowTurnSettings(!showTurnSettings)}
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showTurnSettings ? 'Hide Turn Detection Settings' : 'Show Turn Detection Settings'}
            </button>
            
            {showTurnSettings && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Turn Detection Threshold ({turnThreshold.toFixed(2)})
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={turnThreshold}
                    onChange={(e) => setTurnThreshold(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Higher values require more certainty before detecting a turn.
                  </p>
                </div>
                
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Silence Duration ({silenceDuration} ms)
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="2000"
                    step="100"
                    value={silenceDuration}
                    onChange={(e) => setSilenceDuration(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Duration of silence required to detect end of turn.
                  </p>
                </div>
                
                <button
                  onClick={updateTurnDetectionSettings}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  Apply Turn Detection Settings
                </button>
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 italic">
            Note: This is a testing component. Remove after testing.
          </div>
        </>
      )}
    </div>
  );
};

export default GateSettings; 