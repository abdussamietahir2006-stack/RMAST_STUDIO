import React, { useEffect, useState } from 'react';
import { useNavigation, useQueryParam } from '../context/NavigationContext';
import { useCurrency } from '../context/CurrencyContext';
import { useInquiry } from '../context/InquiryContext';
import { servicesData } from '../data/servicesData';
import { serviceOptions } from '../data/inquiryOptions';
import { Check, ArrowRight, Building2, Film, Layers, Users, ShieldCheck, Sparkles } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { format, formatHourly } = useCurrency();
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
    <div className="pt-30 pb-30 px-4 sm:px-6 min-h-screen">
      <div className="max-w-site mx-auto space-y-16">
        {/* Distinguished Page Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand bg-primary/10 border border-primary/20 px-3 py-1 rounded-sm">
              Studio Architecture & Catalogue
            </span>
          </div>

          <h1 className="type-h1 text-fg">
            Two Disciplines. <br />
            <span className="italic font-light text-brand">One Standard of Rigor.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted leading-relaxed font-light max-w-3xl">
            Whether architecting custom transaction pipelines for real estate firms or directing high-fashion AI campaigns, every RMAST engagement is engineered directly by the founders with complete architectural ownership.
          </p>

          {/* Interactive Division Filter Buttons */}
          <div
            role="group"
            aria-label="Filter services by division"
            className="inline-flex flex-wrap items-center p-2 bg-surface border border-line text-xs font-mono tracking-wider gap-1"
          >
            <button
              onClick={() => setActiveDivision('all')}
              className={`px-4 py-2 transition-all cursor-pointer ${
                activeDivision === 'all'
                  ? 'bg-primary text-on-primary font-semibold shadow-md'
                  : 'text-muted hover:text-fg'
              }`}
            >
              All Services ({servicesData.length})
            </button>
            <button
              onClick={() => setActiveDivision('real-estate')}
              className={`px-4 py-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeDivision === 'real-estate'
                  ? 'bg-primary text-on-primary font-semibold shadow-md'
                  : 'text-muted hover:text-fg'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Real Estate Systems (8)</span>
            </button>
            <button
              onClick={() => setActiveDivision('ai-content')}
              className={`px-4 py-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeDivision === 'ai-content'
                  ? 'bg-primary text-on-primary font-semibold shadow-md'
                  : 'text-muted hover:text-fg'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>AI Content Studio (6)</span>
            </button>
          </div>

          {/* Quick Jump Ribbon */}
          <div className="pt-2">
            <span className="text-xs font-mono uppercase tracking-widest text-subtle block mb-2">
              Quick Directory Jump:
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {filteredServices.map((service, idx) => (
                <a
                  key={service.id}
                  href={`#service-${service.id}`}
                  className="px-3 py-1 bg-surface hover:bg-surface-2 border border-line hover:border-primary/50 text-muted hover:text-fg transition-all rounded-sm flex items-center gap-2"
                >
                  <span className="text-brand font-semibold">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="truncate max-w-[140px]">{service.title}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Structured Services List with Crystal-Clear Sectional Boundaries */}
        <section className="space-y-12">
          <div className="flex items-center justify-between pb-4 border-b border-line">
            <span className="text-xs font-mono uppercase tracking-widest text-subtle">
              Showing {filteredServices.length} Engineered Service Modules
            </span>
            <span className="text-xs font-mono text-brand">
              Founder-Led Architecture · USA · UAE · Canada · Global
            </span>
          </div>

          <div className="space-y-12">
            {filteredServices.map((service, index) => (
              <div
                key={service.id}
                id={`service-${service.id}`}
                className="scroll-mt-32 p-8 sm:p-12 bg-surface-2/80 backdrop-blur-md border border-line/80 hover:border-primary/60 shadow-2xl transition-all duration-300 relative group rounded-sm"
              >
                {/* Visual Service Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-line">
                  {/* Sequence Number & Division Tag */}
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-surface-2 border border-primary/40 text-brand text-xs font-mono font-bold tracking-widest">
                      SERVICE {String(index + 1).padStart(2, '0')} OF {filteredServices.length}
                    </span>

                    <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-fg">
                      {service.division === 'real-estate' ? (
                        <span className="inline-flex items-center gap-2 text-brand">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Real Estate Digital Systems</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 text-brand">
                          <Film className="w-3.5 h-3.5" />
                          <span>AI Content Studio</span>
                        </span>
                      )}
                      <span className="text-subtle">/</span>
                      <span className="text-muted">{service.kicker}</span>
                    </div>
                  </div>

                  {/* Starting Investment Badge */}
                  <div className="flex items-center gap-2 bg-surface border border-line px-4 py-2 rounded-sm">
                    <span className="text-xs font-mono uppercase tracking-wider text-subtle">
                      Investment:
                    </span>
                    <span className="text-sm font-mono text-fg font-semibold">
                      Starting {format(service.startingPriceUSD)}
                    </span>
                    <span className="text-xs font-mono text-brand uppercase">
                      ({service.billingType === 'monthly'
                        ? 'per month'
                        : service.billingType === 'per-video'
                        ? 'per video'
                        : 'one-time'})
                    </span>
                    {service.hourlyRateUSD && (
                      <span className="text-xs font-mono text-muted border-l border-line pl-2 ml-1">
                        or {formatHourly(service.hourlyRateUSD)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Service Heading & Core Tagline */}
                <div className="pt-6 pb-6">
                  <h2 className="type-h2 text-fg group-hover:text-brand transition-colors">
                    {service.title}
                  </h2>
                  <p className="text-sm sm:text-base font-mono text-brand/90 mt-2 tracking-wide font-light">
                    "{service.headline}"
                  </p>
                </div>

                {/* Structured Detail Compartments */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                  {/* Compartment 1: What this service builds & achieves */}
                  <div className="p-6 bg-surface border border-line rounded-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand font-semibold pb-2 border-b border-line">
                        <Layers className="w-3.5 h-3.5" />
                        <span>01 · What It Does & Solves</span>
                      </div>
                      <p className="text-sm sm:text-sm text-fg leading-relaxed pt-2">
                        {service.summary}
                      </p>
                    </div>

                    <div className="pt-3 text-xs font-mono text-subtle">
                      Architecture: Direct founder engineering
                    </div>
                  </div>

                  {/* Compartment 2: Who it is engineered for */}
                  <div className="p-6 bg-surface border border-line rounded-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand font-semibold pb-2 border-b border-line">
                        <Users className="w-3.5 h-3.5" />
                        <span>02 · Engineered For</span>
                      </div>
                      <div className="pt-2">
                        <div className="p-3 bg-surface-2 border-l-2 border-primary text-xs sm:text-sm text-fg italic leading-relaxed">
                          {service.targetAudience}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 text-xs font-mono text-subtle">
                      Markets: USA · UAE · Canada · Global
                    </div>
                  </div>

                  {/* Compartment 3: Included Deliverables & Specifications */}
                  <div className="p-6 bg-surface border border-line rounded-sm space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-brand font-semibold pb-2 border-b border-line">
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>03 · Key Deliverables</span>
                        </span>
                        <span className="text-xs text-subtle">
                          {service.keyFeatures.length} Specs
                        </span>
                      </div>

                      <ul className="space-y-2 text-xs text-muted pt-2">
                        {service.keyFeatures.slice(0, 4).map((f, i) => (
                          <li key={i} className="flex items-start gap-2 leading-snug">
                            <Check className="w-3.5 h-3.5 text-brand shrink-0 mt-1" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 text-xs font-mono text-brand">
                      + Full production roadmap included
                    </div>
                  </div>
                </div>

                {/* Footer Action Strip for this Service */}
                <div className="mt-8 pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <button
                    onClick={() => {
                      const route =
                        service.division === 'real-estate'
                          ? `/services/${service.slug}`
                          : `/ai-content/${service.slug}`;
                      navigate(route);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-fg hover:text-brand transition-colors cursor-pointer group/link"
                  >
                    <span>Inspect Full Specifications & Scope</span>
                    <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform text-brand" />
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        openInquiry({
                          serviceId: service.id,
                          options: serviceOptions(service),
                          selectedOptionId: serviceOptions(service)[0]?.id,
                          title: service.title,
                          division: service.division,
                          priceUSD: service.startingPriceUSD,
                          billingFrequency: service.billingType === 'monthly' ? '/ month' : 'starting rate',
                          kicker: service.kicker,
                          features: service.keyFeatures
                        })
                      }
                      className="btn btn-primary cursor-pointer text-center"
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
        <section className="p-8 bg-surface border border-line text-xs font-mono text-muted space-y-2">
          <div className="text-brand uppercase tracking-wider font-semibold">
            Scope & Pricing Transparency:
          </div>
          <p>
            All listed prices are starting rates. Final investment depends on operational scope, third-party integrations (e.g. Meta Ads, Bayut, MLS, WhatsApp Business APIs), data complexity, and volume. Third-party cloud infrastructure and domain registrations are billed at actual cost.
          </p>
        </section>

        {/* Bottom Consultation Banner */}
        <section className="p-12 bg-surface-2/85 backdrop-blur-md border border-line/80 text-center space-y-6 shadow-xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-brand">
            <Sparkles className="w-4 h-4" />
            <span>Need A Custom Hybrid Scope?</span>
          </div>

          <h2 className="type-h2 text-fg">
            We build systems tailored to your agency's exact dealflow.
          </h2>

          <p className="text-sm sm:text-base text-muted max-w-2xl mx-auto">
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
              className="btn btn-primary cursor-pointer"
            >
              Start Project Conversation
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="btn btn-secondary cursor-pointer"
            >
              View Full Pricing Framework
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
