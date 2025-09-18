export type ThemeName = 'light' | 'dark' | 'system';

export interface FinanceColors {
  bg: string;
  card: string;
  primary: string;
  secondary: string;
  danger: string;
  textPrimary: string;
  textSecondary: string;
}

export interface ThemeContextType {
  theme: ThemeName;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (t: ThemeName) => void;
  // Finance dashboard specific methods and properties
  getFinanceColors: () => FinanceColors;
  getStatusColor: (status: 'success' | 'failed' | 'pending' | 'warning') => string;
  getCardClasses: () => string;
  getBackgroundClasses: () => string;
  getTextClasses: (variant?: 'primary' | 'secondary') => string;
  getButtonClasses: (variant?: 'primary' | 'secondary' | 'danger') => string;
}