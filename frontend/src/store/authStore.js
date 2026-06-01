import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api.js';
import { signInWithGoogle, signOutUser, auth } from '../lib/firebase.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:    null,
      token:   null,
      isLoading: false,
      isInitialized: false,

      setUser: (user) => set({ user }),
      setToken: (token) => {
        set({ token });
        if (token) localStorage.setItem('eventhub_token', token);
        else localStorage.removeItem('eventhub_token');
      },

      loginWithEmail: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await api.post('/auth/login', { email, password });
          set({ user: data.user, token: data.token });
          localStorage.setItem('eventhub_token', data.token);
          return data;
        } finally { set({ isLoading: false }); }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const data = await api.post('/auth/register', formData);
          set({ user: data.user, token: data.token });
          localStorage.setItem('eventhub_token', data.token);
          return data;
        } finally { set({ isLoading: false }); }
      },

      loginWithGoogle: async (role = 'attendee') => {
        set({ isLoading: true });
        try {
          const result = await signInWithGoogle();
          const idToken = await result.user.getIdToken();
          const data = await api.post('/auth/firebase', { idToken, role });
          set({ user: data.user, token: data.token });
          localStorage.setItem('eventhub_token', data.token);
          return data;
        } finally { set({ isLoading: false }); }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
          await signOutUser();
        } catch { /* always clear */ } finally {
          set({ user: null, token: null });
          localStorage.removeItem('eventhub_token');
        }
      },

      fetchMe: async () => {
        try {
          const data = await api.get('/auth/me');
          set({ user: data.user });
          return data.user;
        } catch { return null; }
      },

      updateProfile: async (updates) => {
        const data = await api.patch('/auth/me', updates);
        set({ user: data.user });
        return data.user;
      },

      initialize: async () => {
        // Always resolve immediately so the app renders even if backend is cold-starting
        set({ isInitialized: true });
        const token = localStorage.getItem('eventhub_token');
        if (token) {
          try {
            const data = await api.get('/auth/me');
            set({ user: data.user, token });
          } catch {
            set({ user: null, token: null });
            localStorage.removeItem('eventhub_token');
          }
        }
      },

      isAuthenticated: () => !!get().user,
      hasRole: (role) => get().user?.role === role,
      isOrganizer: () => ['organizer', 'admin'].includes(get().user?.role),
      isAdmin: () => get().user?.role === 'admin',
      isStaff: () => ['staff', 'admin'].includes(get().user?.role),
    }),
    { name: 'eventhub-auth', partialize: (state) => ({ user: state.user, token: state.token }) }
  )
);
