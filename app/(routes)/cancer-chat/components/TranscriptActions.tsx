"use client";

import React, { useState } from 'react';
import { Button } from '@/app/_components/ui/button';
import { FileText, Download, Save } from 'lucide-react';
import { generateTranscript, saveTranscript } from '@/app/_lib/transcript-service';
import { Conversation } from '@/app/_lib/conversations';
import { toast } from 'sonner';

interface TranscriptActionsProps {
  sessionId: string;
  conversation?: Conversation[];
}

export function TranscriptActions({ sessionId, conversation = [] }: TranscriptActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Handle generating and downloading transcript
  const handleDownloadTranscript = async () => {
    if (!conversation || conversation.length === 0) {
      toast.error('No conversation to download');
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Generate transcript from conversation
      const transcript = generateTranscript(conversation, sessionId);
      
      // Create a unique filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `cancer-chat-transcript-${timestamp}.txt`;
      
      // Create a download link
      const element = document.createElement('a');
      const file = new Blob([transcript.content], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = filename;
      
      // Simulate click to download
      document.body.appendChild(element);
      element.click();
      
      // Clean up
      document.body.removeChild(element);
      
      toast.success('Transcript downloaded successfully');
    } catch (error) {
      console.error('Error downloading transcript:', error);
      toast.error('Failed to download transcript');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle saving transcript to server
  const handleSaveTranscript = async () => {
    if (!conversation || conversation.length === 0) {
      toast.error('No conversation to save');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Generate transcript from conversation
      const transcript = generateTranscript(conversation, sessionId);
      
      // Save to server using the new API route
      const response = await fetch('/api/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transcript),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save transcript');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Transcript saved successfully');
      } else {
        throw new Error(result.error || 'Failed to save transcript');
      }
    } catch (error) {
      console.error('Error saving transcript:', error);
      toast.error('Failed to save transcript');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
        onClick={handleDownloadTranscript}
        disabled={isDownloading || conversation.length === 0}
      >
        {isDownloading ? (
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        <span>Download</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex items-center space-x-1"
        onClick={handleSaveTranscript}
        disabled={isSaving || conversation.length === 0}
      >
        {isSaving ? (
          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Save className="h-4 w-4" />
        )}
        <span>Save</span>
      </Button>
    </div>
  );
} 