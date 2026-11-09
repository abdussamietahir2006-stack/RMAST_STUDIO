// Free Audit submissions: validation, storage (MongoDB + the PNG in Vercel Blob), emails and the
// dashboard's list / detail queries.
import crypto from 'node:crypto';
import type { Request } from 'express';
import type { Filter, Sort } from 'mongodb';
import { del, put } from '@vercel/blob';
import { ASSISTANTS, type AssistantId } from '../data/assistantsData.js';
import { cleanAnswers } from '../data/audit/validate.js';
import { computeAudit } from '../data/audit/scoring.js';
import { AUDIT_STATUSES, type AuditLead, type AuditLeadRow, type AuditListResponse, type AuditStatus, type BookingPrefill } from '../data/records.js';
import { collections, isDbConfigured, type AuditLeadDoc } from './db.js';
import { isBlobConfigured } from './media.js';
import { notifyAddress, sendEmail, type EmailAttachment } from './mail.js';
import { auditAdminEmail, auditVisitorEmail } from './emails.js';
import { str } from './security.js';

const MAX_PNG_BYTES = 3 * 1024 * 1024;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function decodePng(dataUrl: unknown): Buffer | null {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/png;base64,')) return null;
  const buf = Buffer.from(dataUrl.slice('data:image/png;base64,'.length), 'base64');
  if (buf.length > MAX_PNG_BYTES || buf.length < 1000 || !buf.subarray(0, 8).equals(PNG_MAGIC)) return null;
  return buf;
}

export interface SubmitOutcome {
  status: number;
  body: Record<string, unknown>;
}

