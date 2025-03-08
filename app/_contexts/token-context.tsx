"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Message } from "@/app/_types";

interface TokenUsageData {
  total_tokens: number;
  input_tokens: number;
  output_tokens: number;
}

interface TokenContextType {
  tokenUsage: TokenUsageData | null;
  messages: Message[];
  updateMessages: (messages: Message[]) => void;
  resetTokenUsage: () => void;
}

const initialTokenUsage: TokenUsageData = {
  total_tokens: 0,
  input_tokens: 0,
  output_tokens: 0
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [tokenUsage, setTokenUsage] = useState<TokenUsageData | null>(null);

  // Update token usage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const responseDoneMessages = messages.filter(msg => msg.type === 'response.done');
      if (responseDoneMessages.length > 0) {
        const latestMessage = responseDoneMessages[responseDoneMessages.length - 1];
        if (latestMessage.response?.usage) {
          setTokenUsage(latestMessage.response.usage);
        }
      }
    }
  }, [messages]);

  const updateMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  const resetTokenUsage = () => {
    // Don't clear messages, only reset token usage
    // setMessages([]);
    setTokenUsage(null);
  };

  return (
    <TokenContext.Provider value={{ tokenUsage, messages, updateMessages, resetTokenUsage }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useTokenContext() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error("useTokenContext must be used within a TokenProvider");
  }
  return context;
} 