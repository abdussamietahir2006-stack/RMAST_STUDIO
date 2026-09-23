import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { BarChart3, Inbox, Image as ImageIcon, Settings, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { AdminUser } from '../types';
import { adminApi, ApiError } from './api';
import { LoginScreen } from './LoginScreen';
import { Spinner } from './ui';

const OverviewPage = lazy(() => import('./OverviewPage').then((m) => ({ default: m.OverviewPage })));
const LeadsPage = lazy(() => import('./LeadsPage').then((m) => ({ default: m.LeadsPage })));
const MediaPage = lazy(() => import('./MediaPage').then((m) => ({ default: m.MediaPage })));
const SettingsPage = lazy(() => import('./SettingsPage').then((m) => ({ default: m.SettingsPage })));

export interface AdminContextValue {
  user: AdminUser;
  // Call when any request returns 401 so the dashboard drops back to the login screen
  onUnauthorized: (err: unknown) => boolean;
}

export const AdminContext = React.createContext<AdminContextValue | null>(null);

export function useAdmin(): AdminContextValue {
  const ctx = React.useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminApp');
  return ctx;
}

const NAV = [
  { path: '/admin', label: 'Overview', icon: BarChart3 },
  { path: '/admin/leads', label: 'Leads', icon: Inbox },
  { path: '/admin/media', label: 'Website media', icon: ImageIcon },
  { path: '/admin/settings', label: 'Settings', icon: Settings }
];

export const AdminApp: React.FC = () => {
  const { currentPath, navigate } = useNavigation();
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const [menuOpen, setMenuOpen] = useState(false);

  // Keep the site's light-mode overrides out of the dashboard
  useEffect(() => {
    document.documentElement.classList.add('admin-mode');
    return () => document.documentElement.classList.remove('admin-mode');
  }, []);

  useEffect(() => {
    adminApi
      .me()
      .then((res) => setUser(res.user))
      .catch(() => setUser(null));
  }, []);

  const onUnauthorized = useCallback((err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      setUser(null);
      return true;
    }
    return false;
  }, []);

  const signOut = async () => {
    try {
      await adminApi.logout();
    } finally {
      setUser(null);
      navigate('/admin');
    }
  };

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-[#0B0C10]">
        <Spinner />
      </div>
    );
  }

  if (user === null) {
    return <LoginScreen onSignedIn={setUser} />;
  }

  const path = currentPath.replace(/\/+$/, '') || '/admin';
  const section = path.startsWith('/admin/leads')
    ? 'leads'
    : path.startsWith('/admin/media')
    ? 'media'
    : path.startsWith('/admin/settings')
    ? 'settings'
    : 'overview';

  const go = (to: string) => {
    navigate(to);
    setMenuOpen(false);
  };

  const sidebar = (
    <nav className="flex flex-col h-full" aria-label="Dashboard">
      <div className="px-5 py-5 border-b border-[#1C1D25]">
        <div className="text-lg font-bold tracking-[0.2em] text-[#ECEAE5]">RMAST</div>
        <div className="text-[11px] uppercase tracking-widest text-[#8B8D98] mt-0.5">Founder dashboard</div>
      </div>
      <ul className="flex-1 p-3 space-y-1">
        {NAV.map(({ path: to, label, icon: Icon }) => {
          const active =
            (to === '/admin' && section === 'overview') || (to !== '/admin' && path.startsWith(to));
          return (
            <li key={to}>
              <button
                onClick={() => go(to)}
                aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                  active ? 'bg-[#1A1B24] text-[#ECEAE5] font-medium' : 'text-[#A6A8B3] hover:text-[#ECEAE5] hover:bg-[#15161D]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#C9A96E]' : ''}`} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
      <div className="p-3 border-t border-[#1C1D25] space-y-1">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#A6A8B3] hover:text-[#ECEAE5] hover:bg-[#15161D]"
        >
          <ExternalLink className="w-4 h-4" />
          View website
        </a>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-[#A6A8B3] hover:text-[#ECEAE5] hover:bg-[#15161D] cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
        <div className="px-3 pt-2 text-xs text-[#6E7180] truncate" title={user.email}>
          {user.name}
        </div>
      </div>
    </nav>
  );

  return (
    <AdminContext.Provider value={{ user, onUnauthorized }}>
      <div className="min-h-screen bg-[#0B0C10] text-[#ECEAE5] font-sans antialiased">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 bg-[#0E0F14] border-r border-[#1C1D25]">{sidebar}</aside>

        {/* Mobile top bar + drawer */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[#0E0F14] border-b border-[#1C1D25]">
          <span className="font-bold tracking-[0.2em]">RMAST</span>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-[#A6A8B3] cursor-pointer"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="w-64 bg-[#0E0F14] border-r border-[#1C1D25]">{sidebar}</div>
            <button className="flex-1 bg-black/60" aria-label="Close menu" onClick={() => setMenuOpen(false)} />
          </div>
        )}

        <main className="lg:pl-60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <Suspense fallback={<Spinner />}>
              {section === 'overview' && <OverviewPage />}
              {section === 'leads' && <LeadsPage path={path} />}
              {section === 'media' && <MediaPage />}
              {section === 'settings' && <SettingsPage onSignedOut={() => setUser(null)} />}
            </Suspense>
          </div>
        </main>
      </div>
    </AdminContext.Provider>
  );
};
