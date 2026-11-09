// Email templates for Free Audits and call bookings (sent with the site's existing SMTP account).
// Everything a visitor typed is escaped before it goes into HTML.
import { assistantById } from '../data/assistantsData.js';
import { STEPS, LINK_FIELDS } from '../data/audit/questions.js';
import { linkFor, LINK_LABELS } from '../data/audit/validate.js';
import { plain, PILLARS } from '../data/audit/scoring.js';
import { formatSlot, googleCalendarLink, PKT_ZONE, type InviteDetails } from '../data/booking/calendar.js';
import { resolveSiteUrl } from '../config/siteUrl.js';
import { CONTACT, whatsappLink } from '../config/contact.js';
import type { AuditLeadDoc, CallBookingDoc } from './db.js';

export const siteUrl = () => resolveSiteUrl(process.env);

const TEAL = '#0F4C4A';
const SAND = '#F3E7D3';
const CARD = '#FBF5EB';
const LINE = '#E3D3B8';
const MUTED = '#655F57';
const CORAL_TEXT = '#AD4025';

export const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

// "**bold**" copy from the audit -> safe HTML
const rich = (s: string) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

const button = (href: string, label: string) =>
  `<a href="${esc(href)}" style="display:inline-block;background:${TEAL};color:${SAND};text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">${esc(label)}</a>`;

function layout(title: string, body: string): string {
  return `<!doctype html><html><body style="margin:0;background:${SAND};font-family:Arial,Helvetica,sans-serif;color:#2D2A26">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${SAND};padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:${CARD};border:1px solid ${LINE};border-radius:12px;overflow:hidden">
<tr><td style="background:${TEAL};padding:20px 24px;color:${SAND};font-size:18px;font-weight:bold;letter-spacing:1px">RMAST <span style="color:#F28462;font-weight:normal">Studio</span></td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.55">
<h1 style="margin:0 0 16px;font-size:20px;color:${TEAL}">${esc(title)}</h1>
${body}
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid ${LINE};font-size:12px;color:${MUTED}">RMAST Studio · ${esc(CONTACT.email)} · WhatsApp ${esc(CONTACT.whatsappDisplay)}</td></tr>
</table></td></tr></table></body></html>`;
}

function rows(list: [string, string][]): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:0 0 16px">${list
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:${MUTED};vertical-align:top;white-space:nowrap;border-bottom:1px solid ${LINE}">${esc(k)}</td><td style="padding:6px 0;border-bottom:1px solid ${LINE}">${v}</td></tr>`
    )
    .join('')}</table>`;
}

const h2 = (s: string) => `<h2 style="margin:24px 0 8px;font-size:15px;color:${TEAL};text-transform:uppercase;letter-spacing:1px">${esc(s)}</h2>`;
const link = (href: string, label: string) => `<a href="${esc(href)}" style="color:${CORAL_TEXT}">${esc(label)}</a>`;

// wa.me needs the number as digits only, with the country code
export const waLink = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 ? `https://wa.me/${digits}` : null;
};

const textBlock = (list: [string, string][]) => list.map(([k, v]) => `${k}: ${v}`).join('\n');

// ---------------------------------------------------------------------------
// Free Audit
// ---------------------------------------------------------------------------

export const auditDashboardUrl = (id: string) => `${siteUrl()}/admin/audits/${encodeURIComponent(id)}`;
export const bookingPageUrl = (auditToken?: string) => `${siteUrl()}/book-a-call${auditToken ? `?audit=${encodeURIComponent(auditToken)}` : ''}`;

