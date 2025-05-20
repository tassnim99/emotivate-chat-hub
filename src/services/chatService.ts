
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from '@types/uuid';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  language?: string;
}

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  language: string;
  createSession: () => string;
  setCurrentSession: (sessionId: string) => void;
  getCurrentSession: () => ChatSession | undefined;
  addMessage: (content: string, role: MessageRole) => Promise<void>;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
  setLanguage: (lang: string) => void;
}

// Language detection helper
const detectLanguage = (text: string): string => {
  // Simple language detection based on common words
  if (/\b(hello|hi|how|why|what|where|who|when|is|are|the|this)\b/i.test(text)) {
    return 'en-US';
  } else if (/\b(bonjour|salut|comment|pourquoi|quoi|où|qui|quand|est|sont|le|la|les|ce|cette)\b/i.test(text)) {
    return 'fr-FR';
  } else if (/\b(hola|como|por qué|qué|dónde|quién|cuándo|es|son|el|la|los|este|esta)\b/i.test(text)) {
    return 'es-ES';
  } else if (/\b(ciao|come|perché|cosa|dove|chi|quando|è|sono|il|la|i|questo|questa)\b/i.test(text)) {
    return 'it-IT';
  } else if (/\b(hallo|wie|warum|was|wo|wer|wann|ist|sind|der|die|das|dieser|diese)\b/i.test(text)) {
    return 'de-DE';
  } else if (/\b(مرحبا|كيف|لماذا|ماذا|أين|من|متى|هو|هي|ال|هذا|هذه)\b/i.test(text)) {
    return 'ar-SA';
  }
  
  // Default to French
  return 'fr-FR';
};

// Enhanced multilingual responses
const getGreetingByLanguage = (lang: string): string => {
  switch (lang) {
    case 'en-US':
      return "Hello! I'm MindCareAI, your mental wellness assistant. How are you feeling today? You can talk to me about whatever's on your mind, and I'll do my best to help and support you. What would you like to discuss?";
    case 'fr-FR':
      return "Bonjour ! Je suis MindCareAI, votre assistant de bien-être mental. Comment vous sentez-vous aujourd'hui ? Vous pouvez me parler de ce qui vous préoccupe, et je ferai de mon mieux pour vous aider et vous soutenir. De quoi aimeriez-vous discuter ?";
    case 'es-ES':
      return "¡Hola! Soy MindCareAI, tu asistente de bienestar mental. ¿Cómo te sientes hoy? Puedes hablarme de lo que te preocupa, y haré todo lo posible para ayudarte y apoyarte. ¿De qué te gustaría hablar?";
    case 'it-IT':
      return "Ciao! Sono MindCareAI, il tuo assistente per il benessere mentale. Come ti senti oggi? Puoi parlarmi di qualsiasi cosa ti preoccupi, e farò del mio meglio per aiutarti e supportarti. Di cosa vorresti parlare?";
    case 'de-DE':
      return "Hallo! Ich bin MindCareAI, dein Assistent für mentales Wohlbefinden. Wie fühlst du dich heute? Du kannst mit mir über alles sprechen, was dir auf dem Herzen liegt, und ich werde mein Bestes tun, um dir zu helfen. Worüber möchtest du sprechen?";
    case 'ar-SA':
      return "مرحبًا! أنا MindCareAI، مساعدك للصحة النفسية. كيف تشعر اليوم؟ يمكنك التحدث معي عما يشغل بالك، وسأبذل قصارى جهدي لمساعدتك ودعمك. عمّ تود التحدث؟";
    default:
      return "Bonjour ! Je suis MindCareAI, votre assistant de bien-être mental. Comment vous sentez-vous aujourd'hui ?";
  }
};

