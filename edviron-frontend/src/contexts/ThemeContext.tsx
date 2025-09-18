import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ThemeName } from '../types/theme';
import { ThemeContext } from './ThemeContextDefinition';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeName>(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        return stored as ThemeName;
      }
      return 'light'; // Default to light theme
    } catch {
      return 'light';
    }
  });

  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = theme === 'dark' || (theme === 'system' && prefersDark);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('theme', theme);
      const root = document.documentElement;
      const body = document.body;
      
      // Remove existing dark class first from both elements
      root.classList.remove('dark');
      body.classList.remove('dark');
      
      // Add dark class if needed to both elements
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
        body.classList.add('dark');
      }
      
      // Apply theme attributes for better CSS targeting
      root.setAttribute('data-theme', theme);
      body.setAttribute('data-theme', theme);
      
    } catch (err) {
      console.error('Failed to persist theme', err);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        setTheme((t) => (t === 'system' ? 'system' : t));
      }
    };

    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', handler as EventListener);
      return () => mq.removeEventListener('change', handler as EventListener);
    }

    const legacy = mq as unknown as { addListener?: (h: (e: MediaQueryListEvent) => void) => void; removeListener?: (h: (e: MediaQueryListEvent) => void) => void };
    if (typeof legacy.addListener === 'function') {
      legacy.addListener(handler);
      return () => legacy.removeListener?.(handler);
    }

    return undefined;
  }, [theme]);

  const setThemeValue = useCallback((t: ThemeName) => setTheme(t), []);

  const toggleTheme = useCallback(() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo(() => ({ theme, isDark, toggleTheme, setTheme: setThemeValue }), [theme, isDark, toggleTheme, setThemeValue]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};