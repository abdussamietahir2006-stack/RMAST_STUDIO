import React, { useEffect, useState } from 'react';
import { useNavigation, useQueryParam } from '../context/NavigationContext';
import { useCurrency } from '../context/CurrencyContext';
import { useInquiry } from '../context/InquiryContext';
import { servicesData } from '../data/servicesData';
import { Check, ArrowRight, Building2, Film, Layers, Users, ShieldCheck, Sparkles } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { format } = useCurrency();
  const { openInquiry } = useInquiry();
  const divisionParam = useQueryParam('division');
  const [activeDivision, setActiveDivision] = useState<'all' | 'real-estate' | 'ai-content'>('all');

  // Deep links from the navbar (/services?division=ai-content) preselect that division
  useEffect(() => {
    setActiveDivision(divisionParam === 'real-estate' || divisionParam === 'ai-content' ? divisionParam : 'all');
  }, [divisionParam]);

  const filteredServices = servicesData.filter((s) => {
    if (activeDivision === 'all') return true;
    return s.division === activeDivision;
  });

  return (
    <div className="pt-32 pb-28 px-6 md:px-10 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Distinguished Page Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A96E] bg-[#C9A96E]/10 border border-[#C9A96E]/20 px-3 py-1 rounded-sm">
              Studio Architecture & Catalogue
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-[#FAF8F5] leading-[1.02] tracking-tight">
            Two Disciplines. <br />
            <span className="italic font-light text-[#C9A96E]">One Standard of Rigor.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed font-light max-w-3xl">
            Whether architecting custom transaction pipelines for real estate firms or directing high-fashion AI campaigns, every RMAST engagement is engineered directly by the founders with complete architectural ownership.
          </p>

          {/* Interactive Division Filter Buttons */}
          <div
            role="group"
            aria-label="Filter services by division"
            className="inline-flex flex-wrap items-center p-1.5 bg-[#101014] border border-[#222228] text-xs font-mono tracking-wider gap-1"
          >
            <button
              onClick={() => setActiveDivision('all')}
              className={`px-4 py-2 transition-all cursor-pointer ${
                activeDivision === 'all'
                  ? 'bg-[#C9A96E] text-[#0A0A0C] font-semibold shadow-md'
                  : 'text-[#8E8D88] hover:text-[#FAF8F5]'
              }`}
            >
              All Services ({servicesData.length})
            </button>
            <button
              onClick={() => setActiveDivision('real-estate')}
              className={`px-4 py-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeDivision === 'real-estate'
                  ? 'bg-[#C9A96E] text-[#0A0A0C] font-semibold shadow-md'
                  : 'text-[#8E8D88] hover:text-[#FAF8F5]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Real Estate Systems (8)</span>
            </button>
            <button
              onClick={() => setActiveDivision('ai-content')}
              className={`px-4 py-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeDivision === 'ai-content'
                  ? 'bg-[#C9A96E] text-[#0A0A0C] font-semibold shadow-md'
                  : 'text-[#8E8D88] hover:text-[#FAF8F5]'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>AI Content Studio (6)</span>
            </button>
          </div>

          {/* Quick Jump Ribbon */}
          <div className="pt-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A] block mb-2">
              Quick Directory Jump:
            </span>
            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              {filteredServices.map((service, idx) => (
                <a
                  key={service.id}
                  href={`#service-${service.id}`}
                  className="px-2.5 py-1 bg-[#101015] hover:bg-[#1A1A22] border border-[#22222A] hover:border-[#C9A96E]/50 text-[#A1A1AA] hover:text-[#FAF8F5] transition-all rounded-sm flex items-center gap-1.5"
                >
                  <span className="text-[#C9A96E] font-semibold">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="truncate max-w-[140px]">{service.title}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Structured Services List with Crystal-Clear Sectional Boundaries */}
        <section className="space-y-12">
          <div className="flex items-center justify-between pb-4 border-b border-[#202028]">
            <span className="text-xs font-mono uppercase tracking-widest text-[#71717A]">
              Showing {filteredServices.length} Engineered Service Modules
            </span>
            <span className="text-xs font-mono text-[#C9A96E]">
              Founder-Led Architecture · USA · UAE · Canada · Global
            </span>
          </div>

          <div className="space-y-12">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                id={`service-${service.id}`}
                className="scroll-mt-32 p-7 sm:p-10 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 hover:border-[#C9A96E]/60 shadow-2xl transition-all duration-300 relative group rounded-sm"
              >
                {/* Visual Service Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#1E1E26]">
                  {/* Sequence Number & Division Tag */}
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[#1A1A24] border border-[#C9A96E]/40 text-[#C9A96E] text-xs font-mono font-bold tracking-widest">
                      SERVICE {String(index + 1).padStart(2, '0')} OF {filteredServices.length}
                    </span>

                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#FAF8F5]">
                      {service.division === 'real-estate' ? (
                        <span className="inline-flex items-center gap-1.5 text-[#C9A96E]">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Real Estate Digital Systems</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[#C9A96E]">
                          <Film className="w-3.5 h-3.5" />
                          <span>AI Content Studio</span>
                        </span>
                      )}
                      <span className="text-[#3F3F46]">/</span>
                      <span className="text-[#A1A1AA]">{service.kicker}</span>
                    </div>
                  </div>

                  {/* Starting Investment Badge */}
                  <div className="flex items-center gap-2 bg-[#121218] border border-[#2A2A36] px-3.5 py-1.5 rounded-sm">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                      Investment:
                    </span>
                    <span className="text-sm font-mono text-[#FAF8F5] font-semibold">
                      Starting {format(service.startingPriceUSD)}
                    </span>
                    <span className="text-[10px] font-mono text-[#C9A96E] uppercase">
                      ({service.billingType === 'monthly'
                        ? 'per month'
                        : service.billingType === 'per-video'
                        ? 'per video'
                        : 'one-time'})
                    </span>
                  </div>
                </div>

                {/* Service Heading & Core Tagline */}
                <div className="pt-6 pb-6">
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#FAF8F5] font-semibold tracking-tight group-hover:text-[#C9A96E] transition-colors">
                    {service.title}
                  </h2>
                  <p className="text-sm sm:text-base font-mono text-[#C9A96E]/90 mt-2 tracking-wide font-light">
                    "{service.headline}"
                  </p>
                </div>

                {/* Structured Detail Compartments */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                  {/* Compartment 1: What this service builds & achieves */}
                  <div className="p-5 bg-[#121217] border border-[#1E1E26] rounded-sm space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#C9A96E] font-semibold pb-1.5 border-b border-[#1E1E26]">
                        <Layers className="w-3.5 h-3.5" />
                        <span>01 · What It Does & Solves</span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed pt-2">
                        {service.summary}
                      </p>
                    </div>

                    <div className="pt-3 text-[10px] font-mono text-[#71717A]">
                      Architecture: Direct founder engineering
                    </div>
                  </div>

                  {/* Compartment 2: Who it is engineered for */}
                  <div className="p-5 bg-[#121217] border border-[#1E1E26] rounded-sm space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#C9A96E] font-semibold pb-1.5 border-b border-[#1E1E26]">
                        <Users className="w-3.5 h-3.5" />
                        <span>02 · Engineered For</span>
                      </div>
                      <div className="pt-2">
                        <div className="p-3 bg-[#171720] border-l-2 border-[#C9A96E] text-xs sm:text-sm text-[#FAF8F5] italic leading-relaxed">
                          {service.targetAudience}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 text-[10px] font-mono text-[#71717A]">
                      Markets: USA · UAE · Canada · Global
                    </div>
                  </div>

                  {/* Compartment 3: Included Deliverables & Specifications */}
                  <div className="p-5 bg-[#121217] border border-[#1E1E26] rounded-sm space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-[#C9A96E] font-semibold pb-1.5 border-b border-[#1E1E26]">
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>03 · Key Deliverables</span>
                        </span>
                        <span className="text-[10px] text-[#71717A]">
                          {service.keyFeatures.length} Specs
                        </span>
                      </div>

                      <ul className="space-y-2 text-xs text-[#A1A1AA] pt-2">
                        {service.keyFeatures.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-2 leading-snug">
                            <Check className="w-3.5 h-3.5 text-[#C9A96E] shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 text-[10px] font-mono text-[#C9A96E]">
                      + Full production roadmap included
                    </div>
                  </div>
                </div>

                {/* Footer Action Strip for this Service */}
                <div className="mt-8 pt-6 border-t border-[#1E1E26] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <button
                    onClick={() => {
                      const route =
                        service.division === 'real-estate'
                          ? `/services/${service.slug}`
                          : `/ai-content/${service.slug}`;
                      navigate(route);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#FAF8F5] hover:text-[#C9A96E] transition-colors cursor-pointer group/link"
                  >
                    <span>Inspect Full Specifications & Scope</span>
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform text-[#C9A96E]" />
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        openInquiry({
                          serviceId: service.id,
                          title: service.title,
                          division: service.division,
                          priceUSD: service.startingPriceUSD,
                          billingFrequency: service.billingType === 'monthly' ? '/ month' : 'starting rate',
                          kicker: service.kicker,
                          features: service.keyFeatures
                        })
                      }
                      className="px-6 py-2.5 bg-[#C9A96E] text-[#0A0A0C] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#D9B97E] transition-all cursor-pointer text-center font-mono shadow-md"
                    >
                      Inquire About This Service
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Global Scope & Pricing Note */}
        <section className="p-8 bg-[#0B0B0E] border border-[#1E1E24] text-xs font-mono text-[#8E8D88] space-y-2">
          <div className="text-[#C9A96E] uppercase tracking-wider font-semibold">
            Scope & Pricing Transparency:
          </div>
          <p>
            All listed prices are starting rates. Final investment depends on operational scope, third-party integrations (e.g. Meta Ads, Bayut, MLS, WhatsApp Business APIs), data complexity, and volume. Third-party cloud infrastructure and domain registrations are billed at actual cost.
          </p>
        </section>

        {/* Bottom Consultation Banner */}
        <section className="p-10 bg-[#0E111C]/85 backdrop-blur-md border border-[#232738]/80 text-center space-y-6 shadow-xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
            <Sparkles className="w-4 h-4" />
            <span>Need A Custom Hybrid Scope?</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-[#FAF8F5]">
            We build systems tailored to your agency's exact dealflow.
          </h2>

          <p className="text-sm sm:text-base text-[#8E8D88] max-w-2xl mx-auto">
            From complete real estate transaction operating systems to 30-video monthly cinematic campaigns, discuss your specific operational bottlenecks directly with Abdussamie and Mashhood.
          </p>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={() =>
                openInquiry({
                  title: 'Custom Hybrid System & Cinematic Scope',
                  kicker: 'Founder Consultation'
                })
              }
              className="px-8 py-3.5 bg-[#C9A96E] text-[#0A0A0C] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#D9B97E] transition-all cursor-pointer font-mono"
            >
              Start Project Conversation
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="px-8 py-3.5 border border-[#2A2A34] text-[#FAF8F5] text-xs font-mono uppercase tracking-widest hover:border-[#C9A96E] transition-all cursor-pointer"
            >
              View Full Pricing Framework
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
