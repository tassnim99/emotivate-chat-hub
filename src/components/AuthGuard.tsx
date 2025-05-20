
import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/services/authService';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const { isAuthenticated } = useAuthStore();

  // If auth is required but user is not authenticated, redirect to auth page
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If auth is not required but user is authenticated, redirect to chat page
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  // Render children if conditions are met
  return <>{children}</>;
};

export default AuthGuard;
