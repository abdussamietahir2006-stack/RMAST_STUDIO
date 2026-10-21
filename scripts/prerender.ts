// Runs after `vite build` and `vite build --ssr`: writes a real HTML file for every public page
// (with its own title, description, canonical, social tags and structured data), plus
// 404.html, admin.html, sitemap.xml and robots.txt. Search engines and link previews read these directly.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { PUBLIC_ROUTES, getRouteMeta } from '../src/seo/meta.js';
import { renderHeadTags } from '../src/seo/head.js';
import { resolveSiteUrl } from '../src/config/siteUrl.js';
import { REDIRECTS } from '../src/config/redirects.js';

const DIST = path.resolve('dist');
const SSR_ENTRY = path.resolve('dist-ssr/entry-server.js');
const site = resolveSiteUrl();
// Google Search Console "HTML tag" verification (public by design). The env var overrides it.
const GOOGLE_VERIFICATION_DEFAULT = '0ZcNu9Em-BJX9_lue0G5aW364IC4UK0VXcqPQtHLrgE';
const verification = process.env.GOOGLE_SITE_VERIFICATION?.trim() || GOOGLE_VERIFICATION_DEFAULT;

// Moved pages: vercel.json must send every old URL in src/config/redirects.ts to the same place
const vercelRedirects = new Map(
  ((JSON.parse(fs.readFileSync('vercel.json', 'utf8')).redirects ?? []) as { source: string; destination: string }[]).map((r) => [
    r.source,
    r.destination
  ])
);
for (const [from, to] of Object.entries(REDIRECTS)) {
  if (vercelRedirects.get(from) !== to) throw new Error(`vercel.json is missing the redirect ${from} -> ${to} (see src/config/redirects.ts)`);
}
for (const route of PUBLIC_ROUTES) {
  if (REDIRECTS[route]) throw new Error(`${route} is both a page and a redirect`);
}

const template = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const SEO_BLOCK = /<!--seo:start[\s\S]*?<!--seo:end-->/;
if (!SEO_BLOCK.test(template) || !template.includes('<div id="root"></div>')) {
  throw new Error('dist/index.html is missing the seo markers or the #root element');
}

const { render } = (await import(pathToFileURL(SSR_ENTRY).href)) as { render: (url: string) => Promise<string> };

function page(route: string, appHtml: string): string {
  const head = renderHeadTags(getRouteMeta(route, site), site, verification);
  return template.replace(SEO_BLOCK, head).replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
}

// "/" -> index.html, "/services/crm-development" -> services/crm-development.html (served as clean URLs)
function write(route: string, html: string) {
  const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`;
  const target = path.join(DIST, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
}

const started = Date.now();
for (const route of PUBLIC_ROUTES) {
  const html = await render(route);
  // The page must be fully inline: a Suspense fallback here would mean search engines see a blank page
  if (html.length < 2000 || html.includes('<template') || html.includes('<!--$!-->') || html.includes('aria-busy="true"')) {
    throw new Error(`Prerender of ${route} is incomplete (${html.length} bytes); a page component suspended`);
  }
  write(route, page(route, html));
}

// Unknown URLs get this page with a real 404 status
write('/404', page('/__not-found__', await render('/__not-found__')));

// The dashboard is private and rendered in the browser only
write('/admin', template.replace(SEO_BLOCK, renderHeadTags(getRouteMeta('/admin', site), site)));

const today = new Date().toISOString().slice(0, 10);
const priority = (route: string) =>
  route === '/' ? '1.0' : route.startsWith('/services') || ['/plans', '/free-audit'].includes(route) ? '0.9' : '0.8';
fs.writeFileSync(
  path.join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PUBLIC_ROUTES.map(
  (r) => `  <url>
    <loc>${site}${r === '/' ? '/' : r}</loc>
    <lastmod>${today}</lastmod>
    <priority>${priority(r)}</priority>
  </url>`
).join('\n')}
</urlset>
`
);

fs.writeFileSync(
  path.join(DIST, 'robots.txt'),
  `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${site}/sitemap.xml
`
);

fs.rmSync(path.resolve('dist-ssr'), { recursive: true, force: true });
console.log(
  `Prerendered ${PUBLIC_ROUTES.length} pages + 404 + admin for ${site} in ${Date.now() - started}ms` +
    (verification ? ' (with Google verification tag)' : '')
);
