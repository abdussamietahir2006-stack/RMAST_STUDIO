import React, { useEffect, useState } from 'react';
import { useQueryParam } from '../context/NavigationContext';
import { useCurrency } from '../context/CurrencyContext';
import { useInquiry } from '../context/InquiryContext';
import { CurrencyToggle } from '../components/common/CurrencyToggle';
import {
  realEstatePackages,
  aiContentPackages,
  completeBusinessPackages,
  singleServicePricing,
  aiVideoSinglePricing,
  videoMonthlyBundles,
  aiPostSinglePricing,
  postMonthlyBundles,
  addOnItems
} from '../data/pricingData';
import { packageOptions, postBundleOptions, videoBundleOptions } from '../data/inquiryOptions';
import {
  Check,
  Building2,
  Film,
  Briefcase,
  ShieldAlert
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { format, formatHourly } = useCurrency();
  const { openInquiry } = useInquiry();
  const divisionParam = useQueryParam('division');
  const [activeTab, setActiveTab] = useState<'real-estate' | 'ai-content' | 'complete-business'>(
    'real-estate'
  );

  // Deep links from the navbar (/pricing?division=ai-content) open that tab
  useEffect(() => {
    if (divisionParam === 'real-estate' || divisionParam === 'ai-content' || divisionParam === 'complete-business') {
      setActiveTab(divisionParam);
    }
  }, [divisionParam]);

  return (
    <div className="pt-30 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-site mx-auto space-y-24">
        {/* Page Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">
              Investment Framework
            </span>
          </div>

          <h1 className="type-h1 text-fg">
            Transparent Investment. <br />
            <span className="italic font-light text-brand">Predictable Returns.</span>
          </h1>

          <p className="text-base sm:text-lg text-muted leading-relaxed font-light">
            We operate with strict pricing transparency. All figures represent RMAST baseline architectural and creative deliverables. Final investment is scoped against your exact data schemas, integrations, and operational requirements.
          </p>

          {/* Currency Toggle & Disclaimer Header */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 p-4 bg-surface-2/80 backdrop-blur-md border border-line/80 shadow-md rounded-card">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-subtle uppercase tracking-wider">
                Select Currency:
              </span>
              <CurrencyToggle />
            </div>

            <div className="text-xs font-mono text-subtle">
              1 USD ≈ 3.6725 AED · Rounded clean figures · No decimal noise
            </div>
          </div>
        </section>

        {/* Major Category Tabs */}
        <section className="space-y-12">
          <div className="flex items-center justify-center">
            <div
              role="tablist"
              aria-label="Pricing package categories"
              className="inline-flex p-2 bg-surface-2/80 backdrop-blur-md border border-line/80 rounded-sm gap-2"
            >
              <button
                role="tab"
                aria-selected={activeTab === 'real-estate'}
                onClick={() => setActiveTab('real-estate')}
                className={`flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'real-estate'
                    ? 'bg-primary text-on-primary font-bold shadow-md'
                    : 'text-muted hover:text-fg'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Real Estate Systems</span>
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'ai-content'}
                onClick={() => setActiveTab('ai-content')}
                className={`flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'ai-content'
                    ? 'bg-primary text-on-primary font-bold shadow-md'
                    : 'text-muted hover:text-fg'
                }`}
              >
                <Film className="w-4 h-4" />
                <span>AI Content Studio</span>
              </button>

              <button
                role="tab"
                aria-selected={activeTab === 'complete-business'}
                onClick={() => setActiveTab('complete-business')}
                className={`flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'complete-business'
                    ? 'bg-primary text-on-primary font-bold shadow-md'
                    : 'text-muted hover:text-fg'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Complete Business Packages</span>
              </button>
            </div>
          </div>

          {/* TAB 1: REAL ESTATE PACKAGES */}
          {activeTab === 'real-estate' && (
            <div className="space-y-12">
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
                        Brokerage Standard
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
                        <div className="text-4xl font-serif font-bold text-fg">
                          {format(pkg.priceUSD)}
                        </div>
                        <div className="text-xs font-mono text-subtle mt-1">
                          Starting from · One-time engineering
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

                      {pkg.notIncluded && (
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
                      {pkg.ctaText}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: AI CONTENT PACKAGES & BUNDLES */}
          {activeTab === 'ai-content' && (
            <div className="space-y-16">
              {/* Individual Single Video Rates */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
                    Per Video Production
                  </span>
                  <h3 className="type-h3 text-fg">
                    Single Video Tier Benchmarks
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {aiVideoSinglePricing.map((item) => (
                    <div
                      key={item.tier}
                      className={`p-6 bg-surface border space-y-4 ${
                        item.tier === 'Professional'
                          ? 'border-primary'
                          : 'border-line'
                      }`}
                    >
                      <div className="text-xs font-mono uppercase text-subtle">
                        {item.tier} Tier
                      </div>
                      <div className="text-3xl font-serif font-bold text-fg">
                        {format(item.priceUSD)}
                        <span className="text-xs font-mono font-normal text-subtle ml-2">
                          / video
                        </span>
                      </div>
                      <p className="text-sm text-muted leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Packages (10, 20, 30 videos) */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-line">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
                      Monthly Volume Retainers
                    </span>
                    <h3 className="type-h3 text-fg mt-1">
                      Batch Content Bundles with Verified Savings
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-subtle">
                    Delivered on structured weekly staging cadences.
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {videoMonthlyBundles.map((b) => (
                    <div
                      key={b.quantity}
                      className="p-8 bg-surface border border-line space-y-6 flex flex-col justify-between rounded-card"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-serif font-bold text-fg">
                            {b.quantity} Videos / Mo
                          </span>
                          <span className="text-xs font-mono px-2 py-1 bg-surface-2 text-brand border border-primary/30">
                            {b.savingsLabel}
                          </span>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-line text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-muted">Starter Grade:</span>
                            <span className="text-fg font-semibold">
                              {format(b.starter.usd)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted">Standard Motion:</span>
                            <span className="text-fg font-semibold">
                              {format(b.standard.usd)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-brand">Professional Cinema:</span>
                            <span className="text-fg font-bold">
                              {format(b.professional.usd)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          openInquiry({
                            title: `${b.quantity}-Video Monthly Content Retainer`,
                            division: 'ai-content',
                            priceUSD: b.standard.usd,
                            billingFrequency: '/ month',
                            kicker: b.savingsLabel,
                            options: videoBundleOptions(b.quantity),
                            selectedOptionId: 'Standard',
                            features: [
                              `${b.quantity} custom videos / month`,
                              'TikTok & Instagram 9:16 + 16:9 widescreen formats',
                              'Sound design, color grading & 4K delivery'
                            ]
                          })
                        }
                        className="btn btn-primary w-full cursor-pointer"
                      >
                        Order {b.quantity}-Video Bundle
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI static posts: half the per-video rates */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
                    AI Static Posts
                  </span>
                  <h3 className="type-h3 text-fg">Single Post Rates & Monthly Post Bundles</h3>
                  <p className="text-sm text-muted">Designed static posts for feeds and ads, with caption and hashtags. Half the price of a video.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {aiPostSinglePricing.map((item) => (
                    <div
                      key={item.tier}
                      className={`p-6 bg-surface border space-y-4 ${item.tier === 'Professional' ? 'border-primary' : 'border-line'}`}
                    >
                      <div className="text-xs font-mono uppercase text-subtle">{item.tier} Post</div>
                      <div className="text-3xl font-serif font-bold text-fg">
                        {format(item.priceUSD)}
                        <span className="text-xs font-mono font-normal text-subtle ml-2">/ post</span>
                      </div>
                      <p className="text-sm text-muted leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {postMonthlyBundles.map((b) => (
                    <div key={b.quantity} className="p-6 bg-surface border border-line space-y-4 flex flex-col justify-between rounded-card">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xl font-serif font-bold text-fg">{b.quantity} Posts / Mo</span>
                          <span className="text-xs font-mono px-2 py-1 bg-surface-2 text-brand border border-primary/30 text-right">
                            {b.savingsLabel}
                          </span>
                        </div>
                        <div className="space-y-2 pt-3 border-t border-line text-xs font-mono">
                          {(
                            [
                              ['Starter', b.starter.usd],
                              ['Standard', b.standard.usd],
                              ['Professional', b.professional.usd]
                            ] as const
                          ).map(([name, usd]) => (
                            <div key={name} className="flex justify-between">
                              <span className={name === 'Professional' ? 'text-brand' : 'text-muted'}>{name}:</span>
                              <span className="text-fg font-semibold">{format(usd)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          openInquiry({
                            title: `${b.quantity}-Post Monthly Retainer`,
                            division: 'ai-content',
                            priceUSD: b.standard.usd,
                            billingFrequency: '/ month',
                            kicker: b.savingsLabel,
                            options: postBundleOptions(b.quantity),
                            selectedOptionId: 'Standard',
                            features: [`${b.quantity} static posts / month`, 'Content calendar and captions', 'Feed, story and ad sizes']
                          })
                        }
                        className="btn btn-secondary w-full cursor-pointer"
                      >
                        Order {b.quantity}-Post Bundle
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Content Packages */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
                    Curated Campaigns
                  </span>
                  <h3 className="type-h3 text-fg">
                    Turnkey Brand Campaign Packages
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {aiContentPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`p-8 bg-surface border flex flex-col justify-between space-y-6 ${
                        pkg.highlight ? 'border-primary' : 'border-line'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="text-xs font-mono uppercase text-subtle">
                          {pkg.tier}
                        </div>
                        <h4 className="type-h4 text-fg">
                          {pkg.title}
                        </h4>
                        <div className="text-3xl font-serif font-bold text-fg">
                          {format(pkg.priceUSD)}
                        </div>
                        <p className="text-sm text-muted italic">
                          Best for: {pkg.bestFor}
                        </p>
                        <ul className="space-y-2 text-xs text-fg pt-2">
                          {pkg.included.map((inc, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-brand shrink-0 mt-1" />
                              <span>{inc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <button
                        onClick={() =>
                          openInquiry({
                            packageId: pkg.id,
                            options: packageOptions(aiContentPackages),
                            selectedOptionId: pkg.id,
                            title: pkg.title,
                            division: 'ai-content',
                            priceUSD: pkg.priceUSD,
                            billingFrequency: pkg.billingFrequency,
                            kicker: `${pkg.tier} Tier`,
                            features: pkg.included
                          })
                        }
                        className="btn btn-secondary w-full cursor-pointer"
                      >
                        {pkg.ctaText}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPLETE BUSINESS PACKAGES */}
          {activeTab === 'complete-business' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {completeBusinessPackages.map((pkg) => (
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
                        Full Enterprise Growth
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
                        <div className="text-4xl font-serif font-bold text-fg">
                          {format(pkg.priceUSD)}
                        </div>
                        <div className="text-xs font-mono text-subtle mt-1">
                          Starting from · Full System Integration
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
                    </div>

                    <button
                      onClick={() =>
                        openInquiry({
                          packageId: pkg.id,
                          options: packageOptions(completeBusinessPackages),
                          selectedOptionId: pkg.id,
                          title: pkg.title,
                          division: 'general',
                          priceUSD: pkg.priceUSD,
                          billingFrequency: pkg.billingFrequency,
                          kicker: `${pkg.tier} Enterprise`,
                          features: pkg.included
                        })
                      }
                      className={`btn w-full ${pkg.highlight ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {pkg.ctaText}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* INDIVIDUAL SERVICES BASELINE TABLE */}
        <section className="space-y-8">
          <div className="space-y-2 pb-4 border-b border-line">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
              Individual Service Catalog
            </span>
            <h2 className="type-h3 text-fg">
              Standalone Services Starting Benchmarks
            </h2>
            <p className="text-sm font-mono text-subtle">
              For specialized mandates outside bundled packages.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface text-muted font-mono uppercase tracking-wider border-b border-line">
                <tr>
                  <th className="py-4 px-6">Service</th>
                  <th className="py-4 px-6">Starting Rate</th>
                  <th className="py-4 px-6">Hourly Rate</th>
                  <th className="py-4 px-6">Included Baseline Scope</th>
                  <th className="py-4 px-6">Key Exclusions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-fg">
                {singleServicePricing.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface transition-colors">
                    <td className="py-4 px-6 font-medium text-fg">
                      {item.service}
                    </td>
                    <td className="py-4 px-6 font-mono text-brand whitespace-nowrap font-bold">
                      {format(item.startingUSD)}
                      <span className="text-xs font-normal text-subtle ml-1">
                        ({item.billing})
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-fg whitespace-nowrap">
                      {formatHourly(item.hourlyRateUSD)}
                    </td>
                    <td className="py-4 px-6 text-muted max-w-xs leading-relaxed">
                      {item.scope}
                    </td>
                    <td className="py-4 px-6 text-subtle max-w-xs leading-relaxed">
                      {item.exclusions}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* DEDICATED ADD-ONS SECTION */}
        <section className="space-y-8">
          <div className="space-y-2 pb-4 border-b border-line">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
              System Extensions & Upgrades
            </span>
            <h2 className="type-h3 text-fg">
              Modular Add-Ons & Ongoing Support
            </h2>
            <p className="text-sm font-mono text-subtle">
              Add any module directly to your existing systems or custom build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addOnItems.map((addon) => (
              <div
                key={addon.id}
                className="p-6 bg-surface border border-line space-y-3 flex flex-col justify-between rounded-card"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-subtle">
                    <span>{addon.category}</span>
                    {addon.isMonthly && (
                      <span className="text-brand">Recurring</span>
                    )}
                  </div>
                  <h4 className="type-h4 text-fg">
                    {addon.title}
                  </h4>
                  <p className="text-sm text-muted leading-relaxed">
                    {addon.notes}
                  </p>
                </div>

                <div className="pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-brand">
                    from {format(addon.priceUSD)}
                    {addon.isMonthly ? '/mo' : ''}
                  </span>
                  <button
                    onClick={() =>
                      openInquiry({
                        title: `Add-On: ${addon.title}`,
                        priceUSD: addon.priceUSD,
                        billingFrequency: addon.isMonthly ? '/ month' : 'one-time',
                        kicker: addon.category,
                        features: [addon.notes || 'Modular system upgrade']
                      })
                    }
                    className="text-xs font-mono uppercase tracking-wider text-fg hover:text-brand cursor-pointer"
                  >
                    Add to Scope
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LEGAL / THIRD-PARTY TRANSPARENCY DISCLAIMER */}
        <section className="p-8 bg-surface-2/80 backdrop-blur-md border border-line/80 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-brand">
            <ShieldAlert className="w-4 h-4" />
            <span>Important Terms & Third-Party Cost Policy</span>
          </div>

          <p className="text-sm text-muted leading-relaxed">
            All prices listed on this website are baseline RMAST engineering and creative production starting fees. Third-party operational costs such as domain registration, custom API token consumption (OpenAI, Anthropic, ElevenLabs, Gemini), Meta/WhatsApp Business conversation fees, paid plugins, and paid advertising budgets are not included unless explicitly outlined in a custom statement of work.
          </p>

          <p className="text-sm text-muted leading-relaxed">
            Final scoping and contractual milestones will be formalized following a technical discovery audit with the founders.
          </p>
        </section>

        {/* CTA */}
        <section className="p-12 bg-surface-2/85 backdrop-blur-md border border-line/80 text-center space-y-6 shadow-sm">
          <h3 className="type-h3 text-fg">
            Need a tailored proposal or custom software quote?
          </h3>
          <p className="text-sm text-muted max-w-xl mx-auto">
            Submit your specific requirements and receive an itemized architectural proposal directly from Abdussamie and Mashhood within 24 hours.
          </p>
          <div>
            <button
              onClick={() =>
                openInquiry({
                  title: 'Tailored Hybrid System & Retainer Proposal',
                  kicker: 'Founder Scoping'
                })
              }
              className="btn btn-primary cursor-pointer"
            >
              Request Custom Proposal
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
