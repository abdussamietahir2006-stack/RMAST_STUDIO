import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSiteContent } from '../lib/api';
import { MediaKind } from '../types';

type MediaEntry = { url: string; kind: MediaKind; poster?: string };
type MediaMap = Record<string, MediaEntry>;

// loaded: the dashboard's media is known (from the server, or this visitor's last visit)
const SiteContentContext = createContext<{ media: MediaMap; loaded: boolean }>({ media: {}, loaded: false });

const CACHE_KEY = 'rmast-media-v1';

// Loads media chosen in the dashboard (team photos, videos). The page renders immediately with
// the built-in defaults and swaps in custom media once this small request returns. Returning
// visitors get their last copy straight away (kept only in their own browser).
export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{ media: MediaMap; loaded: boolean }>({ media: {}, loaded: false });

  useEffect(() => {
    let cancelled = false;
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setState({ media: JSON.parse(cached) as MediaMap, loaded: true });
    } catch {
      // No storage (private mode): wait for the server
    }
    fetchSiteContent()
      .then((res) => {
        if (cancelled) return;
        const media = res.media ?? {};
        setState({ media, loaded: true });
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(media));
        } catch {
          // Storage full or blocked: nothing to do
        }
      })
      .catch(() => {
        // Defaults stay in place if the API is unreachable
        if (!cancelled) setState((s) => ({ ...s, loaded: true }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return <SiteContentContext.Provider value={state}>{children}</SiteContentContext.Provider>;
};

export function useMedia(key: string): MediaEntry | undefined {
  return useContext(SiteContentContext).media[key];
}

// Whether the dashboard's media has arrived yet (so "not uploaded" can be told apart from "loading")
export function useMediaLoaded(): boolean {
  return useContext(SiteContentContext).loaded;
}
