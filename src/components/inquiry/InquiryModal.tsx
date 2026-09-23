import React, { useState, useEffect } from 'react';
import { useInquiry } from '../../context/InquiryContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CONTACT, mailtoLink, whatsappLink } from '../../config/contact';
import { submitLead } from '../../lib/api';
import { DispatchMethod } from '../../types';
import {
  X,
  Send,
  Mail,
  Database,
  Building2,
  Film,
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

type ModalDispatch = Exclude<DispatchMethod, 'contact-form'>;

export const InquiryModal: React.FC = () => {
  const { isInquiryOpen, activeTarget, closeInquiry } = useInquiry();
  const { format } = useCurrency();

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientLocation, setClientLocation] = useState('United States (USA)');
  const [timeline, setTimeline] = useState('Within 2-4 Weeks');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submittedMethod, setSubmittedMethod] = useState<ModalDispatch | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [showDispatchPopup, setShowDispatchPopup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [emailDelivered, setEmailDelivered] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Reset state whenever modal opens with a new target
  useEffect(() => {
    if (isInquiryOpen) {
      setSubmittedMethod(null);
      setShowDispatchPopup(false);
      setErrors({});
      setSubmitError(null);
      setLastSavedId(null);
      // Prevent background scrolling while modal is active
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isInquiryOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isInquiryOpen) {
        closeInquiry();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInquiryOpen, closeInquiry]);

  if (!isInquiryOpen || !activeTarget) return null;

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!clientName.trim()) newErrors.clientName = 'Full Name is required';
    if (!clientEmail.trim() || !clientEmail.includes('@')) {
      newErrors.clientEmail = 'Valid Email Address is required';
    }
    if (!clientPhone.trim() || clientPhone.length < 7) {
      newErrors.clientPhone = 'Phone or WhatsApp number is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getEstimatedPriceString = (): string => {
    if (!activeTarget.priceUSD) return 'Custom Architectural Scoping';
    return `${format(activeTarget.priceUSD)} ${activeTarget.billingFrequency || ''}`.trim();
  };

  const persistInquiry = (method: ModalDispatch) =>
    submitLead({
      targetTitle: activeTarget.title,
      division:
        activeTarget.division === 'real-estate'
          ? 'Real Estate Digital Systems'
          : activeTarget.division === 'ai-content'
          ? 'AI Content Studio'
          : 'Studio Architecture',
      estimatedPrice: getEstimatedPriceString(),
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      clientPhone: clientPhone.trim(),
      clientCompany: clientCompany.trim() || 'Direct Client / Private Brokerage',
      clientLocation,
      timeline,
      notes: notes.trim() || 'No additional scoping notes provided.',
      dispatchMethod: method,
      // Lets the dashboard file this lead under the right service folder
      serviceId: activeTarget.serviceId,
      packageId: activeTarget.packageId,
      divisionKey: activeTarget.division ?? 'general',
      isPriced: typeof activeTarget.priceUSD === 'number'
    });

  // Option 1: Send via WhatsApp
  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Keep a server-side record as well; the WhatsApp message is the primary channel,
    // so a failed save must not block it.
    persistInquiry('whatsapp').catch((err) => console.warn('Lead backup failed', err));
    setSubmittedMethod('whatsapp');

    const formattedMessage = [
      `*NEW RMAST STUDIO INQUIRY*`,
      `═════════════════════════`,
      `*Package / System:* ${activeTarget.title}`,
      `*Division:* ${activeTarget.division === 'ai-content' ? 'AI Content Studio' : 'Real Estate Digital Systems'}`,
      `*Estimated Value:* ${getEstimatedPriceString()}`,
      ``,
      `*CLIENT SPECIFICATIONS*`,
      `• *Client Name:* ${clientName.trim()}`,
      `• *Email:* ${clientEmail.trim()}`,
      `• *Phone / WhatsApp:* ${clientPhone.trim()}`,
      `• *Company / Agency:* ${clientCompany.trim() || 'N/A'}`,
      `• *Location:* ${clientLocation}`,
      `• *Deployment Timeline:* ${timeline}`,
      ``,
      `*PROJECT REQUIREMENTS & NOTES:*`,
      `${notes.trim() || 'Looking to discuss package onboarding and timeline.'}`,
      ``,
      `*Submitted via RMAST Studio Direct Concierge*`
    ].join('\n');

    window.open(whatsappLink(formattedMessage), '_blank', 'noopener,noreferrer');
  };

  // Option 2: Send via Email. The server emails the studio inbox directly; the visitor's
  // mail app is only used as a fallback when the server could not send it.
  const handleSendEmail = async () => {
    if (!validate()) return;

    setIsSaving(true);
    setSubmitError(null);
    let delivered = false;
    try {
      const saved = await persistInquiry('email');
      setLastSavedId(saved.id);
      delivered = saved.emailed;
    } catch (err) {
      console.warn('Lead submission failed, falling back to mail app', err);
    } finally {
      setIsSaving(false);
    }

    setEmailDelivered(delivered);
    setShowDispatchPopup(false);
    setSubmittedMethod('email');
    if (delivered) return;

    const subject = `[RMAST Inquire] ${activeTarget.title} - ${clientName.trim()}${clientCompany ? ` (${clientCompany.trim()})` : ''}`;
    const emailBody = [
      `Dear RMAST Founders (Abdussamie & Mashhood),`,
      ``,
      `I would like to inquire about:`,
      `SYSTEM / PACKAGE: ${activeTarget.title}`,
      `DIVISION: ${activeTarget.division === 'ai-content' ? 'AI Content Studio' : 'Real Estate Digital Systems'}`,
      `ESTIMATED INVESTMENT: ${getEstimatedPriceString()}`,
      ``,
      `MY CONTACT & BUSINESS DETAILS:`,
      `Name: ${clientName.trim()}`,
      `Email: ${clientEmail.trim()}`,
      `WhatsApp / Phone: ${clientPhone.trim()}`,
      `Company / Agency: ${clientCompany.trim() || 'Direct Client'}`,
      `Location / Hub: ${clientLocation}`,
      `Target Timeline: ${timeline}`,
      ``,
      `PROJECT REQUIREMENTS / SCOPE NOTES:`,
      `${notes.trim() || 'Please review and advise on kickoff roadmap.'}`,
      ``,
      `Looking forward to your response within 24 hours.`,
      `Best regards,`,
      `${clientName.trim()}`
    ].join('\n');

    window.location.href = mailtoLink(subject, emailBody);
  };

  // Option 3: Submit the form straight to the studio inbox
  const handleSubmitForm = async () => {
    if (!validate()) return;

    setIsSaving(true);
    setSubmitError(null);
    try {
      const saved = await persistInquiry('form');
      setLastSavedId(saved.id);
      setShowDispatchPopup(false);
      setSubmittedMethod('form');
    } catch (err) {
      setSubmitError(
        `${err instanceof Error ? err.message : 'Submission failed.'} You can still reach us via WhatsApp or email.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger popup when user clicks Submit Inquiry at the end of the form
  const handleSubmitInquiryClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setShowDispatchPopup(true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
    >
      {/* Dark Slate Translucent Backdrop */}
      <div
        onClick={closeInquiry}
        className="fixed inset-0 bg-[#07090F]/85 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-[#0D101A] border border-[#262B3D] text-[#FAF8F5] shadow-2xl rounded-sm overflow-hidden z-10 my-8">
        {/* Gold Architectural Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent" />

        {/* Modal Top Header */}
        <div className="p-6 sm:p-7 border-b border-[#1E2335] flex items-start justify-between gap-4 bg-[#0A0D16]/90">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest uppercase bg-[#C9A96E]/15 text-[#C9A96E] px-2.5 py-0.5 rounded-xs border border-[#C9A96E]/30 font-semibold flex items-center gap-1.5">
                {activeTarget.division === 'ai-content' ? (
                  <>
                    <Film className="w-3 h-3" />
                    <span>AI Content Studio</span>
                  </>
                ) : (
                  <>
                    <Building2 className="w-3 h-3" />
                    <span>Real Estate Digital Systems</span>
                  </>
                )}
              </span>
              <span className="text-xs font-mono text-[#8E92A0]">Instant Proposal & Concierge</span>
            </div>

            <h2 id="inquiry-modal-title" className="font-serif text-2xl sm:text-3xl font-bold text-[#FAF8F5]">
              {activeTarget.title}
            </h2>

            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-mono text-[#71717A] uppercase">Baseline Investment:</span>
              <span className="text-base font-mono text-[#C9A96E] font-bold">
                {getEstimatedPriceString()}
              </span>
            </div>
          </div>

          <button
            onClick={closeInquiry}
            aria-label="Close dialog"
            className="p-2 text-[#71717A] hover:text-[#FAF8F5] hover:bg-[#161B2B] transition-colors rounded-sm cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {submittedMethod ? (
            /* Submission Success State */
            <div className="py-8 text-center space-y-6 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-[#C9A96E]/15 border border-[#C9A96E] text-[#C9A96E] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="font-serif text-2xl sm:text-3xl text-[#FAF8F5] font-semibold">
                  Inquiry Successfully Registered
                </h3>
                <p className="text-sm text-[#A1A1AA] max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="text-[#FAF8F5] font-medium">{clientName}</span>. Your requirements for{' '}
                  <span className="text-[#C9A96E] font-medium">{activeTarget.title}</span> have been safely recorded.
                </p>
              </div>

              {submittedMethod === 'whatsapp' && (
                <div className="p-4 bg-[#0A1A12] border border-[#1B432E] text-xs text-[#86EFAC] rounded-sm max-w-md mx-auto text-left flex items-start gap-3">
                  <Send className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                  <span>
                    WhatsApp has opened in a new tab with your pre-formatted brief. Send the message to chat directly with Abdussamie & Mashhood.
                  </span>
                </div>
              )}

              {submittedMethod === 'email' && (
                <div className="p-4 bg-[#141824] border border-[#232B42] text-xs text-[#93C5FD] rounded-sm max-w-md mx-auto text-left flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
                  {emailDelivered ? (
                    <span>
                      Your brief has been emailed to <strong className="text-[#FAF8F5]">{CONTACT.email}</strong>. Abdussamie & Mashhood will reply to <strong className="text-[#FAF8F5]">{clientEmail}</strong> within 24 hours.
                    </span>
                  ) : (
                    <span>
                      Your email app has been opened with a pre-filled brief addressed to <strong className="text-[#FAF8F5]">{CONTACT.email}</strong>. Press send to complete your inquiry. If nothing opened, email us directly at that address.
                    </span>
                  )}
                </div>
              )}

              {submittedMethod === 'form' && (
                <div className="p-4 bg-[#111625] border border-[#232C47] text-xs text-[#D1D5DB] rounded-sm max-w-md mx-auto text-left flex items-start gap-3">
                  <Database className="w-4 h-4 text-[#C9A96E] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-[#FAF8F5] font-semibold mb-1">
                      Delivered to the founders' inbox
                    </div>
                    <span>
                      Reference: <code className="text-[#C9A96E] font-mono">{lastSavedId}</code>. Abdussamie & Mashhood will review your brief and reply within 24 hours.
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={closeInquiry}
                  className="px-6 py-2.5 bg-[#C9A96E] text-[#0A0A0C] text-xs font-semibold uppercase tracking-wider hover:bg-[#D9B97E] transition-all cursor-pointer rounded-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Inquiry Input Form */
            <form className="space-y-5">
              {/* Form Guidance Note */}
              <div className="p-3.5 bg-[#080B12]/80 border border-[#1E2335] text-xs text-[#8E92A0] flex items-center justify-between gap-3 rounded-xs">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C9A96E] shrink-0" />
                  <span>Direct founder attention. Review within 24 hours guaranteed.</span>
                </span>
                <span className="text-[10px] font-mono text-[#C9A96E] uppercase">USA · UAE · Canada</span>
              </div>

              {/* Grid 1: Name and Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] flex items-center justify-between">
                    <span>Full Name *</span>
                    {errors.clientName && (
                      <span className="text-[10px] text-[#EF4444] font-sans font-medium">
                        {errors.clientName}
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Julian Vance"
                    className="w-full px-4 py-2.5 bg-[#090B13] border border-[#202638] focus:border-[#C9A96E] text-[#FAF8F5] text-sm rounded-xs outline-none transition-all placeholder:text-[#52525B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] flex items-center justify-between">
                    <span>Email Address *</span>
                    {errors.clientEmail && (
                      <span className="text-[10px] text-[#EF4444] font-sans font-medium">
                        {errors.clientEmail}
                      </span>
                    )}
                  </label>
                  <input
                    type="email"
                    required
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="e.g. jvance@luxuryrealty.com"
                    className="w-full px-4 py-2.5 bg-[#090B13] border border-[#202638] focus:border-[#C9A96E] text-[#FAF8F5] text-sm rounded-xs outline-none transition-all placeholder:text-[#52525B]"
                  />
                </div>
              </div>

              {/* Grid 2: WhatsApp Number and Agency/Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA] flex items-center justify-between">
                    <span>WhatsApp / Phone *</span>
                    {errors.clientPhone && (
                      <span className="text-[10px] text-[#EF4444] font-sans font-medium">
                        {errors.clientPhone}
                      </span>
                    )}
                  </label>
                  <input
                    type="tel"
                    required
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="e.g. +1 305 890 4421 / +971 50 123 4567"
                    className="w-full px-4 py-2.5 bg-[#090B13] border border-[#202638] focus:border-[#C9A96E] text-[#FAF8F5] text-sm rounded-xs outline-none transition-all placeholder:text-[#52525B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                    Agency / Brand Name
                  </label>
                  <input
                    type="text"
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="e.g. Vance Luxury Estates"
                    className="w-full px-4 py-2.5 bg-[#090B13] border border-[#202638] focus:border-[#C9A96E] text-[#FAF8F5] text-sm rounded-xs outline-none transition-all placeholder:text-[#52525B]"
                  />
                </div>
              </div>

              {/* Grid 3: Location Hub and Target Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                    Market / Primary Location
                  </label>
                  <select
                    value={clientLocation}
                    onChange={(e) => setClientLocation(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#090B13] border border-[#202638] focus:border-[#C9A96E] text-[#FAF8F5] text-sm rounded-xs outline-none cursor-pointer"
                  >
                    <option value="United States (USA)">United States (Miami, NYC, LA, Austin)</option>
                    <option value="United Arab Emirates (UAE)">United Arab Emirates (Dubai, Abu Dhabi)</option>
                    <option value="Canada (CA)">Canada (Toronto, Vancouver, Montreal)</option>
                    <option value="United Kingdom / Europe">United Kingdom / Europe</option>
                    <option value="Pakistan / South Asia">Pakistan / South Asia</option>
                    <option value="Global / Other International">Global / Other International</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                    Target Deployment Timeline
                  </label>
                  <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#090B13] border border-[#202638] focus:border-[#C9A96E] text-[#FAF8F5] text-sm rounded-xs outline-none cursor-pointer"
                  >
                    <option value="Immediate (1-2 Weeks)">Immediate (Kickoff in 1-2 Weeks)</option>
                    <option value="Within 2-4 Weeks">Standard Sprint (2-4 Weeks)</option>
                    <option value="Within 1-2 Months">Next Quarter (1-2 Months)</option>
                    <option value="Strategic Scoping / Discovery">Strategic Scoping / Flexible</option>
                  </select>
                </div>
              </div>

              {/* Scope Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-[#A1A1AA]">
                  Operational Scope & Requirements (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share details on your listing volume, active CRM (Follow Up Boss, HubSpot), WhatsApp preferences, or video aesthetic..."
                  className="w-full px-4 py-2.5 bg-[#090B13] border border-[#202638] focus:border-[#C9A96E] text-[#FAF8F5] text-sm rounded-xs outline-none transition-all placeholder:text-[#52525B] resize-none"
                />
              </div>

              {/* SINGLE SUBMIT INQUIRY BUTTON AT END OF FORM */}
              <div className="pt-4 border-t border-[#1E2335] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs font-mono text-[#8E92A0] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C9A96E] shrink-0" />
                  <span>Direct founder response within 24 hours guaranteed</span>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitInquiryClick}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#C9A96E] hover:bg-[#D9B97E] text-[#0A0A0C] text-xs font-bold uppercase tracking-[0.16em] transition-all cursor-pointer shadow-lg inline-flex items-center justify-center gap-2 group"
                >
                  <span>Submit Inquiry</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          )}

          {/* POPUP OPTIONS: WHATSAPP, EMAIL, JUST SUBMIT FORM */}
          {showDispatchPopup && !submittedMethod && (
            <div className="absolute inset-0 bg-[#07090F]/90 backdrop-blur-md z-30 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
              <div className="w-full max-w-lg bg-[#0F1322] border border-[#273048] rounded-sm p-6 sm:p-8 space-y-6 shadow-2xl relative">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-[#1E253A] pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#C9A96E] font-semibold block mb-1">
                      Final Step · Select Submission Method
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#FAF8F5]">
                      How would you like to submit?
                    </h3>
                    <p className="text-xs text-[#8E92A0] mt-1">
                      Choose how you want to deliver your inquiry to RMAST Studio founders.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDispatchPopup(false)}
                    className="p-1.5 text-[#71717A] hover:text-[#FAF8F5] transition-colors cursor-pointer"
                    title="Back to form"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* The 3 Pop-up Options */}
                <div className="space-y-3">
                  {/* Option 1: WhatsApp */}
                  <button
                    type="button"
                    onClick={(e) => {
                      setShowDispatchPopup(false);
                      handleSendWhatsApp(e);
                    }}
                    className="w-full p-4 bg-[#10291B] hover:bg-[#163825] border border-[#25D366]/40 hover:border-[#25D366] rounded-xs text-left transition-all cursor-pointer group flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] shrink-0 group-hover:scale-110 transition-transform">
                        <Send className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#FAF8F5] group-hover:text-[#86EFAC] transition-colors">
                          WhatsApp
                        </div>
                        <div className="text-xs text-[#A7F3D0]/80 mt-0.5">
                          Instant direct chat with founders ({CONTACT.whatsappDisplay})
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#86EFAC] group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>

                  {/* Option 2: Email */}
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSendEmail}
                    className="w-full p-4 bg-[#231E12] hover:bg-[#2F2718] border border-[#C9A96E]/40 hover:border-[#C9A96E] rounded-xs text-left transition-all cursor-pointer group flex items-center justify-between disabled:opacity-60 disabled:cursor-wait"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#C9A96E]/20 border border-[#C9A96E]/40 flex items-center justify-center text-[#C9A96E] shrink-0 group-hover:scale-110 transition-transform">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#FAF8F5] group-hover:text-[#FDE68A] transition-colors">
                          {isSaving ? 'Sending…' : 'Email'}
                        </div>
                        <div className="text-xs text-[#FDE68A]/80 mt-0.5">
                          Dispatch itemized project scope to {CONTACT.email}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#C9A96E] group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>

                  {/* Option 3: Just Submit Form */}
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={handleSubmitForm}
                    className="w-full p-4 bg-[#11182B] hover:bg-[#18233D] border border-[#3B82F6]/40 hover:border-[#60A5FA] rounded-xs text-left transition-all cursor-pointer group flex items-center justify-between disabled:opacity-60 disabled:cursor-wait"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center text-[#60A5FA] shrink-0 group-hover:scale-110 transition-transform">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#FAF8F5] group-hover:text-[#93C5FD] transition-colors">
                          {isSaving ? 'Submitting…' : 'Just Submit Form'}
                        </div>
                        <div className="text-xs text-[#93C5FD]/80 mt-0.5">
                          Send your brief straight to the founders' inbox
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#60A5FA] group-hover:translate-x-1 transition-transform shrink-0" />
                  </button>

                  {submitError && (
                    <p role="alert" className="text-xs text-[#FCA5A5] bg-[#2A1215] border border-[#7F1D1D] px-3 py-2 rounded-xs">
                      {submitError}
                    </p>
                  )}
                </div>

                {/* Back to form action */}
                <div className="pt-2 text-center border-t border-[#1E253A]">
                  <button
                    type="button"
                    onClick={() => setShowDispatchPopup(false)}
                    className="text-xs font-mono text-[#8E92A0] hover:text-[#FAF8F5] transition-colors cursor-pointer py-1"
                  >
                    ← Back to edit form details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
