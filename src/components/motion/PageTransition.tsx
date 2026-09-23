import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';

const EASE = [0.22, 1, 0.36, 1] as const;

// Fades the old page out and the new one in, with a gold progress bar across the top.
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
            className="fixed top-0 left-0 right-0 h-[2px] z-[70] origin-left bg-gradient-to-r from-[#C9A96E] via-[#F0D9A8] to-[#C9A96E] shadow-[0_0_12px_rgba(201,169,110,0.8)]"
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
        <m.div
          key={routeKey}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: EASE }}
        >
          {children}
        </m.div>
      </AnimatePresence>
    </>
  );
};
