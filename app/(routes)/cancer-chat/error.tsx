'use client';

import React from 'react';
import { Button } from '@/app/_components/ui/button';

export default function CancerChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-screen">
      <div className="flex flex-col items-center justify-center space-y-4 max-w-md p-6 bg-white rounded-lg shadow-lg">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">Something went wrong</h2>
        <p className="text-gray-600 text-center">
          We're sorry, but there was an error loading your healing check-in session.
        </p>
        <div className="flex space-x-4 mt-4">
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="border-cancer-accent text-cancer-accent hover:bg-cancer-accent/10"
          >
            Go Home
          </Button>
          <Button
            onClick={() => reset()}
            className="bg-cancer-accent hover:bg-cancer-accent/90 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
} 