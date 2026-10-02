import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Initialize auth state from localStorage
  initAuth: async () => {
    if (typeof window === 'undefined') return;

    try {
      const storedToken = localStorage.getItem('campusresolve_token');
      const storedUser = localStorage.getItem('campusresolve_user');

      if (storedToken && storedUser) {
        set({
          token: storedToken,
          user: JSON.parse(storedUser),
          isAuthenticated: true,
          isLoading: false
        });

        // Verify token freshness against backend
        try {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.data) {
            set({ user: res.data.data });
            localStorage.setItem('campusresolve_user', JSON.stringify(res.data.data));
          }
        } catch (err) {
          // If 401, interceptor or here can clear
          if (err.response?.status === 401) {
            get().logout();
          }
        }
      } else {
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      console.error('Failed to init auth:', e);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;

      localStorage.setItem('campusresolve_token', token);
      localStorage.setItem('campusresolve_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Login failed. Please check your credentials.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', userData);
      const { user, token } = res.data.data;

      localStorage.setItem('campusresolve_token', token);
      localStorage.setItem('campusresolve_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });

      return { success: true, user };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        'Registration failed. Please check your details.';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('campusresolve_token');
      localStorage.removeItem('campusresolve_user');
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  },

  clearError: () => set({ error: null })
}));
