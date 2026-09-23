import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { teamData, studioPhilosophy } from '../data/teamData';
import { FounderPhoto } from '../components/media/FounderPhoto';
import { Target, Zap, Linkedin, ExternalLink } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Editorial Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A96E]">
              Studio Origin & Principles
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-[#FAF8F5] leading-[1.02] tracking-tight">
            Small team. <br />
            <span className="italic font-light text-[#C9A96E]">Serious execution.</span>
          </h1>

          <p className="text-xl sm:text-2xl font-light text-[#A1A1AA] leading-relaxed">
            RMAST Studio was built on a simple conviction: modern businesses do not need another bloated agency with tiers of account managers, interns, and slide decks. They need sharp systems architects and world-class visual directors.
          </p>
        </section>

        {/* Mission & Vision Bento */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 md:p-10 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 space-y-4 shadow-xl">
            <div className="text-xs font-mono uppercase tracking-widest text-[#C9A96E] flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span>Studio Mission</span>
            </div>
            <h2 className="font-serif text-2xl text-[#FAF8F5] font-semibold">
              Eradicating Operational Chaos
            </h2>
            <p className="text-sm text-[#8E8D88] leading-relaxed">
              To engineer the digital backbone and automated pipelines that allow real estate brokerages and international brands to scale without ballooning overhead or losing prospective deals.
            </p>
          </div>

          <div className="p-8 md:p-10 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 space-y-4 shadow-xl">
            <div className="text-xs font-mono uppercase tracking-widest text-[#C9A96E] flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Studio Vision</span>
            </div>
            <h2 className="font-serif text-2xl text-[#FAF8F5] font-semibold">
              The Sovereign Digital Enterprise
            </h2>
            <p className="text-sm text-[#8E8D88] leading-relaxed">
              We envision a business landscape where small, elite teams armed with custom software, autonomous AI workflows, and cinematic visual content outperform legacy multi-million-dollar corporations.
            </p>
          </div>
        </section>

        {/* The Two Founders: Strictly Abdussamie & Mashhood */}
        <section className="space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
              Leadership & Direct Execution
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#FAF8F5] font-semibold">
              The People Behind RMAST
            </h2>
            <p className="text-sm text-[#8E8D88] max-w-2xl">
              We do not hide behind anonymous contractor networks. When you partner with RMAST, your systems and films are engineered directly by the founders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamData.map((founder, idx) => (
              <div
                key={idx}
                className="p-8 md:p-10 bg-[#0E111C]/85 backdrop-blur-md border border-[#232738]/80 rounded-sm space-y-6 flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-5">
                  <div className="w-24 h-24 rounded-sm overflow-hidden bg-[#181820] border border-[#272730]">
                    <FounderPhoto founder={founder} className="w-full h-full object-cover grayscale contrast-125" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-serif text-2xl text-[#FAF8F5] font-semibold">
                        {founder.name}
                      </h3>
                      {founder.linkedin && (
                        <a
                          href={founder.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0A66C2]/10 border border-[#0A66C2]/30 hover:border-[#0A66C2] text-[#70B5F9] hover:text-[#FAF8F5] text-[11px] font-mono rounded-sm transition-all group cursor-pointer"
                          aria-label={`${founder.name} LinkedIn Profile`}
                        >
                          <Linkedin className="w-3.5 h-3.5 text-[#0A66C2] group-hover:scale-110 transition-transform" />
                          <span>LinkedIn Profile</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                        </a>
                      )}
                    </div>
                    <div className="text-xs font-mono uppercase tracking-wider text-[#C9A96E] mt-0.5">
                      {founder.role} · {founder.title}
                    </div>
                  </div>

                  <p className="text-sm text-[#8E8D88] leading-relaxed">
                    {founder.bio}
                  </p>

                  <blockquote className="p-4 bg-[#08080A] border-l-2 border-[#C9A96E] text-xs italic text-[#D4D4D8]">
                    "{founder.quote}"
                  </blockquote>
                </div>

                <div className="pt-4 border-t border-[#1C1C22]">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-2">
                    Core Architectural Focus:
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs font-mono text-[#A1A1AA]">
                    {founder.focus.map((f, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[#121216] border border-[#22222A]">
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
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
              Studio In Session
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#FAF8F5] font-semibold">
              Behind the Architectural Build
            </h2>
            <p className="text-sm text-[#8E8D88] max-w-2xl">
              From whiteboard systems scoping to real-time client sprint reviews, every deliverable is forged in active collaborative sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative group overflow-hidden rounded-sm border border-[#232738]/80 bg-[#0E111C]/80 shadow-lg">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80"
                  alt="Team architectural sprint review"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />
              </div>
              <div className="p-5 space-y-1 bg-[#0A0C14]/90 backdrop-blur-md border-t border-[#1E2232]">
                <div className="text-[10px] font-mono text-[#C9A96E] uppercase tracking-wider">
                  SYSTEMS ENGINEERING
                </div>
                <h3 className="font-serif text-base text-[#FAF8F5] font-medium">
                  Technical Architecture Review
                </h3>
                <p className="text-xs text-[#8E8D88]">
                  Scoping database relationships, CRM integrations, and webhook payloads.
                </p>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-sm border border-[#232738]/80 bg-[#0E111C]/80 shadow-lg">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1000&q=80"
                  alt="Founders boardroom strategy meeting"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />
              </div>
              <div className="p-5 space-y-1 bg-[#0A0C14]/90 backdrop-blur-md border-t border-[#1E2232]">
                <div className="text-[10px] font-mono text-[#C9A96E] uppercase tracking-wider">
                  FOUNDER DISCOVERY
                </div>
                <h3 className="font-serif text-base text-[#FAF8F5] font-medium">
                  Executive Client Strategy
                </h3>
                <p className="text-xs text-[#8E8D88]">
                  Aligning business KPIs with automated transaction pipelines and branding.
                </p>
              </div>
            </div>

            <div className="relative group overflow-hidden rounded-sm border border-[#232738]/80 bg-[#0E111C]/80 shadow-lg">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1000&q=80"
                  alt="AI video editing and color grade session"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                />
              </div>
              <div className="p-5 space-y-1 bg-[#0A0C14]/90 backdrop-blur-md border-t border-[#1E2232]">
                <div className="text-[10px] font-mono text-[#C9A96E] uppercase tracking-wider">
                  AI CONTENT STUDIO
                </div>
                <h3 className="font-serif text-base text-[#FAF8F5] font-medium">
                  Cinematic Cut & Color Suite
                </h3>
                <p className="text-xs text-[#8E8D88]">
                  Directing multi-angle generative shots and luxury architectural fly-throughs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="space-y-8 p-8 md:p-12 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 shadow-xl">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
              Operating Standard
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-[#FAF8F5] font-semibold">
              How We Work With You
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {studioPhilosophy.principles.map((p) => (
              <div key={p.number} className="p-6 bg-[#0A0C14]/80 border border-[#1E2232] space-y-2">
                <span className="text-xs font-mono text-[#C9A96E] font-bold">
                  {p.number}
                </span>
                <h3 className="font-serif text-base text-[#FAF8F5] font-medium">
                  {p.title}
                </h3>
                <p className="text-xs text-[#8E8D88] leading-relaxed">
                  {p.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Global Operations Footprint */}
        <section className="p-8 md:p-10 bg-[#0E111C]/85 backdrop-blur-md border border-[#232738]/80 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-[#C9A96E]">
              Remote First · Global Execution
            </div>
            <h3 className="font-serif text-2xl text-[#FAF8F5] font-semibold">
              Serving Clients Across 3 Continents
            </h3>
            <p className="text-xs text-[#8E8D88] max-w-xl">
              Operating with real-time alignment across North American (EST/PST), Middle Eastern (GST), and European time zones.
            </p>
          </div>

          <button
            onClick={() => navigate('/contact')}
            className="px-6 py-3.5 bg-[#C9A96E] text-[#0A0A0C] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#D9B97E] transition-all cursor-pointer whitespace-nowrap"
          >
            Start Founder Dialogue
          </button>
        </section>
      </div>
    </div>
  );
};
