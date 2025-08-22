import { LocalStorage } from './local-storage';

export type Theme = 'light' | 'dark';

export const ThemeUtils = {
  /**
   * Get the current theme from localStorage or system preference
   */
  getInitialTheme(): Theme {
    // First check localStorage
    const savedTheme = LocalStorage.get<Theme>('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    // Fall back to system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    }

    return 'light';
  },

  /**
   * Save theme to localStorage
   */
  saveTheme(theme: Theme): void {
    LocalStorage.set('theme', theme);
  },

  /**
   * Apply theme to document
   */
  applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  },

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(currentTheme: Theme): Theme {
    return currentTheme === 'light' ? 'dark' : 'light';
  },

  /**
   * Listen for system theme changes
   */
  watchSystemTheme(callback: (theme: Theme) => void): () => void {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return () => {};
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = (e: MediaQueryListEvent) => {
      // Only update if no theme is saved in localStorage
      const savedTheme = LocalStorage.get<Theme>('theme');
      if (!savedTheme) {
        callback(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handler);
    
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }
};
