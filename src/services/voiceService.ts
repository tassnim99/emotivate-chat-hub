
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
      
      // Display toast message based on current language
      const messages = {
        'fr-FR': 'Écoute active',
        'en-US': 'Listening active',
        'es-ES': 'Escucha activa',
        'it-IT': 'Ascolto attivo',
        'de-DE': 'Aktives Zuhören',
        'ar-SA': 'الاستماع نشط'
      };
      
      const lang = get().language;
      toast.success(messages[lang] || messages['fr-FR']);
      
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
      
      // Display error toast message based on current language
      const messages = {
        'fr-FR': 'Erreur de reconnaissance vocale: ',
        'en-US': 'Voice recognition error: ',
        'es-ES': 'Error de reconocimiento de voz: ',
        'it-IT': 'Errore di riconoscimento vocale: ',
        'de-DE': 'Spracherkennungsfehler: ',
        'ar-SA': 'خطأ في التعرف على الصوت: '
      };
      
      const lang = get().language;
      toast.error((messages[lang] || messages['fr-FR']) + event.error);
      
      set({ isListening: false });
    };

    recognition.onend = () => {
      console.log('Voice recognition ended');
      if (get().isListening) {
        set({ isListening: false });
        
        // Display toast message based on current language
        const messages = {
          'fr-FR': 'Écoute terminée',
          'en-US': 'Listening ended',
          'es-ES': 'Escucha terminada',
          'it-IT': 'Ascolto terminato',
          'de-DE': 'Zuhören beendet',
          'ar-SA': 'انتهى الاستماع'
        };
        
        const lang = get().language;
        toast.info(messages[lang] || messages['fr-FR']);
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
        // Display error toast message based on current language
        const messages = {
          'fr-FR': 'La reconnaissance vocale n\'est pas disponible sur ce navigateur',
          'en-US': 'Voice recognition is not available on this browser',
          'es-ES': 'El reconocimiento de voz no está disponible en este navegador',
          'it-IT': 'Il riconoscimento vocale non è disponibile su questo browser',
          'de-DE': 'Spracherkennung ist in diesem Browser nicht verfügbar',
          'ar-SA': 'التعرف على الصوت غير متوفر على هذا المتصفح'
        };
        
        const lang = get().language;
        toast.error(messages[lang] || messages['fr-FR']);
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
        
        // Display error toast message based on current language
        const messages = {
          'fr-FR': 'Erreur lors du démarrage de la reconnaissance vocale',
          'en-US': 'Error starting voice recognition',
          'es-ES': 'Error al iniciar el reconocimiento de voz',
          'it-IT': 'Errore durante l\'avvio del riconoscimento vocale',
          'de-DE': 'Fehler beim Starten der Spracherkennung',
          'ar-SA': 'خطأ في بدء التعرف على الصوت'
        };
        
        const lang = get().language;
        toast.error(messages[lang] || messages['fr-FR']);
        
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
        
        // Restart recognition if it's currently active
        if (get().isListening) {
          recognition.stop();
          setTimeout(() => {
            if (recognition) {
              try {
                recognition.start();
              } catch (error) {
                console.error('Error restarting speech recognition:', error);
              }
            }
          }, 300);
        }
      }
    }
  };
});
