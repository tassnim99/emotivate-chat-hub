
import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex w-full items-start gap-4 py-8 animate-fade-in">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md bg-mindcare-primary/20">
        <span className="text-xs font-medium">AI</span>
      </div>
      <div className="typing-indicator mt-3">
        <span className="animate-wave-1"></span>
        <span className="animate-wave-2"></span>
        <span className="animate-wave-3"></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
