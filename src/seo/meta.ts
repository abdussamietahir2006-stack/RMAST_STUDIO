// Single source of truth for per-page SEO: titles, descriptions, canonical URLs and structured data.
// Used by the browser (to update the head on navigation) and by the build-time prerenderer.
import { servicesData } from '../data/servicesData.js';
import { teamData } from '../data/teamData.js';
import { CONTACT } from '../config/contact.js';

export const SITE_NAME = 'RMAST Studio';
export const DEFAULT_TITLE = 'RMAST Studio — Real Estate Digital Systems & Cinematic AI Content';
export const DEFAULT_DESCRIPTION =
  'RMAST Studio builds websites, CRMs and AI automation for real estate brokerages in the USA, UAE and Canada, and creates cinematic AI video for brands worldwide.';
export const OG_IMAGE = { path: '/og-image.png', width: 1200, height: 630, alt: 'RMAST Studio: digital systems for real estate and cinematic AI content' };

export interface RouteMeta {
  title: string;
  description: string;
  path: string | null; // canonical path; null for pages that shouldn't be indexed
  noindex: boolean;
  ogType: 'website' | 'profile' | 'article';
  jsonLd: Record<string, unknown>[];
}

interface StaticPage {
  title: string;
  description: string;
  crumb?: string;
}

const STATIC_PAGES: Record<string, StaticPage> = {
  '/': { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION },
  '/real-estate': {
    title: 'Real Estate Websites, CRM & AI Automation | RMAST Studio',
    description:
      'Custom websites, CRM systems, AI chatbots and lead automation for real estate brokerages and developers in the USA, UAE and Canada. Packages from $800.',
    crumb: 'Real Estate'
  },
  '/ai-content': {
    title: 'Cinematic AI Video for Brands: Real Estate, Fashion, Food | RMAST Studio',
    description:
      'Production without the production: cinematic AI property tours, fashion campaigns, food films and product commercials. AI videos from $45, monthly bundles available.',
    crumb: 'AI Content'
  },
  '/services': {
    title: 'Services: Real Estate Systems & AI Content Production | RMAST Studio',
    description:
      'Every RMAST Studio service in one place: websites, custom software, CRM, AI automation and assistants for real estate, plus cinematic AI video production.',
    crumb: 'Services'
  },
  '/pricing': {
    title: 'Pricing: Websites, CRM, AI Automation & AI Video | RMAST Studio',
    description:
      'Transparent starting prices for real estate digital systems, AI video (from $45), monthly content bundles, complete business packages and add-ons, in USD or AED.',
    crumb: 'Pricing'
  },
  '/work': {
    title: 'Selected Work: Real Estate Systems & AI Campaigns | RMAST Studio',
    description:
      'Selected projects: luxury real estate websites, deal pipelines, autonomous lead engines and cinematic AI campaigns for fashion, food and product brands.',
    crumb: 'Work'
  },
  '/case-studies': {
    title: 'Case Studies: Challenges, Solutions & Results | RMAST Studio',
    description:
      'How RMAST Studio solved real problems for brokerages and brands: the challenge, the system we built, and the business outcome for each project.',
    crumb: 'Case Studies'
  },
  '/about': {
    title: 'About RMAST Studio: Founders Abdussamie Tahir & Mashhood',
    description:
      'RMAST Studio is a founder-led studio run by Raja Muhammad Abdussamie Tahir and Mashhood. Small team, serious execution, direct founder access on every project.',
    crumb: 'About'
  },
  '/process': {
    title: 'Our Process: Discover, Strategy, Design, Build, Launch, Optimize | RMAST Studio',
    description:
      'How RMAST Studio delivers: a six-stage process from audit and strategy through design, build, launch and ongoing optimization.',
    crumb: 'Process'
  },
  '/contact': {
    title: 'Contact RMAST Studio: Start a Project',
    description: `Tell us what you want to build, automate or create. Reply within 24 hours from the founders. WhatsApp ${CONTACT.whatsappDisplay} or ${CONTACT.email}.`,
    crumb: 'Contact'
  }
};

const serviceRoute = (s: (typeof servicesData)[number]) =>
  s.division === 'real-estate' ? `/services/${s.slug}` : `/ai-content/${s.slug}`;

// Every indexable page, for the sitemap and the prerenderer
export const PUBLIC_ROUTES: string[] = [...Object.keys(STATIC_PAGES), ...servicesData.map(serviceRoute)];

