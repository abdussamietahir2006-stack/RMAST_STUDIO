import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { teamData, studioPhilosophy } from '../data/teamData';
import { FounderPhoto } from '../components/media/FounderPhoto';
import { Target, Zap, Linkedin, ExternalLink } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="pt-30 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Editorial Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">
              Studio Origin & Principles
            </span>
          </div>

          <h1 className="type-h1 text-fg">
            Small team. <br />
            <span className="italic font-light text-brand">Serious execution.</span>
          </h1>

          <p className="text-xl sm:text-2xl font-light text-muted leading-relaxed">
            RMAST Studio was built on a simple conviction: modern businesses do not need another bloated agency with tiers of account managers, interns, and slide decks. They need sharp systems architects and world-class visual directors.
          </p>
        </section>

        {/* Mission & Vision Bento */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 md:p-12 bg-surface-2/80 backdrop-blur-md border border-line/80 space-y-4 shadow-sm rounded-card">
            <div className="text-xs font-mono uppercase tracking-widest text-brand flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Studio Mission</span>
            </div>
            <h2 className="type-h3 text-fg">
              Eradicating Operational Chaos
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              To engineer the digital backbone and automated pipelines that allow real estate brokerages and international brands to scale without ballooning overhead or losing prospective deals.
            </p>
          </div>

          <div className="p-8 md:p-12 bg-surface-2/80 backdrop-blur-md border border-line/80 space-y-4 shadow-sm rounded-card">
            <div className="text-xs font-mono uppercase tracking-widest text-brand flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Studio Vision</span>
            </div>
            <h2 className="type-h3 text-fg">
              The Sovereign Digital Enterprise
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              We envision a business landscape where small, elite teams armed with custom software, autonomous AI workflows, and cinematic visual content outperform legacy multi-million-dollar corporations.
            </p>
          </div>
        </section>

        {/* The Two Founders: Strictly Abdussamie & Mashhood */}
        <section className="space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
              Leadership & Direct Execution
            </span>
            <h2 className="type-h2 text-fg">
              The People Behind RMAST
            </h2>
            <p className="text-sm text-muted max-w-2xl">
              We do not hide behind anonymous contractor networks. When you partner with RMAST, your systems and films are engineered directly by the founders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamData.map((founder, idx) => (
              <div
                key={idx}
                className="p-8 md:p-12 bg-surface-2/85 backdrop-blur-md border border-line/80 rounded-sm space-y-6 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-6">
                  <div className="w-24 h-24 rounded-sm overflow-hidden bg-surface-2 border border-line">
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
                          <span>LinkedIn Profile</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      )}
                    </div>
                    <div className="text-xs font-mono uppercase tracking-wider text-brand mt-1">
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
                    Core Architectural Focus:
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
        </section>

        {/* Studio Working Sessions & Executive Meetings Showcase */}
        <section className="space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
              Studio In Session
            </span>
            <h2 className="type-h2 text-fg">
              Behind the Architectural Build
            </h2>
            <p className="text-sm text-muted max-w-2xl">
              From whiteboard systems scoping to real-time client sprint reviews, every deliverable is forged in active collaborative sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group overflow-hidden rounded-sm border border-line/80 bg-surface-2/80 shadow-sm">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"
                  loading="lazy"
                  decoding="async"
                  alt="Team architectural sprint review"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <div className="p-6 space-y-1 bg-surface/90 backdrop-blur-md border-t border-line">
                <div className="text-xs font-mono text-brand uppercase tracking-wider">
                  SYSTEMS ENGINEERING
                </div>
                <h3 className="type-h4 text-fg">
                  Technical Architecture Review
                </h3>
                <p className="text-sm text-muted">
                  Scoping database relationships, CRM integrations, and webhook payloads.
                </p>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-sm border border-line/80 bg-surface-2/80 shadow-sm">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1000&q=80"
                  loading="lazy"
                  decoding="async"
                  alt="Founders boardroom strategy meeting"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <div className="p-6 space-y-1 bg-surface/90 backdrop-blur-md border-t border-line">
                <div className="text-xs font-mono text-brand uppercase tracking-wider">
                  FOUNDER DISCOVERY
                </div>
                <h3 className="type-h4 text-fg">
                  Executive Client Strategy
                </h3>
                <p className="text-sm text-muted">
                  Aligning business KPIs with automated transaction pipelines and branding.
                </p>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-sm border border-line/80 bg-surface-2/80 shadow-sm">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80"
                  loading="lazy"
                  decoding="async"
                  alt="AI video editing and color grade session"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
              <div className="p-6 space-y-1 bg-surface/90 backdrop-blur-md border-t border-line">
                <div className="text-xs font-mono text-brand uppercase tracking-wider">
                  AI CONTENT STUDIO
                </div>
                <h3 className="type-h4 text-fg">
                  Cinematic Cut & Color Suite
                </h3>
                <p className="text-sm text-muted">
                  Directing multi-angle generative shots and luxury architectural fly-throughs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="space-y-8 p-8 md:p-12 bg-surface-2/80 backdrop-blur-md border border-line/80 shadow-sm">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
              Operating Standard
            </span>
            <h2 className="type-h3 text-fg">
              How We Work With You
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {studioPhilosophy.principles.map((p) => (
              <div key={p.number} className="p-6 bg-surface/80 border border-line space-y-2 rounded-card">
                <span className="text-xs font-mono text-brand font-bold">
                  {p.number}
                </span>
                <h3 className="type-h4 text-fg">
                  {p.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Global Operations Footprint */}
        <section className="p-8 md:p-12 bg-surface-2/85 backdrop-blur-md border border-line/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-brand">
              Remote First · Global Execution
            </div>
            <h3 className="type-h3 text-fg">
              Serving Clients Across 3 Continents
            </h3>
            <p className="text-sm text-muted max-w-xl">
              Operating with real-time alignment across North American (EST/PST), Middle Eastern (GST), and European time zones.
            </p>
          </div>

          <button
            onClick={() => navigate('/contact')}
            className="btn btn-primary cursor-pointer whitespace-nowrap"
          >
            Start Founder Dialogue
          </button>
        </section>
      </div>
    </div>
  );
};
