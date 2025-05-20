
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff } from 'lucide-react';
import { useChatStore } from '@/services/chatService';
import { useVoiceStore } from '@/services/voiceService';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const { addMessage } = useChatStore();
  const { isListening, transcript, startListening, stopListening, clearTranscript } = useVoiceStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Add transcript to message when voice input stops
  useEffect(() => {
    if (!isListening && transcript) {
      setMessage(prev => (prev + ' ' + transcript).trim());
      clearTranscript();
    }
  }, [isListening, transcript, clearTranscript]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      await addMessage(message.trim(), 'user');
      setMessage('');
      
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="border rounded-lg p-2 flex items-end gap-2 bg-background">
      <Textarea
        ref={textareaRef}
        placeholder="Ask me anything about your mental health..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        className="resize-none min-h-[40px] max-h-[150px] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <div className="flex shrink-0">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`rounded-full ${isListening ? 'text-mindcare-primary animate-pulse' : ''}`}
          onClick={toggleVoiceInput}
        >
          {isListening ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
        <Button
          type="button"
          size="icon"
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="rounded-full bg-mindcare-primary hover:bg-mindcare-secondary text-white"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
