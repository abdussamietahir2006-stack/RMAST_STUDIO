import crypto from 'node:crypto';
import type { Filter } from 'mongodb';
import type {
  DispatchMethod,
  InquiryStatus,
  LeadCategory,
  LeadDivision,
  LeadInput,
  LeadRouting,
  LeadStats,
  StoredInquiry
} from '../types/index.js';
import { servicesData } from '../data/servicesData.js';
import { ASSISTANTS } from '../data/assistantsData.js';
import { LEAD_DIVISIONS, normalizeCategory, storedCategoriesFor } from '../data/leadFolders.js';
import { collections, type LeadDoc } from './db.js';
import { EMAIL_RE, str } from './security.js';

export const DISPATCH_METHODS: DispatchMethod[] = ['whatsapp', 'email', 'form', 'contact-form'];
export const STATUSES: InquiryStatus[] = ['new', 'reviewed', 'contacted'];
// Divisions a form may send: the current ones, and the legacy ones older pages still send
const ROUTING_DIVISIONS: NonNullable<LeadRouting['divisionKey']>[] = [...LEAD_DIVISIONS, 'real-estate', 'ai-content'];

export function parseLead(body: unknown): LeadInput | string {
  const b = (body ?? {}) as Record<string, unknown>;
  const lead: LeadInput = {
    targetTitle: str(b.targetTitle, 200) || 'General Inquiry',
    division: str(b.division, 100) || 'Studio Architecture',
    estimatedPrice: str(b.estimatedPrice, 100),
    clientName: str(b.clientName, 120),
    clientEmail: str(b.clientEmail, 200),
    clientPhone: str(b.clientPhone, 40),
    clientCompany: str(b.clientCompany, 200),
    clientLocation: str(b.clientLocation, 120),
    timeline: str(b.timeline, 120),
    notes: str(b.notes, 5000),
    dispatchMethod: b.dispatchMethod as DispatchMethod,
    serviceId: str(b.serviceId, 100) || undefined,
    packageId: str(b.packageId, 100) || undefined,
    divisionKey: ROUTING_DIVISIONS.find((d) => d === b.divisionKey),
    isPriced: b.isPriced === true
  };
  if (!lead.clientName) return 'Name is required';
  if (!EMAIL_RE.test(lead.clientEmail)) return 'A valid email is required';
  if (!DISPATCH_METHODS.includes(lead.dispatchMethod)) return 'Invalid dispatch method';
  return lead;
}

// Files a lead under Assistant > sub-service. "Full Team" and "not sure yet" have folders of their own.
export function categorize(input: LeadInput): LeadCategory {
  const assistant = ASSISTANTS.find((a) => a.id === input.divisionKey);
  if (assistant) {
    const service = assistant.subServices.find((s) => s.id === input.serviceId);
    return { division: assistant.id, group: service ? service.id : 'general' };
  }
  if (input.divisionKey === 'full-team') return { division: 'full-team', group: 'general' };

  // Older pages (and the package popup) send an old service slug or division: file it where it belongs now
  const service = input.serviceId
    ? servicesData.find((s) => s.id === input.serviceId || s.slug === input.serviceId)
    : undefined;
  if (service) return normalizeCategory({ division: service.division, group: service.slug });

  const division = input.divisionKey ?? 'general';
  const group = input.packageId || input.isPriced ? 'packages' : 'general';
  return normalizeCategory({ division, group });
}

