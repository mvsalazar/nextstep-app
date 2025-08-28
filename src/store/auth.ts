import { create } from 'zustand';
import { apiClient } from '@/adapters/api/client';
import * as authApi from '@/adapters/api/auth';

type AuthState = {
  token: string | null;
  user: authApi.AuthUser | null;
  loading: boolean;
  error: string | null;
};

type AuthActions = {
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: authApi.AuthUser | null) => void;
};

const TOKEN_KEY = 'nextstep:authToken';

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  token: null,
  user: null,
  loading: false,
  error: null,

  initialize: async () => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      set({ token: saved });
      apiClient.setToken(saved);
      try {
        const me = await authApi.getMe();
        set({ user: me, error: null });
      } catch (e: any) {
        set({ error: e?.message || 'Failed to load user', token: null, user: null });
        localStorage.removeItem(TOKEN_KEY);
        apiClient.setToken('');
      }
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await authApi.login({ email, password });
      localStorage.setItem(TOKEN_KEY, token);
      apiClient.setToken(token);
      set({ token, user, loading: false });
    } catch (e: any) {
      set({ error: e?.message || 'Login failed', loading: false });
    }
  },

  signup: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await authApi.signup({ email, password, name });
      localStorage.setItem(TOKEN_KEY, token);
      apiClient.setToken(token);
      set({ token, user, loading: false });
    } catch (e: any) {
      set({ error: e?.message || 'Signup failed', loading: false });
    }
  },

  logout: async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    localStorage.removeItem(TOKEN_KEY);
    apiClient.setToken('');
    set({ token: null, user: null, error: null });
  },

  setUser: (user) => set({ user }),
}));

