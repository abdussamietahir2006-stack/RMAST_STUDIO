// Call booking: availability, time slots and calendar invites. Shared by the website, the server
// (which re-checks every slot) and the dashboard. Times are stored in UTC; working hours are set in
// Pakistan time (PKT, UTC+5, no daylight saving).

export const PKT_OFFSET_MINUTES = 5 * 60;
export const PKT_ZONE = 'Asia/Karachi';

export const MEETING_TYPES = ['Google Meet', 'Zoom', 'WhatsApp call', 'Phone call'] as const;
export type MeetingType = (typeof MEETING_TYPES)[number];

export const BOOKING_TOPICS = [
  'Creative Assistant (content & reels)',
  'Technical Assistant (website & lead response)',
  'Virtual Assistant (follow-up & admin)',
  'Not sure yet'
] as const;
export const TOPIC_FOR_ASSISTANT = {
  creative: BOOKING_TOPICS[0],
  technical: BOOKING_TOPICS[1],
  virtual: BOOKING_TOPICS[2]
} as const;

export const BOOKING_STATUSES = ['scheduled', 'completed', 'no-show', 'rescheduled', 'cancelled'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];
export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  'no-show': 'No-show',
  rescheduled: 'Rescheduled',
  cancelled: 'Cancelled'
};
// Statuses that keep the time slot taken
export const holdsSlot = (status: BookingStatus) => status !== 'cancelled';

export const SLOT_LENGTHS = [15, 30, 45, 60] as const;

