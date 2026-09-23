import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { collections, isDbConfigured } from './db.js';

// Wraps async route handlers so rejected promises reach the Express error handler
export const ah =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res, next).catch(next);
  };

// On Vercel, x-real-ip is set by the platform and cannot be spoofed by the client
export function clientIp(req: Request): string {
  if (process.env.VERCEL) return req.get('x-real-ip') || req.ip || 'unknown';
  return req.ip || 'unknown';
}

// ---------------------------------------------------------------------------
// Expiring counters (MongoDB-backed so limits hold across serverless instances;
// falls back to memory when no database is configured, e.g. local dev)
// ---------------------------------------------------------------------------

const memoryCounters = new Map<string, { count: number; expiresAt: number }>();

export async function incrementCounter(key: string, windowMs: number): Promise<number> {
  const now = Date.now();

  if (!isDbConfigured()) {
    const entry = memoryCounters.get(key);
    if (!entry || entry.expiresAt <= now) {
      memoryCounters.set(key, { count: 1, expiresAt: now + windowMs });
      return 1;
    }
    return ++entry.count;
  }

  const counters = await collections.counters();
  for (let attempt = 0; attempt < 2; attempt++) {
    const updated = await counters.findOneAndUpdate(
      { _id: key, expiresAt: { $gt: new Date(now) } },
      { $inc: { count: 1 } },
      { returnDocument: 'after' }
    );
    if (updated) return updated.count;
    try {
      // Missing or expired (TTL cleanup lags up to a minute): start a new window
      await counters.replaceOne({ _id: key }, { count: 1, expiresAt: new Date(now + windowMs) }, { upsert: true });
      return 1;
    } catch (err) {
      // Concurrent insert of the same key: retry the increment
      if ((err as { code?: number }).code !== 11000) throw err;
    }
  }
  return Number.MAX_SAFE_INTEGER;
}

export async function readCounter(key: string): Promise<number> {
  const now = Date.now();
  if (!isDbConfigured()) {
    const entry = memoryCounters.get(key);
    return entry && entry.expiresAt > now ? entry.count : 0;
  }
  const doc = await (await collections.counters()).findOne({ _id: key, expiresAt: { $gt: new Date(now) } });
  return doc?.count ?? 0;
}

export async function resetCounter(key: string): Promise<void> {
  memoryCounters.delete(key);
  if (isDbConfigured()) await (await collections.counters()).deleteOne({ _id: key });
}

export function rateLimit(name: string, limit: number, windowMs: number): RequestHandler {
  return ah(async (req, res, next) => {
    let count = 0;
    try {
      count = await incrementCounter(`rl:${name}:${clientIp(req)}`, windowMs);
    } catch (err) {
      // Never block visitors because the limiter's storage hiccuped
      console.error('Rate limiter unavailable', err);
    }
    if (count > limit) {
      res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      return;
    }
    next();
  });
}

// ---------------------------------------------------------------------------
// CSRF defence for cookie-authenticated routes: state-changing requests must
// come from this site's own pages (on top of SameSite=Strict cookies)
// ---------------------------------------------------------------------------

export const requireSameOrigin: RequestHandler = (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return next();
  const origin = req.get('origin');
  const host = req.get('x-forwarded-host') || req.get('host');
  let ok = false;
  try {
    ok = Boolean(origin && host && new URL(origin).host === host);
  } catch {
    ok = false;
  }
  if (!ok) {
    res.status(403).json({ error: 'Cross-site request blocked' });
    return;
  }
  next();
};

export const noStore: RequestHandler = (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
};

// Baseline headers for API responses (static files get theirs from vercel.json / server.ts)
export const apiHeaders: RequestHandler = (_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
};

export function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
