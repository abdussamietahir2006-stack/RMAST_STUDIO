import React, { useEffect, useRef, useState } from 'react';

interface LoopingVideoProps {
  src: string;
  poster?: string;
  className?: string;
  label: string;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Muted, looping showcase clip. Downloads nothing until it first scrolls into view, pauses when it
// leaves and resumes when it returns, so pages with several clips stay fast.
// Honors reduced-motion by showing the first frame without autoplaying.
export const LoopingVideo: React.FC<LoopingVideoProps> = ({ src, poster, className = '', label }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const visible = useRef(false);
  const [activated, setActivated] = useState(false);
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (typeof IntersectionObserver === 'undefined') {
      visible.current = true;
      setActivated(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          setActivated(true);
          // Only resumes here once the source is attached; the first play happens in the effect below
          if (video.currentSrc && !reducedMotion) video.play().catch(() => undefined);
        } else {
          video.pause();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.1 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src, reducedMotion]);

  // First play, after React has attached the src
  useEffect(() => {
    const video = ref.current;
    if (!activated || !video || reducedMotion || !visible.current) return;
    video.muted = true; // required for autoplay; React doesn't always reflect the muted attribute
    video.play().catch(() => undefined);
  }, [activated, reducedMotion, src]);

  return (
    <video
      ref={ref}
      key={src}
      src={activated ? src : undefined}
      poster={poster}
      muted
      loop
      playsInline
      preload={activated ? 'auto' : 'none'}
      aria-label={label}
      className={className}
    />
  );
};