export async function submitAudit(req: Request): Promise<SubmitOutcome> {
  const body = (req.body ?? {}) as Record<string, unknown>;
  // Honeypot: a hidden field people never see. Bots fill it in; pretend it worked and keep nothing.
  if (str(body.fax, 200)) return { status: 201, body: { id: 'ok', token: '' } };

  const answers = cleanAnswers(body.answers);
  if (typeof answers === 'string') return { status: 400, body: { error: answers } };

  // Scores are always recalculated here, so a visitor can't send their own
  const result = computeAudit(answers);
  const id = crypto.randomBytes(8).toString('hex');
  const publicToken = crypto.randomBytes(18).toString('base64url');
  const png = decodePng(body.png);

  let pngUrl: string | null = null;
  if (png && isBlobConfigured()) {
    try {
      const blob = await put(`audits/${id}.png`, png, { access: 'public', contentType: 'image/png', addRandomSuffix: true });
      pngUrl = blob.url;
    } catch (err) {
      console.error('Failed to store audit PNG', err);
    }
  }

  const socials: Record<string, string> = {};
  for (const k of ['instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'google'] as const) if (answers[k]) socials[k] = answers[k];

  const doc: AuditLeadDoc = {
    _id: id,
    createdAt: new Date(),
    publicToken,
    businessName: answers.businessName,
    contactName: answers.name,
    role: answers.role,
    email: answers.email,
    phone: answers.phone,
    country: answers.country,
    city: answers.city,
    businessType: answers.businessType,
    website: answers.website,
    socials,
    answers,
    result,
    overallScore: result.overall,
    mainAssistant: result.main,
    pngUrl,
    status: 'new',
    notes: '',
    consent: answers.consent,
    meta: {
      pageUrl: str(body.pageUrl, 300),
      referrer: str(body.referrer, 300),
      userAgent: str(req.get('user-agent'), 300),
      country: str(req.get('x-vercel-ip-country'), 8)
    }
  };

  let stored = false;
  if (isDbConfigured()) {
    try {
      await (await collections.auditLeads()).insertOne(doc);
      stored = true;
    } catch (err) {
      console.error('Failed to store audit', err);
    }
  }

  // Emails are sent before replying: on Vercel the function stops as soon as the response is sent
  const attachments: EmailAttachment[] = png
    ? [{ filename: `RMAST-audit-${answers.businessName.replace(/[^\w-]+/g, '-').slice(0, 40) || 'business'}.png`, content: png, contentType: 'image/png' }]
    : [];
  const admin = auditAdminEmail(doc);
  const emailed = await sendEmail({
    to: notifyAddress(),
    replyTo: `"${answers.name.replace(/["\r\n]/g, '')}" <${answers.email}>`,
    ...admin,
    attachments
  });
  if (answers.consent) {
    await sendEmail({ to: answers.email, replyTo: notifyAddress(), ...auditVisitorEmail(doc), attachments });
  }

  if (!stored && !emailed) console.error(`Audit ${id} from ${answers.email} was neither stored nor emailed`);
  return { status: 201, body: { id, token: publicToken, stored, emailed } };
}

// Booking popup prefill from the token in the visitor's emailed link
export async function auditPrefill(token: string): Promise<BookingPrefill | null> {
  if (!/^[\w-]{20,40}$/.test(token)) return null;
  const doc = await (await collections.auditLeads()).findOne({ publicToken: token });
  if (!doc) return null;
  return {
    name: doc.contactName,
    business: doc.businessName,
    email: doc.email,
    phone: doc.phone,
    role: doc.role,
    country: doc.country,
    city: doc.city,
    mainAssistant: doc.mainAssistant,
    auditToken: token
  };
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

function toAudit(doc: AuditLeadDoc): AuditLead {
  const { _id, createdAt, publicToken: _t, ...rest } = doc;
  return { ...rest, id: _id, createdAt: createdAt.toISOString() };
}

function toRow(doc: AuditLeadDoc): AuditLeadRow {
  const { answers: _a, result: _r, meta: _m, notes: _n, ...row } = toAudit(doc);
  return row;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function listAudits(query: Record<string, unknown>): Promise<AuditListResponse> {
  const filter: Filter<AuditLeadDoc> = {};
  const q = str(query.q, 100);
  const assistant = str(query.assistant, 20);
  const status = str(query.status, 30);
  const country = str(query.country, 40);
  const minScore = Number(query.minScore);
  const maxScore = Number(query.maxScore);
  const from = str(query.from, 10);
  const to = str(query.to, 10);

  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ businessName: re }, { contactName: re }, { email: re }];
  }
  if (ASSISTANTS.some((a) => a.id === assistant)) filter.mainAssistant = assistant as AssistantId;
  if ((AUDIT_STATUSES as readonly string[]).includes(status)) filter.status = status as AuditStatus;
  if (country) filter.country = country;
  if (Number.isFinite(minScore) || Number.isFinite(maxScore)) {
    filter.overallScore = {
      ...(Number.isFinite(minScore) && query.minScore !== '' ? { $gte: minScore } : {}),
      ...(Number.isFinite(maxScore) && query.maxScore !== '' ? { $lte: maxScore } : {})
    };
  }
  const dateRange: { $gte?: Date; $lt?: Date } = {};
  if (/^\d{4}-\d{2}-\d{2}$/.test(from)) dateRange.$gte = new Date(`${from}T00:00:00Z`);
  if (/^\d{4}-\d{2}-\d{2}$/.test(to)) dateRange.$lt = new Date(new Date(`${to}T00:00:00Z`).getTime() + 86_400_000);
  if (dateRange.$gte || dateRange.$lt) filter.createdAt = dateRange;

  const sortKey = query.sort === 'score' ? 'overallScore' : 'createdAt';
  const dir = query.dir === 'asc' ? 1 : -1;
  const sort: Sort = { [sortKey]: dir, _id: dir };
  const all = query.all === '1';
  const pageSize = all ? 5000 : Math.min(100, Math.max(5, Number(query.pageSize) || 25));
  const page = all ? 1 : Math.max(1, Number(query.page) || 1);

  const col = await collections.auditLeads();
  const weekAgo = new Date(Date.now() - 7 * 86_400_000);
  const [docs, total, counters] = await Promise.all([
    col.find(filter).sort(sort).skip((page - 1) * pageSize).limit(pageSize).toArray(),
    col.countDocuments(filter),
    col
      .aggregate<{ total: { n: number }[]; week: { n: number }[]; fresh: { n: number }[]; byAssistant: { _id: AssistantId; n: number }[] }>([
        {
          $facet: {
            total: [{ $count: 'n' }],
            week: [{ $match: { createdAt: { $gte: weekAgo } } }, { $count: 'n' }],
            fresh: [{ $match: { status: 'new' } }, { $count: 'n' }],
            byAssistant: [{ $group: { _id: '$mainAssistant', n: { $sum: 1 } } }]
          }
        }
      ])
      .toArray()
  ]);
  const c = counters[0];
  const byAssistant = { technical: 0, creative: 0, virtual: 0 } as Record<AssistantId, number>;
  for (const row of c?.byAssistant ?? []) if (row._id in byAssistant) byAssistant[row._id] = row.n;

  return {
    items: docs.map(toRow),
    total,
    page,
    pageSize,
    counters: { total: c?.total[0]?.n ?? 0, thisWeek: c?.week[0]?.n ?? 0, new: c?.fresh[0]?.n ?? 0, byAssistant }
  };
}

export async function getAudit(id: string): Promise<AuditLead | null> {
  const doc = await (await collections.auditLeads()).findOne({ _id: id });
  return doc ? toAudit(doc) : null;
}

export async function updateAudit(id: string, body: Record<string, unknown>): Promise<'ok' | 'not-found' | string> {
  const update: Partial<AuditLeadDoc> = {};
  if (body.status !== undefined) {
    if (!(AUDIT_STATUSES as readonly unknown[]).includes(body.status)) return 'Invalid status';
    update.status = body.status as AuditStatus;
  }
  if (body.notes !== undefined) {
    if (typeof body.notes !== 'string') return 'Invalid notes';
    update.notes = body.notes.slice(0, 10_000);
  }
  if (!Object.keys(update).length) return 'Nothing to update';
  const result = await (await collections.auditLeads()).updateOne({ _id: id }, { $set: update });
  return result.matchedCount ? 'ok' : 'not-found';
}

export async function deleteAudit(id: string): Promise<boolean> {
  const col = await collections.auditLeads();
  const doc = await col.findOneAndDelete({ _id: id });
  if (!doc) return false;
  if (doc.pngUrl && isBlobConfigured()) await del(doc.pngUrl).catch((err) => console.error('Failed to delete audit PNG', err));
  return true;
}

// Marks the visitor's audit "Meeting booked" when they book a call from it
export async function markMeetingBooked(auditLeadId: string): Promise<void> {
  await (await collections.auditLeads()).updateOne(
    { _id: auditLeadId, status: { $in: ['new', 'contacted'] } },
    { $set: { status: 'meeting-booked' } }
  );
}

export async function auditByToken(token: string): Promise<AuditLeadDoc | null> {
  if (!/^[\w-]{20,40}$/.test(token)) return null;
  return (await collections.auditLeads()).findOne({ publicToken: token });
}
