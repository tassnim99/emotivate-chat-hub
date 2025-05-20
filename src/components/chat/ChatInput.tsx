
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Languages } from 'lucide-react';
import { toast } from 'sonner';
import { useChatStore } from '@/services/chatService';
import { useVoiceStore } from '@/services/voiceService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Language options
const languages = [
  { code: 'fr-FR', name: 'Français' },
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Español' },
  { code: 'de-DE', name: 'Deutsch' },
  { code: 'it-IT', name: 'Italiano' },
  { code: 'ar-SA', name: 'العربية' },
];

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const { addMessage, language: chatLanguage, setLanguage: setChatLanguage } = useChatStore();
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    clearTranscript, 
    setLanguage: setVoiceLanguage,
    isAvailable
  } = useVoiceStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRecordingPulse, setIsRecordingPulse] = useState(false);

  // Update textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Add transcript to message when voice input is received
  useEffect(() => {
    if (transcript) {
      console.log('Setting message from transcript:', transcript);
      setMessage(prev => (prev + ' ' + transcript).trim());
      clearTranscript();
    }
  }, [transcript, clearTranscript]);

  // Animate recording pulse
  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setIsRecordingPulse(prev => !prev);
      }, 750);
      return () => clearInterval(interval);
    } else {
      setIsRecordingPulse(false);
    }
  }, [isListening]);

  const handleSendMessage = async () => {
    if (message.trim()) {
      console.log('Sending message:', message);
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
    if (!isAvailable) {
      toast.error("La reconnaissance vocale n'est pas prise en charge par ce navigateur");
      return;
    }
    
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setChatLanguage(langCode);
    setVoiceLanguage(langCode);
    
    // Get language name for toast
    const langName = languages.find(lang => lang.code === langCode)?.name || langCode;
    toast.success(`Langue changée: ${langName}`);
  };

  return (
    <div className="border rounded-lg p-2 flex items-end gap-2 bg-background">
      <Textarea
        ref={textareaRef}
        placeholder="Posez-moi une question sur votre santé mentale..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        className="resize-none min-h-[40px] max-h-[150px] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <div className="flex shrink-0 space-x-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="rounded-full"
              title="Changer de langue"
            >
              <Languages className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={chatLanguage === lang.code ? "bg-accent/50" : ""}
              >
                {lang.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          className={`rounded-full ${isListening ? 'text-destructive animate-pulse' : ''} ${!isAvailable ? 'opacity-50' : ''}`}
          onClick={toggleVoiceInput}
          disabled={!isAvailable}
          title={isAvailable ? "Utiliser la reconnaissance vocale" : "Reconnaissance vocale non disponible"}
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

      {isListening && (
        <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm py-2 px-4 rounded-full shadow-md border flex items-center space-x-2">
          <div className="voice-wave flex items-center">
            <span className={`${isRecordingPulse ? 'animate-wave-1' : ''}`}></span>
            <span className={`${isRecordingPulse ? 'animate-wave-2' : ''}`}></span>
            <span className={`${isRecordingPulse ? 'animate-wave-3' : ''}`}></span>
          </div>
          <span className="text-sm font-medium">Écoute en cours...</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
