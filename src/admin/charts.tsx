import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { LeadDivision } from '../types';

// Chart colors, validated against the #111218 card surface (both >= 3:1, CVD-distinct):
// the leader is emphasized in brand gold, every other bar is a recessive gray.
const LEADER = '#C9A96E';
const REST = '#6B6F84';
const GRID = '#1F2029';

// ---------------------------------------------------------------------------
// Leads by service: horizontal bars sorted high to low, leader highlighted
// ---------------------------------------------------------------------------

export interface ServiceRow {
  key: string;
  label: string;
  divisionLabel: string;
  division: LeadDivision;
  group: string;
  count: number;
  newCount: number;
}

export const ServiceScoreboard: React.FC<{ rows: ServiceRow[]; onSelect: (row: ServiceRow) => void }> = ({
  rows,
  onSelect
}) => {
  const [hover, setHover] = useState<string | null>(null);
  const max = Math.max(1, ...rows.map((r) => r.count));
  const leaderCount = rows[0]?.count ?? 0;
  // Only crown a leader when one service is strictly ahead
  const hasLeader = leaderCount > 0 && rows.filter((r) => r.count === leaderCount).length === 1;

  return (
    <ul className="space-y-2" role="list">
      {rows.map((row, i) => {
        const isLeader = hasLeader && i === 0;
        const width = `${(row.count / max) * 100}%`;
        const active = hover === row.key;
        return (
          <li key={row.key} className="relative">
            <button
              type="button"
              onClick={() => onSelect(row)}
              onMouseEnter={() => setHover(row.key)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(row.key)}
              onBlur={() => setHover(null)}
              className={`w-full grid grid-cols-[minmax(0,11rem)_1fr] sm:grid-cols-[minmax(0,14rem)_1fr] items-center gap-3 px-2 py-1.5 rounded-md text-left cursor-pointer transition-colors ${
                active ? 'bg-[#16171F]' : ''
              }`}
              aria-label={`${row.label}, ${row.divisionLabel}: ${row.count} leads, ${row.newCount} new${isLeader ? ', leading' : ''}`}
            >
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm text-[#ECEAE5] truncate">
                  {isLeader && <Trophy className="w-3.5 h-3.5 shrink-0 text-[#C9A96E]" aria-hidden="true" />}
                  <span className="truncate">{row.label}</span>
                </span>
                <span className="block text-[11px] text-[#8B8D98]">{row.divisionLabel}</span>
              </span>
              <span className="flex items-center gap-2 min-w-0">
                <span className="flex-1 h-5 min-w-0">
                  <span
                    className="block h-full rounded-r-[4px] transition-[width] duration-500"
                    style={{ width, minWidth: row.count ? 4 : 0, backgroundColor: isLeader ? LEADER : REST }}
                  />
                </span>
                <span className="w-14 shrink-0 text-sm text-[#ECEAE5] tabular-nums">
                  {row.count}
                  {isLeader && <span className="ml-1.5 text-[10px] uppercase tracking-wider text-[#C9A96E]">Lead</span>}
                </span>
              </span>
            </button>
            {active && (
              <div
                role="tooltip"
                className="absolute z-10 right-2 -top-9 px-2.5 py-1.5 rounded-md bg-[#1E1F29] border border-[#2E3040] text-xs text-[#ECEAE5] shadow-lg pointer-events-none whitespace-nowrap"
              >
                {row.count} {row.count === 1 ? 'lead' : 'leads'} · {row.newCount} awaiting reply
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

// ---------------------------------------------------------------------------
// Leads per day, last 30 days: column chart with clean y ticks and a table view
// ---------------------------------------------------------------------------

function niceTicks(max: number): number[] {
  if (max <= 4) return Array.from({ length: Math.max(max, 1) + 1 }, (_, i) => i);
  const rough = max / 4;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? rough;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step - 1; v += step) ticks.push(v);
  return ticks;
}

const shortDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const DailyLeadsChart: React.FC<{ daily: { date: string; count: number }[] }> = ({ daily }) => {
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const max = Math.max(0, ...daily.map((d) => d.count));
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1] || 1;
  const PLOT_H = 160;

  return (
    <div>
      <div className="flex justify-end -mt-1 mb-2">
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="text-xs text-[#A6A8B3] hover:text-[#ECEAE5] underline-offset-2 hover:underline cursor-pointer"
          aria-pressed={showTable}
        >
          {showTable ? 'Show chart' : 'Show table'}
        </button>
      </div>

      {showTable ? (
        <div className="max-h-64 overflow-y-auto border border-[#22232D] rounded-md">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[#16171F] text-[#A6A8B3]">
              <tr>
                <th className="text-left font-medium px-3 py-2">Date</th>
                <th className="text-right font-medium px-3 py-2">Leads</th>
              </tr>
            </thead>
            <tbody>
              {[...daily].reverse().map((d) => (
                <tr key={d.date} className="border-t border-[#1C1D25]">
                  <td className="px-3 py-1.5 text-[#ECEAE5]">{shortDate(d.date)}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-[#ECEAE5]">{d.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-2">
          {/* Y axis */}
          <div className="relative w-6 shrink-0 text-[11px] text-[#6E7180] tabular-nums" style={{ height: PLOT_H }}>
            {ticks.map((t) => (
              <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: PLOT_H - (t / top) * PLOT_H }}>
                {t}
              </span>
            ))}
          </div>

          <div className="flex-1 min-w-0">
            {/* Plot */}
            <div className="relative" style={{ height: PLOT_H }}>
              {ticks.map((t) => (
                <div
                  key={t}
                  className="absolute left-0 right-0 h-px"
                  style={{ top: PLOT_H - (t / top) * PLOT_H, backgroundColor: GRID }}
                />
              ))}
              <div className="absolute inset-0 flex items-end">
                {daily.map((d, i) => (
                  <div
                    key={d.date}
                    tabIndex={0}
                    role="img"
                    aria-label={`${shortDate(d.date)}: ${d.count} ${d.count === 1 ? 'lead' : 'leads'}`}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover(null)}
                    className="relative flex-1 h-full flex items-end justify-center outline-none focus-visible:bg-[#16171F]"
                  >
                    <div
                      className="w-full max-w-[14px] mx-px rounded-t-[4px] transition-opacity"
                      style={{
                        height: d.count ? `${(d.count / top) * 100}%` : 0,
                        backgroundColor: LEADER,
                        opacity: hover === null || hover === i ? 1 : 0.45
                      }}
                    />
                    {hover === i && (
                      <div
                        role="tooltip"
                        className={`absolute bottom-full mb-1 z-10 px-2.5 py-1.5 rounded-md bg-[#1E1F29] border border-[#2E3040] text-xs text-[#ECEAE5] shadow-lg pointer-events-none whitespace-nowrap ${
                          i < 4 ? 'left-0' : i > daily.length - 5 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                        }`}
                      >
                        {shortDate(d.date)} · {d.count} {d.count === 1 ? 'lead' : 'leads'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {/* X axis */}
            <div className="flex justify-between pt-2 text-[11px] text-[#6E7180]">
              <span>{daily[0] && shortDate(daily[0].date)}</span>
              <span>{daily[15] && shortDate(daily[15].date)}</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
