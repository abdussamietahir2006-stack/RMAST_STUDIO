// Local server: `npm run dev` (Vite middleware + API) and `npm start` (built site + API).
// On Vercel this file is not used; see api/index.ts and vercel.json.
import './src/server/loadEnv.js';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createApp } from './src/server/app.js';
import { isDbConfigured } from './src/server/db.js';
import { isMailConfigured } from './src/server/mail.js';
import { isAssistantConfigured } from './src/server/assistant.js';
import { isBlobConfigured } from './src/server/media.js';
import { SECURITY_HEADERS } from './src/server/headers.js';

const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function main() {
  const app = createApp();

  if (isProd) {
    const distDir = path.resolve('dist');
    app.use((_req, res, next) => {
      for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
      next();
    });
    app.use(
      express.static(distDir, {
        index: false,
        setHeaders: (res, filePath) => {
          // Hashed build assets never change; everything else must revalidate
          res.setHeader(
            'Cache-Control',
            filePath.includes(`${path.sep}assets${path.sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache'
          );
        }
      })
    );
    // Prerendered pages with clean URLs (mirrors vercel.json): /pricing -> pricing.html,
    // /admin/* -> admin.html, anything else -> 404.html with a real 404 status
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache');
      const clean = req.path.replace(/\/+$/, '') || '/';
      if (clean === '/admin' || clean.startsWith('/admin/')) {
        res.sendFile(path.join(distDir, 'admin.html'));
        return;
      }
      const file = clean === '/' ? 'index.html' : `${clean.slice(1)}.html`;
      const resolved = path.resolve(distDir, file);
      if (resolved.startsWith(distDir + path.sep) && fs.existsSync(resolved)) {
        res.sendFile(resolved);
        return;
      }
      res.status(404).sendFile(path.join(distDir, '404.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RMAST Studio running on http://localhost:${PORT} (${isProd ? 'production' : 'development'})`);
    if (!isDbConfigured()) console.warn('MONGODB_URI is not set: leads are only emailed and the dashboard is disabled.');
    if (!isBlobConfigured()) console.warn('BLOB_READ_WRITE_TOKEN is not set: dashboard media uploads are disabled.');
    if (!isAssistantConfigured()) console.warn('GEMINI_API_KEY is not set: the assistant will use scripted answers.');
    if (!isMailConfigured()) console.warn('SMTP_USER / SMTP_PASS are not set: inquiries will not be emailed.');
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
