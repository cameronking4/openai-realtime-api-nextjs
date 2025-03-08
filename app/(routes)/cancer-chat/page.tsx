import { CancerChatPageClient } from './components/cancer-chat-page-client';

// This is a Server Component
export default function CancerChatPage() {
  // In a real app, you would fetch user preferences from cookies or a database
  // For now, we'll just use default values
  const preferredModality = 'text';
  const hasCompletedOnboarding = false;
  
  return (
    <CancerChatPageClient 
      initialModality={preferredModality as 'text' | 'text+audio'} 
      hasCompletedOnboarding={hasCompletedOnboarding}
    />
  );
} 