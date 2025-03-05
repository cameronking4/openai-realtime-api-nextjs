"use client";

import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Conversation } from "@/lib/conversations";
import { useTranslations } from "@/components/translations-context";

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

  /**
   * Register a function (tool) so the AI can call it.
   */
  function registerFunction(name: string, fn: Function) {
    functionRegistry.current[name] = fn;
  }

  /**
   * Update session modality
   */
  function updateModality(modality: Modality) {
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
    if (modality === "text+audio" && (!audioStreamRef.current || !audioStreamRef.current.getAudioTracks().some(track => track.enabled))) {
      console.log("Switching to audio mode, enabling audio tracks");
      
      // Try to enable existing tracks first
      if (audioStreamRef.current) {
        const tracks = audioStreamRef.current.getAudioTracks();
        if (tracks.length > 0) {
          tracks.forEach(track => track.enabled = true);
        }
      }
    }
    
    // If switching to text mode, disable audio tracks
    if (modality === "text" && audioStreamRef.current) {
      console.log("Switching to text mode, disabling audio tracks");
      audioStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
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
    console.log(`Configuring data channel for modality: ${currentModality}`);
    
    // Send session update
    const sessionUpdate = {
      type: "session.update",
      session: {
        modalities: currentModality === "text" ? ["text"] : ["text", "audio"],
        tools: tools || [],
        input_audio_transcription: currentModality === "text+audio" ? {
          model: "whisper-1",
        } : null,
      },
    };
    
    try {
      dataChannel.send(JSON.stringify(sessionUpdate));
      console.log("Session update sent:", sessionUpdate);
      
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
      dataChannel.send(JSON.stringify(languageMessage));
      console.log("Language preference message sent");
    } catch (err) {
      console.error("Error configuring data channel:", err);
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
   * Sets up a local audio visualization for mic input (toggle wave CSS).
   */
  function setupAudioVisualization(stream: MediaStream) {
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const updateIndicator = () => {
      if (!audioContext) return;
      analyzer.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

      // Toggle an "active" class if volume is above a threshold
      if (audioIndicatorRef.current) {
        audioIndicatorRef.current.classList.toggle("active", average > 30);
      }
      requestAnimationFrame(updateIndicator);
    };
    updateIndicator();

    audioContextRef.current = audioContext;
  }

  /**
   * Calculate RMS volume from inbound assistant audio
   */
  function getVolume(): number {
    if (!analyserRef.current) return 0;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const float = (dataArray[i] - 128) / 128;
      sum += float * float;
    }
    return Math.sqrt(sum / dataArray.length);
  }

  /**
   * Start a new session:
   */
  async function startSession() {
    try {
      // 1. First, get the ephemeral token
      setStatus("Fetching ephemeral token...");
      const ephemeralToken = await getEphemeralToken(currentModality);
      
      // 2. Get audio stream (required for both modes as the API requires an audio track)
      setStatus(currentModality === "text+audio" 
        ? "Requesting microphone access..." 
        : "Setting up connection...");
      
      let stream: MediaStream;
      
      try {
        // Try to get real microphone stream
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        if (currentModality === "text+audio") {
          // In audio mode, store the stream and set up visualization
          audioStreamRef.current = stream;
          setupAudioVisualization(stream);
        }
      } catch (err) {
        console.warn("Could not access microphone, creating silent audio track", err);
        
        // Create a silent audio track for text-only mode
        const audioContext = new AudioContext();
        const oscillator = audioContext.createOscillator();
        const destination = audioContext.createMediaStreamDestination();
        oscillator.connect(destination);
        stream = destination.stream;
        
        // In text-only mode, we'll still need a stream but won't use it for input
        if (currentModality === "text+audio") {
          setStatus("Error: Microphone access is required for voice mode");
          throw new Error("Microphone access is required for voice mode");
        }
      }

      // 3. Create peer connection
      setStatus("Establishing connection...");
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }]
      });
      peerConnectionRef.current = pc;

      // 4. Set up data channel for messages
      const dataChannel = pc.createDataChannel("text");
      dataChannelRef.current = dataChannel;

      dataChannel.onopen = () => {
        console.log(`Data channel open, modality: ${currentModality}`);
        configureDataChannel(dataChannel);
        setIsSessionActive(true);
        setStatus(`${currentModality} session established successfully!`);
      };
      
      dataChannel.onmessage = handleDataChannelMessage;
      
      // 5. Set up audio element for assistant audio responses
      const audioEl = document.createElement("audio");
      audioEl.autoplay = true;

      // 6. Handle incoming audio stream from assistant
      pc.ontrack = (event) => {
        audioEl.srcObject = event.streams[0];

        // Setup audio analysis for visualization
        const audioCtx = new (window.AudioContext || window.AudioContext)();
        const src = audioCtx.createMediaStreamSource(event.streams[0]);
        const inboundAnalyzer = audioCtx.createAnalyser();
        inboundAnalyzer.fftSize = 256;
        src.connect(inboundAnalyzer);
        analyserRef.current = inboundAnalyzer;

        // Start volume monitoring
        volumeIntervalRef.current = window.setInterval(() => {
          setCurrentVolume(getVolume());
        }, 100);
      };

      // 7. Always add audio track (required by API)
      // But we'll only use it for input in audio mode
      stream.getAudioTracks().forEach(track => {
        // For text-only mode, we'll mute the track
        if (currentModality === "text") {
          track.enabled = false;
        }
        pc.addTrack(track, stream);
      });
      
      // Store the stream reference regardless of mode
      audioStreamRef.current = stream;

      // 8. Create the SDP offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Ensure we have a complete SDP before sending
      while (pc.localDescription?.sdp === undefined || pc.localDescription.type !== 'offer') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      if (!pc.localDescription || !pc.localDescription.sdp) {
        throw new Error("Failed to create valid SDP offer");
      }
      
      console.log("SDP offer created with audio section");
      
      // 9. Send SDP offer to OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const response = await fetch(`${baseUrl}?model=${model}&voice=${voice}`, {
        method: "POST",
        body: pc.localDescription.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralToken}`,
          "Content-Type": "application/sdp",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      // 10. Get the SDP answer and set as remote description
      const answerSdp = await response.text();
      console.log("Received SDP answer, first 100 chars:", answerSdp.substring(0, 100));
      
      // Ensure the SDP answer starts with v=
      if (!answerSdp.trim().startsWith("v=")) {
        throw new Error(`Invalid SDP answer received: ${answerSdp.substring(0, 100)}...`);
      }
      
      await pc.setRemoteDescription({ 
        type: "answer", 
        sdp: answerSdp 
      });

      // Handle ICE gathering state changes
      pc.onicegatheringstatechange = () => {
        console.log("ICE gathering state:", pc.iceGatheringState);
      };

      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state:", pc.iceConnectionState);
        if (pc.iceConnectionState === "disconnected" || 
            pc.iceConnectionState === "failed" || 
            pc.iceConnectionState === "closed") {
          console.warn("ICE connection issue:", pc.iceConnectionState);
          setStatus(`Connection issue: ${pc.iceConnectionState}`);
        }
      };

    } catch (err) {
      console.error("startSession error:", err);
      setStatus(`Error: ${err}`);
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
  };
}
