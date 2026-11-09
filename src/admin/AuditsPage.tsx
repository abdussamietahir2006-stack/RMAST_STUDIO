import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Download, ExternalLink, FileDown, Mail, MessageCircle, Phone, Search, Trash2 } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { ASSISTANTS, type AssistantId } from '../data/assistantsData';
import { COUNTRIES, LINK_FIELDS, STEPS } from '../data/audit/questions';
import { LINK_LABELS, linkFor } from '../data/audit/validate';
import { PILLARS, richParts, scoreBand } from '../data/audit/scoring';
import { AUDIT_STATUSES, AUDIT_STATUS_LABELS, type AuditLead, type AuditListResponse, type AuditStatus, type CallBooking } from '../data/records';
import { BOOKING_STATUS_LABELS, formatSlot, PKT_ZONE } from '../data/booking/calendar';
import { adminApi } from './api';
import { useAdmin } from './AdminApp';
import { Button, Card, CardHeader, ErrorNote, PageHeader, Spinner, formatDateTime } from './ui';

// Shared with the Bookings page
export const ASSISTANT_PILL: Record<AssistantId, string> = {
  technical: 'bg-[#5CC2B5]/15 text-[#7DD3C7] border-[#5CC2B5]/40',
  creative: 'bg-[#F6957A]/15 text-[#F8A892] border-[#F6957A]/40',
  virtual: 'bg-[#D9A653]/15 text-[#E2B96F] border-[#D9A653]/40'
};
const SCORE_BADGE = {
  low: 'bg-[#E5484D]/15 text-[#FF8A8D] border-[#E5484D]/40',
  mid: 'bg-[#E0A23B]/15 text-[#F2C46D] border-[#E0A23B]/40',
  high: 'bg-[#3FB59F]/15 text-[#6FD3BF] border-[#3FB59F]/40'
};

export const AssistantPill: React.FC<{ id: AssistantId | null | undefined }> = ({ id }) =>
  id ? (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border whitespace-nowrap ${ASSISTANT_PILL[id]}`}>
      {PILLARS[id].name.replace(' Assistant', '')}
    </span>
  ) : null;

export const ScoreBadge: React.FC<{ score: number | null | undefined }> = ({ score }) =>
  score === null || score === undefined ? null : (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full border tabular-nums ${SCORE_BADGE[scoreBand(score)]}`}>
      {score}/100
    </span>
  );

const selectClass =
  'px-3 py-2 text-sm bg-[#0B0C10] border border-[#2E3040] rounded-md text-[#ECEAE5] outline-none focus:border-[#C9A96E] cursor-pointer';
const inputClass =
  'px-3 py-2 text-sm bg-[#0B0C10] border border-[#2E3040] rounded-md text-[#ECEAE5] placeholder:text-[#6E7180] outline-none focus:border-[#C9A96E]';

const Rich: React.FC<{ text: string }> = ({ text }) => (
  <>{richParts(text).map((p, i) => (p.bold ? <strong key={i} className="text-[#ECEAE5]">{p.text}</strong> : <React.Fragment key={i}>{p.text}</React.Fragment>))}</>
);

export const waHref = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 ? `https://wa.me/${digits}` : null;
};

// Downloads a stored PNG (falls back to opening it if the browser blocks the download)
export async function downloadFile(url: string, name: string) {
  try {
    const blob = await (await fetch(url)).blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
  } catch {
    window.open(url, '_blank', 'noopener');
  }
}

export const AuditsPage: React.FC<{ path: string }> = ({ path }) => {
  const id = path.split('/')[3];
  return id ? <AuditDetail id={decodeURIComponent(id)} /> : <AuditList />;
};

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

const SORTS = {
  newest: { sort: 'date', dir: 'desc', label: 'Newest first' },
  oldest: { sort: 'date', dir: 'asc', label: 'Oldest first' },
  'score-high': { sort: 'score', dir: 'desc', label: 'Score: high to low' },
  'score-low': { sort: 'score', dir: 'asc', label: 'Score: low to high' }
} as const;

const EMPTY_FILTERS = { q: '', assistant: '', status: '', country: '', minScore: '', maxScore: '', from: '', to: '', order: 'newest' as keyof typeof SORTS };

