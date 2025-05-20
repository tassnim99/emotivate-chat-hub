
import { create } from 'zustand';
import { toast } from 'sonner';

// Add TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error: any;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onstart?: () => void;
}

// Create a global type declaration
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface VoiceState {
  isListening: boolean;
  transcript: string;
  language: string;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
  setLanguage: (lang: string) => void;
  isAvailable: boolean;
}

export const useVoiceStore = create<VoiceState>()((set, get) => {
  let isApiAvailable = false;
  // SpeechRecognition setup
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition: SpeechRecognition | null = null;

  if (SpeechRecognitionAPI) {
    isApiAvailable = true;
    recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR'; // Default language is French

    recognition.onstart = () => {
      console.log('Voice recognition started');
      toast.success('Écoute active');
      set({ isListening: true });
    };

    recognition.onresult = (event) => {
      try {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join(' ');
        
        set({ transcript });
        console.log('Transcript updated:', transcript);
      } catch (error) {
        console.error('Error processing speech result:', error);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast.error('Erreur de reconnaissance vocale: ' + event.error);
      set({ isListening: false });
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      if (get().isListening) {
        set({ isListening: false });
        // Only show toast if the recognition wasn't manually stopped
        toast.info('Écoute terminée');
      }
    };
  } else {
    console.warn('Speech recognition not supported in this browser');
  }

  return {
    isListening: false,
    transcript: '',
    language: 'fr-FR',
    isAvailable: isApiAvailable,

    startListening: () => {
      if (!recognition) {
        toast.error('La reconnaissance vocale n\'est pas disponible sur ce navigateur');
        return;
      }
      
      if (get().isListening) {
        console.log('Already listening, stopping first');
        recognition.stop();
      }

      try {
        // Reset recognition language to current setting
        recognition.lang = get().language;
        console.log('Starting speech recognition with language:', get().language);
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        toast.error('Erreur lors du démarrage de la reconnaissance vocale');
        set({ isListening: false });
      }
    },

    stopListening: () => {
      if (recognition && get().isListening) {
        console.log('Stopping speech recognition');
        recognition.stop();
        set({ isListening: false });
      }
    },

    clearTranscript: () => {
      set({ transcript: '' });
    },

    setLanguage: (lang: string) => {
      console.log('Setting voice recognition language to:', lang);
      set({ language: lang });
      if (recognition) {
        recognition.lang = lang;
      }
    }
  };
});
