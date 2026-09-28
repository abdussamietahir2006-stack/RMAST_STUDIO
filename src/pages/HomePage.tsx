import React, { useRef } from 'react';
import { m, useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';
import { useNavigation } from '../context/NavigationContext';
import { useCurrency } from '../context/CurrencyContext';
import { projectsData } from '../data/projectsData';
import { servicesData } from '../data/servicesData';
import { teamData, studioPhilosophy } from '../data/teamData';
import { WorkflowInteractive } from '../components/real-estate/WorkflowInteractive';
import { CONTACT } from '../config/contact';
import { FounderPhoto } from '../components/media/FounderPhoto';
import { HomeIntroVideo } from '../components/media/HomeIntroVideo';
import { AiContentMedia, ProjectMedia } from '../components/media/ServiceMedia';
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Film,
  Bot,
  Database,
  Workflow,
  Linkedin
} from 'lucide-react';

// Starting prices shown on the home page come from the service data, so they match the service pages
const startingPrice = (slug: string) => servicesData.find((s) => s.slug === slug)?.startingPriceUSD ?? 0;

const MARQUEE_ITEMS = [
  'Real Estate Systems',
  'AI Commercial Films',
  'CRM Architecture',
  'Fashion Campaigns',
  'AI Automation',
  'Property Tours',
  'AI Assistants',
  'Product Films'
];

// A scrolling strip of the studio's disciplines; the list is doubled so the loop is seamless
const MarqueeBand: React.FC<{ reverse?: boolean; className: string; itemClassName: string }> = ({ reverse, className, itemClassName }) => (
  <div className={`marquee overflow-hidden py-4 ${className}`}>
    <div className="marquee-track" style={reverse ? { animationDirection: 'reverse' } : undefined}>
      {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
        <span key={i} className={`flex items-center gap-8 pr-8 text-xl md:text-2xl font-semibold tracking-tight whitespace-nowrap ${itemClassName}`}>
          {item}
          <span aria-hidden="true" className="text-sm text-brand">✦</span>
        </span>
      ))}
    </div>
  </div>
);

