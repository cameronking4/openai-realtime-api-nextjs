'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PromptType {
  id: number;
  name: string;
  description: string;
}

export default function CreatePromptVersionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeId = searchParams.get('typeId');
  
  const [promptType, setPromptType] = useState<PromptType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [versionName, setVersionName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [isActive, setIsActive] = useState(false);
  
  // Load prompt type on page load
  useEffect(() => {
    async function loadPromptType() {
      if (!typeId) {
        setError('No prompt type ID provided');
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch('/api/prompts/types');
        
        if (!response.ok) {
          throw new Error(`Failed to load prompt types: ${response.status} ${response.statusText}`);
        }
        
        const types = await response.json();
        const type = types.find((t: PromptType) => t.id === parseInt(typeId));
        
        if (!type) {
          throw new Error(`Prompt type with ID ${typeId} not found`);
        }
        
        setPromptType(type);
      } catch (error) {
        console.error('Error loading prompt type:', error);
        setError('Failed to load prompt type. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPromptType();
  }, [typeId]);
  
  // Handle form submission
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!promptType) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/prompts/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promptTypeId: promptType.id,
          versionName,
          description,
          content,
          author,
          isActive
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create prompt version: ${response.status} ${response.statusText}`);
      }
      
      // Redirect to prompt management page
      router.push('/admin/prompts');
    } catch (error: any) {
      console.error('Error creating prompt version:', error);
      setError(error.message || 'Failed to create prompt version. Please try again.');
      setIsSaving(false);
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Prompt Version</h1>
        <Link 
          href="/admin/prompts"
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Back to Prompts
        </Link>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : promptType ? (
        <div className="bg-white p-6 rounded shadow">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Prompt Type: {promptType.name}</h2>
            <p className="text-gray-600">{promptType.description}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="versionName" className="block font-medium mb-1">Version Name *</label>
              <input
                type="text"
                id="versionName"
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block font-medium mb-1">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border rounded"
                rows={3}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="author" className="block font-medium mb-1">Author</label>
              <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="content" className="block font-medium mb-1">Content *</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border rounded font-mono"
                rows={15}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="mr-2"
                />
                <span>Make this version active</span>
              </label>
              <p className="text-sm text-gray-600 mt-1">
                If checked, this version will be used in the application and all other versions will be deactivated.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Create Version'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center py-8">Prompt type not found</div>
      )}
    </div>
  );
} 