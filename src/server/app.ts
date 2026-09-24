import express, { type ErrorRequestHandler, type Express, type RequestHandler } from 'express';
import type { InquiryStatus, SocialPostStatus } from '../types/index.js';
import { collections, isDbConfigured } from './db.js';
import {
  ah,
  apiHeaders,
  clientIp,
  EMAIL_RE,
  incrementCounter,
  noStore,
  rateLimit,
  readCounter,
  requireSameOrigin,
  resetCounter,
  str
} from './security.js';
import {
  createSession,
  currentUser,
  destroyAllSessions,
  destroySession,
  getDummyHash,
  hashPassword,
  requireAuth,
  toAdminUser,
  validateNewPassword,
  verifyPassword
} from './auth.js';
import { leadStats, listLeads, newLead, parseLead, STATUSES, toDoc } from './leads.js';
import { emailLead, isMailConfigured } from './mail.js';
import { generateReply, isAssistantConfigured, parseTurns } from './assistant.js';
import { handleUploadToken, isBlobConfigured, listMedia, publicMedia, removeMedia, saveMedia } from './media.js';
import { createExtraPost, ensureTodayPost, isSocialConfigured, listSocialPosts, SOCIAL_STATUSES } from './social.js';

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_LOGINS_PER_EMAIL = 5;
const MAX_LOGIN_ATTEMPTS_PER_IP = 30;

