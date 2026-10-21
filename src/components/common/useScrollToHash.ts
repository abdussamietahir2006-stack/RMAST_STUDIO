import { useEffect } from 'react';

// Arriving on a page with a #section in the URL: scroll to it once the page has swung into place
// (the page transition scrolls to the top first)
export function useScrollToHash(): void {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 650);
    return () => window.clearTimeout(t);
  }, []);
}
