import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck, BarChart3, Inbox, Image as ImageIcon } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { AdminUser } from '../types';
import { adminApi } from './api';
import { Button, ErrorNote } from './ui';

const HIGHLIGHTS = [
  { icon: BarChart3, title: 'Lead overview', text: 'See which services bring in the most inquiries.' },
  { icon: Inbox, title: 'Organised inbox', text: 'Every lead filed by division and service.' },
  { icon: ImageIcon, title: 'Website media', text: 'Swap team photos and videos by drag and drop.' }
];

export const LoginScreen: React.FC<{ onSignedIn: (user: AdminUser) => void }> = ({ onSignedIn }) => {
  const { navigate } = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.login(email.trim(), password);
      setPassword('');
      onSignedIn(res.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const detectCapsLock = (e: React.KeyboardEvent<HTMLInputElement>) => setCapsLock(e.getModifierState('CapsLock'));

  return (
    <div className="min-h-screen bg-[#0B0C10] text-[#ECEAE5] font-sans antialiased grid lg:grid-cols-2">
      {/* Brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 border-r border-[#1C1D25] bg-[#0E0F14]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_30%_40%,#000_40%,transparent_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute -top-40 -left-40 w-[36rem] h-[36rem] rounded-full bg-[radial-gradient(circle,rgba(201,169,110,0.18)_0%,transparent_65%)]"
        />

        <div className="relative">
          <div className="text-2xl font-bold tracking-[0.25em]">RMAST</div>
          <div className="text-xs uppercase tracking-[0.3em] text-[#8B8D98] mt-1">Studio</div>
        </div>

        <div className="relative space-y-10 max-w-md">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C9A96E]">Founder dashboard</p>
            <h2 className="text-4xl font-semibold leading-tight">
              Every lead, every service,
              <br />
              <span className="text-[#C9A96E]">one place.</span>
            </h2>
          </div>
          <ul className="space-y-5">
            {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="w-10 h-10 shrink-0 rounded-md bg-[#16171F] border border-[#2E3040] flex items-center justify-center text-[#C9A96E]">
                  <Icon className="w-4 h-4" />
                </span>
                <span>
                  <span className="block text-sm font-medium text-[#ECEAE5]">{title}</span>
                  <span className="block text-sm text-[#8B8D98]">{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-[#6E7180]">Small team. Serious execution.</p>
      </aside>

      {/* Sign-in form */}
      <main className="flex flex-col min-h-screen">
        <div className="p-5 sm:p-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-3 py-2 -ml-3 rounded-md text-sm text-[#A6A8B3] hover:text-[#ECEAE5] hover:bg-[#16171F] transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to website
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 pb-16">
          <form onSubmit={submit} className="w-full max-w-sm space-y-6" noValidate>
            <div className="space-y-2">
              <div className="lg:hidden text-lg font-bold tracking-[0.25em] mb-6">RMAST</div>
              <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
              <p className="text-sm text-[#8B8D98]">Sign in to manage leads and website media.</p>
            </div>

            <div className="space-y-4">
              <label className="block space-y-1.5" htmlFor="admin-email">
                <span className="text-xs font-medium text-[#A6A8B3]">Email</span>
                <span className="relative block">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7180]" aria-hidden="true" />
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    autoFocus
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@rmast.studio"
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-[#111218] border border-[#2E3040] rounded-md text-[#ECEAE5] placeholder:text-[#4A4D5E] outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/25 transition"
                  />
                </span>
              </label>

              <label className="block space-y-1.5" htmlFor="admin-password">
                <span className="text-xs font-medium text-[#A6A8B3]">Password</span>
                <span className="relative block">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6E7180]" aria-hidden="true" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyUp={detectCapsLock}
                    onKeyDown={detectCapsLock}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-2.5 text-sm bg-[#111218] border border-[#2E3040] rounded-md text-[#ECEAE5] placeholder:text-[#4A4D5E] outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/25 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded text-[#6E7180] hover:text-[#ECEAE5] cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </span>
                {capsLock && <span className="block text-xs text-[#FBBF24]">Caps Lock is on</span>}
              </label>
            </div>

            <ErrorNote message={error} />

            <Button type="submit" variant="primary" loading={loading} disabled={!email || !password} className="w-full py-2.5">
              Sign in
            </Button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-[#6E7180]">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Private area for RMAST founders
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};
