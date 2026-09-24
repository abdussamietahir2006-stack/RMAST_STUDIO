import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { CONTACT, mailtoLink, whatsappLink } from '../config/contact';
import { submitLead } from '../lib/api';
import { LeadDivision } from '../types';
import { Mail, MessageSquare, Instagram, CheckCircle2, ArrowRight, Linkedin, ExternalLink } from 'lucide-react';

// Maps the contact form's choices to a service folder in the dashboard
const REAL_ESTATE_SERVICE_SLUGS: Record<string, string> = {
  'Website Development': 'web-development',
  'Custom Software': 'custom-software',
  'CRM Development': 'crm-development',
  'AI Automation': 'ai-automation',
  'AI Assistant / Chatbot': 'ai-assistants',
  'Social Media Management': 'social-media',
  'Virtual Assistance': 'virtual-assistance',
  'Admin & Operations Support': 'admin-support'
};

const AI_CONTENT_INDUSTRY_SLUGS: [prefix: string, slug: string][] = [
  ['Real Estate', 'real-estate'],
  ['Fashion', 'fashion'],
  ['Food', 'food'],
  ['Consumer Goods', 'products'],
  ['Luxury', 'products'],
  ['Beauty', 'products']
];

function contactServiceSlug(service: string, industry: string): string | undefined {
  if (service === 'AI Video Production') {
    return AI_CONTENT_INDUSTRY_SLUGS.find(([prefix]) => industry.startsWith(prefix))?.[1];
  }
  return REAL_ESTATE_SERVICE_SLUGS[service];
}

