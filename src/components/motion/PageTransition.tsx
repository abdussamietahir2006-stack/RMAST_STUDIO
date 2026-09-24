import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

// The old page tips back into the distance and the new one swings up into place in 3D,
// with an aurora progress bar across the top.
// The first render is not animated, so prerendered HTML is shown as-is (no flash, no hidden content).
export const PageTransition: React.FC<{ routeKey: string; children: React.ReactNode }> = ({ routeKey, children }) => {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setLoadingKey(routeKey);
    const t = window.setTimeout(() => setLoadingKey(null), 700);
    return () => window.clearTimeout(t);
  }, [routeKey]);

  return (
    <>
      <AnimatePresence>
        {loadingKey && (
          <m.div
            key={loadingKey}
            aria-hidden="true"
            className="fixed top-0 left-0 right-0 h-[3px] z-[70] origin-left bg-gradient-to-r from-[#A68BFF] via-[#FF5CAA] to-[#3DDCFF] shadow-[0_0_18px_rgba(255,92,170,0.9)]"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        )}
      </AnimatePresence>

      {/* Depth for the page swing; nothing inside a page is position: fixed, so this is safe */}
      <div style={{ perspective: 1400 }}>
        <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
          <m.div
            key={routeKey}
            style={{ transformOrigin: '50% 0%' }}
            initial={{ opacity: 0, y: 60, rotateX: 12, scale: 0.96, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1, filter: 'blur(0px)', transitionEnd: { filter: 'none' } }}
            exit={{ opacity: 0, y: -30, rotateX: -6, scale: 0.97, filter: 'blur(6px)' }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            {children}
          </m.div>
        </AnimatePresence>
      </div>
    </>
  );
};
