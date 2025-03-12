'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface PromptType {
  id: number;
  name: string;
  description: string;
  versions: PromptVersion[];
}

interface PromptVersion {
  id: number;
  promptTypeId: number;
  versionName: string;
  description: string;
  content: string;
  author: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PromptsAdminPage() {
  const [promptTypes, setPromptTypes] = useState<PromptType[]>([]);
  const [selectedType, setSelectedType] = useState<PromptType | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<PromptVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load prompt types on page load
  useEffect(() => {
    async function loadPromptTypes() {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/prompts/types');
        
        if (!response.ok) {
          throw new Error(`Failed to load prompt types: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setPromptTypes(data);
        
        // Select the first prompt type by default
        if (data.length > 0 && !selectedType) {
          setSelectedType(data[0]);
        }
      } catch (error) {
        console.error('Error loading prompt types:', error);
        setError('Failed to load prompt types. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPromptTypes();
  }, []);
  
  // Function to activate a prompt version
  async function activateVersion(versionId: number) {
    try {
      const response = await fetch(`/api/prompts/versions/${versionId}/activate`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to activate version: ${response.status} ${response.statusText}`);
      }
      
      // Refresh the prompt types
      const updatedTypes = await fetch('/api/prompts/types').then(res => res.json());
      setPromptTypes(updatedTypes);
      
      // Update the selected type
      if (selectedType) {
        const updatedType = updatedTypes.find((type: PromptType) => type.id === selectedType.id);
        if (updatedType) {
          setSelectedType(updatedType);
        }
      }
      
      alert('Prompt version activated successfully!');
    } catch (error) {
      console.error('Error activating version:', error);
      alert('Failed to activate prompt version. Please try again.');
    }
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Prompt Management</h1>
      
      {isLoading ? (
        <div className="text-center py-8">Loading prompt data...</div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Prompt Types List */}
          <div className="md:col-span-3 bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-4">Prompt Types</h2>
            <ul className="space-y-2">
              {promptTypes.map((type) => (
                <li 
                  key={type.id}
                  className={`p-2 rounded cursor-pointer ${selectedType?.id === type.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                  onClick={() => setSelectedType(type)}
                >
                  <div className="font-medium">{type.name}</div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Prompt Versions List */}
          {selectedType && (
            <div className="md:col-span-3 bg-white p-4 rounded shadow">
              <h2 className="text-xl font-semibold mb-4">Versions</h2>
              <ul className="space-y-2">
                {selectedType.versions.map((version) => (
                  <li 
                    key={version.id}
                    className={`p-2 rounded cursor-pointer ${selectedVersion?.id === version.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                    onClick={() => setSelectedVersion(version)}
                  >
                    <div className="font-medium flex items-center justify-between">
                      {version.versionName}
                      {version.isActive && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">{version.description}</div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(version.createdAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="mt-4">
                <Link 
                  href={`/admin/prompts/create?typeId=${selectedType.id}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                >
                  Create New Version
                </Link>
              </div>
            </div>
          )}
          
          {/* Prompt Version Details */}
          {selectedVersion && (
            <div className="md:col-span-6 bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Version Details</h2>
                
                {!selectedVersion.isActive && (
                  <button
                    onClick={() => activateVersion(selectedVersion.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
                  >
                    Activate This Version
                  </button>
                )}
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium">Name</h3>
                <p>{selectedVersion.versionName}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium">Description</h3>
                <p>{selectedVersion.description || 'No description'}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium">Author</h3>
                <p>{selectedVersion.author || 'Unknown'}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium">Content</h3>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-sm">
                  {selectedVersion.content}
                </pre>
              </div>
              
              <div className="flex space-x-4">
                <Link 
                  href={`/admin/prompts/edit/${selectedVersion.id}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
                >
                  Edit
                </Link>
                
                <Link 
                  href={`/admin/prompts/test/${selectedVersion.id}`}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded text-sm"
                >
                  Test
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 