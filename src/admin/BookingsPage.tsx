import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarClock, Mail, MessageCircle, Phone, Plus, Send, Settings2, X } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import {
  BOOKING_STATUSES,
  BOOKING_STATUS_LABELS,
  MEETING_TYPES,
  PKT_ZONE,
  SLOT_LENGTHS,
  dayKey,
  formatDay,
  formatSlot,
  formatTime,
  type Availability,
  type BookingStatus
} from '../data/booking/calendar';
import type { AuditLead, CallBooking } from '../data/records';
import { adminApi } from './api';
import { useAdmin } from './AdminApp';
import { AssistantPill, BackLink, Item, ScoreBadge, waHref } from './AuditsPage';
import { Button, Card, CardHeader, ErrorNote, PageHeader, Spinner, formatDateTime } from './ui';

const selectClass =
  'px-3 py-2 text-sm bg-[#0B0C10] border border-[#2E3040] rounded-md text-[#ECEAE5] outline-none focus:border-[#C9A96E] cursor-pointer';
const inputClass =
  'px-3 py-2 text-sm bg-[#0B0C10] border border-[#2E3040] rounded-md text-[#ECEAE5] placeholder:text-[#6E7180] outline-none focus:border-[#C9A96E]';

const STATUS_DOT: Record<BookingStatus, string> = {
  scheduled: 'bg-[#60A5FA]',
  rescheduled: 'bg-[#FBBF24]',
  completed: 'bg-[#4ADE80]',
  'no-show': 'bg-[#F87171]',
  cancelled: 'bg-[#6E7180]'
};

export const BookingsPage: React.FC<{ path: string }> = ({ path }) => {
  const id = path.split('/')[3];
  if (id === 'availability') return <AvailabilitySettings />;
  return id ? <BookingDetail id={decodeURIComponent(id)} /> : <BookingList />;
};

// ---------------------------------------------------------------------------
// List (agenda grouped by day, times in PKT)
// ---------------------------------------------------------------------------

