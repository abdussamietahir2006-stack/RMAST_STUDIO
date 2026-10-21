import React, { useCallback, useEffect, useState } from 'react';
import { ChevronRight, Folder, FolderOpen, Mail, MapPin, Phone, Search, Send, Trash2, Clock, FileText, Database } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { InquiryStatus, LeadDivision, LeadStats, StoredInquiry } from '../types';
import { adminApi } from './api';
import { useAdmin } from './AdminApp';
import { DIVISION_LABELS, folderCounts, folderLabel, LEAD_FOLDERS } from './folders';
import { Card, ErrorNote, PageHeader, Spinner, STATUS_META, formatDateTime } from './ui';

const DIVISIONS = Object.keys(LEAD_FOLDERS) as LeadDivision[];

const DISPATCH: Record<StoredInquiry['dispatchMethod'], { label: string; icon: React.ReactNode }> = {
  whatsapp: { label: 'WhatsApp', icon: <Send className="w-3 h-3" /> },
  email: { label: 'Email', icon: <Mail className="w-3 h-3" /> },
  form: { label: 'Website form', icon: <Database className="w-3 h-3" /> },
  'contact-form': { label: 'Contact page', icon: <FileText className="w-3 h-3" /> }
};

function parsePath(path: string): { division?: LeadDivision; group?: string } {
  const [, , , division, group] = path.split('/'); // '', 'admin', 'leads', division, group
  if (!division || !DIVISIONS.includes(division as LeadDivision)) return {};
  return { division: division as LeadDivision, group: group || undefined };
}

interface FolderButtonProps {
  to: string;
  label: string;
  count: number;
  newCount: number;
  active: boolean;
  depth: 0 | 1;
  open?: boolean;
  onSelect: (to: string) => void;
}

const FolderButton: React.FC<FolderButtonProps> = ({ to, label, count, newCount, active, depth, open, onSelect }) => (
  <button
    onClick={() => onSelect(to)}
    aria-current={active ? 'page' : undefined}
    className={`w-full flex items-center gap-2 py-1.5 pr-2 rounded-md text-sm text-left transition-colors cursor-pointer ${
      active ? 'bg-[#1A1B24] text-[#ECEAE5]' : 'text-[#A6A8B3] hover:text-[#ECEAE5] hover:bg-[#15161D]'
    }`}
    style={{ paddingLeft: 8 + depth * 16 }}
  >
    {depth === 0 ? (
      open ? (
        <FolderOpen className={`w-4 h-4 shrink-0 ${active ? 'text-[#C9A96E]' : ''}`} />
      ) : (
        <Folder className="w-4 h-4 shrink-0" />
      )
    ) : (
      <span className="w-1.5 h-1.5 rounded-full bg-[#3A3C4C] shrink-0 ml-1" aria-hidden="true" />
    )}
    <span className={`flex-1 truncate ${depth === 0 ? 'font-medium' : ''} ${count === 0 && depth > 0 ? 'text-[#6E7180]' : ''}`}>
      {label}
    </span>
    {newCount > 0 && (
      <span className="px-1.5 rounded bg-[#1E3A5F] text-[#93C5FD] text-[11px] tabular-nums" title={`${newCount} new`}>
        {newCount}
      </span>
    )}
    <span className="w-6 text-right text-xs tabular-nums text-[#6E7180]">{count}</span>
  </button>
);

