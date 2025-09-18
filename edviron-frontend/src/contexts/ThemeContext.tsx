import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { ThemeName, FinanceColors } from '../types/theme';
import { ThemeContext } from './ThemeContextDefinition';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeName>(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('edviron-theme') : null;
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
      localStorage.setItem('edviron-theme', theme);
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
      
      // Apply finance dashboard background
      if (isDark) {
        body.style.backgroundColor = '#111827';
      } else {
        body.style.backgroundColor = '#F9FAFB';
      }
      
    } catch (err) {
      console.error('Failed to persist theme', err);
    }
  }, [theme, isDark]);

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

  // Finance dashboard specific helper functions
  const getFinanceColors = useCallback((): FinanceColors => {
    if (isDark) {
      return {
        bg: '#111827',
        card: '#1F2937',
        primary: '#3B82F6',
        secondary: '#22C55E',
        danger: '#F87171',
        textPrimary: '#F9FAFB',
        textSecondary: '#9CA3AF',
      };
    } else {
      return {
        bg: '#F9FAFB',
        card: '#FFFFFF',
        primary: '#2563EB',
        secondary: '#16A34A',
        danger: '#DC2626',
        textPrimary: '#111827',
        textSecondary: '#4B5563',
      };
    }
  }, [isDark]);

  const getStatusColor = useCallback((status: 'success' | 'failed' | 'pending' | 'warning') => {
    const colors = {
      success: isDark ? '#22C55E' : '#16A34A',
      failed: isDark ? '#F87171' : '#DC2626',
      pending: isDark ? '#F59E0B' : '#D97706',
      warning: isDark ? '#F59E0B' : '#D97706',
    };
    return colors[status];
  }, [isDark]);

  const getCardClasses = useCallback(() => {
    return 'bg-white dark:bg-gray-800 shadow-finance-light dark:shadow-finance-dark border border-gray-200 dark:border-gray-700 rounded-lg';
  }, []);

  const getBackgroundClasses = useCallback(() => {
    return 'bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-300';
  }, []);

  const getTextClasses = useCallback((variant: 'primary' | 'secondary' = 'primary') => {
    if (variant === 'secondary') {
      return 'text-gray-600 dark:text-gray-400';
    }
    return 'text-gray-900 dark:text-gray-100';
  }, []);

  const getButtonClasses = useCallback((variant: 'primary' | 'secondary' | 'danger' = 'primary') => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ultra-smooth-button';
    
    const variantClasses = {
      primary: 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white focus:ring-blue-500 shadow-md hover:shadow-lg',
      secondary: 'bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-600 text-white focus:ring-green-500 shadow-md hover:shadow-lg',
      danger: 'bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-600 text-white focus:ring-red-500 shadow-md hover:shadow-lg',
    };
    
    return `${baseClasses} ${variantClasses[variant]}`;
  }, []);

  const value = useMemo(() => ({ 
    theme, 
    isDark, 
    toggleTheme, 
    setTheme: setThemeValue,
    getFinanceColors,
    getStatusColor,
    getCardClasses,
    getBackgroundClasses,
    getTextClasses,
    getButtonClasses,
  }), [theme, isDark, toggleTheme, setThemeValue, getFinanceColors, getStatusColor, getCardClasses, getBackgroundClasses, getTextClasses, getButtonClasses]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};