export const HomePage: React.FC = () => {
  const { navigate } = useNavigation();
  const { format } = useCurrency();

  const featuredProjects = projectsData.slice(0, 4);

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

  return (
    <div className="relative min-h-screen">
      {/* ===================================================
          1. HERO SECTION: CINEMATIC & EDITORIAL OPENING
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
              RMAST Studio · International Digital Practice
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
                Digital systems for real estate and cinematic AI content for brands.
              </p>
              {/* One primary action, one secondary (same destinations as the header and pricing links) */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button type="button" onClick={() => navigate('/contact')} className="btn btn-primary">
                  Start a Project
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => navigate('/pricing')} className="btn btn-secondary">
                  View Pricing
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <HomeIntroVideo />
            </div>
          </div>

          {/* TWO MAJOR PATHWAYS: VISUALLY DISTINCT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* PATH 1: REAL ESTATE */}
            <div className="group relative p-8 md:p-12 bg-surface-2/80 backdrop-blur-md border border-line/80 hover:border-primary/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm rounded-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-brand">
                    <Building2 className="w-4 h-4" />
                    <span>Division 01</span>
                  </div>
                  <span className="text-xs font-mono text-muted font-medium">
                    USA · UAE · Canada
                  </span>
                </div>

                <h2 className="type-h2 text-fg">
                  Real Estate
                </h2>

                <p className="text-sm font-mono text-brand font-semibold italic">
                  "Systems that run your business."
                </p>

                <p className="text-sm text-fg leading-relaxed font-normal">
                  We engineer the technical infrastructure behind high-producing brokerages: bespoke multi-page web flagships, deal CRMs, autonomous AI lead triage, and back-office pipelines.
                </p>

                <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-muted">
                  <span className="px-2 py-1 bg-surface-2 rounded-xs border border-line">Website</span>
                  <span className="px-2 py-1 bg-surface-2 rounded-xs border border-line">CRM</span>
                  <span className="px-2 py-1 bg-surface-2 rounded-xs border border-line">AI Automation</span>
                  <span className="px-2 py-1 bg-surface-2 rounded-xs border border-line">AI Assistant</span>
                  <span className="px-2 py-1 bg-surface-2 rounded-xs border border-line">Operations</span>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => navigate('/real-estate')}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-fg group-hover:text-brand transition-colors cursor-pointer"
                >
                  <span>Explore Real Estate</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* PATH 2: BRANDS & AI CONTENT */}
            <div className="group relative p-8 md:p-12 bg-surface-2/80 backdrop-blur-md border border-line/80 hover:border-primary/60 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm rounded-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-brand">
                    <Film className="w-4 h-4" />
                    <span>Division 02</span>
                  </div>
                  <span className="text-xs font-mono text-muted font-medium">
                    Worldwide
                  </span>
                </div>

                <h2 className="type-h2 text-fg">
                  Brands & Content
                </h2>

                <p className="text-sm font-mono text-brand font-semibold italic">
                  "Content that makes people stop scrolling."
                </p>

                <p className="text-sm text-fg leading-relaxed font-normal">
                  Cinematic AI commercial films, high-fashion campaigns, sensory food cinema, and architectural property tours without the friction or bloated costs of traditional film sets.
                </p>

                <div className="pt-2 flex flex-wrap gap-2 text-xs font-mono text-muted">
                  <span className="px-2 py-1 bg-surface-2 rounded-xs border border-line">AI Video</span>
                  <span className="px-2 py-1 bg-surface-2 rounded-xs border border-line">Fashion</span>
                  <span className="px-2 py-1 bg-surface-2 rounded-xs border border-line">Food & Dining</span>
                  <span className="px-2 py-1 bg-surface-2 rounded-xs border border-line">Property Tours</span>
                  <span className="px-2 py-1 bg-surface-2 rounded-xs border border-line">Social Ads</span>
                </div>
              </div>

              <div className="pt-8">
                <button
                  onClick={() => navigate('/ai-content')}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-fg group-hover:text-brand transition-colors cursor-pointer"
                >
                  <span>Explore AI Content</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </m.div>

        {/* Hero bottom metadata line */}
        <div className="max-w-site mx-auto w-full pt-12 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-subtle border-t border-line mt-12">
          <div>
            Small Team. Serious Execution. Remote Studio.
          </div>
          <div className="flex items-center gap-4">
            <span>Primary Hubs: USA · UAE · Canada · Global</span>
          </div>
        </div>
      </section>

      {/* Disciplines strip */}
      <div aria-hidden="true" className="relative overflow-hidden select-none border-y border-line bg-surface/60">
        <MarqueeBand className="py-6" itemClassName="text-subtle" />
      </div>

      {/* ===================================================
          2. REAL ESTATE DIVISION SECTION & WORKFLOW
          =================================================== */}
      <section className="py-24 px-4 sm:px-6 border-b border-line relative">
        <div className="max-w-site mx-auto space-y-16">
          <div className="space-y-4 max-w-3xl">
            <span className="text-xs uppercase font-mono tracking-[0.25em] text-brand block font-semibold">
              Division One · Real Estate Digital Systems
            </span>
            <h2 className="type-h2 text-fg">
              Your real estate business should run like a system.
            </h2>
            <p className="text-base sm:text-lg text-muted leading-relaxed font-light">
              Most real estate agencies do not have a lead generation problem — they have a lead leakage and manual operations problem. We engineer the automated workflow that captures, qualifies, and nurtures every buyer until a contract is signed.
            </p>
          </div>

          {/* Interactive Animated Visual Workflow */}
          <WorkflowInteractive />

          {/* Real Estate Capabilities Grid with Clear Hierarchy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="p-6 bg-surface border border-line hover:border-primary/50 transition-all duration-300 space-y-4 rounded-sm relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-brand bg-primary/10 px-2 py-1 rounded-sm border border-primary/20">
                  SYSTEM 01
                </span>
                <Building2 className="w-4 h-4 text-brand" />
              </div>
              <h3 className="type-h4 text-fg group-hover:text-brand transition-colors">
                Web Development
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Custom high-speed digital flagships with WhatsApp hookup, AI chatbot, and SEO optimization.
              </p>
              <div className="pt-2 text-xs font-mono text-fg font-semibold border-t border-line flex items-center justify-between">
                <span className="text-xs uppercase text-subtle">Starting</span>
                <span className="text-brand">From {format(startingPrice('web-development'))}</span>
              </div>
            </div>

            <div className="p-6 bg-surface border border-line hover:border-primary/50 transition-all duration-300 space-y-4 rounded-sm relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-brand bg-primary/10 px-2 py-1 rounded-sm border border-primary/20">
                  SYSTEM 02
                </span>
                <Database className="w-4 h-4 text-brand" />
              </div>
              <h3 className="type-h4 text-fg group-hover:text-brand transition-colors">
                CRM Architecture
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Purpose-built deal stages, contact timeline hygiene, and automated agent assignment.
              </p>
              <div className="pt-2 text-xs font-mono text-fg font-semibold border-t border-line flex items-center justify-between">
                <span className="text-xs uppercase text-subtle">Starting</span>
                <span className="text-brand">From {format(startingPrice('crm-development'))}</span>
              </div>
            </div>

            <div className="p-6 bg-surface border border-line hover:border-primary/50 transition-all duration-300 space-y-4 rounded-sm relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-brand bg-primary/10 px-2 py-1 rounded-sm border border-primary/20">
                  SYSTEM 03
                </span>
                <Workflow className="w-4 h-4 text-brand" />
              </div>
              <h3 className="type-h4 text-fg group-hover:text-brand transition-colors">
                AI Automation
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Autonomous webhook pipelines connecting lead portals, SMS/WhatsApp alerts, and calendar bookings.
              </p>
              <div className="pt-2 text-xs font-mono text-fg font-semibold border-t border-line flex items-center justify-between">
                <span className="text-xs uppercase text-subtle">Starting</span>
                <span className="text-brand">From {format(startingPrice('ai-automation'))}/mo</span>
              </div>
            </div>

            <div className="p-6 bg-surface border border-line hover:border-primary/50 transition-all duration-300 space-y-4 rounded-sm relative group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-brand bg-primary/10 px-2 py-1 rounded-sm border border-primary/20">
                  SYSTEM 04
                </span>
                <Bot className="w-4 h-4 text-brand" />
              </div>
              <h3 className="type-h4 text-fg group-hover:text-brand transition-colors">
                AI Assistants
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                Fine-tuned conversational agents answering inventory specs and qualifying high-net-worth buyers 24/7.
              </p>
              <div className="pt-2 text-xs font-mono text-fg font-semibold border-t border-line flex items-center justify-between">
                <span className="text-xs uppercase text-subtle">Starting</span>
                <span className="text-brand">From {format(startingPrice('ai-assistants'))}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-line">
            <p className="text-sm font-mono text-subtle">
              Serving boutique agencies and luxury developers across United States, UAE & Canada.
            </p>
            <button
              onClick={() => navigate('/real-estate')}
              className="btn btn-primary cursor-pointer"
            >
              Build Your System
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================
          3. AI CONTENT DIVISION: IMMERSIVE CINEMATIC SECTION
          =================================================== */}
      <section className="py-24 px-4 sm:px-6 border-b border-line bg-canvas relative">
        <div className="max-w-site mx-auto space-y-16">
          <div className="space-y-4 max-w-3xl">
            <span className="text-xs uppercase font-mono tracking-[0.2em] text-brand block">
              Division Two · Creative AI Production House
            </span>
            <h2 className="type-h2 text-fg">
              Production without the production.
            </h2>
            <p className="text-base text-muted leading-relaxed">
              We create cinematic AI-powered content for brands without the limitations of traditional production. No flight bookings, no permits, no location rentals, no weather cancellations. From pure idea to final cinema.
            </p>
          </div>

          {/* Category Showcases */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Real Estate Videos */}
            <div
              onClick={() => navigate('/ai-content/real-estate')}
              className="group relative h-96 bg-surface border border-line overflow-hidden cursor-pointer"
            >
              <AiContentMedia
                slug="real-estate"
                image="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
                alt="Real Estate AI Property Tours"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-brand">
                  REAL ESTATE
                </span>
                <h3 className="type-h4 text-fg">
                  Property Tours
                </h3>
                <p className="text-sm text-muted pt-1">
                  Photorealistic drone flythroughs & architectural cinema.
                </p>
              </div>
            </div>

            {/* Fashion AI Campaigns */}
            <div
              onClick={() => navigate('/ai-content/fashion')}
              className="group relative h-96 bg-surface border border-line overflow-hidden cursor-pointer"
            >
              <AiContentMedia
                slug="fashion"
                image="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80"
                alt="Fashion AI Campaigns"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-brand">
                  FASHION
                </span>
                <h3 className="type-h4 text-fg">
                  AI Campaigns
                </h3>
                <p className="text-sm text-muted pt-1">
                  Haute-couture runway visuals & surreal lookbook films.
                </p>
              </div>
            </div>

            {/* Food Cinematic Content */}
            <div
              onClick={() => navigate('/ai-content/food')}
              className="group relative h-96 bg-surface border border-line overflow-hidden cursor-pointer"
            >
              <AiContentMedia
                slug="food"
                image="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
                alt="Food AI Content"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-brand">
                  FOOD & RESTAURANT
                </span>
                <h3 className="type-h4 text-fg">
                  Sensory Dining
                </h3>
                <p className="text-sm text-muted pt-1">
                  Macro culinary textures, sizzle, & appetizing atmosphere.
                </p>
              </div>
            </div>

            {/* Products Commercials */}
            <div
              onClick={() => navigate('/ai-content/products')}
              className="group relative h-96 bg-surface border border-line overflow-hidden cursor-pointer"
            >
              <AiContentMedia
                slug="products"
                image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
                alt="Product Films"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-brand">
                  PRODUCTS
                </span>
                <h3 className="type-h4 text-fg">
                  Product Films
                </h3>
                <p className="text-sm text-muted pt-1">
                  Exploded mechanics & studio reveals for DTC brands.
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 bg-surface border border-line flex flex-col md:flex-row items-center justify-between gap-6 rounded-card">
            <div>
              <div className="text-xs font-mono uppercase tracking-[0.2em] text-brand mb-1">
                From idea to final frame
              </div>
              <div className="font-serif text-xl text-fg">
                Individual videos starting at {format(45)} · Monthly bundles from {format(405)}
              </div>
            </div>
            <button
              onClick={() => navigate('/ai-content')}
              className="btn btn-secondary cursor-pointer"
            >
              Explore AI Content Studio
            </button>
          </div>
        </div>
      </section>

      {/* ===================================================
          4. WORK SECTION: IMMERSIVE EDITORIAL PREVIEWS
          =================================================== */}
      <section className="py-24 px-4 sm:px-6 border-b border-line relative">
        <div className="max-w-site mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs uppercase font-mono tracking-[0.2em] text-brand block">
                Selected Studio Case Studies
              </span>
              <h2 className="type-h2 text-fg">
                Proof of Execution.
              </h2>
            </div>
            <button
              onClick={() => navigate('/work')}
              className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.16em] text-brand hover:underline cursor-pointer"
            >
              <span>View All Projects</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Editorial Case Study Previews (Not a boring generic grid) */}
          <div className="space-y-12">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="group p-8 md:p-12 bg-surface border border-line hover:border-primary/50 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-card"
              >
                {/* Media Column (7 cols) */}
                <div className="lg:col-span-7 overflow-hidden rounded-sm relative aspect-[16/10] bg-surface">
                  <ProjectMedia
                    project={project}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 text-xs font-mono tracking-widest uppercase bg-surface/80 backdrop-blur-sm px-3 py-1 text-fg border border-line">
                    {project.category}
                  </div>
                </div>

                {/* Details Column (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="flex items-center gap-2 text-xs font-mono text-subtle">
                    <span>{project.clientLocation}</span>
                    <span>·</span>
                    <span>{project.year}</span>
                  </div>

                  <div>
                    <h3 className="type-h3 text-fg group-hover:text-brand transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm font-mono text-muted uppercase tracking-wider mt-1">
                      {project.subtitle}
                    </p>
                  </div>

                  <p className="text-sm text-muted leading-relaxed">
                    {project.description}
                  </p>

                  <div className="pt-2 border-t border-line">
                    <div className="text-xs font-mono uppercase tracking-wider text-brand mb-1">
                      Key Deliverables
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs font-mono text-subtle">
                      {project.services.map((s, i) => (
                        <span key={i}>
                          {s}
                          {i < project.services.length - 1 && ' ·'}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => navigate('/case-studies')}
                      className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-fg group-hover:text-brand transition-colors cursor-pointer"
                    >
                      <span>Read System Case Breakdown</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          5. FOUNDERS SECTION: "THE PEOPLE BEHIND RMAST"
          =================================================== */}
      <section className="py-24 px-4 sm:px-6 border-b border-line bg-gradient-to-b from-transparent via-surface/60 to-transparent backdrop-blur-[2px] relative">
        <div className="max-w-site mx-auto space-y-16">
          <div className="space-y-4 max-w-3xl">
            <span className="text-xs uppercase font-mono tracking-[0.2em] text-brand block">
              Leadership & Direct Execution
            </span>
            <h2 className="type-h2 text-fg">
              The People Behind RMAST.
            </h2>
            <p className="text-xl font-serif italic text-brand">
              "Small team. Serious execution."
            </p>
            <p className="text-sm text-muted leading-relaxed">
              RMAST is a founder-led studio. When you hire RMAST, you do not deal with rotating junior managers or outsourced sub-contractors. You work directly with the people architecting your digital systems and directing your creative content.
            </p>
          </div>

          {/* Founders Grid: EXACTLY TWO FOUNDERS, NO INVENTED STAFF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamData.map((founder, index) => (
              <div
                key={index}
                className="p-8 md:p-12 bg-surface-2/85 backdrop-blur-md border border-line/80 hover:border-primary/50 rounded-sm space-y-6 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-sm overflow-hidden bg-surface-2 border border-line">
                    <FounderPhoto founder={founder} className="w-full h-full object-cover grayscale contrast-125" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="type-h3 text-fg">
                        {founder.name}
                      </h3>
                      {founder.linkedin && (
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1 bg-[#0A66C2]/10 border border-[#0A66C2]/30 hover:border-[#0A66C2] text-[#70B5F9] hover:text-fg text-xs font-mono rounded-sm transition-all group cursor-pointer"
                          aria-label={`${founder.name} LinkedIn Profile`}
                        >
                          <Linkedin className="w-3.5 h-3.5 text-[#0A66C2] group-hover:scale-110 transition-transform" />
                          <span>LinkedIn</span>
                          <ArrowUpRight className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      )}
                    </div>
                    <div className="text-xs font-mono uppercase tracking-widest text-brand mt-1">
                      {founder.role} · {founder.title}
                    </div>
                  </div>

                  <p className="text-sm text-muted leading-relaxed">
                    {founder.bio}
                  </p>

                  <blockquote className="p-4 bg-canvas border-l-2 border-primary text-xs italic text-fg">
                    "{founder.quote}"
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-line">
                  <div className="text-xs font-mono uppercase tracking-wider text-subtle mb-2">
                    Core Architectural Focus
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono text-muted">
                    {founder.focus.map((f, i) => (
                      <span key={i} className="px-3 py-1 bg-surface border border-line">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Philosophy Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {studioPhilosophy.principles.map((item) => (
              <div key={item.number} className="p-6 bg-canvas border border-line space-y-2 rounded-card">
                <span className="text-xs font-mono text-brand block font-bold">
                  {item.number}
                </span>
                <h4 className="type-h4 text-fg">
                  {item.title}
                </h4>
                <p className="text-sm text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================================================
          6. FINAL CALL TO ACTION: START A CONVERSATION
          =================================================== */}
      <section className="py-30 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-surface/80 via-surface-2/85 to-surface/90 backdrop-blur-sm border-t border-line">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <span className="text-xs uppercase font-mono tracking-[0.25em] text-brand block">
            Direct Founder Consultation
          </span>

          <h2 className="type-h2 text-fg">
            Have something worth building?
          </h2>

          <p className="text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed">
            Tell us what you are trying to build, automate, or create. Whether it is an end-to-end real estate system or an international AI campaign, we respond within 24 hours.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/contact')}
              className="btn btn-primary w-full sm:w-auto cursor-pointer"
            >
              Start a Conversation
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="btn btn-secondary w-full sm:w-auto cursor-pointer"
            >
              Review Investment Tiers
            </button>
          </div>

          <div className="pt-6 text-xs font-mono text-subtle flex items-center justify-center gap-4">
            <span>{CONTACT.email}</span>
            <span>·</span>
            <span>{CONTACT.whatsappDisplay} (WhatsApp)</span>
          </div>
        </div>
      </section>
    </div>
  );
};
