"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Conversation } from "@/app/_lib/conversations";
import { useTranslations } from "@/app/_components/shared/translations-context";

export interface Tool {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}

export type Modality = "text" | "text+audio";

/**
 * The return type for the hook, matching Approach A
 * (RefObject<HTMLDivElement | null> for the audioIndicatorRef).
 */
interface UseWebRTCAudioSessionReturn {
  status: string;
  isSessionActive: boolean;
  audioIndicatorRef: React.RefObject<HTMLDivElement | null>;
  startSession: () => Promise<void>;
  stopSession: () => void;
  handleStartStopClick: () => void;
  registerFunction: (name: string, fn: Function) => void;
  msgs: any[];
  currentVolume: number;
  conversation: Conversation[];
  sendTextMessage: (text: string) => void;
  updateModality: (modality: Modality) => void;
  currentModality: Modality;
  setGateThreshold: (threshold: number) => void;
  setAiSpeakingThreshold: (threshold: number) => void;
  gateThreshold: number;
  aiSpeakingThreshold: number;
  turnDetectionThreshold: number;
  setTurnDetectionThreshold: (threshold: number) => void;
  silenceDurationMs: number;
  setSilenceDurationMs: (duration: number) => void;
  updateTurnDetectionSettings: () => void;
  audioProcessingEnabled: boolean;
  setAudioProcessingEnabled: (enabled: boolean) => void;
}

/**
 * Hook to manage a real-time session with OpenAI's Realtime endpoints.
 */
