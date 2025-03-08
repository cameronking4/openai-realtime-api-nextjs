import React from 'react';

// This is a Server Component
export function TranscriptManager({ sessionId }: { sessionId: string }) {
  // In a real app, you would fetch transcript data from a database
  // For now, we'll just pass the sessionId to the client component
  
  return (
    <div className="flex space-x-2">
      <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
        Download Transcript
      </button>
      <button className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
        Save Transcript
      </button>
    </div>
  );
} 