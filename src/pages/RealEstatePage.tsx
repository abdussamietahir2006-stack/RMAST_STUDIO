import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCurrency } from '../context/CurrencyContext';
import { useInquiry } from '../context/InquiryContext';
import { realEstatePackages } from '../data/pricingData';
import { servicesData } from '../data/servicesData';
import { WorkflowInteractive } from '../components/real-estate/WorkflowInteractive';
import {
  ArrowRight,
  Check,
  MapPin
} from 'lucide-react';

export const RealEstatePage: React.FC = () => {
  const { navigate } = useNavigation();
  const { format, currency } = useCurrency();
  const { openInquiry } = useInquiry();

  const realEstateServices = servicesData.filter((s) => s.division === 'real-estate');

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Editorial Page Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A96E]">
              Division One · Real Estate Digital Systems
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-[#FAF8F5] leading-[1.02] tracking-tight">
            We build the digital systems behind modern real-estate businesses.
          </h1>

          <p className="text-lg md:text-xl text-[#A1A1AA] leading-relaxed font-light">
            We do not sell pretty websites that sit idle. We engineer end-to-end digital infrastructure that turns cold portal inquiries into closed commissions for brokers in the United States, United Arab Emirates, and Canada.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-[#71717A]">
            <span className="flex items-center gap-1.5 text-[#E4E4E7]">
              <MapPin className="w-3.5 h-3.5 text-[#C9A96E]" />
              Target Markets: United States · UAE · Canada
            </span>
            <span>·</span>
            <span>Sub-60s Inbound Response Time</span>
            <span>·</span>
            <span>Zero Lead Leakage</span>
          </div>
        </section>

        {/* Interactive Visual Workflow */}
        <section className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
              The Operational Architecture
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#FAF8F5] font-semibold">
              The Seven-Stage Transaction Machine
            </h2>
            <p className="text-sm text-[#8E8D88] max-w-2xl">
              From the instant a buyer clicks an ad or submits an off-plan query, the RMAST automated architecture executes qualification, CRM routing, follow-up cadences, and viewing booking.
            </p>
          </div>

          <WorkflowInteractive />
        </section>

        {/* Real Estate Specific Services Deep Dive */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1E1E24]">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
                Comprehensive Capabilities
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#FAF8F5] font-semibold tracking-tight">
                Real Estate Digital Systems
              </h2>
            </div>
            <p className="text-xs font-mono text-[#71717A]">
              8 modular systems engineered to interlock seamlessly with your brokerage operations.
            </p>
          </div>

          <div className="space-y-8">
            {realEstateServices.map((service, index) => (
              <div
                key={service.id}
                className="p-7 sm:p-9 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 hover:border-[#C9A96E]/60 shadow-xl transition-all duration-300 rounded-sm relative group"
              >
                {/* Service Card Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#1E1E26]">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[#1A1A24] border border-[#C9A96E]/40 text-[#C9A96E] text-xs font-mono font-bold tracking-widest">
                      SERVICE {String(index + 1).padStart(2, '0')} OF {realEstateServices.length}
                    </span>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                      {service.kicker}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-[#121218] border border-[#2A2A36] px-3.5 py-1.5 rounded-sm">
                    <span className="text-[10px] font-mono uppercase text-[#71717A]">Starting:</span>
                    <span className="text-sm font-mono text-[#FAF8F5] font-semibold">
                      {format(service.startingPriceUSD)}
                    </span>
                    <span className="text-[10px] font-mono text-[#C9A96E] uppercase">
                      ({service.billingType === 'monthly' ? 'per month' : 'one-time'})
                    </span>
                  </div>
                </div>

                {/* Title & Headline */}
                <div className="pt-5 pb-5">
                  <h3 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] font-semibold tracking-tight group-hover:text-[#C9A96E] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-mono text-[#C9A96E]/90 mt-1 italic">
                    "{service.headline}"
                  </p>
                </div>

                {/* 3 Clear Detail Compartments */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Compartment 1: What it builds */}
                  <div className="p-4 bg-[#121217] border border-[#1E1E26] rounded-sm space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#C9A96E] font-semibold pb-1 border-b border-[#1C1C24]">
                      01 · What It Does & Solves
                    </div>
                    <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed">
                      {service.summary}
                    </p>
                  </div>

                  {/* Compartment 2: Who it is for */}
                  <div className="p-4 bg-[#121217] border border-[#1E1E26] rounded-sm space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#C9A96E] font-semibold pb-1 border-b border-[#1C1C24]">
                      02 · Engineered For
                    </div>
                    <div className="p-3 bg-[#171720] border-l-2 border-[#C9A96E] text-xs text-[#FAF8F5] italic leading-relaxed">
                      {service.targetAudience}
                    </div>
                  </div>

                  {/* Compartment 3: Included Deliverables */}
                  <div className="p-4 bg-[#121217] border border-[#1E1E26] rounded-sm space-y-2">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#C9A96E] font-semibold pb-1 border-b border-[#1C1C24] flex items-center justify-between">
                      <span>03 · Core Deliverables</span>
                      <span className="text-[10px] text-[#71717A]">{service.keyFeatures.length} Specs</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-[#A1A1AA]">
                      {service.keyFeatures.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#C9A96E] shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-6 pt-5 border-t border-[#1C1C22] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <button
                    onClick={() => navigate(`/services/${service.slug}`)}
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#FAF8F5] hover:text-[#C9A96E] cursor-pointer group/link"
                  >
                    <span>View Architectural Specifications & Scope</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C9A96E] group-hover/link:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() =>
                      openInquiry({
                        serviceId: service.id,
                        title: service.title,
                        division: 'real-estate',
                        priceUSD: service.startingPriceUSD,
                        billingFrequency: service.billingType === 'monthly' ? '/ month' : 'one-time starting',
                        kicker: service.kicker,
                        features: service.keyFeatures
                      })
                    }
                    className="px-5 py-2 bg-[#C9A96E] text-[#0A0A0C] text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#D9B97E] transition-all cursor-pointer text-center"
                  >
                    Inquire This System
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Real Estate Packages Section */}
        <section className="space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
              Investment Packages
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#FAF8F5] font-semibold">
              Real Estate System Packages
            </h2>
            <p className="text-sm text-[#8E8D88]">
              Final pricing depends on scope, integrations, and requirements. Currency displayed in {currency}.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {realEstatePackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-8 rounded-sm border flex flex-col justify-between space-y-8 ${
                  pkg.highlight
                    ? 'bg-[#101015] border-[#C9A96E] shadow-xl relative'
                    : 'bg-[#0A0A0D] border-[#1E1E24]'
                }`}
              >
                {pkg.highlight && (
                  <div className="absolute -top-3 left-8 px-3 py-0.5 bg-[#C9A96E] text-[#0A0A0C] text-[10px] font-mono uppercase tracking-widest font-bold">
                    Most Popular Pipeline
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-[#71717A]">
                      {pkg.tier}
                    </span>
                    <h3 className="font-serif text-2xl text-[#FAF8F5] font-semibold mt-1">
                      {pkg.title}
                    </h3>
                  </div>

                  <div>
                    <div className="text-3xl font-serif font-bold text-[#FAF8F5]">
                      {format(pkg.priceUSD)}
                    </div>
                    <div className="text-xs font-mono text-[#71717A] mt-1">
                      Starting from · One-time investment
                    </div>
                  </div>

                  <p className="text-xs text-[#A1A1AA] italic">
                    Best for: {pkg.bestFor}
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#C9A96E]">
                      What's Included:
                    </div>
                    <ul className="space-y-2 text-xs text-[#D4D4D8]">
                      {pkg.included.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-[#C9A96E] shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {pkg.notIncluded && pkg.notIncluded.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[#1C1C22]">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                        Not Included:
                      </div>
                      <ul className="space-y-1 text-[11px] text-[#71717A]">
                        {pkg.notIncluded.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#52525B]">✕</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  onClick={() =>
                    openInquiry({
                      packageId: pkg.id,
                      title: pkg.title,
                      division: 'real-estate',
                      priceUSD: pkg.priceUSD,
                      billingFrequency: pkg.billingFrequency,
                      kicker: `${pkg.tier} Tier`,
                      features: pkg.included
                    })
                  }
                  className={`w-full py-3.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all cursor-pointer ${
                    pkg.highlight
                      ? 'bg-[#C9A96E] text-[#0A0A0C] hover:bg-[#D9B97E]'
                      : 'border border-[#27272A] text-[#FAF8F5] hover:border-[#C9A96E]'
                  }`}
                >
                  {pkg.ctaText || 'Build System'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Banner */}
        <section className="p-10 bg-[#0E111C]/85 backdrop-blur-md border border-[#232738]/80 text-center space-y-6 shadow-xl">
          <h3 className="font-serif text-3xl text-[#FAF8F5] font-semibold">
            Ready to stop losing leads to delayed responses?
          </h3>
          <p className="text-sm text-[#8E8D88] max-w-xl mx-auto">
            Book a system discovery call directly with Raja Muhammad Abdussamie Tahir. We will audit your current workflow and map your automated pipeline.
          </p>
          <div>
            <button
              onClick={() =>
                openInquiry({
                  title: 'Real Estate Custom Infrastructure Audit',
                  division: 'real-estate',
                  kicker: 'Founder Scoping'
                })
              }
              className="px-8 py-3.5 bg-[#C9A96E] text-[#0A0A0C] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#D9B97E] transition-all cursor-pointer"
            >
              Start Real Estate Consultation
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
