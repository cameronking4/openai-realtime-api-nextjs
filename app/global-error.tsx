'use client';

import React from 'react';
import { Poppins } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  variable: "--font-poppins",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body className={cn("min-h-dvh bg-background font-sans antialiased", poppins.variable)}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Application Error</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We apologize for the inconvenience. The application encountered a critical error.
            </p>
            <div className="flex justify-center">
              <button
                onClick={reset}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded"
              >
                Try again
              </button>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                If this issue persists, please refresh the page or try again later.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 