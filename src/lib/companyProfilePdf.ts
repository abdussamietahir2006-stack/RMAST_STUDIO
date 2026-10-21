// RMAST company profile: the three Assistants in detail, how we work, plans, FAQ and founders.
// Built in the browser from the same data the website renders, loaded on demand by the Studio Assistant.
// No prices: like the website, plans are quoted after the free audit.
import type { jsPDF } from 'jspdf';
import { ASSISTANTS, FAQ, HOW_IT_WORKS, LEAD_RESPONSE_STEPS, PLANS, type Assistant, type AssistantId } from '../data/assistantsData';
import { teamData, studioPhilosophy } from '../data/teamData';
import { CONTACT } from '../config/contact';
import {
  CORAL,
  CORAL_TEXT,
  MUTED,
  OCHRE,
  OCHRE_TEXT,
  SAND,
  TEAL,
  createBrandedDoc,
  issuedDate,
  paletteStripe,
  plain,
  type BrandedDoc
} from './pdfDoc';

type RGB = [number, number, number];

// Each Assistant's colour: `fill` for dots and bars, `text` for small print on white paper
const ASSISTANT_COLOURS: Record<AssistantId, { fill: RGB; text: RGB }> = {
  technical: { fill: TEAL, text: TEAL },
  creative: { fill: CORAL, text: CORAL_TEXT },
  virtual: { fill: OCHRE, text: OCHRE_TEXT }
};

const SITE = __SITE_URL__;

function coverPage(b: BrandedDoc) {
  const { doc, pageW, pageH, margin } = b;
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, pageW, pageH, 'F');
  paletteStripe(doc, 0, pageH * 0.62, pageW, 2.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...CORAL);
  doc.text('COMPANY PROFILE', margin, 60);

  doc.setFontSize(46);
  doc.setTextColor(...SAND);
  doc.text('RMAST', margin, 84);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(30);
  doc.setTextColor(...CORAL);
  doc.text('Studio', margin, 98);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...SAND);
  doc.text('Virtual, Creative and Technical Assistants', margin, 124);
  doc.text('for real estate teams.', margin, 132);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(214, 226, 222);
  const intro = doc.splitTextToSize(
    plain(
      'Leads answered in 60 seconds, content that gets seen, and paperwork off your plate. For real estate agents, teams and brokerages in the USA and Canada, and some in Dubai, on a monthly retainer.'
    ),
    pageW - margin * 2
  );
  doc.text(intro, margin, 146);

  // Contact block under the stripe
  const y = pageH * 0.62 + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...CORAL);
  doc.text('CONTACT', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...SAND);
  doc.text(plain(`Free audit: ${SITE}/free-audit`), margin, y + 8);
  doc.text(plain(`Email: ${CONTACT.email}`), margin, y + 15);
  doc.text(plain(`WhatsApp: ${CONTACT.whatsappDisplay}`), margin, y + 22);
  doc.text(plain(`Instagram: @${CONTACT.instagramHandle}`), margin, y + 29);
  doc.setFontSize(8.5);
  doc.setTextColor(170, 196, 190);
  doc.text(plain(`Issued ${issuedDate()}`), margin, pageH - 20);

  b.newPage();
}

// One Assistant in full: what it is, the problems it solves, every sub-service, the month, the process
function assistantSection(b: BrandedDoc, a: Assistant) {
  const colour = ASSISTANT_COLOURS[a.id];
  b.newPage();
  // Colour bar across the top of the Assistant's first page
  b.doc.setFillColor(...colour.fill);
  b.doc.rect(0, 0, b.pageW, 3, 'F');

  b.label(a.name, colour.text);
  b.heading(a.tagline);
  b.paragraph(a.intro);

  b.label('Problems we solve', colour.text);
  b.bullets(
    a.problems.map((p) => `${p.title}. ${p.text}`),
    { color: colour.fill }
  );

  b.label('What we do', colour.text);
  for (const s of a.subServices) {
    // Keep each sub-service together on one page
    b.ensureSpace(14 + b.measure(s.summary) + b.measure(s.delivered, 9, true));
    b.subheading(s.flagship ? `${s.title} (flagship)` : s.title);
    b.paragraph(s.summary);
    b.bullets(s.delivered, { color: colour.fill });
  }

  b.ensureSpace(14 + b.measure(a.monthly, 9, true));
  b.label('What you get each month', colour.text);
  b.bullets(a.monthly, { color: colour.fill });

  b.ensureSpace(50);
  b.label('How we start', colour.text);
  b.table(
    ['Step', 'What happens'],
    a.process.map((p, i) => [`${i + 1}. ${p.title}`, p.text]),
    { 0: { cellWidth: 42, fontStyle: 'bold' } }
  );
}

