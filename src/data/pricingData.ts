import type { PricingPackage, VideoTierPricing, AddOnItem } from '../types/index.js';

export const USD_TO_AED_RATE = 3.6725;

export function formatPrice(amountUSD: number, currency: 'USD' | 'AED'): string {
  if (currency === 'USD') {
    return `$${amountUSD.toLocaleString()}`;
  }
  const aed = Math.round(amountUSD * USD_TO_AED_RATE);
  return `AED ${aed.toLocaleString()}`;
}

// Hourly rate range, e.g. "$10–$15/hr" or "AED 37–55/hr"
export function formatHourlyRate(rate: { min: number; max: number }, currency: 'USD' | 'AED'): string {
  if (currency === 'USD') return `$${rate.min}–$${rate.max}/hr`;
  return `AED ${Math.round(rate.min * USD_TO_AED_RATE)}–${Math.round(rate.max * USD_TO_AED_RATE)}/hr`;
}

export const singleServicePricing = [
  {
    service: 'Website Development (US/UAE/CA Real Estate)',
    startingUSD: 500,
    hourlyRateUSD: { min: 10, max: 15 },
    billing: 'one-time',
    scope: 'Custom multi-page web application, high-speed CDN, WhatsApp & AI chatbot, SEO & Google Analytics, first month maintenance included.',
    exclusions: 'Admin dashboard, custom CRM, third-party API costs & domain registration.'
  },
  {
    service: 'Custom Software Development',
    startingUSD: 1200,
    hourlyRateUSD: { min: 12, max: 18 },
    billing: 'one-time',
    scope: 'Requirements analysis, UI/UX, frontend & secure backend API, database schema, role-based auth, core business logic, full deployment & docs.',
    exclusions: 'Third-party cloud infrastructure and ongoing post-launch SLA.'
  },
  {
    service: 'CRM Development & Architecture',
    startingUSD: 1000,
    hourlyRateUSD: { min: 12, max: 18 },
    billing: 'one-time',
    scope: 'Lead management, deals, companies, custom single pipeline, authentication, dashboard reports, responsive interface & deployment.',
    exclusions: 'Multi-pipeline customization and AI qualification (available in Growth/Premium).'
  },
  {
    service: 'AI Workflow Automation',
    startingUSD: 1000,
    hourlyRateUSD: { min: 12, max: 18 },
    billing: '/month',
    scope: '1–2 automated workflows connecting lead sources, SMS/WhatsApp triggers, calendar booking, and CRM updates.',
    exclusions: 'Multi-agent autonomous logic and complex custom webhooks.'
  },
  {
    service: 'AI Conversational Assistant',
    startingUSD: 300,
    hourlyRateUSD: { min: 12, max: 18 },
    billing: 'one-time',
    scope: 'Website chatbot, proprietary knowledge base, FAQs, buyer lead capture, and instant human notification handoff.',
    exclusions: 'LLM token usage / OpenAI / Anthropic direct API costs.'
  },
  {
    service: 'Social Media Management',
    startingUSD: 250,
    hourlyRateUSD: { min: 8, max: 12 },
    billing: '/month',
    scope: '2 platforms, 8 static/carousel posts monthly, content calendar, caption copywriting, and basic performance reporting.',
    exclusions: 'Paid ad spend and on-site videography.'
  },
  {
    service: 'Virtual Assistance for Real Estate',
    startingUSD: 200,
    hourlyRateUSD: { min: 8, max: 10 },
    billing: '/month',
    scope: 'Up to 20 dedicated hours monthly for admin, CRM data upkeep, client research, showing scheduling, and task coordination.',
    exclusions: 'Licensed broker representation or legal drafting.'
  },
  {
    service: 'Real Estate Admin Operations',
    startingUSD: 250,
    hourlyRateUSD: { min: 8, max: 12 },
    billing: '/month',
    scope: 'Lead data management, CRM hygiene, listing portal entry (MLS/Bayut/Property Finder), document filing, and deal milestone tracking.',
    exclusions: 'Custom enterprise software licensing.'
  }
];

