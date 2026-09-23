import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';
import { CurrencyToggle } from '../common/CurrencyToggle';
import { ThemeToggle } from '../common/ThemeToggle';
import { CONTACT } from '../../config/contact';
import { servicesData } from '../../data/servicesData';
import { AnimatePresence, m } from 'motion/react';
import { Menu, X, ArrowUpRight, ChevronDown, Compass, LayoutGrid, Tag } from 'lucide-react';

type DivisionId = 'real-estate' | 'ai-content';

interface MenuItem {
  label: string;
  description: string;
  path: string;
  icon: React.ElementType;
}

interface NavItem {
  label: string;
  path: string;
  division?: DivisionId;
  menu?: MenuItem[];
}

const divisionMenu = (division: DivisionId, overviewText: string, servicesText: string, pricingText: string): MenuItem[] => [
  { label: 'Overview', description: overviewText, path: `/${division}`, icon: Compass },
  { label: 'Services', description: servicesText, path: `/services?division=${division}`, icon: LayoutGrid },
  { label: 'Pricing', description: pricingText, path: `/pricing?division=${division}`, icon: Tag }
];

const NAV_ITEMS: NavItem[] = [
  { label: 'Work', path: '/work' },
  {
    label: 'Real Estate',
    path: '/real-estate',
    division: 'real-estate',
    menu: divisionMenu(
      'real-estate',
      'Digital systems for brokerages',
      'Websites, CRM, automation & more',
      'Packages and starting rates'
    )
  },
  {
    label: 'AI Content',
    path: '/ai-content',
    division: 'ai-content',
    menu: divisionMenu(
      'ai-content',
      'Cinematic AI video for brands',
      'Property, fashion, food & product films',
      'Per-video rates and monthly bundles'
    )
  },
  { label: 'About', path: '/about' },
  { label: 'Process', path: '/process' }
];

const realEstateServiceSlugs = new Set(servicesData.filter((s) => s.division === 'real-estate').map((s) => s.slug));

