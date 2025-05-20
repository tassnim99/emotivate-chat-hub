
import React from 'react';
import { cn } from '@/lib/utils';
import { Message as MessageType } from '@/services/chatService';
import { format } from 'date-fns';
import Logo from '@/components/Logo';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: MessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAI = message.role === 'assistant';
  const formattedTime = format(message.timestamp, 'h:mm a');

  if (message.role === 'system') {
    return null; // Don't render system messages
  }

  return (
    <motion.div 
      className={cn(
        "flex w-full items-start gap-4 py-4",
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md",
        isAI ? "bg-mindcare-primary/20" : "bg-mindcare-secondary/20"
      )}>
        {isAI ? (
          <Logo size="xs" className="scale-[0.7]" />
        ) : (
          <span className="text-sm font-medium">Vous</span>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {isAI ? "MindCareAI" : "Vous"}
          </span>
          <span className="text-xs text-muted-foreground">
            {formattedTime}
          </span>
        </div>
        <div className={cn(
          "prose prose-sm prose-p:leading-relaxed prose-pre:p-0",
          "max-w-full"
        )}>
          {message.content.split('\n').map((paragraph, i) => (
            <p key={i} className="whitespace-pre-wrap">{paragraph}</p>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
