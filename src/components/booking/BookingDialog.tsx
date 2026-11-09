import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarCheck, CalendarPlus, Check, Download, Loader2, X } from 'lucide-react';
import { ROLES } from '../../data/audit/questions';
import { EMAIL_RE } from '../../data/audit/validate';
import {
  BOOKING_TOPICS,
  buildIcs,
  formatSlot,
  googleCalendarLink,
  MEETING_TYPES,
  TOPIC_FOR_ASSISTANT
} from '../../data/booking/calendar';
import type { BookingPrefill } from '../../data/records';
import { CONTACT } from '../../config/contact';
import { createBooking, fetchSlots, ApiError } from '../../lib/api';
import { SlotPicker, detectTimeZone } from './SlotPicker';

const fieldClass =
  'w-full bg-canvas border border-line rounded-btn px-4 py-3 text-base text-fg placeholder-subtle focus:outline-none focus:border-primary transition-colors';
const labelClass = 'text-sm font-medium text-fg block';

// Phone codes for the visitor's country, used when the number they gave has none
const DIAL_CODES: Record<string, string> = { 'United States': '+1', Canada: '+1', UAE: '+971' };

function withCountryCode(phone: string, country: string): string {
  const p = phone.trim();
  if (!p || p.startsWith('+')) return p;
  const code = DIAL_CODES[country];
  return code ? `${code} ${p}` : p;
}

interface Props {
  open: boolean;
  onClose: () => void;
  prefill?: Partial<BookingPrefill>;
}

type Done = { start: number; end: number; meetingType: string };

