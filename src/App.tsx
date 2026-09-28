import React, { Suspense, lazy, useEffect, useState } from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { InquiryProvider, useInquiry } from './context/InquiryContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { SiteContentProvider } from './context/SiteContentContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PageBackground } from './components/layout/PageBackground';
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { StudioAssistant } from './components/common/StudioAssistant';
import { getRouteMeta } from './seo/meta';
import { applyHeadTags } from './seo/head';
import { MotionProvider } from './components/motion/MotionProvider';
import { PageTransition } from './components/motion/PageTransition';
import { useSiteMotion } from './components/motion/useSiteMotion';

// Pages are code-split so each route only downloads what it renders. Each page can also be
// preloaded: once loaded it renders synchronously, which lets the prerenderer emit complete HTML
// and lets the browser attach to that HTML without a loading gap.
type PageComponent = React.ComponentType<any> & { preload: () => Promise<void> };

const named = <K extends string>(loader: () => Promise<Record<K, React.ComponentType<any>>>, name: K): PageComponent => {
  let Loaded: React.ComponentType<any> | null = null;
  const Lazy: React.ComponentType<any> = lazy(() => loader().then((m) => ({ default: m[name] })));
  const Page = ((props: Record<string, unknown>) => (Loaded ? <Loaded {...props} /> : <Lazy {...props} />)) as PageComponent;
  Page.preload = () =>
    loader().then((m) => {
      Loaded = m[name];
    });
  return Page;
};

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

// The inquiry popup is only needed once someone asks for it: it is fetched while the browser is
// idle after the page loads (so opening it is still instant) and rendered from its first opening.
const loadInquiryModal = () => import('./components/inquiry/InquiryModal');
const InquiryModal = lazy(() => loadInquiryModal().then((m) => ({ default: m.InquiryModal })));

const InquiryHost: React.FC = () => {
  const { isInquiryOpen } = useInquiry();
  const [wanted, setWanted] = useState(false);
  if (isInquiryOpen && !wanted) setWanted(true);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2500));
    idle(() => void loadInquiryModal());
  }, []);

  return wanted ? (
    <Suspense fallback={null}>
      <InquiryModal />
    </Suspense>
  ) : null;
};

// Pages that exist outside the service detail routes
const STATIC_PATHS = new Set([
  '/', '/real-estate', '/ai-content', '/services', '/pricing', '/work', '/case-studies', '/about', '/process', '/contact'
]);

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

  if (STATIC_PATHS.has(path)) return { kind: 'static', path };
  return { kind: 'not-found' };
}

const STATIC_PAGES: Record<string, PageComponent> = {
  '/': HomePage,
  '/real-estate': RealEstatePage,
  '/ai-content': AiContentPage,
  '/services': ServicesPage,
  '/pricing': PricingPage,
  '/work': WorkPage,
  '/case-studies': CaseStudiesPage,
  '/about': AboutPage,
  '/process': ProcessPage,
  '/contact': ContactPage
};

function pageFor(route: Route): PageComponent {
  if (route.kind === 'admin') return AdminApp;
  if (route.kind === 'service') return ServiceDetailPage;
  if (route.kind === 'static') return STATIC_PAGES[route.path];
  return NotFoundPage;
}

// Loads the code for the page at `path` (used before attaching to prerendered HTML)
export const preloadRoute = (path: string) => pageFor(resolveRoute(path)).preload();

// Loads every public page (used by the build-time prerenderer)
export const preloadAllPages = () =>
  Promise.all([...Object.values(STATIC_PAGES), ServiceDetailPage, NotFoundPage].map((p) => p.preload()));

const AppRouter: React.FC = () => {
  const { currentPath } = useNavigation();
  // Scroll reveals and card spotlight on the public site (not the dashboard)
  useSiteMotion(currentPath.startsWith('/admin') ? '' : currentPath);
  const route = resolveRoute(currentPath);

  // Titles, descriptions, canonical and social tags come from the same data the prerenderer uses
  useEffect(() => {
    applyHeadTags(getRouteMeta(currentPath, __SITE_URL__), __SITE_URL__);
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
      <Suspense fallback={<div className="min-h-screen bg-surface" aria-busy="true" />}>
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isLight ? 'bg-[#F8FAFC] text-fg' : 'bg-canvas text-fg'
      } flex flex-col justify-between selection:bg-primary/20 selection:text-fg relative transition-colors duration-500`}
    >
      {/* Route-aware studio background image (both themes) */}
      <PageBackground />

      <Navbar />

      <main className="flex-1 relative z-10">
        <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
          <PageTransition routeKey={currentPath}>{renderRoute()}</PageTransition>
        </Suspense>
      </main>

      <Footer />

      {/* Global floating actions */}
      <WhatsAppButton />
      <StudioAssistant />

      {/* Service / package inquiry modal (WhatsApp, email, or direct form submission) */}
      <InquiryHost />
    </div>
  );
};

// initialPath lets the build-time prerenderer render any page without a browser
export default function App({ initialPath }: { initialPath?: string } = {}) {
  return (
    <MotionProvider>
    <ThemeProvider>
      <CurrencyProvider>
        <NavigationProvider initialPath={initialPath}>
          <SiteContentProvider>
            <InquiryProvider>
              <AppRouter />
            </InquiryProvider>
          </SiteContentProvider>
        </NavigationProvider>
      </CurrencyProvider>
    </ThemeProvider>
    </MotionProvider>
  );
}
