import { useEffect } from 'react';
import { useAppDispatch, useAppState } from '../../context/app-state-hooks';
import { ThemeUtils, type Theme } from '../../utils/theme';

export const useTheme = () => {
  const { theme } = useAppState();
  const dispatch = useAppDispatch();

  // Initialize theme on mount
  useEffect(() => {
    const initialTheme = ThemeUtils.getInitialTheme();
    
    // Update state if different from initial
    if (theme !== initialTheme) {
      dispatch({ type: 'SET_THEME', payload: initialTheme });
    }
    
    // Apply theme to document
    ThemeUtils.applyTheme(initialTheme);
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    ThemeUtils.applyTheme(theme);
    ThemeUtils.saveTheme(theme);
  }, [theme]);

  // Watch for system theme changes
  useEffect(() => {
    const cleanup = ThemeUtils.watchSystemTheme((systemTheme) => {
      dispatch({ type: 'SET_THEME', payload: systemTheme });
    });

    return cleanup;
  }, [dispatch]);

  const toggleTheme = () => {
    const newTheme = ThemeUtils.toggleTheme(theme);
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  const setTheme = (newTheme: Theme) => {
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };
};