export const Navbar: React.FC = () => {
  const { currentPath, search, navigate } = useNavigation();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close an open dropdown on Escape or on a click elsewhere
  useEffect(() => {
    if (!openMenu) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenMenu(null);
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('mousedown', onClick);
    };
  }, [openMenu]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const divisionParam = new URLSearchParams(search).get('division');

  // A division tab stays highlighted across its overview, service pages, and filtered services/pricing
  const isActive = (item: NavItem) => {
    if (!item.division) return currentPath === item.path || currentPath.startsWith(`${item.path}/`);
    if (currentPath === item.path || currentPath.startsWith(`${item.path}/`)) return true;
    if ((currentPath === '/services' || currentPath === '/pricing') && divisionParam === item.division) return true;
    if (item.division === 'real-estate' && currentPath.startsWith('/services/')) {
      return realEstateServiceSlugs.has(currentPath.replace('/services/', ''));
    }
    return false;
  };

  const isActiveMenuItem = (path: string) => {
    const url = new URL(path, 'http://x');
    return url.pathname === currentPath && url.search === search;
  };

  const go = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    setOpenMenu(null);
  };

  const openNow = (label: string) => {
    window.clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };
  // Small delay so the pointer can travel from the tab into the panel
  const closeSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 150);
  };

  const panelClasses = isLight
    ? 'bg-white border-slate-200 shadow-xl shadow-slate-900/10'
    : 'bg-[#0D1019] border-[#262B3D] shadow-2xl shadow-black/50';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? isLight
              ? 'bg-white/85 backdrop-blur-md border-b border-slate-200/90 py-4 shadow-sm'
              : 'bg-[#0A0C14]/85 backdrop-blur-md border-b border-[#1E2230] py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between gap-6">
          {/* Brand Wordmark */}
          <button
            onClick={() => go('/')}
            className="flex items-baseline gap-2 text-left group cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A96E] rounded-sm shrink-0"
            aria-label="RMAST Studio home"
          >
            <span
              className={`font-serif text-[26px] leading-none font-bold tracking-[0.16em] transition-colors duration-300 ${
                isLight ? 'text-slate-900' : 'text-[#FAF8F5]'
              } group-hover:text-[#C9A96E]`}
            >
              RMAST
            </span>
            <span className="font-editorial italic text-[22px] leading-none font-medium text-[#C9A96E] transition-transform duration-300 group-hover:translate-x-0.5">
              Studio
            </span>
          </button>

          {/* Desktop Nav */}
          <nav
            ref={navRef}
            aria-label="Main"
            className={`hidden lg:flex items-center gap-9 text-[13px] uppercase font-medium tracking-[0.14em] ${
              isLight ? 'text-slate-600' : 'text-[#A1A1AA]'
            }`}
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item);
              const itemClasses = `transition-colors duration-200 cursor-pointer relative py-1 focus:outline-none focus-visible:text-[#C9A96E] ${
                isLight ? 'hover:text-slate-950' : 'hover:text-[#FAF8F5]'
              } ${active ? 'text-[#C9A96E] font-semibold' : ''}`;
              const underline = active && <span className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-[#C9A96E]" />;

              if (!item.menu) {
                return (
                  <button key={item.path} onClick={() => go(item.path)} className={itemClasses} aria-current={active ? 'page' : undefined}>
                    {item.label}
                    {underline}
                  </button>
                );
              }

              const open = openMenu === item.label;
              const menuId = `nav-menu-${item.division}`;
              return (
                <div
                  key={item.path}
                  className="relative"
                  onMouseEnter={() => openNow(item.label)}
                  onMouseLeave={closeSoon}
                >
                  <div className="flex items-center gap-1">
                    <button onClick={() => go(item.path)} className={itemClasses} aria-current={active ? 'page' : undefined}>
                      {item.label}
                      {underline}
                    </button>
                    <button
                      type="button"
                      onClick={() => (open ? setOpenMenu(null) : openNow(item.label))}
                      aria-expanded={open}
                      aria-controls={menuId}
                      aria-label={`${item.label} menu`}
                      className={`p-0.5 rounded cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A96E] ${
                        active ? 'text-[#C9A96E]' : ''
                      }`}
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Dropdown panel (pt-3 bridges the gap so hover isn't lost) */}
                  <div
                    id={menuId}
                    className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 w-72 transition-all duration-200 ${
                      open ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-1 invisible pointer-events-none'
                    }`}
                  >
                    <ul className={`rounded-md border p-2 normal-case tracking-normal ${panelClasses}`} role="list">
                      {item.menu.map(({ label, description, path, icon: Icon }) => {
                        const current = isActiveMenuItem(path);
                        return (
                          <li key={path}>
                            <button
                              onClick={() => go(path)}
                              tabIndex={open ? 0 : -1}
                              aria-current={current ? 'page' : undefined}
                              className={`w-full flex items-start gap-3 p-3 rounded text-left transition-colors cursor-pointer group ${
                                isLight ? 'hover:bg-slate-50' : 'hover:bg-[#161A28]'
                              } ${current ? (isLight ? 'bg-slate-50' : 'bg-[#161A28]') : ''}`}
                            >
                              <span
                                className={`mt-0.5 w-8 h-8 shrink-0 rounded flex items-center justify-center border ${
                                  isLight ? 'border-slate-200 text-[#9A6818]' : 'border-[#2A3044] text-[#C9A96E]'
                                }`}
                              >
                                <Icon className="w-4 h-4" />
                              </span>
                              <span className="min-w-0">
                                <span
                                  className={`block text-sm font-semibold ${
                                    current ? 'text-[#C9A96E]' : isLight ? 'text-slate-900' : 'text-[#FAF8F5]'
                                  }`}
                                >
                                  {label}
                                </span>
                                <span className={`block text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-[#8E92A0]'}`}>
                                  {description}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="hidden sm:flex items-center gap-3 md:gap-4">
              <ThemeToggle />
              <CurrencyToggle />
              <button
                onClick={() => go('/contact')}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] bg-[#C9A96E] text-[#0A0A0C] hover:bg-[#D9B97E] transition-all duration-200 cursor-pointer shadow-sm whitespace-nowrap"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex sm:hidden items-center gap-2">
              <ThemeToggle showLabel={false} />
              <CurrencyToggle />
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`lg:hidden p-2 focus:outline-none cursor-pointer ${
                isLight ? 'text-slate-800 hover:text-[#C9A96E]' : 'text-[#E4E4E7] hover:text-[#C9A96E]'
              }`}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / tablet drawer */}
      <AnimatePresence>
      {mobileMenuOpen && (
        <m.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed inset-0 z-40 backdrop-blur-xl flex flex-col pt-24 px-8 pb-10 justify-between lg:hidden overflow-y-auto ${
            isLight ? 'bg-white/95 text-slate-900' : 'bg-[#0A0C14]/95 text-[#E4E4E7]'
          }`}
        >
          <div className="space-y-6">
            <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-[#1E1E24]'}`}>
              <div className="text-[11px] font-mono tracking-widest text-[#71717A] uppercase">Navigation</div>
              <ThemeToggle />
            </div>
            <div className="flex flex-col space-y-4">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item);
                const linkClasses = (isCurrent: boolean) =>
                  isCurrent ? 'text-[#C9A96E]' : isLight ? 'text-slate-800 hover:text-[#C9A96E]' : 'text-[#E4E4E7] hover:text-[#C9A96E]';
                return (
                  <div key={item.path}>
                    <button
                      onClick={() => go(item.path)}
                      className={`text-left text-2xl font-serif tracking-wide py-1 transition-colors ${linkClasses(active)}`}
                    >
                      {item.label}
                    </button>
                    {item.menu && (
                      <div className={`mt-1 ml-1 pl-4 border-l flex flex-col ${isLight ? 'border-slate-200' : 'border-[#262B3D]'}`}>
                        {item.menu
                          .filter((m) => m.label !== 'Overview')
                          .map((m) => (
                            <button
                              key={m.path}
                              onClick={() => go(m.path)}
                              className={`text-left text-sm font-mono uppercase tracking-wider py-1.5 transition-colors ${linkClasses(
                                isActiveMenuItem(m.path)
                              )}`}
                            >
                              {m.label}
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={`pt-4 border-t space-y-3 ${isLight ? 'border-slate-200' : 'border-[#1E1E24]'}`}>
              <div className="text-xs text-[#71717A] font-mono uppercase tracking-wider">Direct Inquiries</div>
              <p className={`text-sm ${isLight ? 'text-slate-600' : 'text-[#A1A1AA]'}`}>{CONTACT.email}</p>
              <p className="text-sm text-[#C9A96E]">{CONTACT.whatsappDisplay} (WhatsApp)</p>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={() => go('/contact')}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] bg-[#C9A96E] text-[#0A0A0C]"
            >
              <span>Start a Project</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </m.div>
      )}
      </AnimatePresence>
    </>
  );
};
