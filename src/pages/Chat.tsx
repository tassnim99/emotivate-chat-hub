
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Menu } from 'lucide-react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';
import TypingIndicator from '@/components/chat/TypingIndicator';
import { useChatStore } from '@/services/chatService';

const Chat = () => {
  const { currentSessionId, sessions, createSession, isLoading } = useChatStore();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Create a new chat session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      createSession();
    } else if (!currentSessionId && sessions.length > 0) {
      // Set the first session as current if none is selected
      const firstSessionId = sessions[0].id;
      useChatStore.getState().setCurrentSession(firstSessionId);
    }
  }, [sessions, currentSessionId, createSession]);

  // Scroll to bottom on new messages or when loading changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [sessions, currentSessionId, isLoading]);

  // Get current chat session
  const currentSession = sessions.find(session => session.id === currentSessionId);
  const messages = currentSession?.messages || [];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      {isDesktop && (
        <div className="w-[300px] h-full hidden lg:block">
          <ChatSidebar />
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="h-14 border-b flex items-center justify-between px-4">
          {!isDesktop && (
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu size={20} />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="h-screen max-h-screen p-0">
                <div className="h-full">
                  <ChatSidebar isMobile onClose={() => setDrawerOpen(false)} />
                </div>
              </DrawerContent>
            </Drawer>
          )}
          <div className="font-semibold gradient-text">
            {currentSession?.title || 'New Conversation'}
          </div>
          <div></div> {/* Empty div for flex alignment */}
        </header>
        
        {/* Chat messages */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="flex flex-col p-4 pb-0">
              {messages
                .filter(msg => msg.role !== 'system')
                .map(message => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>
        
        {/* Chat input */}
        <div className="p-4 border-t">
          <ChatInput />
        </div>
      </div>
    </div>
  );
};

export default Chat;
