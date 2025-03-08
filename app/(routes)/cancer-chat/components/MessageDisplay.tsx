"use client";

import React, { useRef, useEffect } from "react";
import { Conversation } from "@/app/_lib/conversations";
import { motion, AnimatePresence } from "framer-motion";

interface MessageDisplayProps {
  conversation: Conversation[];
  isConnecting: boolean;
}

export function MessageDisplay({ conversation, isConnecting }: MessageDisplayProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  // Filter out non-final messages and empty messages
  const finalMessages = conversation.filter(
    (msg) => msg.isFinal && msg.text.trim().length > 0
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <AnimatePresence>
        {finalMessages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`p-3 rounded-lg max-w-[80%] ${
              message.role === 'user' 
                ? 'bg-blue-100 ml-auto' 
                : 'bg-gray-100'
            }`}>
              <div className="font-medium mb-1">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="text-gray-800">{message.text}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Show typing indicator for non-final assistant messages */}
      {conversation.some(
        (msg) => !msg.isFinal && msg.role === "assistant" && msg.text.trim().length > 0
      ) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center space-x-2 p-2"
        >
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </motion.div>
      )}
      
      {/* Empty div for auto-scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
} 