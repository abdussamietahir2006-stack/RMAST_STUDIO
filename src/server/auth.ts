import crypto from 'node:crypto';
import { promisify } from 'node:util';
import type { Request, RequestHandler, Response } from 'express';
import type { AdminUser } from '../types/index.js';
import { collections, type UserDoc } from './db.js';
import { ah, clientIp } from './security.js';

const scrypt = promisify(crypto.scrypt) as (
  password: crypto.BinaryLike,
  salt: crypto.BinaryLike,
  keylen: number,
  options: crypto.ScryptOptions
) => Promise<Buffer>;

// OWASP-recommended scrypt parameters (N=2^17, r=8, p=1)
const SCRYPT_LOG_N = 17;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LEN = 64;
const SCRYPT_MAXMEM = 256 * 1024 * 1024;

export const MIN_PASSWORD_LENGTH = 12;
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password.normalize('NFKC'), salt, KEY_LEN, {
    N: 2 ** SCRYPT_LOG_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: SCRYPT_MAXMEM
  });
  return ['scrypt', SCRYPT_LOG_N, SCRYPT_R, SCRYPT_P, salt.toString('base64'), key.toString('base64')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, logN, r, p, saltB64, keyB64] = stored.split('$');
  if (algo !== 'scrypt' || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, 'base64');
  const actual = await scrypt(password.normalize('NFKC'), Buffer.from(saltB64, 'base64'), expected.length, {
    N: 2 ** Number(logN),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT_MAXMEM
  });
  return crypto.timingSafeEqual(actual, expected);
}

// Used when the email is unknown so response time doesn't reveal which accounts exist
let dummyHash: Promise<string> | undefined;
export function getDummyHash(): Promise<string> {
  dummyHash ??= hashPassword(crypto.randomBytes(16).toString('hex'));
  return dummyHash;
}

export function validateNewPassword(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  if (password.length > 256) return 'Password is too long.';
  return null;
}

// ---------------------------------------------------------------------------
// Sessions (random token in an HttpOnly cookie; only its hash is stored)
// ---------------------------------------------------------------------------

const isProd = () => process.env.NODE_ENV === 'production';
// The __Host- prefix makes the browser enforce Secure, Path=/ and no Domain attribute
const cookieName = () => (isProd() ? '__Host-rmast_session' : 'rmast_session');

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.cookie;
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return undefined;
}

function setSessionCookie(res: Response, token: string, maxAgeSeconds: number) {
  const attrs = [
    `${cookieName()}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAgeSeconds}`
  ];
  if (isProd()) attrs.push('Secure');
  res.append('Set-Cookie', attrs.join('; '));
}

export async function createSession(req: Request, res: Response, userId: string): Promise<void> {
  const token = crypto.randomBytes(32).toString('base64url');
  const now = new Date();
  await (await collections.sessions()).insertOne({
    _id: hashToken(token),
    userId,
    createdAt: now,
    expiresAt: new Date(now.getTime() + SESSION_TTL_MS),
    ip: clientIp(req),
    userAgent: (req.get('user-agent') || '').slice(0, 300)
  });
  setSessionCookie(res, token, SESSION_TTL_MS / 1000);
}

export async function destroySession(req: Request, res: Response): Promise<void> {
  const token = readCookie(req, cookieName());
  if (token) await (await collections.sessions()).deleteOne({ _id: hashToken(token) });
  setSessionCookie(res, '', 0);
}

export async function destroyAllSessions(userId: string): Promise<void> {
  await (await collections.sessions()).deleteMany({ userId });
}

export function toAdminUser(doc: UserDoc): AdminUser {
  return { id: doc._id, email: doc.email, name: doc.name, role: doc.role };
}

async function sessionUser(req: Request): Promise<UserDoc | null> {
  const token = readCookie(req, cookieName());
  if (!token || token.length > 100) return null;
  const session = await (await collections.sessions()).findOne({
    _id: hashToken(token),
    expiresAt: { $gt: new Date() }
  });
  if (!session) return null;
  return (await collections.users()).findOne({ _id: session.userId });
}

// Attaches the signed-in user to res.locals.user or responds 401
export const requireAuth: RequestHandler = ah(async (req, res, next) => {
  const user = await sessionUser(req);
  if (!user) {
    res.status(401).json({ error: 'Not signed in' });
    return;
  }
  res.locals.user = user;
  next();
});

export const currentUser = (res: Response) => res.locals.user as UserDoc;
