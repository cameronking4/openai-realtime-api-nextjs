'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Something went wrong</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        We apologize for the inconvenience. An unexpected error has occurred.
      </p>
      <Button
        onClick={reset}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Try again
      </Button>
    </div>
  );
} 