export function auditAdminEmail(doc: AuditLeadDoc): { subject: string; html: string; text: string } {
  const r = doc.result;
  const main = assistantById(doc.mainAssistant).name;
  const location = [doc.city, doc.country].filter(Boolean).join(', ');
  const subject = `New Free Audit: ${doc.businessName} · ${doc.city || doc.country} · ${doc.overallScore}/100 · ${main}`;
  const wa = waLink(doc.phone);

  const contact: [string, string][] = [
    ['Name', esc(doc.contactName)],
    ['Role', esc(doc.role)],
    ['Email', link(`mailto:${doc.email}`, doc.email)],
    ['Phone', doc.phone ? `${esc(doc.phone)}${wa ? ` · ${link(wa, 'WhatsApp')}` : ''}` : '—'],
    ['Location', esc(location || '—')],
    ['Business', `${esc(doc.businessName)} (${esc(doc.businessType)}, ${esc(doc.answers.years)} years)`]
  ];
  const links: [string, string][] = LINK_FIELDS.filter((k) => doc.answers[k]).map((k) => {
    const href = linkFor(k, doc.answers[k]);
    return [LINK_LABELS[k], href ? link(href, doc.answers[k]) : esc(doc.answers[k])];
  });
  const scores: [string, string][] = [
    ['Overall', `<strong>${doc.overallScore}/100</strong>`],
    ...(Object.keys(PILLARS) as (keyof typeof PILLARS)[]).map((p): [string, string] => [PILLARS[p].name, `${r.pillars[p]}/10`]),
    ['Main assistant', `<strong>${esc(main)}</strong>`]
  ];
  const answers = STEPS.map(
    (step) =>
      h2(step.title) +
      rows(
        step.fields.map((f) => {
          const v = doc.answers[f.key];
          return [f.label, esc(Array.isArray(v) ? v.join(', ') || '—' : v || '—')];
        })
      )
  ).join('');

  const html = layout(
    `New Free Audit: ${doc.businessName}`,
    `<p style="margin:0 0 16px">${rich(r.summary)}</p>
${h2('Contact')}${rows(contact)}
${links.length ? h2('Links') + rows(links) : ''}
${h2('Scores')}${rows(scores)}
${h2(`Problems (${main})`)}
<ul style="margin:0 0 16px;padding-left:20px">${r.cards.map((c) => `<li style="margin-bottom:6px"><strong>${esc(c.title)} ${c.score}/10:</strong> ${rich(c.problem)}</li>`).join('')}</ul>
<p style="margin:16px 0">${button(auditDashboardUrl(doc._id), 'Open in dashboard')}</p>
${doc.pngUrl ? `<p style="margin:0 0 16px">Audit image: ${link(doc.pngUrl, 'open PNG')}</p>` : ''}
${h2('All answers')}${answers}
<p style="color:${MUTED};font-size:13px">Consent to be contacted: ${doc.consent ? 'yes' : 'no'} · Page: ${esc(doc.meta.pageUrl || '—')}</p>`
  );

  const text = [
    plain(r.summary),
    '',
    textBlock([
      ['Name', doc.contactName],
      ['Role', doc.role],
      ['Email', doc.email],
      ['Phone', doc.phone || '-'],
      ['Location', location || '-'],
      ['Overall', `${doc.overallScore}/100`],
      ['Main assistant', main]
    ]),
    '',
    ...r.cards.map((c) => `${c.title} ${c.score}/10: ${plain(c.problem)}`),
    '',
    `Open in dashboard: ${auditDashboardUrl(doc._id)}`
  ].join('\n');

  return { subject, html, text };
}

export function auditVisitorEmail(doc: AuditLeadDoc): { subject: string; html: string; text: string } {
  const r = doc.result;
  const main = assistantById(doc.mainAssistant).name;
  const first = doc.contactName.split(' ')[0];
  const book = bookingPageUrl(doc.publicToken);
  const html = layout(
    `Your free audit: ${doc.overallScore}/100`,
    `<p>Hi ${esc(first)},</p>
<p>Thanks for filling in the Free Audit for <strong>${esc(doc.businessName)}</strong>. Your audit image is attached, so you can keep it or share it with your team.</p>
<p style="font-size:17px;color:${TEAL};font-weight:bold;margin:20px 0 8px">${esc(r.headline[0])}<br>${esc(r.headline[1])}</p>
<p>${rich(r.summary)}</p>
<p>If you'd like, book a free 15-minute call and we'll walk you through the fixes. No pressure and no obligation.</p>
<p style="margin:20px 0">${button(book, 'Book a free call')}</p>
<p style="color:${MUTED};font-size:13px">Your biggest gap points to our ${esc(main)}. Questions? Just reply to this email or message us on ${link(whatsappLink(), 'WhatsApp')}.</p>`
  );
  const text = `Hi ${first},

Thanks for filling in the Free Audit for ${doc.businessName}. Your audit image is attached.

${r.headline.join(' ')}
${plain(r.summary)}

Book a free 15-minute call and we'll walk you through the fixes: ${book}

RMAST Studio`;
  return { subject: `Your free RMAST audit: ${doc.overallScore}/100`, html, text };
}

