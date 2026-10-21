// Old URLs and the page that replaced them. Used by the browser (links inside the site, such as the
// chat assistant's buttons), by server.ts, and checked against vercel.json by the prerenderer.

export const REDIRECTS: Record<string, string> = {
  '/real-estate': '/',
  '/ai-content': '/services/creative-assistant',
  '/pricing': '/plans',
  '/case-studies': '/work',
  '/process': '/#how-it-works',

  // Former service pages, now part of an Assistant
  '/services/web-development': '/services/technical-assistant',
  '/services/custom-software': '/services/technical-assistant',
  '/services/crm-development': '/services/technical-assistant',
  '/services/ai-automation': '/services/technical-assistant',
  '/services/ai-assistants': '/services/technical-assistant',
  '/services/social-media': '/services/creative-assistant',
  '/services/virtual-assistance': '/services/virtual-assistant',
  '/services/admin-support': '/services/virtual-assistant',

  // Former AI Content pages: all part of the Creative Assistant
  '/ai-content/real-estate': '/services/creative-assistant',
  '/ai-content/fashion': '/services/creative-assistant',
  '/ai-content/food': '/services/creative-assistant',
  '/ai-content/products': '/services/creative-assistant',
  '/ai-content/ai-advertising': '/services/creative-assistant',
  '/ai-content/social-content': '/services/creative-assistant'
};

// The new location for an old path (trailing slashes ignored), or undefined if the path is current
export function redirectFor(rawPath: string): string | undefined {
  const path = rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
  return REDIRECTS[path];
}