export function createApp(): Express {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use('/api', apiHeaders);

  // Blob upload-token requests carry their own JSON body; everything else is small JSON
  app.use('/api', express.json({ limit: '64kb' }));

  // -------------------------------------------------------------------------
  // Public
  // -------------------------------------------------------------------------

  app.get('/api/health', noStore, (_req, res) => {
    res.json({
      ok: true,
      database: isDbConfigured(),
      assistant: isAssistantConfigured(),
      email: isMailConfigured(),
      media: isBlobConfigured()
    });
  });

  app.get(
    '/api/content',
    ah(async (_req, res) => {
      const media = isDbConfigured() ? await publicMedia() : {};
      // Short CDN cache so dashboard changes appear within seconds without hammering the database
      res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=15, stale-while-revalidate=300');
      res.json({ media });
    })
  );

  app.post(
    '/api/leads',
    rateLimit('leads', 10, 10 * 60 * 1000),
    ah(async (req, res) => {
      const parsed = parseLead(req.body);
      if (typeof parsed === 'string') {
        res.status(400).json({ error: parsed });
        return;
      }
      const lead = newLead(parsed);

      let stored = false;
      if (isDbConfigured()) {
        try {
          await (await collections.leads()).insertOne(toDoc(lead));
          stored = true;
        } catch (err) {
          console.error('Failed to store lead', err);
        }
      }
      const emailed = await emailLead(lead);

      // As long as the lead reached the founders one way or another, the visitor succeeded
      if (!stored && !emailed) {
        res.status(500).json({ error: 'Could not submit your inquiry. Please contact us on WhatsApp or email.' });
        return;
      }
      res.status(201).json({ id: lead.id, stored, emailed });
    })
  );

  app.post(
    '/api/assistant',
    rateLimit('assistant', 30, 10 * 60 * 1000),
    ah(async (req, res) => {
      if (!isAssistantConfigured()) {
        res.status(503).json({ error: 'Assistant is not configured' });
        return;
      }
      const turns = parseTurns(req.body?.messages);
      if (!turns) {
        res.status(400).json({ error: 'Last message must be from the user' });
        return;
      }
      const currency = req.body?.currency === 'AED' ? 'AED' : 'USD';
      try {
        res.json({ reply: await generateReply(turns, currency) });
      } catch (err) {
        console.error('Assistant request failed', err);
        res.status(502).json({ error: 'Assistant is temporarily unavailable' });
      }
    })
  );

  // -------------------------------------------------------------------------
  // Authentication
  // -------------------------------------------------------------------------

  const requireDb: RequestHandler = (_req, res, next) => {
    if (!isDbConfigured()) {
      res.status(503).json({ error: 'Dashboard database is not configured (MONGODB_URI).' });
      return;
    }
    next();
  };

  // Daily social post, triggered by Vercel Cron (see "crons" in vercel.json). Vercel sends
  // "Authorization: Bearer <CRON_SECRET>"; without that secret configured the route stays closed.
  app.get(
    '/api/cron/social-post',
    noStore,
    requireDb,
    ah(async (req, res) => {
      const secret = process.env.CRON_SECRET?.trim();
      if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      if (!isSocialConfigured()) {
        res.status(503).json({ error: 'GEMINI_API_KEY is not configured' });
        return;
      }
      const post = await ensureTodayPost();
      res.json({ id: post.id, day: post.day, title: post.title });
    })
  );

  const auth = express.Router();
  auth.use(noStore, requireSameOrigin, requireDb);

  auth.post(
    '/login',
    ah(async (req, res) => {
      const email = str(req.body?.email, 200).toLowerCase();
      const password = typeof req.body?.password === 'string' ? req.body.password.slice(0, 256) : '';
      const ipKey = `login-ip:${clientIp(req)}`;
      const failKey = `login-fail:${email}`;

      if ((await incrementCounter(ipKey, LOGIN_WINDOW_MS)) > MAX_LOGIN_ATTEMPTS_PER_IP) {
        res.status(429).json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' });
        return;
      }
      if ((await readCounter(failKey)) >= MAX_FAILED_LOGINS_PER_EMAIL) {
        res.status(429).json({ error: 'This account is temporarily locked after failed attempts. Try again in 15 minutes.' });
        return;
      }

      const user = EMAIL_RE.test(email) ? await (await collections.users()).findOne({ email }) : null;
      const valid = await verifyPassword(password, user?.passwordHash ?? (await getDummyHash()));
      if (!user || !valid || !password) {
        await incrementCounter(failKey, LOGIN_WINDOW_MS);
        res.status(401).json({ error: 'Incorrect email or password.' });
        return;
      }

      await resetCounter(failKey);
      await (await collections.users()).updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
      await createSession(req, res, user._id);
      res.json({ user: toAdminUser(user) });
    })
  );

  auth.post(
    '/logout',
    ah(async (req, res) => {
      await destroySession(req, res);
      res.status(204).end();
    })
  );

  auth.get('/me', requireAuth, (_req, res) => {
    res.json({ user: toAdminUser(currentUser(res)) });
  });

  auth.post(
    '/password',
    requireAuth,
    ah(async (req, res) => {
      const user = currentUser(res);
      const current = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
      const next = typeof req.body?.newPassword === 'string' ? req.body.newPassword : '';

      if (!(await verifyPassword(current, user.passwordHash))) {
        res.status(400).json({ error: 'Current password is incorrect.' });
        return;
      }
      const problem = validateNewPassword(next);
      if (problem) {
        res.status(400).json({ error: problem });
        return;
      }
      await (await collections.users()).updateOne({ _id: user._id }, { $set: { passwordHash: await hashPassword(next) } });
      // Sign out every other device, then issue a fresh session for this one
      await destroyAllSessions(user._id);
      await createSession(req, res, user._id);
      res.status(204).end();
    })
  );

  auth.post(
    '/logout-all',
    requireAuth,
    ah(async (req, res) => {
      await destroyAllSessions(currentUser(res)._id);
      await destroySession(req, res);
      res.status(204).end();
    })
  );

  app.use('/api/auth', auth);

  // -------------------------------------------------------------------------
  // Dashboard (all routes require a signed-in founder)
  // -------------------------------------------------------------------------

  const admin = express.Router();
  admin.use(noStore, requireSameOrigin, requireDb, requireAuth);

  admin.get(
    '/stats',
    ah(async (req, res) => {
      res.json(await leadStats(req.query.tz));
    })
  );

  admin.get(
    '/leads',
    ah(async (req, res) => {
      res.json(await listLeads(req.query as Record<string, unknown>));
    })
  );

  admin.patch(
    '/leads/:id',
    ah(async (req, res) => {
      const status = req.body?.status as InquiryStatus;
      if (!STATUSES.includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }
      const result = await (await collections.leads()).updateOne({ _id: String(req.params.id) }, { $set: { status } });
      res.status(result.matchedCount ? 204 : 404).end();
    })
  );

  admin.delete(
    '/leads/:id',
    ah(async (req, res) => {
      const result = await (await collections.leads()).deleteOne({ _id: String(req.params.id) });
      res.status(result.deletedCount ? 204 : 404).end();
    })
  );

  admin.get(
    '/media',
    ah(async (_req, res) => {
      res.json({ assets: await listMedia(), storageReady: isBlobConfigured() });
    })
  );

  admin.post('/media/upload', ah(handleUploadToken));

  admin.put(
    '/media/:key',
    ah(async (req, res) => {
      const result = await saveMedia(String(req.params.key), req.body, currentUser(res));
      if (typeof result === 'string') {
        res.status(400).json({ error: result });
        return;
      }
      res.json(result);
    })
  );

  admin.delete(
    '/media/:key',
    ah(async (req, res) => {
      res.status((await removeMedia(String(req.params.key))) ? 204 : 404).end();
    })
  );

  // Social media manager: one AI-written carousel per day, plus extra ideas on request
  const requireSocial: RequestHandler = (_req, res, next) => {
    if (!isSocialConfigured()) {
      res.status(503).json({ error: 'Post ideas need GEMINI_API_KEY to be configured.' });
      return;
    }
    next();
  };

  admin.get(
    '/social',
    ah(async (_req, res) => {
      res.json({ posts: await listSocialPosts(), ready: isSocialConfigured() });
    })
  );

  admin.post(
    '/social/today',
    requireSocial,
    ah(async (_req, res) => {
      res.json(await ensureTodayPost());
    })
  );

  admin.post(
    '/social/extra',
    requireSocial,
    ah(async (_req, res) => {
      res.status(201).json(await createExtraPost());
    })
  );

  admin.patch(
    '/social/:id',
    ah(async (req, res) => {
      const status = req.body?.status as SocialPostStatus;
      if (!SOCIAL_STATUSES.includes(status)) {
        res.status(400).json({ error: 'Invalid status' });
        return;
      }
      const result = await (await collections.socialPosts()).updateOne({ _id: String(req.params.id) }, { $set: { status } });
      res.status(result.matchedCount ? 204 : 404).end();
    })
  );

  admin.delete(
    '/social/:id',
    ah(async (req, res) => {
      const result = await (await collections.socialPosts()).deleteOne({ _id: String(req.params.id) });
      res.status(result.deletedCount ? 204 : 404).end();
    })
  );

  app.use('/api/admin', admin);

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  const onError: ErrorRequestHandler = (err, _req, res, _next) => {
    // Rejected uploads (wrong slot, type or size) are the client's mistake, not a server fault
    const rejected = err instanceof Error && /Unknown media slot|Invalid upload path|content type|size/i.test(err.message);
    const status = rejected ? 400 : err?.status && err.status < 500 ? err.status : 500;
    if (status >= 500) console.error('Unhandled API error', err);
    else console.warn(`API request rejected: ${err instanceof Error ? err.message : err}`);
    if (res.headersSent) return;
    res.status(status).json({ error: rejected ? err.message : status < 500 ? 'Invalid request' : 'Something went wrong. Please try again.' });
  };
  app.use(onError);

  return app;
}
