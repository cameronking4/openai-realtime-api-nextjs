"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ThreeDotsWave from "@/components/ui/three-dots-wave";
import { Conversation } from "@/lib/conversations";
import { useTranslations } from "@/components/translations-context";

/**
 * Avatar building blocks with Radix
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

/**
 * Decide if a conversation item should be displayed or filtered out. 
 * Optional, this is used to filter out empty or useless user messages (e.g., final + empty text)
 */
function shouldDisplayMessage(msg: Conversation): boolean {
  const { role, text, status, isFinal } = msg;

  if (role === "assistant") {
    // Always display assistant messages (even if they're empty, though that's rare).
    return true;
  } else {
    // User role
    // 1) If user is currently speaking or processing, we show it (wave or "Processing…").
    if (status === "speaking" || status === "processing") {
      return true;
    }
    // 2) If user is final, only show if the transcript is non-empty.
    if (isFinal && text.trim().length > 0) {
      return true;
    }
    // Otherwise, skip.
    return false;
  }
}

/**
 * Single conversation item with enhanced styling for therapeutic conversations
 */
function ConversationItem({ message }: { message: Conversation }) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const msgStatus = message.status;

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex items-start gap-3 ${isUser ? "justify-end" : ""} mb-4`}
    >
      {/* Assistant Avatar */}
      {isAssistant && (
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">Eve</AvatarFallback>
        </Avatar>
      )}

      {/* Message Bubble */}
      <div
        className={`${
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-blue-50 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
        } px-4 py-3 rounded-2xl max-w-[75%] shadow-sm`}
      >
        {(isUser && msgStatus === "speaking") || msgStatus === "processing" ? (
          // Show wave animation for "speaking" status
          <ThreeDotsWave />
        ) : (
          // Otherwise, show the message text or final text
          <p className="leading-relaxed">{message.text}</p>
        )}

        {/* Timestamp below */}
        <div className="text-xs text-muted-foreground mt-1">
          {new Date(message.timestamp).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
          })}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200">You</AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  );
}

interface ChatBoxProps {
  conversation: Conversation[];
  children?: React.ReactNode; // For RealtimeBlock or other components
}

export default function ChatBox({ conversation, children }: ChatBoxProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslations();

  // Scroll to bottom whenever conversation updates
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  // Filter out messages that we do not want to display
  const displayableMessages = React.useMemo(() => {
    return conversation.filter(shouldDisplayMessage);
  }, [conversation]);

  return (
    <div className="flex flex-col w-full h-[70vh] mx-auto bg-background rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 dark:bg-background">
      {/* Header */}
      <div className="bg-blue-50 dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        <div className="font-medium text-slate-800 dark:text-slate-100 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {t('transcriber.title') || 'Psycho-Oncology Assessment'}
        </div>
      </div>

      {/* Body */}
      <div
        ref={scrollRef}
        className="flex-1 h-full overflow-y-auto p-6 space-y-2 bg-slate-50 dark:bg-slate-900"
      >
        <AnimatePresence>
          {displayableMessages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
              <p>Your conversation will appear here</p>
            </div>
          ) : (
            displayableMessages.map((message) => (
              <ConversationItem key={message.id} message={message} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer for RealtimeBlock or other components */}
      {children && (
        <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-800">
          {children}
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarImage, AvatarFallback }; 