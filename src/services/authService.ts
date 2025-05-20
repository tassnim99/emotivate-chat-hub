
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Mock API for authentication
const mockAuth = async (email: string, password: string): Promise<{ user: User; token: string }> => {
  // In a real app, this would be an actual API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Simulate successful authentication
  return {
    user: {
      id: '1',
      email,
      username: email.split('@')[0],
    },
    token: 'mock-jwt-token',
  };
};

// Mock API for registration
const mockRegister = async (
  username: string,
  email: string, 
  password: string
): Promise<{ user: User; token: string }> => {
  // In a real app, this would be an actual API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate successful registration
  return {
    user: {
      id: Date.now().toString(),
      email,
      username,
    },
    token: 'mock-jwt-token',
  };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { user, token } = await mockAuth(email, password);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Login failed:", error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      register: async (username, email, password) => {
        set({ isLoading: true });
        try {
          const { user, token } = await mockRegister(username, email, password);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("Registration failed:", error);
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: 'mindcare-auth-storage',
    }
  )
);
