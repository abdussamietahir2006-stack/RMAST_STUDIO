import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSiteContent } from '../lib/api';
import { MediaKind } from '../types';

type MediaMap = Record<string, { url: string; kind: MediaKind }>;

const SiteContentContext = createContext<MediaMap>({});

// Loads media chosen in the dashboard (team photos, videos). The page renders immediately with
// the built-in defaults and swaps in custom media once this small request returns.
export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [media, setMedia] = useState<MediaMap>({});

  useEffect(() => {
    let cancelled = false;
    fetchSiteContent()
      .then((res) => {
        if (!cancelled) setMedia(res.media ?? {});
      })
      .catch(() => {
        // Defaults stay in place if the API is unreachable
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <SiteContentContext.Provider value={media}>{children}</SiteContentContext.Provider>;
};

export function useMedia(key: string): { url: string; kind: MediaKind } | undefined {
  return useContext(SiteContentContext)[key];
}
