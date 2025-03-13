import Link from 'next/link';
import { ReactNode } from 'react';

interface LLMTestLayoutProps {
  children: ReactNode;
}

export default function LLMTestLayout({ children }: LLMTestLayoutProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">LLM Prompt Testing</h1>
        <p className="text-gray-600">Test and refine prompts for cancer chat</p>
      </div>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <NavLink href="/admin/llm-test">Overview</NavLink>
          <NavLink href="/admin/llm-test/personas">Personas</NavLink>
          <NavLink href="/admin/llm-test/simulator">Simulator</NavLink>
          <NavLink href="/admin/llm-test/evaluator">Evaluator</NavLink>
          <NavLink href="/admin/llm-test/refinement">Refinement</NavLink>
          <NavLink href="/admin/llm-test/dashboard">Dashboard</NavLink>
          <NavLink href="/admin/llm-test/run">Run Tests</NavLink>
        </nav>
      </div>
      
      <div>
        {children}
      </div>
    </div>
  );
}

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  // In a real app, you would use usePathname() from next/navigation to determine if the link is active
  // For simplicity, we'll just use a basic implementation here
  const isActive = false; // Replace with actual logic in a real app
  
  return (
    <Link
      href={href}
      className={`inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium ${
        isActive
          ? 'border-blue-500 text-blue-600'
          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }`}
    >
      {children}
    </Link>
  );
} 