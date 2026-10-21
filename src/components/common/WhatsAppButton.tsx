import React, { useState } from 'react';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { CONTACT, whatsappLink } from '../../config/contact';

export const WhatsAppButton: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const whatsappUrl = whatsappLink(
    'Hello Abdussamie & Mashhood, I would like to discuss a project with RMAST Studio (Digital Systems / AI Content).'
  );

  return (
    <div className="fixed bottom-20 right-6 z-40 flex flex-col items-end">
      {/* Rich Founder WhatsApp Tooltip Card */}
      {showTooltip && (
        <div className="mb-2 bg-surface border border-line text-fg p-3 rounded-sm shadow-2xl w-64 animate-pop-in">
          <div className="flex items-center justify-between pb-2 border-b border-line text-xs font-mono">
            <span className="text-[#25D366] flex items-center gap-2 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
              FOUNDER DIRECT LINE
            </span>
            <span className="text-subtle">WhatsApp</span>
          </div>
          <p className="text-sm font-medium text-fg mt-2">
            Raja Muhammad Abdussamie & Mashhood
          </p>
          <p className="text-sm font-mono text-brand mt-1">
            {CONTACT.whatsappDisplay}
          </p>
          <div className="mt-2 pt-2 border-t border-line flex items-center justify-between text-xs text-muted">
            <span>Typically replies in minutes</span>
            <ExternalLink className="w-3 h-3 text-[#25D366]" />
          </div>
        </div>
      )}

      {/* Floating Action Pill */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="h-11 px-2.5 sm:px-4 rounded-full bg-surface/95 backdrop-blur-md border border-line hover:border-[#25D366] text-fg hover:text-[#25D366] flex items-center gap-3 shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer"
        aria-label="Direct WhatsApp line with RMAST Studio founders"
      >
        {/* Pulse indicator */}
        <div className="relative flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#25D366]"></span>
          </span>
        </div>

        {/* On phones the button is icon-only so it covers less of the page */}
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold group-hover:text-[#25D366] transition-colors leading-none">
            Founder WhatsApp
          </span>
          <span className="text-[9px] font-mono text-subtle group-hover:text-muted transition-colors leading-none mt-1 hidden sm:block">
            {CONTACT.whatsappDisplay}
          </span>
        </div>
      </a>
    </div>
  );
};
