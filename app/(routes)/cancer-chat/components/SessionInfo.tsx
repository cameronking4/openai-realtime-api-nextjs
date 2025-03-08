import React from 'react';

// This is a Server Component
export function SessionInfo({ 
  sessionId, 
  sessionState,
  sessionDuration
}: { 
  sessionId: string;
  sessionState: "pre" | "active" | "post";
  sessionDuration: number;
}) {
  // In a real app, you would detect the device type server-side
  // For now, we'll just assume desktop
  const isMobile = false;
  
  // Format the current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="flex flex-col space-y-1 text-sm text-gray-500">
      <div className="flex justify-between items-center">
        <div>{currentDate}</div>
        {sessionState === "active" && (
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <span>{formatDuration(sessionDuration)}</span>
          </div>
        )}
      </div>
      <div className="text-xs">
        {isMobile ? 'Mobile' : 'Desktop'} Session
      </div>
    </div>
  );
}

// Format the duration as mm:ss
function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
} 