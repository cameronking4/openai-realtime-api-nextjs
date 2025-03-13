import Link from 'next/link';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for cancer chat application',
};

export default function AdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* LLM Testing Module */}
        <Link 
          href="/admin/llm-test" 
          className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
        >
          <h2 className="text-xl font-bold mb-2">LLM Prompt Testing</h2>
          <p className="text-gray-700">
            Test and refine LLM prompts using simulated patient personas and conversations.
          </p>
        </Link>

        {/* Prompt Management Module */}
        <Link 
          href="/admin/prompts" 
          className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md hover:bg-gray-50"
        >
          <h2 className="text-xl font-bold mb-2">Prompt Management</h2>
          <p className="text-gray-700">
            Manage and deploy different versions of prompts for the cancer chat application.
          </p>
        </Link>

        {/* Analytics Module (placeholder for future) */}
        <div className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md opacity-50">
          <h2 className="text-xl font-bold mb-2">Analytics</h2>
          <p className="text-gray-700">
            View usage statistics and performance metrics (coming soon).
          </p>
        </div>

        {/* User Management Module (placeholder for future) */}
        <div className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md opacity-50">
          <h2 className="text-xl font-bold mb-2">User Management</h2>
          <p className="text-gray-700">
            Manage user accounts and permissions (coming soon).
          </p>
        </div>
      </div>
    </div>
  );
} 