// REAL ESTATE PACKAGES
export const realEstatePackages: PricingPackage[] = [
  {
    id: 're-starter',
    title: 'Real Estate Starter',
    tier: 'Starter',
    division: 'real-estate',
    priceUSD: 800,
    billingFrequency: 'one-time',
    bestFor: 'Boutique agencies & solo brokers establishing a credible digital command post.',
    included: [
      'Custom multi-page real estate website',
      'Direct WhatsApp conversion click-to-chat',
      'AI conversational chatbot integration',
      'Basic technical SEO & Google Analytics 4',
      '1 month complimentary technical maintenance',
      '2 cinematic AI property videos included',
      'Basic social media profile setup & branding'
    ],
    notIncluded: [
      'Custom CRM pipeline',
      'Advanced multi-system automation',
      'Domain registration & third-party API fees'
    ],
    ctaText: 'Build Starter System'
  },
  {
    id: 're-growth',
    title: 'Real Estate Growth',
    tier: 'Growth',
    division: 'real-estate',
    priceUSD: 1600,
    billingFrequency: 'one-time',
    highlight: true,
    bestFor: 'Active brokerages & developers needing integrated lead flow and automated pipeline tracking.',
    included: [
      'Everything in Starter',
      'Custom CRM setup & pipeline architecture',
      'Basic AI automation (lead capture to CRM)',
      'Social media management foundation',
      '5 cinematic AI property videos / month',
      'Advanced conversion analytics & pixel tracking',
      'Monthly performance & pipeline reporting',
      'Direct WhatsApp team support'
    ],
    notIncluded: [
      'Custom proprietary software modules',
      'Multi-agent autonomous AI logic'
    ],
    ctaText: 'Deploy Growth System'
  },
  {
    id: 're-premium',
    title: 'Real Estate Premium',
    tier: 'Premium',
    division: 'real-estate',
    priceUSD: 3200,
    billingFrequency: 'one-time',
    bestFor: 'Prestige brokerages, luxury developers & investment syndicates demanding an end-to-end digital monopoly.',
    included: [
      'Premium bespoke digital flagship website',
      'Advanced AI assistant with listing knowledge base',
      'Custom-engineered CRM architecture & custom stages',
      'Autonomous AI lead qualification & scoring',
      'Instant automated WhatsApp follow-up workflows',
      'Full social media management integration',
      '10 professional cinematic AI property videos / month',
      'Executive analytics dashboard & deal velocity metrics',
      'Direct founder access & priority SLA support'
    ],
    notIncluded: [
      'Bespoke enterprise desktop apps',
      'Third-party paid media advertising budget'
    ],
    ctaText: 'Architect Premium System'
  }
];

// AI CONTENT PACKAGES
export const aiContentPackages: PricingPackage[] = [
  {
    id: 'ai-content-starter',
    title: 'Content Starter',
    tier: 'Starter',
    division: 'ai-content',
    priceUSD: 450,
    billingFrequency: 'one-time',
    bestFor: 'Brands testing high-concept AI video for social media campaigns.',
    included: [
      '10 starter cinematic AI videos',
      'Clean single-angle fluid camera choreography',
      'Vertical 9:16 or horizontal 16:9 formatting',
      'Atmospheric color grading & lighting balance',
      'Standard ambient sound design',
      '1 round of creative revision per film',
      'Commercial broadcast usage rights'
    ],
    notIncluded: [
      'Multi-camera perspective editing',
      'Custom 3D logo animation'
    ],
    ctaText: 'Order Starter Bundle'
  },
  {
    id: 'ai-content-growth',
    title: 'Content Growth',
    tier: 'Growth',
    division: 'ai-content',
    priceUSD: 1100,
    billingFrequency: 'one-time',
    highlight: true,
    bestFor: 'Fashion labels, restaurants, & DTC brands scaling their weekly organic & paid output.',
    included: [
      '20 standard cinematic AI videos',
      'Dynamic camera motion and smooth speed ramps',
      'Custom product or apparel prompt fine-tuning',
      'Integrated text typography overlays & captions',
      'Layered sound design with rhythmic pacing',
      '2 rounds of creative revisions',
      'High-CTR paid social advertising hook cuts'
    ],
    notIncluded: [
      'Hollywood-grade multi-scene narrative shorts'
    ],
    ctaText: 'Deploy Growth Content'
  },
  {
    id: 'ai-content-premium',
    title: 'Content Premium',
    tier: 'Premium',
    division: 'ai-content',
    priceUSD: 2400,
    billingFrequency: 'one-time',
    bestFor: 'Prestige brands demanding flawless editorial visual direction and multi-angle cinematic storytelling.',
    included: [
      '30 professional cinematic AI films',
      'Multiple camera angles & macro detail close-ups',
      'Advanced cinematic transitions and narrative depth',
      'Bespoke visual direction crafted with founders',
      'Mastered cinematic audio with impact sound design',
      'Both vertical (9:16) and 4K widescreen (16:9) masters',
      'Unlimited revisions within agreed creative brief',
      'Dedicated delivery pipeline with priority queue'
    ],
    ctaText: 'Commission Premium Content'
  }
];

