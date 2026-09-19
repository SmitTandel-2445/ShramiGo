import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { storage, KEYS } from '@/lib/storage';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>('light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    storage.getItem(KEYS.THEME).then((saved) => {
      if (saved === 'dark' || saved === 'light') {
        setThemeState(saved);
      } else {
        setThemeState(systemColorScheme === 'dark' ? 'dark' : 'light');
      }
      setLoaded(true);
    });
  }, [systemColorScheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    storage.setItem(KEYS.THEME, newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const isDark = theme === 'dark';

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