const AuditList: React.FC = () => {
  const { navigate } = useNavigation();
  const { onUnauthorized } = useAdmin();
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AuditListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Search waits until typing pauses
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === query ? f : { ...f, q: query })), 300);
    return () => clearTimeout(t);
  }, [query]);
  useEffect(() => setPage(1), [filters]);

  const params = useCallback(
    () => ({
      q: filters.q,
      assistant: filters.assistant,
      status: filters.status,
      country: filters.country,
      minScore: filters.minScore,
      maxScore: filters.maxScore,
      from: filters.from,
      to: filters.to,
      sort: SORTS[filters.order].sort,
      dir: SORTS[filters.order].dir
    }),
    [filters]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    adminApi
      .audits({ ...params(), page, pageSize: 25 })
      .then((d) => !cancelled && (setData(d), setError(null)))
      .catch((err) => !cancelled && !onUnauthorized(err) && setError(err instanceof Error ? err.message : 'Could not load audits'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [params, page, onUnauthorized]);

  const set = (key: keyof typeof EMPTY_FILTERS) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFilters((f) => ({ ...f, [key]: e.target.value }));

  const exportCsv = async () => {
    setExporting(true);
    try {
      const { items } = await adminApi.audits({ ...params(), all: 1 });
      const columns: [string, (a: (typeof items)[number]) => string][] = [
        ['Date', (a) => a.createdAt],
        ['Business', (a) => a.businessName],
        ['Contact', (a) => a.contactName],
        ['Role', (a) => a.role],
        ['Email', (a) => a.email],
        ['Phone', (a) => a.phone],
        ['City', (a) => a.city],
        ['Country', (a) => a.country],
        ['Business type', (a) => a.businessType],
        ['Website', (a) => a.website],
        ['Instagram', (a) => a.socials.instagram ?? ''],
        ['Score', (a) => String(a.overallScore)],
        ['Main assistant', (a) => PILLARS[a.mainAssistant].name],
        ['Status', (a) => AUDIT_STATUS_LABELS[a.status]],
        ['Consent', (a) => (a.consent ? 'yes' : 'no')],
        ['Audit PNG', (a) => a.pngUrl ?? '']
      ];
      // Cells starting with = + - @ are prefixed so spreadsheet apps don't run them as formulas
      const cell = (v: string) => `"${(/^[=+\-@]/.test(v) ? `'${v}` : v).replace(/"/g, '""')}"`;
      const csv = [columns.map(([h]) => cell(h)).join(','), ...items.map((a) => columns.map(([, get]) => cell(get(a))).join(','))].join('\r\n');
      const href = URL.createObjectURL(new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' }));
      const a = document.createElement('a');
      a.href = href;
      a.download = `free-audits-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(href), 1000);
    } catch (err) {
      if (!onUnauthorized(err)) setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const c = data?.counters;
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className={`space-y-6 transition-opacity ${loading && data ? 'opacity-70' : ''}`}>
      <PageHeader
        title="Free Audits"
        subtitle="Every self-audit from the website, with its score and main Assistant."
        action={
          <Button onClick={exportCsv} loading={exporting} disabled={!data?.total}>
            {!exporting && <FileDown className="w-4 h-4" />}
            Export CSV
          </Button>
        }
      />
      <ErrorNote message={error} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Counter label="Total audits" value={c?.total} />
        <Counter label="This week" value={c?.thisWeek} />
        <Counter label="New" value={c?.new} highlight />
        <Card className="p-4">
          <div className="text-xs text-[#8B8D98] mb-2">By main assistant</div>
          <div className="flex flex-wrap gap-2">
            {ASSISTANTS.map((a) => (
              <span key={a.id} className="inline-flex items-center gap-1.5 text-sm">
                <AssistantPill id={a.id} />
                <span className="tabular-nums text-[#ECEAE5]">{c?.byAssistant[a.id] ?? 0}</span>
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-4 space-y-3">
        <label className="relative block">
          <span className="sr-only">Search audits</span>
          <Search className="w-4 h-4 text-[#6E7180] absolute left-3 top-1/2 -translate-y-1/2" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search business, contact or email" className={`${inputClass} w-full pl-9`} />
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-2">
          <select aria-label="Main assistant" value={filters.assistant} onChange={set('assistant')} className={selectClass}>
            <option value="">All assistants</option>
            {ASSISTANTS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select aria-label="Status" value={filters.status} onChange={set('status')} className={selectClass}>
            <option value="">All statuses</option>
            {AUDIT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {AUDIT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <select aria-label="Country" value={filters.country} onChange={set('country')} className={selectClass}>
            <option value="">All countries</option>
            {COUNTRIES.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
          <input aria-label="Lowest score" type="number" min={0} max={100} placeholder="Score from" value={filters.minScore} onChange={set('minScore')} className={inputClass} />
          <input aria-label="Highest score" type="number" min={0} max={100} placeholder="Score to" value={filters.maxScore} onChange={set('maxScore')} className={inputClass} />
          <input aria-label="From date" type="date" value={filters.from} onChange={set('from')} className={inputClass} />
          <input aria-label="To date" type="date" value={filters.to} onChange={set('to')} className={inputClass} />
          <select aria-label="Sort" value={filters.order} onChange={set('order')} className={selectClass}>
            {Object.entries(SORTS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {!data ? (
        <Spinner />
      ) : data.items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-[#8B8D98]">No audits match these filters yet.</Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-[#1F2029]" role="list">
            {data.items.map((a) => {
              const site = a.website ? linkFor('website', a.website) : null;
              const insta = a.socials.instagram ? linkFor('instagram', a.socials.instagram) : null;
              return (
                <li key={a.id} className="flex flex-col md:flex-row md:items-center gap-3 px-4 py-3 hover:bg-[#15161D]">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/audits/${encodeURIComponent(a.id)}`)}
                    className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-[7rem_1fr_9rem] gap-1 md:gap-4 text-left cursor-pointer"
                  >
                    <span className="text-xs text-[#8B8D98] md:pt-0.5">{formatDateTime(a.createdAt)}</span>
                    <span className="min-w-0">
                      <span className="block font-medium text-[#ECEAE5] truncate">{a.businessName}</span>
                      <span className="block text-sm text-[#A6A8B3] truncate">
                        {a.contactName} · {[a.city, a.country].filter(Boolean).join(', ')}
                      </span>
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <ScoreBadge score={a.overallScore} />
                      <AssistantPill id={a.mainAssistant} />
                    </span>
                  </button>
                  <div className="flex items-center gap-3 md:w-56 md:justify-end">
                    <span className="text-xs text-[#A6A8B3] whitespace-nowrap">{AUDIT_STATUS_LABELS[a.status]}</span>
                    {site && (
                      <a href={site} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C9A96E] hover:underline">
                        Website
                      </a>
                    )}
                    {insta && (
                      <a href={insta} target="_blank" rel="noopener noreferrer" className="text-xs text-[#C9A96E] hover:underline">
                        Instagram
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1F2029] text-sm text-[#8B8D98]">
            <span>
              {data.total} audit{data.total === 1 ? '' : 's'} · page {data.page} of {pages}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setPage(page - 1)} disabled={page <= 1} aria-label="Previous page">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" onClick={() => setPage(page + 1)} disabled={page >= pages} aria-label="Next page">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const Counter: React.FC<{ label: string; value?: number; highlight?: boolean }> = ({ label, value, highlight }) => (
  <Card className="p-4">
    <div className="text-xs text-[#8B8D98]">{label}</div>
    <div className={`text-2xl font-semibold tabular-nums mt-1 ${highlight ? 'text-[#C9A96E]' : 'text-[#ECEAE5]'}`}>{value ?? '–'}</div>
  </Card>
);

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

const AuditDetail: React.FC<{ id: string }> = ({ id }) => {
  const { navigate } = useNavigation();
  const { onUnauthorized } = useAdmin();
  const [audit, setAudit] = useState<AuditLead | null>(null);
  const [bookings, setBookings] = useState<CallBooking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState<'idle' | 'saving' | 'saved'>('idle');
  const notesTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const fail = useCallback((err: unknown) => {
    if (!onUnauthorized(err)) setError(err instanceof Error ? err.message : 'Something went wrong');
  }, [onUnauthorized]);

  useEffect(() => {
    adminApi
      .audit(id)
      .then(({ audit: a, bookings: b }) => {
        setAudit(a);
        setNotes(a.notes);
        setBookings(b);
      })
      .catch(fail);
  }, [id, fail]);

  const setStatus = async (status: AuditStatus) => {
    if (!audit) return;
    const previous = audit.status;
    setAudit({ ...audit, status });
    try {
      await adminApi.updateAudit(audit.id, { status });
    } catch (err) {
      setAudit({ ...audit, status: previous });
      fail(err);
    }
  };

  // Private notes save themselves a moment after typing stops
  const onNotes = (value: string) => {
    setNotes(value);
    setSaved('saving');
    clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      try {
        await adminApi.updateAudit(id, { notes: value });
        setSaved('saved');
      } catch (err) {
        setSaved('idle');
        fail(err);
      }
    }, 700);
  };
  useEffect(() => () => clearTimeout(notesTimer.current), []);

  const remove = async () => {
    if (!audit || !confirm(`Delete the audit from ${audit.businessName}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteAudit(audit.id);
      navigate('/admin/audits');
    } catch (err) {
      fail(err);
    }
  };

  if (!audit) {
    return error ? (
      <div className="space-y-4">
        <BackLink onClick={() => navigate('/admin/audits')} />
        <ErrorNote message={error} />
      </div>
    ) : (
      <Spinner />
    );
  }

  const r = audit.result;
  const wa = waHref(audit.phone);
  const links = LINK_FIELDS.filter((k) => audit.answers[k]).map((k) => ({ key: k, label: LINK_LABELS[k], value: audit.answers[k], href: linkFor(k, audit.answers[k]) }));
  const pngName = `RMAST-audit-${audit.businessName.replace(/[^\w-]+/g, '-').slice(0, 40)}.png`;

  return (
    <div className="space-y-6">
      <BackLink onClick={() => navigate('/admin/audits')} />
      <PageHeader
        title={audit.businessName}
        subtitle={`${audit.contactName} · ${[audit.city, audit.country].filter(Boolean).join(', ')} · ${formatDateTime(audit.createdAt)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ScoreBadge score={audit.overallScore} />
            <AssistantPill id={audit.mainAssistant} />
            <select aria-label="Status" value={audit.status} onChange={(e) => setStatus(e.target.value as AuditStatus)} className={selectClass}>
              {AUDIT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {AUDIT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <Button variant="danger" onClick={remove}>
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        }
      />
      <ErrorNote message={error} />

      <div className="grid grid-cols-1 xl:grid-cols-[22rem_1fr] gap-6 items-start">
        {/* Image */}
        <Card className="p-4 space-y-3">
          {audit.pngUrl ? (
            <>
              <img src={audit.pngUrl} alt={`Audit image for ${audit.businessName}`} className="w-full rounded-md border border-[#22232D]" loading="lazy" />
              <Button className="w-full" onClick={() => downloadFile(audit.pngUrl!, pngName)}>
                <Download className="w-4 h-4" />
                Download PNG
              </Button>
            </>
          ) : (
            <p className="text-sm text-[#8B8D98]">No image was saved for this audit (image storage wasn’t available).</p>
          )}
        </Card>

        <div className="space-y-6 min-w-0">
          {/* Contact */}
          <Card>
            <CardHeader title="Contact" />
            <div className="px-5 pb-5 space-y-4">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <Item label="Name" value={`${audit.contactName} (${audit.role})`} />
                <Item label="Email" value={audit.email} />
                <Item label="Phone" value={audit.phone || '—'} />
                <Item label="Business" value={`${audit.businessType} · ${audit.answers.years} years`} />
                <Item label="Consent" value={audit.consent ? 'Agreed to be contacted' : 'Did not tick consent'} />
                <Item label="Came from" value={audit.meta.referrer || 'Direct'} />
              </dl>
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${audit.email}`} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-[#16171F] border border-[#2E3040] hover:border-[#C9A96E]/60">
                  <Mail className="w-4 h-4" /> Email
                </a>
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-[#16171F] border border-[#2E3040] hover:border-[#C9A96E]/60">
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {audit.phone && (
                  <a href={`tel:${audit.phone.replace(/[^\d+]/g, '')}`} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-[#16171F] border border-[#2E3040] hover:border-[#C9A96E]/60">
                    <Phone className="w-4 h-4" /> Call
                  </a>
                )}
                {links.map((l) =>
                  l.href ? (
                    <a key={l.key} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md bg-[#16171F] border border-[#2E3040] hover:border-[#C9A96E]/60">
                      <ExternalLink className="w-4 h-4" /> {l.label}
                    </a>
                  ) : (
                    <span key={l.key} className="inline-flex items-center px-3 py-2 text-sm text-[#A6A8B3]">
                      {l.label}: {l.value}
                    </span>
                  )
                )}
              </div>
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader title="Private notes" subtitle={saved === 'saving' ? 'Saving…' : saved === 'saved' ? 'Saved' : 'Only you can see these. They save automatically.'} />
            <div className="px-5 pb-5">
              <textarea
                aria-label="Private notes"
                value={notes}
                onChange={(e) => onNotes(e.target.value)}
                rows={4}
                className={`${inputClass} w-full resize-y`}
                placeholder="Call notes, next steps…"
              />
            </div>
          </Card>

          {/* Scores and audit */}
          <Card>
            <CardHeader title={`Audit: ${r.headline.join(' ')}`} subtitle={r.summary.replace(/\*\*/g, '')} />
            <div className="px-5 pb-5 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(PILLARS) as AssistantId[]).map((p) => (
                  <div key={p} className={`p-3 rounded-md border ${p === audit.mainAssistant ? 'border-[#C9A96E]/60' : 'border-[#22232D]'}`}>
                    <div className="text-xs text-[#8B8D98]">{PILLARS[p].name}</div>
                    <div className="text-lg font-semibold">{r.pillars[p]}/10</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                {r.areas.map((a) => (
                  <div key={a.id} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-[#0B0C10] border border-[#1F2029]">
                    <span className="text-[#A6A8B3]">{a.title}</span>
                    <span className="tabular-nums font-medium">{a.score}/10</span>
                  </div>
                ))}
              </div>
              <ul className="space-y-3 text-sm text-[#A6A8B3]">
                {r.cards.map((c) => (
                  <li key={c.id}>
                    <span className="font-medium text-[#ECEAE5]">
                      {c.title} {c.score}/10:
                    </span>{' '}
                    <Rich text={c.problem} />
                  </li>
                ))}
              </ul>
            </div>
          </Card>

          {/* Bookings */}
          {bookings.length > 0 && (
            <Card>
              <CardHeader title="Booked calls" />
              <ul className="px-5 pb-5 space-y-2 text-sm">
                {bookings.map((b) => (
                  <li key={b.id}>
                    <button type="button" onClick={() => navigate(`/admin/bookings/${encodeURIComponent(b.id)}`)} className="text-left text-[#C9A96E] hover:underline cursor-pointer">
                      {formatSlot(Date.parse(b.slotStart), PKT_ZONE)} · {b.meetingType} · {BOOKING_STATUS_LABELS[b.status]}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Answers */}
          <Card>
            <CardHeader title="All answers" />
            <div className="px-5 pb-5 space-y-5">
              {STEPS.map((step) => (
                <section key={step.id}>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C9A96E] mb-2">{step.title}</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {step.fields.map((f) => {
                      const v = audit.answers[f.key];
                      return <Item key={f.key} label={f.label} value={Array.isArray(v) ? v.join(', ') || '—' : v || '—'} />;
                    })}
                  </dl>
                </section>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const BackLink: React.FC<{ onClick: () => void; label?: string }> = ({ onClick, label = 'All audits' }) => (
  <button type="button" onClick={onClick} className="inline-flex items-center gap-2 text-sm text-[#A6A8B3] hover:text-[#ECEAE5] cursor-pointer">
    <ArrowLeft className="w-4 h-4" />
    {label}
  </button>
);

export const Item: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0">
    <dt className="text-xs text-[#8B8D98]">{label}</dt>
    <dd className="text-[#ECEAE5] break-words">{value}</dd>
  </div>
);