// COMPLETE BUSINESS PACKAGES
export const completeBusinessPackages: PricingPackage[] = [
  {
    id: 'biz-launch',
    title: 'Business Launch',
    tier: 'Starter',
    division: 'complete-business',
    priceUSD: 1800,
    billingFrequency: 'one-time',
    bestFor: 'Modern enterprises launching with both world-class digital systems and high-converting visual media.',
    included: [
      'Custom multi-page web application',
      'Intelligent conversational AI chatbot',
      'WhatsApp direct lead conversion pipeline',
      'Technical SEO architecture & Google Analytics 4',
      'Custom CRM setup & basic follow-up automation',
      '5 cinematic AI videos (brand or product showcase)',
      '1 month complimentary technical maintenance',
      'Complete launch checklist & system handover'
    ],
    ctaText: 'Launch Business System'
  },
  {
    id: 'biz-growth',
    title: 'Business Growth',
    tier: 'Growth',
    division: 'complete-business',
    priceUSD: 3500,
    billingFrequency: 'one-time',
    highlight: true,
    bestFor: 'Expanding companies scaling lead generation, internal operations, and brand prestige simultaneously.',
    included: [
      'Premium custom digital flagship website',
      'Trained AI conversational assistant on brand docs',
      'Multi-stage CRM architecture with deal stages',
      'Multi-channel AI automation workflows',
      'Strategic social media management integration',
      '10 cinematic AI videos per month',
      'Comprehensive lead management & qualification routing',
      'Conversion rate optimization & analytics tracking',
      'Continuous workflow optimization during first 60 days'
    ],
    ctaText: 'Scale Business Operations'
  },
  {
    id: 'biz-os',
    title: 'Digital Operating System',
    tier: 'Premium',
    division: 'complete-business',
    priceUSD: 7000,
    billingFrequency: 'one-time',
    bestFor: 'Serious enterprises building proprietary systems, automated operational pipelines, and an unforgettable brand identity.',
    included: [
      'Bespoke enterprise web platform',
      'Custom software & internal operational tools',
      'Proprietary CRM engine configured to exact business logic',
      'Autonomous multi-system AI agents & integrations',
      'Advanced WhatsApp & email nurture workflows',
      'Full lead management command centre',
      'Complete social media authority management',
      'Full cinematic AI content production pipeline',
      'Executive business intelligence dashboards',
      'Custom API integrations with enterprise databases',
      'Ongoing technical optimization & priority SLA'
    ],
    ctaText: 'Build Operating System'
  }
];

// INDIVIDUAL AI VIDEO PRICING
export const aiVideoSinglePricing = [
  {
    tier: 'Starter',
    priceUSD: 45,
    description: 'Clean single-angle cinematic motion, color graded, formatted for social media or listing overview.'
  },
  {
    tier: 'Standard',
    priceUSD: 65,
    description: 'Dynamic camera movement, enhanced lighting effects, product text overlay, and ambient audio design.'
  },
  {
    tier: 'Professional',
    priceUSD: 100,
    description: 'Multiple camera angles, complex transitions, cinematic storytelling, and bespoke high-fashion/luxury visual direction.'
  }
];

// MONTHLY VIDEO BUNDLES WITH CLEAR SAVINGS
export const videoMonthlyBundles: VideoTierPricing[] = [
  {
    quantity: 10,
    starter: { usd: 405 }, // vs $450 (10% saving)
    standard: { usd: 585 }, // vs $650 (10% saving)
    professional: { usd: 900 }, // vs $1,000 (10% saving)
    savingsLabel: 'Save 10% vs individual videos'
  },
  {
    quantity: 20,
    starter: { usd: 760 }, // vs $900 (15% saving)
    standard: { usd: 1100 }, // vs $1,300 (15% saving)
    professional: { usd: 1800 }, // vs $2,000 (10% saving)
    savingsLabel: 'Save up to 15% vs individual videos'
  },
  {
    quantity: 30,
    starter: { usd: 1020 }, // vs $1,350 (24% saving)
    standard: { usd: 1650 }, // vs $1,950 (15% saving)
    professional: { usd: 2400 }, // vs $3,000 (20% saving)
    savingsLabel: 'Save up to 24% vs individual videos'
  }
];

// AI STATIC POSTS: designed single images for feeds and ads, at half the per-video rates
export const aiPostSinglePricing = [
  {
    tier: 'Starter',
    priceUSD: 22,
    description: 'One AI-designed static post in your brand colours and fonts, with a ready-to-post caption and hashtags.'
  },
  {
    tier: 'Standard',
    priceUSD: 32,
    description: 'Photoreal AI product, property or lifestyle scene with headline typography, caption, and square + portrait sizes.'
  },
  {
    tier: 'Professional',
    priceUSD: 50,
    description: 'Campaign-grade art direction, bespoke composition and luxury retouching, delivered for feed, story and ads.'
  }
];