export function newLead(input: LeadInput): StoredInquiry {
  const { serviceId: _s, packageId: _p, divisionKey: _d, isPriced: _i, ...fields } = input;
  return {
    ...fields,
    id: `inq-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    timestamp: new Date().toISOString(),
    status: 'new',
    category: categorize(input)
  };
}

export function toDoc(lead: StoredInquiry): LeadDoc {
  const { id, timestamp, ...rest } = lead;
  return { _id: id, createdAt: new Date(timestamp), ...rest };
}

function fromDoc(doc: LeadDoc): StoredInquiry {
  const { _id, createdAt, category, ...rest } = doc;
  return { ...rest, category: normalizeCategory(category), id: _id, timestamp: createdAt.toISOString() };
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function listLeads(query: Record<string, unknown>): Promise<StoredInquiry[]> {
  const filter: Filter<LeadDoc> = {};
  const division = str(query.division, 40);
  const group = str(query.group, 80);
  const status = str(query.status, 20);
  const q = str(query.q, 100);

  const and: Filter<LeadDoc>[] = [];
  if (LEAD_DIVISIONS.includes(division as LeadDivision)) {
    // A folder holds new leads filed there and older leads whose legacy category maps to it
    const folderGroup = group && /^[a-z0-9-]+$/.test(group) ? group : undefined;
    and.push({
      $or: storedCategoriesFor(division as LeadDivision, folderGroup).map((c) =>
        c.group ? { 'category.division': c.division, 'category.group': c.group } : { 'category.division': c.division }
      ) as Filter<LeadDoc>[]
    });
  }
  if (STATUSES.includes(status as InquiryStatus)) filter.status = status as InquiryStatus;
  if (q) {
    const re = new RegExp(escapeRegex(q), 'i');
    and.push({ $or: [{ clientName: re }, { clientEmail: re }, { clientCompany: re }, { targetTitle: re }] });
  }
  if (and.length) filter.$and = and;

  const limit = Math.min(500, Math.max(1, Number(query.limit) || 500));
  const docs = await (await collections.leads()).find(filter).sort({ createdAt: -1 }).limit(limit).toArray();
  return docs.map(fromDoc);
}

// Counts per stored category, regrouped into today's folders (older categories merge into their new folder)
function mergeFolders(rows: { _id: { division?: string; group?: string }; count: number; newCount: number }[]): LeadStats['byFolder'] {
  const merged = new Map<string, LeadStats['byFolder'][number]>();
  for (const row of rows) {
    const { division, group } = normalizeCategory(row._id);
    const key = `${division}/${group}`;
    const entry = merged.get(key) ?? { division, group, count: 0, newCount: 0 };
    entry.count += row.count;
    entry.newCount += row.newCount;
    merged.set(key, entry);
  }
  return [...merged.values()].sort((a, b) => b.count - a.count);
}

function safeTimeZone(tz: unknown): string {
  const zone = str(tz, 60);
  try {
    if (zone) {
      new Intl.DateTimeFormat('en-US', { timeZone: zone });
      return zone;
    }
  } catch {
    // Invalid zone name
  }
  return 'UTC';
}

export async function leadStats(tzInput: unknown): Promise<LeadStats> {
  const timeZone = safeTimeZone(tzInput);
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  const since30 = new Date(now - 30 * day);
  const since7 = new Date(now - 7 * day);

  const [result] = await (await collections.leads())
    .aggregate<{
      total: { n: number }[];
      byStatus: { _id: InquiryStatus; n: number }[];
      byFolder: { _id: { division?: string; group?: string }; count: number; newCount: number }[];
      last7: { n: number }[];
      daily: { _id: string; n: number }[];
    }>([
      {
        $facet: {
          total: [{ $count: 'n' }],
          byStatus: [{ $group: { _id: '$status', n: { $sum: 1 } } }],
          byFolder: [
            {
              $group: {
                _id: { division: '$category.division', group: '$category.group' },
                count: { $sum: 1 },
                newCount: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } }
              }
            }
          ],
          last7: [{ $match: { createdAt: { $gte: since7 } } }, { $count: 'n' }],
          daily: [
            { $match: { createdAt: { $gte: since30 } } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: timeZone } },
                n: { $sum: 1 }
              }
            }
          ]
        }
      }
    ])
    .toArray();

  const byStatus: Record<InquiryStatus, number> = { new: 0, reviewed: 0, contacted: 0 };
  for (const s of result.byStatus) if (s._id in byStatus) byStatus[s._id] = s.n;

  // Fill every one of the last 30 days (in the viewer's time zone) so the chart has no gaps
  const dayKey = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const counts = new Map(result.daily.map((d) => [d._id, d.n]));
  const daily: LeadStats['daily'] = [];
  for (let i = 29; i >= 0; i--) {
    const date = dayKey.format(new Date(now - i * day));
    daily.push({ date, count: counts.get(date) ?? 0 });
  }

  return {
    total: result.total[0]?.n ?? 0,
    newCount: byStatus.new,
    last7Days: result.last7[0]?.n ?? 0,
    last30Days: daily.reduce((sum, d) => sum + d.count, 0),
    byStatus,
    byFolder: mergeFolders(result.byFolder),
    daily
  };
}
