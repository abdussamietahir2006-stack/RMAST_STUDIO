import React, { useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { useMedia } from '../../context/SiteContentContext';
import { HOME_INTRO_KEY } from '../../config/mediaSlots';

// Studio introduction on the home page. Nothing is downloaded until the visitor presses play.
export const HomeIntroVideo: React.FC = () => {
  const intro = useMedia(HOME_INTRO_KEY);
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);

  const start = () => {
    setStarted(true);
    // Play on the next frame, once the src is attached
    requestAnimationFrame(() => ref.current?.play().catch(() => undefined));
  };

  return (
    <div className="relative w-full aspect-video overflow-hidden rounded-sm border border-[#2A2F42] bg-[#0B0E17] shadow-2xl group">
      {intro?.kind === 'video' ? (
        <>
          <video
            ref={ref}
            src={started ? intro.url : undefined}
            controls={started}
            playsInline
            preload="none"
            aria-label="Introduction to RMAST Studio"
            className="w-full h-full object-cover bg-black"
          />
          {!started && (
            <button
              type="button"
              onClick={start}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#12162A] via-[#0B0E17] to-[#1A1030] cursor-pointer"
              aria-label="Play the RMAST Studio introduction video"
            >
              <span className="w-16 h-16 rounded-full bg-[#A68BFF] text-[#0A0A0C] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-6 h-6 ml-1 fill-current" />
              </span>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#E8E6E1]">Watch: What is RMAST</span>
            </button>
          )}
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#12162A] via-[#0B0E17] to-[#1A1030]">
          <span className="w-16 h-16 rounded-full border border-[#A68BFF]/50 text-[#A68BFF] flex items-center justify-center">
            <Play className="w-6 h-6 ml-1" />
          </span>
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">Studio introduction · Coming soon</span>
        </div>
      )}
    </div>
  );
};
