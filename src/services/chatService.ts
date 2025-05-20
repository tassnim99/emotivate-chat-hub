
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

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
}

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  createSession: () => string;
  setCurrentSession: (sessionId: string) => void;
  getCurrentSession: () => ChatSession | undefined;
  addMessage: (content: string, role: MessageRole) => Promise<void>;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
}

// OpenAI API response mock (for demo purposes)
const mockOpenAIResponse = async (messages: Message[]): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const userMessage = messages[messages.length - 1].content.toLowerCase();
  
  // Simple response logic
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
};

// In a real application, this would connect to a real API
const generateAIResponse = async (messages: Message[]): Promise<string> => {
  return await mockOpenAIResponse(messages);
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionId: null,
      isLoading: false,

      createSession: () => {
        const newSession: ChatSession = {
          id: uuidv4(),
          title: 'New Conversation',
          messages: [
            {
              id: uuidv4(),
              role: 'system',
              content: 'You are MindCareAI, a mental health assistant designed to provide empathetic support and guidance. Be compassionate, listen actively, and prioritize user well-being, while being clear that you are an AI assistant, not a replacement for professional mental health care.',
              timestamp: Date.now(),
            },
            {
              id: uuidv4(),
              role: 'assistant',
              content: "Hello! I'm MindCareAI, your mental wellness assistant. How are you feeling today? You can talk to me about whatever's on your mind, and I'll do my best to help and support you. What would you like to discuss?",
              timestamp: Date.now(),
            },
          ],
          createdAt: Date.now(),
          updatedAt: Date.now(),
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
        const { currentSessionId, sessions } = get();
        
        if (!currentSessionId) return;
        
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
              if (title === 'New Conversation' && role === 'user') {
                title = content.length > 30 ? `${content.substring(0, 30)}...` : content;
              }
              
              return {
                ...session,
                title,
                messages: [...session.messages, newMessage],
                updatedAt: Date.now(),
              };
            }
            return session;
          });
          
          return { sessions: updatedSessions };
        });
        
        // If the message is from the user, generate an AI response
        if (role === 'user') {
          set({ isLoading: true });
          
          try {
            // Get the updated session with the user message
            const currentSession = get().sessions.find(session => session.id === currentSessionId);
            if (currentSession) {
              const aiResponse = await generateAIResponse(currentSession.messages);
              
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
    }),
    {
      name: 'mindcare-chat-storage',
    }
  )
);