const getSystemPromptByLanguage = (lang: string): string => {
  switch (lang) {
    case 'en-US':
      return 'You are MindCareAI, a mental health assistant designed to provide empathetic support and guidance. Be compassionate, listen actively, and prioritize user well-being, while being clear that you are an AI assistant, not a replacement for professional mental health care.';
    case 'fr-FR':
      return 'Vous êtes MindCareAI, un assistant de santé mentale conçu pour fournir un soutien et des conseils empathiques. Soyez compatissant, écoutez activement et priorisez le bien-être de l\'utilisateur, tout en étant clair que vous êtes un assistant IA, et non un remplaçant pour des soins de santé mentale professionnels.';
    case 'es-ES':
      return 'Eres MindCareAI, un asistente de salud mental diseñado para brindar apoyo y orientación empática. Sé compasivo, escucha activamente y prioriza el bienestar del usuario, dejando claro que eres un asistente de IA, no un reemplazo de la atención profesional de salud mental.';
    case 'it-IT':
      return 'Sei MindCareAI, un assistente per la salute mentale progettato per fornire supporto empatico e guida. Sii compassionevole, ascolta attivamente e dai priorità al benessere dell\'utente, chiarendo che sei un assistente AI, non un sostituto dell\'assistenza professionale per la salute mentale.';
    case 'de-DE':
      return 'Du bist MindCareAI, ein Assistent für psychische Gesundheit, der empathische Unterstützung und Beratung bietet. Sei mitfühlend, höre aktiv zu und priorisiere das Wohlbefinden des Nutzers, während du deutlich machst, dass du ein KI-Assistent bist und kein Ersatz für professionelle psychische Gesundheitsversorgung.';
    case 'ar-SA':
      return 'أنت MindCareAI، مساعد للصحة النفسية مصمم لتقديم الدعم والتوجيه التعاطفي. كن رحيمًا، واستمع بنشاط، وأعط الأولوية لرفاهية المستخدم، مع التوضيح أنك مساعد ذكاء اصطناعي، ولست بديلاً عن رعاية الصحة النفسية المهنية.';
    default:
      return 'Vous êtes MindCareAI, un assistant de santé mentale conçu pour fournir un soutien et des conseils empathiques.';
  }
};

// OpenAI API response mock (for demo purposes)
const mockOpenAIResponse = async (messages: Message[], language: string): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const userMessage = messages[messages.length - 1].content.toLowerCase();
  
  // Detect language from user input if not specified
  const detectedLang = detectLanguage(userMessage);
  const responseLang = language || detectedLang;
  
  // Simple multilingual response logic
  if (responseLang === 'fr-FR') {
    if (userMessage.includes('bonjour') || userMessage.includes('salut')) {
      return "Bonjour ! Comment vous sentez-vous aujourd'hui ? Je suis là pour vous écouter et vous soutenir.";
    } else if (userMessage.includes('triste') || userMessage.includes('déprimé')) {
      return "Je suis désolé d'apprendre que vous vous sentez mal. Voulez-vous parler de ce qui vous préoccupe ? Rappelez-vous qu'il est normal de ne pas se sentir bien parfois, et le fait de tendre la main est un premier pas courageux.";
    } else if (userMessage.includes('anxieux') || userMessage.includes('stressé')) {
      return "L'anxiété est courante. Essayons de comprendre ce qui cause ces sentiments. Cela vous aiderait-il de prendre quelques respirations profondes ensemble ? Inspirez pendant 4 temps, retenez pendant 4, et expirez pendant 6. Cela peut aider à calmer votre système nerveux.";
    } else if (userMessage.includes('heureux') || userMessage.includes('bien')) {
      return "Je suis content d'apprendre que vous allez bien ! Quelles choses positives se sont produites récemment dans votre vie ? Célébrer les petites victoires est important pour notre bien-être mental.";
    } else if (userMessage.includes('merci')) {
      return "Je vous en prie. Je suis là pour vous soutenir chaque fois que vous avez besoin de quelqu'un à qui parler. Votre santé mentale est importante.";
    } else {
      return "Merci de partager cela avec moi. Comment cette situation vous fait-elle vous sentir ? Comprendre nos émotions est une étape importante pour le bien-être mental. Je suis là pour vous écouter et vous aider à traiter ces sentiments.";
    }
  } else if (responseLang === 'en-US') {
    if (userMessage.includes('hello') || userMessage.includes('hi')) {
      return "Hello! How are you feeling today? I'm here to listen and support you.";
    } else if (userMessage.includes('sad') || userMessage.includes('depressed')) {
      return "I'm sorry to hear you're feeling down. Would you like to talk about what's troubling you? Remember that it's okay to not be okay sometimes, and reaching out is a brave first step.";
    } else if (userMessage.includes('anxious') || userMessage.includes('stressed')) {
      return "Feeling anxious is common. Let's try to understand what's causing these feelings. Would it help to take a few deep breaths together? Breathe in for 4 counts, hold for 4, and exhale for 6. This can help calm your nervous system.";
    } else if (userMessage.includes('happy') || userMessage.includes('good')) {
      return "I'm glad to hear you're doing well! What positive things have been happening in your life recently? Celebrating small victories is important for our mental wellbeing.";
    } else if (userMessage.includes('thank')) {
      return "You're welcome. I'm here to support you whenever you need someone to talk to. Your mental health matters.";
    } else {
      return "Thank you for sharing that with me. How does this situation make you feel? Understanding our emotions is an important step in mental wellness. I'm here to listen and help you process these feelings.";
    }
  } else {
    // Default to basic French responses for other languages
    return "Merci de partager cela avec moi. Je suis là pour vous écouter et vous soutenir dans votre parcours de bien-être mental.";
  }
};

