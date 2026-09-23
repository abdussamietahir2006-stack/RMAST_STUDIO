import React, { useEffect, useState } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { LeadDivision, LeadStats, StoredInquiry } from '../types';
import { adminApi } from './api';
import { useAdmin } from './AdminApp';
import { DIVISION_LABELS, folderLabel, LEAD_FOLDERS } from './folders';
import { DailyLeadsChart, ServiceRow, ServiceScoreboard } from './charts';
import { Button, Card, CardHeader, ErrorNote, PageHeader, Spinner, STATUS_META, relativeTime } from './ui';

const StatTile: React.FC<{ label: string; value: React.ReactNode; note?: string; hero?: boolean }> = ({
  label,
  value,
  note,
  hero
}) => (
  <Card className="p-5">
    <div className="text-xs text-[#8B8D98]">{label}</div>
    <div className={`mt-2 font-semibold text-[#ECEAE5] leading-none ${hero ? 'text-5xl' : 'text-3xl'}`}>{value}</div>
    {note && <div className="mt-2 text-xs text-[#8B8D98] truncate">{note}</div>}
  </Card>
);

export const OverviewPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { onUnauthorized } = useAdmin();
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [recent, setRecent] = useState<StoredInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, r] = await Promise.all([adminApi.stats(), adminApi.leads({ limit: 6 })]);
      setStats(s);
      setRecent(r);
    } catch (err) {
      if (!onUnauthorized(err)) setError(err instanceof Error ? err.message : 'Could not load the overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (!stats) {
    return (
      <>
        <PageHeader title="Overview" />
        {loading ? <Spinner /> : <ErrorNote message={error} />}
      </>
    );
  }

  // Service scoreboard: every service and package folder that has received leads
  const rows: ServiceRow[] = stats.byFolder
    .filter((f) => f.count > 0)
    .map((f) => ({
      key: `${f.division}/${f.group}`,
      label: folderLabel(f.division, f.group),
      divisionLabel: DIVISION_LABELS[f.division],
      division: f.division,
      group: f.group,
      count: f.count,
      newCount: f.newCount
    }));
  const withLeads = new Set(rows.map((r) => r.key));
  const noLeadsYet = (Object.keys(LEAD_FOLDERS) as LeadDivision[])
    .flatMap((d) => LEAD_FOLDERS[d])
    .filter((f) => f.group !== 'general' && f.group !== 'packages' && !withLeads.has(`${f.division}/${f.group}`))
    .map((f) => f.label);

  const top = rows[0];
  const topIsUnique = top && rows.filter((r) => r.count === top.count).length === 1;

  const divisionTotals = (Object.keys(DIVISION_LABELS) as LeadDivision[]).map((d) => ({
    division: d,
    count: stats.byFolder.filter((f) => f.division === d).reduce((sum, f) => sum + f.count, 0)
  }));

  return (
    <div className={`space-y-6 transition-opacity ${loading ? 'opacity-60' : ''}`}>
      <PageHeader
        title="Overview"
        subtitle="How inquiries are coming in across every service."
        action={
          <Button variant="ghost" onClick={load} loading={loading} aria-label="Refresh overview">
            {!loading && <RefreshCw className="w-4 h-4" />}
            Refresh
          </Button>
        }
      />
      <ErrorNote message={error} />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile hero label="Total leads" value={stats.total.toLocaleString()} note="All time" />
        <StatTile label="Awaiting reply" value={stats.newCount.toLocaleString()} note="Status: New" />
        <StatTile label="Last 7 days" value={stats.last7Days.toLocaleString()} note={`${stats.last30Days} in the last 30 days`} />
        <StatTile
          label="Top service"
          value={<span className="text-xl leading-tight block truncate">{topIsUnique ? top.label : top ? 'Tied' : '—'}</span>}
          note={top ? `${top.count} ${top.count === 1 ? 'lead' : 'leads'}${topIsUnique ? ` · ${top.divisionLabel}` : ''}` : 'No leads yet'}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <Card className="xl:col-span-3">
          <CardHeader title="Leads by service" subtitle="All time, highest first. Select a row to open that folder." />
          <div className="px-3 pb-5">
            {rows.length ? (
              <ServiceScoreboard rows={rows} onSelect={(r) => navigate(`/admin/leads/${r.division}/${r.group}`)} />
            ) : (
              <p className="px-2 py-10 text-center text-sm text-[#8B8D98]">No leads yet. They will appear here as inquiries arrive.</p>
            )}
            {noLeadsYet.length > 0 && rows.length > 0 && (
              <p className="px-2 pt-4 text-xs text-[#6E7180]">
                No leads yet: {noLeadsYet.join(', ')}
              </p>
            )}
          </div>
        </Card>

        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader title="Leads per day" subtitle="Last 30 days" />
            <div className="px-5 pb-5">
              <DailyLeadsChart daily={stats.daily} />
            </div>
          </Card>

          <Card>
            <CardHeader title="By division" />
            <ul className="px-5 pb-4 divide-y divide-[#1C1D25]">
              {divisionTotals.map((d) => (
                <li key={d.division}>
                  <button
                    onClick={() => navigate(`/admin/leads/${d.division}`)}
                    className="w-full flex items-center justify-between py-2.5 text-sm cursor-pointer group"
                  >
                    <span className="text-[#ECEAE5] group-hover:text-[#C9A96E]">{DIVISION_LABELS[d.division]}</span>
                    <span className="tabular-nums text-[#A6A8B3]">{d.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader
          title="Latest inquiries"
          action={
            <Button variant="ghost" onClick={() => navigate('/admin/leads')}>
              View all <ArrowRight className="w-4 h-4" />
            </Button>
          }
        />
        {recent.length ? (
          <ul className="divide-y divide-[#1C1D25] border-t border-[#1C1D25]">
            {recent.map((lead) => (
              <li key={lead.id}>
                <button
                  onClick={() => navigate(`/admin/leads/${lead.category.division}/${lead.category.group}`)}
                  className="w-full flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-left hover:bg-[#15161D] cursor-pointer"
                >
                  <span className="flex items-center gap-2 w-24 text-xs text-[#A6A8B3]">
                    <span className={`w-2 h-2 rounded-full ${STATUS_META[lead.status].dot}`} aria-hidden="true" />
                    {STATUS_META[lead.status].label}
                  </span>
                  <span className="flex-1 min-w-[10rem] text-sm text-[#ECEAE5] truncate">{lead.clientName}</span>
                  <span className="text-sm text-[#A6A8B3] truncate max-w-xs">
                    {folderLabel(lead.category.division, lead.category.group)}
                  </span>
                  <span className="w-20 text-right text-xs text-[#6E7180]">{relativeTime(lead.timestamp)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 pb-6 text-sm text-[#8B8D98]">No inquiries yet.</p>
        )}
      </Card>
    </div>
  );
};