export const ContactPage: React.FC = () => {
  const { currency } = useCurrency();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    industry: 'Real Estate & Property Development',
    service: 'Website Development',
    budgetIndex: 1,
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const servicesList = [
    'Website Development',
    'Custom Software',
    'CRM Development',
    'AI Automation',
    'AI Assistant / Chatbot',
    'Social Media Management',
    'Virtual Assistance',
    'Admin & Operations Support',
    'AI Video Production',
    'Other / Complete System'
  ];

  const industriesList = [
    'Real Estate & Property Development',
    'Fashion & Apparel',
    'Food & Restaurants / Hospitality',
    'Consumer Goods & E-Commerce',
    'Luxury Accessories & Jewelry',
    'Beauty & Cosmetics',
    'Technology & PropTech',
    'Personal Brand & Creator',
    'Other Industry'
  ];

  const budgetRanges = [
    currency === 'USD' ? '< $500 USD' : '< 1,835 AED',
    currency === 'USD' ? '$500 – $1,500 USD' : '1,835 – 5,510 AED',
    currency === 'USD' ? '$1,500 – $3,000 USD' : '5,510 – 11,020 AED',
    currency === 'USD' ? '$3,000 – $6,000 USD' : '11,020 – 22,035 AED',
    currency === 'USD' ? '$6,000+ USD (Enterprise)' : '22,035+ AED (Enterprise)'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    const industry = formData.industry;
    const serviceId = contactServiceSlug(formData.service, industry);
    const divisionKey: LeadDivision =
      formData.service === 'AI Video Production' ? 'ai-content' : serviceId ? 'real-estate' : 'general';
    const division =
      divisionKey === 'real-estate'
        ? 'Real Estate Digital Systems'
        : divisionKey === 'ai-content'
        ? 'AI Content Studio'
        : 'Studio Architecture';

    try {
      await submitLead({
        targetTitle: formData.service,
        division,
        serviceId,
        divisionKey,
        estimatedPrice: budgetRanges[formData.budgetIndex],
        clientName: formData.name,
        clientEmail: formData.email,
        clientPhone: '',
        clientCompany: formData.company,
        clientLocation: '',
        timeline: '',
        notes: `Industry: ${industry}\n\n${formData.message}`,
        dispatchMethod: 'contact-form'
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        `${err instanceof Error ? err.message : 'Submission failed.'} Please email ${CONTACT.email} or message us on WhatsApp instead.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Header */}
        <section className="space-y-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#A68BFF]">
              Direct Inquiries
            </span>
          </div>

          <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-bold text-[#FAF8F5] leading-[1.02] tracking-tight">
            Have something <br />
            <span className="italic font-light text-[#A68BFF]">worth building?</span>
          </h1>

          <p className="text-lg md:text-xl text-[#A1A1AA] leading-relaxed font-light">
            Tell us what you're trying to build, automate, or create. You will be communicating directly with studio founders Raja Muhammad Abdussamie Tahir and Mashhood.
          </p>
        </section>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Column (7 cols) */}
          <div className="lg:col-span-7 bg-[#0E111C]/85 backdrop-blur-md border border-[#232738]/80 p-8 md:p-10 rounded-sm shadow-2xl">
            {submitted ? (
              <div className="space-y-6 py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-[#1A1A22] border border-[#A68BFF] text-[#A68BFF] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl md:text-3xl text-[#FAF8F5] font-semibold">
                  Inquiry Received
                </h3>
                <p className="text-sm text-[#8E8D88] max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-[#FAF8F5]">{formData.name}</span>. Your brief has been delivered to Abdussamie and Mashhood. We will review your requirements and respond within 24 hours.
                </p>
                <div className="pt-4">
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#A68BFF] text-[#0A0A0C] text-xs font-semibold uppercase tracking-wider hover:bg-[#BBA6FF] transition-all"
                  >
                    <span>Connect on WhatsApp for Immediate Priority</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marcus Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#070709] border border-[#27272A] px-4 py-3 text-sm text-[#FAF8F5] placeholder-[#52525B] focus:outline-none focus:border-[#A68BFF] transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. marcus@vanguardrealty.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#070709] border border-[#27272A] px-4 py-3 text-sm text-[#FAF8F5] placeholder-[#52525B] focus:outline-none focus:border-[#A68BFF] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Company */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vanguard Properties LLC"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-[#070709] border border-[#27272A] px-4 py-3 text-sm text-[#FAF8F5] placeholder-[#52525B] focus:outline-none focus:border-[#A68BFF] transition-colors"
                    />
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                      Industry Sector
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full bg-[#070709] border border-[#27272A] px-4 py-3 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#A68BFF] transition-colors"
                    >
                      {industriesList.map((ind, i) => (
                        <option key={i} value={ind} className="bg-[#0D0D10] text-[#FAF8F5]">
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Primary Service Desired */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                      Primary Service Focus
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-[#070709] border border-[#27272A] px-4 py-3 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#A68BFF] transition-colors"
                    >
                      {servicesList.map((srv, i) => (
                        <option key={i} value={srv} className="bg-[#0D0D10] text-[#FAF8F5]">
                          {srv}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                      Target Investment Budget
                    </label>
                    <select
                      value={formData.budgetIndex}
                      onChange={(e) => setFormData({ ...formData, budgetIndex: Number(e.target.value) })}
                      className="w-full bg-[#070709] border border-[#27272A] px-4 py-3 text-sm text-[#FAF8F5] focus:outline-none focus:border-[#A68BFF] transition-colors"
                    >
                      {budgetRanges.map((b, i) => (
                        <option key={i} value={i} className="bg-[#0D0D10] text-[#FAF8F5]">
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1AA] block">
                    Project Brief & Goals *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Briefly describe your business, what friction you are trying to remove, or what cinematic visual campaign you are envisioning..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#070709] border border-[#27272A] px-4 py-3 text-sm text-[#FAF8F5] placeholder-[#52525B] focus:outline-none focus:border-[#A68BFF] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#A68BFF] text-[#0A0A0C] text-xs font-semibold uppercase tracking-[0.18em] hover:bg-[#BBA6FF] transition-all cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Transmitting Brief...' : 'Start a Conversation'}
                </button>

                {submitError && (
                  <p role="alert" className="text-xs text-[#FCA5A5] bg-[#2A1215] border border-[#7F1D1D] px-3 py-2">
                    {submitError}
                  </p>
                )}

                <p className="text-[11px] font-mono text-[#71717A] text-center pt-2">
                  No automated spam. Handled strictly under non-disclosure by RMAST founders.
                </p>
              </form>
            )}
          </div>

          {/* Contact Information & Channels Column (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Direct Studio Channels */}
            <div className="p-8 bg-[#0E111C]/85 backdrop-blur-md border border-[#232738]/80 space-y-6 shadow-2xl">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-[#A68BFF]">
                  Studio Coordinates
                </span>
                <h3 className="font-serif text-2xl text-[#FAF8F5] font-semibold">
                  Direct Contact
                </h3>
              </div>

              <div className="space-y-4 text-sm">
                <a
                  href={mailtoLink()}
                  className="flex items-center gap-3.5 p-3.5 bg-[#090B12]/80 border border-[#202434] hover:border-[#A68BFF]/50 text-[#FAF8F5] transition-all"
                >
                  <Mail className="w-5 h-5 text-[#A68BFF] shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#71717A]">
                      Email Inquiries
                    </div>
                    <div className="font-medium text-xs break-all">
                      {CONTACT.email}
                    </div>
                  </div>
                </a>

                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 bg-[#090B12]/80 border border-[#202434] hover:border-[#25D366]/50 text-[#FAF8F5] transition-all"
                >
                  <MessageSquare className="w-5 h-5 text-[#25D366] shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#71717A]">
                      Founder WhatsApp Direct
                    </div>
                    <div className="font-medium text-xs">
                      {CONTACT.whatsappDisplay}
                    </div>
                  </div>
                </a>

                <a
                  href={CONTACT.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-3.5 bg-[#090B12]/80 border border-[#202434] hover:border-[#A68BFF]/50 text-[#FAF8F5] transition-all"
                >
                  <Instagram className="w-5 h-5 text-[#A68BFF] shrink-0" />
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#71717A]">
                      Instagram Visual Feed
                    </div>
                    <div className="font-medium text-xs">
                      @{CONTACT.instagramHandle}
                    </div>
                  </div>
                </a>

                <a
                  href={CONTACT.founderLinkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 bg-[#090B12]/80 border border-[#202434] hover:border-[#0A66C2]/60 text-[#FAF8F5] transition-all group"
                  aria-label="Connect with Raja Muhammad Abdussamie Tahir on LinkedIn"
                >
                  <div className="flex items-center gap-3.5">
                    <Linkedin className="w-5 h-5 text-[#0A66C2] shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-[10px] font-mono uppercase text-[#71717A] flex items-center gap-1.5">
                        <span>LinkedIn Profile</span>
                        <span className="text-[#0A66C2] text-[9px] font-mono font-semibold bg-[#0A66C2]/15 px-1 rounded-xs">VERIFIED</span>
                      </div>
                      <div className="font-medium text-xs group-hover:text-[#0A66C2] transition-colors">
                        Raja Muhammad Abdussamie Tahir
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#52525B] group-hover:text-[#0A66C2] transition-colors" />
                </a>
              </div>
            </div>

            {/* Founder Direct Guarantee */}
            <div className="p-6 bg-[#0E111C]/80 backdrop-blur-md border border-[#232738]/80 space-y-3 shadow-xl">
              <div className="text-xs font-mono uppercase tracking-widest text-[#A68BFF]">
                Direct Founder Guarantee
              </div>
              <p className="text-xs text-[#8E8D88] leading-relaxed">
                "Small team. Serious execution. When you reach out, you are not talking to a sales rep on quota. You are speaking with the architects building your systems and directing your content."
              </p>
              <div className="pt-2 text-[11px] font-mono text-[#FAF8F5]">
                — Raja Muhammad Abdussamie Tahir & Mashhood
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
