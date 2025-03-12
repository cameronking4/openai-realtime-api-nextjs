'use client';

import React from 'react';
import { Button } from '@/app/_components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs';
import { Textarea } from '@/app/_components/ui/textarea';
import { Input } from '@/app/_components/ui/input';
import { Label } from '@/app/_components/ui/label';
import { useToast } from '@/app/_hooks/use-toast';

// Define types based on the Prisma schema
interface PromptType {
  id: number;
  name: string;
  description?: string;
}

interface PromptVersion {
  id: number;
  promptTypeId: number;
  versionName: string;
  description?: string;
  content: string;
  author?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPromptsPage() {
  const [promptTypes, setPromptTypes] = React.useState<PromptType[]>([]);
  const [promptVersions, setPromptVersions] = React.useState<PromptVersion[]>([]);
  const [selectedType, setSelectedType] = React.useState<string>('');
  const [newVersionName, setNewVersionName] = React.useState('');
  const [newVersionDescription, setNewVersionDescription] = React.useState('');
  const [newVersionAuthor, setNewVersionAuthor] = React.useState('');
  const [newVersionContent, setNewVersionContent] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const { toast } = useToast();
  
  // New state for edit mode
  const [editMode, setEditMode] = React.useState(false);
  const [editingVersion, setEditingVersion] = React.useState<PromptVersion | null>(null);
  const [editContent, setEditContent] = React.useState('');
  
  // New state for test mode
  const [testMode, setTestMode] = React.useState(false);
  const [testingVersion, setTestingVersion] = React.useState<PromptVersion | null>(null);
  const [testInput, setTestInput] = React.useState('');
  const [testResult, setTestResult] = React.useState('');
  const [isTestLoading, setIsTestLoading] = React.useState(false);

  React.useEffect(() => {
    fetchPromptTypes();
  }, []);

  React.useEffect(() => {
    if (selectedType) {
      // Find the selected type in the prompt types
      const selectedTypeData = promptTypes.find(type => type.id.toString() === selectedType);
      if (selectedTypeData) {
        fetchPromptVersions(selectedType);
      }
    }
  }, [selectedType]);

  const fetchPromptTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/prompts/types');
      const data = await response.json();
      console.log('Fetched prompt types:', data);
      
      // Extract prompt types without versions for the dropdown
      const typesWithoutVersions = data.map((type: any) => ({
        id: type.id,
        name: type.name,
        description: type.description
      }));
      
      setPromptTypes(typesWithoutVersions);
      
      if (data.length > 0) {
        setSelectedType(data[0].id.toString());
        console.log('Set selected type to:', data[0].id.toString());
        
        // If the type has versions, set them directly
        if (data[0].versions && Array.isArray(data[0].versions)) {
          setPromptVersions(data[0].versions);
          console.log('Set prompt versions directly from type data:', data[0].versions.length);
        }
      }
    } catch (error) {
      console.error('Failed to fetch prompt types:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch prompt types',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPromptVersions = async (typeId: string) => {
    setIsLoading(true);
    try {
      console.log('Fetching prompt versions for type ID:', typeId);
      const response = await fetch(`/api/prompts/versions?promptTypeId=${typeId}`);
      const data = await response.json();
      console.log('Fetched prompt versions:', data);
      
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setPromptVersions(data);
        console.log('Set prompt versions to array of length:', data.length);
      } else {
        console.error('Expected array but received:', data);
        setPromptVersions([]); // Set empty array as fallback
        toast({
          title: 'Error',
          description: 'Received invalid data format for prompt versions',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to fetch prompt versions:', error);
      setPromptVersions([]); // Set empty array on error
      toast({
        title: 'Error',
        description: 'Failed to fetch prompt versions',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!newVersionName || !newVersionContent) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/prompts/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptTypeId: parseInt(selectedType),
          versionName: newVersionName,
          description: newVersionDescription,
          author: newVersionAuthor,
          content: newVersionContent,
          isActive: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create prompt version');
      }

      toast({
        title: 'Success',
        description: 'Prompt version created successfully',
      });

      // Reset form
      setNewVersionName('');
      setNewVersionDescription('');
      setNewVersionAuthor('');
      setNewVersionContent('');
      setIsCreating(false);

      // Refresh versions
      fetchPromptVersions(selectedType);
    } catch (error) {
      console.error('Failed to create prompt version:', error);
      toast({
        title: 'Error',
        description: 'Failed to create prompt version',
        variant: 'destructive',
      });
      setIsCreating(false);
    }
  };

  const handleActivateVersion = async (versionId: number) => {
    try {
      const response = await fetch(`/api/prompts/versions/${versionId}/activate`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to activate prompt version');
      }

      toast({
        title: 'Success',
        description: 'Prompt version activated successfully',
      });

      // Refresh versions
      fetchPromptVersions(selectedType);
    } catch (error) {
      console.error('Failed to activate prompt version:', error);
      toast({
        title: 'Error',
        description: 'Failed to activate prompt version',
        variant: 'destructive',
      });
    }
  };
  
  // New function to handle edit button click
  const handleEditClick = (version: PromptVersion) => {
    setEditMode(true);
    setEditingVersion(version);
    setEditContent(version.content);
  };
  
  // New function to save edited content
  const handleSaveEdit = async () => {
    if (!editingVersion) return;
    
    try {
      const response = await fetch(`/api/prompts/versions/${editingVersion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: editContent,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update prompt version');
      }

      toast({
        title: 'Success',
        description: 'Prompt version updated successfully',
      });

      // Exit edit mode
      setEditMode(false);
      setEditingVersion(null);
      setEditContent('');

      // Refresh versions
      fetchPromptVersions(selectedType);
    } catch (error) {
      console.error('Failed to update prompt version:', error);
      toast({
        title: 'Error',
        description: 'Failed to update prompt version',
        variant: 'destructive',
      });
    }
  };
  
  // New function to handle test button click
  const handleTestClick = (version: PromptVersion) => {
    setTestMode(true);
    setTestingVersion(version);
    setTestInput('');
    setTestResult('');
  };
  
  // New function to run test
  const handleRunTest = async () => {
    if (!testingVersion || !testInput) return;
    
    setIsTestLoading(true);
    try {
      // This is a simplified test - in a real implementation, you would
      // call an API endpoint that uses the prompt with the test input
      // For now, we'll just simulate a response
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTestResult(`Test result for "${testingVersion.versionName}" with input: "${testInput}"\n\nThis is a simulated response. In a real implementation, this would be the result of processing the input with the selected prompt.`);
    } catch (error) {
      console.error('Failed to run test:', error);
      toast({
        title: 'Error',
        description: 'Failed to run test',
        variant: 'destructive',
      });
    } finally {
      setIsTestLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Prompt Management</h1>
      
      {/* Edit Mode */}
      {editMode && editingVersion && (
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Edit Prompt: {editingVersion.versionName}</h2>
          <div className="mb-4">
            <Label htmlFor="edit-content">Content</Label>
            <Textarea
              id="edit-content"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="h-64 font-mono"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveEdit}>Save Changes</Button>
            <Button variant="outline" onClick={() => {
              setEditMode(false);
              setEditingVersion(null);
              setEditContent('');
            }}>Cancel</Button>
          </div>
        </div>
      )}
      
      {/* Test Mode */}
      {testMode && testingVersion && (
        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Test Prompt: {testingVersion.versionName}</h2>
          <div className="mb-4">
            <Label htmlFor="test-input">Test Input</Label>
            <Textarea
              id="test-input"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="h-32"
              placeholder="Enter test input here..."
            />
          </div>
          <div className="mb-4">
            <Button onClick={handleRunTest} disabled={isTestLoading}>
              {isTestLoading ? 'Running...' : 'Run Test'}
            </Button>
            <Button variant="outline" className="ml-2" onClick={() => {
              setTestMode(false);
              setTestingVersion(null);
              setTestInput('');
              setTestResult('');
            }}>Cancel</Button>
          </div>
          {testResult && (
            <div className="mt-4">
              <Label htmlFor="test-result">Result</Label>
              <div className="p-4 border rounded-lg bg-gray-50 whitespace-pre-wrap">
                {testResult}
              </div>
            </div>
          )}
        </div>
      )}
      
      {!editMode && !testMode && (
        <>
          <div className="mb-6">
            <Label htmlFor="prompt-type">Prompt Type</Label>
            <select
              id="prompt-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={isLoading}
            >
              {promptTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <Tabs defaultValue="versions">
            <TabsList>
              <TabsTrigger value="versions">Versions</TabsTrigger>
              <TabsTrigger value="create">Create New Version</TabsTrigger>
            </TabsList>

            <TabsContent value="versions">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Prompt Versions</h2>
                {isLoading ? (
                  <p>Loading...</p>
                ) : promptVersions.length === 0 ? (
                  <p>No versions found for this prompt type.</p>
                ) : (
                  <div className="space-y-4">
                    {Array.isArray(promptVersions) ? promptVersions.map((version: PromptVersion) => (
                      <div key={version.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-medium">
                              {version.versionName}
                              {version.isActive && (
                                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                  Active
                                </span>
                              )}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Created: {new Date(version.createdAt).toLocaleString()}
                              {version.updatedAt && version.updatedAt !== version.createdAt && (
                                <> | Updated: {new Date(version.updatedAt).toLocaleString()}</>
                              )}
                            </p>
                            {version.description && (
                              <p className="mt-2">{version.description}</p>
                            )}
                            {version.author && (
                              <p className="text-sm">Author: {version.author}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {!version.isActive && (
                              <Button
                                size="sm"
                                onClick={() => handleActivateVersion(version.id)}
                              >
                                Activate
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(version)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleTestClick(version)}
                            >
                              Test
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4">
                          <details>
                            <summary className="cursor-pointer">View Content</summary>
                            <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto text-sm">
                              {version.content}
                            </pre>
                          </details>
                        </div>
                      </div>
                    )) : <p>Error: Invalid prompt versions data</p>}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="create">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Create New Version</h2>
                <div>
                  <Label htmlFor="version-name">Version Name *</Label>
                  <Input
                    id="version-name"
                    value={newVersionName}
                    onChange={(e) => setNewVersionName(e.target.value)}
                    placeholder="e.g., v1.0, Initial Version"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="version-description">Description</Label>
                  <Input
                    id="version-description"
                    value={newVersionDescription}
                    onChange={(e) => setNewVersionDescription(e.target.value)}
                    placeholder="Brief description of this version"
                  />
                </div>
                <div>
                  <Label htmlFor="version-author">Author</Label>
                  <Input
                    id="version-author"
                    value={newVersionAuthor}
                    onChange={(e) => setNewVersionAuthor(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label htmlFor="version-content">Content *</Label>
                  <Textarea
                    id="version-content"
                    value={newVersionContent}
                    onChange={(e) => setNewVersionContent(e.target.value)}
                    className="h-64 font-mono"
                    placeholder="Enter the prompt content here"
                    required
                  />
                </div>
                <Button onClick={handleCreateVersion} disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Version'}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
} 