export function buildCompanyProfilePdf(): jsPDF {
  const b = createBrandedDoc();

  coverPage(b);

  // --- About ---
  b.heading('About RMAST Studio');
  b.paragraph(
    'RMAST Studio gives real estate agents, teams and brokerages a team of Assistants on a monthly retainer. ' +
      'Each Assistant takes one part of the business off your hands: answering and following up every lead, making and posting your content, ' +
      'and handling admin and transactions. Hire one Assistant, or all three as your Full Team.'
  );
  b.paragraph(`${studioPhilosophy.tagline} ${studioPhilosophy.subtext}`);
  b.label('Who we work with');
  b.paragraph('Real estate agents, teams and brokerages in the USA and Canada, and some in Dubai. We work remotely, on your hours.', { size: 9 });

  // --- The three Assistants at a glance ---
  b.heading('Three Assistants. One team.', 'Every service we offer sits under one of three Assistants.');
  b.table(
    ['Assistant', 'What it does', 'Services'],
    ASSISTANTS.map((a) => [a.name, a.tagline, a.subServices.map((s) => s.title).join('\n')]),
    { 0: { cellWidth: 38, fontStyle: 'bold' }, 1: { cellWidth: 52 } }
  );

  // --- The flagship ---
  b.ensureSpace(80);
  b.heading('Lead Response System', 'Our flagship, part of the Technical Assistant. Every lead answered in 60 seconds, day or night.');
  b.paragraph(
    'Most leads go to the agent who replies first. The Lead Response System replies for you on WhatsApp, SMS, Instagram and your website, ' +
      'asks a few short questions, and hands you the serious buyers and sellers with a viewing already booked.'
  );
  b.table(
    ['Step', 'What happens'],
    LEAD_RESPONSE_STEPS.map((s, i) => [`${i + 1}. ${s.title}`, s.text]),
    { 0: { cellWidth: 42, fontStyle: 'bold' } }
  );

  // --- Each Assistant in detail ---
  ASSISTANTS.forEach((a) => assistantSection(b, a));

  // --- How it works and plans (continues on the Virtual Assistant's last page when there is room) ---
  b.heading('How it works', 'From free audit to monthly report.');
  b.table(
    ['Step', 'What happens'],
    HOW_IT_WORKS.map((s, i) => [`${i + 1}. ${s.title}`, s.text]),
    { 0: { cellWidth: 52, fontStyle: 'bold' } }
  );

  b.heading('Plans', 'Both plans are monthly retainers, priced after your free audit so you only pay for what you need.');
  b.table(
    ['Plan', 'What it is', "What's included", 'Price'],
    PLANS.map((p) => [p.name, p.summary, p.includes.join('\n'), `${p.price}\nmonthly retainer`]),
    { 0: { cellWidth: 28, fontStyle: 'bold' }, 1: { cellWidth: 48 }, 3: { cellWidth: 28 } }
  );

  // --- FAQ ---
  b.heading('Questions realtors ask us');
  for (const { q, a } of FAQ) {
    b.ensureSpace(12 + b.measure(a, 9));
    b.subheading(q);
    b.paragraph(a, { size: 9 });
  }

  // --- Founders ---
  b.heading('The people behind RMAST', `${studioPhilosophy.tagline} You work directly with the founders.`);
  for (const f of teamData) {
    b.ensureSpace(60);
    b.subheading(f.name);
    b.label(`${f.role}  |  ${f.title}`);
    b.paragraph(f.bio);
    b.paragraph(`"${f.quote}"`, { italic: true, color: MUTED, size: 9 });
    if (f.linkedin) b.paragraph(`LinkedIn: ${f.linkedin}`, { size: 8.5, color: MUTED });
  }

  // --- Next steps ---
  b.heading('See what’s costing you leads, free');
  b.paragraph(
    'Start with a free audit. We look at how fast your leads get a reply, your website and social accounts, and where admin piles up. ' +
      'Then we send you what we found and what we would fix first. No cost and no obligation.'
  );
  b.bullets([
    `Free audit: ${SITE}/free-audit`,
    `Book a call: ${SITE}/contact`,
    `Email: ${CONTACT.email}`,
    `WhatsApp: ${CONTACT.whatsappDisplay}`,
    `Instagram: @${CONTACT.instagramHandle}`
  ]);
  b.paragraph('We reply within 24 hours.', { size: 8.5, color: MUTED });

  return b.finish({ skipCover: true });
}

export function downloadCompanyProfilePdf(): void {
  buildCompanyProfilePdf().save(`RMAST-Studio-Company-Profile.pdf`);
}
