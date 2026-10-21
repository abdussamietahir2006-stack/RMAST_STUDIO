// Short "Services & Plans" PDF: the three Assistants, what each one does, and the two plans.
// Loaded on demand (dynamic import) by the Studio Assistant, so jsPDF never slows page loads.
// No prices: like the website, plans are quoted after the free audit.
import type { jsPDF } from 'jspdf';
import { ASSISTANTS, HOW_IT_WORKS, PLANS } from '../data/assistantsData';
import { CONTACT } from '../config/contact';
import { createBrandedDoc, headerBand, issuedDate, MUTED } from './pdfDoc';

const SITE = __SITE_URL__;

export function buildServicesPlansPdf(): jsPDF {
  const b = createBrandedDoc();

  headerBand(
    b,
    'Services & Plans',
    'Virtual, Creative and Technical Assistants for real estate teams',
    `Issued ${issuedDate()}`,
    'Monthly retainers, priced after a free audit of your leads, content and admin. ' +
      'Third-party costs such as software subscriptions, domains, hosting and ad spend are billed separately.'
  );

  b.heading('Three Assistants', 'Hire one Assistant, or all three as your Full Team.');
  for (const a of ASSISTANTS) {
    b.ensureSpace(40 + a.subServices.length * 9);
    b.subheading(`${a.name}: ${a.tagline}`);
    b.table(
      ['Service', 'What you get'],
      a.subServices.map((s) => [s.flagship ? `${s.title}\n(flagship)` : s.title, s.delivered.join('\n')]),
      { 0: { cellWidth: 58, fontStyle: 'bold' } }
    );
  }

  b.heading('Plans', 'Both plans are monthly retainers. We price your plan after the free audit, so you only pay for what you need.');
  b.table(
    ['Plan', "What's included", 'Price'],
    PLANS.map((p) => [p.name, p.includes.join('\n'), `${p.price}\nmonthly retainer`]),
    { 0: { cellWidth: 32, fontStyle: 'bold' }, 2: { cellWidth: 32 } }
  );

  b.heading('How it works');
  b.table(
    ['Step', 'What happens'],
    HOW_IT_WORKS.map((s, i) => [`${i + 1}. ${s.title}`, s.text]),
    { 0: { cellWidth: 52, fontStyle: 'bold' } }
  );

  // A short closing block: a subheading (not a full heading) so it doesn't jump to a page of its own
  b.ensureSpace(32);
  b.subheading('Get your free audit');
  b.bullets([`Free audit: ${SITE}/free-audit`, `Book a call: ${SITE}/contact`, `Email: ${CONTACT.email}`, `WhatsApp: ${CONTACT.whatsappDisplay}`]);
  b.paragraph('We reply within 24 hours.', { size: 8.5, color: MUTED });

  return b.finish();
}

export function downloadServicesPlansPdf(): void {
  buildServicesPlansPdf().save('RMAST-Studio-Services-and-Plans.pdf');
}
