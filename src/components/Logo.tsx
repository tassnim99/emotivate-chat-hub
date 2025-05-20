
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo = ({ size = 'md', className }: LogoProps) => {
  const sizeClasses = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-16',
  };

  const textSizeClasses = {
    xs: 'text-base',
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div className={cn("flex items-center", className)}>
      <div className="relative">
        <div className={cn("flex items-center justify-center", sizeClasses[size])}>
          <svg 
            viewBox="0 0 100 100" 
            className={cn("text-mindcare-primary", sizeClasses[size])}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5e60ce" />
                <stop offset="100%" stopColor="#7400b8" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" fill="url(#logoGradient)" opacity="0.2" />
            <path 
              d="M30,35 Q50,20 70,35 Q85,50 70,65 Q50,80 30,65 Q15,50 30,35" 
              stroke="url(#logoGradient)" 
              strokeWidth="4" 
              fill="none"
            />
            <circle cx="40" cy="45" r="5" fill="url(#logoGradient)" />
            <circle cx="60" cy="45" r="5" fill="url(#logoGradient)" />
            <path 
              d="M40,60 Q50,70 60,60" 
              stroke="url(#logoGradient)" 
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
            />
            <path 
              d="M25,25 Q40,15 50,20 Q60,15 75,25" 
              stroke="url(#logoGradient)" 
              strokeWidth="2" 
              fill="none" 
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        </div>
      </div>
      <div className={cn("ml-2 font-bold tracking-tight", textSizeClasses[size])}>
        <span className="gradient-text">Mind</span>
        <span className="text-mindcare-secondary">Care</span>
        <span className="text-mindcare-text">AI</span>
      </div>
    </div>
  );
};

export default Logo;
