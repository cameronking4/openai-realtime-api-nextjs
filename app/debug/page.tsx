"use client";

import React, { useState } from 'react';
import { testAssessmentAPI, testGenerateAssessment } from '../_utils/debug-assessment';

export default function DebugPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const handleTestAPI = async () => {
    setLoading(true);
    try {
      const result = await testAssessmentAPI();
      setResults(result);
    } catch (error: any) {
      setResults({
        success: false,
        error: error.message || 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleTestAssessment = async () => {
    setLoading(true);
    try {
      const result = await testGenerateAssessment();
      setResults(result);
    } catch (error: any) {
      setResults({
        success: false,
        error: error.message || 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Assessment API Debug</h1>
      
      <div className="flex flex-col space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={handleTestAPI}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test API Configuration'}
          </button>
          
          <button
            onClick={handleTestAssessment}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? 'Testing...' : 'Test Generate Assessment'}
          </button>
        </div>
        
        {results && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Results</h2>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-[600px]">
              <pre className="whitespace-pre-wrap">{JSON.stringify(results, null, 2)}</pre>
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Console Instructions</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <p>Open your browser's developer console (F12 or Command+Option+I) to see detailed logs.</p>
            <p className="mt-2">If testing on Vercel, check the Vercel logs in the dashboard for server-side errors.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 