// Call bookings: open slots, booking, the visitor's reschedule / cancel link, reminders and the
// dashboard's queries. All times are stored in UTC.
import crypto from 'node:crypto';
import type { Request } from 'express';
import type { Filter } from 'mongodb';
import { ROLES } from '../data/audit/questions.js';
import { EMAIL_RE } from '../data/audit/validate.js';
import {
  availableSlots,
  BOOKING_STATUSES,
  BOOKING_TOPICS,
  buildIcs,
  cleanAvailability,
  DEFAULT_AVAILABILITY,
  holdsSlot,
  isValidTimeZone,
  MEETING_TYPES,
  type Availability,
  type BookedRange,
  type BookingStatus,
  type MeetingType
} from '../data/booking/calendar.js';
import type { CallBooking, PublicBooking } from '../data/records.js';
import { collections, type AuditLeadDoc, type CallBookingDoc, type UserDoc } from './db.js';
import { auditByToken, markMeetingBooked } from './audits.js';
import { notifyAddress, sendEmail, type EmailAttachment } from './mail.js';
import { bookingAdminEmail, bookingVisitorEmail, inviteFor, meetingLinkEmail, reminderEmail } from './emails.js';
import { str } from './security.js';

const SETTINGS_ID = 'booking';
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

export async function getAvailability(): Promise<Availability> {
  const doc = await (await collections.settings()).findOne({ _id: SETTINGS_ID });
  return doc?.availability ?? DEFAULT_AVAILABILITY;
}

export async function saveAvailability(raw: unknown, user: UserDoc): Promise<Availability | string> {
  const clean = cleanAvailability(raw);
  if (typeof clean === 'string') return clean;
  await (await collections.settings()).updateOne(
    { _id: SETTINGS_ID },
    { $set: { availability: clean, updatedAt: new Date(), updatedBy: user.email } },
    { upsert: true }
  );
  return clean;
}

async function bookedRanges(exceptId?: string): Promise<BookedRange[]> {
  const docs = await (await collections.bookings())
    .find({ active: true, slotEnd: { $gt: new Date(Date.now() - 86_400_000) }, ...(exceptId ? { _id: { $ne: exceptId } } : {}) })
    .project<{ slotStart: Date; slotEnd: Date }>({ slotStart: 1, slotEnd: 1 })
    .toArray();
  return docs.map((d) => ({ start: d.slotStart.getTime(), end: d.slotEnd.getTime() }));
}

export async function openSlots(exceptId?: string): Promise<{ slots: string[]; slotMinutes: number }> {
  const settings = await getAvailability();
  const slots = availableSlots(settings, Date.now(), await bookedRanges(exceptId));
  return { slots: slots.map((s) => new Date(s).toISOString()), slotMinutes: settings.slotMinutes };
}

// The slot must still be open right now (re-checked on the server, whatever the browser showed)
async function checkSlot(raw: unknown, exceptId?: string): Promise<{ start: Date; end: Date } | string> {
  const start = typeof raw === 'string' ? Date.parse(raw) : NaN;
  if (!Number.isFinite(start)) return 'Please choose a time.';
  const settings = await getAvailability();
  const open = availableSlots(settings, Date.now(), await bookedRanges(exceptId));
  if (!open.includes(start)) return 'That time is no longer available. Please pick another.';
  return { start: new Date(start), end: new Date(start + settings.slotMinutes * 60_000) };
}

const isDuplicate = (err: unknown) => (err as { code?: number })?.code === 11000;
const SLOT_TAKEN = 'Someone just booked that time. Please pick another.';

function icsAttachment(b: CallBookingDoc, forFounder: boolean, cancelled = false): EmailAttachment {
  return {
    filename: cancelled ? 'cancelled-call.ics' : 'rmast-call.ics',
    content: buildIcs(inviteFor(b, forFounder, cancelled)),
    contentType: `text/calendar; charset=utf-8; method=${cancelled ? 'CANCEL' : 'PUBLISH'}`
  };
}

async function linkedAudit(b: CallBookingDoc): Promise<AuditLeadDoc | null> {
  return b.auditLeadId ? (await collections.auditLeads()).findOne({ _id: b.auditLeadId }) : null;
}

async function notifyBoth(b: CallBookingDoc, manageToken: string | null, kind: 'new' | 'rescheduled' | 'cancelled') {
  const cancelled = kind === 'cancelled';
  await sendEmail({
    to: notifyAddress(),
    replyTo: `"${b.name.replace(/["\r\n]/g, '')}" <${b.email}>`,
    ...bookingAdminEmail(b, await linkedAudit(b), kind),
    attachments: [icsAttachment(b, true, cancelled)]
  });
  // The cancellation email has no reschedule link, so it needs no token
  await sendEmail({ to: b.email, replyTo: notifyAddress(), ...bookingVisitorEmail(b, manageToken ?? '', kind), attachments: [icsAttachment(b, false, cancelled)] });
}

