import React, { useMemo } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { AuroraCanvas } from '../motion/AuroraCanvas';

interface BackgroundConfig {
  imageUrl: string;
  sessionTitle: string;
  contextTag: string;
  locationTag: string;
}

export const PageBackground: React.FC = () => {
  const { currentPath } = useNavigation();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const backgroundConfig: BackgroundConfig = useMemo(() => {
    if (currentPath.startsWith('/services/')) {
      return {
        imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1920&q=70',
        sessionTitle: 'Engineering War Room · Systems Deployment',
        contextTag: 'ACTIVE ARCHITECTURE',
        locationTag: 'RMAST Studio · Station 04'
      };
    }

    if (currentPath.startsWith('/ai-content/')) {
      return {
        imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1920&q=70',
        sessionTitle: 'Cinematic AI Editing & Color Suite',
        contextTag: 'CREATIVE PRODUCTION',
        locationTag: 'Studio Media Lab · Room B'
      };
    }

    switch (currentPath) {
      case '/about':
        return {
          imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1920&q=70',
          sessionTitle: 'Executive Boardroom · Founder Strategy & Direction',
          contextTag: 'LEADERSHIP IN SESSION',
          locationTag: 'Founders Suite'
        };

      case '/services':
        return {
          imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=70',
          sessionTitle: 'Systems Architecture & Technical Sprint Review',
          contextTag: 'FULL-STACK SPRINT',
          locationTag: 'Engineering Central'
        };

      case '/real-estate':
        return {
          imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1920&q=70',
          sessionTitle: 'Real Estate Systems & Transaction Flow Meeting',
          contextTag: 'BROKERAGE STRATEGY',
          locationTag: 'Executive Meeting Room'
        };

      case '/ai-content':
        return {
          imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1920&q=70',
          sessionTitle: 'AI Creative Direction & Campaign Review',
          contextTag: 'VISUAL ARTS COLLABORATION',
          locationTag: 'AI Creative Suite'
        };

      case '/pricing':
        return {
          imageUrl: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1920&q=70',
          sessionTitle: 'Commercial Scoping & Proposal Architecture',
          contextTag: 'TRANSPARENT VALUE AUDIT',
          locationTag: 'Client Strategy Suite'
        };

      case '/process':
        return {
          imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1920&q=70',
          sessionTitle: 'Sprint Architecture & Workflow Mapping Session',
          contextTag: 'METHODOLOGY IN ACTION',
          locationTag: 'Sprint Workshop 01'
        };

      case '/work':
      case '/case-studies':
        return {
          imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1920&q=70',
          sessionTitle: 'Deliverables Audit & Performance Review Meeting',
          contextTag: 'DELIVERY ASSURANCE',
          locationTag: 'Studio Presentation Lab'
        };

      case '/contact':
        return {
          imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1920&q=70',
          sessionTitle: 'Private Discovery Consultation & Client Welcome',
          contextTag: 'DIRECT FOUNDER MEETING',
          locationTag: 'Private Consultation Room'
        };

      case '/':
      default:
        return {
          imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1920&q=70',
          sessionTitle: 'Studio Floor · Collaborative Engineering & Team Working',
          contextTag: 'STUDIO IN SESSION',
          locationTag: 'RMAST Studio Headquarters'
        };
    }
  }, [currentPath]);

  // Dark mode is the plain canvas colour across the whole site: no photo, tints, grid or vignette
  if (!isLight) {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-canvas">
        {currentPath === '/' && <AuroraCanvas showOrb light={false} />}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none transition-colors duration-700">
      {/* 1. Underlying Team Working & Meeting Image Layer (Preserved across both modes) */}
      <img
        key={backgroundConfig.imageUrl}
        src={backgroundConfig.imageUrl}
        alt=""
        aria-hidden="true"
        decoding="async"
        className={`w-full h-full object-cover object-center scale-100 transition-all duration-700 ease-in-out ${
          isLight
            ? 'opacity-20 sm:opacity-25 filter brightness-[1.02] contrast-[1.06] saturate-[0.8]'
            : 'hidden'
        }`}
      />

      {/* 2. Studio Architectural Atmosphere (White/Slate in Light mode, Deep Navy Slate in Dark mode) */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          isLight
            ? 'bg-gradient-to-b from-[#FFFFFF]/90 via-[#F8FAFC]/82 to-[#F1F5F9]/92'
            : 'bg-gradient-to-b from-canvas/95 via-canvas/92 to-canvas/96'
        }`}
      />

      {/* Live aurora + 3D orb (WebGL) */}
      <AuroraCanvas showOrb={currentPath === '/'} light={isLight} />

      {/* 3. Executive Gold/Bronze Ambient Radial Highlights */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-site h-[650px] transition-opacity duration-700 ${
          isLight
            ? 'bg-[radial-gradient(ellipse_at_top,rgba(166,139,255,0.22)_0%,rgba(248,250,252,0)_70%)]'
            : 'bg-[radial-gradient(ellipse_at_top,rgba(166,139,255,0.07)_0%,rgba(14,17,28,0)_70%)]'
        }`}
      />
      <div
        className={`absolute bottom-0 right-0 w-[500px] h-[500px] transition-opacity duration-700 ${
          isLight
            ? 'bg-[radial-gradient(circle,rgba(255,77,170,0.07)_0%,transparent_70%)]'
            : 'bg-[radial-gradient(circle,rgba(255,77,170,0.05)_0%,transparent_70%)]'
        }`}
      />

      {/* 4. Fine Architectural Blueprint Grid Texture */}
      <div
        className={`absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] transition-opacity duration-700 ${
          isLight
            ? 'bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] opacity-35'
            : 'bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] opacity-30'
        }`}
      />

      {/* 5. Subtle Vignette Depth */}
      <div
        className={`absolute inset-0 transition-all duration-700 ${
          isLight
            ? 'bg-[radial-gradient(circle_at_center,transparent_50%,rgba(226,232,240,0.65)_100%)]'
            : 'bg-[radial-gradient(circle_at_center,transparent_45%,rgba(8,10,16,0.65)_100%)]'
        }`}
      />
    </div>
  );
};
