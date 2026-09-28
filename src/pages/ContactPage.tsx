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
    <div className="pt-30 pb-24 px-4 sm:px-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Header */}
        <section className="space-y-6 max-w-3xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">
              Direct Inquiries
            </span>
          </div>

          <h1 className="type-h1 text-fg">
            Have something <br />
            <span className="italic font-light text-brand">worth building?</span>
          </h1>

          <p className="text-lg md:text-xl text-muted leading-relaxed font-light">
            Tell us what you're trying to build, automate, or create. You will be communicating directly with studio founders Raja Muhammad Abdussamie Tahir and Mashhood.
          </p>
        </section>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Form Column (7 cols) */}
          <div className="lg:col-span-7 bg-surface-2/85 backdrop-blur-md border border-line/80 p-8 md:p-12 rounded-sm shadow-2xl">
            {submitted ? (
              <div className="space-y-6 py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-surface-2 border border-primary text-brand flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="type-h3 text-fg">
                  Inquiry Received
                </h3>
                <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-fg">{formData.name}</span>. Your brief has been delivered to Abdussamie and Mashhood. We will review your requirements and respond within 24 hours.
                </p>
                <div className="pt-4">
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary inline-flex items-center gap-2"
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
                    <label className="text-xs font-mono uppercase tracking-wider text-muted block">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Marcus Vance"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-canvas border border-line px-4 py-3 text-sm text-fg placeholder-subtle focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted block">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. marcus@vanguardrealty.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-canvas border border-line px-4 py-3 text-sm text-fg placeholder-subtle focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Company */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted block">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Vanguard Properties LLC"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full bg-canvas border border-line px-4 py-3 text-sm text-fg placeholder-subtle focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted block">
                      Industry Sector
                    </label>
                    <select
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full bg-canvas border border-line px-4 py-3 text-sm text-fg focus:outline-none focus:border-primary transition-colors"
                    >
                      {industriesList.map((ind, i) => (
                        <option key={i} value={ind} className="bg-surface text-fg">
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Primary Service Desired */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted block">
                      Primary Service Focus
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-canvas border border-line px-4 py-3 text-sm text-fg focus:outline-none focus:border-primary transition-colors"
                    >
                      {servicesList.map((srv, i) => (
                        <option key={i} value={srv} className="bg-surface text-fg">
                          {srv}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted block">
                      Target Investment Budget
                    </label>
                    <select
                      value={formData.budgetIndex}
                      onChange={(e) => setFormData({ ...formData, budgetIndex: Number(e.target.value) })}
                      className="w-full bg-canvas border border-line px-4 py-3 text-sm text-fg focus:outline-none focus:border-primary transition-colors"
                    >
                      {budgetRanges.map((b, i) => (
                        <option key={i} value={i} className="bg-surface text-fg">
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-muted block">
                    Project Brief & Goals *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Briefly describe your business, what friction you are trying to remove, or what cinematic visual campaign you are envisioning..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-canvas border border-line px-4 py-3 text-sm text-fg placeholder-subtle focus:outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Transmitting Brief...' : 'Start a Conversation'}
                </button>

                {submitError && (
                  <p role="alert" className="text-sm text-[#FCA5A5] bg-[#2A1215] border border-[#7F1D1D] px-3 py-2">
                    {submitError}
                  </p>
                )}

                <p className="text-sm font-mono text-subtle text-center pt-2">
                  No automated spam. Handled strictly under non-disclosure by RMAST founders.
                </p>
              </form>
            )}
          </div>

          {/* Contact Information & Channels Column (5 cols) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Direct Studio Channels */}
            <div className="p-8 bg-surface-2/85 backdrop-blur-md border border-line/80 space-y-6 shadow-2xl rounded-card">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-widest text-brand">
                  Studio Coordinates
                </span>
                <h3 className="type-h3 text-fg">
                  Direct Contact
                </h3>
              </div>

              <div className="space-y-4 text-sm">
                <a
                  href={mailtoLink()}
                  className="flex items-center gap-4 p-4 bg-surface/80 border border-line hover:border-primary/50 text-fg transition-all"
                >
                  <Mail className="w-5 h-5 text-brand shrink-0" />
                  <div>
                    <div className="text-xs font-mono uppercase text-subtle">
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
                  className="flex items-center gap-4 p-4 bg-surface/80 border border-line hover:border-[#25D366]/50 text-fg transition-all"
                >
                  <MessageSquare className="w-5 h-5 text-[#25D366] shrink-0" />
                  <div>
                    <div className="text-xs font-mono uppercase text-subtle">
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
                  className="flex items-center gap-4 p-4 bg-surface/80 border border-line hover:border-primary/50 text-fg transition-all"
                >
                  <Instagram className="w-5 h-5 text-brand shrink-0" />
                  <div>
                    <div className="text-xs font-mono uppercase text-subtle">
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
                  className="flex items-center justify-between p-4 bg-surface/80 border border-line hover:border-[#0A66C2]/60 text-fg transition-all group"
                  aria-label="Connect with Raja Muhammad Abdussamie Tahir on LinkedIn"
                >
                  <div className="flex items-center gap-4">
                    <Linkedin className="w-5 h-5 text-[#0A66C2] shrink-0 group-hover:scale-110 transition-transform" />
                    <div>
                      <div className="text-xs font-mono uppercase text-subtle flex items-center gap-2">
                        <span>LinkedIn Profile</span>
                        <span className="text-[#0A66C2] text-[9px] font-mono font-semibold bg-[#0A66C2]/15 px-1 rounded-xs">VERIFIED</span>
                      </div>
                      <div className="font-medium text-xs group-hover:text-[#0A66C2] transition-colors">
                        Raja Muhammad Abdussamie Tahir
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-subtle group-hover:text-[#0A66C2] transition-colors" />
                </a>
              </div>
            </div>

            {/* Founder Direct Guarantee */}
            <div className="p-6 bg-surface-2/80 backdrop-blur-md border border-line/80 space-y-3 shadow-xl rounded-card">
              <div className="text-xs font-mono uppercase tracking-widest text-brand">
                Direct Founder Guarantee
              </div>
              <p className="text-sm text-muted leading-relaxed">
                "Small team. Serious execution. When you reach out, you are not talking to a sales rep on quota. You are speaking with the architects building your systems and directing your content."
              </p>
              <div className="pt-2 text-xs font-mono text-fg">
                — Raja Muhammad Abdussamie Tahir & Mashhood
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
