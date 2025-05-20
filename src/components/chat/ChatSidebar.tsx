
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, MessageSquare, LogOut } from 'lucide-react';
import { useChatStore } from '@/services/chatService';
import { useAuthStore } from '@/services/authService';
import { format } from 'date-fns';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';

interface ChatSidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const ChatSidebar = ({ isMobile, onClose }: ChatSidebarProps) => {
  const { sessions, currentSessionId, createSession, setCurrentSession, deleteSession } = useChatStore();
  const { user, logout } = useAuthStore();
  const [isHovering, setIsHovering] = useState<string | null>(null);

  const handleCreateNewChat = () => {
    createSession();
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleSelectChat = (sessionId: string) => {
    setCurrentSession(sessionId);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleDeleteChat = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    deleteSession(sessionId);
  };

  return (
    <div className="flex flex-col h-full bg-background dark:bg-mindcare-dark border-r">
      <div className="p-4 flex justify-between items-center">
        <Logo size="sm" />
      </div>
      
      <div className="px-3 pb-2">
        <Button 
          onClick={handleCreateNewChat}
          className="w-full justify-start gap-2 bg-mindcare-primary hover:bg-mindcare-accent text-primary-foreground"
        >
          <Plus size={18} />
          New Chat
        </Button>
      </div>
      
      <Separator />
      
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-3 space-y-1">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "flex items-center justify-between rounded-md px-3 py-2 cursor-pointer transition-colors group",
                    currentSessionId === session.id 
                      ? "bg-mindcare-primary/10 text-mindcare-primary" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => handleSelectChat(session.id)}
                  onMouseEnter={() => setIsHovering(session.id)}
                  onMouseLeave={() => setIsHovering(null)}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <MessageSquare size={18} />
                    <div className="truncate">
                      <p className="truncate font-medium">{session.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {format(session.updatedAt, 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  
                  {(isHovering === session.id || isMobile) && (
                    <button
                      onClick={(e) => handleDeleteChat(e, session.id)}
                      className="opacity-70 hover:opacity-100 text-destructive"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>No conversations yet</p>
                <p className="text-sm">Start a new chat to begin</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      
      <div className="p-3 mt-auto">
        <Separator className="mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-mindcare-primary/20 flex items-center justify-center">
              <span className="text-sm font-medium text-mindcare-primary">
                {user?.username.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="truncate">
              <p className="text-sm font-medium truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            title="Log out"
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;
