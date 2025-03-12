"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/app/_lib/utils";
import ThreeDotsWave from "@/app/_components/ui/three-dots-wave";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  isUser: boolean;
  text: string;
  timestamp: Date | string;
  isProcessing?: boolean;
  isSpeaking?: boolean;
}

// Define the type for the component props in ReactMarkdown
type MarkdownComponentProps = {
  node?: any;
  children?: React.ReactNode;
  [key: string]: any;
};

export function MessageBubble({
  isUser,
  text,
  timestamp,
  isProcessing = false,
  isSpeaking = false,
}: MessageBubbleProps) {
  // Format timestamp
  const formattedTime = typeof timestamp === 'string' 
    ? new Date(timestamp).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })
    : timestamp.toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex items-start gap-3 mb-4",
        isUser ? "justify-end" : ""
      )}
    >
      {/* AI Avatar */}
      {!isUser && (
        <Avatar className="w-8 h-8 shrink-0 shadow-sm overflow-hidden">
          <AvatarImage 
            src="/ai-avatar.png" 
            alt="AI Therapist" 
            className="object-cover object-center"
          />
          <AvatarFallback className="bg-cancer-ai-message text-cancer-text">AI</AvatarFallback>
        </Avatar>
      )}

      {/* Message Bubble */}
      <div
        className={cn(
          "px-4 py-3 rounded-2xl max-w-[75%] shadow-md",
          isUser 
            ? "bg-cancer-user-message text-cancer-text" 
            : "bg-cancer-ai-message text-cancer-text"
        )}
        style={{ backdropFilter: 'none' }}
      >
        {isProcessing || isSpeaking ? (
          // Show wave animation for processing or speaking status
          <ThreeDotsWave />
        ) : (
          // Use ReactMarkdown to render markdown formatting
          <div className="leading-relaxed text-base markdown-content whitespace-pre-wrap">
            <ReactMarkdown
              components={{
                p: ({ children, ...props }: MarkdownComponentProps) => <p className="mb-2 last:mb-0" {...props}>{children}</p>,
                strong: ({ children, ...props }: MarkdownComponentProps) => <span className="font-bold" {...props}>{children}</span>,
                em: ({ children, ...props }: MarkdownComponentProps) => <span className="italic" {...props}>{children}</span>,
                ul: ({ children, ...props }: MarkdownComponentProps) => <ul className="list-disc pl-5 mb-2" {...props}>{children}</ul>,
                ol: ({ children, ...props }: MarkdownComponentProps) => <ol className="list-decimal pl-5 mb-2" {...props}>{children}</ol>,
                li: ({ children, ...props }: MarkdownComponentProps) => <li className="mb-1" {...props}>{children}</li>,
                h1: ({ children, ...props }: MarkdownComponentProps) => <h1 className="text-xl font-bold mb-2" {...props}>{children}</h1>,
                h2: ({ children, ...props }: MarkdownComponentProps) => <h2 className="text-lg font-bold mb-2" {...props}>{children}</h2>,
                h3: ({ children, ...props }: MarkdownComponentProps) => <h3 className="text-base font-bold mb-2" {...props}>{children}</h3>,
                a: ({ children, ...props }: MarkdownComponentProps) => <a className="text-blue-600 underline" {...props} target="_blank" rel="noopener noreferrer">{children}</a>,
                blockquote: ({ children, ...props }: MarkdownComponentProps) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props}>{children}</blockquote>,
                code: ({ children, ...props }: MarkdownComponentProps) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props}>{children}</code>,
                pre: ({ children, ...props }: MarkdownComponentProps) => <pre className="bg-gray-100 p-2 rounded my-2 overflow-x-auto text-sm" {...props}>{children}</pre>,
                br: ({ ...props }: MarkdownComponentProps) => <br className="mb-2" {...props} />,
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        )}

        {/* Timestamp below */}
        <div className="text-xs text-cancer-subtle mt-1">
          {formattedTime}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <Avatar className="w-8 h-8 shrink-0 shadow-sm">
          <AvatarFallback className="bg-cancer-user-message text-cancer-text">You</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
} 