// Popup booking card: prefilled from the audit, slots in the visitor's time zone, success view with calendar links
export const BookingDialog: React.FC<Props> = ({ open, onClose, prefill }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [form, setForm] = useState({
    name: '',
    business: '',
    email: '',
    phone: '',
    role: '',
    meetingType: 'Google Meet',
    notes: '',
    consent: false
  });
  const [topics, setTopics] = useState<string[]>([]);
  const [timeZone, setTimeZone] = useState(detectTimeZone);
  const [slots, setSlots] = useState<number[] | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  // Prefill from the audit whenever it arrives (every field stays editable)
  useEffect(() => {
    if (!prefill) return;
    setForm((f) => ({
      ...f,
      name: prefill.name ?? f.name,
      business: prefill.business ?? f.business,
      email: prefill.email ?? f.email,
      phone: withCountryCode(prefill.phone ?? f.phone, prefill.country ?? ''),
      role: prefill.role && (ROLES as readonly string[]).includes(prefill.role) ? prefill.role : f.role
    }));
    if (prefill.mainAssistant) setTopics((t) => (t.length ? t : [TOPIC_FOR_ASSISTANT[prefill.mainAssistant!]]));
  }, [prefill]);

  const loadSlots = useCallback(async () => {
    setSlotError(null);
    try {
      const { slots: list } = await fetchSlots();
      const ms = list.map((s) => Date.parse(s));
      setSlots(ms);
      setSlot((current) => (current !== null && ms.includes(current) ? current : null));
    } catch {
      setSlots([]);
      setSlotError(`Booking isn’t available right now. Please email ${CONTACT.email} or message us on WhatsApp.`);
    }
  }, []);

  useEffect(() => {
    if (open && !done) void loadSlots();
  }, [open, done, loadSlots]);

  // Focus handling: move into the card, trap Tab inside it, close on Escape, give focus back on close
  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => dialogRef.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus(), 30);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select, textarea')
      ].filter((el) => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
      returnFocus.current?.focus?.();
    };
  }, [open, onClose]);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [field]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value });

  const toggleTopic = (t: string) => setTopics((list) => (list.includes(t) ? list.filter((x) => x !== t) : [...list, t]));

  const problem = (): string | null => {
    if (!form.name.trim()) return 'Please add your name.';
    if (!form.business.trim()) return 'Please add your business name.';
    if (!EMAIL_RE.test(form.email.trim())) return 'Please enter a valid email address.';
    if (!/^\+\d[\d\s().-]{6,}$/.test(form.phone.trim())) return 'Please add your phone or WhatsApp number with the country code, e.g. +1 555 123 4567.';
    if (!form.role) return 'Please choose your role.';
    if (!topics.length) return 'Please choose what you want to discuss.';
    if (slot === null) return 'Please pick a day and time.';
    if (!form.consent) return 'Please agree to be contacted about your booking.';
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const issue = problem();
    setError(issue);
    if (issue || slot === null) return;
    setLoading(true);
    try {
      const res = await createBooking({
        name: form.name.trim(),
        business: form.business.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        topics,
        meetingType: form.meetingType,
        slotStart: new Date(slot).toISOString(),
        timezone: timeZone,
        notes: form.notes.trim(),
        consent: form.consent,
        auditToken: prefill?.auditToken || undefined,
        fax: honeypot
      });
      setDone({ start: Date.parse(res.slotStart), end: Date.parse(res.slotEnd), meetingType: res.meetingType });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
      // The time may have just been taken: refresh the open times
      if (err instanceof ApiError && err.status === 409) void loadSlots();
    } finally {
      setLoading(false);
    }
  };

  const invite = useMemo(
    () =>
      done && {
        uid: `rmast-${done.start}`,
        start: done.start,
        end: done.end,
        title: 'Free call with RMAST Studio',
        description: `Your free 15-minute call with RMAST Studio (${done.meetingType}). We'll send the meeting link before the call.`,
        location: done.meetingType
      },
    [done]
  );
  const icsHref = useMemo(() => (invite ? `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(invite))}` : ''), [invite]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-stretch sm:items-center justify-center sm:p-6">
      <button type="button" aria-label="Close booking" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-scrim backdrop-blur-sm cursor-default" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-title"
        className="relative w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[92vh] overflow-y-auto bg-surface text-fg sm:border border-line sm:rounded-card shadow-2xl animate-pop-in"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 sm:px-7 py-4 bg-surface border-b border-line">
          <h2 id="booking-title" className="type-h4 text-fg flex items-center gap-2">
            <CalendarCheck aria-hidden="true" className="w-5 h-5 text-brand" />
            {done ? 'You’re booked!' : 'Book a free call'}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 -mr-2 rounded-btn text-muted hover:text-fg cursor-pointer" data-autofocus={done ? true : undefined}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {done && invite ? (
          <div className="px-5 sm:px-7 py-8 space-y-6" role="status">
            <div className="flex items-start gap-3">
              <span className="mt-1 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
                <Check aria-hidden="true" className="w-5 h-5" />
              </span>
              <div className="space-y-2">
                <p className="text-lg font-semibold text-fg">{formatSlot(done.start, timeZone)}</p>
                <p className="text-muted">
                  {done.meetingType}. We’ve emailed you a confirmation with a calendar invite, and we’ll send the meeting link before the call.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={googleCalendarLink(invite)} target="_blank" rel="noopener noreferrer" className="btn btn-primary inline-flex items-center justify-center gap-2">
                <CalendarPlus aria-hidden="true" className="w-4 h-4" />
                Add to Google Calendar
              </a>
              <a href={icsHref} download="rmast-call.ics" className="btn btn-secondary inline-flex items-center justify-center gap-2">
                <Download aria-hidden="true" className="w-4 h-4" />
                Download .ics
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="px-5 sm:px-7 py-6 space-y-6">
            <p className="text-muted">15 minutes with the founders. We’ll walk you through your fixes. No pressure.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field id="book-name" label="Full name">
                <input id="book-name" data-autofocus value={form.name} onChange={set('name')} autoComplete="name" maxLength={120} className={fieldClass} />
              </Field>
              <Field id="book-business" label="Business name">
                <input id="book-business" value={form.business} onChange={set('business')} autoComplete="organization" maxLength={120} className={fieldClass} />
              </Field>
              <Field id="book-email" label="Email">
                <input id="book-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" maxLength={200} className={fieldClass} />
              </Field>
              <Field id="book-phone" label="Phone / WhatsApp (with country code)">
                <input id="book-phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="+1 555 123 4567" maxLength={40} className={fieldClass} />
              </Field>
              <Field id="book-role" label="Role">
                <select id="book-role" value={form.role} onChange={set('role')} className={`${fieldClass} cursor-pointer`}>
                  <option value="" disabled className="bg-surface text-fg">
                    Choose one…
                  </option>
                  {ROLES.map((r) => (
                    <option key={r} value={r} className="bg-surface text-fg">
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="book-type" label="Preferred meeting type">
                <select id="book-type" value={form.meetingType} onChange={set('meetingType')} className={`${fieldClass} cursor-pointer`}>
                  {MEETING_TYPES.map((t) => (
                    <option key={t} value={t} className="bg-surface text-fg">
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <fieldset className="space-y-2">
              <legend className={labelClass}>
                What do you want to discuss? <span className="font-normal text-muted">(tap all that apply)</span>
              </legend>
              <div className="flex flex-wrap gap-2 pt-1">
                {BOOKING_TOPICS.map((t) => {
                  const on = topics.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggleTopic(t)}
                      className={`inline-flex items-center gap-1.5 min-h-11 px-4 py-2 rounded-full border text-sm text-left cursor-pointer transition-colors ${
                        on ? 'bg-primary text-on-primary border-primary' : 'bg-canvas text-fg border-line hover:border-primary'
                      }`}
                    >
                      {on && <Check aria-hidden="true" className="w-4 h-4 shrink-0" />}
                      {t}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-2">
              <span className={labelClass}>Day and time</span>
              {slots === null ? (
                <p className="flex items-center gap-2 text-muted" role="status">
                  <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
                  Loading open times…
                </p>
              ) : slotError ? (
                <p className="text-brand" role="alert">
                  {slotError}
                </p>
              ) : (
                <SlotPicker slots={slots} value={slot} onChange={setSlot} timeZone={timeZone} onTimeZoneChange={setTimeZone} idPrefix="book" />
              )}
            </div>

            <Field id="book-notes" label="Best time to reach you / anything we should know (optional)">
              <textarea id="book-notes" value={form.notes} onChange={set('notes')} maxLength={300} rows={3} className={`${fieldClass} resize-y`} />
              <span className="block text-right text-xs text-subtle">{form.notes.length}/300</span>
            </Field>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.consent} onChange={set('consent')} className="w-5 h-5 mt-0.5 accent-[var(--c-primary)] shrink-0" />
              <span className="text-fg">I agree to be contacted about my booking</span>
            </label>

            {/* Spam trap: hidden from people, often filled in by bots */}
            <div aria-hidden="true" className="absolute -left-[9999px] w-px h-px overflow-hidden">
              <label htmlFor="book-fax">Fax</label>
              <input id="book-fax" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
            </div>

            {error && (
              <p role="alert" className="text-brand">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading || Boolean(slotError)} className="btn btn-primary w-full inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60">
              {loading && <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />}
              {loading ? 'Booking…' : 'Confirm booking'}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};

const Field: React.FC<{ id: string; label: string; children: React.ReactNode }> = ({ id, label, children }) => (
  <div className="space-y-2">
    <label htmlFor={id} className={labelClass}>
      {label}
    </label>
    {children}
  </div>
);
