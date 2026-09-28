import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'rmast_studio_theme_v2';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Starts dark so the first render matches the prerendered HTML; the real theme is applied right after
  // (public/theme-init.js has already set it on <html> before the first paint)
  const [theme, setThemeState] = useState<Theme>('dark');
  // A choice made with the toggle is remembered; until then the site follows the operating system
  const chosen = useRef(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // Storage unavailable: follow the system
    }
    if (saved === 'light' || saved === 'dark') {
      chosen.current = true;
      setThemeState(saved);
      return;
    }
    const system = window.matchMedia?.('(prefers-color-scheme: light)');
    if (!system) return;
    setThemeState(system.matches ? 'light' : 'dark');
    const follow = (e: MediaQueryListEvent) => {
      if (!chosen.current) setThemeState(e.matches ? 'light' : 'dark');
    };
    system.addEventListener('change', follow);
    return () => system.removeEventListener('change', follow);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark', 'dark');
    } else {
      root.classList.add('theme-dark', 'dark');
      root.classList.remove('theme-light');
    }
  }, [theme]);

  const setTheme = (next: Theme) => {
    chosen.current = true;
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage unavailable: the choice lasts for this visit
    }
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

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
