'use client';

import React from 'react';
import { ThemeProvider } from '@/app/_components/shared/theme-provider';
import { ModalityProvider } from '@/app/_contexts/modality-context';
import { VoiceProvider } from '@/app/_contexts/voice-context';
import { TokenProvider } from '@/app/_contexts/token-context';
import { Toaster } from '@/app/_components/ui/toaster';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <TokenProvider>
        <VoiceProvider>
          <ModalityProvider>
            {children}
            <Toaster />
          </ModalityProvider>
        </VoiceProvider>
      </TokenProvider>
    </ThemeProvider>
  );
} 