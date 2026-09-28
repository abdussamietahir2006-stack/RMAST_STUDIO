import { useEffect } from 'react';

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Site-wide motion that needs no changes to page markup, kept calm on purpose:
//  1. Scroll reveal: sections and cards below the fold fade up as they scroll into view
//     (anything already on screen is left alone, so prerendered content never flashes or hides).
//  2. Endless animations pause while off screen.
export function useSiteMotion(routeKey: string): void {
  // 1. Scroll reveal, re-run for each page
  useEffect(() => {
    if (!routeKey || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return;

    let observer: IntersectionObserver | undefined;
    const frame = requestAnimationFrame(() => {
      const main = document.querySelector('main');
      if (!main) return;

      const candidates = new Set<HTMLElement>();
      // Cards in grids animate individually, with a stagger
      main.querySelectorAll<HTMLElement>('.grid > *').forEach((el) => candidates.add(el));
      // Other direct building blocks of each section (headings, banners, lists)
      main.querySelectorAll<HTMLElement>('section > *:not(.grid)').forEach((el) => {
        if (!el.querySelector('.grid')) candidates.add(el);
      });

      const fold = window.innerHeight * 0.92;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            el.classList.add('rv-in');
            observer?.unobserve(el);
            // Hand the element back to its own transitions (hover) once it has landed
            const done = (e: TransitionEvent) => {
              if (e.target !== el || e.propertyName !== 'transform') return;
              el.removeEventListener('transitionend', done);
              el.classList.remove('rv', 'rv-in');
            };
            el.addEventListener('transitionend', done);
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
      );

      candidates.forEach((el) => {
        if (el.getBoundingClientRect().top < fold || el.offsetHeight === 0) return; // visible now: leave it
        const siblings = el.parentElement?.classList.contains('grid') ? Array.from(el.parentElement.children) : [];
        const index = siblings.indexOf(el);
        if (index > 0) el.style.setProperty('--rv-delay', `${Math.min(index % 4, 3) * 90}ms`);
        el.classList.add('rv');
        observer!.observe(el);
      });
    });

    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [routeKey]);

  // 2. Endless animations (flowing gradients, pulsing dots, marquees) keep the browser producing
  //    frames even when nobody can see them, so each one is paused while it is off screen.
  //    New ones (page changes, menus, popups) are picked up as they appear.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || typeof document.getAnimations !== 'function') return;
    const seen = new WeakSet<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) entry.target.classList.toggle('anim-idle', !entry.isIntersecting);
      },
      { rootMargin: '100px 0px' }
    );
    const scan = () => {
      for (const anim of document.getAnimations()) {
        if (!(anim instanceof CSSAnimation) || anim.effect?.getTiming().iterations !== Infinity) continue;
        const el = (anim.effect as KeyframeEffect | null)?.target;
        if (el && !seen.has(el)) {
          seen.add(el);
          io.observe(el);
        }
      }
    };
    let timer = 0;
    const scanSoon = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(scan, 250);
    };
    const mo = new MutationObserver(scanSoon);
    mo.observe(document.body, { childList: true, subtree: true });
    scanSoon();
    return () => {
      window.clearTimeout(timer);
      mo.disconnect();
      io.disconnect();
    };
  }, []);
}
