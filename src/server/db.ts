import { MongoClient, type Db } from 'mongodb';
import type { InquiryStatus, LeadCategory, MediaKind, AdminUser, SocialPost, SocialVideo, VideoStyle } from '../types/index.js';

// ---------------------------------------------------------------------------
// Document shapes
// ---------------------------------------------------------------------------

export interface LeadDoc {
  _id: string;
  createdAt: Date;
  status: InquiryStatus;
  category: LeadCategory;
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
  updatedAt: Date;
  updatedBy: string;
}

// A generated Instagram carousel (dates stored as Date, returned to the dashboard as strings)
export interface SocialPostDoc extends Omit<SocialPost, 'id' | 'createdAt' | 'style' | 'seed'> {
  _id: string;
  createdAt: Date;
  style?: VideoStyle; // missing on posts made before looks existed
  seed?: number;
}

// Dashboard switches (one document per area, e.g. _id "social")
export interface SettingsDoc {
  _id: string;
  autoPost?: boolean;
  updatedAt: Date;
  updatedBy: string;
}

// A motion-graphics reel script made from the founder's idea (the MP4 is rendered in the browser)
export interface SocialVideoDoc extends Omit<SocialVideo, 'id' | 'createdAt'> {
  _id: string;
  createdAt: Date;
  day: string;
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
  settings: async () => (await getDb()).collection<SettingsDoc>('settings')
};
