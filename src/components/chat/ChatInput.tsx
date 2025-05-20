
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

// Placeholders for different languages
const getPlaceholderByLanguage = (lang: string): string => {
  switch (lang) {
    case 'en-US':
      return "Ask me a question about your mental health...";
    case 'fr-FR':
      return "Posez-moi une question sur votre santé mentale...";
    case 'es-ES':
      return "Hazme una pregunta sobre tu salud mental...";
    case 'it-IT':
      return "Fammi una domanda sulla tua salute mentale...";
    case 'de-DE':
      return "Stellen Sie mir eine Frage zu Ihrer psychischen Gesundheit...";
    case 'ar-SA':
      return "اسألني سؤالاً عن صحتك النفسية...";
    default:
      return "Posez-moi une question sur votre santé mentale...";
  }
};

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
  const [placeholder, setPlaceholder] = useState(getPlaceholderByLanguage('fr-FR'));

  // Update textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  // Update placeholder when language changes
  useEffect(() => {
    setPlaceholder(getPlaceholderByLanguage(chatLanguage));
  }, [chatLanguage]);

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
      // Show toast message based on current language
      const messages = {
        'fr-FR': "La reconnaissance vocale n'est pas prise en charge par ce navigateur",
        'en-US': "Voice recognition is not supported by this browser",
        'es-ES': "El reconocimiento de voz no es compatible con este navegador",
        'de-DE': "Spracherkennung wird von diesem Browser nicht unterstützt",
        'it-IT': "Il riconoscimento vocale non è supportato da questo browser",
        'ar-SA': "التعرف على الصوت غير مدعوم من قبل هذا المتصفح"
      };
      
      toast.error(messages[chatLanguage] || messages['fr-FR']);
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
    
    // Show toast message based on selected language
    const messages = {
      'fr-FR': `Langue changée: ${langName}`,
      'en-US': `Language changed: ${langName}`,
      'es-ES': `Idioma cambiado: ${langName}`,
      'de-DE': `Sprache geändert: ${langName}`,
      'it-IT': `Lingua cambiata: ${langName}`,
      'ar-SA': `تم تغيير اللغة: ${langName}`
    };
    
    toast.success(messages[langCode] || messages['fr-FR']);
  };

  // Get "Listening..." text based on current language
  const getListeningText = () => {
    const listeningTexts = {
      'fr-FR': "Écoute en cours...",
      'en-US': "Listening...",
      'es-ES': "Escuchando...",
      'de-DE': "Hören...",
      'it-IT': "Ascolto in corso...",
      'ar-SA': "جاري الاستماع..."
    };
    
    return listeningTexts[chatLanguage] || listeningTexts['fr-FR'];
  };

  return (
    <div className="border rounded-lg p-2 flex items-end gap-2 bg-background">
      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        className="resize-none min-h-[40px] max-h-[150px] border-none focus-visible:ring-0 focus-visible:ring-offset-0"
        dir={chatLanguage === 'ar-SA' ? 'rtl' : 'ltr'} // Add RTL support for Arabic
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
          <span className="text-sm font-medium">{getListeningText()}</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;
