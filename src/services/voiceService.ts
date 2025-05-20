
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
}

export const useVoiceStore = create<VoiceState>()((set, get) => {
  // SpeechRecognition setup
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition: SpeechRecognition | null = null;

  if (SpeechRecognitionAPI) {
    recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR'; // Default language is French

    recognition.onstart = () => {
      console.log('Voice recognition started');
      toast.success('Écoute active');
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ');
      
      set({ transcript });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      toast.error('Erreur de reconnaissance vocale');
      set({ isListening: false });
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      set({ isListening: false });
    };
  } else {
    console.warn('Speech recognition not supported in this browser');
  }

  return {
    isListening: false,
    transcript: '',
    language: 'fr-FR',

    startListening: () => {
      if (recognition) {
        try {
          // Reset recognition language to current setting
          recognition.lang = get().language;
          recognition.start();
          set({ isListening: true });
        } catch (error) {
          console.error('Error starting speech recognition:', error);
          toast.error('Erreur lors du démarrage de la reconnaissance vocale');
        }
      } else {
        toast.error('La reconnaissance vocale n\'est pas prise en charge par ce navigateur');
      }
    },

    stopListening: () => {
      if (recognition) {
        recognition.stop();
        set({ isListening: false });
      }
    },

    clearTranscript: () => {
      set({ transcript: '' });
    },

    setLanguage: (lang: string) => {
      set({ language: lang });
      if (recognition) {
        recognition.lang = lang;
      }
    }
  };
});
