import React, { useRef } from 'react';
import { m, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { HomeIntroVideo } from '../components/media/HomeIntroVideo';
import { Link } from '../components/common/Link';
import { useScrollToHash } from '../components/common/useScrollToHash';
import {
  AssistantGrid,
  AuditCtaBand,
  FaqList,
  LeadResponseSpotlight,
  PlansGrid,
  ProofPlaceholder,
  SectionIntro,
  StepList
} from '../components/assistants/AssistantBlocks';
import { ASSISTANTS, BOOK_CALL_PATH, FREE_AUDIT_PATH, HOW_IT_WORKS } from '../data/assistantsData';
import { ArrowRight } from 'lucide-react';

// Every sub-service, as a scrolling strip; the list is doubled so the loop is seamless
const MARQUEE_ITEMS = ASSISTANTS.flatMap((a) => a.highlights);

const MarqueeBand: React.FC<{ className: string; itemClassName: string }> = ({ className, itemClassName }) => (
  <div className={`marquee overflow-hidden py-4 ${className}`}>
    <div className="marquee-track">
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
        <span key={i} className={`flex items-center gap-8 pr-8 text-xl md:text-2xl font-semibold tracking-tight whitespace-nowrap ${itemClassName}`}>
          {item}
          <span aria-hidden="true" className="text-sm text-brand">✦</span>
        </span>
      ))}
    </div>
  </div>
);

const sectionClass = 'py-24 px-4 sm:px-6 border-b border-line relative';

export const HomePage: React.FC = () => {
  // Hero depth: the content leans toward the pointer, and tips back into the page as you scroll away
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const scrollTilt = useTransform(scrollYProgress, [0, 1], [0, 22]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.15]);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spring = { stiffness: 120, damping: 20, mass: 0.6 };
  const leanY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-5, 5]), spring);
  const leanX = useSpring(useTransform(pointerY, [-0.5, 0.5], [4, -4]), spring);
  const heroRotateX = useTransform(() => leanX.get() + scrollTilt.get());

  const onHeroPointer = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    pointerX.set((e.clientX - r.left) / r.width - 0.5);
    pointerY.set((e.clientY - r.top) / r.height - 0.5);
  };
  const resetHeroPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  // e.g. the old /process page now points at #how-it-works
  useScrollToHash();

  return (
    <div className="relative min-h-screen">
      {/* ===================================================
          1. HERO
          =================================================== */}
      <section
        ref={heroRef}
        onPointerMove={onHeroPointer}
        onPointerLeave={resetHeroPointer}
        className="relative min-h-[92vh] flex flex-col justify-between pt-30 pb-16 px-4 sm:px-6 border-b border-line overflow-hidden [perspective:1600px]"
      >
        <m.div
          className="max-w-site mx-auto w-full space-y-12 origin-[50%_0%]"
          style={{ rotateX: heroRotateX, rotateY: leanY, y: heroY, scale: heroScale, opacity: heroOpacity }}
        >
          {/* Studio Top Kicker */}
          <div className="flex items-center gap-3">
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-accent animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-primary" />
            </span>
            <span className="text-xs uppercase font-mono tracking-[0.25em] text-brand">
              RMAST Studio · Assistants for real estate teams
            </span>
          </div>

          {/* Main Hero Typography + studio intro video */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 items-center">
            <div className="space-y-6 lg:col-span-7">
              <h1 className="type-h1 text-fg">
                BUILD WHAT’S <br />
                <span className="text-aurora">NEXT.</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted max-w-xl leading-relaxed">
                Virtual, Creative and Technical Assistants for real estate teams. Leads answered in 60 seconds, content that gets
                seen, and paperwork off your plate.
              </p>
              {/* One primary action, one secondary */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to={FREE_AUDIT_PATH} className="btn btn-primary">
                  Get a free audit
                  <ArrowRight aria-hidden="true" className="w-4 h-4" />
                </Link>
                <Link to={BOOK_CALL_PATH} className="btn btn-secondary">
                  Book a call
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <HomeIntroVideo />
            </div>
          </div>
        </m.div>

        {/* Hero bottom metadata line */}
        <div className="max-w-site mx-auto w-full pt-12 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-subtle border-t border-line mt-12">
          <div>For agents, teams and brokerages. Monthly retainer.</div>
          <div className="flex items-center gap-4">
            <span>USA · Canada · Dubai</span>
          </div>
        </div>
      </section>

      {/* Sub-services strip */}
      <div aria-hidden="true" className="relative overflow-hidden select-none border-y border-line bg-surface/60">
        <MarqueeBand className="py-6" itemClassName="text-subtle" />
      </div>

      {/* ===================================================
          2. THE THREE ASSISTANTS
          =================================================== */}
      <section className={sectionClass} aria-labelledby="assistants-heading">
        <div className="max-w-site mx-auto space-y-12">
          <SectionIntro
            id="assistants-heading"
            kicker="Three Assistants"
            title="Hire one Assistant, or the whole team."
            text="Each Assistant takes one part of your business off your hands. They work on their own, and even better together."
          />
          <AssistantGrid />
        </div>
      </section>

      {/* ===================================================
          3. LEAD RESPONSE SYSTEM SPOTLIGHT
          =================================================== */}
      <section className={`${sectionClass} bg-surface/40`}>
        <div className="max-w-site mx-auto">
          <LeadResponseSpotlight />
        </div>
      </section>

      {/* ===================================================
          4. HOW IT WORKS
          =================================================== */}
      <section id="how-it-works" className={`${sectionClass} scroll-mt-24`}>
        <div className="max-w-site mx-auto space-y-12">
          <SectionIntro
            kicker="How it works"
            title="From free audit to monthly report."
            text="No long setup and no guesswork. You always know what we are doing and why."
          />
          <StepList steps={HOW_IT_WORKS} />
          <ProofPlaceholder label="add a real client testimonial here (name, team, city, quote)" />
        </div>
      </section>

      {/* ===================================================
          5. PLANS
          =================================================== */}
      <section className={sectionClass}>
        <div className="max-w-site mx-auto space-y-12">
          <SectionIntro
            kicker="Plans"
            title="One Assistant or the Full Team."
            text="Both are monthly retainers. We price your plan after the free audit, so you only pay for what you need."
          />
          <PlansGrid />
          <Link to="/plans" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline underline-offset-4">
            Compare plans in detail
            <ArrowRight aria-hidden="true" className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ===================================================
          6. FREE AUDIT CTA
          =================================================== */}
      <AuditCtaBand />

      {/* ===================================================
          7. FAQ
          =================================================== */}
      <section className="py-24 px-4 sm:px-6 relative">
        <div className="max-w-3xl mx-auto space-y-10">
          <SectionIntro kicker="FAQ" title="Questions realtors ask us." />
          <FaqList />
        </div>
      </section>
    </div>
  );
};
