
import { create } from 'zustand';

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
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
}

export const useVoiceStore = create<VoiceState>()((set, get) => {
  // SpeechRecognition setup
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition: SpeechRecognition | null = null;

  if (SpeechRecognitionAPI) {
    recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Default language

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ');
      
      set({ transcript });
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      set({ isListening: false });
    };

    recognition.onend = () => {
      set({ isListening: false });
    };
  }

  return {
    isListening: false,
    transcript: '',

    startListening: () => {
      if (recognition) {
        try {
          recognition.start();
          set({ isListening: true });
        } catch (error) {
          console.error('Error starting speech recognition:', error);
        }
      } else {
        console.error('Speech recognition not supported in this browser');
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
    }
  };
});
