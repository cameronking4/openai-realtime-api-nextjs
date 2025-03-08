"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type Modality = "text" | "text+audio";

interface ModalityContextType {
  modality: Modality;
  setModality: (modality: Modality) => void;
  isAudioEnabled: boolean;
}

const ModalityContext = createContext<ModalityContextType | undefined>(undefined);

export function ModalityProvider({ children }: { children: ReactNode }) {
  const [modality, setModality] = useState<Modality>("text");

  const isAudioEnabled = modality === "text+audio";

  return (
    <ModalityContext.Provider value={{ modality, setModality, isAudioEnabled }}>
      {children}
    </ModalityContext.Provider>
  );
}

export function useModalityContext() {
  const context = useContext(ModalityContext);
  if (context === undefined) {
    throw new Error("useModalityContext must be used within a ModalityProvider");
  }
  return context;
} 