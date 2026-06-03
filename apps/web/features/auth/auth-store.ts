import { create } from 'zustand';
import { setAccessToken } from '@/features/lib/api-client';
import type { User } from './types';

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setSession: (payload: { user: User; accessToken: string }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setSession: ({ user, accessToken }) => {
    setAccessToken(accessToken);

    set({
      user,
      accessToken,
      isAuthenticated: true,
    });
  },

  clearSession: () => {
    setAccessToken(null);

    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
  },
}));
