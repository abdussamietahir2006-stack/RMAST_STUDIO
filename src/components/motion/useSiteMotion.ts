import { useEffect } from 'react';

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

// Site-wide motion that needs no changes to page markup:
//  1. Scroll reveal: sections and cards below the fold rise in as they scroll into view
//     (anything already on screen is left alone, so prerendered content never flashes or hides).
//  2. Cards tilt in 3D toward the cursor, with a soft light following it (see .fx-card in index.css).
//  3. Primary buttons lean toward the cursor, and a coloured aura trails it across the page.
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
            // Hand the element back to its own transitions (card tilt, hover) once it has landed
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

  // 4. Endless animations (flowing gradients, pulsing dots, marquees) keep the browser producing
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

  // 2 & 3. Card tilt + spotlight, magnetic buttons, cursor aura (one listener for the whole page)
  useEffect(() => {
    if (window.matchMedia?.('(hover: none)').matches) return;
    const reduced = prefersReducedMotion();

    const aura = document.createElement('div');
    aura.className = 'cursor-aura';
    aura.setAttribute('aria-hidden', 'true');
    document.body.appendChild(aura);
    const pos = { x: -600, y: -600, tx: -600, ty: -600 };
    let auraRaf = 0;
    const follow = () => {
      pos.x += (pos.tx - pos.x) * 0.14;
      pos.y += (pos.ty - pos.y) * 0.14;
      aura.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      auraRaf = Math.abs(pos.tx - pos.x) + Math.abs(pos.ty - pos.y) > 0.5 ? requestAnimationFrame(follow) : 0;
    };

    let raf = 0;
    let lastCard: HTMLElement | null = null;
    let lastButton: HTMLElement | null = null;
    const release = () => {
      lastCard?.style.removeProperty('--rx');
      lastCard?.style.removeProperty('--ry');
      lastButton?.style.removeProperty('translate');
    };

    const onMove = (e: PointerEvent) => {
      pos.tx = e.clientX;
      pos.ty = e.clientY;
      aura.classList.add('on');
      if (!auraRaf && !reduced) auraRaf = requestAnimationFrame(follow);

      const target = e.target as Element | null;
      // Same set of cards that index.css styles
      const card = target?.closest?.<HTMLElement>(
        "main .grid > div[class*='border'], main div.group[class*='border'], main .fx-card"
      ) ?? null;
      const button = target?.closest?.<HTMLElement>('button.bg-\\[\\#A68BFF\\], a.bg-\\[\\#A68BFF\\], .btn-magnet') ?? null;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (lastCard && lastCard !== card) {
          lastCard.style.removeProperty('--rx');
          lastCard.style.removeProperty('--ry');
        }
        if (lastButton && lastButton !== button) lastButton.style.removeProperty('translate');
        lastCard = card;
        lastButton = button;

        if (card) {
          const r = card.getBoundingClientRect();
          const x = e.clientX - r.left;
          const y = e.clientY - r.top;
          card.style.setProperty('--mx', `${x}px`);
          card.style.setProperty('--my', `${y}px`);
          if (!reduced) {
            // Large blocks tilt less than small cards
            const strength = Math.max(2, Math.min(9, 2600 / Math.max(r.width, 1)));
            card.style.setProperty('--rx', `${((0.5 - y / r.height) * strength).toFixed(2)}deg`);
            card.style.setProperty('--ry', `${((x / r.width - 0.5) * strength).toFixed(2)}deg`);
          }
        }
        if (button && !reduced) {
          const r = button.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) * 0.22;
          const dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
          button.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
        }
      });
    };
    const onLeave = () => {
      aura.classList.remove('on');
      release();
      lastCard = lastButton = null;
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(raf);
      cancelAnimationFrame(auraRaf);
      release();
      aura.remove();
    };
  }, []);
}