const LeadCard: React.FC<{
  lead: StoredInquiry;
  onStatus: (lead: StoredInquiry, status: InquiryStatus) => void;
  onDelete: (lead: StoredInquiry) => void;
}> = ({ lead, onStatus, onDelete }) => {
  const phoneDigits = lead.clientPhone.replace(/[^0-9]/g, '');
  const dispatch = DISPATCH[lead.dispatchMethod] ?? DISPATCH.form;

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#8B8D98]">
            <span>{DIVISION_LABELS[lead.category.division]}</span>
            <ChevronRight className="w-3 h-3" />
            <span>{folderLabel(lead.category.division, lead.category.group)}</span>
          </div>
          <h3 className="text-base font-semibold text-[#ECEAE5]">{lead.clientName}</h3>
          <p className="text-sm text-[#A6A8B3]">
            {lead.targetTitle}
            {lead.estimatedPrice && <span className="text-[#C9A96E]"> · {lead.estimatedPrice}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-[#16171F] border border-[#22232D] text-xs text-[#A6A8B3]">
            {dispatch.icon}
            {dispatch.label}
          </span>
          <label className="relative">
            <span className="sr-only">Status</span>
            <span
              className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${STATUS_META[lead.status].dot}`}
              aria-hidden="true"
            />
            <select
              value={lead.status}
              onChange={(e) => onStatus(lead, e.target.value as InquiryStatus)}
              className="pl-6 pr-2 py-1 text-xs bg-[#16171F] border border-[#2E3040] rounded text-[#ECEAE5] cursor-pointer outline-none focus:border-[#C9A96E]"
            >
              {(Object.keys(STATUS_META) as InquiryStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_META[s].label}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => onDelete(lead)}
            className="p-1.5 rounded text-[#6E7180] hover:text-[#F87171] hover:bg-[#2A1215] cursor-pointer"
            aria-label={`Delete inquiry from ${lead.clientName}`}
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
        <a href={`mailto:${lead.clientEmail}`} className="inline-flex items-center gap-1.5 text-[#ECEAE5] hover:text-[#C9A96E]">
          <Mail className="w-3.5 h-3.5 text-[#6E7180]" />
          {lead.clientEmail}
        </a>
        {phoneDigits && (
          <a
            href={`https://wa.me/${phoneDigits}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#ECEAE5] hover:text-[#4ADE80]"
          >
            <Phone className="w-3.5 h-3.5 text-[#6E7180]" />
            {lead.clientPhone}
          </a>
        )}
        {lead.clientCompany && <span className="text-[#A6A8B3]">{lead.clientCompany}</span>}
        {lead.clientLocation && (
          <span className="inline-flex items-center gap-1.5 text-[#A6A8B3]">
            <MapPin className="w-3.5 h-3.5 text-[#6E7180]" />
            {lead.clientLocation}
          </span>
        )}
        {lead.timeline && (
          <span className="inline-flex items-center gap-1.5 text-[#A6A8B3]">
            <Clock className="w-3.5 h-3.5 text-[#6E7180]" />
            {lead.timeline}
          </span>
        )}
      </div>

      {lead.notes && (
        <p className="mt-3 p-3 rounded-md bg-[#0B0C10] border border-[#1C1D25] text-sm text-[#C9CBD3] whitespace-pre-line leading-relaxed">
          {lead.notes}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {phoneDigits && (
            <a
              href={`https://wa.me/${phoneDigits}?text=${encodeURIComponent(
                `Hi ${lead.clientName}, this is RMAST Studio regarding your inquiry about ${lead.targetTitle}.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-[#12261A] border border-[#1E4D30] text-[#86EFAC] hover:border-[#4ADE80]"
            >
              <Send className="w-3 h-3" /> Reply on WhatsApp
            </a>
          )}
          <a
            href={`mailto:${lead.clientEmail}?subject=${encodeURIComponent(`RMAST Studio: ${lead.targetTitle}`)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs bg-[#16171F] border border-[#2E3040] text-[#ECEAE5] hover:border-[#C9A96E]/60"
          >
            <Mail className="w-3 h-3" /> Reply by email
          </a>
        </div>
        <time dateTime={lead.timestamp} className="text-xs text-[#6E7180]">
          {formatDateTime(lead.timestamp)}
        </time>
      </div>
    </Card>
  );
};

export const LeadsPage: React.FC<{ path: string }> = ({ path }) => {
  const { navigate } = useNavigation();
  const { onUnauthorized } = useAdmin();
  const { division, group } = parsePath(path);

  const [stats, setStats] = useState<LeadStats | null>(null);
  const [leads, setLeads] = useState<StoredInquiry[] | null>(null);
  const [status, setStatus] = useState<InquiryStatus | ''>('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fail = useCallback(
    (err: unknown) => {
      if (!onUnauthorized(err)) setError(err instanceof Error ? err.message : 'Something went wrong.');
    },
    [onUnauthorized]
  );

  const loadStats = useCallback(() => {
    adminApi.stats().then(setStats).catch(fail);
  }, [fail]);

  useEffect(loadStats, [loadStats]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi
      .leads({ division, group, status, q: debouncedQuery })
      .then((res) => {
        if (!cancelled) setLeads(res);
      })
      .catch(fail)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [division, group, status, debouncedQuery, fail]);

  const counts = folderCounts(stats);

  const updateStatus = async (lead: StoredInquiry, next: InquiryStatus) => {
    const previous = leads;
    setLeads((prev) => prev?.map((l) => (l.id === lead.id ? { ...l, status: next } : l)) ?? null);
    try {
      await adminApi.setStatus(lead.id, next);
      loadStats();
    } catch (err) {
      setLeads(previous);
      fail(err);
    }
  };

  const remove = async (lead: StoredInquiry) => {
    if (!confirm(`Delete the inquiry from ${lead.clientName}? This cannot be undone.`)) return;
    try {
      await adminApi.deleteLead(lead.id);
      setLeads((prev) => prev?.filter((l) => l.id !== lead.id) ?? null);
      loadStats();
    } catch (err) {
      fail(err);
    }
  };

  const title = group && division ? folderLabel(division, group) : division ? DIVISION_LABELS[division] : 'All leads';

  return (
    <>
      <PageHeader
        title={title}
        subtitle={
          division
            ? group
              ? `${DIVISION_LABELS[division]} › ${folderLabel(division, group)}`
              : `Every ${DIVISION_LABELS[division]} inquiry`
            : 'Every inquiry from the website, filed by Assistant and service.'
        }
      />
      <ErrorNote message={error} />

      <div className="grid grid-cols-1 lg:grid-cols-[17rem_1fr] gap-6 mt-4">
        {/* Folder tree */}
        <Card className="p-2 h-fit lg:sticky lg:top-6">
          <nav aria-label="Lead folders" className="space-y-0.5">
            <FolderButton
              onSelect={navigate}
              to="/admin/leads"
              label="All leads"
              count={stats?.total ?? 0}
              newCount={stats?.newCount ?? 0}
              active={!division}
              depth={0}
              open={!division}
            />
            {DIVISIONS.map((d) => {
              const dc = counts(d);
              const open = division === d;
              return (
                <div key={d}>
                  <FolderButton
                    onSelect={navigate}
                    to={`/admin/leads/${d}`}
                    label={DIVISION_LABELS[d]}
                    count={dc.count}
                    newCount={dc.newCount}
                    active={open && !group}
                    depth={0}
                    open={open}
                  />
                  {open &&
                    LEAD_FOLDERS[d].map((f) => {
                      const fc = counts(d, f.group);
                      return (
                        <FolderButton
                          key={f.group}
                          onSelect={navigate}
                          to={`/admin/leads/${d}/${f.group}`}
                          label={f.label}
                          count={fc.count}
                          newCount={fc.newCount}
                          active={group === f.group}
                          depth={1}
                        />
                      );
                    })}
                </div>
              );
            })}
          </nav>
        </Card>

        {/* Lead list */}
        <div className="space-y-4 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <label className="relative flex-1 min-w-[14rem]">
              <span className="sr-only">Search leads</span>
              <Search className="w-4 h-4 text-[#6E7180] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, email, company or package"
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#111218] border border-[#22232D] rounded-md text-[#ECEAE5] placeholder:text-[#6E7180] outline-none focus:border-[#C9A96E]"
              />
            </label>
            <div className="flex rounded-md border border-[#22232D] overflow-hidden text-sm" role="group" aria-label="Filter by status">
              {(['', 'new', 'reviewed', 'contacted'] as const).map((s) => (
                <button
                  key={s || 'all'}
                  onClick={() => setStatus(s)}
                  aria-pressed={status === s}
                  className={`px-3 py-2 cursor-pointer transition-colors ${
                    status === s ? 'bg-[#1A1B24] text-[#ECEAE5]' : 'bg-[#111218] text-[#A6A8B3] hover:text-[#ECEAE5]'
                  }`}
                >
                  {s ? STATUS_META[s].label : 'All'}
                </button>
              ))}
            </div>
          </div>

          {leads === null ? (
            <Spinner />
          ) : leads.length === 0 ? (
            <Card className="py-16 text-center">
              <p className="text-sm text-[#8B8D98]">
                {debouncedQuery || status ? 'No leads match these filters.' : 'No leads in this folder yet.'}
              </p>
            </Card>
          ) : (
            <ul className={`space-y-3 transition-opacity ${loading ? 'opacity-60' : ''}`}>
              {leads.map((lead) => (
                <li key={lead.id}>
                  <LeadCard lead={lead} onStatus={updateStatus} onDelete={remove} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};
