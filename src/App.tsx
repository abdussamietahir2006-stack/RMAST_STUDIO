import React, { Suspense, lazy, useEffect } from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { InquiryProvider } from './context/InquiryContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SiteContentProvider } from './context/SiteContentContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PageBackground } from './components/layout/PageBackground';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { StudioAssistant } from './components/common/StudioAssistant';
import { InquiryModal } from './components/inquiry/InquiryModal';
import { servicesData } from './data/servicesData';

// Pages are code-split so each route only downloads what it renders
const named = <K extends string>(loader: () => Promise<Record<K, React.ComponentType<any>>>, name: K) =>
  lazy(() => loader().then((m) => ({ default: m[name] })));

const HomePage = named(() => import('./pages/HomePage'), 'HomePage');
const RealEstatePage = named(() => import('./pages/RealEstatePage'), 'RealEstatePage');
const AiContentPage = named(() => import('./pages/AiContentPage'), 'AiContentPage');
const ServicesPage = named(() => import('./pages/ServicesPage'), 'ServicesPage');
const ServiceDetailPage = named(() => import('./pages/ServiceDetailPage'), 'ServiceDetailPage');
const PricingPage = named(() => import('./pages/PricingPage'), 'PricingPage');
const WorkPage = named(() => import('./pages/WorkPage'), 'WorkPage');
const CaseStudiesPage = named(() => import('./pages/CaseStudiesPage'), 'CaseStudiesPage');
const AboutPage = named(() => import('./pages/AboutPage'), 'AboutPage');
const ProcessPage = named(() => import('./pages/ProcessPage'), 'ProcessPage');
const ContactPage = named(() => import('./pages/ContactPage'), 'ContactPage');
const AdminApp = named(() => import('./admin/AdminApp'), 'AdminApp');
const NotFoundPage = named(() => import('./pages/NotFoundPage'), 'NotFoundPage');

const DEFAULT_TITLE = 'RMAST Studio — Premium Digital Systems & AI Content';
const DEFAULT_DESC =
  'Digital systems for real estate. Cinematic AI content for brands. Small team. Serious execution.';

const staticMeta: Record<string, { title: string; desc: string }> = {
  '/': { title: DEFAULT_TITLE, desc: DEFAULT_DESC },
  '/real-estate': {
    title: 'Real Estate Digital Systems | RMAST Studio',
    desc: 'Custom web development, CRM, AI automation, and lead engines for real estate brokerages in USA, UAE, and Canada.'
  },
  '/ai-content': {
    title: 'AI Content Studio & Cinematic Video | RMAST Studio',
    desc: 'Production without the production. Cinematic AI video for brands, fashion lookbooks, sensory food cinema, and product commercials.'
  },
  '/services': {
    title: 'Studio Services & Architecture | RMAST Studio',
    desc: 'Full service catalogue covering real estate digital systems and creative AI content production.'
  },
  '/pricing': {
    title: 'Investment Framework & Pricing | RMAST Studio',
    desc: 'Transparent starting rates for real estate systems, AI video retainers, complete business bundles, and add-on modules.'
  },
  '/work': {
    title: 'Selected Works & Digital Systems | RMAST Studio',
    desc: 'A curated portfolio of high-performing broker flagships, automated deal engines, and high-fashion AI campaigns.'
  },
  '/case-studies': {
    title: 'Case Studies & Architectural Breakdowns | RMAST Studio',
    desc: 'Detailed engineering specifications, challenges, and delivered business outcomes across studio projects.'
  },
  '/about': {
    title: 'About RMAST Studio — Small Team. Serious Execution.',
    desc: 'Founded by Raja Muhammad Abdussamie Tahir & Mashhood. High-standard digital systems and cinematic AI content.'
  },
  '/process': {
    title: 'Methodology & 6-Stage Delivery | RMAST Studio',
    desc: 'From audit to deployment: Discover, Strategy, Design, Build, Launch, and Optimize.'
  },
  '/contact': {
    title: 'Start a Project Conversation | RMAST Studio',
    desc: 'Have something worth building? Connect directly with founders Raja Muhammad Abdussamie Tahir and Mashhood.'
  }
};

