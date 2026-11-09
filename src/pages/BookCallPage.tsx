import React, { useEffect, useState } from 'react';
import { CalendarCheck, Check } from 'lucide-react';
import { BookingDialog } from '../components/booking/BookingDialog';
import type { BookingPrefill } from '../data/records';
import { fetchBookingPrefill } from '../lib/api';
import { CONTACT, whatsappLink } from '../config/contact';

const WHAT_HAPPENS = [
  '15 minutes on Google Meet, Zoom, WhatsApp or a phone call',
  'We go through what’s costing you leads and what to fix first',
  'You talk directly with the founders',
  'Free, with no obligation'
];

// "Book a call": the booking popup opens straight away. Links from the audit email carry ?audit=<token>
// so the popup is prefilled with what the visitor already told us.
export const BookCallPage: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<Partial<BookingPrefill> | undefined>(undefined);

  useEffect(() => {
    setOpen(true);
    const token = new URLSearchParams(window.location.search).get('audit');
    if (token) {
      fetchBookingPrefill(token)
        .then(setPrefill)
        .catch(() => undefined); // an old or broken link just means an empty form
    }
  }, []);

  return (
    <div className="pt-30 pb-24 px-4 sm:px-6">
      <div className="max-w-site mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <section className="lg:col-span-7 space-y-6">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">Book a call</span>
          <h1 className="type-h1 text-fg">Book a free 15-minute call.</h1>
          <p className="text-base sm:text-lg text-muted leading-relaxed">
            Pick a time that suits you. Times are shown in your own time zone.
          </p>
          <button type="button" onClick={() => setOpen(true)} className="btn btn-primary inline-flex items-center gap-2 cursor-pointer">
            <CalendarCheck aria-hidden="true" className="w-5 h-5" />
            Book a Free Call
          </button>
          <p className="text-sm text-muted">
            Prefer to message? WhatsApp{' '}
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="text-brand underline">
              {CONTACT.whatsappDisplay}
            </a>{' '}
            or email{' '}
            <a href={`mailto:${CONTACT.email}`} className="text-brand underline">
              {CONTACT.email}
            </a>
            .
          </p>
        </section>
        <aside className="lg:col-span-5 p-6 bg-surface border border-line rounded-card space-y-4">
          <h2 className="type-h4 text-fg">What happens on the call</h2>
          <ul className="space-y-3 text-muted">
            {WHAT_HAPPENS.map((w) => (
              <li key={w} className="flex items-start gap-3">
                <Check aria-hidden="true" className="w-5 h-5 mt-0.5 text-brand shrink-0" />
                {w}
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <BookingDialog open={open} onClose={() => setOpen(false)} prefill={prefill} />
    </div>
  );
};
