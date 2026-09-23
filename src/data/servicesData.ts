import type { ServiceDetail } from '../types/index.js';

export const servicesData: ServiceDetail[] = [
  // --- REAL ESTATE DIGITAL SYSTEMS ---
  {
    id: 'web-development',
    slug: 'web-development',
    title: 'Website Development',
    division: 'real-estate',
    kicker: 'DIGITAL INFRASTRUCTURE',
    headline: 'High-performance digital flagships engineered for modern brokerages and developers.',
    summary: 'Custom multi-page web applications engineered with pristine typography, rapid loading speed, WhatsApp lead capture, and conversational AI integrations tailored for real estate in the US, UAE, and Canada.',
    targetAudience: 'Independent brokerages, luxury agencies, property developers, and top-tier real estate teams requiring a serious online presence.',
    keyFeatures: [
      'Custom bespoke multi-page responsive architecture',
      'Ultra-fast Next.js / modern web stack',
      'High-converting lead capture with WhatsApp direct hook',
      'Integrated conversational AI assistant ready on launch',
      'On-page technical SEO & structured real-estate schema',
      'Google Analytics 4 & Meta Pixel conversion tracking',
      'First month comprehensive maintenance & staging included'
    ],
    deliverables: [
      'Production deployment on high-speed CDN',
      'Fully responsive UI across mobile, tablet, and ultra-wide screens',
      'Interactive property showcase and contact modals',
      'Pre-configured DNS, SSL, and analytics dashboard hookup'
    ],
    startingPriceUSD: 1000,
    billingType: 'one-time',
    scopeNotes: 'Excludes custom backend CRM or paid API usage. Domain registration and ongoing maintenance after month one quoted separately.',
    relatedServiceSlugs: ['crm-development', 'ai-assistants', 'ai-automation'],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'custom-software',
    slug: 'custom-software',
    title: 'Custom Software Development',
    division: 'real-estate',
    kicker: 'PROPRIETARY SYSTEMS',
    headline: 'Purpose-built operational software solving exact brokerage bottlenecks.',
    summary: 'When off-the-shelf software fails your workflow, we engineer custom internal web platforms, deal portals, agent collaboration tools, and client extranets with secure role-based access control.',
    targetAudience: 'Growing real estate firms, investment syndicates, and prop-tech operators outgrowing standard templates.',
    keyFeatures: [
      'Comprehensive workflow & operational requirements audit',
      'Clean UI/UX wireframes & design system tailored to your team',
      'Modern frontend paired with secure API endpoints',
      'Robust relational or document database schema design',
      'Role-based authentication & strict data access permissions',
      'Custom operational business logic and transaction tracking',
      'Full technical architecture documentation & deployment handover'
    ],
    deliverables: [
      'Complete proprietary web software codebase',
      'User management and administrative portal',
      'Production server deployment and database setup',
      'Operational training guide for your internal team'
    ],
    startingPriceUSD: 2500,
    billingType: 'one-time',
    scopeNotes: 'Final investment determined by user roles, complex transaction logic, and third-party enterprise integrations.',
    relatedServiceSlugs: ['crm-development', 'ai-automation', 'admin-support'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'crm-development',
    slug: 'crm-development',
    title: 'CRM Development & Architecture',
    division: 'real-estate',
    kicker: 'PIPELINE ARCHITECTURE',
    headline: 'Centralize every buyer, seller, and investor interaction into an automated command centre.',
    summary: 'Custom-configured real estate CRM architectures built to stop lead leakage. Track multi-stage transaction pipelines, automate buyer follow-ups, and sync with WhatsApp and email effortlessly.',
    targetAudience: 'Real estate agencies, developer sales desks, and property consultants struggling with disorganized spreadsheets and missed inquiries.',
    keyFeatures: [
      'Tailored pipeline staging for buyers, sellers, and off-plan investors',
      'Contact, organization, and property deal record management',
      'Automated email and instant WhatsApp follow-up triggers',
      'Agent lead distribution, task delegation, and SLA timers',
      'Executive dashboards featuring pipeline velocity and close rates',
      'Activity timeline capturing every message, call, and showing'
    ],
    deliverables: [
      'Configured CRM platform with custom fields and deal stages',
      'Automated communication templates and triggers',
      'Historical contact import and data sanitization',
      'Live agent workflow training session'
    ],
    startingPriceUSD: 3500,
    billingType: 'one-time',
    scopeNotes: 'Starter package starts at $3,500 / AED 12,850. Growth ($7,500 / AED 27,550) and Premium ($15,000+ / AED 55,100+) tiers expand custom modules and AI qualification.',
    tiers: [
      { name: 'Starter', priceUSD: 3500, note: 'Core pipeline, lead & deal management' },
      { name: 'Growth', priceUSD: 7500, note: 'Custom modules and multi-stage pipelines' },
      { name: 'Premium', priceUSD: 15000, note: 'AI qualification and bespoke architecture' }
    ],
    relatedServiceSlugs: ['ai-automation', 'ai-assistants', 'admin-support'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'ai-automation',
    slug: 'ai-automation',
    title: 'AI Automation & Workflows',
    division: 'real-estate',
    kicker: 'ZERO-TOUCH OPERATIONS',
    headline: 'Eliminate repetitive operational tasks so your brokers can focus on closing.',
    summary: 'Autonomous end-to-end automation connecting your lead ads, portal listings, email inboxes, WhatsApp, and CRM. Inquiries are enriched, qualified, and routed within seconds 24/7/365.',
    targetAudience: 'High-volume property agencies and brokers spending excessive hours copying lead data, sending repetitive intro messages, and scheduling visits manually.',
    keyFeatures: [
      'Instant webhook connection to Zillow, Bayut, Property Finder, and Meta Ads',
      'AI-driven inquiry enrichment and buyer budget verification',
      'Automated calendar scheduling with SMS/WhatsApp confirmations',
      'Document generation for contracts, offers, and listing brochures',
      'Cross-system synchronization between inbox, calendar, and CRM'
    ],
    deliverables: [
      'Autonomous multi-system workflow integrations',
      'Error monitoring, fallback notifications, and retry logic',
      'Automated reporting digest sent directly to executive Slack/WhatsApp',
      'Workflow schematics and operational documentation'
    ],
    startingPriceUSD: 1500,
    billingType: 'one-time',
    scopeNotes: 'Starter includes 1–2 key workflows. Growth includes 3–6 workflows ($3,500 / AED 12,850). Premium covers multi-system agentic automation ($7,500+ / AED 27,550+).',
    tiers: [
      { name: 'Starter', priceUSD: 1500, note: '1–2 key workflows' },
      { name: 'Growth', priceUSD: 3500, note: '3–6 workflows' },
      { name: 'Premium', priceUSD: 7500, note: 'Multi-system agentic automation' }
    ],
    relatedServiceSlugs: ['ai-assistants', 'crm-development', 'web-development'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'ai-assistants',
    slug: 'ai-assistants',
    title: 'AI Assistants & Conversational Chatbots',
    division: 'real-estate',
    kicker: '24/7 QUALIFICATION',
    headline: 'Trained on your inventory, qualifying serious prospects while you sleep.',
    summary: 'Intelligent, natural conversational agents deployed to your website and WhatsApp. They answer property questions, capture buyer criteria, schedule viewing appointments, and seamlessly pass hot deals to human agents.',
    targetAudience: 'Brokers handling international buyers across time zones who demand instant, accurate replies at 2 AM.',
    keyFeatures: [
      'Fine-tuned on your exact listings, project brochures, and pricing guides',
      'Strict guardrails preventing hallucination or misleading commitments',
      'Budget, financing, and timeframe qualification before human handoff',
      'Instant calendar booking integration (Calendly, Google Calendar)',
      'Multi-lingual support including English, Arabic, and French',
      'Full transcript logging and CRM contact sync'
    ],
    deliverables: [
      'Custom branded conversational assistant embedded on site',
      'Configured knowledge base and qualification decision tree',
      'Human agent alert triggers for VIP high-intent leads',
      'Analytics dashboard tracking conversation volume and conversion'
    ],
    startingPriceUSD: 500,
    billingType: 'one-time',
    scopeNotes: 'Starter starts at $500 / AED 1,850. Growth ($1,000 / AED 3,675) adds multichannel + CRM sync. Premium ($2,500+ / AED 9,200+) provides custom actions and deep API integration.',
    tiers: [
      { name: 'Starter', priceUSD: 500, note: 'Website assistant with lead capture' },
      { name: 'Growth', priceUSD: 1000, note: 'Multichannel + CRM sync' },
      { name: 'Premium', priceUSD: 2500, note: 'Custom actions and deep API integration' }
    ],
    relatedServiceSlugs: ['ai-automation', 'crm-development', 'web-development'],
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'social-media',
    slug: 'social-media',
    title: 'Social Media Management',
    division: 'real-estate',
    kicker: 'AUTHORITY & REACH',
    headline: 'Transform your brand into the undisputed market authority in your luxury territory.',
    summary: 'Strategic organic distribution designed to position your founders and listings at the top of mind for affluent buyers, property investors, and top talent across Instagram, LinkedIn, and YouTube.',
    targetAudience: 'Principals, boutique agencies, and developers seeking consistent, editorial-grade digital positioning without managing an internal content staff.',
    keyFeatures: [
      'Strategic monthly content calendar aligned with listing cycles',
      'High-end carousel designs, architectural stills, and video shorts',
      'Copywriting engineered for real estate investor psychology',
      'Community management, comment responses, and direct lead triage',
      'Consistent posting schedule optimized for algorithm reach',
      'Monthly analytics review detailing reach, saves, and inquiries'
    ],
    deliverables: [
      'Scheduled posts and stories across 2 to 4 major channels',
      'Curated caption copies with researched local real estate tags',
      'Monthly performance audit and tactical refinement'
    ],
    startingPriceUSD: 500,
    billingType: 'monthly',
    scopeNotes: 'Starter ($500/mo) includes 2 platforms & 8 posts. Growth ($1,000/mo) includes 3 platforms, 12 posts & 4 videos. Premium ($1,500/mo) includes 4 platforms, 16-20 posts & 8 videos.',
    tiers: [
      { name: 'Starter', priceUSD: 500, note: '2 platforms · 8 posts / month' },
      { name: 'Growth', priceUSD: 1000, note: '3 platforms · 12 posts · 4 videos / month' },
      { name: 'Premium', priceUSD: 1500, note: '4 platforms · 16–20 posts · 8 videos / month' }
    ],
    relatedServiceSlugs: ['real-estate', 'web-development'],
    image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'virtual-assistance',
    slug: 'virtual-assistance',
    title: 'Virtual Assistance',
    division: 'real-estate',
    kicker: 'EXECUTIVE LEVERAGE',
    headline: 'Dedicated operational horsepower to keep your business running smoothly.',
    summary: 'Skilled executive and operational assistants trained in real estate workflows, CRM upkeep, showing coordination, client follow-up, and administrative tasks.',
    targetAudience: 'Top-producing solo agents and busy agency owners drowning in non-dollar-productive administrative busywork.',
    keyFeatures: [
      'Direct WhatsApp and Slack daily synchronization with founders',
      'Lead research, contact enrichment, and duplicate removal',
      'Showing coordination, inspection scheduling, and calendar management',
      'Document filing, disclosure packet tracking, and checklist upkeep',
      'Client nurture messages and routine follow-up dispatch'
    ],
    deliverables: [
      'Dedicated monthly hours with transparent task tracking',
      'Daily end-of-day summary reports of completed deliverables',
      'Standard Operating Procedure (SOP) documentation for your operations'
    ],
    startingPriceUSD: 300,
    billingType: 'monthly',
    scopeNotes: 'Starter: up to 20 hours ($300/mo / AED 1,100). Growth: up to 40 hours ($600/mo / AED 2,200). Premium: up to 80 hours ($1,000/mo / AED 3,675).',
    tiers: [
      { name: 'Starter', priceUSD: 300, note: 'Up to 20 hours / month' },
      { name: 'Growth', priceUSD: 600, note: 'Up to 40 hours / month' },
      { name: 'Premium', priceUSD: 1000, note: 'Up to 80 hours / month' }
    ],
    relatedServiceSlugs: ['admin-support', 'crm-development'],
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'admin-support',
    slug: 'admin-support',
    title: 'Real Estate Admin Operations',
    division: 'real-estate',
    kicker: 'BACK-OFFICE PRECISION',
    headline: 'Flawless database integrity, listing data entry, and deal coordination.',
    summary: 'Specialized back-office operational support for high-transaction real estate firms. We maintain your MLS/portal listings, organize transaction paperwork, and keep CRM pipelines pristine.',
    targetAudience: 'Brokerage operations managers, team leaders, and transaction coordinators managing multiple simultaneous escrows.',
    keyFeatures: [
      'Listing data preparation, photo ordering, and portal entry (MLS, Bayut, Property Finder)',
      'CRM database hygiene, contact deduplication, and tag restructuring',
      'Document organization and compliance checklist verification',
      'Spreadsheet modeling and monthly closed volume reporting',
      'Property database upkeep and off-market inventory catalogues'
    ],
    deliverables: [
      'Structured listing and closing documentation archives',
      'Regular pipeline hygiene audits and data cleanups',
      'Weekly operational report highlighting active deal milestones'
    ],
    startingPriceUSD: 500,
    billingType: 'monthly',
    scopeNotes: 'Custom enterprise volume and multi-office requirements receive tailored quotes after operational audit.',
    relatedServiceSlugs: ['virtual-assistance', 'crm-development', 'custom-software'],
    image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1600&q=80'
  },

  // --- DIVISION TWO: AI CONTENT STUDIO ---
  {
    id: 'real-estate',
    slug: 'real-estate',
    title: 'AI Real Estate & Property Tours',
    division: 'ai-content',
    kicker: 'CINEMATIC ARCHITECTURE',
    headline: 'Photorealistic architectural flythroughs and property films without physical camera crews.',
    summary: 'Transform 2D floor plans, architectural renderings, and still photos into breathtaking cinematic drone flythroughs, golden-hour interior pans, and prestige property films for ultra-luxury residences.',
    targetAudience: 'Luxury real estate developers, off-plan brokerages, and estate agents marketing high-ticket properties globally.',
    keyFeatures: [
      'Hyper-realistic atmospheric lighting (golden hour, twilight, dramatic dawn)',
      'Smooth camera physics mirroring heavy Hollywood gimbal rigs',
      'Zero staging fees, weather delays, or expensive film permit bureaucracy',
      'Seamless sound design, subtle room tone, and cinematic audio mastering',
      'Custom aspect ratios (9:16 vertical for Reels/TikTok, 16:9 4K for YouTube & web)'
    ],
    deliverables: [
      'Color-graded high-definition video master files',
      'Vertical teaser cuts optimized for social media ads',
      'Commercial usage licensing for web, social, and billboard display'
    ],
    startingPriceUSD: 45,
    billingType: 'per-video',
    scopeNotes: 'Individual video rates: Starter $45 (AED 165), Standard $65 (AED 240), Professional $100 (AED 370). Monthly 10/20/30 video packages offer up to 24% savings.',
    relatedServiceSlugs: ['fashion', 'products', 'web-development'],
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'fashion',
    slug: 'fashion',
    title: 'AI Fashion & Apparel Campaigns',
    division: 'ai-content',
    kicker: 'HAUTE COUTURE AI',
    headline: 'Editorial runway films and lookbooks with infinite aesthetic versatility.',
    summary: 'High-fashion cinematic visuals, model lookbooks, and luxury clothing campaigns without booking Paris locations, booking agency talent, or risking seasonal sample delays.',
    targetAudience: 'Apparel brands, streetwear labels, luxury ateliers, and jewelry designers seeking international campaign prestige.',
    keyFeatures: [
      'Realistic textile physics, fabric drape, and metallic sheen reproduction',
      'Stylized cinematic art direction matching your brand lookbook',
      'Surreal, dreamlike, or hyper-urban set designs impossible on physical shoots',
      'Synchronized editorial pacing and modern audio scoring',
      'Multi-model diversity and styling continuity across campaign cuts'
    ],
    deliverables: [
      'Full-length campaign hero film',
      'Micro-cuts tailored for Meta Ads, TikTok, and Instagram Stories',
      'High-resolution promotional stills extracted for lookbooks'
    ],
    startingPriceUSD: 45,
    billingType: 'per-video',
    scopeNotes: 'Starter at $45 / AED 165. Professional multi-angle storytelling at $100 / AED 370 per film. Monthly brand retainers available.',
    relatedServiceSlugs: ['products', 'real-estate', 'social-content'],
    image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'food',
    slug: 'food',
    title: 'AI Food & Restaurant Films',
    division: 'ai-content',
    kicker: 'SENSORY STORYTELLING',
    headline: 'Mouth-watering culinary visuals that make diners crave your dishes.',
    summary: 'Sensory-rich food cinematography capturing sizzle, pour, garnish, and steam in hyper-detailed macro frames. Ideal for restaurant launches, beverage brands, and culinary hospitality.',
    targetAudience: 'Fine dining establishments, hospitality groups, beverage brands, and culinary innovators launching new menus.',
    keyFeatures: [
      'Ultra-slow-motion liquid pours, flame searing, and steam dynamics',
      'Lush color chemistry accentuating freshness, crust, and texture',
      'Atmospheric mood lighting tailored to your restaurant concept',
      'Engaging sound design capturing crisp culinary audio textures'
    ],
    deliverables: [
      'Cinematic dish showcase films',
      'Social cutdowns engineered for viral local discovery',
      'Menu digital display master files'
    ],
    startingPriceUSD: 45,
    billingType: 'per-video',
    scopeNotes: 'Starter from $45 (AED 165). Professional grade $100 (AED 370). Volume package discounts apply for full seasonal menu launches.',
    relatedServiceSlugs: ['products', 'fashion', 'social-content'],
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'products',
    slug: 'products',
    title: 'AI Product Commercials & Films',
    division: 'ai-content',
    kicker: 'OBJECT DESIRE',
    headline: 'Industrial design films and product commercials with zero studio overhead.',
    summary: 'Exploded component views, futuristic environment showcases, and sleek studio lighting for consumer goods, tech hardware, cosmetics, and accessories.',
    targetAudience: 'E-commerce DTC brands, hardware manufacturers, watchmakers, and cosmetic lines demanding Apple-level product reveal aesthetics.',
    keyFeatures: [
      'Extreme close-up macro detail on materials, textures, and finishes',
      'Dynamic 3D-feel orbital camera orbits and lighting sweeps',
      'Abstract and surreal brand worlds tailored to elevate product positioning',
      'High-energy audio synchronization and impact sound effects'
    ],
    deliverables: [
      'Flagship product reveal film in 4K',
      'Product page video loops for e-commerce conversion',
      'High-CTR advertising cuts for paid social campaigns'
    ],
    startingPriceUSD: 45,
    billingType: 'per-video',
    scopeNotes: 'Professional tier ($100 / AED 370) features multi-angle choreography, advanced transitions, and bespoke visual direction.',
    relatedServiceSlugs: ['fashion', 'food', 'real-estate'],
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'ai-advertising',
    slug: 'ai-advertising',
    title: 'AI Commercials & Performance Ads',
    division: 'ai-content',
    kicker: 'PAID MEDIA VELOCITY',
    headline: 'Creative assets engineered to lower acquisition costs and stop the scroll.',
    summary: 'High-concept commercial spots combining cinematic narrative with conversion psychology. Rapidly test multiple visual hooks and storylines without re-booking physical production shoots.',
    targetAudience: 'Growth marketers, direct-to-consumer founders, and agencies scaling paid campaigns on Meta, TikTok, and YouTube.',
    keyFeatures: [
      'Pattern-interrupting first 3-second visual hooks',
      'Iterative variation testing across background environments and angles',
      'Integrated text typography overlays and subtle motion graphics',
      'Optimized export formats for Meta, TikTok, and YouTube Shorts'
    ],
    deliverables: [
      'Batch variations of hero ad creatives',
      'Direct response hooks and CTA ending cards',
      'Performance-ready aspect ratio packages (9:16, 1:1, 16:9)'
    ],
    startingPriceUSD: 45,
    billingType: 'per-video',
    scopeNotes: 'Best ordered in 10, 20, or 30 video monthly creative testing bundles for scalable media buying.',
    relatedServiceSlugs: ['products', 'social-content'],
    image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'social-content',
    slug: 'social-content',
    title: 'Brand Cinematic Social Content',
    division: 'ai-content',
    kicker: 'ALGORITHMIC DOMINANCE',
    headline: 'Continuous stream of high-production short-form video for luxury brands.',
    summary: 'Daily and weekly video content designed to establish unshakeable cultural presence. From aesthetic mood reels to thought-leadership visuals, keeping your brand relevant without burnout.',
    targetAudience: 'Personal brands, luxury boutique founders, and aesthetic companies looking to command attention on organic feeds.',
    keyFeatures: [
      'Cohesive visual grammar maintaining brand color palette and tone',
      'Trending audio research and rhythmic visual synchrony',
      'Fast turnaround delivery pipeline',
      'High re-share value and organic save potential'
    ],
    deliverables: [
      'Monthly packs of ready-to-post short films with captions',
      'Thumbnail selection frames and visual teasers'
    ],
    startingPriceUSD: 45,
    billingType: 'per-video',
    scopeNotes: 'Starter package starts at 10 videos ($405 / AED 1,490). Scaling to 30 videos ($1,020 / AED 3,745).',
    relatedServiceSlugs: ['fashion', 'products', 'food'],
    image: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=1600&q=80'
  }
];
