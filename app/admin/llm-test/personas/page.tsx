'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Persona } from '@/lib/persona-service';

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editedPersona, setEditedPersona] = useState<Partial<Persona> | null>(null);
  const [generationOptions, setGenerationOptions] = useState({
    count: 1,
    cancerType: '',
    psychologicalFocus: '',
    communicationStyle: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // Fetch personas from the API on component mount
  useEffect(() => {
    fetchPersonas();
  }, []);

  // Reset edit mode when selected persona changes
  useEffect(() => {
    if (selectedPersona) {
      setEditedPersona(null);
      setIsEditMode(false);
    }
  }, [selectedPersona]);

  // Fetch personas from the API
  const fetchPersonas = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/personas');
      
      if (!response.ok) {
        throw new Error(`Error fetching personas: ${response.status}`);
      }
      
      const data = await response.json();
      setPersonas(data);
    } catch (err) {
      console.error('Failed to fetch personas:', err);
      setError('Failed to load personas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate personas via the API
  const generatePersonas = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/personas/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generationOptions),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate personas: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.personas || data.personas.length === 0) {
        throw new Error('No personas were returned from the API. Please try again.');
      }
      
      // Save the generated personas to the database
      const savePromises = data.personas.map(async (persona: any) => {
        const saveResponse = await fetch('/api/personas', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(persona),
        });
        
        if (!saveResponse.ok) {
          console.error('Failed to save persona:', await saveResponse.text());
          return null;
        }
        
        return saveResponse.json();
      });
      
      const savedPersonas = await Promise.all(savePromises);
      const validPersonas = savedPersonas.filter(Boolean);
      
      if (validPersonas.length === 0) {
        throw new Error('Failed to save any personas. Please try again.');
      }
      
      // Refresh the personas list
      await fetchPersonas();
      
      // Select the first persona
      if (validPersonas.length > 0) {
        setSelectedPersona(validPersonas[0]);
        setEditedPersona(validPersonas[0]);
      }
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Error generating personas:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred while generating personas');
      setIsGenerating(false);
    }
  };

  const handlePersonaClick = (persona: Persona) => {
    setSelectedPersona(persona);
    setActiveTab('overview');
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setGenerationOptions(prev => ({
      ...prev,
      [name]: name === 'count' ? parseInt(value) : value
    }));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      // Exit edit mode without saving
      setIsEditMode(false);
      setEditedPersona(null);
    } else {
      // Enter edit mode
      setIsEditMode(true);
      setEditedPersona(selectedPersona ? { ...selectedPersona } : null);
    }
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (!editedPersona) return;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedPersona(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof Persona],
            [child]: value
          }
        };
      });
    } else {
      // Handle top-level properties
      setEditedPersona(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          [name]: value
        };
      });
    }
  };

  const createNewPersona = () => {
    // Create a new empty persona template
    const newPersonaTemplate: Partial<Persona> = {
      name: '',
      age: 45,
      gender: 'Female',
      cancerType: 'Breast cancer',
      cancerStage: 'Stage II',
      treatmentStatus: 'In treatment',
      description: '',
      psychologicalProfile: {
        anxiety: 5,
        depression: 5,
        distress: 5,
        selfEfficacy: 5,
        supportNetworkStrength: 5
      },
      communicationStyle: {
        articulationLevel: 5,
        openness: 5,
        directness: 5,
        emotionalExpression: 5
      },
      physicalSymptoms: [],
      tags: []
    };
    
    // Set the edited persona to the template
    setEditedPersona(newPersonaTemplate);
    
    // Enter edit mode
    setIsEditMode(true);
    
    // Set creating flag
    setIsCreating(true);
    
    // Clear selected persona
    setSelectedPersona(null);
  };

  const savePersona = async () => {
    if (!editedPersona) return;
    
    try {
      setIsSaving(true);
      setError(null);
      
      // Different endpoint and method for creating vs updating
      const url = isCreating ? '/api/personas' : `/api/personas/${selectedPersona?.id}`;
      const method = isCreating ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedPersona),
      });
      
      if (!response.ok) {
        throw new Error(`Error saving persona: ${response.status}`);
      }
      
      const savedPersona = await response.json();
      
      if (isCreating) {
        // Add the new persona to the list
        setPersonas(prevPersonas => [savedPersona, ...prevPersonas]);
        
        // Select the new persona
        setSelectedPersona(savedPersona);
        
        // Reset creating flag
        setIsCreating(false);
      } else {
        // Update the personas list
        setPersonas(prevPersonas => 
          prevPersonas.map(p => p.id === savedPersona.id ? savedPersona : p)
        );
        
        // Update the selected persona
        setSelectedPersona(savedPersona);
      }
      
      // Exit edit mode
      setIsEditMode(false);
      setEditedPersona(null);
    } catch (err) {
      console.error('Failed to save persona:', err);
      setError('Failed to save persona. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const deletePersona = async () => {
    if (!selectedPersona) return;
    
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await fetch(`/api/personas/${selectedPersona.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error deleting persona: ${response.status}`);
      }
      
      // Remove the persona from the list
      setPersonas(prevPersonas => 
        prevPersonas.filter(p => p.id !== selectedPersona.id)
      );
      
      // Clear the selected persona
      setSelectedPersona(null);
      
      // Close the modal
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Failed to delete persona:', err);
      setError('Failed to delete persona. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const generateDescription = async () => {
    if (!editedPersona) return;
    
    try {
      setIsGeneratingDescription(true);
      setError(null);
      
      // Ensure there's a diagnosis date within the last 6 months if not already set
      if (!editedPersona.diagnosisDate) {
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        const randomTimestamp = sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime());
        editedPersona.diagnosisDate = new Date(randomTimestamp);
      }
      
      const response = await fetch('/api/personas/generate-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedPersona),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error generating description: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update the edited persona with the generated description
      setEditedPersona(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          description: data.description
        };
      });
    } catch (err) {
      console.error('Failed to generate description:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate description. Please try again.');
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Helper function to render the tab content
  const renderTabContent = () => {
    if (!selectedPersona && !isCreating) return null;

    switch (activeTab) {
      case 'overview':
        return isEditMode && editedPersona ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={editedPersona.name || ''}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  min="18"
                  max="100"
                  value={editedPersona.age || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={editedPersona.gender || ''}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="cancerType" className="block text-sm font-medium text-gray-700 mb-1">
                Cancer Type
              </label>
              <select
                id="cancerType"
                name="cancerType"
                value={editedPersona.cancerType || ''}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Breast cancer">Breast Cancer</option>
                <option value="Lung cancer">Lung Cancer</option>
                <option value="Colorectal cancer">Colorectal Cancer</option>
                <option value="Prostate cancer">Prostate Cancer</option>
                <option value="Melanoma">Melanoma</option>
                <option value="Ovarian cancer">Ovarian Cancer</option>
                <option value="Pancreatic cancer">Pancreatic Cancer</option>
                <option value="Leukemia">Leukemia</option>
                <option value="Lymphoma">Lymphoma</option>
                <option value="Bladder cancer">Bladder Cancer</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="cancerStage" className="block text-sm font-medium text-gray-700 mb-1">
                Cancer Stage
              </label>
              <select
                id="cancerStage"
                name="cancerStage"
                value={editedPersona.cancerStage || ''}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Stage I">Stage I</option>
                <option value="Stage II">Stage II</option>
                <option value="Stage III">Stage III</option>
                <option value="Stage IV">Stage IV</option>
                <option value="In remission">In remission</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="diagnosisDate" className="block text-sm font-medium text-gray-700 mb-1">
                Diagnosis Date
              </label>
              <input
                type="date"
                id="diagnosisDate"
                name="diagnosisDate"
                value={editedPersona.diagnosisDate ? new Date(editedPersona.diagnosisDate).toISOString().split('T')[0] : ''}
                onChange={handleEditChange}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Date of initial diagnosis (within the last 6 months)</p>
            </div>
            
            <div>
              <label htmlFor="treatmentStatus" className="block text-sm font-medium text-gray-700 mb-1">
                Treatment Status
              </label>
              <select
                id="treatmentStatus"
                name="treatmentStatus"
                value={editedPersona.treatmentStatus || ''}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Not started">Not started</option>
                <option value="In treatment">In treatment</option>
                <option value="Completed treatment">Completed treatment</option>
                <option value="Palliative care">Palliative care</option>
              </select>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <button
                  type="button"
                  onClick={generateDescription}
                  disabled={isGeneratingDescription}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {isGeneratingDescription ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={editedPersona.description || ''}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={isGeneratingDescription ? 'Generating description...' : 'Enter a description or generate one with AI'}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">{selectedPersona?.name || editedPersona?.name}</h3>
              <p className="text-gray-500">{selectedPersona?.age || editedPersona?.age} years old, {selectedPersona?.gender || editedPersona?.gender}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Diagnosis</h4>
              <p>{selectedPersona?.cancerType || editedPersona?.cancerType}, {selectedPersona?.cancerStage || editedPersona?.cancerStage}</p>
              <p className="text-sm text-gray-500">
                Diagnosed: {selectedPersona?.diagnosisDate || editedPersona?.diagnosisDate
                  ? new Date(selectedPersona?.diagnosisDate || editedPersona?.diagnosisDate as Date).toLocaleDateString()
                  : 'Unknown'}
              </p>
              <p className="text-sm text-gray-500">Status: {selectedPersona?.treatmentStatus || editedPersona?.treatmentStatus}</p>
            </div>
            
            {(selectedPersona?.description || editedPersona?.description) && (
              <div>
                <h4 className="font-medium text-gray-700">Description</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{selectedPersona?.description || editedPersona?.description}</p>
              </div>
            )}
          </div>
        );
      
      case 'psychological':
        return isEditMode && editedPersona ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Psychological Profile</h4>
              <div className="grid grid-cols-1 gap-4 mt-2">
                <div>
                  <label htmlFor="anxiety" className="block text-sm font-medium text-gray-700 mb-1">
                    Anxiety (1-10)
                  </label>
                  <input
                    type="range"
                    id="anxiety"
                    name="psychologicalProfile.anxiety"
                    min="1"
                    max="10"
                    value={editedPersona.psychologicalProfile?.anxiety || 5}
                    onChange={handleEditChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="depression" className="block text-sm font-medium text-gray-700 mb-1">
                    Depression (1-10)
                  </label>
                  <input
                    type="range"
                    id="depression"
                    name="psychologicalProfile.depression"
                    min="1"
                    max="10"
                    value={editedPersona.psychologicalProfile?.depression || 5}
                    onChange={handleEditChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="distress" className="block text-sm font-medium text-gray-700 mb-1">
                    Distress (1-10)
                  </label>
                  <input
                    type="range"
                    id="distress"
                    name="psychologicalProfile.distress"
                    min="1"
                    max="10"
                    value={editedPersona.psychologicalProfile?.distress || 5}
                    onChange={handleEditChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="selfEfficacy" className="block text-sm font-medium text-gray-700 mb-1">
                    Self-Efficacy (1-10)
                  </label>
                  <input
                    type="range"
                    id="selfEfficacy"
                    name="psychologicalProfile.selfEfficacy"
                    min="1"
                    max="10"
                    value={editedPersona.psychologicalProfile?.selfEfficacy || 5}
                    onChange={handleEditChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="supportNetworkStrength" className="block text-sm font-medium text-gray-700 mb-1">
                    Support Network Strength (1-10)
                  </label>
                  <input
                    type="range"
                    id="supportNetworkStrength"
                    name="psychologicalProfile.supportNetworkStrength"
                    min="1"
                    max="10"
                    value={editedPersona.psychologicalProfile?.supportNetworkStrength || 5}
                    onChange={handleEditChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Psychological Profile</h4>
              <div className="grid grid-cols-1 gap-3 mt-2">
                <div>
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Anxiety</div>
                    <div className="text-sm text-gray-500">{selectedPersona?.psychologicalProfile?.anxiety || 0}/10</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(selectedPersona?.psychologicalProfile?.anxiety || 0) * 10}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Depression</div>
                    <div className="text-sm text-gray-500">{selectedPersona?.psychologicalProfile?.depression || 0}/10</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(selectedPersona?.psychologicalProfile?.depression || 0) * 10}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Distress</div>
                    <div className="text-sm text-gray-500">{selectedPersona?.psychologicalProfile?.distress || 0}/10</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(selectedPersona?.psychologicalProfile?.distress || 0) * 10}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Self-Efficacy</div>
                    <div className="text-sm text-gray-500">{selectedPersona?.psychologicalProfile?.selfEfficacy || 0}/10</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(selectedPersona?.psychologicalProfile?.selfEfficacy || 0) * 10}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Support Network</div>
                    <div className="text-sm text-gray-500">{selectedPersona?.psychologicalProfile?.supportNetworkStrength || 0}/10</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(selectedPersona?.psychologicalProfile?.supportNetworkStrength || 0) * 10}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'communication':
        return isEditMode && editedPersona ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Communication Style</h4>
              <div className="grid grid-cols-1 gap-4 mt-2">
                <div>
                  <label htmlFor="articulationLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Articulation Level (1-10)
                  </label>
                  <input
                    type="range"
                    id="articulationLevel"
                    name="communicationStyle.articulationLevel"
                    min="1"
                    max="10"
                    value={editedPersona.communicationStyle?.articulationLevel || 5}
                    onChange={handleEditChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Basic</span>
                    <span>Advanced</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="openness" className="block text-sm font-medium text-gray-700 mb-1">
                    Openness (1-10)
                  </label>
                  <input
                    type="range"
                    id="openness"
                    name="communicationStyle.openness"
                    min="1"
                    max="10"
                    value={editedPersona.communicationStyle?.openness || 5}
                    onChange={handleEditChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Reserved</span>
                    <span>Open</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="directness" className="block text-sm font-medium text-gray-700 mb-1">
                    Directness (1-10)
                  </label>
                  <input
                    type="range"
                    id="directness"
                    name="communicationStyle.directness"
                    min="1"
                    max="10"
                    value={editedPersona.communicationStyle?.directness || 5}
                    onChange={handleEditChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Indirect</span>
                    <span>Direct</span>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="emotionalExpression" className="block text-sm font-medium text-gray-700 mb-1">
                    Emotional Expression (1-10)
                  </label>
                  <input
                    type="range"
                    id="emotionalExpression"
                    name="communicationStyle.emotionalExpression"
                    min="1"
                    max="10"
                    value={editedPersona.communicationStyle?.emotionalExpression || 5}
                    onChange={handleEditChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Stoic</span>
                    <span>Expressive</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Communication Style</h4>
              <div className="grid grid-cols-1 gap-3 mt-2">
                <div>
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Articulation</div>
                    <div className="text-sm text-gray-500">{selectedPersona?.communicationStyle?.articulationLevel || 0}/10</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(selectedPersona?.communicationStyle?.articulationLevel || 0) * 10}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Openness</div>
                    <div className="text-sm text-gray-500">{selectedPersona?.communicationStyle?.openness || 0}/10</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(selectedPersona?.communicationStyle?.openness || 0) * 10}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Directness</div>
                    <div className="text-sm text-gray-500">{selectedPersona?.communicationStyle?.directness || 0}/10</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(selectedPersona?.communicationStyle?.directness || 0) * 10}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">Emotional Expression</div>
                    <div className="text-sm text-gray-500">{selectedPersona?.communicationStyle?.emotionalExpression || 0}/10</div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(selectedPersona?.communicationStyle?.emotionalExpression || 0) * 10}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'physical':
        return isEditMode && editedPersona ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Physical Symptoms</h4>
              <p className="text-sm text-gray-500 mb-2">Add or edit physical symptoms related to the patient's condition and treatment</p>
              
              {editedPersona.physicalSymptoms && Array.isArray(editedPersona.physicalSymptoms) ? (
                <div className="space-y-3">
                  {editedPersona.physicalSymptoms.map((symptom: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label htmlFor={`symptom-name-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                            Symptom Name
                          </label>
                          <input
                            type="text"
                            id={`symptom-name-${index}`}
                            value={symptom.name || ''}
                            onChange={(e) => {
                              const updatedSymptoms = [...editedPersona.physicalSymptoms];
                              updatedSymptoms[index] = { ...symptom, name: e.target.value };
                              setEditedPersona(prev => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  physicalSymptoms: updatedSymptoms
                                };
                              });
                            }}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label htmlFor={`symptom-severity-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                            Severity (1-10)
                          </label>
                          <input
                            type="range"
                            id={`symptom-severity-${index}`}
                            min="1"
                            max="10"
                            value={symptom.severity || 5}
                            onChange={(e) => {
                              const updatedSymptoms = [...editedPersona.physicalSymptoms];
                              updatedSymptoms[index] = { ...symptom, severity: parseInt(e.target.value) };
                              setEditedPersona(prev => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  physicalSymptoms: updatedSymptoms
                                };
                              });
                            }}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Mild</span>
                            <span>{symptom.severity || 5}/10</span>
                            <span>Severe</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <label htmlFor={`symptom-related-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                          Related To
                        </label>
                        <select
                          id={`symptom-related-${index}`}
                          value={symptom.relatedTo || 'both'}
                          onChange={(e) => {
                            const updatedSymptoms = [...editedPersona.physicalSymptoms];
                            updatedSymptoms[index] = { ...symptom, relatedTo: e.target.value };
                            setEditedPersona(prev => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                physicalSymptoms: updatedSymptoms
                              };
                            });
                          }}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        >
                          <option value="cancer">Cancer</option>
                          <option value="treatment">Treatment</option>
                          <option value="both">Both</option>
                        </select>
                      </div>
                      
                      <div className="mb-2">
                        <label htmlFor={`symptom-description-${index}`} className="block text-xs font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          id={`symptom-description-${index}`}
                          value={symptom.description || ''}
                          onChange={(e) => {
                            const updatedSymptoms = [...editedPersona.physicalSymptoms];
                            updatedSymptoms[index] = { ...symptom, description: e.target.value };
                            setEditedPersona(prev => {
                              if (!prev) return prev;
                              return {
                                ...prev,
                                physicalSymptoms: updatedSymptoms
                              };
                            });
                          }}
                          rows={2}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const updatedSymptoms = [...editedPersona.physicalSymptoms];
                          updatedSymptoms.splice(index, 1);
                          setEditedPersona(prev => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              physicalSymptoms: updatedSymptoms
                            };
                          });
                        }}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Remove Symptom
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No symptoms added yet.</p>
              )}
              
              <button
                type="button"
                onClick={() => {
                  const newSymptom = {
                    name: '',
                    severity: 5,
                    relatedTo: 'both',
                    description: ''
                  };
                  
                  setEditedPersona(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      physicalSymptoms: prev.physicalSymptoms ? [...prev.physicalSymptoms, newSymptom] : [newSymptom]
                    };
                  });
                }}
                className="mt-3 inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Symptom
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Physical Symptoms</h4>
              {selectedPersona?.physicalSymptoms && Array.isArray(selectedPersona.physicalSymptoms) && selectedPersona.physicalSymptoms.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {selectedPersona.physicalSymptoms.map((symptom: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-800">{symptom.name}</h5>
                          <p className="text-sm text-gray-600">{symptom.description}</p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            symptom.relatedTo === 'cancer' ? 'bg-red-100 text-red-800' : 
                            symptom.relatedTo === 'treatment' ? 'bg-blue-100 text-blue-800' : 
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {symptom.relatedTo === 'cancer' ? 'Cancer' : 
                             symptom.relatedTo === 'treatment' ? 'Treatment' : 
                             'Cancer & Treatment'}
                          </span>
                          <div className="mt-1 flex items-center">
                            <span className="text-xs text-gray-500 mr-2">Severity:</span>
                            <div className="w-24 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  symptom.severity <= 3 ? 'bg-green-500' : 
                                  symptom.severity <= 6 ? 'bg-yellow-500' : 
                                  'bg-red-500'
                                }`} 
                                style={{ width: `${(symptom.severity || 1) * 10}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 ml-1">{symptom.severity}/10</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mt-2">No physical symptoms recorded.</p>
              )}
            </div>
          </div>
        );
      
      case 'background':
        return isEditMode && editedPersona ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Family Status</h4>
              <input
                type="text"
                id="familyStatus"
                name="background.familyStatus"
                value={editedPersona.background?.familyStatus || ''}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Married with two children"
              />
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Occupation</h4>
              <input
                type="text"
                id="occupation"
                name="background.occupation"
                value={editedPersona.background?.occupation || ''}
                onChange={handleEditChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Elementary school teacher"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedPersona?.background ? (
              <>
                <div>
                  <h4 className="font-medium text-gray-700">Family Status</h4>
                  <p className="text-sm text-gray-600">{selectedPersona?.background?.familyStatus}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700">Occupation</h4>
                  <p className="text-sm text-gray-600">{selectedPersona?.background?.occupation}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700">Important Life Events</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {selectedPersona?.background?.importantLifeEvents?.map((event: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600">{event}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700">Support System</h4>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {selectedPersona?.background?.supportSystem?.map((support: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600">{support}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-gray-500">No background information available.</p>
            )}
          </div>
        );
      
      case 'patterns':
        return isEditMode && editedPersona ? (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Behavioral Patterns</h4>
              <textarea
                id="behavioralPatterns"
                name="behavioralPatterns"
                rows={4}
                value={Array.isArray(editedPersona.behavioralPatterns) ? editedPersona.behavioralPatterns.join('\n') : ''}
                onChange={(e) => {
                  const patterns = e.target.value.split('\n').filter(line => line.trim() !== '');
                  setEditedPersona(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      behavioralPatterns: patterns
                    };
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter one behavioral pattern per line"
              />
              <p className="text-xs text-gray-500 mt-1">Enter one pattern per line</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Personal Concerns</h4>
              <textarea
                id="personalConcerns"
                name="personalConcerns"
                rows={4}
                value={Array.isArray(editedPersona.personalConcerns) ? editedPersona.personalConcerns.join('\n') : ''}
                onChange={(e) => {
                  const concerns = e.target.value.split('\n').filter(line => line.trim() !== '');
                  setEditedPersona(prev => {
                    if (!prev) return prev;
                    return {
                      ...prev,
                      personalConcerns: concerns
                    };
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter one personal concern per line"
              />
              <p className="text-xs text-gray-500 mt-1">Enter one concern per line</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-700">Behavioral Patterns</h4>
              {selectedPersona?.behavioralPatterns && selectedPersona.behavioralPatterns.length > 0 ? (
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {selectedPersona.behavioralPatterns.map((pattern: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600">{pattern}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2">No behavioral patterns available.</p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700">Personal Concerns</h4>
              {selectedPersona?.personalConcerns && selectedPersona.personalConcerns.length > 0 ? (
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {selectedPersona.personalConcerns.map((concern: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600">{concern}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 mt-2">No personal concerns available.</p>
              )}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Generation Options */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Generate Patient Personas</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="count" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Personas
              </label>
              <input
                type="number"
                id="count"
                name="count"
                min="1"
                max="10"
                value={generationOptions.count}
                onChange={handleOptionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="cancerType" className="block text-sm font-medium text-gray-700 mb-1">
                Cancer Type (Optional)
              </label>
              <select
                id="cancerType"
                name="cancerType"
                value={generationOptions.cancerType}
                onChange={handleOptionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Type</option>
                <option value="Breast cancer">Breast Cancer</option>
                <option value="Lung cancer">Lung Cancer</option>
                <option value="Colorectal cancer">Colorectal Cancer</option>
                <option value="Prostate cancer">Prostate Cancer</option>
                <option value="Melanoma">Melanoma</option>
                <option value="Ovarian cancer">Ovarian Cancer</option>
                <option value="Pancreatic cancer">Pancreatic Cancer</option>
                <option value="Leukemia">Leukemia</option>
                <option value="Lymphoma">Lymphoma</option>
                <option value="Bladder cancer">Bladder Cancer</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="psychologicalFocus" className="block text-sm font-medium text-gray-700 mb-1">
                Psychological Focus (Optional)
              </label>
              <select
                id="psychologicalFocus"
                name="psychologicalFocus"
                value={generationOptions.psychologicalFocus}
                onChange={handleOptionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Focus</option>
                <option value="high anxiety">High Anxiety</option>
                <option value="moderate depression">Moderate Depression</option>
                <option value="low self-efficacy">Low Self-Efficacy</option>
                <option value="strong support network">Strong Support Network</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="communicationStyle" className="block text-sm font-medium text-gray-700 mb-1">
                Communication Style (Optional)
              </label>
              <select
                id="communicationStyle"
                name="communicationStyle"
                value={generationOptions.communicationStyle}
                onChange={handleOptionChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any Style</option>
                <option value="reserved">Reserved</option>
                <option value="open">Open</option>
                <option value="analytical">Analytical</option>
                <option value="emotional">Emotional</option>
                <option value="avoidant">Avoidant</option>
              </select>
            </div>
            
            <button
              onClick={generatePersonas}
              disabled={isGenerating}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isGenerating ? 'bg-blue-300' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : 'Generate Personas'}
            </button>
            
            {isGenerating && (
              <div className="mt-2 text-center text-sm text-gray-500">
                <p>This may take up to 30 seconds as we're using OpenAI to generate realistic personas.</p>
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>
            
            <button
              onClick={createNewPersona}
              className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Persona Manually
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                      {error.includes('OpenAI') && (
                        <ul className="list-disc pl-5 mt-1 space-y-1">
                          <li>Check that your OpenAI API key is correctly set in the .env.local file</li>
                          <li>Verify that your OpenAI account has sufficient credits</li>
                          <li>Ensure you have a stable internet connection</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Middle Column - Persona List */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Patient Personas</h2>
            <button 
              onClick={fetchPersonas}
              disabled={isLoading}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : personas.length === 0 && !isCreating ? (
            <div className="text-center py-8 text-gray-500">
              <p>No personas available.</p>
              <p className="text-sm mt-2">Use the form to generate patient personas or create one manually.</p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-[600px] overflow-y-auto">
              {isCreating && (
                <li 
                  className="p-3 rounded-md cursor-default bg-green-50 border border-green-200"
                >
                  <div className="font-medium">New Persona</div>
                  <div className="text-sm text-gray-500">
                    Creating new persona...
                  </div>
                </li>
              )}
              {personas.map(persona => (
                <li 
                  key={persona.id}
                  onClick={() => handlePersonaClick(persona)}
                  className={`p-3 rounded-md cursor-pointer ${
                    selectedPersona?.id === persona.id 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="font-medium">{persona.name}</div>
                  <div className="text-sm text-gray-500">
                    {persona.age} y/o {persona.gender}, {persona.cancerType}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {persona.tags && persona.tags.slice(0, 3).map((tag: string, index: number) => (
                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                    {persona.tags && persona.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        +{persona.tags.length - 3} more
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Right Column - Persona Details */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">
            {isCreating ? 'Create New Persona' : 'Persona Details'}
          </h2>
          
          {(selectedPersona || isCreating) ? (
            <div>
              {/* Tabs */}
              <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-4">
                  <button
                    onClick={() => handleTabChange('overview')}
                    className={`pb-2 px-1 ${
                      activeTab === 'overview'
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => handleTabChange('psychological')}
                    className={`pb-2 px-1 ${
                      activeTab === 'psychological'
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Psychological
                  </button>
                  <button
                    onClick={() => handleTabChange('communication')}
                    className={`pb-2 px-1 ${
                      activeTab === 'communication'
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Communication
                  </button>
                  <button
                    onClick={() => handleTabChange('physical')}
                    className={`pb-2 px-1 ${
                      activeTab === 'physical'
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Physical
                  </button>
                  <button
                    onClick={() => handleTabChange('background')}
                    className={`pb-2 px-1 ${
                      activeTab === 'background'
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Background
                  </button>
                  <button
                    onClick={() => handleTabChange('patterns')}
                    className={`pb-2 px-1 ${
                      activeTab === 'patterns'
                        ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                        : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Patterns
                  </button>
                </nav>
              </div>
              
              {/* Tab Content */}
              <div className="mt-4">
                {renderTabContent()}
              </div>
              
              {/* Actions */}
              <div className="pt-6 flex space-x-2">
                {isEditMode ? (
                  <>
                    <button
                      onClick={savePersona}
                      disabled={isSaving}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        isSaving ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                    >
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={toggleEditMode}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {selectedPersona && (
                      <Link 
                        href={`/admin/llm-test/simulator?personaId=${selectedPersona.id}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Use in Simulator
                      </Link>
                    )}
                    <button
                      onClick={toggleEditMode}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit Persona
                    </button>
                    <button
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Export JSON
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No persona selected.</p>
              <p className="text-sm mt-2">Select a persona from the list to view details or create a new one.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPersona && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">Delete Persona</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to delete {selectedPersona.name}? This action cannot be undone.
                </p>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={deletePersona}
                  disabled={isDeleting}
                  className={`px-4 py-2 mr-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-base font-medium rounded-md shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}