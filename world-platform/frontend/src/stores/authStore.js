import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api.js';
import { clearAuthStorage, writeAuthStorage } from '../lib/authStorage.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      login: async ({ email, password }) => {
        const data = await api.post('/auth/login', { email, password });
        set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        writeAuthStorage({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        return data;
      },

      register: async ({ email, username, password }) => {
        return api.post('/auth/register', { email, username, password });
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null });
        clearAuthStorage();
      },

      refreshTokens: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return;
        try {
          const data = await api.post('/auth/refresh-token', { refreshToken });
          set({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
          writeAuthStorage({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
        } catch {
          set({ user: null, accessToken: null, refreshToken: null });
          clearAuthStorage();
        }
      },

      setUser: (user) => set({ user }),
    }),
    { name: 'auth-storage', partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user }) }
  )
);
