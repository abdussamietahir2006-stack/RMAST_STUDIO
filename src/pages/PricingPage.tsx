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
  addOnItems
} from '../data/pricingData';
import { packageOptions, videoBundleOptions } from '../data/inquiryOptions';
import {
  Check,
  Building2,
  Film,
  Briefcase,
  ShieldAlert
} from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { format } = useCurrency();
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
    <div className="pt-32 pb-24 px-6 md:px-10 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Page Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A96E]">
              Investment Framework
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-[#FAF8F5] leading-[1.02] tracking-tight">
            Transparent Investment. <br />
            <span className="italic font-light text-[#C9A96E]">Predictable Returns.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed font-light">
            We operate with strict pricing transparency. All figures represent RMAST baseline architectural and creative deliverables. Final investment is scoped against your exact data schemas, integrations, and operational requirements.
          </p>

          {/* Currency Toggle & Disclaimer Header */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 p-4 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-[#71717A] uppercase tracking-wider">
                Select Currency:
              </span>
              <CurrencyToggle />
            </div>

            <div className="text-xs font-mono text-[#71717A]">
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
              className="inline-flex p-1.5 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 rounded-sm gap-2"
            >
              <button
                role="tab"
                aria-selected={activeTab === 'real-estate'}
                onClick={() => setActiveTab('real-estate')}
                className={`flex items-center gap-2 px-6 py-3 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === 'real-estate'
                    ? 'bg-[#C9A96E] text-[#0A0A0C] font-bold shadow-md'
                    : 'text-[#8E8D88] hover:text-[#FAF8F5]'
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
                    ? 'bg-[#C9A96E] text-[#0A0A0C] font-bold shadow-md'
                    : 'text-[#8E8D88] hover:text-[#FAF8F5]'
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
                    ? 'bg-[#C9A96E] text-[#0A0A0C] font-bold shadow-md'
                    : 'text-[#8E8D88] hover:text-[#FAF8F5]'
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
                        ? 'bg-[#101015] border-[#C9A96E] shadow-2xl relative'
                        : 'bg-[#0B0B0E] border-[#1E1E24]'
                    }`}
                  >
                    {pkg.highlight && (
                      <div className="absolute -top-3 left-8 px-3 py-0.5 bg-[#C9A96E] text-[#0A0A0C] text-[10px] font-mono uppercase tracking-widest font-bold">
                        Brokerage Standard
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
                        <div className="text-4xl font-serif font-bold text-[#FAF8F5]">
                          {format(pkg.priceUSD)}
                        </div>
                        <div className="text-xs font-mono text-[#71717A] mt-1">
                          Starting from · One-time engineering
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

                      {pkg.notIncluded && (
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
                      className={`w-full py-3.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all cursor-pointer ${
                        pkg.highlight
                          ? 'bg-[#C9A96E] text-[#0A0A0C] hover:bg-[#D9B97E]'
                          : 'border border-[#27272A] text-[#FAF8F5] hover:border-[#C9A96E]'
                      }`}
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
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
                    Per Video Production
                  </span>
                  <h3 className="font-serif text-2xl text-[#FAF8F5]">
                    Single Video Tier Benchmarks
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {aiVideoSinglePricing.map((item) => (
                    <div
                      key={item.tier}
                      className={`p-6 bg-[#0B0B0E] border space-y-4 ${
                        item.tier === 'Professional'
                          ? 'border-[#C9A96E]'
                          : 'border-[#1E1E24]'
                      }`}
                    >
                      <div className="text-xs font-mono uppercase text-[#71717A]">
                        {item.tier} Tier
                      </div>
                      <div className="text-3xl font-serif font-bold text-[#FAF8F5]">
                        {format(item.priceUSD)}
                        <span className="text-xs font-mono font-normal text-[#71717A] ml-2">
                          / video
                        </span>
                      </div>
                      <p className="text-xs text-[#8E8D88] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly Packages (10, 20, 30 videos) */}
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1E1E24]">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
                      Monthly Volume Retainers
                    </span>
                    <h3 className="font-serif text-2xl text-[#FAF8F5] mt-1">
                      Batch Content Bundles with Verified Savings
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-[#71717A]">
                    Delivered on structured weekly staging cadences.
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {videoMonthlyBundles.map((b) => (
                    <div
                      key={b.quantity}
                      className="p-8 bg-[#0C0C10] border border-[#1E1E24] space-y-6 flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-serif font-bold text-[#FAF8F5]">
                            {b.quantity} Videos / Mo
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 bg-[#1F1F26] text-[#C9A96E] border border-[#C9A96E]/30">
                            {b.savingsLabel}
                          </span>
                        </div>

                        <div className="space-y-2.5 pt-3 border-t border-[#1C1C22] text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-[#8E8D88]">Starter Grade:</span>
                            <span className="text-[#FAF8F5] font-semibold">
                              {format(b.starter.usd)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8E8D88]">Standard Motion:</span>
                            <span className="text-[#FAF8F5] font-semibold">
                              {format(b.standard.usd)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#C9A96E]">Professional Cinema:</span>
                            <span className="text-[#FAF8F5] font-bold">
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
                        className="w-full py-3 text-xs font-semibold uppercase tracking-[0.16em] bg-[#C9A96E] text-[#0A0A0C] hover:bg-[#D9B97E] transition-all cursor-pointer"
                      >
                        Order {b.quantity}-Video Bundle
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Content Packages */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
                    Curated Campaigns
                  </span>
                  <h3 className="font-serif text-2xl text-[#FAF8F5]">
                    Turnkey Brand Campaign Packages
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {aiContentPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`p-8 bg-[#0B0B0E] border flex flex-col justify-between space-y-6 ${
                        pkg.highlight ? 'border-[#C9A96E]' : 'border-[#1E1E24]'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="text-xs font-mono uppercase text-[#71717A]">
                          {pkg.tier}
                        </div>
                        <h4 className="font-serif text-2xl text-[#FAF8F5] font-semibold">
                          {pkg.title}
                        </h4>
                        <div className="text-3xl font-serif font-bold text-[#FAF8F5]">
                          {format(pkg.priceUSD)}
                        </div>
                        <p className="text-xs text-[#8E8D88] italic">
                          Best for: {pkg.bestFor}
                        </p>
                        <ul className="space-y-1.5 text-xs text-[#D4D4D8] pt-2">
                          {pkg.included.map((inc, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="w-3.5 h-3.5 text-[#C9A96E] shrink-0 mt-0.5" />
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
                        className="w-full py-3 text-xs font-semibold uppercase tracking-[0.16em] border border-[#27272A] hover:border-[#C9A96E] text-[#FAF8F5] transition-colors cursor-pointer"
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
                        ? 'bg-[#101015] border-[#C9A96E] shadow-2xl relative'
                        : 'bg-[#0B0B0E] border-[#1E1E24]'
                    }`}
                  >
                    {pkg.highlight && (
                      <div className="absolute -top-3 left-8 px-3 py-0.5 bg-[#C9A96E] text-[#0A0A0C] text-[10px] font-mono uppercase tracking-widest font-bold">
                        Full Enterprise Growth
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
                        <div className="text-4xl font-serif font-bold text-[#FAF8F5]">
                          {format(pkg.priceUSD)}
                        </div>
                        <div className="text-xs font-mono text-[#71717A] mt-1">
                          Starting from · Full System Integration
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
                      className={`w-full py-3.5 text-xs font-semibold uppercase tracking-[0.16em] transition-all cursor-pointer ${
                        pkg.highlight
                          ? 'bg-[#C9A96E] text-[#0A0A0C] hover:bg-[#D9B97E]'
                          : 'border border-[#27272A] text-[#FAF8F5] hover:border-[#C9A96E]'
                      }`}
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
          <div className="space-y-2 pb-4 border-b border-[#1E1E24]">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
              Individual Service Catalog
            </span>
            <h2 className="font-serif text-3xl text-[#FAF8F5] font-semibold">
              Standalone Services Starting Benchmarks
            </h2>
            <p className="text-xs font-mono text-[#71717A]">
              For specialized mandates outside bundled packages.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#101014] text-[#A1A1AA] font-mono uppercase tracking-wider border-b border-[#222228]">
                <tr>
                  <th className="py-4 px-6">Service</th>
                  <th className="py-4 px-6">Starting Rate</th>
                  <th className="py-4 px-6">Included Baseline Scope</th>
                  <th className="py-4 px-6">Key Exclusions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A20] text-[#D4D4D8]">
                {singleServicePricing.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#0E0E12] transition-colors">
                    <td className="py-4 px-6 font-medium text-[#FAF8F5]">
                      {item.service}
                    </td>
                    <td className="py-4 px-6 font-mono text-[#C9A96E] whitespace-nowrap font-bold">
                      {format(item.startingUSD)}
                      <span className="text-[10px] font-normal text-[#71717A] ml-1">
                        ({item.billing})
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#A1A1AA] max-w-xs leading-relaxed">
                      {item.scope}
                    </td>
                    <td className="py-4 px-6 text-[#71717A] max-w-xs leading-relaxed">
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
          <div className="space-y-2 pb-4 border-b border-[#1E1E24]">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
              System Extensions & Upgrades
            </span>
            <h2 className="font-serif text-3xl text-[#FAF8F5] font-semibold">
              Modular Add-Ons & Ongoing Support
            </h2>
            <p className="text-xs font-mono text-[#71717A]">
              Add any module directly to your existing systems or custom build.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addOnItems.map((addon) => (
              <div
                key={addon.id}
                className="p-6 bg-[#0B0B0E] border border-[#1E1E24] space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                    <span>{addon.category}</span>
                    {addon.isMonthly && (
                      <span className="text-[#C9A96E]">Recurring</span>
                    )}
                  </div>
                  <h4 className="font-serif text-base text-[#FAF8F5] font-medium">
                    {addon.title}
                  </h4>
                  <p className="text-xs text-[#8E8D88] leading-relaxed">
                    {addon.notes}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1C1C22] flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold text-[#C9A96E]">
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
                    className="text-[11px] font-mono uppercase tracking-wider text-[#FAF8F5] hover:text-[#C9A96E] cursor-pointer"
                  >
                    Add to Scope
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LEGAL / THIRD-PARTY TRANSPARENCY DISCLAIMER */}
        <section className="p-8 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#C9A96E]">
            <ShieldAlert className="w-4 h-4" />
            <span>Important Terms & Third-Party Cost Policy</span>
          </div>

          <p className="text-xs text-[#8E8D88] leading-relaxed">
            All prices listed on this website are baseline RMAST engineering and creative production starting fees. Third-party operational costs such as domain registration, custom API token consumption (OpenAI, Anthropic, ElevenLabs, Gemini), Meta/WhatsApp Business conversation fees, paid plugins, and paid advertising budgets are not included unless explicitly outlined in a custom statement of work.
          </p>

          <p className="text-xs text-[#8E8D88] leading-relaxed">
            Final scoping and contractual milestones will be formalized following a technical discovery audit with the founders.
          </p>
        </section>

        {/* CTA */}
        <section className="p-10 bg-[#0E111C]/85 backdrop-blur-md border border-[#232738]/80 text-center space-y-6 shadow-xl">
          <h3 className="font-serif text-3xl text-[#FAF8F5] font-semibold">
            Need a tailored proposal or custom software quote?
          </h3>
          <p className="text-sm text-[#8E8D88] max-w-xl mx-auto">
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
              className="px-8 py-3.5 bg-[#C9A96E] text-[#0A0A0C] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#D9B97E] transition-all cursor-pointer"
            >
              Request Custom Proposal
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
