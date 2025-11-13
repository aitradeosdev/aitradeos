import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from './AuthContext';

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  buy: string;
  sell: string;
  hold: string;
  accent: string;
}

const lightTheme: Theme = {
  primary: '#00D4FF',
  secondary: '#0099CC',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  buy: '#4CAF50',
  sell: '#F44336',
  hold: '#FF9800',
  accent: '#00A8CC'
};

const darkTheme: Theme = {
  primary: '#00D4FF',
  secondary: '#0099CC',
  background: '#000000',
  surface: '#1A1A1A',
  card: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  border: '#333333',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  buy: '#4CAF50',
  sell: '#F44336',
  hold: '#FF9800',
  accent: '#00A8CC'
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  themeMode: 'light' | 'dark' | 'auto';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { user, updateSettings } = useAuth();
  
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('dark');
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (user?.settings?.theme) {
      const userTheme = user.settings.theme === 'light' ? 'light' : 'dark';
      setThemeMode(userTheme);
      setIsDark(userTheme === 'dark');
    } else {
      setThemeMode('auto');
      setIsDark(systemColorScheme === 'dark');
    }
  }, [user?.settings?.theme, systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = isDark ? 'light' : 'dark';
    setThemeMode(newTheme);
    setIsDark(!isDark);
    
    if (user) {
      try {
        await updateSettings({ theme: newTheme });
      } catch (error) {
        console.error('Failed to update theme setting:', error);
      }
    }
  };

  const setTheme = async (theme: 'light' | 'dark' | 'auto') => {
    setThemeMode(theme);
    
    if (theme === 'auto') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(theme === 'dark');
    }

    if (user && theme !== 'auto') {
      try {
        await updateSettings({ theme });
      } catch (error) {
        console.error('Failed to update theme setting:', error);
      }
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    themeMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};