// ---------------------------------------------------------------------------
// Call bookings
// ---------------------------------------------------------------------------

export const manageBookingUrl = (token: string) => `${siteUrl()}/booking/${encodeURIComponent(token)}`;
export const bookingDashboardUrl = (id: string) => `${siteUrl()}/admin/bookings/${encodeURIComponent(id)}`;

export function inviteFor(b: CallBookingDoc, forFounder: boolean, cancelled = false): InviteDetails {
  return {
    uid: b._id,
    start: b.slotStart.getTime(),
    end: b.slotEnd.getTime(),
    title: forFounder ? `Call: ${b.business} (${b.meetingType})` : 'Free call with RMAST Studio',
    description: forFounder
      ? `${b.name} · ${b.email} · ${b.phone}\nTopics: ${b.topics.join(', ')}\n${b.notes}`
      : `Your free 15-minute call with RMAST Studio (${b.meetingType}). We'll send the meeting link before the call.`,
    location: b.meetingLink || b.meetingType,
    organizerEmail: process.env.SMTP_USER?.trim(),
    attendeeEmail: forFounder ? undefined : b.email,
    cancelled
  };
}

function bookingRows(b: CallBookingDoc, includeContact: boolean): [string, string][] {
  const start = b.slotStart.getTime();
  const list: [string, string][] = [
    ['When (PKT)', esc(formatSlot(start, PKT_ZONE))],
    ['When (their time)', esc(formatSlot(start, b.visitorTimezone))],
    ['Meeting type', esc(b.meetingType)],
    ['Topics', esc(b.topics.join(', '))]
  ];
  if (includeContact) {
    const wa = waLink(b.phone);
    list.unshift(
      ['Name', esc(b.name)],
      ['Business', esc(b.business)],
      ['Role', esc(b.role)],
      ['Email', link(`mailto:${b.email}`, b.email)],
      ['Phone', `${esc(b.phone)}${wa ? ` · ${link(wa, 'WhatsApp')}` : ''}`]
    );
    list.push(['Their note', esc(b.notes || '—')], ['Time zone', esc(b.visitorTimezone)]);
  }
  return list;
}

export function bookingAdminEmail(b: CallBookingDoc, audit: AuditLeadDoc | null, kind: 'new' | 'rescheduled' | 'cancelled' = 'new') {
  const when = formatSlot(b.slotStart.getTime(), PKT_ZONE);
  const prefix = kind === 'new' ? '📅 Call booked' : kind === 'rescheduled' ? '🔁 Call rescheduled' : '❌ Call cancelled';
  const subject = `${prefix}: ${b.business} · ${when} · ${b.meetingType}`;
  const auditRows: [string, string][] = audit
    ? [
        ['Audit score', `<strong>${audit.overallScore}/100</strong> · ${esc(assistantById(audit.mainAssistant).name)}`],
        ['Audit', `${audit.pngUrl ? `${link(audit.pngUrl, 'PNG')} · ` : ''}${link(auditDashboardUrl(audit._id), 'open in dashboard')}`]
      ]
    : [];
  const html = layout(
    `${prefix}: ${b.business}`,
    `${rows([...bookingRows(b, true), ...auditRows])}
<p style="margin:16px 0">${button(bookingDashboardUrl(b._id), 'Open booking in dashboard')}</p>`
  );
  const text = `${subject}\n\n${textBlock([
    ['Name', b.name],
    ['Email', b.email],
    ['Phone', b.phone],
    ['When (PKT)', when],
    ['When (their time)', formatSlot(b.slotStart.getTime(), b.visitorTimezone)],
    ['Topics', b.topics.join(', ')]
  ])}\n\nDashboard: ${bookingDashboardUrl(b._id)}`;
  return { subject, html, text };
}

