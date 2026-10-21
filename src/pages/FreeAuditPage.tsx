import React, { useState } from 'react';
import { CheckCircle2, Check, ArrowRight } from 'lucide-react';
import { submitLead } from '../lib/api';
import { CONTACT, whatsappLink } from '../config/contact';
import { AssistantServicePicker, EMPTY_CHOICE, routingFor } from '../components/forms/AssistantServicePicker';

const AUDIT_CHECKS = [
  'How fast your leads get a first reply',
  'Your website and how it turns visitors into enquiries',
  'Your social accounts and what your content is doing',
  'Your CRM, follow-ups and where admin piles up'
];

const fieldClass =
  'w-full bg-canvas border border-line px-4 py-3 text-base text-fg placeholder-subtle focus:outline-none focus:border-primary transition-colors';
const labelClass = 'text-sm font-medium text-fg block';

// Free audit request: sent through the same lead API as the contact form, filed in the dashboard under
// the Assistant (and service) the visitor picked
export const FreeAuditPage: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', website: '', message: '' });
  const [choice, setChoice] = useState(EMPTY_CHOICE);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const routing = routingFor(choice);
    try {
      await submitLead({
        targetTitle: `Free Audit: ${routing.title}`,
        division: `Free Audit Request (${routing.divisionLabel})`,
        divisionKey: routing.divisionKey,
        serviceId: routing.serviceId,
        estimatedPrice: 'Free audit',
        clientName: form.name,
        clientEmail: form.email,
        clientPhone: form.phone,
        clientCompany: form.company,
        clientLocation: '',
        timeline: '',
        notes: `Website / Instagram: ${form.website || 'not given'}\nInterested in: ${routing.title}\n\n${form.message}`,
        dispatchMethod: 'form'
      });
      setSubmitted(true);
    } catch (err) {
      setError(`${err instanceof Error ? err.message : 'Sending failed.'} Please email ${CONTACT.email} or message us on WhatsApp instead.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-30 pb-24 px-4 sm:px-6">
      <div className="max-w-site mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <section className="lg:col-span-5 space-y-8">
          <div className="space-y-6">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">Free audit</span>
            <h1 className="type-h1 text-fg">See what’s costing you leads, free.</h1>
            <p className="text-base sm:text-lg text-muted leading-relaxed">
              Tell us a little about your business. We look at how you handle leads, content and admin today, then send you what we
              found and what we would fix first. No cost and no obligation.
            </p>
          </div>
          <div className="p-6 bg-surface border border-line rounded-card space-y-4">
            <h2 className="type-h4 text-fg">What we check</h2>
            <ul className="space-y-3 text-base text-muted">
              {AUDIT_CHECKS.map((c) => (
                <li key={c} className="flex items-start gap-3">
                  <Check aria-hidden="true" className="w-5 h-5 mt-0.5 text-brand shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="lg:col-span-7 p-6 sm:p-8 md:p-10 bg-surface border border-line rounded-card" aria-labelledby="audit-form-heading">
          {submitted ? (
            <div className="space-y-6 py-10 text-center" role="status">
              <div className="w-16 h-16 rounded-full border border-primary text-brand flex items-center justify-center mx-auto">
                <CheckCircle2 aria-hidden="true" className="w-8 h-8" />
              </div>
              <h2 className="type-h3 text-fg">Thanks, {form.name}. Your audit request is in.</h2>
              <p className="text-base text-muted max-w-md mx-auto leading-relaxed">
                We’ll review your business and reply within 24 hours. Want to talk sooner? Message us on WhatsApp.
              </p>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Message us on WhatsApp
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 id="audit-form-heading" className="type-h3 text-fg">
                Request your free audit
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="audit-name" className={labelClass}>Your name *</label>
                  <input id="audit-name" required autoComplete="name" value={form.name} onChange={set('name')} className={fieldClass} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="audit-email" className={labelClass}>Email *</label>
                  <input id="audit-email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} className={fieldClass} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="audit-phone" className={labelClass}>Phone or WhatsApp</label>
                  <input id="audit-phone" type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} className={fieldClass} />
                </div>
                <div className="space-y-2">
                  <label htmlFor="audit-company" className={labelClass}>Brokerage or team</label>
                  <input id="audit-company" autoComplete="organization" value={form.company} onChange={set('company')} className={fieldClass} />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="audit-website" className={labelClass}>Website or Instagram</label>
                <input id="audit-website" placeholder="yourwebsite.com or @yourhandle" value={form.website} onChange={set('website')} className={fieldClass} />
              </div>
              <AssistantServicePicker idPrefix="audit" value={choice} onChange={setChoice} fieldClass={fieldClass} labelClass={labelClass} />
              <div className="space-y-2">
                <label htmlFor="audit-message" className={labelClass}>Anything we should know?</label>
                <textarea
                  id="audit-message"
                  rows={4}
                  placeholder="For example: how many leads you get a month, which CRM you use, what’s frustrating you."
                  value={form.message}
                  onChange={set('message')}
                  className={`${fieldClass} resize-none`}
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? 'Sending…' : 'Get my free audit'}
              </button>
              {error && (
                <p role="alert" className="text-sm text-[#FCA5A5] bg-[#2A1215] border border-[#7F1D1D] px-3 py-2 rounded-sm">
                  {error}
                </p>
              )}
              <p className="text-sm text-subtle text-center">We reply within 24 hours. No spam, ever.</p>
            </form>
          )}
        </section>
      </div>
    </div>
  );
};
