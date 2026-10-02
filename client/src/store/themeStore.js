import { create } from 'zustand';

export const useThemeStore = create((set, get) => ({
  theme: 'light', // default to light theme as requested by user

  initTheme: () => {
    if (typeof window === 'undefined') return;

    // Check localStorage or system preference, default to light
    const savedTheme = localStorage.getItem('campusresolve_theme');
    const initialTheme = savedTheme || 'light';

    set({ theme: initialTheme });

    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggleTheme: () => {
    const current = get().theme;
    const nextTheme = current === 'dark' ? 'light' : 'dark';

    localStorage.setItem('campusresolve_theme', nextTheme);
    set({ theme: nextTheme });

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setTheme: (newTheme) => {
    localStorage.setItem('campusresolve_theme', newTheme);
    set({ theme: newTheme });

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}));
