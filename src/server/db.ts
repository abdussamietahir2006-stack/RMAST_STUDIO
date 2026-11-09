import { MongoClient, type Db } from 'mongodb';
import type { InquiryStatus, LeadCategory, LegacyLeadDivision, MediaKind, AdminUser, PostSize, SocialPost, SocialVideo, VideoStyle } from '../types/index.js';
import type { AuditLead, CallBooking } from '../data/records.js';
import type { Availability } from '../data/booking/calendar.js';

// A Free Audit submission (collection "audit_leads")
export interface AuditLeadDoc extends Omit<AuditLead, 'id' | 'createdAt'> {
  _id: string;
  createdAt: Date;
  publicToken: string; // lets the visitor's emailed booking link prefill the booking form
}

// A booked call (collection "call_bookings"). `active` is true while the booking holds its time slot;
// a unique index on slotStart for active bookings makes double-booking impossible.
export interface CallBookingDoc
  extends Omit<CallBooking, 'id' | 'createdAt' | 'slotStart' | 'slotEnd' | 'meetingLinkSentAt' | 'auditScore' | 'auditMainAssistant'> {
  _id: string;
  createdAt: Date;
  slotStart: Date;
  slotEnd: Date;
  active: boolean;
  manageTokenHash: string; // sha256 of the token in the visitor's reschedule / cancel link
  meetingLinkSentAt: Date | null;
  reminder24SentAt: Date | null;
  reminder1SentAt: Date | null;
}

// ---------------------------------------------------------------------------
// Document shapes
// ---------------------------------------------------------------------------

export interface LeadDoc {
  _id: string;
  createdAt: Date;
  status: InquiryStatus;
  // Leads saved before the three Assistants keep their legacy division ('real-estate' / 'ai-content')
  category: { division: LeadCategory['division'] | LegacyLeadDivision; group: string };
  targetTitle: string;
  division: string;
  estimatedPrice: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  clientLocation: string;
  timeline: string;
  notes: string;
  dispatchMethod: 'whatsapp' | 'email' | 'form' | 'contact-form';
}

export interface UserDoc {
  _id: string;
  email: string;
  name: string;
  role: AdminUser['role'];
  passwordHash: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface SessionDoc {
  _id: string; // sha256 of the session token; the raw token only lives in the cookie
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  ip: string;
  userAgent: string;
}

export interface CounterDoc {
  _id: string;
  count: number;
  expiresAt: Date;
}

export interface MediaDoc {
  _id: string; // media slot key
  kind: MediaKind;
  url: string;
  pathname: string;
  contentType: string;
  size: number;
  poster?: string; // videos: first-frame image shown while the video loads
  updatedAt: Date;
  updatedBy: string;
}

// A generated Instagram carousel (dates stored as Date, returned to the dashboard as strings)
export interface SocialPostDoc extends Omit<SocialPost, 'id' | 'createdAt' | 'style' | 'seed' | 'size'> {
  _id: string;
  createdAt: Date;
  style?: VideoStyle; // missing on posts made before looks existed
  seed?: number;
  size?: PostSize; // missing on posts made before sizes existed (1080x1350)
}

// Dashboard switches (one document per area, e.g. _id "social")
export interface SettingsDoc {
  _id: string;
  autoPost?: boolean;
  availability?: Availability; // _id "booking": when visitors can book a call
  updatedAt: Date;
  updatedBy: string;
}

// A motion-graphics reel script made from the founder's idea (the MP4 is rendered in the browser)
export interface SocialVideoDoc extends Omit<SocialVideo, 'id' | 'createdAt' | 'size'> {
  _id: string;
  createdAt: Date;
  day: string;
  size?: PostSize; // missing on videos made before sizes existed (1080x1920)
}

// ---------------------------------------------------------------------------
// Connection (cached across serverless invocations)
// ---------------------------------------------------------------------------

declare global {
  var __rmastMongo: Promise<MongoClient> | undefined;
  var __rmastIndexes: Promise<void> | undefined;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) throw new Error('MONGODB_URI is not configured');

  if (!globalThis.__rmastMongo) {
    const client = new MongoClient(uri, {
      appName: 'rmast-studio',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000
    });
    globalThis.__rmastMongo = client.connect().catch((err) => {
      globalThis.__rmastMongo = undefined;
      throw err;
    });
  }

  const client = await globalThis.__rmastMongo;
  // Own database by default so the website never mixes with other apps on the same cluster
  const db = client.db(process.env.MONGODB_DB?.trim() || 'rmast_studio');

  if (!globalThis.__rmastIndexes) {
    globalThis.__rmastIndexes = ensureIndexes(db).catch((err) => {
      globalThis.__rmastIndexes = undefined;
      throw err;
    });
  }
  await globalThis.__rmastIndexes;
  return db;
}

async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection<UserDoc>('users').createIndex({ email: 1 }, { unique: true }),
    db.collection<SessionDoc>('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection<SessionDoc>('sessions').createIndex({ userId: 1 }),
    db.collection<CounterDoc>('counters').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection<LeadDoc>('leads').createIndex({ createdAt: -1 }),
    db.collection<LeadDoc>('leads').createIndex({ 'category.division': 1, 'category.group': 1, createdAt: -1 }),
    db.collection<SocialPostDoc>('social_posts').createIndex({ createdAt: -1 }),
    db.collection<SocialVideoDoc>('social_videos').createIndex({ createdAt: -1 }),
    db.collection<AuditLeadDoc>('audit_leads').createIndex({ createdAt: -1 }),
    db.collection<AuditLeadDoc>('audit_leads').createIndex({ publicToken: 1 }, { unique: true }),
    db.collection<CallBookingDoc>('call_bookings').createIndex({ slotStart: 1 }),
    db.collection<CallBookingDoc>('call_bookings').createIndex({ manageTokenHash: 1 }, { unique: true }),
    db.collection<CallBookingDoc>('call_bookings').createIndex({ auditLeadId: 1 }),
    // One active booking per time slot, even if two visitors confirm the same slot at the same moment
    db
      .collection<CallBookingDoc>('call_bookings')
      .createIndex({ slotStart: 1 }, { unique: true, partialFilterExpression: { active: true }, name: 'one_booking_per_slot' }),
    // At most one automatic idea per day, even if the cron and the dashboard ask at the same time
    db
      .collection<SocialPostDoc>('social_posts')
      .createIndex({ day: 1 }, { unique: true, partialFilterExpression: { auto: true }, name: 'one_auto_post_per_day' })
  ]);
}

export const collections = {
  leads: async () => (await getDb()).collection<LeadDoc>('leads'),
  users: async () => (await getDb()).collection<UserDoc>('users'),
  sessions: async () => (await getDb()).collection<SessionDoc>('sessions'),
  counters: async () => (await getDb()).collection<CounterDoc>('counters'),
  media: async () => (await getDb()).collection<MediaDoc>('media'),
  socialPosts: async () => (await getDb()).collection<SocialPostDoc>('social_posts'),
  socialVideos: async () => (await getDb()).collection<SocialVideoDoc>('social_videos'),
  settings: async () => (await getDb()).collection<SettingsDoc>('settings'),
  auditLeads: async () => (await getDb()).collection<AuditLeadDoc>('audit_leads'),
  bookings: async () => (await getDb()).collection<CallBookingDoc>('call_bookings')
};