const BookingList: React.FC = () => {
  const { navigate } = useNavigation();
  const { onUnauthorized } = useAdmin();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [filters, setFilters] = useState({ status: '', type: '', from: '', to: '' });
  const [items, setItems] = useState<CallBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setItems(null);
    adminApi
      .bookings({ tab, ...filters })
      .then((list) => !cancelled && (setItems(list), setError(null)))
      .catch((err) => !cancelled && !onUnauthorized(err) && setError(err instanceof Error ? err.message : 'Could not load bookings'));
    return () => {
      cancelled = true;
    };
  }, [tab, filters, onUnauthorized]);

  const groups = new Map<string, CallBooking[]>();
  for (const b of items ?? []) {
    const key = dayKey(Date.parse(b.slotStart), PKT_ZONE);
    groups.set(key, [...(groups.get(key) ?? []), b]);
  }
  const set = (key: keyof typeof filters) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFilters({ ...filters, [key]: e.target.value });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bookings"
        subtitle="Calls booked from the website. Times are in Pakistan time (PKT)."
        action={
          <Button onClick={() => navigate('/admin/bookings/availability')}>
            <Settings2 className="w-4 h-4" />
            Availability
          </Button>
        }
      />
      <ErrorNote message={error} />

      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Bookings" className="inline-flex p-1 bg-[#111218] border border-[#22232D] rounded-md">
          {(['upcoming', 'past'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm rounded cursor-pointer ${tab === t ? 'bg-[#1A1B24] text-[#ECEAE5] font-medium' : 'text-[#A6A8B3] hover:text-[#ECEAE5]'}`}
            >
              {t === 'upcoming' ? 'Upcoming' : 'Past'}
            </button>
          ))}
        </div>
        <select aria-label="Status" value={filters.status} onChange={set('status')} className={selectClass}>
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {BOOKING_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select aria-label="Meeting type" value={filters.type} onChange={set('type')} className={selectClass}>
          <option value="">All meeting types</option>
          {MEETING_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <input aria-label="From date (PKT)" type="date" value={filters.from} onChange={set('from')} className={inputClass} />
        <input aria-label="To date (PKT)" type="date" value={filters.to} onChange={set('to')} className={inputClass} />
      </div>

      {!items ? (
        <Spinner />
      ) : items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-[#8B8D98]">{tab === 'upcoming' ? 'No upcoming calls.' : 'No past calls yet.'}</Card>
      ) : (
        <div className="space-y-5">
          {[...groups.entries()].map(([key, list]) => (
            <section key={key}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[#C9A96E] mb-2">{formatDay(Date.parse(list[0].slotStart), PKT_ZONE)}</h2>
              <Card className="overflow-hidden">
                <ul className="divide-y divide-[#1F2029]" role="list">
                  {list.map((b) => (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/bookings/${encodeURIComponent(b.id)}`)}
                        className="w-full grid grid-cols-1 md:grid-cols-[6rem_1fr_auto] gap-1 md:gap-4 px-4 py-3 text-left hover:bg-[#15161D] cursor-pointer"
                      >
                        <span className="font-semibold tabular-nums">{formatTime(Date.parse(b.slotStart), PKT_ZONE)}</span>
                        <span className="min-w-0">
                          <span className="block font-medium truncate">
                            {b.business} <span className="font-normal text-[#A6A8B3]">· {b.name}</span>
                          </span>
                          <span className="block text-sm text-[#8B8D98] truncate">
                            {b.meetingType} · {b.topics.join(', ')}
                          </span>
                        </span>
                        <span className="flex flex-wrap items-center gap-2">
                          <ScoreBadge score={b.auditScore} />
                          <AssistantPill id={b.auditMainAssistant} />
                          <span className="inline-flex items-center gap-1.5 text-xs text-[#A6A8B3]">
                            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[b.status]}`} />
                            {BOOKING_STATUS_LABELS[b.status]}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </Card>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

const BookingDetail: React.FC<{ id: string }> = ({ id }) => {
  const { navigate } = useNavigation();
  const { onUnauthorized } = useAdmin();
  const [booking, setBooking] = useState<CallBooking | null>(null);
  const [audit, setAudit] = useState<AuditLead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fail = useCallback((err: unknown) => {
    if (!onUnauthorized(err)) setError(err instanceof Error ? err.message : 'Something went wrong');
  }, [onUnauthorized]);

  const load = useCallback(() => {
    adminApi
      .booking(id)
      .then(({ booking: b, audit: a }) => {
        setBooking(b);
        setAudit(a);
        setLink(b.meetingLink);
        setNotes(b.adminNotes);
      })
      .catch(fail);
  }, [id, fail]);
  useEffect(load, [load]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const setStatus = async (status: BookingStatus) => {
    if (!booking) return;
    setError(null);
    const previous = booking.status;
    setBooking({ ...booking, status });
    try {
      await adminApi.updateBooking(booking.id, { status });
    } catch (err) {
      setBooking({ ...booking, status: previous });
      fail(err);
    }
  };

  const onNotes = (value: string) => {
    setNotes(value);
    setSaved('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        await adminApi.updateBooking(id, { adminNotes: value });
        setSaved('saved');
      } catch (err) {
        setSaved('idle');
        fail(err);
      }
    }, 700);
  };

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setNotice(null);
    try {
      await adminApi.sendMeetingLink(id, link.trim());
      setNotice(`Meeting link emailed to ${booking?.email}.`);
      load();
    } catch (err) {
      fail(err);
    } finally {
      setSending(false);
    }
  };

  if (!booking) {
    return error ? (
      <div className="space-y-4">
        <BackLink onClick={() => navigate('/admin/bookings')} label="All bookings" />
        <ErrorNote message={error} />
      </div>
    ) : (
      <Spinner />
    );
  }

  const start = Date.parse(booking.slotStart);
  const wa = waHref(booking.phone);

  return (
    <div className="space-y-6">
      <BackLink onClick={() => navigate('/admin/bookings')} label="All bookings" />
      <PageHeader
        title={`${booking.business}: ${formatTime(start, PKT_ZONE)} PKT`}
        subtitle={`${formatDay(start, PKT_ZONE)} · ${booking.meetingType} · booked ${formatDateTime(booking.createdAt)}`}
        action={
          <select aria-label="Status" value={booking.status} onChange={(e) => setStatus(e.target.value as BookingStatus)} className={selectClass}>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {BOOKING_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        }
      />
      <ErrorNote message={error} />
      {notice && (
        <p role="status" className="text-sm text-[#86EFAC] bg-[#0F2A1B] border border-[#1C4A30] px-3 py-2 rounded-md">
          {notice}
        </p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Booking" />
            <div className="px-5 pb-5 space-y-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Item label="Name" value={`${booking.name} (${booking.role})`} />
                <Item label="Email" value={booking.email} />
                <Item label="Phone / WhatsApp" value={booking.phone} />
                <Item label="Their time" value={formatSlot(start, booking.visitorTimezone)} />
                <Item label="Topics" value={booking.topics.join(', ')} />
                <Item label="Their note" value={booking.notes || '—'} />
              </dl>
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${booking.email}`} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-[#16171F] border border-[#2E3040] hover:border-[#C9A96E]/60">
                  <Mail className="w-4 h-4" /> Email
                </a>
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-[#16171F] border border-[#2E3040] hover:border-[#C9A96E]/60">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                <a href={`tel:${booking.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-[#16171F] border border-[#2E3040] hover:border-[#C9A96E]/60">
                  <Phone className="w-4 h-4" /> Call
                </a>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Meeting link"
              subtitle={booking.meetingLinkSentAt ? `Sent ${formatDateTime(booking.meetingLinkSentAt)}` : 'Paste the Google Meet or Zoom link, then send it.'}
            />
            <form onSubmit={sendLink} className="px-5 pb-5 flex flex-col sm:flex-row gap-2">
              <input
                aria-label="Meeting link"
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://meet.google.com/…"
                className={`${inputClass} flex-1`}
              />
              <Button type="submit" variant="primary" loading={sending} disabled={!link.trim()}>
                {!sending && <Send className="w-4 h-4" />}
                Send meeting link
              </Button>
            </form>
          </Card>

          <Card>
            <CardHeader title="Admin notes" subtitle={saved === 'saving' ? 'Saving…' : saved === 'saved' ? 'Saved' : 'Only you can see these. They save automatically.'} />
            <div className="px-5 pb-5">
              <textarea aria-label="Admin notes" value={notes} onChange={(e) => onNotes(e.target.value)} rows={4} className={`${inputClass} w-full resize-y`} />
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Linked audit"
            action={
              audit ? (
                <Button variant="ghost" onClick={() => navigate(`/admin/audits/${encodeURIComponent(audit.id)}`)}>
                  Open audit
                </Button>
              ) : undefined
            }
          />
          <div className="px-5 pb-5 space-y-4">
            {audit ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <ScoreBadge score={audit.overallScore} />
                  <AssistantPill id={audit.mainAssistant} />
                </div>
                {audit.pngUrl && <img src={audit.pngUrl} alt={`Audit image for ${audit.businessName}`} className="w-full max-w-xs rounded-md border border-[#22232D]" loading="lazy" />}
                <ul className="space-y-2 text-sm text-[#A6A8B3]">
                  {audit.result.cards.map((c) => (
                    <li key={c.id}>
                      <span className="font-medium text-[#ECEAE5]">
                        {c.title} {c.score}/10:
                      </span>{' '}
                      {c.problem.replace(/\*\*/g, '')}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-sm text-[#8B8D98]">This call was booked without a Free Audit.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Availability settings (working hours in PKT)
// ---------------------------------------------------------------------------

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const AvailabilitySettings: React.FC = () => {
  const { navigate } = useNavigation();
  const { onUnauthorized } = useAdmin();
  const [a, setA] = useState<Availability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newDate, setNewDate] = useState('');

  useEffect(() => {
    adminApi
      .availability()
      .then(setA)
      .catch((err) => !onUnauthorized(err) && setError(err instanceof Error ? err.message : 'Could not load settings'));
  }, [onUnauthorized]);

  if (!a) return error ? <ErrorNote message={error} /> : <Spinner />;

  const update = (patch: Partial<Availability>) => {
    setA({ ...a, ...patch });
    setSaved(false);
  };
  const setDay = (d: number, patch: Partial<Availability['weekly'][number]>) =>
    update({ weekly: a.weekly.map((w, i) => (i === d ? { ...w, ...patch } : w)) });

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      setA(await adminApi.saveAvailability(a));
      setSaved(true);
    } catch (err) {
      if (!onUnauthorized(err)) setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <BackLink onClick={() => navigate('/admin/bookings')} label="All bookings" />
      <PageHeader
        title="Availability"
        subtitle="When visitors can book a call. Hours are Pakistan time (PKT); visitors see them in their own time zone."
        action={
          <Button variant="primary" onClick={save} loading={saving}>
            {saved ? 'Saved' : 'Save changes'}
          </Button>
        }
      />
      <ErrorNote message={error} />

      <Card>
        <CardHeader title="Weekly hours (PKT)" subtitle="An end time earlier than the start runs past midnight, e.g. 18:00 to 02:00." />
        <ul className="px-5 pb-5 space-y-2" role="list">
          {DAY_ORDER.map((d) => {
            const w = a.weekly[d];
            return (
              <li key={d} className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 w-36 cursor-pointer">
                  <input type="checkbox" checked={w.on} onChange={(e) => setDay(d, { on: e.target.checked })} className="w-4 h-4 accent-[#C9A96E]" />
                  <span className="text-sm">{DAY_NAMES[d]}</span>
                </label>
                <input aria-label={`${DAY_NAMES[d]} start`} type="time" value={w.start} disabled={!w.on} onChange={(e) => setDay(d, { start: e.target.value })} className={`${inputClass} disabled:opacity-40`} />
                <span className="text-sm text-[#8B8D98]">to</span>
                <input aria-label={`${DAY_NAMES[d]} end`} type="time" value={w.end} disabled={!w.on} onChange={(e) => setDay(d, { end: e.target.value })} className={`${inputClass} disabled:opacity-40`} />
                {!w.on && <span className="text-xs text-[#6E7180]">Closed</span>}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <CardHeader title="Booking rules" />
        <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#A6A8B3] block">Call length</span>
            <select value={a.slotMinutes} onChange={(e) => update({ slotMinutes: Number(e.target.value) })} className={`${selectClass} w-full`}>
              {SLOT_LENGTHS.map((m) => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#A6A8B3] block">Break between calls (minutes)</span>
            <input type="number" min={0} max={120} value={a.bufferMinutes} onChange={(e) => update({ bufferMinutes: Number(e.target.value) })} className={`${inputClass} w-full`} />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#A6A8B3] block">Minimum notice (hours)</span>
            <input type="number" min={0} max={168} value={a.minNoticeHours} onChange={(e) => update({ minNoticeHours: Number(e.target.value) })} className={`${inputClass} w-full`} />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs font-medium text-[#A6A8B3] block">How many days ahead people can book</span>
            <input type="number" min={1} max={90} value={a.daysAhead} onChange={(e) => update({ daysAhead: Number(e.target.value) })} className={`${inputClass} w-full`} />
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader title="Blocked dates" subtitle="Holidays, exams or days off. That day's hours are closed (PKT dates)." />
        <div className="px-5 pb-5 space-y-3">
          <div className="flex gap-2">
            <input aria-label="Date to block" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className={inputClass} />
            <Button
              onClick={() => {
                if (newDate && !a.blockedDates.includes(newDate)) update({ blockedDates: [...a.blockedDates, newDate].sort() });
                setNewDate('');
              }}
              disabled={!newDate}
            >
              <Plus className="w-4 h-4" />
              Block date
            </Button>
          </div>
          {a.blockedDates.length ? (
            <ul className="flex flex-wrap gap-2" role="list">
              {a.blockedDates.map((d) => (
                <li key={d} className="inline-flex items-center gap-1 pl-3 pr-1 py-1 text-sm rounded-full bg-[#16171F] border border-[#2E3040]">
                  {new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}
                  <button
                    type="button"
                    aria-label={`Unblock ${d}`}
                    onClick={() => update({ blockedDates: a.blockedDates.filter((x) => x !== d) })}
                    className="p-1 rounded-full text-[#A6A8B3] hover:text-[#ECEAE5] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[#8B8D98]">No blocked dates.</p>
          )}
        </div>
      </Card>
    </div>
  );
};

// Upcoming-call counters for the dashboard home
export const UpcomingCalls: React.FC = () => {
  const { navigate } = useNavigation();
  const [summary, setSummary] = useState<{ today: number; week: number } | null>(null);
  useEffect(() => {
    adminApi
      .bookingSummary()
      .then(setSummary)
      .catch(() => undefined);
  }, []);
  return (
    <button
      type="button"
      onClick={() => navigate('/admin/bookings')}
      className="w-full text-left bg-[#111218] border border-[#22232D] rounded-lg p-4 flex items-center gap-4 hover:border-[#C9A96E]/50 cursor-pointer"
    >
      <CalendarClock className="w-5 h-5 text-[#C9A96E] shrink-0" />
      <span className="flex-1 text-sm text-[#A6A8B3]">Upcoming calls</span>
      <span className="text-sm">
        <span className="text-2xl font-semibold tabular-nums text-[#ECEAE5]">{summary?.today ?? '–'}</span> <span className="text-[#8B8D98]">today</span>
      </span>
      <span className="text-sm">
        <span className="text-2xl font-semibold tabular-nums text-[#ECEAE5]">{summary?.week ?? '–'}</span> <span className="text-[#8B8D98]">next 7 days</span>
      </span>
    </button>
  );
};
