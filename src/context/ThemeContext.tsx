import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'rmast_studio_theme_v2';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always start dark so the first render matches the prerendered HTML; a saved choice is applied right after
  const [theme, setThemeState] = useState<Theme>('dark');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') setThemeState(saved);
    } catch {
      // Storage unavailable: keep the default
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark', 'dark');
      root.style.colorScheme = 'light';
    } else {
      root.classList.add('theme-dark', 'dark');
      root.classList.remove('theme-light');
      root.style.colorScheme = 'dark';
    }

    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      console.error('Failed to save theme in localStorage', e);
    }
  }, [theme, loaded]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
