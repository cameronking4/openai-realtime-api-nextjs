"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface VoiceContextType {
  voice: string;
  setVoice: (voice: string) => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceProvider({ children }: { children: ReactNode }) {
  const [voice, setVoice] = useState("ash");

  return (
    <VoiceContext.Provider value={{ voice, setVoice }}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoiceContext() {
  const context = useContext(VoiceContext);
  if (context === undefined) {
    throw new Error("useVoiceContext must be used within a VoiceProvider");
  }
  return context;
} 