// ---------------------------------------------------------------------------
// Visitor: book, view, reschedule, cancel
// ---------------------------------------------------------------------------

export async function createBooking(req: Request): Promise<{ status: number; body: Record<string, unknown> }> {
  const b = (req.body ?? {}) as Record<string, unknown>;
  if (str(b.fax, 200)) return { status: 201, body: { id: 'ok' } }; // honeypot

  const name = str(b.name, 120);
  const business = str(b.business, 120);
  const email = str(b.email, 200);
  const phone = str(b.phone, 40);
  const role = str(b.role, 40);
  const meetingType = str(b.meetingType, 40) as MeetingType;
  const timezone = str(b.timezone, 60);
  const notes = str(b.notes, 300);
  const topics = (BOOKING_TOPICS as readonly string[]).filter((t) => Array.isArray(b.topics) && b.topics.includes(t));

  if (!name) return { status: 400, body: { error: 'Please add your name.' } };
  if (!business) return { status: 400, body: { error: 'Please add your business name.' } };
  if (!EMAIL_RE.test(email)) return { status: 400, body: { error: 'Please enter a valid email address.' } };
  if (!/^\+\d[\d\s().-]{6,}$/.test(phone)) return { status: 400, body: { error: 'Please add your phone number with the country code, e.g. +1 555 123 4567.' } };
  if (!(ROLES as readonly string[]).includes(role)) return { status: 400, body: { error: 'Please choose your role.' } };
  if (!topics.length) return { status: 400, body: { error: 'Please choose what you want to discuss.' } };
  if (!(MEETING_TYPES as readonly string[]).includes(meetingType)) return { status: 400, body: { error: 'Please choose a meeting type.' } };
  if (!isValidTimeZone(timezone)) return { status: 400, body: { error: 'Unknown time zone.' } };
  if (b.consent !== true) return { status: 400, body: { error: 'Please agree to be contacted about your booking.' } };

  const slot = await checkSlot(b.slotStart);
  if (typeof slot === 'string') return { status: 409, body: { error: slot } };

  const audit = typeof b.auditToken === 'string' ? await auditByToken(b.auditToken) : null;
  const manageToken = crypto.randomBytes(24).toString('base64url');
  const doc: CallBookingDoc = {
    _id: crypto.randomBytes(8).toString('hex'),
    createdAt: new Date(),
    auditLeadId: audit?._id ?? null,
    name,
    business,
    email,
    phone,
    role,
    topics,
    meetingType,
    slotStart: slot.start,
    slotEnd: slot.end,
    visitorTimezone: timezone,
    notes,
    status: 'scheduled',
    adminNotes: '',
    meetingLink: '',
    meetingLinkSentAt: null,
    active: true,
    manageTokenHash: hashToken(manageToken),
    reminder24SentAt: null,
    reminder1SentAt: null
  };

  try {
    await (await collections.bookings()).insertOne(doc);
  } catch (err) {
    if (isDuplicate(err)) return { status: 409, body: { error: SLOT_TAKEN } };
    throw err;
  }
  if (audit) await markMeetingBooked(audit._id).catch((err) => console.error('Failed to update audit status', err));
  await notifyBoth(doc, manageToken, 'new');

  return {
    status: 201,
    body: { id: doc._id, slotStart: doc.slotStart.toISOString(), slotEnd: doc.slotEnd.toISOString(), meetingType }
  };
}

const canChange = (doc: CallBookingDoc) =>
  doc.active && (doc.status === 'scheduled' || doc.status === 'rescheduled') && doc.slotStart.getTime() > Date.now();

function toPublic(doc: CallBookingDoc): PublicBooking {
  return {
    name: doc.name,
    business: doc.business,
    meetingType: doc.meetingType,
    slotStart: doc.slotStart.toISOString(),
    slotEnd: doc.slotEnd.toISOString(),
    visitorTimezone: doc.visitorTimezone,
    status: doc.status,
    canChange: canChange(doc)
  };
}

async function byToken(token: string): Promise<CallBookingDoc | null> {
  if (!/^[\w-]{20,60}$/.test(token)) return null;
  return (await collections.bookings()).findOne({ manageTokenHash: hashToken(token) });
}

