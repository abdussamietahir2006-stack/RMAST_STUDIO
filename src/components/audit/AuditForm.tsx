import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { EMPTY_ANSWERS, LINK_FIELDS, STEPS, type AuditAnswers, type Field } from '../../data/audit/questions';
import { hasNoWebsite, NO_WEBSITE_ANSWERS, validateStep } from '../../data/audit/validate';

const fieldClass =
  'w-full bg-canvas border border-line rounded-btn px-4 py-3 text-base text-fg placeholder-subtle focus:outline-none focus:border-primary transition-colors disabled:opacity-50';
const labelClass = 'text-sm font-medium text-fg block';

// The website questions that are answered automatically when there is no website
const WEBSITE_DEPENDENTS = ['siteListings', 'siteContact', 'siteChat', 'siteMobile'];

interface Props {
  onComplete: (answers: AuditAnswers, honeypot: string) => void;
}

// Six question steps and a final consent step. Answers live in state, so going back keeps them.
export const AuditForm: React.FC<Props> = ({ onComplete }) => {
  const [answers, setAnswers] = useState<AuditAnswers>(EMPTY_ANSWERS);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [honeypot, setHoneypot] = useState('');
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  const total = STEPS.length + 1;
  const isFinal = step === STEPS.length;

  // Move focus to the new step's heading, so keyboard and screen reader users start at the top
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
    headingRef.current?.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step]);

  const set = (patch: Partial<AuditAnswers>) => {
    setAnswers((prev) => {
      let next = { ...prev, ...patch };
      // No website: the questions about it answer themselves; picking a website again clears them
      if (patch.noWebsite === true || patch.siteStatus === 'No website') next = { ...next, ...NO_WEBSITE_ANSWERS, website: '' };
      if (patch.noWebsite === false && prev.siteStatus === 'No website') {
        next = { ...next, siteStatus: '', siteListings: '', siteContact: '', siteChat: '', siteMobile: '' };
      }
      if (patch.siteStatus && patch.siteStatus !== 'No website' && prev.siteStatus === 'No website') {
        next = { ...next, noWebsite: false, siteListings: '', siteContact: '', siteChat: '', siteMobile: '' };
      }
      return next;
    });
    setErrors((prev) => {
      const rest = { ...prev };
      for (const k of Object.keys(patch)) delete rest[k];
      if (LINK_FIELDS.some((k) => k in patch) || 'noWebsite' in patch) delete rest.links;
      return rest;
    });
  };

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFinal) {
      const found = validateStep(step, answers);
      setErrors(found);
      if (Object.keys(found).length) {
        const first = Object.keys(found)[0];
        document.getElementById(`audit-${first === 'links' ? 'website' : first}`)?.focus();
        return;
      }
      setStep(step + 1);
      return;
    }
    onComplete(answers, honeypot);
  };

  const back = () => {
    setErrors({});
    setStep(Math.max(0, step - 1));
  };

  const renderField = (field: Field) => {
    const id = `audit-${field.key}`;
    const error = errors[field.key];
    const describedBy = error ? `${id}-error` : undefined;
    if (field.key !== 'siteStatus' && WEBSITE_DEPENDENTS.includes(field.key) && hasNoWebsite(answers)) return null;

    if (field.kind === 'text') {
      const disabled = field.key === 'website' && answers.noWebsite;
      return (
        <div key={field.key} className="space-y-2">
          <label htmlFor={id} className={labelClass}>
            {field.label}
            {field.required && <span aria-hidden="true" className="text-brand"> *</span>}
          </label>
          <input
            id={id}
            type={field.inputType ?? 'text'}
            value={String(answers[field.key] ?? '')}
            onChange={(e) => set({ [field.key]: e.target.value })}
            placeholder={field.placeholder}
            autoComplete={field.autoComplete ?? 'off'}
            maxLength={field.maxLength}
            required={field.required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={fieldClass}
          />
          {field.key === 'website' && (
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={answers.noWebsite}
                onChange={(e) => set({ noWebsite: e.target.checked })}
                className="w-4 h-4 accent-[var(--c-primary)]"
              />
              I don’t have a website
            </label>
          )}
          {error && <FieldError id={`${id}-error`} message={error} />}
        </div>
      );
    }

    if (field.kind === 'select') {
      return (
        <div key={field.key} className="space-y-2">
          <label htmlFor={id} className={labelClass}>
            {field.label}
          </label>
          <select
            id={id}
            value={String(answers[field.key] ?? '')}
            onChange={(e) => set({ [field.key]: e.target.value })}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={`${fieldClass} cursor-pointer`}
          >
            <option value="" disabled className="bg-surface text-fg">
              Choose one…
            </option>
            {field.options.map((o) => (
              <option key={o} value={o} className="bg-surface text-fg">
                {o}
              </option>
            ))}
          </select>
          {error && <FieldError id={`${id}-error`} message={error} />}
        </div>
      );
    }

    // Multi-select chips
    const selected = answers[field.key] as string[];
    const toggle = (option: string) => {
      // "None" can't be combined with anything else
      let list = selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option];
      if (option === 'None' && list.includes('None')) list = ['None'];
      else list = list.filter((o) => o !== 'None' || option === 'None');
      set({ [field.key]: list });
    };
    return (
      <fieldset key={field.key} className="space-y-2 sm:col-span-2">
        <legend className={labelClass}>
          {field.label} {field.hint && <span className="font-normal text-muted">({field.hint})</span>}
        </legend>
        <div id={id} className="flex flex-wrap gap-2 pt-1">
          {field.options.map((o) => {
            const on = selected.includes(o);
            return (
              <button
                key={o}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(o)}
                className={`inline-flex items-center gap-1.5 min-h-11 px-4 py-2 rounded-full border text-sm transition-colors cursor-pointer ${
                  on ? 'bg-primary text-on-primary border-primary' : 'bg-canvas text-fg border-line hover:border-primary'
                }`}
              >
                {on && <Check aria-hidden="true" className="w-4 h-4" />}
                {o}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  };

  const current = STEPS[step];
  const progress = Math.round(((step + 1) / total) * 100);

  return (
    <section className="bg-surface border border-line rounded-card p-5 sm:p-8 scroll-mt-28" aria-labelledby="audit-step-heading">
      {/* Progress */}
      <div className="space-y-2 mb-6">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Step {step + 1} of {total}
          </span>
          <span>{progress}%</span>
        </div>
        <div
          className="h-2 rounded-full bg-surface-2 overflow-hidden"
          role="progressbar"
          aria-label="Audit progress"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={step + 1}
        >
          <div className="h-full bg-primary rounded-full transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <form onSubmit={next} noValidate>
        <div key={step} className="animate-pop-in space-y-6">
          <div className="space-y-1">
            <h2 id="audit-step-heading" ref={headingRef} tabIndex={-1} className="type-h3 text-fg outline-none">
              {isFinal ? 'Almost done' : current.title}
            </h2>
            <p className="text-muted">
              {isFinal ? 'We turn your answers into a one-page audit you can download and share.' : current.intro}
            </p>
          </div>

          {!isFinal ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {current.fields.map(renderField)}
              {errors.links && (
                <div className="sm:col-span-2">
                  <FieldError id="audit-links-error" message={errors.links} />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <label className="flex items-start gap-3 p-4 bg-canvas border border-line rounded-btn cursor-pointer">
                <input
                  type="checkbox"
                  checked={answers.consent}
                  onChange={(e) => set({ consent: e.target.checked })}
                  className="w-5 h-5 mt-0.5 accent-[var(--c-primary)] shrink-0"
                />
                <span className="text-fg">Send my audit to my email and let RMAST Studio contact me.</span>
              </label>
              {/* Spam trap: hidden from people, often filled in by bots */}
              <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
                <label htmlFor="audit-fax">Fax</label>
                <input id="audit-fax" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mt-8">
          {step > 0 ? (
            <button type="button" onClick={back} className="btn btn-secondary inline-flex items-center justify-center gap-2 cursor-pointer">
              <ArrowLeft aria-hidden="true" className="w-4 h-4" />
              Back
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="btn btn-primary inline-flex items-center justify-center gap-2 cursor-pointer">
            {isFinal ? (
              <>
                <Sparkles aria-hidden="true" className="w-4 h-4" />
                Generate my free audit
              </>
            ) : (
              <>
                Next
                <ArrowRight aria-hidden="true" className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

const FieldError: React.FC<{ id: string; message: string }> = ({ id, message }) => (
  <p id={id} role="alert" className="text-sm text-brand">
    {message}
  </p>
);
