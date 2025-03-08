'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/app/_components/ui/button'
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/app/_components/ui/alert'

interface AudioProcessorProps {
  isEnabled?: boolean;
  onProcessedStreamReady?: (stream: MediaStream) => void;
}

const AudioProcessor: React.FC<AudioProcessorProps> = ({ 
  isEnabled = true, 
  onProcessedStreamReady 
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const noiseWorkletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const destinationRef = useRef<MediaStreamAudioDestinationNode | null>(null);

  useEffect(() => {
    if (isEnabled && !isInitialized) {
      initAudio();
    } else if (!isEnabled && isInitialized) {
      cleanupAudio();
    }
    
    return () => {
      cleanupAudio();
    }
  }, [isEnabled, isInitialized]);

  const initAudio = async () => {
    try {
      // Reset error state
      setError(null);
      
      // Check if browser supports required APIs
      if (!window.AudioContext && !(window as any).webkitAudioContext) {
        throw new Error('AudioContext not supported in this browser');
      }
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices API not supported in this browser');
      }
      
      // Create audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      // Check if AudioWorklet is supported
      if (!audioContextRef.current.audioWorklet) {
        throw new Error('AudioWorklet not supported in this browser');
      }
      
      // Get user media stream with optimal audio settings
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            autoGainControl: true,
            noiseSuppression: true, // Browser's built-in noise suppression as a first layer
            channelCount: 1, // Mono for better noise processing
          } 
        });
        
        streamRef.current = stream;
      } catch (mediaError) {
        console.error('Failed to access microphone:', mediaError);
        throw new Error('Failed to access microphone. Please check permissions.');
      }
      
      // Create source node from microphone stream
      sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current!);
      
      // Create destination node to get processed audio as a stream
      destinationRef.current = audioContextRef.current.createMediaStreamDestination();
      
      // Try to initialize noise worklet
      try {
        // First, try to connect directly without noise cancellation to ensure basic audio flow works
        sourceNodeRef.current.connect(destinationRef.current);
        
        // Now try to load the AudioWorklet
        console.log('Loading SimpleNoiseWorklet...');
        
        // Use the simplified noise worklet
        await audioContextRef.current.audioWorklet.addModule('/SimpleNoiseWorklet.js')
          .catch(e => {
            console.error('Error loading worklet module:', e);
            throw new Error(`Failed to load noise cancellation module: ${e.message}`);
          });
        
        // Disconnect the direct connection
        sourceNodeRef.current.disconnect();
        
        // Instantiate the Worklet as a Node
        noiseWorkletNodeRef.current = new AudioWorkletNode(
          audioContextRef.current, 
          'simple-noise-worklet',
          {
            // Add error handling for the worklet
            processorOptions: {
              // Any options to pass to the processor
              threshold: -50,
              attackTime: 0.01,
              releaseTime: 0.1
            }
          }
        );
        
        // Add error event listener
        noiseWorkletNodeRef.current.onprocessorerror = (event) => {
          console.error('AudioWorklet processor error:', event);
          setError('Noise cancellation processor error occurred');
        };
        
        // Connect the audio graph with noise cancellation
        sourceNodeRef.current.connect(noiseWorkletNodeRef.current);
        noiseWorkletNodeRef.current.connect(destinationRef.current);
        
        console.log('Noise processing initialized successfully');
      } catch (noiseError: any) {
        console.error('Failed to initialize noise processing:', noiseError);
        
        // Fall back to direct connection without noise cancellation
        if (sourceNodeRef.current && destinationRef.current) {
          sourceNodeRef.current.connect(destinationRef.current);
        }
        
        throw new Error(`Failed to initialize noise cancellation: ${noiseError.message || 'Unknown error'}`);
      }
      
      // Notify that initialization is complete
      setIsInitialized(true);
      setIsProcessing(true);
      
      // If callback provided, send the processed stream
      if (onProcessedStreamReady && destinationRef.current) {
        onProcessedStreamReady(destinationRef.current.stream);
      }
    } catch (err) {
      console.error('Failed to initialize audio processing:', err);
      setError(err instanceof Error ? err.message : 'Unknown error initializing audio');
      setIsInitialized(false);
      setIsProcessing(false);
    }
  };

  const cleanupAudio = () => {
    // Stop all tracks in the original stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Disconnect nodes
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
    }
    
    if (noiseWorkletNodeRef.current) {
      noiseWorkletNodeRef.current.disconnect();
    }
    
    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    // Reset refs
    audioContextRef.current = null;
    sourceNodeRef.current = null;
    noiseWorkletNodeRef.current = null;
    streamRef.current = null;
    destinationRef.current = null;
    
    // Update state
    setIsInitialized(false);
    setIsProcessing(false);
  };

  const toggleProcessing = () => {
    if (!isInitialized) {
      initAudio();
      return;
    }
    
    if (isProcessing) {
      // Disconnect noise worklet to bypass processing
      if (sourceNodeRef.current && noiseWorkletNodeRef.current && destinationRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current.connect(destinationRef.current);
      }
    } else {
      // Reconnect through noise worklet
      if (sourceNodeRef.current && noiseWorkletNodeRef.current && destinationRef.current) {
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current.connect(noiseWorkletNodeRef.current);
        noiseWorkletNodeRef.current.connect(destinationRef.current);
      }
    }
    
    setIsProcessing(!isProcessing);
    
    // Update the processed stream callback when toggling
    if (!isProcessing && onProcessedStreamReady && destinationRef.current) {
      onProcessedStreamReady(destinationRef.current.stream);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${isInitialized ? (isProcessing ? 'bg-green-500' : 'bg-amber-500') : 'bg-gray-300'}`}></div>
        <span className="text-sm">
          {isInitialized 
            ? (isProcessing ? 'Noise cancellation active' : 'Noise cancellation paused') 
            : 'Noise cancellation inactive'}
        </span>
      </div>
      
      <Button 
        size="sm"
        variant={isProcessing ? "default" : "outline"}
        onClick={toggleProcessing}
        disabled={!isInitialized && !isEnabled}
      >
        {!isInitialized 
          ? 'Initialize Noise Cancellation' 
          : (isProcessing ? 'Disable Noise Cancellation' : 'Enable Noise Cancellation')}
      </Button>
    </div>
  )
}

export default AudioProcessor 