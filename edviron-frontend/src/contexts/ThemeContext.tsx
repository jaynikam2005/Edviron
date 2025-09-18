import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export type ThemeName = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: ThemeName;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: ThemeName) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
      return (stored as ThemeName) || 'light';
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
      if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } catch (err) {
      console.error('Failed to persist theme', err);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        setThemeState((t) => (t === 'system' ? 'system' : t));
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

  const setTheme = useCallback((t: ThemeName) => setThemeState(t), []);

  const toggleTheme = useCallback(() => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')), []);

  const value = useMemo(() => ({ theme, isDark, toggleTheme, setTheme }), [theme, isDark, toggleTheme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};