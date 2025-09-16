import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Theme } from '../utils/themeUtils';
import { getStoredTheme, setStoredTheme, getSystemTheme } from '../utils/themeUtils';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeValue] = useState<Theme>(() => getStoredTheme());
  const [systemIsDark, setSystemIsDark] = useState(() => getSystemTheme());

  // Calculate if dark mode should be active
  const isDark = theme === 'dark' || (theme === 'system' && systemIsDark);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemIsDark(e.matches);
    };

    // Use modern addEventListener API
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update DOM classes when theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#1f2937' : '#ffffff');
    }
  }, [isDark]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeValue(newTheme);
    setStoredTheme(newTheme);
    
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('themeChange', { 
      detail: { theme: newTheme, isDark: newTheme === 'dark' || (newTheme === 'system' && systemIsDark) } 
    }));
  }, [systemIsDark]);

  const toggleTheme = useCallback(() => {
    if (theme === 'system') {
      setTheme(systemIsDark ? 'light' : 'dark');
    } else {
      setTheme(theme === 'light' ? 'dark' : 'light');
    }
  }, [theme, systemIsDark, setTheme]);

  const value = useMemo(() => ({
    theme,
    isDark,
    setTheme,
    toggleTheme,
  }), [theme, isDark, setTheme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};