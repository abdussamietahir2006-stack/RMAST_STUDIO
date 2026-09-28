import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { useInquiry } from '../../context/InquiryContext';
import { useCurrency } from '../../context/CurrencyContext';
import { CONTACT, mailtoLink, whatsappLink } from '../../config/contact';
import { submitLead } from '../../lib/api';
import { DispatchMethod, InquiryOption, InquiryTarget } from '../../types';
import {
  X,
  Send,
  Mail,
  Inbox,
  Building2,
  Film,
  Check,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Clock,
  Globe2,
  User,
  Phone,
  Briefcase,
  MapPin,
  MessageSquareText,
  Loader2,
  Sparkles
} from 'lucide-react';

type ModalDispatch = Exclude<DispatchMethod, 'contact-form'>;
type Step = 'details' | 'send' | 'done';

const EASE = [0.22, 1, 0.36, 1] as const;

const LOCATIONS = [
  { value: 'United States (USA)', label: 'United States (Miami, NYC, LA, Austin)' },
  { value: 'United Arab Emirates (UAE)', label: 'United Arab Emirates (Dubai, Abu Dhabi)' },
  { value: 'Canada (CA)', label: 'Canada (Toronto, Vancouver, Montreal)' },
  { value: 'United Kingdom / Europe', label: 'United Kingdom / Europe' },
  { value: 'Pakistan / South Asia', label: 'Pakistan / South Asia' },
  { value: 'Global / Other International', label: 'Global / Other International' }
];

const TIMELINES = [
  { value: 'Immediate (1-2 Weeks)', label: 'Immediate', hint: '1–2 weeks' },
  { value: 'Within 2-4 Weeks', label: 'Standard', hint: '2–4 weeks' },
  { value: 'Within 1-2 Months', label: 'Next quarter', hint: '1–2 months' },
  { value: 'Strategic Scoping / Discovery', label: 'Flexible', hint: 'Scoping first' }
];

// Details typed into the popup, kept in memory for the visit (not stored anywhere)
let remembered = {
  clientName: '',
  clientEmail: '',
  clientPhone: '',
  clientCompany: '',
  clientLocation: 'United States (USA)',
  timeline: 'Within 2-4 Weeks',
  notes: ''
};

// Applies the tier chosen in the popup on top of the original inquiry target
function withOption(target: InquiryTarget, option: InquiryOption | undefined): InquiryTarget {
  if (!option) return target;
  return {
    ...target,
    title: option.title,
    priceUSD: option.priceUSD,
    billingFrequency: option.billingFrequency,
    packageId: option.packageId ?? target.packageId,
    features: option.features ?? target.features
  };
}

// ---------------------------------------------------------------------------
// Form field with icon, focus glow and a shake when its error appears
// ---------------------------------------------------------------------------

const Field: React.FC<{
  id: string;
  label: string;
  icon: React.ElementType;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ id, label, icon: Icon, error, required, children }) => (
  <div className="space-y-2">
    <label htmlFor={id} className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.14em] text-muted">
      <span>
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      <AnimatePresence>
        {error && (
          <m.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="normal-case tracking-normal font-sans text-xs text-[#F87171]"
            id={`${id}-error`}
          >
            {error}
          </m.span>
        )}
      </AnimatePresence>
    </label>
    <m.div
      key={error ? `err-${error}` : 'ok'}
      animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      className={`group/field relative flex items-center rounded-md border bg-surface transition-all duration-200 focus-within:border-primary focus-within:shadow-[0_0_0_3px_rgba(166,139,255,0.15),0_8px_30px_-12px_rgba(166,139,255,0.35)] ${
        error ? 'border-[#7F1D1D]' : 'border-line hover:border-line-strong'
      }`}
    >
      <Icon className="absolute left-3.5 w-4 h-4 text-subtle transition-colors group-focus-within/field:text-brand pointer-events-none" />
      {children}
    </m.div>
  </div>
);

const inputClass =
  'w-full bg-transparent pl-12 pr-4 py-3 text-sm text-fg placeholder:text-subtle outline-none rounded-md';

// ---------------------------------------------------------------------------
// Animated success check
// ---------------------------------------------------------------------------

