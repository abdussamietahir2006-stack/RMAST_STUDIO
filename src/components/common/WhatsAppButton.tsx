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
        <div className="mb-2 bg-[#0E0E12] border border-[#2A2A34] text-[#FAF8F5] p-3 rounded-sm shadow-2xl w-64 animate-pop-in">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#1E1E26] text-[10px] font-mono">
            <span className="text-[#25D366] flex items-center gap-1.5 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
              FOUNDER DIRECT LINE
            </span>
            <span className="text-[#71717A]">WhatsApp</span>
          </div>
          <p className="text-xs font-medium text-[#FAF8F5] mt-1.5">
            Raja Muhammad Abdussamie & Mashhood
          </p>
          <p className="text-[11px] font-mono text-[#A68BFF] mt-0.5">
            {CONTACT.whatsappDisplay}
          </p>
          <div className="mt-2 pt-2 border-t border-[#1C1C24] flex items-center justify-between text-[10px] text-[#A1A1AA]">
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
        className="h-11 px-3.5 sm:px-4 rounded-full bg-[#0E0E12]/95 backdrop-blur-md border border-[#272730] hover:border-[#25D366] text-[#FAF8F5] hover:text-[#25D366] flex items-center gap-2.5 shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer"
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

        <div className="flex flex-col text-left">
          <span className="text-[11px] font-mono uppercase tracking-wider font-semibold group-hover:text-[#25D366] transition-colors leading-none">
            Founder WhatsApp
          </span>
          <span className="text-[9px] font-mono text-[#71717A] group-hover:text-[#A1A1AA] transition-colors leading-none mt-1 hidden sm:block">
            {CONTACT.whatsappDisplay}
          </span>
        </div>
      </a>
    </div>
  );
};
