
import React from 'react';
import { cn } from '@/lib/utils';
import { Message as MessageType } from '@/services/chatService';
import { format } from 'date-fns';
import Logo from '@/components/Logo';

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
    <div className={cn(
      "flex w-full items-start gap-4 py-4",
      isAI ? "animate-fade-in" : ""
    )}>
      <div className={cn(
        "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md",
        isAI ? "bg-mindcare-primary/20" : "bg-mindcare-secondary/20"
      )}>
        {isAI ? (
          <Logo size="sm" className="scale-[0.7]" />
        ) : (
          <span className="text-sm font-medium">You</span>
        )}
      </div>
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {isAI ? "MindCareAI" : "You"}
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
    </div>
  );
};

export default ChatMessage;
