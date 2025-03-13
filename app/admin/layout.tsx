import Link from 'next/link';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-800 hover:text-blue-600">
                ← Back to App
              </Link>
              <Link href="/admin" className="text-gray-800 hover:text-blue-600 font-medium">
                Admin Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin/llm-test" className="text-gray-600 hover:text-blue-600">
                LLM Testing
              </Link>
              <Link href="/admin/prompts" className="text-gray-600 hover:text-blue-600">
                Prompts
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        {children}
      </main>
    </div>
  );
} 