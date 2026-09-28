import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCurrency } from '../context/CurrencyContext';
import { useInquiry } from '../context/InquiryContext';
import { realEstatePackages } from '../data/pricingData';
import { packageOptions, serviceOptions } from '../data/inquiryOptions';
import { servicesData } from '../data/servicesData';
import { WorkflowInteractive } from '../components/real-estate/WorkflowInteractive';
import {
  ArrowRight,
  Check,
  MapPin
} from 'lucide-react';

export const RealEstatePage: React.FC = () => {
  const { navigate } = useNavigation();
  const { format, formatHourly, currency } = useCurrency();
  const { openInquiry } = useInquiry();

  const realEstateServices = servicesData.filter((s) => s.division === 'real-estate');

  return (
    <div className="pt-30 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-site mx-auto space-y-24">
        {/* Editorial Page Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">
              Division One · Real Estate Digital Systems
            </span>
          </div>

          <h1 className="type-h1 text-fg">
            We build the digital systems behind modern real-estate businesses.
          </h1>

          <p className="text-lg md:text-xl text-muted leading-relaxed font-light">
            We do not sell pretty websites that sit idle. We engineer end-to-end digital infrastructure that turns cold portal inquiries into closed commissions for brokers in the United States, United Arab Emirates, and Canada.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-subtle">
            <span className="flex items-center gap-2 text-fg">
              <MapPin className="w-3.5 h-3.5 text-brand" />
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
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
              The Operational Architecture
            </span>
            <h2 className="type-h2 text-fg">
              The Seven-Stage Transaction Machine
            </h2>
            <p className="text-sm text-muted max-w-2xl">
              From the instant a buyer clicks an ad or submits an off-plan query, the RMAST automated architecture executes qualification, CRM routing, follow-up cadences, and viewing booking.
            </p>
          </div>

          <WorkflowInteractive />
        </section>

        {/* Real Estate Specific Services Deep Dive */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-line">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
                Comprehensive Capabilities
              </span>
              <h2 className="type-h2 text-fg">
                Real Estate Digital Systems
              </h2>
            </div>
            <p className="text-sm font-mono text-subtle">
              8 modular systems engineered to interlock seamlessly with your brokerage operations.
            </p>
          </div>

          <div className="space-y-8">
            {realEstateServices.map((service, index) => (
              <div
                key={service.id}
                className="p-8 sm:p-8 bg-surface-2/80 backdrop-blur-md border border-line/80 hover:border-primary/60 shadow-sm transition-all duration-300 rounded-sm relative group"
              >
                {/* Service Card Top Header */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-line">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-surface-2 border border-primary/40 text-brand text-xs font-mono font-bold tracking-widest">
                      SERVICE {String(index + 1).padStart(2, '0')} OF {realEstateServices.length}
                    </span>
                    <span className="text-xs font-mono uppercase tracking-wider text-muted">
                      {service.kicker}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-surface border border-line px-4 py-2 rounded-sm">
                    <span className="text-xs font-mono uppercase text-subtle">Starting:</span>
                    <span className="text-sm font-mono text-fg font-semibold">
                      {format(service.startingPriceUSD)}
                    </span>
                    <span className="text-xs font-mono text-brand uppercase">
                      ({service.billingType === 'monthly' ? 'per month' : 'one-time'})
                    </span>
                    {service.hourlyRateUSD && (
                      <span className="text-xs font-mono text-muted border-l border-line pl-2 ml-1">
                        or {formatHourly(service.hourlyRateUSD)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Headline */}
                <div className="pt-6 pb-6">
                  <h3 className="type-h3 text-fg group-hover:text-brand transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm sm:text-sm font-mono text-brand/90 mt-1 italic">
                    "{service.headline}"
                  </p>
                </div>

                {/* 3 Clear Detail Compartments */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Compartment 1: What it builds */}
                  <div className="p-4 bg-surface border border-line rounded-sm space-y-2">
                    <div className="text-xs font-mono uppercase tracking-widest text-brand font-semibold pb-1 border-b border-line">
                      01 · What It Does & Solves
                    </div>
                    <p className="text-sm sm:text-sm text-fg leading-relaxed">
                      {service.summary}
                    </p>
                  </div>

                  {/* Compartment 2: Who it is for */}
                  <div className="p-4 bg-surface border border-line rounded-sm space-y-2">
                    <div className="text-xs font-mono uppercase tracking-widest text-brand font-semibold pb-1 border-b border-line">
                      02 · Engineered For
                    </div>
                    <div className="p-3 bg-surface-2 border-l-2 border-primary text-xs text-fg italic leading-relaxed">
                      {service.targetAudience}
                    </div>
                  </div>

                  {/* Compartment 3: Included Deliverables */}
                  <div className="p-4 bg-surface border border-line rounded-sm space-y-2">
                    <div className="text-xs font-mono uppercase tracking-widest text-brand font-semibold pb-1 border-b border-line flex items-center justify-between">
                      <span>03 · Core Deliverables</span>
                      <span className="text-xs text-subtle">{service.keyFeatures.length} Specs</span>
                    </div>
                    <ul className="space-y-2 text-xs text-muted">
                      {service.keyFeatures.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-brand shrink-0 mt-1" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-6 pt-6 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <button
                    onClick={() => navigate(`/services/${service.slug}`)}
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-fg hover:text-brand cursor-pointer group/link"
                  >
                    <span>View Architectural Specifications & Scope</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand group-hover/link:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() =>
                      openInquiry({
                        serviceId: service.id,
                        options: serviceOptions(service),
                        selectedOptionId: serviceOptions(service)[0]?.id,
                        title: service.title,
                        division: 'real-estate',
                        priceUSD: service.startingPriceUSD,
                        billingFrequency: service.billingType === 'monthly' ? '/ month' : 'one-time starting',
                        kicker: service.kicker,
                        features: service.keyFeatures
                      })
                    }
                    className="btn btn-primary cursor-pointer text-center"
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
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
              Investment Packages
            </span>
            <h2 className="type-h2 text-fg">
              Real Estate System Packages
            </h2>
            <p className="text-sm text-muted">
              Final pricing depends on scope, integrations, and requirements. Currency displayed in {currency}.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {realEstatePackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-8 rounded-sm border flex flex-col justify-between space-y-8 ${
                  pkg.highlight
                    ? 'bg-surface border-primary shadow-sm relative'
                    : 'bg-surface border-line'
                }`}
              >
                {pkg.highlight && (
                  <div className="absolute -top-3 left-8 px-3 py-1 bg-primary text-on-primary text-xs font-mono uppercase tracking-widest font-bold">
                    Most Popular Pipeline
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-subtle">
                      {pkg.tier}
                    </span>
                    <h3 className="type-h3 text-fg mt-1">
                      {pkg.title}
                    </h3>
                  </div>

                  <div>
                    <div className="text-3xl font-serif font-bold text-fg">
                      {format(pkg.priceUSD)}
                    </div>
                    <div className="text-xs font-mono text-subtle mt-1">
                      Starting from · One-time investment
                    </div>
                  </div>

                  <p className="text-sm text-muted italic">
                    Best for: {pkg.bestFor}
                  </p>

                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-brand">
                      What's Included:
                    </div>
                    <ul className="space-y-2 text-xs text-fg">
                      {pkg.included.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-brand shrink-0 mt-1" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {pkg.notIncluded && pkg.notIncluded.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-line">
                      <div className="text-xs font-mono uppercase tracking-wider text-subtle">
                        Not Included:
                      </div>
                      <ul className="space-y-1 text-xs text-subtle">
                        {pkg.notIncluded.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-subtle">✕</span>
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
                      options: packageOptions(realEstatePackages),
                      selectedOptionId: pkg.id,
                      title: pkg.title,
                      division: 'real-estate',
                      priceUSD: pkg.priceUSD,
                      billingFrequency: pkg.billingFrequency,
                      kicker: `${pkg.tier} Tier`,
                      features: pkg.included
                    })
                  }
                  className={`btn w-full ${pkg.highlight ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {pkg.ctaText || 'Build System'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom Banner */}
        <section className="p-12 bg-surface-2/85 backdrop-blur-md border border-line/80 text-center space-y-6 shadow-sm">
          <h3 className="type-h3 text-fg">
            Ready to stop losing leads to delayed responses?
          </h3>
          <p className="text-sm text-muted max-w-xl mx-auto">
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
              className="btn btn-primary cursor-pointer"
            >
              Start Real Estate Consultation
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
