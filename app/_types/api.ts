/**
 * API Types
 * 
 * This file contains types related to API requests and responses.
 */

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Transcript API types
export interface TranscriptRequest {
  sessionId: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface TranscriptResponse {
  id: string;
  sessionId: string;
  createdAt: string;
  content: string;
  metadata?: Record<string, any>;
}

// Assessment API types
export interface AssessmentRequest {
  sessionId: string;
  conversation: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

export interface AssessmentResponse {
  id: string;
  sessionId: string;
  createdAt: string;
  content: string;
  summary: string;
  categories: Array<{
    name: string;
    score: number;
    description: string;
  }>;
} 