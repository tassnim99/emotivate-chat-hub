
import React from 'react';
import { cn } from '@/lib/utils';
import { Message as MessageType } from '@/services/chatService';
import { format } from 'date-fns';
import { Brain } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatMessageProps {
  message: MessageType;
}

// Helper to detect if content is in right-to-left language
const isRTL = (text: string) => {
  // More comprehensive detection of RTL characters, especially Arabic
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF\u0591-\u07FF]/.test(text);
};

// Helper to format message content with markdown-like syntax
const formatMessageContent = (content: string) => {
  // Replace **text** with bold text
  content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Replace *text* with italic text
  content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Replace _text_ with underlined text (alternative for italic)
  content = content.replace(/_(.*?)_/g, '<u>$1</u>');
  // Replace lists
  content = content.replace(/^\s*-\s+(.*)/gm, '<li>$1</li>');
  
  // Handle numbered lists (1. text)
  content = content.replace(/^\s*(\d+)\.\s+(.*)/gm, '<li>$2</li>');
  
  // Add line breaks
  content = content.replace(/\n/g, '<br />');
  
  return content;
};

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isAI = message.role === 'assistant';
  const formattedTime = format(message.timestamp, 'h:mm a');
  const isRightToLeft = isRTL(message.content);

  if (message.role === 'system') {
    return null; // Don't render system messages
  }

  // Split by new lines to handle paragraphs
  const paragraphs = message.content.split('\n');

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
        "flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full",
        isAI ? "bg-mindcare-primary/20" : "bg-mindcare-secondary/20"
      )}>
        {isAI ? (
          <Brain size={20} className="text-mindcare-primary" />
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
          "max-w-full transition-all duration-300 hover:bg-muted/20 p-2 rounded-md"
        )}>
          <div 
            className={isRightToLeft ? "text-right" : "text-left"} 
            dir={isRightToLeft ? "rtl" : "ltr"}
          >
            {paragraphs.map((paragraph, i) => (
              paragraph.trim() ? (
                <p 
                  key={i} 
                  className={cn(
                    "whitespace-pre-wrap",
                    i < paragraphs.length - 1 ? "mb-4" : ""
                  )}
                  dangerouslySetInnerHTML={{ __html: formatMessageContent(paragraph) }}
                />
              ) : <br key={i} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
