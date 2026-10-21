import nodemailer, { type Transporter } from 'nodemailer';
import type { DispatchMethod, StoredInquiry } from '../types/index.js';
import { CONTACT } from '../config/contact.js';

let transporter: Transporter | null | undefined;

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '');
  if (!user || !pass) {
    transporter = null;
    return null;
  }
  const port = Number(process.env.SMTP_PORT) || 465;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST?.trim() || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user, pass }
  });
  return transporter;
}

export const isMailConfigured = () => Boolean(getTransporter());

const DISPATCH_LABELS: Record<DispatchMethod, string> = {
  whatsapp: 'WhatsApp (also sent via WhatsApp)',
  email: 'Email option',
  form: 'Package form',
  'contact-form': 'Contact page form'
};

// Returns true when the notification was handed to the SMTP server
export async function emailLead(lead: StoredInquiry): Promise<boolean> {
  const mailer = getTransporter();
  if (!mailer) return false;

  const oneLine = (s: string) => s.replace(/[\r\n]+/g, ' ');
  const rows: [string, string][] = [
    ['Package / Service', lead.targetTitle],
    ['Division', lead.division],
    ['Estimated value', lead.estimatedPrice],
    ['Name', lead.clientName],
    ['Email', lead.clientEmail],
    ['Phone / WhatsApp', lead.clientPhone],
    ['Company', lead.clientCompany],
    ['Location', lead.clientLocation],
    ['Timeline', lead.timeline],
    ['Submitted via', DISPATCH_LABELS[lead.dispatchMethod]],
    ['Reference', lead.id]
  ];
  const text = [
    ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    '',
    'Notes:',
    lead.notes || '(none)',
    '',
    'Reply to this email to respond to the client directly.'
  ].join('\n');

  try {
    await mailer.sendMail({
      from: `"RMAST Studio Website" <${process.env.SMTP_USER?.trim()}>`,
      to: process.env.NOTIFY_EMAIL?.trim() || CONTACT.email,
      replyTo: `"${oneLine(lead.clientName).replace(/"/g, '')}" <${lead.clientEmail}>`,
      subject: oneLine(`[RMAST Inquiry] ${lead.targetTitle} - ${lead.clientName}`).slice(0, 200),
      text
    });
    return true;
  } catch (err) {
    console.error('Failed to send inquiry email', err);
    return false;
  }
}
