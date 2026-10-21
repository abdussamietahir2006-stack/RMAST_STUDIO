// Single source of truth for per-page SEO: titles, descriptions, canonical URLs and structured data.
// Used by the browser (to update the head on navigation) and by the build-time prerenderer.
import { ASSISTANTS, FAQ, type Assistant } from '../data/assistantsData.js';
import { teamData } from '../data/teamData.js';
import { CONTACT } from '../config/contact.js';

export const SITE_NAME = 'RMAST Studio';
export const DEFAULT_TITLE = 'RMAST Studio: Real Estate Virtual, Creative & Technical Assistants';
export const DEFAULT_DESCRIPTION =
  'Virtual, Creative and Technical Assistants for real estate agents, teams and brokerages. Lead response for realtors in 60 seconds, real estate social media management and admin.';
export const OG_IMAGE = { path: '/og-image.png', width: 1200, height: 630, alt: 'RMAST Studio: Assistants for real estate teams' };

const AREA_SERVED = ['United States', 'Canada', 'United Arab Emirates'];
const AUDIENCE = 'Real estate agents, teams and brokerages';

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
  '/services': {
    title: 'Services: Real Estate Virtual Assistant, Social Media & CRM Setup | RMAST Studio',
    description:
      'Three Assistants for realtors: a Technical Assistant for lead response and real estate CRM setup, a Creative Assistant for social media, and a real estate virtual assistant.',
    crumb: 'Services'
  },
  '/plans': {
    title: 'Plans: One Assistant or the Full Team, Monthly Retainer | RMAST Studio',
    description:
      'Hire one Assistant or all three as your Full Team, on a monthly retainer. Your plan is priced after a free audit of your leads, content and admin.',
    crumb: 'Plans'
  },
  '/free-audit': {
    title: 'Free Audit for Real Estate Agents & Teams | RMAST Studio',
    description:
      'See what’s costing you leads, free. We check your lead response time, website, social media and admin, then tell you what to fix first. No obligation.',
    crumb: 'Free Audit'
  },
  '/work': {
    title: 'Our Work: Real Estate Content, Systems & Support | RMAST Studio',
    description:
      'Work from RMAST Studio’s Technical, Creative and Virtual Assistants for real estate agents, teams and brokerages in the USA, Canada and Dubai.',
    crumb: 'Work'
  },
  '/about': {
    title: 'About RMAST Studio: Founders Abdussamie Tahir & Mashhood',
    description:
      'RMAST Studio is a founder-led team run by Raja Muhammad Abdussamie Tahir and Mashhood, giving real estate agents and teams Virtual, Creative and Technical Assistants.',
    crumb: 'About'
  },
  '/contact': {
    title: 'Book a Call with RMAST Studio',
    description: `Book a call or send us a message. The founders reply within 24 hours. WhatsApp ${CONTACT.whatsappDisplay} or ${CONTACT.email}.`,
    crumb: 'Contact'
  }
};

// Every indexable page, for the sitemap and the prerenderer
export const PUBLIC_ROUTES: string[] = [...Object.keys(STATIC_PAGES), ...ASSISTANTS.map((a) => a.path)];

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
    areaServed: AREA_SERVED,
    knowsAbout: [
      'Real estate virtual assistant',
      'Real estate transaction coordination',
      'Lead response for realtors',
      'Real estate CRM setup',
      'Real estate websites',
      'Real estate social media management',
      'Real estate video content'
    ],
    makesOffer: ASSISTANTS.map((a) => ({
      '@type': 'Offer',
      itemOffered: { '@type': 'Service', name: a.name, url: `${site}${a.path}` }
    })),
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
    alternateName: ['RMAST', 'RMAST Studio Real Estate Assistants'],
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en',
    publisher: { '@id': orgId(site) }
  };
}

function faqPage() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
  };
}

function service(site: string, a: Assistant) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: a.name,
    serviceType: a.seo.serviceType,
    description: a.intro,
    url: `${site}${a.path}`,
    provider: { '@id': orgId(site) },
    areaServed: AREA_SERVED,
    audience: { '@type': 'BusinessAudience', audienceType: AUDIENCE },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${a.name} services`,
      itemListElement: a.subServices.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.title, description: s.summary }
      }))
    }
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
    if (path === '/') jsonLd.push(organization(site), website(site), faqPage());
    else jsonLd.push(breadcrumbs(site, [{ name: page.crumb ?? page.title, path }]));
    if (path === '/plans') jsonLd.push(faqPage());
    if (path === '/about') jsonLd.push(...founders(site));
    return { title: page.title, description: clip(page.description), path, noindex: false, ogType: 'website', jsonLd };
  }

  const assistant = ASSISTANTS.find((a) => a.path === path);
  if (assistant) {
    return {
      title: assistant.seo.title,
      description: clip(assistant.seo.description),
      path,
      noindex: false,
      ogType: 'website',
      jsonLd: [
        service(site, assistant),
        breadcrumbs(site, [
          { name: 'Services', path: '/services' },
          { name: assistant.name, path }
        ])
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
