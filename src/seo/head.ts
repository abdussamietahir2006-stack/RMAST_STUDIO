import { OG_IMAGE, SITE_NAME, type RouteMeta } from './meta.js';

const escapeAttr = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeText = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// Keeps "</script>" and HTML comment markers inside JSON-LD from breaking out of the tag
const safeJson = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

// Build-time <head> tags for a prerendered page
export function renderHeadTags(meta: RouteMeta, site: string, googleVerification?: string): string {
  const url = meta.path ? `${site}${meta.path === '/' ? '/' : meta.path}` : null;
  const image = `${site}${OG_IMAGE.path}`;
  const tags = [
    `<title>${escapeText(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
    meta.noindex ? `<meta name="robots" content="noindex, nofollow" />` : `<meta name="robots" content="index, follow, max-image-preview:large" />`,
    url && `<link rel="canonical" href="${escapeAttr(url)}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:title" content="${escapeAttr(meta.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(meta.description)}" />`,
    url && `<meta property="og:url" content="${escapeAttr(url)}" />`,
    `<meta property="og:image" content="${escapeAttr(image)}" />`,
    `<meta property="og:image:width" content="${OG_IMAGE.width}" />`,
    `<meta property="og:image:height" content="${OG_IMAGE.height}" />`,
    `<meta property="og:image:alt" content="${escapeAttr(OG_IMAGE.alt)}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(meta.description)}" />`,
    `<meta name="twitter:image" content="${escapeAttr(image)}" />`,
    googleVerification && `<meta name="google-site-verification" content="${escapeAttr(googleVerification)}" />`,
    ...meta.jsonLd.map((data) => `<script type="application/ld+json">${safeJson(data)}</script>`)
  ];
  return tags.filter(Boolean).join('\n    ');
}

// Browser: keep the head in sync when navigating between pages without a reload
export function applyHeadTags(meta: RouteMeta, site: string): void {
  document.title = meta.title;
  const url = meta.path ? `${site}${meta.path === '/' ? '/' : meta.path}` : null;

  const setMeta = (attr: 'name' | 'property', key: string, content: string | null) => {
    let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
    if (content === null) {
      el?.remove();
      return;
    }
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, key);
      document.head.appendChild(el);
    }
    el.content = content;
  };

  setMeta('name', 'description', meta.description);
  setMeta('name', 'robots', meta.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
  setMeta('property', 'og:title', meta.title);
  setMeta('property', 'og:description', meta.description);
  setMeta('property', 'og:url', url);
  setMeta('name', 'twitter:title', meta.title);
  setMeta('name', 'twitter:description', meta.description);

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!url) {
    canonical?.remove();
  } else {
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }
}
