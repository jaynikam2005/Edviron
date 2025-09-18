export type ThemeName = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: ThemeName;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: ThemeName) => void;
}