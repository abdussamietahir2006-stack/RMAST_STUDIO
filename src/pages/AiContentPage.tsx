import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCurrency } from '../context/CurrencyContext';
import { useInquiry } from '../context/InquiryContext';
import {
  aiVideoSinglePricing,
  videoMonthlyBundles
} from '../data/pricingData';
import { servicesData } from '../data/servicesData';
import { ServiceMedia } from '../components/media/ServiceMedia';
import {
  ArrowRight,
  Check
} from 'lucide-react';

export const AiContentPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { format, currency } = useCurrency();
  const { openInquiry } = useInquiry();

  const aiContentServices = servicesData.filter((s) => s.division === 'ai-content');

  const industries = [
    { name: 'Real Estate & Off-Plan', desc: 'Drone property tours, golden hour flythroughs & architectural previews.' },
    { name: 'Fashion & Apparel', desc: 'Haute-couture lookbooks, runway motion & fabric drape physics.' },
    { name: 'Food & Restaurants', desc: 'Sensory macro cinema, sizzle dynamics & liquid pours.' },
    { name: 'Consumer Products & Tech', desc: 'Exploded mechanical views, studio reveals & macro textures.' },
    { name: 'Accessories & Jewelry', desc: 'Precious metal reflections, diamond refraction & slow-motion orbits.' },
    { name: 'Beauty & Cosmetics', desc: 'Hydration textures, pigment blending & editorial skin glows.' },
    { name: 'E-Commerce DTC', desc: 'Scroll-stopping paid social ad hooks and product page video loops.' },
    { name: 'Personal Brands', desc: 'High-status visual presence, thought-leadership reels & cinematic stills.' }
  ];

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-24">
        {/* Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#C9A96E]">
              Division Two · Creative AI Production Studio
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-[#FAF8F5] leading-[1.02] tracking-tight">
            Production without the production.
          </h1>

          <p className="text-2xl sm:text-3xl font-serif italic text-[#C9A96E]">
            "Content that makes people stop scrolling."
          </p>

          <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed font-light">
            We create cinematic AI-powered content for brands without the limitations of traditional production. No casting delays, weather disruptions, physical studio rentals, or bloated crew fees. From concept to final cinema in days.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-[#71717A]">
            <span>Available Worldwide: USA · UAE · Canada · Pakistan · Global</span>
            <span>·</span>
            <span>4K Master Exports</span>
            <span>·</span>
            <span>Vertical 9:16 & Widescreen 16:9</span>
          </div>
        </section>

        {/* Cinematic Preview Showcase Grid */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1E1E24]">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
                From Idea to Final Frame
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl text-[#FAF8F5] font-semibold tracking-tight mt-1">
                Visual Disciplines & Cinema Services
              </h2>
            </div>
            <p className="text-xs font-mono text-[#71717A]">
              Proprietary visual prompting, physical camera simulation & bespoke sound design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aiContentServices.map((service, index) => (
              <div
                key={service.id}
                className="group bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 hover:border-[#C9A96E]/60 shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden rounded-sm"
              >
                <div>
                  {/* Image header with overlay tags */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-[#141418]">
                    <ServiceMedia
                      service={service}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="text-[10px] font-mono tracking-widest uppercase bg-[#0A0A0D]/90 backdrop-blur-sm px-2.5 py-1 text-[#C9A96E] font-bold border border-[#27272A]">
                        DISCIPLINE {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] font-mono tracking-wider uppercase bg-[#0A0A0D]/80 backdrop-blur-sm px-2.5 py-1 text-[#FAF8F5] border border-[#27272A]">
                        {service.kicker}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 text-xs font-mono bg-[#0A0A0D]/90 backdrop-blur-sm px-3 py-1 text-[#FAF8F5] border border-[#C9A96E]/40 font-semibold">
                      Starting {format(service.startingPriceUSD)} / video
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-7 space-y-5">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] font-semibold group-hover:text-[#C9A96E] transition-colors tracking-tight">
                        {service.title}
                      </h3>
                      <p className="text-xs font-mono text-[#C9A96E] mt-1 italic">
                        "{service.headline}"
                      </p>
                    </div>

                    {/* Delineated Compartments */}
                    <div className="space-y-3">
                      <div className="p-3.5 bg-[#121217] border border-[#1E1E26] rounded-sm">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#C9A96E] font-semibold mb-1">
                          01 · Visual Focus
                        </div>
                        <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed">
                          {service.summary}
                        </p>
                      </div>

                      <div className="p-3 bg-[#15151C] border-l-2 border-[#C9A96E] rounded-sm">
                        <span className="text-[10px] font-mono uppercase text-[#A1A1AA] block mb-0.5">
                          02 · Ideal For
                        </span>
                        <span className="text-xs text-[#FAF8F5] italic">
                          {service.targetAudience}
                        </span>
                      </div>

                      <div className="p-3.5 bg-[#0F0F14] border border-[#1C1C24] rounded-sm">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#C9A96E] font-semibold mb-1.5 flex items-center justify-between">
                          <span>03 · Included Deliverables</span>
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
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 bg-[#0A0A0D] border-t border-[#1C1C22] flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/ai-content/${service.slug}`)}
                    className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#FAF8F5] hover:text-[#C9A96E] cursor-pointer group/link"
                  >
                    <span>View Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C9A96E] group-hover/link:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() =>
                      openInquiry({
                        serviceId: service.id,
                        title: service.title,
                        division: 'ai-content',
                        priceUSD: service.startingPriceUSD,
                        billingFrequency: '/ video',
                        kicker: service.kicker,
                        features: service.keyFeatures
                      })
                    }
                    className="px-4 py-1.5 bg-[#C9A96E] text-[#0A0A0C] text-xs font-mono font-semibold uppercase tracking-wider hover:bg-[#D9B97E] transition-all cursor-pointer"
                  >
                    Inquire Film
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Industries Served */}
        <section className="space-y-8 p-8 md:p-12 bg-[#09090C] border border-[#1E1E24]">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
              Market Versatility
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-[#FAF8F5] font-semibold">
              Industries We Produce For
            </h2>
            <p className="text-sm text-[#8E8D88] max-w-2xl">
              Our AI Content Studio is not limited to real estate. We partner with ambitious brand founders and marketing leaders globally.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {industries.map((ind, i) => (
              <div key={i} className="p-5 bg-[#0E0E12] border border-[#1C1C22] space-y-2">
                <div className="text-xs font-mono text-[#C9A96E] font-bold">
                  0{i + 1}
                </div>
                <h3 className="font-serif text-base text-[#FAF8F5] font-medium">
                  {ind.name}
                </h3>
                <p className="text-xs text-[#8E8D88] leading-relaxed">
                  {ind.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Video Tier Breakdown: Starter, Standard, Professional */}
        <section className="space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
              Per-Video Tier Standards
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-[#FAF8F5] font-semibold">
              Individual Video Production Rates
            </h2>
            <p className="text-sm text-[#8E8D88]">
              Straightforward pricing per deliverable. No hidden rendering charges. Displayed in {currency}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiVideoSinglePricing.map((tier) => (
              <div
                key={tier.tier}
                className={`p-8 bg-[#0C0C10] border flex flex-col justify-between space-y-6 ${
                  tier.tier === 'Professional'
                    ? 'border-[#C9A96E] relative'
                    : 'border-[#1E1E24]'
                }`}
              >
                {tier.tier === 'Professional' && (
                  <div className="absolute -top-3 left-6 px-3 py-0.5 bg-[#C9A96E] text-[#0A0A0C] text-[10px] font-mono uppercase tracking-widest font-bold">
                    Signature Cinema
                  </div>
                )}

                <div className="space-y-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-[#71717A]">
                    {tier.tier} Tier
                  </div>
                  <div className="text-4xl font-serif font-bold text-[#FAF8F5]">
                    {format(tier.priceUSD)}
                    <span className="text-xs font-mono font-normal text-[#71717A] ml-2">
                      / video
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#1C1C22]">
                  <button
                    onClick={() =>
                      openInquiry({
                        title: `${tier.tier} Tier AI Video Production`,
                        division: 'ai-content',
                        priceUSD: tier.priceUSD,
                        billingFrequency: '/ video',
                        kicker: `${tier.tier} Cinematic Standard`,
                        features: [tier.description, 'Sound design and color grading included', '4K master export']
                      })
                    }
                    className="w-full py-3 text-xs font-semibold uppercase tracking-[0.16em] border border-[#27272A] hover:border-[#C9A96E] text-[#FAF8F5] transition-colors cursor-pointer"
                  >
                    Commission Video
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Monthly Packages with Clear Savings */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#1E1E24]">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#C9A96E]">
                Volume Retainers
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-[#FAF8F5] font-semibold">
                Monthly Content Bundles & Savings
              </h2>
            </div>
            <p className="text-xs font-mono text-[#C9A96E]">
              Save up to 24% compared to ordering individual videos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {videoMonthlyBundles.map((bundle) => (
              <div
                key={bundle.quantity}
                className="p-8 bg-[#0B0B0E] border border-[#1E1E24] space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-serif font-bold text-[#FAF8F5]">
                      {bundle.quantity} Videos / Month
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#1F1F26] text-[#C9A96E] border border-[#C9A96E]/30">
                      {bundle.savingsLabel}
                    </span>
                  </div>

                  <p className="text-xs text-[#8E8D88]">
                    Consistent monthly delivery pipeline for active brands on TikTok, Instagram & Meta Ads.
                  </p>

                  <div className="space-y-3 pt-3 border-t border-[#1C1C22]">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#A1A1AA]">Starter Bundle:</span>
                      <span className="text-[#FAF8F5] font-semibold">
                        {format(bundle.starter.usd)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#A1A1AA]">Standard Bundle:</span>
                      <span className="text-[#FAF8F5] font-semibold">
                        {format(bundle.standard.usd)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#C9A96E] font-medium">Professional Cinema:</span>
                      <span className="text-[#FAF8F5] font-bold">
                        {format(bundle.professional.usd)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#1C1C22]">
                  <button
                    onClick={() =>
                      openInquiry({
                        title: `${bundle.quantity}-Video Monthly Pipeline Retainer`,
                        division: 'ai-content',
                        priceUSD: bundle.standard.usd,
                        billingFrequency: '/ month',
                        kicker: bundle.savingsLabel,
                        features: [
                          `${bundle.quantity} High-Definition videos delivered every month`,
                          'Monthly creative direction and storyboard alignment',
                          'TikTok, Reels & 16:9 widescreen formats included'
                        ]
                      })
                    }
                    className="w-full py-3 text-xs font-semibold uppercase tracking-[0.16em] bg-[#C9A96E] text-[#0A0A0C] hover:bg-[#D9B97E] transition-all cursor-pointer"
                  >
                    Order {bundle.quantity}-Video Package
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ready to create banner */}
        <section className="p-10 bg-[#0E111C]/85 backdrop-blur-md border border-[#232738]/80 text-center space-y-6 shadow-xl">
          <h3 className="font-serif text-3xl text-[#FAF8F5] font-semibold">
            Ready to make content people stop scrolling for?
          </h3>
          <p className="text-sm text-[#8E8D88] max-w-xl mx-auto">
            Discuss your upcoming campaign directly with Co-Founder & AI Director Mashhood. Share your product, moodboard, or listing for a rapid treatment concept.
          </p>
          <div>
            <button
              onClick={() =>
                openInquiry({
                  title: 'Brand Creative Direction & Treatment Concept',
                  division: 'ai-content',
                  kicker: 'Founder Treatment Scoping'
                })
              }
              className="px-8 py-3.5 bg-[#C9A96E] text-[#0A0A0C] text-xs font-semibold uppercase tracking-[0.16em] hover:bg-[#D9B97E] transition-all cursor-pointer"
            >
              Start Creative Commission
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