// Search results show roughly 155 characters of a description
function clip(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`;
}

// ---------------------------------------------------------------------------
// Structured data (schema.org JSON-LD)
// ---------------------------------------------------------------------------

const orgId = (site: string) => `${site}/#organization`;

function organization(site: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': orgId(site),
    name: SITE_NAME,
    url: `${site}/`,
    logo: `${site}/icon-512.png`,
    image: `${site}${OG_IMAGE.path}`,
    description: DEFAULT_DESCRIPTION,
    email: CONTACT.email,
    telephone: `+${CONTACT.whatsappNumber}`,
    sameAs: [CONTACT.instagramUrl, CONTACT.founderLinkedIn],
    founder: teamData.map((f) => ({ '@type': 'Person', name: f.name, jobTitle: f.title })),
    areaServed: ['United States', 'United Arab Emirates', 'Canada', 'Worldwide'],
    knowsAbout: [
      'Real estate websites',
      'Real estate CRM',
      'AI automation',
      'AI chatbots',
      'AI video production',
      'Cinematic property tours'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: CONTACT.email,
      telephone: `+${CONTACT.whatsappNumber}`,
      availableLanguage: ['English', 'Urdu']
    }
  };
}

function website(site: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${site}/#website`,
    url: `${site}/`,
    // Google uses name/alternateName for the site name shown above search results
    name: SITE_NAME,
    alternateName: ['RMAST', 'RMAST Studio Real Estate & AI Content'],
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en',
    publisher: { '@id': orgId(site) }
  };
}

function breadcrumbs(site: string, trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...trail].map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: `${site}${c.path === '/' ? '/' : c.path}`
    }))
  };
}

function founders(site: string) {
  return teamData.map((f) => ({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: f.name,
    jobTitle: f.title,
    description: f.bio,
    image: f.image,
    worksFor: { '@id': orgId(site) },
    ...(f.linkedin ? { sameAs: [f.linkedin] } : {})
  }));
}

// ---------------------------------------------------------------------------

export function getRouteMeta(rawPath: string, site: string): RouteMeta {
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;

  if (path === '/admin' || path.startsWith('/admin/')) {
    return { title: 'Founder Dashboard | RMAST Studio', description: DEFAULT_DESCRIPTION, path: null, noindex: true, ogType: 'website', jsonLd: [] };
  }

  const page = STATIC_PAGES[path];
  if (page) {
    const jsonLd: Record<string, unknown>[] = [];
    if (path === '/') jsonLd.push(organization(site), website(site));
    else jsonLd.push(breadcrumbs(site, [{ name: page.crumb ?? page.title, path }]));
    if (path === '/about') jsonLd.push(...founders(site));
    return { title: page.title, description: clip(page.description), path, noindex: false, ogType: 'website', jsonLd };
  }

  const match = path.match(/^\/(services|ai-content)\/([^/]+)$/);
  const service = match
    ? servicesData.find(
        (s) => s.slug === match[2] && s.division === (match[1] === 'services' ? 'real-estate' : 'ai-content')
      )
    : undefined;

  if (service) {
    const isAi = service.division === 'ai-content';
    const divisionCrumb = isAi ? { name: 'AI Content', path: '/ai-content' } : { name: 'Real Estate', path: '/real-estate' };
    const unit = service.billingType === 'monthly' ? ' per month' : service.billingType === 'per-video' ? ' per video' : '';
    return {
      title: isAi ? `${service.title}: Cinematic AI Video | RMAST Studio` : `${service.title} for Real Estate | RMAST Studio`,
      description: clip(`${service.summary} From $${service.startingPriceUSD.toLocaleString('en-US')}${unit}.`),
      path,
      noindex: false,
      ogType: 'website',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: service.title,
          serviceType: service.title,
          description: service.summary,
          url: `${site}${path}`,
          image: service.image,
          provider: { '@id': orgId(site) },
          areaServed: isAi ? 'Worldwide' : ['United States', 'United Arab Emirates', 'Canada'],
          audience: { '@type': 'Audience', audienceType: service.targetAudience },
          offers: {
            '@type': 'Offer',
            price: service.startingPriceUSD,
            priceCurrency: 'USD',
            description: `Starting price${unit}`
          }
        },
        breadcrumbs(site, [divisionCrumb, { name: service.title, path }])
      ]
    };
  }

  return {
    title: 'Page Not Found | RMAST Studio',
    description: DEFAULT_DESCRIPTION,
    path: null,
    noindex: true,
    ogType: 'website',
    jsonLd: []
  };
}
