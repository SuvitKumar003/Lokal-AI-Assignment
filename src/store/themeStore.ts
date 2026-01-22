import { create } from 'zustand';
import { storageService } from '../services/storageService';

interface ThemeState {
  isDark: boolean;
  isLoading: boolean;
  toggleTheme: () => void;
  initializeTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,
  isLoading: true,

  initializeTheme: async () => {
    try {
      const theme = await storageService.getTheme();
      set({ isDark: theme, isLoading: false });
    } catch (error) {
      console.error('Error loading theme:', error);
      set({ isLoading: false });
    }
  },

  toggleTheme: () => set((state) => {
    const newTheme = !state.isDark;
    storageService.saveTheme(newTheme);
    return { isDark: newTheme };
  }),
}));