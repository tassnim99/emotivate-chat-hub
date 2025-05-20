
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
  
  // Improved language-specific responses
  switch (responseLang) {
    case 'fr-FR':
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
      } else if (userMessage.includes('routine') || userMessage.includes('habitude')) {
        return "Voici une routine qui pourrait vous aider :\n\n1. Commencez la journée par 10 minutes de méditation ou de respiration profonde\n2. Prenez un petit déjeuner équilibré et hydratez-vous\n3. Fixez-vous 1-3 objectifs prioritaires pour la journée\n4. Faites une pause de 5 minutes toutes les heures pour vous étirer et respirer\n5. Consacrez 30 minutes à une activité physique\n6. Réservez du temps pour une activité qui vous fait plaisir\n7. Le soir, notez 3 choses positives de votre journée\n8. Limitez les écrans 1h avant de dormir\n\nAdaptez cette routine à vos besoins spécifiques. La constance est plus importante que la perfection.";
      } else {
        return "Merci de partager cela avec moi. Comment cette situation vous fait-elle vous sentir ? Comprendre nos émotions est une étape importante pour le bien-être mental. Je suis là pour vous écouter et vous aider à traiter ces sentiments.";
      }
      
    case 'en-US':
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
      } else if (userMessage.includes('routine') || userMessage.includes('habit')) {
        return "Here's a routine that might help you:\n\n1. Start the day with 10 minutes of meditation or deep breathing\n2. Have a balanced breakfast and hydrate\n3. Set 1-3 priority goals for the day\n4. Take a 5-minute break every hour to stretch and breathe\n5. Dedicate 30 minutes to physical activity\n6. Reserve time for an activity you enjoy\n7. In the evening, note 3 positive things from your day\n8. Limit screen time 1 hour before sleeping\n\nAdapt this routine to your specific needs. Consistency is more important than perfection.";
      } else {
        return "Thank you for sharing that with me. How does this situation make you feel? Understanding our emotions is an important step in mental wellness. I'm here to listen and help you process these feelings.";
      }
      
    case 'es-ES':
      if (userMessage.includes('hola') || userMessage.includes('buenos dias')) {
        return "¡Hola! ¿Cómo te sientes hoy? Estoy aquí para escucharte y apoyarte.";
      } else if (userMessage.includes('triste') || userMessage.includes('deprimido')) {
        return "Lamento saber que te sientes mal. ¿Te gustaría hablar sobre lo que te preocupa? Recuerda que está bien no estar bien a veces, y pedir ayuda es un primer paso valiente.";
      } else if (userMessage.includes('ansioso') || userMessage.includes('estresado')) {
        return "Sentirse ansioso es común. Intentemos entender qué está causando estos sentimientos. ¿Te ayudaría respirar profundamente juntos? Inhala durante 4 tiempos, mantén durante 4 y exhala durante 6. Esto puede ayudar a calmar tu sistema nervioso.";
      } else if (userMessage.includes('feliz') || userMessage.includes('bien')) {
        return "¡Me alegra saber que estás bien! ¿Qué cosas positivas han estado sucediendo en tu vida recientemente? Celebrar pequeñas victorias es importante para nuestro bienestar mental.";
      } else if (userMessage.includes('gracias')) {
        return "De nada. Estoy aquí para apoyarte siempre que necesites a alguien con quien hablar. Tu salud mental es importante.";
      } else if (userMessage.includes('rutina') || userMessage.includes('hábito')) {
        return "Aquí hay una rutina que podría ayudarte:\n\n1. Comienza el día con 10 minutos de meditación o respiración profunda\n2. Desayuna de forma equilibrada e hidrátate\n3. Establece 1-3 objetivos prioritarios para el día\n4. Toma un descanso de 5 minutos cada hora para estirar y respirar\n5. Dedica 30 minutos a la actividad física\n6. Reserva tiempo para una actividad que disfrutes\n7. Por la noche, anota 3 cosas positivas de tu día\n8. Limita el tiempo de pantalla 1 hora antes de dormir\n\nAdapta esta rutina a tus necesidades específicas. La consistencia es más importante que la perfección.";
      } else {
        return "Gracias por compartir eso conmigo. ¿Cómo te hace sentir esta situación? Entender nuestras emociones es un paso importante en el bienestar mental. Estoy aquí para escuchar y ayudarte a procesar estos sentimientos.";
      }
      
    case 'de-DE':
      if (userMessage.includes('hallo') || userMessage.includes('guten tag')) {
        return "Hallo! Wie fühlst du dich heute? Ich bin hier, um dir zuzuhören und dich zu unterstützen.";
      } else if (userMessage.includes('traurig') || userMessage.includes('deprimiert')) {
        return "Es tut mir leid zu hören, dass du dich schlecht fühlst. Möchtest du über das sprechen, was dich beunruhigt? Denk daran, dass es in Ordnung ist, manchmal nicht in Ordnung zu sein, und Hilfe zu suchen ist ein mutiger erster Schritt.";
      } else if (userMessage.includes('ängstlich') || userMessage.includes('gestresst')) {
        return "Sich ängstlich zu fühlen ist normal. Versuchen wir zu verstehen, was diese Gefühle verursacht. Würde es helfen, gemeinsam einige tiefe Atemzüge zu nehmen? Atme 4 Sekunden ein, halte 4 Sekunden und atme 6 Sekunden aus. Das kann dein Nervensystem beruhigen.";
      } else if (userMessage.includes('glücklich') || userMessage.includes('gut')) {
        return "Ich freue mich zu hören, dass es dir gut geht! Welche positiven Dinge sind in letzter Zeit in deinem Leben passiert? Kleine Erfolge zu feiern ist wichtig für unser mentales Wohlbefinden.";
      } else if (userMessage.includes('danke')) {
        return "Gerne. Ich bin für dich da, wann immer du jemanden zum Reden brauchst. Deine psychische Gesundheit ist wichtig.";
      } else if (userMessage.includes('routine') || userMessage.includes('gewohnheit')) {
        return "Hier ist eine Routine, die dir helfen könnte:\n\n1. Beginne den Tag mit 10 Minuten Meditation oder tiefer Atmung\n2. Frühstücke ausgewogen und hydratisiere dich\n3. Setze 1-3 Prioritätsziele für den Tag\n4. Mache jede Stunde eine 5-minütige Pause zum Strecken und Atmen\n5. Widme 30 Minuten körperlicher Aktivität\n6. Reserviere Zeit für eine Aktivität, die du genießt\n7. Notiere abends 3 positive Dinge deines Tages\n8. Begrenze die Bildschirmzeit 1 Stunde vor dem Schlafengehen\n\nPasse diese Routine an deine spezifischen Bedürfnisse an. Konsistenz ist wichtiger als Perfektion.";
      } else {
        return "Danke, dass du das mit mir teilst. Wie lässt dich diese Situation fühlen? Das Verstehen unserer Emotionen ist ein wichtiger Schritt für das mentale Wohlbefinden. Ich bin hier, um zuzuhören und dir zu helfen, diese Gefühle zu verarbeiten.";
      }
      
    case 'it-IT':
      if (userMessage.includes('ciao') || userMessage.includes('buongiorno')) {
        return "Ciao! Come ti senti oggi? Sono qui per ascoltarti e supportarti.";
      } else if (userMessage.includes('triste') || userMessage.includes('depresso')) {
        return "Mi dispiace sentire che ti senti giù. Vorresti parlare di ciò che ti preoccupa? Ricorda che va bene non stare bene a volte, e cercare aiuto è un primo passo coraggioso.";
      } else if (userMessage.includes('ansioso') || userMessage.includes('stressato')) {
        return "Sentirsi ansiosi è comune. Cerchiamo di capire cosa sta causando questi sentimenti. Ti aiuterebbe fare dei respiri profondi insieme? Inspira per 4 tempi, trattieni per 4 ed espira per 6. Questo può aiutare a calmare il tuo sistema nervoso.";
      } else if (userMessage.includes('felice') || userMessage.includes('bene')) {
        return "Sono contento di sentire che stai bene! Quali cose positive sono successe nella tua vita recentemente? Celebrare piccole vittorie è importante per il nostro benessere mentale.";
      } else if (userMessage.includes('grazie')) {
        return "Prego. Sono qui per supportarti ogni volta che hai bisogno di qualcuno con cui parlare. La tua salute mentale è importante.";
      } else if (userMessage.includes('routine') || userMessage.includes('abitudine')) {
        return "Ecco una routine che potrebbe aiutarti:\n\n1. Inizia la giornata con 10 minuti di meditazione o respirazione profonda\n2. Fai una colazione equilibrata e idratati\n3. Stabilisci 1-3 obiettivi prioritari per la giornata\n4. Fai una pausa di 5 minuti ogni ora per allungarti e respirare\n5. Dedica 30 minuti all'attività fisica\n6. Riserva del tempo per un'attività che ti piace\n7. La sera, annota 3 cose positive della tua giornata\n8. Limita il tempo davanti agli schermi 1 ora prima di dormire\n\nAdatta questa routine alle tue esigenze specifiche. La costanza è più importante della perfezione.";
      } else {
        return "Grazie per aver condiviso questo con me. Come ti fa sentire questa situazione? Comprendere le nostre emozioni è un passo importante nel benessere mentale. Sono qui per ascoltare e aiutarti a elaborare questi sentimenti.";
      }
      
    case 'ar-SA':
      // Arabic responses
      if (userMessage.includes('مرحبا') || userMessage.includes('السلام عليكم')) {
        return "مرحباً! كيف تشعر اليوم؟ أنا هنا للاستماع إليك ودعمك.";
      } else if (userMessage.includes('حزين') || userMessage.includes('مكتئب')) {
        return "يؤسفني سماع أنك تشعر بالإحباط. هل ترغب في التحدث عما يزعجك؟ تذكر أنه من الطبيعي ألا تكون على ما يرام أحيانًا، وطلب المساعدة هو خطوة أولى شجاعة.";
      } else if (userMessage.includes('قلق') || userMessage.includes('متوتر')) {
        return "الشعور بالقلق أمر شائع. دعنا نحاول فهم ما يسبب هذه المشاعر. هل سيساعدك أخذ بعض الأنفاس العميقة معًا؟ استنشق لمدة 4 عدات، احتفظ بها لمدة 4، وازفر لمدة 6. هذا يمكن أن يساعد في تهدئة جهازك العصبي.";
      } else if (userMessage.includes('سعيد') || userMessage.includes('بخير')) {
        return "يسعدني سماع أنك بخير! ما هي الأشياء الإيجابية التي حدثت في حياتك مؤخرًا؟ الاحتفال بالانتصارات الصغيرة مهم لصحتنا النفسية.";
      } else if (userMessage.includes('شكرا')) {
        return "على الرحب والسعة. أنا هنا لدعمك كلما احتجت إلى شخص للتحدث معه. صحتك النفسية مهمة.";
      } else if (userMessage.includes('روتين') || userMessage.includes('عادة')) {
        return "إليك روتينًا يمكن أن يساعدك:\n\n1. ابدأ يومك بـ 10 دقائق من التأمل أو التنفس العميق\n2. تناول فطورًا متوازنًا وحافظ على ترطيب جسمك\n3. حدد 1-3 أهداف ذات أولوية لليوم\n4. خذ استراحة لمدة 5 دقائق كل ساعة للتمدد والتنفس\n5. خصص 30 دقيقة للنشاط البدني\n6. احجز وقتًا لنشاط تستمتع به\n7. في المساء، دوّن 3 أشياء إيجابية من يومك\n8. قلل من وقت الشاشة قبل ساعة من النوم\n\nقم بتكييف هذا الروتين وفقًا لاحتياجاتك الخاصة. الاستمرارية أهم من الكمال.";
      } else {
        return "شكرًا لمشاركة ذلك معي. كيف تجعلك هذه الحالة تشعر؟ فهم عواطفنا هو خطوة مهمة في العافية النفسية. أنا هنا للاستماع ومساعدتك في معالجة هذه المشاعر.";
      }
      
    default:
      // Default to French
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
        console.log('Detected language:', detectedLang);
        
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
              console.log('Generating AI response in language:', detectedLang);
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
        console.log('Setting global language to:', lang);
        set({ language: lang });
      },
    }),
    {
      name: 'mindcare-chat-storage',
    }
  )
);