// One day's working hours in PKT. An end at or before the start runs past midnight (18:00 to 02:00).
export interface DayHours {
  on: boolean;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export interface Availability {
  // Index 0 = Sunday ... 6 = Saturday (PKT days)
  weekly: DayHours[];
  slotMinutes: number;
  bufferMinutes: number;
  blockedDates: string[]; // "YYYY-MM-DD" PKT dates: that day's working hours are off
  minNoticeHours: number;
  daysAhead: number;
}

// Default: 30-minute calls, Monday to Saturday, 6 PM to 2 AM PKT (US and Canada business hours)
export const DEFAULT_AVAILABILITY: Availability = {
  weekly: [0, 1, 2, 3, 4, 5, 6].map((d) => ({ on: d !== 0, start: '18:00', end: '02:00' })),
  slotMinutes: 30,
  bufferMinutes: 0,
  blockedDates: [],
  minNoticeHours: 12,
  daysAhead: 21
};

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const minutesOf = (hhmm: string) => {
  const m = HHMM.exec(hhmm);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

// Checks settings from the dashboard; returns clean settings or a message
export function cleanAvailability(raw: unknown): Availability | string {
  const r = (raw ?? {}) as Record<string, unknown>;
  const weeklyRaw = Array.isArray(r.weekly) ? r.weekly : [];
  if (weeklyRaw.length !== 7) return 'Working hours must list all 7 days.';
  const weekly: DayHours[] = [];
  for (const d of weeklyRaw as Record<string, unknown>[]) {
    const start = String(d?.start ?? '');
    const end = String(d?.end ?? '');
    if (minutesOf(start) === null || minutesOf(end) === null) return 'Times must look like 18:00.';
    if (start === end && d?.on) return 'A working day needs different start and end times.';
    weekly.push({ on: d?.on === true, start, end });
  }
  const slotMinutes = Number(r.slotMinutes);
  if (!(SLOT_LENGTHS as readonly number[]).includes(slotMinutes)) return 'Slot length must be 15, 30, 45 or 60 minutes.';
  const bufferMinutes = Number(r.bufferMinutes);
  if (!Number.isInteger(bufferMinutes) || bufferMinutes < 0 || bufferMinutes > 120) return 'Buffer must be 0 to 120 minutes.';
  const minNoticeHours = Number(r.minNoticeHours);
  if (!Number.isInteger(minNoticeHours) || minNoticeHours < 0 || minNoticeHours > 168) return 'Minimum notice must be 0 to 168 hours.';
  const daysAhead = Number(r.daysAhead);
  if (!Number.isInteger(daysAhead) || daysAhead < 1 || daysAhead > 90) return 'Days ahead must be 1 to 90.';
  const blockedDates = [...new Set((Array.isArray(r.blockedDates) ? r.blockedDates : []).map(String).filter((s) => DATE.test(s)))]
    .sort()
    .slice(0, 366);
  return { weekly, slotMinutes, bufferMinutes, blockedDates, minNoticeHours, daysAhead };
}

// The PKT calendar date ("YYYY-MM-DD") and weekday of a UTC instant
function pktDay(ms: number): { date: string; weekday: number; y: number; m: number; d: number } {
  const t = new Date(ms + PKT_OFFSET_MINUTES * 60_000);
  const y = t.getUTCFullYear();
  const m = t.getUTCMonth();
  const d = t.getUTCDate();
  return { date: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`, weekday: t.getUTCDay(), y, m, d };
}

export interface BookedRange {
  start: number; // ms, UTC
  end: number;
}

// Every bookable slot start (ms, UTC) from now, honouring working hours, blocked days, notice, the
// booking window and existing bookings (plus the buffer around them)
export function availableSlots(settings: Availability, now: number, booked: BookedRange[]): number[] {
  const slotMs = settings.slotMinutes * 60_000;
  const bufferMs = settings.bufferMinutes * 60_000;
  const earliest = now + settings.minNoticeHours * 3_600_000;
  const latest = now + settings.daysAhead * 86_400_000;
  const blocked = new Set(settings.blockedDates);
  const slots: number[] = [];

  // Start one PKT day back so a window that began yesterday evening and runs past midnight is included
  for (let day = -1; day <= settings.daysAhead + 1; day++) {
    const { date, weekday, y, m, d } = pktDay(now + day * 86_400_000);
    const hours = settings.weekly[weekday];
    if (!hours?.on || blocked.has(date)) continue;
    const startMin = minutesOf(hours.start)!;
    let endMin = minutesOf(hours.end)!;
    if (endMin <= startMin) endMin += 24 * 60;
    const dayStartUtc = Date.UTC(y, m, d) - PKT_OFFSET_MINUTES * 60_000;
    for (let t = startMin; t + settings.slotMinutes <= endMin; t += settings.slotMinutes + settings.bufferMinutes) {
      const start = dayStartUtc + t * 60_000;
      if (start < earliest || start > latest) continue;
      const end = start + slotMs;
      const clash = booked.some((b) => start < b.end + bufferMs && end + bufferMs > b.start);
      if (!clash) slots.push(start);
    }
  }
  return [...new Set(slots)].sort((x, y) => x - y);
}

// ---------------------------------------------------------------------------
// Showing times in a time zone
// ---------------------------------------------------------------------------

export function isValidTimeZone(zone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone });
    return Boolean(zone);
  } catch {
    return false;
  }
}

// "YYYY-MM-DD" of an instant in a time zone (used to group slots by day)
export function dayKey(ms: number, zone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(ms);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export const formatTime = (ms: number, zone: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit' }).format(ms);

export const formatDay = (ms: number, zone: string) =>
  new Intl.DateTimeFormat('en-US', { timeZone: zone, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(ms);

// Short zone name, e.g. "EST" or "GMT+5"
export function zoneAbbr(ms: number, zone: string): string {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' })
    .formatToParts(ms)
    .find((p) => p.type === 'timeZoneName');
  return zone === PKT_ZONE ? 'PKT' : part?.value ?? zone;
}

// "Tuesday, November 18, 2026 · 7:00 PM EST"
export const formatSlot = (ms: number, zone: string) => `${formatDay(ms, zone)} · ${formatTime(ms, zone)} ${zoneAbbr(ms, zone)}`;

// ---------------------------------------------------------------------------
// Calendar invites
// ---------------------------------------------------------------------------

const icsStamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => `\\${c}`);

export interface InviteDetails {
  uid: string;
  start: number;
  end: number;
  title: string;
  description: string;
  location?: string;
  organizerEmail?: string;
  attendeeEmail?: string;
  cancelled?: boolean;
}

// A standard .ics file (opens in Google Calendar, Outlook and Apple Calendar)
export function buildIcs(e: InviteDetails): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//RMAST Studio//Call booking//EN',
    'CALSCALE:GREGORIAN',
    `METHOD:${e.cancelled ? 'CANCEL' : 'PUBLISH'}`,
    'BEGIN:VEVENT',
    `UID:${e.uid}@rmast-studio`,
    `DTSTAMP:${icsStamp(Date.now())}`,
    `DTSTART:${icsStamp(e.start)}`,
    `DTEND:${icsStamp(e.end)}`,
    `SUMMARY:${icsText(e.title)}`,
    `DESCRIPTION:${icsText(e.description)}`,
    ...(e.location ? [`LOCATION:${icsText(e.location)}`] : []),
    ...(e.organizerEmail ? [`ORGANIZER;CN=RMAST Studio:mailto:${e.organizerEmail}`] : []),
    ...(e.attendeeEmail ? [`ATTENDEE;ROLE=REQ-PARTICIPANT:mailto:${e.attendeeEmail}`] : []),
    `STATUS:${e.cancelled ? 'CANCELLED' : 'CONFIRMED'}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Call with RMAST Studio',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];
  return lines.join('\r\n') + '\r\n';
}

export function googleCalendarLink(e: Pick<InviteDetails, 'start' | 'end' | 'title' | 'description' | 'location'>): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${icsStamp(e.start)}/${icsStamp(e.end)}`,
    details: e.description,
    ...(e.location ? { location: e.location } : {})
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}
