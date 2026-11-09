import React, { useEffect, useState } from 'react';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { BOOKING_STATUS_LABELS, formatSlot } from '../data/booking/calendar';
import type { PublicBooking } from '../data/records';
import { SlotPicker, detectTimeZone } from '../components/booking/SlotPicker';
import { cancelManagedBooking, fetchManagedBooking, fetchRescheduleSlots, rescheduleManagedBooking } from '../lib/api';
import { Link } from '../components/common/Link';
import { CONTACT } from '../config/contact';

// The visitor's own link from their confirmation email: /booking/<token>. Shows the booking and lets them
// pick a new time or cancel. The token is the only key, and it is never shown anywhere else.
export const ManageBookingPage: React.FC = () => {
  const token = typeof window === 'undefined' ? '' : decodeURIComponent(window.location.pathname.split('/')[2] ?? '');
  const [booking, setBooking] = useState<PublicBooking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'reschedule'>('view');
  const [slots, setSlots] = useState<number[] | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [timeZone, setTimeZone] = useState(detectTimeZone);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchManagedBooking(token)
      .then((b) => {
        setBooking(b);
        setTimeZone(b.visitorTimezone || detectTimeZone());
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'This booking link is not valid.'));
  }, [token]);

  const openReschedule = async () => {
    setMode('reschedule');
    setNotice(null);
    setSlots(null);
    try {
      const { slots: list } = await fetchRescheduleSlots(token);
      setSlots(list.map((s) => Date.parse(s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load open times.');
    }
  };

  const confirmReschedule = async () => {
    if (slot === null) return;
    setBusy(true);
    setNotice(null);
    try {
      const updated = await rescheduleManagedBooking(token, new Date(slot).toISOString());
      setBooking(updated);
      setMode('view');
      setNotice('Done. Your new time is confirmed, and we’ve emailed you an updated invite.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not change the time.');
      void openReschedule();
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!confirm('Cancel this call?')) return;
    setBusy(true);
    try {
      setBooking(await cancelManagedBooking(token));
      setNotice('Your call is cancelled. We’ve emailed you a confirmation.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Could not cancel.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-30 pb-24 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-brand">Your booking</span>
        <h1 className="type-h2 text-fg">Manage your call</h1>

        {error && (
          <div className="p-5 bg-surface border border-line rounded-card space-y-3" role="alert">
            <p className="text-fg">{error}</p>
            <p className="text-muted">
              Need help? Email{' '}
              <a href={`mailto:${CONTACT.email}`} className="text-brand underline">
                {CONTACT.email}
              </a>
              .
            </p>
          </div>
        )}
        {!booking && !error && (
          <p className="flex items-center gap-2 text-muted" role="status">
            <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" /> Loading your booking…
          </p>
        )}

        {booking && (
          <section className="p-6 bg-surface border border-line rounded-card space-y-5">
            <div className="flex items-start gap-3">
              <CalendarCheck aria-hidden="true" className="w-6 h-6 text-brand shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-lg font-semibold text-fg">{formatSlot(Date.parse(booking.slotStart), timeZone)}</p>
                <p className="text-muted">
                  {booking.meetingType} · {booking.business} · <span className="text-fg">{BOOKING_STATUS_LABELS[booking.status]}</span>
                </p>
              </div>
            </div>
            {notice && (
              <p className="text-fg" role="status">
                {notice}
              </p>
            )}

            {booking.canChange && mode === 'view' && (
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={openReschedule} disabled={busy} className="btn btn-primary cursor-pointer">
                  Pick a new time
                </button>
                <button type="button" onClick={cancel} disabled={busy} className="btn btn-secondary cursor-pointer">
                  Cancel the call
                </button>
              </div>
            )}

            {booking.canChange && mode === 'reschedule' && (
              <div className="space-y-5">
                {slots === null ? (
                  <p className="flex items-center gap-2 text-muted" role="status">
                    <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" /> Loading open times…
                  </p>
                ) : (
                  <SlotPicker slots={slots} value={slot} onChange={setSlot} timeZone={timeZone} onTimeZoneChange={setTimeZone} idPrefix="manage" />
                )}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button type="button" onClick={confirmReschedule} disabled={busy || slot === null} className="btn btn-primary cursor-pointer disabled:opacity-60">
                    {busy ? 'Saving…' : 'Confirm new time'}
                  </button>
                  <button type="button" onClick={() => setMode('view')} className="btn btn-secondary cursor-pointer">
                    Keep my current time
                  </button>
                </div>
              </div>
            )}

            {!booking.canChange && booking.status !== 'cancelled' && <p className="text-muted">This call can no longer be changed online. Please email us if you need help.</p>}
            {booking.status === 'cancelled' && (
              <Link to="/book-a-call" className="btn btn-primary inline-flex">
                Book a new time
              </Link>
            )}
          </section>
        )}
      </div>
    </div>
  );
};