export function bookingVisitorEmail(b: CallBookingDoc, manageToken: string, kind: 'new' | 'rescheduled' | 'cancelled' = 'new') {
  const when = formatSlot(b.slotStart.getTime(), b.visitorTimezone);
  const first = b.name.split(' ')[0];
  const gcal = googleCalendarLink(inviteFor(b, false));
  if (kind === 'cancelled') {
    const html = layout(
      'Your call is cancelled',
      `<p>Hi ${esc(first)},</p><p>Your call on <strong>${esc(when)}</strong> is cancelled. If you'd like to pick a new time, you can book again any time.</p>
<p style="margin:20px 0">${button(bookingPageUrl(), 'Book a new time')}</p>`
    );
    return { subject: 'Your RMAST Studio call is cancelled', html, text: `Hi ${first},\n\nYour call on ${when} is cancelled. Book a new time: ${bookingPageUrl()}` };
  }
  const title = kind === 'new' ? "You're booked!" : 'Your call has a new time';
  const html = layout(
    title,
    `<p>Hi ${esc(first)},</p>
<p>Your free call with RMAST Studio is booked for:</p>
<p style="font-size:18px;color:${TEAL};font-weight:bold;margin:12px 0">${esc(when)}</p>
${rows([
  ['Meeting type', esc(b.meetingType)],
  ['Topics', esc(b.topics.join(', '))]
])}
<p>We'll send you the meeting link before the call. A calendar invite is attached.</p>
<p style="margin:16px 0">${button(gcal, 'Add to Google Calendar')}</p>
<p style="color:${MUTED};font-size:13px">Need a different time? ${link(manageBookingUrl(manageToken), 'Reschedule or cancel')}.</p>`
  );
  const text = `Hi ${first},

Your free call with RMAST Studio is booked for ${when} (${b.meetingType}).
We'll send you the meeting link before the call. A calendar invite is attached.

Add to Google Calendar: ${gcal}
Reschedule or cancel: ${manageBookingUrl(manageToken)}`;
  return { subject: kind === 'new' ? `You're booked: ${when}` : `New time for your call: ${when}`, html, text };
}

export function reminderEmail(b: CallBookingDoc, which: '24h' | '1h', forFounder: boolean) {
  const zone = forFounder ? PKT_ZONE : b.visitorTimezone;
  const when = formatSlot(b.slotStart.getTime(), zone);
  const lead = which === '24h' ? 'Coming up' : 'Starting in about an hour';
  const subject = forFounder ? `⏰ ${lead}: ${b.business} · ${when}` : `Reminder: your RMAST Studio call · ${when}`;
  const linkLine = b.meetingLink
    ? `<p>Meeting link: ${link(b.meetingLink, b.meetingLink)}</p>`
    : forFounder
    ? `<p><strong>No meeting link sent yet.</strong> Add it in the dashboard.</p>`
    : '<p>We’ll send the meeting link shortly before the call.</p>';
  const html = layout(
    forFounder ? `${lead}: call with ${b.business}` : `${lead}: your call with RMAST Studio`,
    `${rows(forFounder ? bookingRows(b, true) : [['When', esc(when)], ['Meeting type', esc(b.meetingType)]])}${linkLine}
${forFounder ? `<p>${button(bookingDashboardUrl(b._id), 'Open booking')}</p>` : ''}`
  );
  return { subject, html, text: `${subject}\n${b.meetingLink ? `Meeting link: ${b.meetingLink}` : ''}` };
}

export function meetingLinkEmail(b: CallBookingDoc) {
  const when = formatSlot(b.slotStart.getTime(), b.visitorTimezone);
  const first = b.name.split(' ')[0];
  const html = layout(
    'Your meeting link',
    `<p>Hi ${esc(first)},</p><p>Here's the link for your call on <strong>${esc(when)}</strong>:</p>
<p style="margin:16px 0">${button(b.meetingLink, `Join the ${b.meetingType === 'Zoom' ? 'Zoom' : 'meeting'}`)}</p>
<p style="color:${MUTED};font-size:13px">${esc(b.meetingLink)}</p>`
  );
  return { subject: `Meeting link for your RMAST Studio call · ${when}`, html, text: `Hi ${first},\n\nYour call on ${when}: ${b.meetingLink}` };
}
