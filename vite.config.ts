import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vite';

type ApiHandler = (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => void;

// Serves the Express API (src/server/app.ts) from the Vite dev server, so `vite` / `npm run dev`
// runs the website and /api together, just like Vercel does in production.
function devApi(): Plugin {
  return {
    name: 'rmast-dev-api',
    apply: 'serve',
    configureServer(server) {
      let app: ApiHandler | undefined;
      let appModule: unknown;

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/') && req.url !== '/api') return next();
        try {
          await server.ssrLoadModule('/src/server/loadEnv.ts');
          const mod = await server.ssrLoadModule('/src/server/app.ts');
          // Rebuild the app only when the server code changed
          if (!app || mod !== appModule) {
            appModule = mod;
            app = (mod as { createApp: () => ApiHandler }).createApp();
          }
          app(req, res, next);
        } catch (err) {
          next(err);
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), devApi()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify: file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
