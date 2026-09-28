import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useMedia, useMediaLoaded } from '../../context/SiteContentContext';
import { HOME_INTRO_KEY } from '../../config/mediaSlots';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Runs fn once the page has finished loading and the browser is idle, so the video never
// competes with the first paint of the page
function afterPageLoad(fn: () => void): () => void {
  let cancelled = false;
  let idle = 0;
  const run = () => {
    if (cancelled) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) idle = w.requestIdleCallback(() => !cancelled && fn(), { timeout: 1200 });
    else idle = window.setTimeout(() => !cancelled && fn(), 300);
  };
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener('load', run);
    const w = window as Window & { cancelIdleCallback?: (id: number) => void };
    w.cancelIdleCallback?.(idle);
    clearTimeout(idle);
  };
}

// Studio introduction on the home page: plays on its own in a loop, with sound.
// Browsers only allow sound after the visitor has interacted with the page, so it starts muted
// when it must and turns the sound on at the visitor's first tap, click or key press anywhere.
// It loads after the page itself, so the site stays fast.
export const HomeIntroVideo: React.FC = () => {
  const intro = useMedia(HOME_INTRO_KEY);
  const mediaLoaded = useMediaLoaded();
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false); // src attached
  const [shown, setShown] = useState(false); // first frame ready (fades in, no black flash)
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  // Once the visitor mutes or pauses it themselves, it stays that way
  const userChoice = useRef(false);
  const reducedMotion = prefersReducedMotion();
  const url = intro?.kind === 'video' ? intro.url : undefined;
  const poster = intro?.kind === 'video' ? intro.poster : undefined;

  // Attach the video after the page has loaded (visitors who prefer less motion start it themselves)
  useEffect(() => {
    if (!url || reducedMotion) return;
    return afterPageLoad(() => setActive(true));
  }, [url, reducedMotion]);

  // Start playing: with sound if the browser allows it, otherwise muted until the first interaction
  useEffect(() => {
    const video = ref.current;
    if (!active || !video) return;
    let cancelled = false;
    video.muted = false;
    video
      .play()
      .then(() => !cancelled && setMuted(false))
      .catch(() => {
        if (cancelled) return;
        video.muted = true;
        setMuted(true);
        video.play().catch(() => setPaused(true));
      });
    return () => {
      cancelled = true;
    };
  }, [active, url]);

  // The visitor's first interaction anywhere on the page turns the sound on
  useEffect(() => {
    if (!active || !muted) return;
    const unmute = (e: Event) => {
      const video = ref.current;
      // A tap on the video's own controls is handled by those buttons
      if (!video || userChoice.current || (e.target instanceof Element && e.target.closest('[data-intro-control]'))) return;
      video.muted = false;
      setMuted(false);
      video.play().catch(() => undefined);
      setPaused(false);
    };
    const events = ['pointerdown', 'keydown', 'touchstart'] as const;
    events.forEach((ev) => window.addEventListener(ev, unmute, { once: true, passive: true }));
    return () => events.forEach((ev) => window.removeEventListener(ev, unmute));
  }, [active, muted]);

  // Muted and off-screen, nobody sees or hears it: pause to save battery; resume when back
  useEffect(() => {
    const video = ref.current;
    if (!active || !video || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => {
      if (userChoice.current && video.paused) return;
      if (entry.isIntersecting) video.play().catch(() => undefined);
      else if (video.muted) video.pause();
    });
    io.observe(video);
    return () => io.disconnect();
  }, [active]);

  const toggleSound = () => {
    const video = ref.current;
    if (!video) return;
    userChoice.current = true;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (video.paused) video.play().catch(() => undefined);
  };

  const togglePlay = () => {
    const video = ref.current;
    if (!video) return;
    if (!active) {
      setActive(true); // reduced-motion visitors start it here
      return;
    }
    userChoice.current = true;
    if (video.paused) {
      video.play().catch(() => undefined);
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  // Still finding out which video to show: a quiet placeholder, never "coming soon"
  if (!url && !mediaLoaded) {
    return (
      <div className="relative w-full aspect-video overflow-hidden rounded-sm border border-line-strong bg-gradient-to-br from-surface-2 via-surface to-surface-2 shadow-2xl animate-pulse" />
    );
  }

  if (!url) {
    return (
      <div className="relative w-full aspect-video overflow-hidden rounded-sm border border-line-strong bg-surface shadow-2xl">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-surface-2 via-surface to-surface-2">
          <span className="w-16 h-16 rounded-full border border-primary/50 text-brand flex items-center justify-center">
            <Play className="w-6 h-6 ml-1" />
          </span>
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted">Studio introduction · Coming soon</span>
        </div>
      </div>
    );
  }

  const buttonClass =
    'w-10 h-10 rounded-full bg-black/55 text-white border border-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-black/75 transition-colors cursor-pointer';

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-sm border border-line-strong bg-gradient-to-br from-surface-2 via-surface to-surface-2 shadow-2xl">
      <video
        ref={ref}
        src={url}
        poster={poster}
        loop
        playsInline
        // Before the page has loaded: only the poster, or just enough of the file for its first frame
        preload={active ? 'auto' : poster ? 'none' : 'metadata'}
        disableRemotePlayback
        aria-label="Introduction to RMAST Studio"
        onLoadedData={() => setShown(true)}
        onPlay={() => setPaused(false)}
        className={`absolute inset-0 w-full h-full object-cover bg-black transition-opacity duration-500 ${shown || poster ? 'opacity-100' : 'opacity-0'}`}
      />

      {!active && reducedMotion && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer"
          aria-label="Play the RMAST Studio introduction video"
        >
          <span className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg">
            <Play className="w-6 h-6 ml-1 fill-current" />
          </span>
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-fg">Watch: What is RMAST</span>
        </button>
      )}

      {active && (
        <>
          {muted && !userChoice.current && shown && (
            <button
              type="button"
              data-intro-control
              onClick={toggleSound}
              className="btn btn-secondary absolute left-3 bottom-3 inline-flex items-center gap-2 bg-black/60 text-white border-white/15 backdrop-blur-sm cursor-pointer hover:bg-black/80"
            >
              <Volume2 className="w-4 h-4" />
              Tap for sound
            </button>
          )}
          <div className="absolute right-3 bottom-3 flex gap-2" data-intro-control>
            <button type="button" onClick={togglePlay} className={buttonClass} aria-label={paused ? 'Play the video' : 'Pause the video'}>
              {paused ? <Play className="w-4 h-4 ml-1 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>
            <button type="button" onClick={toggleSound} className={buttonClass} aria-label={muted ? 'Turn the sound on' : 'Turn the sound off'}>
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
