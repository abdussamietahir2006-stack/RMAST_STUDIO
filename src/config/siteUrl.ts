// Resolves the public site URL at build time (used for canonical links, sitemap and social tags).
// Order: SITE_URL env (set this once you have a custom domain) > Vercel's production domain > localhost.
export function resolveSiteUrl(env: Record<string, string | undefined> = process.env): string {
  const explicit = env.SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, '').replace(/\/+$/, '')}`;
  return 'http://localhost:3000';
}