// In a real application, this would connect to a real API
const generateAIResponse = async (messages: Message[], language: string): Promise<string> => {
  return await mockOpenAIResponse(messages, language);
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isLoading: false,
      language: 'fr-FR', // Default language

      createSession: () => {
        const language = get().language;
        const newSession: ChatSession = {
          id: uuidv4(),
          title: 'Nouvelle Conversation',
          messages: [
            {
              id: uuidv4(),
              role: 'system',
              content: getSystemPromptByLanguage(language),
              timestamp: Date.now(),
            },
            {
              id: uuidv4(),
              role: 'assistant',
              content: getGreetingByLanguage(language),
              timestamp: Date.now(),
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          language,
        };
        
        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: newSession.id,
        }));
        
        return newSession.id;
      },
      
      setCurrentSession: (sessionId) => {
        set({ currentSessionId: sessionId });
      },
      
      getCurrentSession: () => {
        const { sessions, currentSessionId } = get();
        return sessions.find(session => session.id === currentSessionId);
      },
      
      addMessage: async (content, role) => {
        const { currentSessionId, sessions, language } = get();
        
        if (!currentSessionId) return;
        
        // Detect language from user input
        const detectedLang = role === 'user' ? detectLanguage(content) : language;
        
        const newMessage: Message = {
          id: uuidv4(),
          role,
          content,
          timestamp: Date.now(),
        };
        
        // Update the current session with the new message
        set((state) => {
          const updatedSessions = state.sessions.map(session => {
            if (session.id === currentSessionId) {
              // Auto-update the title for the first user message
              let title = session.title;
              if ((title === 'Nouvelle Conversation' || title === 'New Conversation') && role === 'user') {
                title = content.length > 30 ? `${content.substring(0, 30)}...` : content;
              }
              
              return {
                ...session,
                title,
                messages: [...session.messages, newMessage],
                updatedAt: Date.now(),
                language: detectedLang // Update session language based on detection
              };
            }
            return session;
          });
          
          return { 
            sessions: updatedSessions,
            language: detectedLang // Update global language state
          };
        });
        
        // If the message is from the user, generate an AI response
        if (role === 'user') {
          set({ isLoading: true });
          
          try {
            // Get the updated session with the user message
            const currentSession = get().sessions.find(session => session.id === currentSessionId);
            if (currentSession) {
              const aiResponse = await generateAIResponse(currentSession.messages, detectedLang);
              
              const aiMessage: Message = {
                id: uuidv4(),
                role: 'assistant',
                content: aiResponse,
                timestamp: Date.now(),
              };
              
              // Update session with AI response
              set((state) => {
                const updatedSessions = state.sessions.map(session => {
                  if (session.id === currentSessionId) {
                    return {
                      ...session,
                      messages: [...session.messages, aiMessage],
                      updatedAt: Date.now(),
                    };
                  }
                  return session;
                });
                
                return { 
                  sessions: updatedSessions,
                  isLoading: false 
                };
              });
            }
          } catch (error) {
            console.error("Error generating AI response:", error);
            set({ isLoading: false });
          }
        }
      },
      
      deleteSession: (sessionId) => {
        set((state) => {
          const updatedSessions = state.sessions.filter(session => session.id !== sessionId);
          
          // If the deleted session was the current one, set current to the most recent session or null
          let newCurrentSessionId = state.currentSessionId;
          if (sessionId === state.currentSessionId) {
            newCurrentSessionId = updatedSessions.length > 0 ? updatedSessions[0].id : null;
          }
          
          return {
            sessions: updatedSessions,
            currentSessionId: newCurrentSessionId,
          };
        });
      },
      
      updateSessionTitle: (sessionId, title) => {
        set((state) => {
          const updatedSessions = state.sessions.map(session => {
            if (session.id === sessionId) {
              return {
                ...session,
                title,
              };
            }
            return session;
          });
          
          return { sessions: updatedSessions };
        });
      },
      
      setLanguage: (lang) => {
        set({ language: lang });
      },
    }),
    {
      name: 'mindcare-chat-storage',
    }
  )
);
