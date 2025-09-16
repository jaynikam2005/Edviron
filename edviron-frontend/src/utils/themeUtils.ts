import { useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'edviron-theme';

export const getStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  return 'system';
};

export const setStoredTheme = (theme: Theme): void => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
};

export const getSystemTheme = (): boolean => {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (error) {
    console.warn('Failed to detect system theme:', error);
    return false;
  }
};

// Hook for components that need to react to theme changes
export const useThemeListener = (callback: (isDark: boolean) => void) => {
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      callback(event.detail.isDark);
    };

    window.addEventListener('themeChange', handleThemeChange as EventListener);
    return () => window.removeEventListener('themeChange', handleThemeChange as EventListener);
  }, [callback]);
};