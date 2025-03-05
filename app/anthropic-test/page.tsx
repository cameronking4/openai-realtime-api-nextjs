'use client';

import { useState } from 'react';

export default function AnthropicTest() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/anthropic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: 'user', content: input }
          ],
          model: 'claude-3-opus-20240229',
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
      }

      const data = await res.json();
      setResponse(data.content[0].text);
    } catch (err) {
      console.error('Error calling Anthropic API:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">Anthropic API Test</h1>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label htmlFor="prompt" className="block mb-2 font-medium">
            Enter your prompt:
          </label>
          <textarea
            id="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            placeholder="Type your message here..."
          />
        </div>
        
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
        >
          {loading ? 'Sending...' : 'Send to Claude'}
        </button>
      </form>

      {error && (
        <div className="p-4 mb-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Response:</h2>
          <div className="p-4 bg-gray-100 rounded-md whitespace-pre-wrap">
            {response}
          </div>
        </div>
      )}
    </div>
  );
} 