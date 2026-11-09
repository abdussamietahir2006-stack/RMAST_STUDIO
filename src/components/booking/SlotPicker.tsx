import React, { useEffect, useMemo, useState } from 'react';
import { dayKey, formatTime, zoneAbbr } from '../../data/booking/calendar';

// Common time zones first; the full list follows when the browser provides it
const COMMON_ZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'America/Edmonton',
  'America/Winnipeg',
  'America/Halifax',
  'Asia/Dubai',
  'Asia/Karachi',
  'Europe/London'
];

export const detectTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/New_York';
  } catch {
    return 'America/New_York';
  }
};

function allZones(current: string): string[] {
  const supported = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.('timeZone') ?? [];
  return [...new Set([current, ...COMMON_ZONES, ...supported])];
}

interface Props {
  slots: number[]; // ms, UTC
  value: number | null;
  onChange: (slot: number) => void;
  timeZone: string;
  onTimeZoneChange: (zone: string) => void;
  idPrefix: string;
}

// Day buttons, then that day's times, all shown in the chosen time zone
export const SlotPicker: React.FC<Props> = ({ slots, value, onChange, timeZone, onTimeZoneChange, idPrefix }) => {
  const zones = useMemo(() => allZones(timeZone), [timeZone]);
  const days = useMemo(() => {
    const map = new Map<string, number[]>();
    for (const s of slots) {
      const key = dayKey(s, timeZone);
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return [...map.entries()];
  }, [slots, timeZone]);

  const [day, setDay] = useState<string | null>(null);
  // Keep the chosen day valid when the zone or the slots change
  useEffect(() => {
    if (value !== null && slots.includes(value)) setDay(dayKey(value, timeZone));
    else if (!day || !days.some(([k]) => k === day)) setDay(days[0]?.[0] ?? null);
  }, [days, timeZone, value, slots, day]);

  const times = days.find(([k]) => k === day)?.[1] ?? [];
  const label = (key: string) => {
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, 12));
    return {
      weekday: date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
    };
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor={`${idPrefix}-tz`} className="text-sm font-medium text-fg block">
          Your time zone
        </label>
        <select
          id={`${idPrefix}-tz`}
          value={timeZone}
          onChange={(e) => onTimeZoneChange(e.target.value)}
          className="w-full bg-canvas border border-line rounded-btn px-4 py-3 text-base text-fg focus:outline-none focus:border-primary cursor-pointer"
        >
          {zones.map((z) => (
            <option key={z} value={z} className="bg-surface text-fg">
              {z.replace(/_/g, ' ')} ({zoneAbbr(Date.now(), z)})
            </option>
          ))}
        </select>
      </div>

      {days.length === 0 ? (
        <p className="text-muted">No times are open right now. Please message us on WhatsApp or email and we’ll find a time.</p>
      ) : (
        <>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-fg">Pick a day</legend>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
              {days.map(([key]) => {
                const l = label(key);
                const on = key === day;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setDay(key)}
                    className={`snap-start shrink-0 w-[4.5rem] py-2 rounded-btn border text-center cursor-pointer transition-colors ${
                      on ? 'bg-primary text-on-primary border-primary' : 'bg-canvas text-fg border-line hover:border-primary'
                    }`}
                  >
                    <span className="block text-xs uppercase tracking-wide">{l.weekday}</span>
                    <span className="block text-sm font-semibold">{l.date}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-fg">
              Pick a time <span className="font-normal text-muted">({zoneAbbr(times[0] ?? Date.now(), timeZone)})</span>
            </legend>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {times.map((t) => {
                const on = t === value;
                return (
                  <button
                    key={t}
                    type="button"
                    aria-pressed={on}
                    onClick={() => onChange(t)}
                    className={`min-h-11 px-2 py-2 rounded-btn border text-sm cursor-pointer transition-colors ${
                      on ? 'bg-primary text-on-primary border-primary font-semibold' : 'bg-canvas text-fg border-line hover:border-primary'
                    }`}
                  >
                    {formatTime(t, timeZone)}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </>
      )}
    </div>
  );
};
