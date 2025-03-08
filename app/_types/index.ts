/**
 * Shared Types
 * 
 * This file exports all shared types for easy imports.
 * Types are organized by their domain.
 */

// Re-export types from other files
export * from '@/app/_types/api';
export * from '@/app/_types/ui';

// Session types
export type SessionState = 'pre' | 'active' | 'post';

// Modality types
export type Modality = 'text' | 'text+audio';

// Message types
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

// User types
export interface User {
  id: string;
  name?: string;
  email?: string;
  preferences?: {
    modality?: Modality;
    voice?: string;
    theme?: 'light' | 'dark' | 'system';
  };
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'; 