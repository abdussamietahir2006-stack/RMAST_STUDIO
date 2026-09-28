import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCurrency } from '../context/CurrencyContext';
import { useInquiry } from '../context/InquiryContext';
import { servicesData } from '../data/servicesData';
import { serviceOptions } from '../data/inquiryOptions';
import { NotFoundPage } from './NotFoundPage';
import { ServiceMedia } from '../components/media/ServiceMedia';
import {
  ArrowLeft,
  Check,
  HelpCircle
} from 'lucide-react';

interface ServiceDetailPageProps {
  slug: string;
  division: 'real-estate' | 'ai-content';
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ slug, division }) => {
  const { navigate } = useNavigation();
  const { format, formatHourly, currency } = useCurrency();
  const { openInquiry } = useInquiry();

  const service = servicesData.find((s) => s.slug === slug && s.division === division);

  if (!service) {
    return <NotFoundPage />;
  }

  const relatedServices = servicesData.filter((s) =>
    service.relatedServiceSlugs?.includes(s.slug)
  );

  return (
    <div className="pt-30 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Back navigation */}
        <div>
          <button
            onClick={() =>
              navigate(service.division === 'real-estate' ? '/real-estate' : '/ai-content')
            }
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-subtle hover:text-brand transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              Back to {service.division === 'real-estate' ? 'Real Estate Systems' : 'AI Content Studio'}
            </span>
          </button>
        </div>

        {/* Hero Section */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">
              {service.kicker}
            </span>
            <span className="text-subtle">·</span>
            <span className="text-xs font-mono text-subtle uppercase">
              {service.division === 'real-estate' ? 'Real Estate Practice' : 'AI Content Studio'}
            </span>
          </div>

          <h1 className="type-h1 text-fg max-w-4xl">
            {service.title}
          </h1>

          <p className="text-xl md:text-2xl text-brand font-serif italic max-w-3xl leading-relaxed">
            "{service.headline}"
          </p>

          <p className="text-base text-muted leading-relaxed max-w-3xl font-light">
            {service.summary}
          </p>

          {/* Pricing Highlight Card */}
          <div className="p-8 bg-surface-2/85 backdrop-blur-md border border-line/80 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-3xl shadow-sm rounded-card">
            <div>
              <div className="text-xs font-mono uppercase tracking-widest text-subtle">
                Starting Investment Tier
              </div>
              <div className="text-3xl font-serif font-bold text-fg mt-1">
                {format(service.startingPriceUSD)}
                <span className="text-xs font-mono font-normal text-subtle ml-2">
                  {service.billingType === 'monthly'
                    ? '/ month'
                    : service.billingType === 'per-video'
                    ? '/ video'
                    : 'starting quote'}
                </span>
              </div>
              {service.hourlyRateUSD && (
                <div className="text-sm font-mono text-brand mt-2">
                  Hourly: {formatHourly(service.hourlyRateUSD)}
                </div>
              )}
              <div className="text-xs font-mono text-subtle mt-1">
                Values calculated dynamically in {currency}.
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  openInquiry({
                    serviceId: service.id,
                    options: serviceOptions(service),
                    selectedOptionId: serviceOptions(service)[0]?.id,
                    title: service.title,
                    division: service.division,
                    priceUSD: service.startingPriceUSD,
                    billingFrequency:
                      service.billingType === 'monthly'
                        ? '/ month'
                        : service.billingType === 'per-video'
                        ? '/ video'
                        : 'starting quote',
                    kicker: service.kicker,
                    features: service.keyFeatures
                  })
                }
                className="btn btn-primary cursor-pointer whitespace-nowrap"
              >
                Inquire This Service
              </button>
            </div>
          </div>
        </section>

        {/* Feature Image */}
        <section className="relative aspect-[21/9] overflow-hidden bg-surface border border-line">
          <ServiceMedia service={service} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-transparent to-transparent" />
        </section>

        {/* Two Column Architectural Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
          {/* Left Column: Scope & Features (7 cols) */}
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-4">
              <h2 className="type-h3 text-fg">
                Engineered Capabilities
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                Every component is built for speed, durability, and seamless integration with your operations.
              </p>

              <ul className="space-y-3 pt-2">
                {service.keyFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-fg">
                    <Check className="w-4 h-4 text-brand shrink-0 mt-1" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 pt-6 border-t border-line">
              <h2 className="type-h3 text-fg">
                Tangible Deliverables Handed Over
              </h2>
              <p className="text-sm text-muted leading-relaxed">
                What you receive upon completion and staging.
              </p>

              <ul className="space-y-3 pt-2">
                {service.deliverables.map((deliv, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-fg">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{deliv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Audience & Boundaries (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-6 bg-surface-2/80 backdrop-blur-md border border-line/80 space-y-3 shadow-md rounded-card">
              <div className="text-xs font-mono uppercase tracking-widest text-brand">
                Designed Specifically For
              </div>
              <p className="text-sm text-fg leading-relaxed">
                {service.targetAudience}
              </p>
            </div>

            {service.scopeNotes && (
              <div className="p-6 bg-surface/80 border border-line space-y-3 text-xs rounded-card">
                <div className="text-xs font-mono uppercase tracking-widest text-subtle flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-brand" />
                  <span>Scope Boundaries & Exclusions</span>
                </div>
                <p className="text-muted leading-relaxed">
                  {service.scopeNotes}
                </p>
              </div>
            )}

            <div className="p-6 bg-surface border border-line space-y-4 rounded-card">
              <div className="text-xs font-mono uppercase tracking-widest text-fg">
                Direct Founder Handover
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Every project is architected and executed directly by founders Raja Muhammad Abdussamie Tahir and Mashhood.
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="btn btn-secondary w-full cursor-pointer"
              >
                Schedule Scoping Session
              </button>
            </div>
          </div>
        </section>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <section className="space-y-8 pt-12 border-t border-line">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
                Interlocking Capabilities
              </span>
              <h3 className="type-h3 text-fg">
                Often Deployed Together
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedServices.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => {
                    const r =
                      rel.division === 'real-estate'
                        ? `/services/${rel.slug}`
                        : `/ai-content/${rel.slug}`;
                    navigate(r);
                  }}
                  className="p-6 bg-surface border border-line hover:border-primary/50 transition-all cursor-pointer space-y-3 rounded-card"
                >
                  <span className="text-xs font-mono uppercase tracking-wider text-brand">
                    {rel.kicker}
                  </span>
                  <h4 className="type-h4 text-fg">
                    {rel.title}
                  </h4>
                  <p className="text-sm text-muted line-clamp-2">
                    {rel.summary}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
