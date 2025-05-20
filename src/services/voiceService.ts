
import { create } from 'zustand';

interface VoiceState {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  clearTranscript: () => void;
}

export const useVoiceStore = create<VoiceState>()((set, get) => {
  // SpeechRecognition setup
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition: SpeechRecognition | null = null;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
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
