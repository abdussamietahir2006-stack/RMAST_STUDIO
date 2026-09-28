import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCurrency } from '../context/CurrencyContext';
import { useInquiry } from '../context/InquiryContext';
import {
  aiPostSinglePricing,
  aiVideoSinglePricing,
  postMonthlyBundles,
  videoMonthlyBundles
} from '../data/pricingData';
import { servicesData } from '../data/servicesData';
import { ServiceMedia } from '../components/media/ServiceMedia';
import { postBundleOptions, postTierOptions, serviceOptions, videoBundleOptions, videoTierOptions } from '../data/inquiryOptions';
import {
  ArrowRight,
  Check
} from 'lucide-react';

export const AiContentPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { format, formatHourly, currency } = useCurrency();
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
    <div className="pt-30 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-site mx-auto space-y-24">
        {/* Header */}
        <section className="space-y-6 max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">
              Division Two · Creative AI Production Studio
            </span>
          </div>

          <h1 className="type-h1 text-fg">
            Production without the production.
          </h1>

          <p className="text-2xl sm:text-3xl font-serif italic text-brand">
            "Content that makes people stop scrolling."
          </p>

          <p className="text-base sm:text-lg text-muted leading-relaxed font-light">
            We create cinematic AI-powered content for brands without the limitations of traditional production. No casting delays, weather disruptions, physical studio rentals, or bloated crew fees. From concept to final cinema in days.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-mono text-subtle">
            <span>Available Worldwide: USA · UAE · Canada · Pakistan · Global</span>
            <span>·</span>
            <span>4K Master Exports</span>
            <span>·</span>
            <span>Vertical 9:16 & Widescreen 16:9</span>
          </div>
        </section>

        {/* Cinematic Preview Showcase Grid */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-line">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
                From Idea to Final Frame
              </span>
              <h2 className="type-h2 text-fg mt-1">
                Visual Disciplines & Cinema Services
              </h2>
            </div>
            <p className="text-sm font-mono text-subtle">
              Proprietary visual prompting, physical camera simulation & bespoke sound design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {aiContentServices.map((service, index) => (
              <div
                key={service.id}
                className="group bg-surface-2/80 backdrop-blur-md border border-line/80 hover:border-primary/60 shadow-sm transition-all duration-300 flex flex-col justify-between overflow-hidden rounded-sm"
              >
                <div>
                  {/* Image header with overlay tags */}
                  <div className="relative aspect-[16/9] overflow-hidden bg-surface">
                    <ServiceMedia
                      service={service}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="text-xs font-mono tracking-widest uppercase bg-surface/90 backdrop-blur-sm px-3 py-1 text-brand font-bold border border-line">
                        DISCIPLINE {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-mono tracking-wider uppercase bg-surface/80 backdrop-blur-sm px-3 py-1 text-fg border border-line">
                        {service.kicker}
                      </span>
                    </div>

                    <div className="absolute bottom-3 right-3 text-xs font-mono bg-surface/90 backdrop-blur-sm px-3 py-1 text-fg border border-primary/40 font-semibold">
                      Starting {format(service.startingPriceUSD)} / video
                      {service.hourlyRateUSD && (
                        <span className="font-normal text-muted"> · {formatHourly(service.hourlyRateUSD)}</span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 space-y-6">
                    <div>
                      <h3 className="type-h3 text-fg group-hover:text-brand transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm font-mono text-brand mt-1 italic">
                        "{service.headline}"
                      </p>
                    </div>

                    {/* Delineated Compartments */}
                    <div className="space-y-3">
                      <div className="p-4 bg-surface border border-line rounded-sm">
                        <div className="text-xs font-mono uppercase tracking-widest text-brand font-semibold mb-1">
                          01 · Visual Focus
                        </div>
                        <p className="text-sm sm:text-sm text-fg leading-relaxed">
                          {service.summary}
                        </p>
                      </div>

                      <div className="p-3 bg-surface-2 border-l-2 border-primary rounded-sm">
                        <span className="text-xs font-mono uppercase text-muted block mb-1">
                          02 · Ideal For
                        </span>
                        <span className="text-xs text-fg italic">
                          {service.targetAudience}
                        </span>
                      </div>

                      <div className="p-4 bg-surface border border-line rounded-sm">
                        <div className="text-xs font-mono uppercase tracking-widest text-brand font-semibold mb-2 flex items-center justify-between">
                          <span>03 · Included Deliverables</span>
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
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-4 bg-surface border-t border-line flex items-center justify-between">
                  <button
                    onClick={() => navigate(`/ai-content/${service.slug}`)}
                    className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-fg hover:text-brand cursor-pointer group/link"
                  >
                    <span>View Specifications</span>
                    <ArrowRight className="w-3.5 h-3.5 text-brand group-hover/link:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() =>
                      openInquiry({
                        serviceId: service.id,
                        options: serviceOptions(service),
                        selectedOptionId: serviceOptions(service)[0]?.id,
                        title: service.title,
                        division: 'ai-content',
                        priceUSD: service.startingPriceUSD,
                        billingFrequency: '/ video',
                        kicker: service.kicker,
                        features: service.keyFeatures
                      })
                    }
                    className="btn btn-primary cursor-pointer"
                  >
                    Inquire Film
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Industries Served */}
        <section className="space-y-8 p-8 md:p-12 bg-canvas border border-line">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
              Market Versatility
            </span>
            <h2 className="type-h3 text-fg">
              Industries We Produce For
            </h2>
            <p className="text-sm text-muted max-w-2xl">
              Our AI Content Studio is not limited to real estate. We partner with ambitious brand founders and marketing leaders globally.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            {industries.map((ind, i) => (
              <div key={i} className="p-6 bg-surface border border-line space-y-2 rounded-card">
                <div className="text-xs font-mono text-brand font-bold">
                  0{i + 1}
                </div>
                <h3 className="type-h4 text-fg">
                  {ind.name}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {ind.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Video Tier Breakdown: Starter, Standard, Professional */}
        <section className="space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
              Per-Video Tier Standards
            </span>
            <h2 className="type-h2 text-fg">
              Individual Video Production Rates
            </h2>
            <p className="text-sm text-muted">
              Straightforward pricing per deliverable. No hidden rendering charges. Displayed in {currency}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiVideoSinglePricing.map((tier) => (
              <div
                key={tier.tier}
                className={`p-8 bg-surface border flex flex-col justify-between space-y-6 ${
                  tier.tier === 'Professional'
                    ? 'border-primary relative'
                    : 'border-line'
                }`}
              >
                {tier.tier === 'Professional' && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-on-primary text-xs font-mono uppercase tracking-widest font-bold">
                    Signature Cinema
                  </div>
                )}

                <div className="space-y-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-subtle">
                    {tier.tier} Tier
                  </div>
                  <div className="text-4xl font-serif font-bold text-fg">
                    {format(tier.priceUSD)}
                    <span className="text-xs font-mono font-normal text-subtle ml-2">
                      / video
                    </span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-line">
                  <button
                    onClick={() =>
                      openInquiry({
                        title: `${tier.tier} Tier AI Video Production`,
                        division: 'ai-content',
                        priceUSD: tier.priceUSD,
                        billingFrequency: '/ video',
                        kicker: `${tier.tier} Cinematic Standard`,
                        features: [tier.description, 'Sound design and color grading included', '4K master export'],
                        options: videoTierOptions(),
                        selectedOptionId: tier.tier
                      })
                    }
                    className="btn btn-secondary w-full cursor-pointer"
                  >
                    Commission Video
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Monthly Packages with Clear Savings */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-line">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
                Volume Retainers
              </span>
              <h2 className="type-h2 text-fg">
                Monthly Content Bundles & Savings
              </h2>
            </div>
            <p className="text-sm font-mono text-brand">
              Save up to 24% compared to ordering individual videos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {videoMonthlyBundles.map((bundle) => (
              <div
                key={bundle.quantity}
                className="p-8 bg-surface border border-line space-y-6 flex flex-col justify-between rounded-card"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-serif font-bold text-fg">
                      {bundle.quantity} Videos / Month
                    </span>
                    <span className="text-xs font-mono uppercase px-2 py-1 bg-surface-2 text-brand border border-primary/30">
                      {bundle.savingsLabel}
                    </span>
                  </div>

                  <p className="text-sm text-muted">
                    Consistent monthly delivery pipeline for active brands on TikTok, Instagram & Meta Ads.
                  </p>

                  <div className="space-y-3 pt-3 border-t border-line">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted">Starter Bundle:</span>
                      <span className="text-fg font-semibold">
                        {format(bundle.starter.usd)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted">Standard Bundle:</span>
                      <span className="text-fg font-semibold">
                        {format(bundle.standard.usd)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-brand font-medium">Professional Cinema:</span>
                      <span className="text-fg font-bold">
                        {format(bundle.professional.usd)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-line">
                  <button
                    onClick={() =>
                      openInquiry({
                        title: `${bundle.quantity}-Video Monthly Pipeline Retainer`,
                        division: 'ai-content',
                        priceUSD: bundle.standard.usd,
                        billingFrequency: '/ month',
                        kicker: bundle.savingsLabel,
                        options: videoBundleOptions(bundle.quantity),
                        selectedOptionId: 'Standard',
                        features: [
                          `${bundle.quantity} High-Definition videos delivered every month`,
                          'Monthly creative direction and storyboard alignment',
                          'TikTok, Reels & 16:9 widescreen formats included'
                        ]
                      })
                    }
                    className="btn btn-primary w-full cursor-pointer"
                  >
                    Order {bundle.quantity}-Video Package
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI static posts: single designed images at half the per-video rates */}
        <section className="space-y-12">
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-brand">
              AI Static Posts
            </span>
            <h2 className="type-h2 text-fg">
              Scroll-Stopping Posts, Designed with AI
            </h2>
            <p className="text-sm text-muted max-w-2xl">
              Single static posts for Instagram, Facebook, LinkedIn and ads: property showcases, product shots, launches and offers,
              with caption and hashtags ready to publish. Half the price of a video. Displayed in {currency}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {aiPostSinglePricing.map((tier) => (
              <div
                key={tier.tier}
                className={`p-8 bg-surface border flex flex-col justify-between space-y-6 ${
                  tier.tier === 'Professional' ? 'border-primary relative' : 'border-line'
                }`}
              >
                {tier.tier === 'Professional' && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-primary text-on-primary text-xs font-mono uppercase tracking-widest font-bold">
                    Campaign Grade
                  </div>
                )}

                <div className="space-y-4">
                  <div className="text-xs font-mono uppercase tracking-widest text-subtle">{tier.tier} Post</div>
                  <div className="text-4xl font-serif font-bold text-fg">
                    {format(tier.priceUSD)}
                    <span className="text-xs font-mono font-normal text-subtle ml-2">/ post</span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{tier.description}</p>
                </div>

                <div className="pt-4 border-t border-line">
                  <button
                    onClick={() =>
                      openInquiry({
                        title: `${tier.tier} Tier AI Static Post`,
                        division: 'ai-content',
                        priceUSD: tier.priceUSD,
                        billingFrequency: '/ post',
                        kicker: `${tier.tier} Static Post`,
                        features: [tier.description, 'Caption and hashtags included', 'High-resolution files for every platform'],
                        options: postTierOptions(),
                        selectedOptionId: tier.tier
                      })
                    }
                    className="btn btn-secondary w-full cursor-pointer"
                  >
                    Order Post
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-line">
              <h3 className="type-h3 text-fg">Monthly Post Bundles</h3>
              <p className="text-sm font-mono text-brand">Save up to 24% compared to ordering individual posts.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {postMonthlyBundles.map((bundle) => (
                <div key={bundle.quantity} className="p-8 bg-surface border border-line space-y-6 flex flex-col justify-between rounded-card">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-2xl font-serif font-bold text-fg">{bundle.quantity} Posts / Month</span>
                      <span className="text-xs font-mono uppercase px-2 py-1 bg-surface-2 text-brand border border-primary/30 text-right">
                        {bundle.savingsLabel}
                      </span>
                    </div>
                    <div className="space-y-3 pt-3 border-t border-line">
                      {(
                        [
                          ['Starter', bundle.starter.usd],
                          ['Standard', bundle.standard.usd],
                          ['Professional', bundle.professional.usd]
                        ] as const
                      ).map(([name, usd]) => (
                        <div key={name} className="flex items-center justify-between text-xs font-mono">
                          <span className={name === 'Professional' ? 'text-brand font-medium' : 'text-muted'}>{name}:</span>
                          <span className="text-fg font-semibold">{format(usd)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-line">
                    <button
                      onClick={() =>
                        openInquiry({
                          title: `${bundle.quantity}-Post Monthly Retainer`,
                          division: 'ai-content',
                          priceUSD: bundle.standard.usd,
                          billingFrequency: '/ month',
                          kicker: bundle.savingsLabel,
                          options: postBundleOptions(bundle.quantity),
                          selectedOptionId: 'Standard',
                          features: [
                            `${bundle.quantity} static posts delivered every month`,
                            'Monthly content calendar and captions',
                            'Feed, story and ad sizes included'
                          ]
                        })
                      }
                      className="btn btn-primary w-full cursor-pointer"
                    >
                      Order {bundle.quantity}-Post Package
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ready to create banner */}
        <section className="p-12 bg-surface-2/85 backdrop-blur-md border border-line/80 text-center space-y-6 shadow-sm">
          <h3 className="type-h3 text-fg">
            Ready to make content people stop scrolling for?
          </h3>
          <p className="text-sm text-muted max-w-xl mx-auto">
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
              className="btn btn-primary cursor-pointer"
            >
              Start Creative Commission
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
