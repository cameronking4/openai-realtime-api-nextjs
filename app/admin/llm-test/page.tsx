import Link from 'next/link';

export const metadata = {
  title: 'LLM Prompt Testing',
  description: 'Test and refine LLM prompts for cancer chat',
};

export default function LLMTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LLM Prompt Testing Framework</h1>
        <p className="text-gray-600 mb-4">
          Test and refine prompts for cancer chat using simulated patient personas and conversations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link 
          href="/admin/llm-test/personas" 
          className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-100 text-blue-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">1. Patient Personas</h2>
          <p className="text-gray-700">
            Generate and manage realistic cancer patient personas for testing.
          </p>
        </Link>

        <Link 
          href="/admin/llm-test/simulator" 
          className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-100 text-green-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">2. Conversation Simulator</h2>
          <p className="text-gray-700">
            Simulate conversations between patient personas and the cancer chat.
          </p>
        </Link>

        <Link 
          href="/admin/llm-test/evaluator" 
          className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-100 text-purple-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">3. Assessment Evaluator</h2>
          <p className="text-gray-700">
            Evaluate the quality and accuracy of AI-generated assessments.
          </p>
        </Link>

        <Link 
          href="/admin/llm-test/refinement" 
          className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-amber-100 text-amber-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">4. Prompt Refinement</h2>
          <p className="text-gray-700">
            Refine prompts based on evaluation results and suggestions.
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link 
          href="/admin/llm-test/dashboard" 
          className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-100 text-indigo-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">5. Visualization Dashboard</h2>
          <p className="text-gray-700">
            View metrics, trends, and performance data from testing cycles.
          </p>
        </Link>

        <Link 
          href="/admin/llm-test/run" 
          className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
        >
          <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-100 text-red-600 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Run Complete Test Cycle</h2>
          <p className="text-gray-700">
            Run an end-to-end test cycle with all components in sequence.
          </p>
        </Link>
      </div>
    </div>
  );
} 