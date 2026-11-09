// Checks Free Audit answers. The form uses validateStep (one step at a time); the server uses
// cleanAnswers on the whole submission, so nothing the browser sends is trusted as-is.
import { ALL_FIELDS, EMPTY_ANSWERS, LINK_FIELDS, STEPS, type AuditAnswers, type Field } from './questions.js';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// When there is no website, the website questions that no longer apply are answered automatically
export const NO_WEBSITE_ANSWERS: Partial<AuditAnswers> = {
  siteStatus: 'No website',
  siteListings: 'No listings',
  siteContact: 'No way to contact',
  siteChat: 'No',
  siteMobile: 'No'
};

export const hasNoWebsite = (a: Pick<AuditAnswers, 'siteStatus'>) => a.siteStatus === 'No website';

function fieldError(field: Field, a: AuditAnswers): string | null {
  const value = a[field.key];
  if (field.kind === 'text') {
    const text = String(value ?? '').trim();
    if (field.required && !text) return 'Please fill this in.';
    if (field.key === 'email' && text && !EMAIL_RE.test(text)) return 'Please enter a valid email address.';
    if (field.key === 'phone' && text && !/^[+\d][\d\s().-]{5,}$/.test(text)) return 'Please enter a valid phone number.';
    return null;
  }
  if (field.kind === 'select') return value && field.options.includes(String(value)) ? null : 'Please choose one.';
  return null; // multi-select chips are optional
}

// Errors for one step, keyed by field (empty object = the step is complete)
export function validateStep(stepIndex: number, a: AuditAnswers): Record<string, string> {
  const errors: Record<string, string> = {};
  const step = STEPS[stepIndex];
  if (!step) return errors;
  for (const field of step.fields) {
    const error = fieldError(field, a);
    if (error) errors[field.key] = error;
  }
  if (step.id === 'online' && !LINK_FIELDS.some((k) => String(a[k] ?? '').trim())) {
    errors.links = 'Add at least one: your website or a social profile.';
  }
  return errors;
}

// Whole submission, for the server: keeps only known fields and options, trims and caps text.
// Returns the clean answers, or a message describing the first problem.
export function cleanAnswers(raw: unknown): AuditAnswers | string {
  const input = (raw ?? {}) as Record<string, unknown>;
  const out: AuditAnswers = { ...EMPTY_ANSWERS, portals: [], postTypes: [], leadSources: [] };
  for (const field of ALL_FIELDS) {
    const value = input[field.key];
    if (field.kind === 'text') {
      const max = field.maxLength ?? 200;
      (out[field.key] as string) = typeof value === 'string' ? value.replace(/[\r\n\t]+/g, ' ').trim().slice(0, max) : '';
    } else if (field.kind === 'select') {
      (out[field.key] as string) = typeof value === 'string' && field.options.includes(value) ? value : '';
    } else {
      const list = Array.isArray(value) ? value : [];
      (out[field.key] as string[]) = field.options.filter((o) => list.includes(o));
    }
  }
  out.noWebsite = input.noWebsite === true;
  out.consent = input.consent === true;
  if (out.noWebsite) out.website = '';
  if (hasNoWebsite(out)) Object.assign(out, NO_WEBSITE_ANSWERS);

  for (let i = 0; i < STEPS.length; i++) {
    const errors = validateStep(i, out);
    const first = Object.entries(errors)[0];
    if (first) {
      const field = ALL_FIELDS.find((f) => f.key === first[0]);
      return `${STEPS[i].title}: ${field ? field.label : 'links'} - ${first[1]}`;
    }
  }
  return out;
}

// A clickable address for a website, handle or profile the visitor typed
export function linkFor(key: (typeof LINK_FIELDS)[number], value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  const handle = v.replace(/^@/, '');
  if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(v)) return `https://${v}`;
  switch (key) {
    case 'instagram':
      return `https://instagram.com/${handle}`;
    case 'tiktok':
      return `https://www.tiktok.com/@${handle}`;
    case 'facebook':
      return `https://facebook.com/${handle}`;
    case 'youtube':
      return `https://youtube.com/@${handle}`;
    case 'linkedin':
      return `https://linkedin.com/in/${handle}`;
    default:
      return null;
  }
}

export const LINK_LABELS: Record<(typeof LINK_FIELDS)[number], string> = {
  website: 'Website',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  google: 'Google Business'
};

// The one handle or site shown at the foot of the audit image
export function mainHandle(a: AuditAnswers): string {
  if (a.website.trim()) return a.website.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
  if (a.instagram.trim()) return `@${a.instagram.trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/\/$/, '')}`;
  for (const k of ['tiktok', 'facebook', 'youtube', 'linkedin', 'google'] as const) {
    if (a[k].trim()) return a[k].trim().replace(/^https?:\/\//i, '');
  }
  return a.businessName;
}