export default function useWebRTCAudioSession(
  voice: string,
  tools?: Tool[],
): UseWebRTCAudioSessionReturn {
  const { t, locale } = useTranslations();
  // Connection/session states
  const [status, setStatus] = useState("");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentModality, setCurrentModality] = useState<Modality>("text");

  // Audio references for local mic
  // Approach A: explicitly typed as HTMLDivElement | null
  const audioIndicatorRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const processedStreamRef = useRef<MediaStream | null>(null);

  // WebRTC references
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  // Keep track of all raw events/messages
  const [msgs, setMsgs] = useState<any[]>([]);

  // Main conversation state
  const [conversation, setConversation] = useState<Conversation[]>([]);

  // For function calls (AI "tools")
  const functionRegistry = useRef<Record<string, Function>>({});

  // Volume analysis (assistant inbound audio)
  const [currentVolume, setCurrentVolume] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeIntervalRef = useRef<number | null>(null);

  /**
   * We track only the ephemeral user message **ID** here.
   * While user is speaking, we update that conversation item by ID.
   */
  const ephemeralUserMessageIdRef = useRef<string | null>(null);

  // Add a ref for the audio element
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // State for gate thresholds
  const [gateThreshold, setGateThresholdState] = useState<number>(-30); // Default threshold in dB
  const [aiSpeakingThreshold, setAiSpeakingThreshold] = useState<number>(-40); // Default AI threshold in dB
  
  // State for audio processing enabled/disabled
  const [audioProcessingEnabled, setAudioProcessingEnabled] = useState<boolean>(false); // Disabled by default

  // Custom setter for gate threshold that also updates the gate node
  const setGateThreshold = useCallback((threshold: number) => {
    console.log(`Setting gate threshold to ${threshold} dB`);
    setGateThresholdState(threshold);
  }, []);
  
  // Custom setter for audio processing enabled state
  const setAudioProcessingEnabledState = useCallback((enabled: boolean) => {
    console.log(`Setting audio processing to ${enabled ? 'enabled' : 'disabled'}`);
    setAudioProcessingEnabled(enabled);
    
    // If we have an active connection, we need to update the audio processing
    if (peerConnectionRef.current && processedStreamRef.current && audioStreamRef.current) {
      const senders = peerConnectionRef.current.getSenders();
      const audioSender = senders.find(sender => 
        sender.track && sender.track.kind === 'audio'
      );
      
      if (audioSender) {
        // If enabled, use the processed stream, otherwise use the raw stream
        const trackToUse = enabled 
          ? processedStreamRef.current.getAudioTracks()[0] 
          : audioStreamRef.current.getAudioTracks()[0];
          
        if (trackToUse) {
          console.log(`Replacing track with ${enabled ? 'processed' : 'raw'} audio`);
          audioSender.replaceTrack(trackToUse).catch(err => {
            console.error(`Failed to replace track with ${enabled ? 'processed' : 'raw'} audio:`, err);
          });
        }
      }
    }
  }, []);

  // State for turn detection settings
  const [turnDetectionThreshold, setTurnDetectionThreshold] = useState<number>(0.5);
  const [silenceDurationMs, setSilenceDurationMs] = useState<number>(500);

  // Add this near the top of the hook with other refs
  const dynamicsCompressorRef = useRef<DynamicsCompressorNode | null>(null);
  const manualGainNodeRef = useRef<GainNode | null>(null);
  const rawAnalyserRef = useRef<AnalyserNode | null>(null);
  const dbLevelRef = useRef<number>(-60); // Current dB level
  const displayLevelRef = useRef<number>(-60); // Display dB level with ballistics
  const meterIntervalRef = useRef<number | null>(null);
  const aiLevelRef = useRef<number>(-60); // Current AI level in dB

  // Add a reference to the gate node
  const gateNodeRef = useRef<GainNode | null>(null);

  // Add this utility function at the top of the hook
  function safeGetRefValue(ref: React.MutableRefObject<number>, defaultValue: number = -100): number {
    return typeof ref.current === 'number' ? ref.current : defaultValue;
  }

  /**
   * Register a function (tool) so the AI can call it.
   */
  function registerFunction(name: string, fn: Function) {
    functionRegistry.current[name] = fn;
  }

  /**
   * Update session modality
   */
  async function updateModality(modality: Modality) {
    console.log(`Updating modality to: ${modality}`);
    
    if (modality === currentModality) {
      console.log("Modality unchanged, no action needed");
      return;
    }
    
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
      console.log("Data channel not ready, just updating local state");
      setCurrentModality(modality);
      return;
    }

    // If we're switching to audio mode, we need to ensure microphone access
    if (modality === "text+audio") {
      console.log("Switching to audio mode, requesting microphone access");
      setStatus("Requesting microphone access...");
      
      try {
        // Force a new microphone request by checking permission status first
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log("Current microphone permission status:", permissionStatus.state);
        
        // Always request a new microphone stream when switching to audio mode
        console.log("Requesting new microphone stream");
        const micStream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            // Force a new device selection by using specific constraints
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        console.log("Microphone access granted, tracks:", micStream.getAudioTracks().map(t => ({ 
          id: t.id, 
          label: t.label, 
          enabled: t.enabled, 
          muted: t.muted 
        })));
        
        // Store the new stream and set up visualization with noise gate
        if (audioStreamRef.current) {
          // Stop old tracks first
          audioStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        audioStreamRef.current = micStream;
        
        // Setup audio visualization with noise gate
        // The setupAudioVisualization function will handle replacing the track
        // in the peer connection with the gated audio track
        console.log("Setting up audio visualization with noise gate");
        setupAudioVisualization(micStream);
        
        // Make sure audio output is enabled for text+audio mode
        if (peerConnectionRef.current) {
          // Check if we need to recreate the audio element
          if (!audioElementRef.current) {
            console.log("Creating new audio element for output");
            const audioEl = document.createElement("audio");
            audioEl.autoplay = true;
            audioElementRef.current = audioEl;
            
            // Re-attach ontrack handler to ensure audio output works
            peerConnectionRef.current.ontrack = (event) => {
              console.log("Received track from peer:", event.track.kind);
              audioEl.srcObject = event.streams[0];
              
              // Setup audio analysis for visualization
              const audioCtx = new (window.AudioContext || window.AudioContext)();
              const src = audioCtx.createMediaStreamSource(event.streams[0]);
              const inboundAnalyzer = audioCtx.createAnalyser();
              inboundAnalyzer.fftSize = 256;
              src.connect(inboundAnalyzer);
              analyserRef.current = inboundAnalyzer;
              
              // Start volume monitoring
              if (volumeIntervalRef.current) {
                clearInterval(volumeIntervalRef.current);
              }
              volumeIntervalRef.current = window.setInterval(() => {
                setCurrentVolume(getVolume());
              }, 100);
            };
          } else {
            console.log("Audio element already exists, ensuring it's active");
            // Make sure the audio element is not muted
            audioElementRef.current.muted = false;
            audioElementRef.current.volume = 1.0;
          }
        }
        
        setStatus("Microphone activated for voice mode");
      } catch (err) {
        console.error("Error accessing microphone for audio mode:", err);
        setStatus("Error: Could not access microphone for voice mode");
        return; // Don't proceed with modality change if we can't get mic access
      }
    }
    
    // If switching to text mode, replace real microphone with silent audio track
    if (modality === "text") {
      console.log("Switching to text mode, replacing microphone with silent audio track");
      
      try {
        // Create a silent audio track
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const destination = audioContext.createMediaStreamDestination();
        oscillator.connect(destination);
        const silentStream = destination.stream;
        
        // Replace the real microphone track with the silent track
        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders();
          const audioSender = senders.find(sender => 
            sender.track && sender.track.kind === 'audio'
          );
          
          if (audioSender) {
            // Get the silent audio track
            const silentTrack = silentStream.getAudioTracks()[0];
            if (silentTrack) {
              // Disable the track to ensure it's silent
              silentTrack.enabled = false;
              
              await audioSender.replaceTrack(silentTrack);
              console.log("Replaced real microphone with silent audio track");
              
              // Stop the old microphone tracks to ensure privacy
              if (audioStreamRef.current) {
                console.log("Stopping real microphone tracks for privacy");
                audioStreamRef.current.getTracks().forEach(track => {
                  track.stop();
                  console.log(`Stopped track: ${track.label}`);
                });
              }
              
              // Store the new silent stream
              audioStreamRef.current = silentStream;
            }
          }
        }
        
        // Make sure audio output still works in text-only mode
        if (audioElementRef.current) {
          console.log("Ensuring audio element is active for text-only mode");
          audioElementRef.current.muted = false;
          audioElementRef.current.volume = 1.0;
        }
        
        setStatus("Switched to text-only mode, microphone disabled");
      } catch (err) {
        console.error("Error creating silent audio track:", err);
        
        // If we can't create a silent track, at least disable the existing tracks
        if (audioStreamRef.current) {
          audioStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = false;
            console.log(`Disabled track: ${track.label}`);
          });
        }
      }
    }

    // Send session update with new modalities
    const sessionUpdate = {
      type: "session.update",
      session: {
        modalities: modality === "text" ? ["text"] : ["text", "audio"],
        tools: tools || [],
        input_audio_transcription: modality === "text+audio" ? {
          model: "whisper-1",
        } : null,
        turn_detection: modality === "text+audio" ? {
          type: "server_vad",
          threshold: turnDetectionThreshold,
          prefix_padding_ms: 300,
          silence_duration_ms: silenceDurationMs,
          create_response: true
        } : null,
      },
    };
    
    try {
      dataChannelRef.current.send(JSON.stringify(sessionUpdate));
      console.log("Session update sent for modality change:", sessionUpdate);
      setCurrentModality(modality);
    } catch (err) {
      console.error("Error updating modality:", err);
      setStatus("Error updating modality. Try again or restart the session.");
    }
  }

  /**
   * Configure the data channel on open, sending a session update to the server.
   */
  function configureDataChannel(dataChannel: RTCDataChannel) {
    console.log(`Configuring data channel for modality: ${currentModality}, state: ${dataChannel.readyState}`);
    
    // Check if the data channel is open before proceeding
    if (dataChannel.readyState !== 'open') {
      console.warn(`Data channel is not open (state: ${dataChannel.readyState}). Cannot configure yet.`);
      return; // Exit early if the channel is not open
    }
    
    // Send session update
    const sessionUpdate = {
      type: "session.update",
      session: {
        modalities: currentModality === "text" ? ["text"] : ["text", "audio"],
        tools: tools || [],
        input_audio_transcription: currentModality === "text+audio" ? {
          model: "whisper-1",
        } : null,
        turn_detection: currentModality === "text+audio" ? {
          type: "server_vad",
          threshold: turnDetectionThreshold,
          prefix_padding_ms: 300,
          silence_duration_ms: silenceDurationMs,
          create_response: true
        } : null,
      },
    };
    
    try {
      console.log("Sending session update...");
      dataChannel.send(JSON.stringify(sessionUpdate));
      console.log("Session update sent successfully:", sessionUpdate);
      
      console.log("Setting locale: " + t("language") + " : " + locale);

      // Send language preference message
      const languageMessage = {
        type: "conversation.item.create",
        item: {
          type: "message",
          role: "user",
          content: [
            {
              type: "input_text",
              text: t("languagePrompt"),
            },
          ],
        },
      };
      
      console.log("Sending language preference message...");
      dataChannel.send(JSON.stringify(languageMessage));
      console.log("Language preference message sent successfully");
      
      // Signal that the session is now active
      setIsSessionActive(true);
      setStatus(`${currentModality} session established successfully!`);
      
      // Send initial prompt to start the conversation after a short delay
      setTimeout(() => {
        sendInitialPrompt();
      }, 1000);
      
    } catch (err) {
      console.error("Error configuring data channel:", err);
      setStatus("Error configuring data channel. Please try again.");
    }
  }

  /**
   * Return an ephemeral user ID, creating a new ephemeral message in conversation if needed.
   */
  function getOrCreateEphemeralUserId(): string {
    let ephemeralId = ephemeralUserMessageIdRef.current;
    if (!ephemeralId) {
      // Use uuidv4 for a robust unique ID
      ephemeralId = uuidv4();
      ephemeralUserMessageIdRef.current = ephemeralId;

      const newMessage: Conversation = {
        id: ephemeralId,
        role: "user",
        text: "",
        timestamp: new Date().toISOString(),
        isFinal: false,
        status: "speaking",
      };

      // Append the ephemeral item to conversation
      setConversation((prev) => [...prev, newMessage]);
    }
    return ephemeralId;
  }

  /**
   * Update the ephemeral user message (by ephemeralUserMessageIdRef) with partial changes.
   */
  function updateEphemeralUserMessage(partial: Partial<Conversation>) {
    const ephemeralId = ephemeralUserMessageIdRef.current;
    if (!ephemeralId) return; // no ephemeral user message to update

    setConversation((prev) =>
      prev.map((msg) => {
        if (msg.id === ephemeralId) {
          return { ...msg, ...partial };
        }
        return msg;
      }),
    );
  }

  /**
   * Clear ephemeral user message ID so the next user speech starts fresh.
   */
  function clearEphemeralUserMessage() {
    ephemeralUserMessageIdRef.current = null;
  }

  /**
   * Main data channel message handler: interprets events from the server.
   */
  async function handleDataChannelMessage(event: MessageEvent) {
    try {
      const msg = JSON.parse(event.data);
      // console.log("Incoming dataChannel message:", msg);

      switch (msg.type) {
        /**
         * User speech started
         */
        case "input_audio_buffer.speech_started": {
          getOrCreateEphemeralUserId();
          updateEphemeralUserMessage({ status: "speaking" });
          break;
        }

        /**
         * User speech stopped
         */
        case "input_audio_buffer.speech_stopped": {
          // optional: you could set "stopped" or just keep "speaking"
          updateEphemeralUserMessage({ status: "speaking" });
          break;
        }

        /**
         * Audio buffer committed => "Processing speech..."
         */
        case "input_audio_buffer.committed": {
          updateEphemeralUserMessage({
            text: "Processing speech...",
            status: "processing",
          });
          break;
        }

        /**
         * Partial user transcription
         */
        case "conversation.item.input_audio_transcription": {
          const partialText =
            msg.transcript ?? msg.text ?? "User is speaking...";
          updateEphemeralUserMessage({
            text: partialText,
            status: "speaking",
            isFinal: false,
          });
          break;
        }

        /**
         * Final user transcription
         */
        case "conversation.item.input_audio_transcription.completed": {
          // console.log("Final user transcription:", msg.transcript);
          updateEphemeralUserMessage({
            text: msg.transcript || "",
            isFinal: true,
            status: "final",
          });
          clearEphemeralUserMessage();
          break;
        }

        /**
         * Streaming AI transcripts (assistant partial) - for audio responses
         */
        case "response.audio_transcript.delta": {
          const newMessage: Conversation = {
            id: uuidv4(), // generate a fresh ID for each assistant partial
            role: "assistant",
            text: msg.delta,
            timestamp: new Date().toISOString(),
            isFinal: false,
          };

          setConversation((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === "assistant" && !lastMsg.isFinal) {
              // Append to existing assistant partial
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...lastMsg,
                text: lastMsg.text + msg.delta,
              };
              return updated;
            } else {
              // Start a new assistant partial
              return [...prev, newMessage];
            }
          });
          break;
        }

        /**
         * Mark the last assistant message as final - for audio responses
         */
        case "response.audio_transcript.done": {
          setConversation((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1].isFinal = true;
            return updated;
          });
          break;
        }

        /**
         * Streaming text responses (assistant partial) - for text-only mode
         */
        case "response.text.delta": {
          console.log("Received text delta:", msg.delta);
          
          const newMessage: Conversation = {
            id: uuidv4(), // generate a fresh ID for each assistant partial
            role: "assistant",
            text: msg.delta,
            timestamp: new Date().toISOString(),
            isFinal: false,
          };

          setConversation((prev) => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === "assistant" && !lastMsg.isFinal) {
              // Append to existing assistant partial
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...lastMsg,
                text: lastMsg.text + msg.delta,
              };
              return updated;
            } else {
              // Start a new assistant partial
              return [...prev, newMessage];
            }
          });
          break;
        }

        /**
         * Mark the last text message as final - for text-only mode
         */
        case "response.text.done": {
          console.log("Text response complete:", msg.text);
          
          setConversation((prev) => {
            if (prev.length === 0) return prev;
            const updated = [...prev];
            updated[updated.length - 1].isFinal = true;
            
            // If the final text is provided and different from what we've accumulated,
            // use the final text from the server
            if (msg.text && updated[updated.length - 1].text !== msg.text) {
              updated[updated.length - 1].text = msg.text;
            }
            
            return updated;
          });
          break;
        }

        /**
         * AI calls a function (tool)
         */
        case "response.function_call_arguments.done": {
          const fn = functionRegistry.current[msg.name];
          if (fn) {
            const args = JSON.parse(msg.arguments);
            const result = await fn(args);

            // Respond with function output
            const response = {
              type: "conversation.item.create",
              item: {
                type: "function_call_output",
                call_id: msg.call_id,
                output: JSON.stringify(result),
              },
            };
            dataChannelRef.current?.send(JSON.stringify(response));

            const responseCreate = {
              type: "response.create",
            };
            dataChannelRef.current?.send(JSON.stringify(responseCreate));
          }
          break;
        }

        default: {
          console.log("Received unhandled message type:", msg.type, msg);
          break;
        }
      }

      // Always log the raw message
      setMsgs((prevMsgs) => [...prevMsgs, msg]);
      return msg;
    } catch (error) {
      console.error("Error handling data channel message:", error);
    }
  }

  /**
   * Sets up audio visualization and processing for the microphone stream
   */
  function setupAudioVisualization(stream: MediaStream) {
    // Clean up any existing audio processing
    if (audioContextRef.current) {
      console.log("Cleaning up existing audio context before creating a new one");
      audioContextRef.current.close().catch(console.error);
    }
    
    if (meterIntervalRef.current) {
      clearInterval(meterIntervalRef.current);
      meterIntervalRef.current = null;
    }
    
    // Create a new audio context
    const audioContext = new AudioContext({
      latencyHint: 'interactive',
      sampleRate: 48000
    });
    audioContextRef.current = audioContext;
    console.log("Created new AudioContext with state:", audioContext.state);
    
    // Create a source node from the microphone stream
    const sourceNode = audioContext.createMediaStreamSource(stream);
    console.log("Created source node from microphone stream");
    
    // Create an analyzer for real-time level metering
    const analyzerNode = audioContext.createAnalyser();
    analyzerNode.fftSize = 2048; // For higher frequency resolution
    analyzerNode.smoothingTimeConstant = 0.2; // Less smoothing for more responsive meters
    
    // Connect the source to the analyzer for metering
    sourceNode.connect(analyzerNode);
    rawAnalyserRef.current = analyzerNode;
    console.log("Connected source to analyzer for metering");
    
    // DOUBLE GATE IMPLEMENTATION FOR MAXIMUM EFFECTIVENESS
    // First gate - gain node that will act as our primary gate
    const gateNode = audioContext.createGain();
    gateNode.gain.value = 0; // Start with gate closed (no audio passes)
    gateNodeRef.current = gateNode;
    console.log("Created primary gain node for gate with initial gain of 0 (closed)");
    
    // Second gate - another gain node for redundancy
    const backupGateNode = audioContext.createGain();
    backupGateNode.gain.value = 0; // Start with gate closed
    console.log("Created backup gain node for extra protection");
    
    // Connect the source to both gates in series
    sourceNode.connect(gateNode);
    gateNode.connect(backupGateNode);
    console.log("Connected source node to gate nodes in series");
    
    // Create a destination for the processed audio
    const destination = audioContext.createMediaStreamDestination();
    backupGateNode.connect(destination);
    console.log("Connected gate nodes to destination");
    
    // Store the processed stream for later use
    const processedStream = destination.stream;
    processedStreamRef.current = processedStream;
    console.log("Created processed stream with tracks:", processedStream.getTracks().map(t => t.kind).join(', '));
    
    // Set up the audio level meter
    setupAudioMeter(analyzerNode);
    
    // Debug counter to limit log frequency
    let debugCounter = 0;
    
    // Set up interval to control the gate based on audio levels
    const gateControlInterval = setInterval(() => {
      debugCounter++;
      
      // Get current levels
      const micLevel = safeGetRefValue(displayLevelRef);
      const aiLevel = safeGetRefValue(aiLevelRef);
      const isAISpeaking = aiLevel > aiSpeakingThreshold;
      
      // CRITICAL FIX: Make the gate extremely aggressive
      // When audio processing is enabled:
      //   - Open the gate ONLY when mic level is STRICTLY ABOVE threshold (user is speaking loudly)
      //   - Close the gate when mic level is below or equal to threshold (background noise)
      //   - Always close the gate when AI is speaking (to prevent feedback)
      // When audio processing is disabled:
      //   - Gate is always open (all audio passes through)
      
      // Add extra strictness for high thresholds
      const isHighThreshold = gateThreshold >= 0;
      const effectiveThreshold = isHighThreshold ? gateThreshold + 10 : gateThreshold; // Add 10dB margin for high thresholds
      
      // Determine if gate should be open
      const shouldOpenGate = audioProcessingEnabled ? 
        (micLevel > effectiveThreshold && !isAISpeaking) : 
        true;
      
      // Set the gate gain (0 = closed, 1 = open)
      const targetGain = shouldOpenGate ? 1 : 0;
      
      // Apply the gain change immediately to both gates
      if (gateNodeRef.current) {
        // Use immediate gain change for more responsive gating
        gateNodeRef.current.gain.value = targetGain;
        backupGateNode.gain.value = targetGain;
        
        // Log gate state changes
        if (debugCounter % 10 === 0) {
          console.log(`GATE STATE: ${shouldOpenGate ? 'OPEN' : 'CLOSED'}, gain: ${targetGain}, micLevel: ${micLevel}dB, effectiveThreshold: ${effectiveThreshold}dB (original: ${gateThreshold}dB), AI speaking: ${isAISpeaking}`);
        }
      }
      
    }, 20); // Check every 20ms for more responsive gating
    
    // Set up interval to log the gate state for debugging
    const gateCheckInterval = setInterval(() => {
      const micLevel = safeGetRefValue(displayLevelRef);
      const aiLevel = safeGetRefValue(aiLevelRef);
      const isAISpeaking = aiLevel > aiSpeakingThreshold;
      
      // Add extra strictness for high thresholds
      const isHighThreshold = gateThreshold >= 0;
      const effectiveThreshold = isHighThreshold ? gateThreshold + 10 : gateThreshold; // Add 10dB margin for high thresholds
      
      // Determine if gate should be open
      const shouldOpenGate = audioProcessingEnabled ? 
        (micLevel > effectiveThreshold && !isAISpeaking) : 
        true;
      
      // Get current gain value
      const currentGain = gateNodeRef.current ? gateNodeRef.current.gain.value : 0;
      const backupGain = backupGateNode.gain.value;
      
      // Log the current state for debugging
      console.log(`Gate state check:
  - Mic level: ${micLevel} dB (Threshold: ${gateThreshold} dB)
  - Effective threshold: ${effectiveThreshold} dB (${isHighThreshold ? '+10dB margin applied' : 'standard'})
  - AI level: ${aiLevel} dB (Threshold: ${aiSpeakingThreshold} dB)
  - AI speaking: ${isAISpeaking}
  - Gate should be: ${shouldOpenGate ? 'OPEN' : 'CLOSED'}
  - Current gain: ${currentGain} (backup: ${backupGain})
  - Audio processing: ${audioProcessingEnabled ? 'ENABLED' : 'DISABLED'}
  - Gate will ${shouldOpenGate ? 'PASS' : 'BLOCK'} audio to OpenAI`);
      
      // Force a very high gate threshold temporarily to test if gate is working
      if (audioProcessingEnabled) {
        console.log("TESTING GATE: Setting temporary high threshold to force gate closed");
        const testThreshold = 0; // Set to 0 dB which is very high, most mic input will be below this
        const testEffectiveThreshold = testThreshold + 10; // Add 10dB margin
        const testShouldOpenGate = micLevel > testEffectiveThreshold && !isAISpeaking;
        console.log(`TEST GATE: With threshold ${testThreshold} dB (effective: ${testEffectiveThreshold} dB), gate should be ${testShouldOpenGate ? 'OPEN' : 'CLOSED'}`);
      }
      
    }, 1000); // Check every second for detailed logs
    
    // Clean up the gate check interval when the audio context is closed
    audioContext.addEventListener('close', () => {
      console.log('Cleaning up gate intervals');
      clearInterval(gateCheckInterval);
      clearInterval(gateControlInterval);
      
      if (meterIntervalRef.current) {
        clearInterval(meterIntervalRef.current);
        meterIntervalRef.current = null;
      }
    });
    
    // If we have an active peer connection, replace the track
    if (peerConnectionRef.current) {
      const senders = peerConnectionRef.current.getSenders();
      const audioSender = senders.find(sender => 
        sender.track && sender.track.kind === 'audio'
      );
      
      if (audioSender && processedStream.getAudioTracks().length > 0) {
        const gatedTrack = processedStream.getAudioTracks()[0];
        console.log("Replacing original track with processed audio track");
        audioSender.replaceTrack(gatedTrack)
          .then(() => console.log("✅ Track replacement successful"))
          .catch(err => {
            console.error("❌ Failed to replace track with processed audio:", err);
          });
      } else {
        console.warn("Cannot replace track: audioSender or processed tracks not available", {
          hasSender: !!audioSender,
          processedTracks: processedStream.getTracks().length
        });
      }
    } else {
      console.log("No active peer connection yet, processed track will be used when connection is established");
    }
    
    return {
      processedStream,
      analyzerNode
    };
  }

  /**
   * Sets up proper audio level metering using RMS calculation and dB conversion
   */
  function setupAudioMeter(analyzerNode: AnalyserNode) {
    // Create a buffer for the time domain data
    const bufferLength = analyzerNode.frequencyBinCount;
    const timeData = new Float32Array(bufferLength);
    
    // Set up the meter update interval
    meterIntervalRef.current = window.setInterval(() => {
      // Get time domain data (raw audio samples)
      analyzerNode.getFloatTimeDomainData(timeData);
      
      // Calculate RMS (Root Mean Square)
      let sumOfSquares = 0;
      for (let i = 0; i < timeData.length; i++) {
        sumOfSquares += timeData[i] * timeData[i];
      }
      const rms = Math.sqrt(sumOfSquares / timeData.length);
      
      // Convert to dB relative to full scale (dBFS)
      // Add a small value to prevent log(0)
      const dbFS = 20 * Math.log10(Math.max(rms, 0.00001));
      
      // Store the current dB level - allow values above 0 dB for loud speech
      dbLevelRef.current = Math.max(-100, dbFS);
      
      // Apply meter ballistics (fast attack, slow release)
      if (dbFS > displayLevelRef.current) {
        // Fast attack (roughly 50ms at 20Hz update rate)
        displayLevelRef.current = dbFS * 0.7 + displayLevelRef.current * 0.3;
      } else {
        // Slow release (roughly 500ms at 20Hz update rate)
        displayLevelRef.current = dbFS * 0.1 + displayLevelRef.current * 0.9;
      }
      
      // Ensure display level is within range - allow values above 0 dB
      displayLevelRef.current = Math.max(-100, displayLevelRef.current);
      
    }, 50); // Update every 50ms (20Hz update rate)
  }

  // Function to get the current audio level for external use
  function getAudioLevel(): number {
    return displayLevelRef.current;
  }

  /**
   * Calculate RMS volume from inbound assistant audio and convert to dB
   */
  function getVolume(): number {
    if (!analyserRef.current) return 0;
    
    // Get time domain data
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    analyserRef.current.getFloatTimeDomainData(dataArray);

    // Calculate RMS
    let sumOfSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sumOfSquares += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sumOfSquares / dataArray.length);
    
    // Convert to dB
    const dbFS = 20 * Math.log10(Math.max(rms, 0.00001));
    
    // Store the dB value for use in the gate - allow values above 0 dB
    aiLevelRef.current = Math.max(-100, dbFS);
    
    // Return the linear value for backward compatibility
    return rms;
  }

  /**
   * Send an initial message to prompt the AI to start the conversation
   */
  function sendInitialPrompt() {
    console.log("Sending initial prompt to start conversation");
    
    // Create a system message to prompt the AI to start the conversation
    const initialPrompt = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "system",
        content: [
          {
            type: "input_text",
            text: "Please start the conversation by greeting the user and introducing yourself.",
          },
        ],
      },
    };

    const response = {
      type: "response.create",
    };
    
    try {
      if (dataChannelRef.current && dataChannelRef.current.readyState === "open") {
        dataChannelRef.current.send(JSON.stringify(initialPrompt));
        dataChannelRef.current.send(JSON.stringify(response));
        console.log("Initial prompt sent successfully");
      } else {
        console.error("Data channel not ready, cannot send initial prompt");
      }
    } catch (err) {
      console.error("Error sending initial prompt:", err);
    }
  }

  /**
   * Start a new session:
   */
  async function startSession() {
    try {
      console.log("Starting WebRTC session...");
      setStatus('connecting');
      
      // Get an ephemeral token for this session
      const token = await getEphemeralToken();
      console.log("Obtained ephemeral token for session");
      
      // Create a new peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          {
            urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'],
          },
        ],
        // Add TURN servers here if needed
      });
      console.log("Created new RTCPeerConnection with ICE servers");
      
      // Store the peer connection for later use
      peerConnectionRef.current = peerConnection;
      
      // Set up event handlers for the peer connection
      peerConnection.oniceconnectionstatechange = () => {
        console.log("ICE connection state changed:", peerConnection.iceConnectionState);
        if (peerConnection.iceConnectionState === 'disconnected' || 
            peerConnection.iceConnectionState === 'failed' || 
            peerConnection.iceConnectionState === 'closed') {
          console.warn("ICE connection issue:", peerConnection.iceConnectionState);
          setStatus(`Connection issue: ${peerConnection.iceConnectionState}`);
        }
      };
      
      peerConnection.onicecandidate = (event) => {
        console.log("ICE candidate:", event.candidate);
      };
      
      // Set up event handler for incoming tracks
      peerConnection.ontrack = (event) => {
        console.log("Received track from peer:", event.track.kind);
        if (audioElementRef.current) {
          audioElementRef.current.srcObject = event.streams[0];
          audioElementRef.current.muted = false;
          audioElementRef.current.volume = 1.0;
          console.log("Set audio element source to incoming stream");
        } else {
          console.error("No audio element available for output");
        }
        
        // Setup audio analysis for visualization
        const audioCtx = new (window.AudioContext || window.AudioContext)();
        const src = audioCtx.createMediaStreamSource(event.streams[0]);
        const inboundAnalyzer = audioCtx.createAnalyser();
        inboundAnalyzer.fftSize = 256;
        src.connect(inboundAnalyzer);
        analyserRef.current = inboundAnalyzer;
        
        // Start volume monitoring
        if (volumeIntervalRef.current) {
          clearInterval(volumeIntervalRef.current);
        }
        volumeIntervalRef.current = window.setInterval(() => {
          setCurrentVolume(getVolume());
        }, 100);
      };
      
      // Create a data channel for sending and receiving JSON messages
      const dataChannel = peerConnection.createDataChannel('json', {
        ordered: true,
      });
      dataChannelRef.current = dataChannel;
      console.log("Created data channel for JSON messages");
      
      // Set up data channel event handlers
      dataChannel.onopen = () => {
        console.log("Data channel is now open, configuring...");
        try {
          configureDataChannel(dataChannel);
          console.log("Data channel configured successfully");
        } catch (error) {
          console.error("Error configuring data channel:", error);
        }
      };
      
      dataChannel.onmessage = handleDataChannelMessage;
      
      dataChannel.onerror = (event) => {
        console.error("Data channel error:", event);
      };
      
      dataChannel.onclose = () => {
        console.log("Data channel closed");
      };
      
      // Set up audio element for assistant audio responses
      if (!audioElementRef.current) {
        const audioEl = document.createElement("audio");
        audioEl.autoplay = true;
        audioElementRef.current = audioEl;
        console.log("Created new audio element for output");
      } else {
        console.log("Reusing existing audio element");
        // Make sure the audio element is ready for a new session
        audioElementRef.current.srcObject = null;
      }
      
      // Get user media (microphone) based on the current modality
      let stream: MediaStream | null = null;
      
      if (currentModality === 'text+audio') {
        try {
          console.log("Requesting microphone access...");
          stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            },
            video: false,
          });
          console.log("Microphone access granted, stream obtained with tracks:", 
            stream.getTracks().map(t => `${t.kind}:${t.id}:${t.label}`).join(', '));
          
          // Store the raw stream for later use
          audioStreamRef.current = stream;
          
          // Set up audio visualization and processing
          console.log("Setting up audio visualization and processing...");
          const { processedStream, analyzerNode } = setupAudioVisualization(stream);
          
          console.log("Audio processing chain setup complete");
          console.log("Raw stream tracks:", stream.getTracks().map(t => `${t.kind}:${t.id}`).join(', '));
          console.log("Processed stream tracks:", processedStream.getTracks().map(t => `${t.kind}:${t.id}`).join(', '));
          
          // Decide which audio track to use based on audio processing state
          const audioTrackToUse = audioProcessingEnabled ? 
            processedStream.getAudioTracks()[0] : 
            stream.getAudioTracks()[0];
          
          console.log(`Adding ${audioProcessingEnabled ? 'PROCESSED' : 'RAW'} audio track to peer connection`);
          console.log("Selected track details:", {
            id: audioTrackToUse.id,
            kind: audioTrackToUse.kind,
            label: audioTrackToUse.label,
            enabled: audioTrackToUse.enabled,
            muted: audioTrackToUse.muted,
            readyState: audioTrackToUse.readyState
          });
          
          // Add the selected audio track to the peer connection
          peerConnection.addTrack(audioTrackToUse, audioProcessingEnabled ? processedStream : stream);
          
        } catch (error: any) {
          console.error('Error accessing microphone:', error);
          setStatus('error');
          // Use a more generic error message instead of trying to access error.message
          console.log(`Microphone access error: ${error?.message || 'Unknown error'}`);
          return;
        }
      } else {
        // For text-only mode, create a silent audio track
        console.log("Text-only mode: Creating silent audio track without requesting microphone");
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const destination = audioContext.createMediaStreamDestination();
        oscillator.connect(destination);
        const silentStream = destination.stream;
        
        // Add the silent audio track to the peer connection
        silentStream.getAudioTracks().forEach(track => {
          // For text-only mode, we'll mute the track
          track.enabled = false;
          peerConnection.addTrack(track, silentStream);
        });
      }
      
      // Create the SDP offer
      console.log("Creating SDP offer...");
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      // Ensure we have a complete SDP before sending
      while (peerConnection.localDescription?.sdp === undefined || peerConnection.localDescription.type !== 'offer') {
        console.log("Waiting for complete SDP offer...");
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!peerConnection.localDescription || !peerConnection.localDescription.sdp) {
        throw new Error("Failed to create valid SDP offer");
      }
      
      console.log("SDP offer created successfully");
      
      // Send SDP offer to OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      console.log(`Sending SDP offer to ${baseUrl}?model=${model}&voice=${voice}`);
      
      const response = await fetch(`${baseUrl}?model=${model}&voice=${voice}`, {
        method: "POST",
        body: peerConnection.localDescription.sdp,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/sdp",
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }
      
      // Get the SDP answer and set as remote description
      const answerSdp = await response.text();
      console.log("Received SDP answer, first 100 chars:", answerSdp.substring(0, 100));
      
      // Ensure the SDP answer starts with v=
      if (!answerSdp.trim().startsWith("v=")) {
        throw new Error(`Invalid SDP answer received: ${answerSdp.substring(0, 100)}...`);
      }
      
      await peerConnection.setRemoteDescription({ 
        type: "answer", 
        sdp: answerSdp 
      });
      
      console.log("Remote description set successfully, waiting for connection to establish...");
      
    } catch (error: any) {
      console.error("startSession error:", error);
      setStatus(`Error: ${error?.message || 'Unknown error'}`);
      stopSession();
    }
  }

  /**
   * Fetch ephemeral token from your Next.js endpoint
   */
  async function getEphemeralToken(modality: Modality = currentModality) {
    try {
      console.log(`Requesting ephemeral token for modality: ${modality}`);
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modality }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to get ephemeral token: ${response.status} - ${errorText}`);
        
        // Check for network connectivity issues
        if (errorText.includes("ENOTFOUND") || errorText.includes("getaddrinfo")) {
          setStatus("Network connectivity issue: Cannot reach OpenAI API. Please check your internet connection.");
          throw new Error("Network connectivity issue: Cannot reach OpenAI API");
        }
        
        throw new Error(`Failed to get ephemeral token: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.client_secret?.value) {
        console.error("Received token data:", JSON.stringify(data).substring(0, 200));
        
        // Check if there's an error message in the response
        if (data.error) {
          setStatus(`Error: ${data.error}`);
          throw new Error(`Invalid token response: ${data.error}`);
        }
        
        throw new Error("Invalid token response - missing client_secret.value");
      }
      
      console.log(`Successfully obtained ephemeral token for ${modality} session`);
      return data.client_secret.value;
    } catch (err: unknown) {
      console.error("getEphemeralToken error:", err);
      
      // Set a user-friendly error message
      if (err instanceof Error && err.message.includes("Network connectivity")) {
        setStatus("Network connectivity issue: Cannot reach OpenAI API. Please check your internet connection.");
      } else {
        setStatus(`Error getting token: ${err instanceof Error ? err.message : String(err)}`);
      }
      
      throw err;
    }
  }

  /**
   * Stop the session & cleanup
   */
  function stopSession() {
    console.log("Stopping session and cleaning up resources");
    
    if (dataChannelRef.current) {
      dataChannelRef.current.close();
      dataChannelRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (err) {
        console.warn("Error closing audio context:", err);
      }
      audioContextRef.current = null;
    }
    
    if (audioStreamRef.current) {
      try {
        audioStreamRef.current.getTracks().forEach(track => {
          track.stop();
        });
      } catch (err) {
        console.warn("Error stopping audio tracks:", err);
      }
      audioStreamRef.current = null;
    }
    
    if (audioIndicatorRef.current) {
      audioIndicatorRef.current.classList.remove("active");
    }
    
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    
    // Clean up audio element
    if (audioElementRef.current) {
      try {
        audioElementRef.current.srcObject = null;
        audioElementRef.current.pause();
        console.log("Cleaned up audio element");
      } catch (err) {
        console.warn("Error cleaning up audio element:", err);
      }
      // Don't set to null as we might reuse it
    }
    
    analyserRef.current = null;
    ephemeralUserMessageIdRef.current = null;

    setCurrentVolume(0);
    setIsSessionActive(false);
    setStatus("Session stopped");
    
    console.log("Session cleanup completed");
  }

  /**
   * Toggle start/stop from a single button
   */
  function handleStartStopClick() {
    if (isSessionActive) {
      stopSession();
    } else {
      startSession();
    }
  }

  /**
   * Send a text message through the data channel
   */
  function sendTextMessage(text: string) {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== "open") {
      console.error("Data channel not ready, cannot send message:", text);
      setStatus("Cannot send message - connection not ready. Please try again.");
      return;
    }

    const messageId = uuidv4();
    
    // Add message to conversation immediately
    const newMessage: Conversation = {
      id: messageId,
      role: "user",
      text,
      timestamp: new Date().toISOString(),
      isFinal: true,
      status: "final",
    };
    
    setConversation(prev => [...prev, newMessage]);

    console.log(`Sending text message: "${text}" in modality: ${currentModality}`);

    // Send message through data channel
    const message = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: text,
          },
        ],
      },
    };

    const response = {
      type: "response.create",
    };
    
    try {
      dataChannelRef.current.send(JSON.stringify(message));
      dataChannelRef.current.send(JSON.stringify(response));
    } catch (err) {
      console.error("Error sending message:", err);
      setStatus("Error sending message. Please try again.");
    }
  }

  /**
   * Update turn detection settings in the data channel
   */
  function updateTurnDetectionSettings() {
    if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
      console.log("Data channel not ready, can't update turn detection settings");
      return;
    }
    
    try {
      const turnDetectionUpdate = {
        type: "session.update",
        session: {
          turn_detection: {
            type: "server_vad",
            threshold: turnDetectionThreshold,
            prefix_padding_ms: 300,
            silence_duration_ms: silenceDurationMs,
            create_response: true
          }
        }
      };
      
      dataChannelRef.current.send(JSON.stringify(turnDetectionUpdate));
      console.log("Turn detection settings updated:", turnDetectionUpdate);
    } catch (err) {
      console.error("Error updating turn detection settings:", err);
    }
  }

  // Function to toggle audio processing and update the track in real-time
  function updateAudioProcessingState(enabled: boolean) {
    console.log(`Setting audio processing to: ${enabled ? 'ENABLED' : 'DISABLED'}`);
    if (enabled) {
      const isHighThreshold = gateThreshold >= 0;
      const effectiveThreshold = isHighThreshold ? gateThreshold + 10 : gateThreshold;
      console.log(`When ENABLED:
  - Noise gate will filter out background noise below ${effectiveThreshold} dB
  - ${isHighThreshold ? `HIGH THRESHOLD MODE ACTIVE: Using ${effectiveThreshold} dB effective threshold (+10dB margin)` : ''}
  - Microphone will be muted when AI is speaking (above ${aiSpeakingThreshold} dB)
  - Only your voice above the threshold will be sent to OpenAI
  - DOUBLE GATE IMPLEMENTATION: Using two gain nodes in series for maximum protection
  - Gate is implemented using gain nodes (0 = closed, 1 = open)`);
    } else {
      console.log(`When DISABLED:
  - All microphone audio will be sent to OpenAI without filtering
  - Background noise will not be filtered
  - Your microphone will remain active even when AI is speaking`);
    }
    
    // Update the state
    setAudioProcessingEnabledState(enabled);
    
    // If we have an active peer connection and both raw and processed streams,
    // we need to replace the track
    if (peerConnectionRef.current && audioStreamRef.current && processedStreamRef.current) {
      const senders = peerConnectionRef.current.getSenders();
      const audioSender = senders.find(sender => 
        sender.track && sender.track.kind === 'audio'
      );
      
      if (audioSender) {
        // Choose the appropriate track based on the enabled state
        const newTrack = enabled 
          ? processedStreamRef.current.getAudioTracks()[0] 
          : audioStreamRef.current.getAudioTracks()[0];
        
        if (newTrack) {
          console.log(`Replacing track with ${enabled ? 'PROCESSED' : 'RAW'} audio track`);
          console.log("New track details:", {
            id: newTrack.id,
            kind: newTrack.kind,
            label: newTrack.label,
            enabled: newTrack.enabled,
            muted: newTrack.muted,
            readyState: newTrack.readyState
          });
          
          // Also update the gain node if audio processing is enabled
          if (enabled && gateNodeRef.current) {
            // Start with gate closed until levels are checked
            gateNodeRef.current.gain.value = 0;
            console.log("Reset gate gain to 0 (closed) until levels are checked");
          }
          
          audioSender.replaceTrack(newTrack)
            .then(() => console.log("✅ Track replacement successful"))
            .catch(err => {
              console.error("❌ Failed to replace track:", err);
            });
        } else {
          console.warn(`No ${enabled ? 'processed' : 'raw'} audio track available for replacement`);
        }
      } else {
        console.warn("No audio sender found in peer connection");
      }
    } else {
      console.log("Cannot replace track: No active peer connection or streams available");
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => stopSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    isSessionActive,
    audioIndicatorRef,
    startSession,
    stopSession,
    handleStartStopClick,
    registerFunction,
    msgs,
    currentVolume,
    conversation,
    sendTextMessage,
    updateModality,
    currentModality,
    setGateThreshold,
    setAiSpeakingThreshold,
    gateThreshold,
    aiSpeakingThreshold,
    turnDetectionThreshold,
    setTurnDetectionThreshold,
    silenceDurationMs,
    setSilenceDurationMs,
    updateTurnDetectionSettings,
    audioProcessingEnabled,
    setAudioProcessingEnabled: updateAudioProcessingState,
  };
}
