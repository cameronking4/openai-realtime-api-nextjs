# Audio Routing Diagram for WebRTC Application

```mermaid
graph TD
    MIC[Microphone Input] --> |getUserMedia| RAW[Raw Audio Stream]
    RAW --> |createMediaStreamSource| SRC[Source Node]
    SRC --> ANALYZER[Analyzer Node]
    SRC --> SCRIPT[Script Processor Node]
    
    %% Gate Processing Logic
    ANALYZER --> |getByteFrequencyData| LEVEL[Audio Level Calculation]
    LEVEL --> |displayLevelRef| GATE_LOGIC[Gate Logic]
    AI_LEVEL[AI Speaking Level] --> |aiLevelRef| GATE_LOGIC
    GATE_THRESHOLD[Gate Threshold] --> GATE_LOGIC
    AI_THRESHOLD[AI Speaking Threshold] --> GATE_LOGIC
    AUDIO_PROC_ENABLED[Audio Processing Enabled] --> GATE_LOGIC
    
    %% Script Processor Logic
    GATE_LOGIC --> |shouldOpenGate| SCRIPT
    SCRIPT --> |onaudioprocess| DEST[Destination Node]
    DEST --> PROCESSED[Processed Audio Stream]
    
    %% Track Selection
    RAW --> |if !audioProcessingEnabled| TRACK_SELECT[Track Selection]
    PROCESSED --> |if audioProcessingEnabled| TRACK_SELECT
    
    %% WebRTC Connection
    TRACK_SELECT --> |addTrack| PEER[RTCPeerConnection]
    PEER --> |SDP Exchange| OPENAI[OpenAI Realtime API]
    
    %% Return Audio Path
    OPENAI --> |ontrack| INCOMING[Incoming Audio Stream]
    INCOMING --> AUDIO_EL[Audio Element]
    INCOMING --> AI_ANALYZER[AI Audio Analyzer]
    AI_ANALYZER --> |getByteFrequencyData| AI_LEVEL
    
    %% Data Channel
    PEER --> |createDataChannel| DATA[Data Channel]
    DATA --> |send| JSON_MSGS[JSON Messages to OpenAI]
    DATA --> |onmessage| HANDLE_MSG[Handle Incoming Messages]
    
    %% UI Components
    LEVEL --> UI_METER[UI Audio Meter]
    AI_LEVEL --> UI_AI_METER[UI AI Audio Meter]
    GATE_LOGIC --> UI_GATE_STATE[UI Gate State]
    
    %% Controls
    UI_CONTROLS[UI Controls] --> |setAudioProcessingEnabled| AUDIO_PROC_ENABLED
    UI_CONTROLS --> |setGateThreshold| GATE_THRESHOLD
    UI_CONTROLS --> |setAiSpeakingThreshold| AI_THRESHOLD
    
    %% Style definitions
    classDef audioNodes fill:#f9f,stroke:#333,stroke-width:2px;
    classDef streams fill:#bbf,stroke:#333,stroke-width:2px;
    classDef logic fill:#bfb,stroke:#333,stroke-width:2px;
    classDef ui fill:#fbb,stroke:#333,stroke-width:2px;
    classDef webrtc fill:#ffb,stroke:#333,stroke-width:2px;
    
    class SRC,ANALYZER,SCRIPT,DEST,AI_ANALYZER audioNodes;
    class RAW,PROCESSED,INCOMING streams;
    class GATE_LOGIC,TRACK_SELECT,LEVEL,AI_LEVEL logic;
    class UI_METER,UI_AI_METER,UI_GATE_STATE,UI_CONTROLS ui;
    class PEER,DATA,OPENAI webrtc;
```

## Audio Processing Flow Explanation

### 1. Audio Capture and Initial Processing
- **Microphone Input**: Captured using `navigator.mediaDevices.getUserMedia()`
- **Raw Audio Stream**: The unprocessed audio from the microphone
- **Source Node**: Created from the raw stream using `audioContext.createMediaStreamSource()`
- **Analyzer Node**: Used for real-time level metering of the raw audio

### 2. Noise Gate Processing
- **Audio Level Calculation**: Analyzes frequency data to determine current audio level in dB
- **Gate Logic**: Determines if audio should pass through based on:
  - Current microphone level vs. gate threshold
  - Whether AI is currently speaking (to prevent feedback)
  - Whether audio processing is enabled
- **Script Processor Node**: Applies the gate by either:
  - Passing through audio samples when gate is open
  - Outputting silence (zeros) when gate is closed
- **Destination Node**: Creates a processed MediaStream with the gated audio

### 3. Track Selection
- Based on `audioProcessingEnabled` state:
  - If enabled: Uses the processed (gated) audio track
  - If disabled: Uses the raw audio track directly
- The selected track is added to the RTCPeerConnection

### 4. WebRTC Connection
- **RTCPeerConnection**: Manages the WebRTC connection to OpenAI
- **SDP Exchange**: Negotiates the connection with OpenAI's Realtime API
- **Data Channel**: Sends and receives JSON messages for text and control

### 5. Return Audio Path
- **Incoming Audio Stream**: Audio received from OpenAI
- **Audio Element**: Plays the AI's voice response
- **AI Audio Analyzer**: Monitors the AI's audio level to detect when it's speaking

### 6. User Interface
- **UI Audio Meters**: Display microphone and AI audio levels
- **UI Gate State**: Shows whether the gate is open or closed
- **UI Controls**: Allow adjusting thresholds and toggling audio processing

## Key Components in Code

1. `setupAudioVisualization()`: Creates the audio processing chain
2. `updateAudioProcessingState()`: Toggles between processed and raw audio
3. `startSession()`: Establishes the WebRTC connection
4. `configureDataChannel()`: Sets up communication with OpenAI
5. `GateSettings` component: Provides UI controls for the audio processing

## Audio Processing Control Flow

When audio processing is enabled:
1. Raw audio → Script Processor → Gate Logic → Processed Stream → OpenAI
2. Gate opens only when:
   - Mic level > Gate threshold
   - AI is not speaking
   - Audio processing is enabled

When audio processing is disabled:
1. Raw audio → OpenAI (bypassing the gate) 