'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  fullName: string;
  avatarUrl?: string;
  city?: string;
  averageRating: number;
  isVerified: boolean;
  bio?: string;
  phone?: string;
  address?: string;
  country?: string;
  skills?: string[];
  portfolioLinks?: string[];
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'SELLER' | 'SERVICE_PROVIDER' | 'ADMIN' | 'SUPER_ADMIN';
  isEmailVerified: boolean;
  profile: UserProfile | null;
  viewsCount?: number;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  setUser: (user: AuthUser) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user, accessToken) => {
        if (typeof window !== 'undefined') localStorage.setItem('accessToken', accessToken);
        set({ user, accessToken, isAuthenticated: true });
      },
      clearAuth: () => {
        if (typeof window !== 'undefined') localStorage.removeItem('accessToken');
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'localhub-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, isAuthenticated: state.isAuthenticated }),
    }
  )
);
