"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/app/_lib/utils";
import ThreeDotsWave from "@/app/_components/ui/three-dots-wave";
import { Conversation } from "@/app/_lib/conversations";
import { useTranslations } from "@/app/_components/shared/translations-context";

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
   // Always display assistant messages (even if they're empty, though that’s rare).
   return true;
 } else {
   // User role
   // 1) If user is currently speaking or processing, we show it (wave or “Processing…”).
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
* Single conversation item
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
     className={`flex items-start gap-3 ${isUser ? "justify-end" : ""}`}
   >
     {/* Assistant Avatar */}
     {isAssistant && (
       <Avatar className="w-8 h-8 shrink-0">
         {/* <AvatarImage src="/placeholder-user.jpg" /> */}
         <AvatarFallback>AI</AvatarFallback>
       </Avatar>
     )}

     {/* Message Bubble */}
     <div
       className={`${
         isUser
           ? "bg-primary text-background"
           : "bg-secondary dark:text-foreground"
       } px-4 py-2 rounded-lg max-w-[70%] motion-preset-slide-up-right`}
     >
       {(isUser && msgStatus === "speaking") || msgStatus === "processing" ? (
         // Show wave animation for "speaking" status
         <ThreeDotsWave />
       ) : (
         // Otherwise, show the message text or final text)
         <p>{message.text}</p>
       )}

       {/* Timestamp below */}
       <div className="text-xs text-muted-foreground">
         {new Date(message.timestamp).toLocaleTimeString("en-US", {
           hour: "numeric",
           minute: "numeric",
         })}
       </div>
     </div>

     {/* User Avatar */}
     {isUser && (
       <Avatar className="w-8 h-8 shrink-0">
         {/* <AvatarImage src="/placeholder-user.jpg" /> */}
         <AvatarFallback>You</AvatarFallback>
       </Avatar>
     )}
   </motion.div>
 );
}

interface TranscriberProps {
 conversation: Conversation[];
}


export default function Transcriber({ conversation }: TranscriberProps) {
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
   <div className="flex flex-col w-full h-full mx-auto bg-background rounded-lg shadow-lg overflow-hidden dark:bg-background">
     {/* Header */}
     <div className="bg-secondary px-4 py-3 flex items-center justify-between dark:bg-secondary">
       <div className="font-medium text-foreground dark:text-foreground">
        {t('transcriber.title')}
       </div>
     </div>

     {/* Body */}
     <div
       ref={scrollRef}
       className="flex-1 h-full overflow-y-auto p-4 space-y-4 z-50 scrollbar-thin scrollbar-thumb-primary"
     >
       <AnimatePresence>
         {displayableMessages.map((message) => (
           <ConversationItem key={message.id} message={message} />
         ))}
       </AnimatePresence>
     </div>
   </div>
 );
}

export { Avatar, AvatarImage, AvatarFallback };
