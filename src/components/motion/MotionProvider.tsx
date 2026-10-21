import React from 'react';
import { LazyMotion } from 'motion/react';

// Animation features are downloaded separately after the page has loaded, so motion never
// delays the first paint. Components use the lightweight `m.*` elements from 'motion/react'.
const loadFeatures = () => import('./motionFeatures').then((mod) => mod.default);

export const MotionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <LazyMotion features={loadFeatures} strict>
    {children}
  </LazyMotion>
);
