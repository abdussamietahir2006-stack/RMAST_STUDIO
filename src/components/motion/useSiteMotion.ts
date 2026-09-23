import { useEffect } from 'react';

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Site-wide motion that needs no changes to page markup:
//  1. Scroll reveal: sections and cards below the fold rise in as they scroll into view
//     (anything already on screen is left alone, so prerendered content never flashes or hides).
//  2. Card spotlight: a soft gold light follows the cursor across cards (see .fx-card in index.css).
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
            entry.target.classList.add('rv-in');
            observer?.unobserve(entry.target);
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

  // 2. Card spotlight (one listener for the whole page)
  useEffect(() => {
    if (window.matchMedia?.('(hover: none)').matches) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      // Same set of cards that index.css styles
      const card = (e.target as Element | null)?.closest?.<HTMLElement>(
        "main .grid > div[class*='border'], main div.group[class*='border'], main .fx-card"
      );
      if (!card) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      });
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      document.removeEventListener('pointermove', onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
}
