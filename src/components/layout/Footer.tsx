import React from 'react';
import { CONTACT, mailtoLink, whatsappLink } from '../../config/contact';
import { ASSISTANTS, BOOK_CALL_PATH, FREE_AUDIT_PATH } from '../../data/assistantsData';
import { Link } from '../common/Link';
import { Mail, MessageSquare, Instagram, Linkedin } from 'lucide-react';

const COMPANY_LINKS = [
  { label: 'Free Audit', path: FREE_AUDIT_PATH },
  { label: 'Plans', path: '/plans' },
  { label: 'Work', path: '/work' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' }
];

export const Footer: React.FC = () => (
  <footer className="bg-surface/90 backdrop-blur-md border-t border-line text-muted pt-24 pb-12 relative overflow-hidden">
    {/* Subtle top ambient glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent pointer-events-none" />

    <div className="max-w-site mx-auto px-4 sm:px-6">
      {/* Main Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-line">
        {/* Studio Brand Column */}
        <div className="sm:col-span-2 lg:col-span-3 space-y-6">
          <div className="space-y-2">
            <span className="font-serif text-3xl font-bold tracking-[0.18em] text-fg block">RMAST</span>
            <p className="text-sm uppercase font-mono tracking-widest text-brand">Assistants for real estate</p>
          </div>
          <p className="text-sm text-muted leading-relaxed max-w-sm">
            Virtual, Creative and Technical Assistants for real estate agents, teams and brokerages in the USA, Canada and Dubai. Run by
            founders Raja Muhammad Abdussamie Tahir & Mashhood.
          </p>
          <div className="space-y-3 text-sm">
            <a href={mailtoLink()} className="flex items-center gap-2 text-fg hover:text-brand transition-colors break-all">
              <Mail aria-hidden="true" className="w-4 h-4 text-brand shrink-0" />
              <span>{CONTACT.email}</span>
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-fg hover:text-brand transition-colors"
            >
              <MessageSquare aria-hidden="true" className="w-4 h-4 text-brand shrink-0" />
              <span>{CONTACT.whatsappDisplay} (WhatsApp)</span>
            </a>
            <a
              href={CONTACT.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-fg hover:text-brand transition-colors"
            >
              <Instagram aria-hidden="true" className="w-4 h-4 text-brand shrink-0" />
              <span>@{CONTACT.instagramHandle}</span>
            </a>
            <a
              href={CONTACT.founderLinkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-fg hover:text-[#0A66C2] transition-colors"
              aria-label="Raja Muhammad Abdussamie Tahir on LinkedIn"
            >
              <Linkedin aria-hidden="true" className="w-4 h-4 text-[#0A66C2] shrink-0" />
              <span>LinkedIn · Founder Profile</span>
            </a>
          </div>
        </div>

        {/* One column per Assistant, with its sub-services */}
        {ASSISTANTS.map((a) => (
          <nav key={a.id} aria-label={a.name} className={`svc-${a.id} lg:col-span-2 space-y-4`}>
            <Link to={a.path} className="flex items-center gap-2 text-sm font-semibold text-fg hover:text-svc transition-colors">
              <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-svc shrink-0" />
              {a.name}
            </Link>
            <ul className="space-y-3 text-sm text-muted">
              {a.subServices.map((s) => (
                <li key={s.id}>
                  <Link to={`${a.path}#${s.id}`} className="hover:text-svc transition-colors">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Company */}
        <nav aria-label="Company" className="lg:col-span-3 space-y-4">
          <div className="text-sm font-semibold text-fg">Company</div>
          <ul className="space-y-3 text-sm text-muted">
            {COMPANY_LINKS.map((l) => (
              <li key={l.path}>
                <Link to={l.path} className="hover:text-brand transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link to={BOOK_CALL_PATH} className="btn btn-primary mt-2">
            Book a call
          </Link>
        </nav>
      </div>

      {/* Bottom Bar */}
      <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-subtle">
        <span>© {new Date().getFullYear()} RMAST Studio. All rights reserved.</span>
        <span>Small team. Serious execution.</span>
      </div>
    </div>
  </footer>
);
