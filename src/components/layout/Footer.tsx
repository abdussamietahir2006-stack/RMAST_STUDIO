import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { CONTACT, mailtoLink, whatsappLink } from '../../config/contact';
import { Mail, MessageSquare, Instagram, Linkedin } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <footer className="bg-[#0A0C14]/90 backdrop-blur-md border-t border-[#1E2230] text-[#A1A1AA] pt-20 pb-12 relative overflow-hidden">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#A68BFF]/40 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-[#1A1A1E]">
          {/* Studio Brand Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-2">
              <span className="font-serif text-3xl font-bold tracking-[0.18em] text-[#FAF8F5] block">
                RMAST
              </span>
              <p className="text-xs uppercase font-mono tracking-widest text-[#A68BFF]">
                Digital Systems · AI Content Studio
              </p>
            </div>

            <p className="text-sm text-[#8E8D88] leading-relaxed max-w-sm">
              Digital systems for real estate. Cinematic AI content for brands.
              Architected by founders Raja Muhammad Abdussamie Tahir & Mashhood.
            </p>

            <div className="pt-2 text-xs font-mono text-[#71717A] tracking-wider uppercase flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>Small team. Serious execution. Remote studio.</span>
            </div>
          </div>

          {/* Division 1: Real Estate (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#FAF8F5]">
              Real Estate Systems
            </div>
            <ul className="space-y-2.5 text-sm text-[#8E8D88]">
              <li>
                <button
                  onClick={() => navigate('/services/web-development')}
                  className="hover:text-[#A68BFF] transition-colors cursor-pointer text-left"
                >
                  Website Development
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/services/custom-software')}
                  className="hover:text-[#A68BFF] transition-colors cursor-pointer text-left"
                >
                  Custom Software
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/services/crm-development')}
                  className="hover:text-[#A68BFF] transition-colors cursor-pointer text-left"
                >
                  CRM Architecture
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/services/ai-automation')}
                  className="hover:text-[#A68BFF] transition-colors cursor-pointer text-left"
                >
                  AI Automation
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/services/ai-assistants')}
                  className="hover:text-[#A68BFF] transition-colors cursor-pointer text-left"
                >
                  Conversational AI
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/services/admin-support')}
                  className="hover:text-[#A68BFF] transition-colors cursor-pointer text-left"
                >
                  Admin Operations & VA
                </button>
              </li>
            </ul>
          </div>

          {/* Division 2: AI Content (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#FAF8F5]">
              AI Content Studio
            </div>
            <ul className="space-y-2.5 text-sm text-[#8E8D88]">
              <li>
                <button
                  onClick={() => navigate('/ai-content/real-estate')}
                  className="hover:text-[#A68BFF] transition-colors cursor-pointer text-left"
                >
                  Property Cinematic Tours
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/ai-content/fashion')}
                  className="hover:text-[#A68BFF] transition-colors cursor-pointer text-left"
                >
                  Fashion & Lookbook Films
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/ai-content/food')}
                  className="hover:text-[#A68BFF] transition-colors cursor-pointer text-left"
                >
                  Food & Restaurant Cinema
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/ai-content/products')}
                  className="hover:text-[#A68BFF] transition-colors cursor-pointer text-left"
                >
                  Product Commercials
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/ai-content')}
                  className="hover:text-[#A68BFF] transition-colors cursor-pointer text-left"
                >
                  Brand Advertising Cuts
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/pricing')}
                  className="hover:text-[#A68BFF] transition-colors cursor-pointer text-left"
                >
                  Monthly Content Bundles
                </button>
              </li>
            </ul>
          </div>

          {/* Quick Studio & Contact (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[#FAF8F5]">
              Direct Contact
            </div>
            <div className="space-y-3 text-xs">
              <a
                href={mailtoLink()}
                className="flex items-center gap-2 text-[#FAF8F5] hover:text-[#A68BFF] transition-colors break-all"
              >
                <Mail className="w-3.5 h-3.5 text-[#A68BFF] shrink-0" />
                <span>{CONTACT.email}</span>
              </a>

              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#FAF8F5] hover:text-[#A68BFF] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#A68BFF] shrink-0" />
                <span>{CONTACT.whatsappDisplay}</span>
              </a>

              <a
                href={CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#FAF8F5] hover:text-[#A68BFF] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5 text-[#A68BFF] shrink-0" />
                <span>@{CONTACT.instagramHandle}</span>
              </a>

              <a
                href={CONTACT.founderLinkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#FAF8F5] hover:text-[#0A66C2] transition-colors"
                aria-label="Raja Muhammad Abdussamie Tahir on LinkedIn"
              >
                <Linkedin className="w-3.5 h-3.5 text-[#0A66C2] shrink-0" />
                <span>LinkedIn · Founder Profile</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#71717A]">
          <span>© {new Date().getFullYear()} RMAST Studio. All rights reserved.</span>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <button
              onClick={() => navigate('/about')}
              className="hover:text-[#FAF8F5] transition-colors"
            >
              Founders
            </button>
            <button
              onClick={() => navigate('/process')}
              className="hover:text-[#FAF8F5] transition-colors"
            >
              Methodology
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="hover:text-[#FAF8F5] transition-colors"
            >
              Investment
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="hover:text-[#FAF8F5] transition-colors text-[#A68BFF]"
            >
              Start Conversation
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
