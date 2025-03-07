"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputSectionProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function InputSection({
  onSubmit,
  disabled = false,
  placeholder = "Type a message...",
  className,
}: InputSectionProps) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
      setText("");
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "flex w-full gap-2 items-center",
        className
      )}
    >
      <Input
        type="text"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        className="flex-1 rounded-full border-cancer-subtle placeholder:text-cancer-subtle text-cancer-text text-base h-12 px-5"
        aria-label="Message input"
      />
      
      <Button 
        type="submit" 
        disabled={disabled || !text.trim()}
        size="icon"
        className="bg-cancer-accent hover:bg-cancer-accent/90 text-white rounded-full h-12 w-12 flex items-center justify-center"
        aria-label="Send message"
      >
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
} 