const SuccessMark: React.FC = () => (
  <m.div
    initial={{ scale: 0.6, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
    className="relative w-20 h-20 mx-auto"
  >
    <m.span
      className="absolute inset-0 rounded-full bg-primary/20"
      initial={{ scale: 1, opacity: 0.6 }}
      animate={{ scale: 1.6, opacity: 0 }}
      transition={{ duration: 1.2, repeat: 2, ease: 'easeOut' }}
    />
    <svg viewBox="0 0 80 80" className="relative w-20 h-20">
      <circle cx="40" cy="40" r="38" fill="rgba(166,139,255,0.12)" stroke="#A68BFF" strokeWidth="2" />
      <m.path
        d="M25 41 L35 51 L56 30"
        fill="none"
        stroke="#A68BFF"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
      />
    </svg>
  </m.div>
);

// ---------------------------------------------------------------------------

const InquiryDialog: React.FC<{ target: InquiryTarget; onClose: () => void }> = ({ target, onClose }) => {
  const { format } = useCurrency();
  const dialogRef = useRef<HTMLDivElement>(null);

  const options = target.options ?? [];
  const [selectedId, setSelectedId] = useState<string | undefined>(target.selectedOptionId ?? options[0]?.id);
  const selectedOption = options.find((o) => o.id === selectedId);
  const activeTarget = useMemo(() => withOption(target, selectedOption), [target, selectedOption]);

  const [step, setStep] = useState<Step>('details');
  const [clientName, setClientName] = useState(remembered.clientName);
  const [clientEmail, setClientEmail] = useState(remembered.clientEmail);
  const [clientPhone, setClientPhone] = useState(remembered.clientPhone);
  const [clientCompany, setClientCompany] = useState(remembered.clientCompany);
  const [clientLocation, setClientLocation] = useState(remembered.clientLocation);
  const [timeline, setTimeline] = useState(remembered.timeline);
  const [notes, setNotes] = useState(remembered.notes);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submittedMethod, setSubmittedMethod] = useState<ModalDispatch | null>(null);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [savingMethod, setSavingMethod] = useState<ModalDispatch | null>(null);
  const [emailDelivered, setEmailDelivered] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Keep the visitor's details if they close the popup and open another package
  useEffect(() => {
    remembered = { clientName, clientEmail, clientPhone, clientCompany, clientLocation, timeline, notes };
  }, [clientName, clientEmail, clientPhone, clientCompany, clientLocation, timeline, notes]);

  // Lock page scroll, close on Escape, and move focus into the dialog (once, on open)
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    window.addEventListener('keydown', onKey);
    dialogRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!clientName.trim()) newErrors.clientName = 'Full name is required';
    if (!clientEmail.trim() || !clientEmail.includes('@')) {
      newErrors.clientEmail = 'Valid email is required';
    }
    if (!clientPhone.trim() || clientPhone.length < 7) {
      newErrors.clientPhone = 'Phone or WhatsApp is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getEstimatedPriceString = (): string => {
    if (!activeTarget.priceUSD) return 'Custom Architectural Scoping';
    return `${format(activeTarget.priceUSD)} ${activeTarget.billingFrequency || ''}`.trim();
  };

  const divisionLabel =
    activeTarget.division === 'ai-content'
      ? 'AI Content Studio'
      : activeTarget.division === 'real-estate'
      ? 'Real Estate Digital Systems'
      : 'Studio Architecture';

  const persistInquiry = (method: ModalDispatch) =>
    submitLead({
      targetTitle: activeTarget.title,
      division: divisionLabel,
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
  const handleSendWhatsApp = () => {
    if (!validate()) return;

    // Keep a server-side record as well; the WhatsApp message is the primary channel,
    // so a failed save must not block it.
    persistInquiry('whatsapp').catch((err) => console.warn('Lead backup failed', err));
    setSubmittedMethod('whatsapp');
    setStep('done');

    const formattedMessage = [
      `*NEW RMAST STUDIO INQUIRY*`,
      `═════════════════════════`,
      `*Package / System:* ${activeTarget.title}`,
      `*Division:* ${divisionLabel}`,
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

    setSavingMethod('email');
    setSubmitError(null);
    let delivered = false;
    try {
      const saved = await persistInquiry('email');
      setLastSavedId(saved.id);
      delivered = saved.emailed;
    } catch (err) {
      console.warn('Lead submission failed, falling back to mail app', err);
    } finally {
      setSavingMethod(null);
    }

    setEmailDelivered(delivered);
    setSubmittedMethod('email');
    setStep('done');
    if (delivered) return;

    const subject = `[RMAST Inquire] ${activeTarget.title} - ${clientName.trim()}${clientCompany ? ` (${clientCompany.trim()})` : ''}`;
    const emailBody = [
      `Dear RMAST Founders (Abdussamie & Mashhood),`,
      ``,
      `I would like to inquire about:`,
      `SYSTEM / PACKAGE: ${activeTarget.title}`,
      `DIVISION: ${divisionLabel}`,
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

    setSavingMethod('form');
    setSubmitError(null);
    try {
      const saved = await persistInquiry('form');
      setLastSavedId(saved.id);
      setSubmittedMethod('form');
      setStep('done');
    } catch (err) {
      setSubmitError(
        `${err instanceof Error ? err.message : 'Submission failed.'} You can still reach us via WhatsApp or email.`
      );
    } finally {
      setSavingMethod(null);
    }
  };

  const goToSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    setStep('send');
  };

  const DivisionIcon = activeTarget.division === 'ai-content' ? Film : Building2;
  const features = (activeTarget.features ?? []).slice(0, 5);
  const stepIndex = step === 'details' ? 0 : step === 'send' ? 1 : 2;

  return (
    <m.div
      className="fixed inset-0 z-[60] flex items-start sm:items-center justify-center overflow-y-auto p-0 sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Backdrop */}
      <m.div
        onClick={onClose}
        className="fixed inset-0 bg-canvas/80 backdrop-blur-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        aria-hidden="true"
      />

      <m.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-modal-title"
        tabIndex={-1}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="relative z-10 w-full max-w-5xl min-h-screen sm:min-h-0 sm:my-8 outline-none grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] overflow-hidden sm:rounded-xl border border-line-strong bg-surface text-fg shadow-[0_40px_120px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(166,139,255,0.08)]"
      >
        {/* Animated gold edge */}
        <m.div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        />

        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="fixed sm:absolute top-4 right-4 z-20 w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center text-muted hover:text-fg bg-surface-2/80 border border-line-strong hover:border-primary/60 hover:rotate-90 transition-all duration-300 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ================= Summary panel ================= */}
        <aside className="relative overflow-hidden p-6 sm:p-8 lg:p-8 border-b lg:border-b-0 lg:border-r border-line bg-surface">
          <div
            aria-hidden="true"
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(166,139,255,0.20)_0%,transparent_65%)] pointer-events-none"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-40 pointer-events-none bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_80%_60%_at_20%_10%,#000_30%,transparent_100%)]"
          />

          <div className="relative space-y-6">
            <span className="inline-flex items-center gap-2 text-xs font-mono tracking-[0.2em] uppercase text-brand bg-primary/10 border border-primary/30 px-3 py-1 rounded-full">
              <DivisionIcon className="w-3 h-3" />
              {divisionLabel}
            </span>

            <div className="space-y-3 pr-12 lg:pr-0">
              <AnimatePresence mode="wait" initial={false}>
                <m.h2
                  key={activeTarget.title}
                  id="inquiry-modal-title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="font-serif text-2xl sm:text-3xl font-bold leading-tight"
                >
                  {activeTarget.title}
                </m.h2>
              </AnimatePresence>

              <div className="flex items-baseline gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-subtle">From</span>
                <AnimatePresence mode="popLayout" initial={false}>
                  <m.span
                    key={getEstimatedPriceString()}
                    initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="font-serif text-3xl sm:text-4xl font-bold text-brand"
                  >
                    {activeTarget.priceUSD ? format(activeTarget.priceUSD) : 'Custom'}
                  </m.span>
                </AnimatePresence>
                {activeTarget.priceUSD && (
                  <span className="text-xs font-mono text-muted">{activeTarget.billingFrequency}</span>
                )}
              </div>
            </div>

            {/* Tier selector */}
            {options.length > 1 && (
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted">Choose your tier</div>
                <div role="radiogroup" aria-label="Choose your tier" className="grid grid-cols-3 lg:grid-cols-1 gap-2">
                  {options.map((opt) => {
                    const active = opt.id === selectedId;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setSelectedId(opt.id)}
                        className={`relative text-left rounded-lg border px-3 py-3 lg:px-4 lg:py-3 transition-colors duration-200 cursor-pointer ${
                          active ? 'border-primary' : 'border-line hover:border-line-strong'
                        }`}
                      >
                        {active && (
                          <m.span
                            layoutId="tier-highlight"
                            className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                        <span className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-1">
                          <span className="flex items-center gap-2">
                            <span
                              className={`hidden lg:flex w-4 h-4 rounded-full border items-center justify-center transition-colors ${
                                active ? 'border-primary bg-primary' : 'border-line-strong'
                              }`}
                            >
                              {active && <Check className="w-2.5 h-2.5 text-on-primary" strokeWidth={3} />}
                            </span>
                            <span className={`text-xs sm:text-sm font-semibold ${active ? 'text-fg' : 'text-fg'}`}>
                              {opt.label}
                            </span>
                            {opt.badge && (
                              <span className="hidden sm:inline text-[9px] font-mono uppercase tracking-wider px-2 py-1 rounded bg-primary/15 text-brand">
                                {opt.badge}
                              </span>
                            )}
                          </span>
                          <span className={`text-xs sm:text-xs font-mono ${active ? 'text-brand' : 'text-muted'}`}>
                            {format(opt.priceUSD)}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* What's included */}
            {features.length > 0 && (
              <div className="hidden sm:block space-y-3">
                <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted">What's included</div>
                <AnimatePresence mode="wait" initial={false}>
                  <m.ul
                    key={activeTarget.title}
                    className="space-y-2"
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    variants={{ show: { transition: { staggerChildren: 0.05 } }, hidden: {} }}
                  >
                    {features.map((f) => (
                      <m.li
                        key={f}
                        variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0 } }}
                        className="flex items-start gap-3 text-[13px] text-fg leading-snug"
                      >
                        <span className="mt-1 w-4 h-4 shrink-0 rounded-full bg-primary/15 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-brand" strokeWidth={3} />
                        </span>
                        {f}
                      </m.li>
                    ))}
                  </m.ul>
                </AnimatePresence>
              </div>
            )}

            <ul className="hidden lg:grid gap-3 pt-6 border-t border-line text-xs text-muted">
              <li className="flex items-center gap-3">
                <Clock className="w-3.5 h-3.5 text-brand" /> Founder reply within 24 hours
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-3.5 h-3.5 text-brand" /> No-obligation scoping call
              </li>
              <li className="flex items-center gap-3">
                <Globe2 className="w-3.5 h-3.5 text-brand" /> USA · UAE · Canada · Worldwide
              </li>
            </ul>
          </div>
        </aside>

        {/* ================= Steps panel ================= */}
        <section className="relative p-6 sm:p-8 lg:p-12 flex flex-col">
          {/* Step indicator */}
          <ol className="flex items-center gap-2 mb-8 pr-12 text-xs font-mono uppercase tracking-[0.16em]" aria-label="Progress">
            {['Your details', 'Send', 'Done'].map((label, i) => (
              <li key={label} className="flex items-center gap-2 flex-1 last:flex-none">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-300 ${
                    i < stepIndex
                      ? 'bg-primary border-primary text-on-primary'
                      : i === stepIndex
                      ? 'border-primary text-brand'
                      : 'border-line-strong text-subtle'
                  }`}
                  aria-current={i === stepIndex ? 'step' : undefined}
                >
                  {i < stepIndex ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className={`hidden sm:inline ${i <= stepIndex ? 'text-fg' : 'text-subtle'}`}>{label}</span>
                {i < 2 && (
                  <span className="relative flex-1 h-px bg-surface-2 overflow-hidden">
                    <m.span
                      className="absolute inset-0 bg-primary origin-left"
                      initial={false}
                      animate={{ scaleX: i < stepIndex ? 1 : 0 }}
                      transition={{ duration: 0.5, ease: EASE }}
                    />
                  </span>
                )}
              </li>
            ))}
          </ol>

          <AnimatePresence mode="wait" initial={false}>
            {step === 'details' && (
              <m.form
                key="details"
                onSubmit={goToSend}
                noValidate
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="space-y-6 flex-1"
              >
                <div>
                  <h3 className="type-h3">Tell us about you</h3>
                  <p className="text-sm text-muted mt-1">Takes under a minute. Abdussamie & Mashhood read every brief personally.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field id="inq-name" label="Full name" icon={User} error={errors.clientName} required>
                    <input
                      id="inq-name"
                      type="text"
                      autoComplete="name"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="Julian Vance"
                      aria-invalid={Boolean(errors.clientName)}
                      className={inputClass}
                    />
                  </Field>
                  <Field id="inq-email" label="Email" icon={Mail} error={errors.clientEmail} required>
                    <input
                      id="inq-email"
                      type="email"
                      autoComplete="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="you@company.com"
                      aria-invalid={Boolean(errors.clientEmail)}
                      className={inputClass}
                    />
                  </Field>
                  <Field id="inq-phone" label="WhatsApp / phone" icon={Phone} error={errors.clientPhone} required>
                    <input
                      id="inq-phone"
                      type="tel"
                      autoComplete="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+1 305 890 4421"
                      aria-invalid={Boolean(errors.clientPhone)}
                      className={inputClass}
                    />
                  </Field>
                  <Field id="inq-company" label="Agency / brand" icon={Briefcase}>
                    <input
                      id="inq-company"
                      type="text"
                      autoComplete="organization"
                      value={clientCompany}
                      onChange={(e) => setClientCompany(e.target.value)}
                      placeholder="Vance Luxury Estates"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field id="inq-location" label="Primary market" icon={MapPin}>
                  <select
                    id="inq-location"
                    value={clientLocation}
                    onChange={(e) => setClientLocation(e.target.value)}
                    className={`${inputClass} appearance-none cursor-pointer`}
                  >
                    {LOCATIONS.map((l) => (
                      <option key={l.value} value={l.value} className="bg-surface">
                        {l.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <div className="space-y-2">
                  <div className="text-xs font-mono uppercase tracking-[0.14em] text-muted" id="inq-timeline-label">
                    Timeline
                  </div>
                  <div role="radiogroup" aria-labelledby="inq-timeline-label" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TIMELINES.map((t) => {
                      const active = timeline === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setTimeline(t.value)}
                          className={`relative rounded-md border px-3 py-2 text-left transition-colors cursor-pointer ${
                            active ? 'border-primary text-fg' : 'border-line text-muted hover:border-line-strong'
                          }`}
                        >
                          {active && (
                            <m.span
                              layoutId="timeline-highlight"
                              className="absolute inset-0 rounded-md bg-primary/12"
                              transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                            />
                          )}
                          <span className="relative block text-xs font-semibold">{t.label}</span>
                          <span className="relative block text-xs font-mono text-muted">{t.hint}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Field id="inq-notes" label="Project notes" icon={MessageSquareText}>
                  <textarea
                    id="inq-notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Listing volume, current CRM, video style, goals…"
                    className={`${inputClass} resize-none self-start`}
                  />
                </Field>

                <div className="pt-2 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-xs text-muted">
                    <ShieldCheck className="w-4 h-4 text-brand" />
                    Private. Never shared or spammed.
                  </span>
                  <m.button
                    type="submit"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-shine inline-flex items-center justify-center gap-2 px-8 py-4 rounded-md bg-primary text-on-primary text-xs font-bold uppercase tracking-[0.16em] shadow-[0_10px_30px_-10px_rgba(166,139,255,0.6)] cursor-pointer group"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </m.button>
                </div>
              </m.form>
            )}

            {step === 'send' && (
              <m.div
                key="send"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="space-y-6 flex-1"
              >
                <div>
                  <h3 className="type-h3">How should we reach you?</h3>
                  <p className="text-sm text-muted mt-1">
                    Thanks, {clientName.trim().split(' ')[0]}. Pick the channel you prefer.
                  </p>
                </div>

                <m.div
                  className="space-y-3"
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.07 } }, hidden: {} }}
                >
                  {[
                    {
                      method: 'whatsapp' as const,
                      title: 'WhatsApp',
                      text: `Opens a chat with the founders (${CONTACT.whatsappDisplay}) with your brief pre-filled`,
                      icon: Send,
                      tone: 'from-[#25D366]/15 border-[#25D366]/35 hover:border-[#25D366] text-[#25D366]',
                      onClick: handleSendWhatsApp
                    },
                    {
                      method: 'email' as const,
                      title: 'Email',
                      text: `Your itemized brief goes straight to ${CONTACT.email}`,
                      icon: Mail,
                      tone: 'from-primary/15 border-primary/35 hover:border-primary text-brand',
                      onClick: handleSendEmail
                    },
                    {
                      method: 'form' as const,
                      title: 'Just submit',
                      text: "Send it to the founders' inbox and we'll reply by email",
                      icon: Inbox,
                      tone: 'from-[#60A5FA]/15 border-[#60A5FA]/35 hover:border-[#60A5FA] text-[#60A5FA]',
                      onClick: handleSubmitForm
                    }
                  ].map((c) => (
                    <m.button
                      key={c.method}
                      type="button"
                      onClick={c.onClick}
                      disabled={savingMethod !== null}
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.99 }}
                      className={`w-full flex items-center gap-4 p-4 sm:p-6 rounded-lg border bg-gradient-to-r to-transparent text-left transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait group ${c.tone}`}
                    >
                      <span className="w-11 h-11 shrink-0 rounded-full bg-current/10 border border-current/30 flex items-center justify-center">
                        {savingMethod === c.method ? <Loader2 className="w-5 h-5 animate-spin" /> : <c.icon className="w-5 h-5" />}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-fg">
                          {savingMethod === c.method ? 'Sending…' : c.title}
                        </span>
                        <span className="block text-xs text-muted mt-1">{c.text}</span>
                      </span>
                      <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
                    </m.button>
                  ))}
                </m.div>

                <AnimatePresence>
                  {submitError && (
                    <m.p
                      role="alert"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-[#FCA5A5] bg-[#2A1215] border border-[#7F1D1D] px-3 py-2 rounded-md"
                    >
                      {submitError}
                    </m.p>
                  )}
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => setStep('details')}
                  disabled={savingMethod !== null}
                  className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-muted hover:text-fg transition-colors cursor-pointer group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                  Edit details
                </button>
              </m.div>
            )}

            {step === 'done' && submittedMethod && (
              <m.div
                key="done"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-6"
              >
                <SuccessMark />
                <div className="space-y-2">
                  <h3 className="type-h3">You're all set</h3>
                  <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                    Thank you, <span className="text-fg font-medium">{clientName}</span>. Your brief for{' '}
                    <span className="text-brand font-medium">{activeTarget.title}</span> has been recorded.
                  </p>
                </div>

                <div className="w-full max-w-md text-left text-xs rounded-lg border border-line bg-surface p-4 flex items-start gap-3 text-fg">
                  {submittedMethod === 'whatsapp' && (
                    <>
                      <Send className="w-4 h-4 text-[#25D366] shrink-0 mt-1" />
                      <span>WhatsApp opened in a new tab with your brief. Press send to chat directly with Abdussamie & Mashhood.</span>
                    </>
                  )}
                  {submittedMethod === 'email' &&
                    (emailDelivered ? (
                      <>
                        <Mail className="w-4 h-4 text-brand shrink-0 mt-1" />
                        <span>
                          Your brief has been emailed to <strong className="text-fg">{CONTACT.email}</strong>. We'll reply
                          to <strong className="text-fg">{clientEmail}</strong> within 24 hours.
                        </span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 text-brand shrink-0 mt-1" />
                        <span>
                          Your email app opened with a pre-filled brief to <strong className="text-fg">{CONTACT.email}</strong>.
                          Press send to finish. If nothing opened, email us directly at that address.
                        </span>
                      </>
                    ))}
                  {submittedMethod === 'form' && (
                    <>
                      <Sparkles className="w-4 h-4 text-[#60A5FA] shrink-0 mt-1" />
                      <span>
                        Delivered to the founders' inbox
                        {lastSavedId && (
                          <>
                            {' '}
                            (reference <code className="text-brand font-mono">{lastSavedId}</code>)
                          </>
                        )}
                        . We'll reply within 24 hours.
                      </span>
                    </>
                  )}
                </div>

                <m.button
                  onClick={onClose}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-shine px-8 py-3 rounded-md bg-primary text-on-primary text-xs font-bold uppercase tracking-[0.16em] cursor-pointer"
                >
                  Done
                </m.button>
              </m.div>
            )}
          </AnimatePresence>
        </section>
      </m.div>
    </m.div>
  );
};

export const InquiryModal: React.FC = () => {
  const { isInquiryOpen, activeTarget, closeInquiry } = useInquiry();

  return (
    <AnimatePresence>
      {isInquiryOpen && activeTarget && (
        <InquiryDialog key={`${activeTarget.title}-${activeTarget.selectedOptionId ?? ''}`} target={activeTarget} onClose={closeInquiry} />
      )}
    </AnimatePresence>
  );
};
