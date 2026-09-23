import React, { createContext, useContext, useState, useEffect } from 'react';

interface NavigationContextType {
  currentPath: string; // pathname only, e.g. "/pricing"
  search: string; // query string including "?", e.g. "?division=ai-content", or ""
  navigate: (path: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode; initialPath?: string }> = ({
  children,
  initialPath
}) => {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    initialPath ?? (typeof window !== 'undefined' ? window.location.pathname || '/' : '/')
  );
  // Starts empty so the first render matches the prerendered HTML; the real query is read right after
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    setSearch(window.location.search);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      setSearch(window.location.search);
      window.scrollTo({ top: 0, behavior: 'instant' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (typeof window === 'undefined') return;
    const url = new URL(path, window.location.origin);

    if (url.pathname === currentPath && url.search === search) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    window.history.pushState({}, '', url.pathname + url.search + url.hash);
    setCurrentPath(url.pathname);
    setSearch(url.search);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <NavigationContext.Provider value={{ currentPath, search, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
};

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

// Reads a single query parameter from the current URL, e.g. useQueryParam('division')
export function useQueryParam(name: string): string | null {
  const { search } = useNavigation();
  return new URLSearchParams(search).get(name);
}