type Route =
  | { kind: 'admin' }
  | { kind: 'static'; path: string }
  | { kind: 'service'; slug: string; division: 'real-estate' | 'ai-content' }
  | { kind: 'not-found' };

function resolveRoute(rawPath: string): Route {
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;

  if (path === '/admin' || path.startsWith('/admin/')) return { kind: 'admin' };

  const serviceMatch = path.match(/^\/(services|ai-content)\/([^/]+)$/);
  if (serviceMatch) {
    const division = serviceMatch[1] === 'services' ? 'real-estate' : 'ai-content';
    return { kind: 'service', slug: serviceMatch[2], division };
  }

  if (path in staticMeta) return { kind: 'static', path };
  return { kind: 'not-found' };
}

function setMeta(title: string, desc: string, noindex: boolean) {
  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute('content', desc);

  let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
  if (noindex) {
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex, nofollow';
  } else {
    robots?.remove();
  }
}

const AppRouter: React.FC = () => {
  const { currentPath } = useNavigation();
  const route = resolveRoute(currentPath);

  useEffect(() => {
    if (route.kind === 'admin') {
      setMeta('Founder Dashboard | RMAST Studio', DEFAULT_DESC, true);
      return;
    }

    if (route.kind === 'static') {
      const meta = staticMeta[route.path];
      setMeta(meta.title, meta.desc, false);
      return;
    }

    if (route.kind === 'service') {
      const service = servicesData.find((s) => s.slug === route.slug && s.division === route.division);
      if (service) {
        const title =
          route.division === 'ai-content'
            ? `${service.title} — Cinematic AI Content | RMAST Studio`
            : `${service.title} | RMAST Studio`;
        setMeta(title, service.summary, false);
        return;
      }
    }

    setMeta('Page Not Found | RMAST Studio', DEFAULT_DESC, true);
  }, [currentPath]);

  const renderRoute = () => {
    if (route.kind === 'service') {
      return <ServiceDetailPage key={currentPath} slug={route.slug} division={route.division} />;
    }
    if (route.kind !== 'static') {
      return <NotFoundPage />;
    }

    switch (route.path) {
      case '/':
        return <HomePage />;
      case '/real-estate':
        return <RealEstatePage />;
      case '/ai-content':
        return <AiContentPage />;
      case '/services':
        return <ServicesPage />;
      case '/pricing':
        return <PricingPage />;
      case '/work':
        return <WorkPage />;
      case '/case-studies':
        return <CaseStudiesPage />;
      case '/about':
        return <AboutPage />;
      case '/process':
        return <ProcessPage />;
      case '/contact':
        return <ContactPage />;
      default:
        return <NotFoundPage />;
    }
  };

  const { theme } = useTheme();
  const isLight = theme === 'light';

  // The dashboard has its own layout, without the public site's navigation and widgets
  if (route.kind === 'admin') {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#0B0C10]" aria-busy="true" />}>
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isLight ? 'bg-[#F8FAFC] text-[#0F172A]' : 'bg-[#0A0C13] text-[#E8E6E1]'
      } flex flex-col justify-between selection:bg-[#C9A96E]/20 selection:text-[#FAF8F5] relative transition-colors duration-500`}
    >
      {/* Route-aware studio background image (both themes) */}
      <PageBackground />

      <Navbar />

      <main className="flex-1 relative z-10">
        <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>{renderRoute()}</Suspense>
      </main>

      <Footer />

      {/* Global floating actions */}
      <WhatsAppButton />
      <StudioAssistant />

      {/* Service / package inquiry modal (WhatsApp, email, or direct form submission) */}
      <InquiryModal />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <NavigationProvider>
          <SiteContentProvider>
            <InquiryProvider>
              <AppRouter />
            </InquiryProvider>
          </SiteContentProvider>
        </NavigationProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
