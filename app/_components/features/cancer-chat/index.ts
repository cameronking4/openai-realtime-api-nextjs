/**
 * Cancer Chat Feature Components
 * 
 * This file exports components specific to the cancer chat feature.
 * Components are organized by their role in the feature.
 */

// Main components
import { CancerChatInterface } from '@/app/_components/features/cancer-chat/CancerChatInterface';
import { InputSection } from '@/app/_components/features/cancer-chat/InputSection';
import { MessageBubble } from '@/app/_components/features/cancer-chat/MessageBubble';
import { PreSessionOptions } from '@/app/_components/features/cancer-chat/PreSessionOptions';
import { HeaderSection } from '@/app/_components/features/cancer-chat/HeaderSection';
import { SessionControls } from '@/app/_components/features/cancer-chat/SessionControls';
import { LoadingScreen } from '@/app/_components/features/cancer-chat/LoadingScreen';

// UI components
import { SuggestedResponses } from '@/app/_components/features/cancer-chat/SuggestedResponses';
import { SuggestedResponseButton } from '@/app/_components/features/cancer-chat/SuggestedResponseButton';
import { AssessmentModal } from '@/app/_components/features/cancer-chat/AssessmentModal';
import { AudioVisualizer } from '@/app/_components/features/cancer-chat/AudioVisualizer';
import { AudioSettings } from '@/app/_components/features/cancer-chat/AudioSettings';

// Utility components - using default imports
import AudioProcessor from '@/app/_components/shared/audio-processor';
import RealtimeBlock from '@/app/_components/shared/realtime-block';
import GateSettings from '@/app/_components/shared/gate-settings';

// Re-export all components
export {
  // Main components
  CancerChatInterface,
  InputSection,
  MessageBubble,
  PreSessionOptions,
  HeaderSection,
  SessionControls,
  LoadingScreen,
  
  // UI components
  SuggestedResponses,
  SuggestedResponseButton,
  AssessmentModal,
  AudioVisualizer,
  AudioSettings,
  
  // Utility components
  AudioProcessor,
  RealtimeBlock,
  GateSettings
}; 