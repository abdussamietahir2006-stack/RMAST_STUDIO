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
  const { format, currency } = useCurrency();
  const { openInquiry } = useInquiry();

  const service = servicesData.find((s) => s.slug === slug && s.division === division);

  if (!service) {
    return <NotFoundPage />;
  }

  const relatedServices = servicesData.filter((s) =>
    service.relatedServiceSlugs?.includes(s.slug)
  );

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Back navigation */}
        <div>
          <button
            onClick={() =>
              navigate(service.division === 'real-estate' ? '/real-estate' : '/ai-content')
            }
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#71717A] hover:text-[#C9A96E] transition-colors cursor-pointer"
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
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A96E]">
              {service.kicker}
            </span>
            <span className="text-[#3F3F46]">·</span>
            <span className="text-xs font-mono text-[#71717A] uppercase">
              {service.division === 'real-estate' ? 'Real Estate Practice' : 'AI Content Studio'}
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-[#FAF8F5] leading-[1.02] tracking-tight max-w-4xl">
            {service.title}
          </h1>

          <p className="text-xl md:text-2xl text-[#C9A96E] font-serif italic max-w-3xl leading-relaxed">
            "{service.headline}"
          </p>

          <p className="text-base text-[#A1A1AA] leading-relaxed max-w-3xl font-light">
            {service.summary}
          </p>

          {/* Pricing Highlight Card */}
          <div className="p-8 bg-[#0E111C]/85 backdrop-blur-md border border-[#232738]/80 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-3xl shadow-xl">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                Starting Investment Tier
              </div>
              <div className="text-3xl font-serif font-bold text-[#FAF8F5] mt-1">
                {format(service.startingPriceUSD)}
                <span className="text-xs font-mono font-normal text-[#71717A] ml-2">
                  {service.billingType === 'monthly'
                    ? '/ month'
                    : service.billingType === 'per-video'
                    ? '/ video'
                    : 'starting quote'}
                </span>
              </div>
              <div className="text-xs font-mono text-[#71717A] mt-1">
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
                className="px-6 py-3.5 bg-[#C9A96E] text-[#0A0A0C] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#D9B97E] transition-all cursor-pointer whitespace-nowrap"
              >
                Inquire This Service
              </button>
            </div>
          </div>
        </section>

        {/* Feature Image */}
        <section className="relative aspect-[21/9] overflow-hidden bg-[#141418] border border-[#1E1E24]">
          <ServiceMedia service={service} className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080A] via-transparent to-transparent" />
        </section>

        {/* Two Column Architectural Breakdown */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
          {/* Left Column: Scope & Features (7 cols) */}
          <div className="lg:col-span-7 space-y-10">
            <div className="space-y-4">
              <h2 className="font-serif text-2xl text-[#FAF8F5] font-semibold">
                Engineered Capabilities
              </h2>
              <p className="text-sm text-[#8E8D88] leading-relaxed">
                Every component is built for speed, durability, and seamless integration with your operations.
              </p>

              <ul className="space-y-3 pt-2">
                {service.keyFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-[#D4D4D8]">
                    <Check className="w-4 h-4 text-[#C9A96E] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 pt-6 border-t border-[#1C1C22]">
              <h2 className="font-serif text-2xl text-[#FAF8F5] font-semibold">
                Tangible Deliverables Handed Over
              </h2>
              <p className="text-sm text-[#8E8D88] leading-relaxed">
                What you receive upon completion and staging.
              </p>

              <ul className="space-y-3 pt-2">
                {service.deliverables.map((deliv, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-[#D4D4D8]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C9A96E] mt-2 shrink-0" />
                    <span>{deliv}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Audience & Boundaries (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="p-6 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 space-y-3 shadow-md">
              <div className="text-xs font-mono uppercase tracking-widest text-[#C9A96E]">
                Designed Specifically For
              </div>
              <p className="text-sm text-[#FAF8F5] leading-relaxed">
                {service.targetAudience}
              </p>
            </div>

            {service.scopeNotes && (
              <div className="p-6 bg-[#0A0C14]/80 border border-[#1E2232] space-y-3 text-xs">
                <div className="text-xs font-mono uppercase tracking-widest text-[#71717A] flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#C9A96E]" />
                  <span>Scope Boundaries & Exclusions</span>
                </div>
                <p className="text-[#8E8D88] leading-relaxed">
                  {service.scopeNotes}
                </p>
              </div>
            )}

            <div className="p-6 bg-[#0E0E12] border border-[#222228] space-y-4">
              <div className="text-xs font-mono uppercase tracking-widest text-[#FAF8F5]">
                Direct Founder Handover
              </div>
              <p className="text-xs text-[#8E8D88] leading-relaxed">
                Every project is architected and executed directly by founders Raja Muhammad Abdussamie Tahir and Mashhood.
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="w-full py-3 bg-[#17171E] border border-[#2B2B36] text-[#FAF8F5] hover:border-[#C9A96E] text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Schedule Scoping Session
              </button>
            </div>
          </div>
        </section>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <section className="space-y-8 pt-12 border-t border-[#1C1C22]">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
                Interlocking Capabilities
              </span>
              <h3 className="font-serif text-2xl text-[#FAF8F5] font-semibold">
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
                  className="p-6 bg-[#0C0C10] border border-[#1E1E24] hover:border-[#C9A96E]/50 transition-all cursor-pointer space-y-3"
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C9A96E]">
                    {rel.kicker}
                  </span>
                  <h4 className="font-serif text-lg text-[#FAF8F5] font-medium">
                    {rel.title}
                  </h4>
                  <p className="text-xs text-[#8E8D88] line-clamp-2">
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