// MONTHLY POST BUNDLES: the same savings as the video bundles
export const postMonthlyBundles: VideoTierPricing[] = [
  {
    quantity: 10,
    starter: { usd: 198 }, // vs $220 (10% saving)
    standard: { usd: 288 }, // vs $320 (10% saving)
    professional: { usd: 450 }, // vs $500 (10% saving)
    savingsLabel: 'Save 10% vs individual posts'
  },
  {
    quantity: 20,
    starter: { usd: 374 }, // vs $440 (15% saving)
    standard: { usd: 544 }, // vs $640 (15% saving)
    professional: { usd: 900 }, // vs $1,000 (10% saving)
    savingsLabel: 'Save up to 15% vs individual posts'
  },
  {
    quantity: 30,
    starter: { usd: 500 }, // vs $660 (24% saving)
    standard: { usd: 816 }, // vs $960 (15% saving)
    professional: { usd: 1200 }, // vs $1,500 (20% saving)
    savingsLabel: 'Save up to 24% vs individual posts'
  }
];

// ADD-ONS
export const addOnItems: AddOnItem[] = [
  // Website
  { id: 'add-admin', category: 'Website', title: 'Custom Admin Dashboard', priceUSD: 300, notes: 'Full internal control over website content, media, and leads.' },
  { id: 'add-cms', category: 'Website', title: 'Advanced Headless CMS', priceUSD: 300, notes: 'Dynamic publishing pipeline for listings, blog posts, and resources.' },
  { id: 'add-booking', category: 'Website', title: 'Automated Booking System', priceUSD: 150, notes: 'Direct calendar integration with SMS/WhatsApp confirmations.' },
  { id: 'add-crm-int', category: 'Website', title: 'CRM Integration', priceUSD: 250, notes: 'Connect form submissions directly to HubSpot, Salesforce, or custom CRM.' },
  { id: 'add-ai-assist', category: 'Website', title: 'Advanced AI Assistant Fine-Tuning', priceUSD: 250, notes: 'Custom vector database and document embeddings for accurate replies.' },
  { id: 'add-ecomm', category: 'Website', title: 'E-Commerce / Payment Gateway', priceUSD: 500, notes: 'Stripe, Apple Pay, or regional payment integration with cart checkout.' },
  { id: 'add-lang', category: 'Website', title: 'Multilingual Support (Arabic & English)', priceUSD: 150, notes: 'Complete RTL Arabic layout and locale routing for UAE/GCC markets.' },
  { id: 'add-seo', category: 'Website', title: 'Advanced Technical SEO & Schema', priceUSD: 150, notes: 'Deep keyword clustering, local real estate schema, and XML sitemaps.' },
  { id: 'add-api', category: 'Website', title: 'Custom API Endpoint Integration', priceUSD: 150, notes: 'Secure REST or GraphQL webhook integrations with external tools.' },
  { id: 'add-page', category: 'Website', title: 'Additional Custom Page', priceUSD: 50, notes: 'Bespoke designed and coded responsive page.' },

  // AI Systems
  { id: 'add-workflow', category: 'AI Systems', title: 'Additional Automation Workflow', priceUSD: 150, notes: 'Single automated multi-step trigger and action sequence.' },
  { id: 'add-agent', category: 'AI Systems', title: 'Autonomous Multi-Step AI Agent', priceUSD: 500, notes: 'Autonomous reasoning agent capable of multi-system execution.' },
  { id: 'add-channel', category: 'AI Systems', title: 'Additional AI Channel Connection', priceUSD: 150, notes: 'Deploy same assistant to Instagram DM, Telegram, or WhatsApp Business.' },
  { id: 'add-ai-api', category: 'AI Systems', title: 'Custom AI API Integration', priceUSD: 150, notes: 'Webhook sync with external CRM or private customer databases.' },

  // Ongoing Support
  { id: 'add-maint-web', category: 'Ongoing Support', title: 'Website Maintenance & Hosting Upkeep', priceUSD: 50, isMonthly: true, notes: 'After first complimentary month. Security, updates, uptime monitoring.' },
  { id: 'add-maint-ai', category: 'Ongoing Support', title: 'AI System & Workflow Maintenance', priceUSD: 80, isMonthly: true, notes: 'Prompt tuning, model upgrades, and error recovery audits.' },
  { id: 'add-maint-crm', category: 'Ongoing Support', title: 'CRM Database & Pipeline Maintenance', priceUSD: 100, isMonthly: true, notes: 'Weekly database hygiene, contact deduplication, and workflow checks.' }
];