export async function publicBooking(token: string): Promise<PublicBooking | null> {
  const doc = await byToken(token);
  return doc ? toPublic(doc) : null;
}

export async function slotsForReschedule(token: string): Promise<{ slots: string[]; slotMinutes: number } | null> {
  const doc = await byToken(token);
  return doc && canChange(doc) ? openSlots(doc._id) : null;
}

export async function cancelByVisitor(token: string): Promise<PublicBooking | string | null> {
  const doc = await byToken(token);
  if (!doc) return null;
  if (!canChange(doc)) return 'This booking can no longer be changed.';
  const updated = await (await collections.bookings()).findOneAndUpdate(
    { _id: doc._id },
    { $set: { status: 'cancelled', active: false } },
    { returnDocument: 'after' }
  );
  if (updated) await notifyBoth(updated, null, 'cancelled');
  return updated ? toPublic(updated) : null;
}

export async function rescheduleByVisitor(token: string, slotRaw: unknown): Promise<PublicBooking | string | null> {
  const doc = await byToken(token);
  if (!doc) return null;
  if (!canChange(doc)) return 'This booking can no longer be changed.';
  const slot = await checkSlot(slotRaw, doc._id);
  if (typeof slot === 'string') return slot;
  try {
    const updated = await (await collections.bookings()).findOneAndUpdate(
      { _id: doc._id },
      { $set: { slotStart: slot.start, slotEnd: slot.end, status: 'rescheduled', reminder24SentAt: null, reminder1SentAt: null } },
      { returnDocument: 'after' }
    );
    if (updated) await notifyBoth(updated, token, 'rescheduled');
    return updated ? toPublic(updated) : null;
  } catch (err) {
    if (isDuplicate(err)) return SLOT_TAKEN;
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function toBooking(doc: CallBookingDoc, audit?: Pick<AuditLeadDoc, 'overallScore' | 'mainAssistant'> | null): CallBooking {
  const { _id, createdAt, slotStart, slotEnd, meetingLinkSentAt, active: _a, manageTokenHash: _h, reminder24SentAt: _r1, reminder1SentAt: _r2, ...rest } = doc;
  return {
    ...rest,
    id: _id,
    createdAt: createdAt.toISOString(),
    slotStart: slotStart.toISOString(),
    slotEnd: slotEnd.toISOString(),
    meetingLinkSentAt: meetingLinkSentAt ? meetingLinkSentAt.toISOString() : null,
    auditScore: audit?.overallScore ?? null,
    auditMainAssistant: audit?.mainAssistant ?? null
  };
}

export async function listBookings(query: Record<string, unknown>): Promise<CallBooking[]> {
  const now = new Date();
  const filter: Filter<CallBookingDoc> = {};
  const tab = query.tab === 'past' ? 'past' : 'upcoming';
  filter.slotEnd = tab === 'past' ? { $lte: now } : { $gt: now };
  const status = str(query.status, 20);
  if ((BOOKING_STATUSES as readonly string[]).includes(status)) filter.status = status as BookingStatus;
  const type = str(query.type, 40);
  if ((MEETING_TYPES as readonly string[]).includes(type)) filter.meetingType = type as MeetingType;
  const from = str(query.from, 10);
  const to = str(query.to, 10);
  const range: { $gte?: Date; $lt?: Date } = {};
  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) range.$gte = new Date(`${from}T00:00:00+05:00`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) range.$lt = new Date(new Date(`${to}T00:00:00+05:00`).getTime() + 86_400_000);
  if (range.$gte || range.$lt) filter.slotStart = range;

  const docs = await (await collections.bookings())
    .find(filter)
    .sort({ slotStart: tab === 'past' ? -1 : 1 })
    .limit(500)
    .toArray();
  const ids = [...new Set(docs.map((d) => d.auditLeadId).filter((x): x is string => Boolean(x)))];
  const audits = ids.length
    ? await (await collections.auditLeads()).find({ _id: { $in: ids } }).project<Pick<AuditLeadDoc, '_id' | 'overallScore' | 'mainAssistant'>>({ overallScore: 1, mainAssistant: 1 }).toArray()
    : [];
  const byId = new Map(audits.map((a) => [a._id, a]));
  return docs.map((d) => toBooking(d, d.auditLeadId ? byId.get(d.auditLeadId) : null));
}

export async function getBooking(id: string): Promise<CallBooking | null> {
  const doc = await (await collections.bookings()).findOne({ _id: id });
  if (!doc) return null;
  return toBooking(doc, await linkedAudit(doc));
}

export async function bookingsForAudit(auditLeadId: string): Promise<CallBooking[]> {
  const docs = await (await collections.bookings()).find({ auditLeadId }).sort({ slotStart: -1 }).toArray();
  return docs.map((d) => toBooking(d));
}

export async function updateBooking(id: string, body: Record<string, unknown>): Promise<'ok' | 'not-found' | string> {
  const set: Partial<CallBookingDoc> = {};
  if (body.status !== undefined) {
    if (!(BOOKING_STATUSES as readonly unknown[]).includes(body.status)) return 'Invalid status';
    set.status = body.status as BookingStatus;
    set.active = holdsSlot(set.status);
  }
  if (body.adminNotes !== undefined) {
    if (typeof body.adminNotes !== 'string') return 'Invalid notes';
    set.adminNotes = body.adminNotes.slice(0, 10_000);
  }
  if (body.meetingLink !== undefined) {
    const link = str(body.meetingLink, 500);
    if (link && !/^https:\/\/\S+$/i.test(link)) return 'The meeting link must start with https://';
    set.meetingLink = link;
  }
  if (!Object.keys(set).length) return 'Nothing to update';
  try {
    const result = await (await collections.bookings()).updateOne({ _id: id }, { $set: set });
    return result.matchedCount ? 'ok' : 'not-found';
  } catch (err) {
    if (isDuplicate(err)) return 'Another booking now holds this time slot, so it can’t be reopened.';
    throw err;
  }
}

export async function sendMeetingLink(id: string, linkRaw: unknown): Promise<'ok' | 'not-found' | string> {
  const link = str(linkRaw, 500);
  if (!/^https:\/\/\S+$/i.test(link)) return 'Paste a meeting link that starts with https://';
  const col = await collections.bookings();
  const doc = await col.findOneAndUpdate({ _id: id }, { $set: { meetingLink: link } }, { returnDocument: 'after' });
  if (!doc) return 'not-found';
  const sent = await sendEmail({ to: doc.email, replyTo: notifyAddress(), ...meetingLinkEmail(doc) });
  if (!sent) return 'The link was saved, but the email could not be sent. Check the email settings.';
  await col.updateOne({ _id: id }, { $set: { meetingLinkSentAt: new Date() } });
  return 'ok';
}

// Upcoming calls for the dashboard home: today (in the founder's time zone) and the next 7 days
export async function bookingSummary(tzRaw: unknown): Promise<{ today: number; week: number }> {
  const tz = isValidTimeZone(str(tzRaw, 60)) ? str(tzRaw, 60) : 'Asia/Karachi';
  const now = Date.now();
  const docs = await (await collections.bookings())
    .find({ active: true, status: { $in: ['scheduled', 'rescheduled'] }, slotEnd: { $gt: new Date(now) }, slotStart: { $lt: new Date(now + 7 * 86_400_000) } })
    .project<{ slotStart: Date }>({ slotStart: 1 })
    .toArray();
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  const today = fmt.format(now);
  return { today: docs.filter((d) => fmt.format(d.slotStart) === today).length, week: docs.length };
}

// ---------------------------------------------------------------------------
// Reminders (run by Vercel Cron; each reminder is claimed before it is sent, so it goes out once)
// ---------------------------------------------------------------------------

export async function sendDueReminders(now = Date.now()): Promise<{ day: number; hour: number }> {
  const col = await collections.bookings();
  const sent = { day: 0, hour: 0 };
  const upcoming = { active: true, status: { $in: ['scheduled', 'rescheduled'] as BookingStatus[] }, slotStart: { $gt: new Date(now) } };

  for (const which of ['24h', '1h'] as const) {
    const field = which === '24h' ? 'reminder24SentAt' : 'reminder1SentAt';
    const window = which === '24h' ? 24 * 3_600_000 : 75 * 60_000;
    for (;;) {
      const doc = await col.findOneAndUpdate(
        {
          ...upcoming,
          slotStart: { $gt: new Date(now), $lte: new Date(now + window) },
          [field]: null,
          // No day-before reminder for calls booked in the last few hours (the confirmation was just sent)
          ...(which === '24h' ? { createdAt: { $lt: new Date(now - 3 * 3_600_000) } } : {})
        },
        { $set: { [field]: new Date(now) } },
        { returnDocument: 'after' }
      );
      if (!doc) break;
      await sendEmail({ to: doc.email, replyTo: notifyAddress(), ...reminderEmail(doc, which, false) });
      await sendEmail({ to: notifyAddress(), ...reminderEmail(doc, which, true) });
      sent[which === '24h' ? 'day' : 'hour']++;
    }
  }
  return sent;
}
