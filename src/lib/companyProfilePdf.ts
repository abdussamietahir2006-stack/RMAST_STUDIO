// RMAST company profile / portfolio PDF: everything the studio does, in one document.
// Built in the browser from the same data the website renders, loaded on demand by the Studio Assistant.
import type { jsPDF } from 'jspdf';
import { servicesData } from '../data/servicesData';
import { projectsData } from '../data/projectsData';
import { teamData, studioPhilosophy } from '../data/teamData';
import { coreProcessSteps, realEstateWorkflowSteps, aiContentWorkflowSteps } from '../data/processData';
import {
  realEstatePackages,
  aiContentPackages,
  completeBusinessPackages,
  aiVideoSinglePricing,
  formatPrice,
  formatHourlyRate
} from '../data/pricingData';
import { CONTACT } from '../config/contact';
import type { Currency, ServiceDetail } from '../types';
import { auroraStripe, createBrandedDoc, issuedDate, plain, INK, MUTED, VIOLET, type BrandedDoc } from './pdfDoc';
import { packageTable } from './pricePdf';

// Portfolio entries carry a "[CMS Placeholder]" marker for the admin; it is not for clients
const clean = (text: string) => text.replace(/\s*\[CMS Placeholder\]/gi, '').trim();

function coverPage(b: BrandedDoc, currency: Currency) {
  const { doc, pageW, pageH, margin } = b;
  doc.setFillColor(...INK);
  doc.rect(0, 0, pageW, pageH, 'F');
  auroraStripe(doc, 0, pageH * 0.62, pageW, 2.2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...VIOLET);
  doc.text('COMPANY PROFILE & PORTFOLIO', margin, 60);

  doc.setFontSize(46);
  doc.setTextColor(255, 255, 255);
  doc.text('RMAST', margin, 84);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(30);
  doc.setTextColor(...VIOLET);
  doc.text('Studio', margin, 98);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('Digital systems for real estate.', margin, 124);
  doc.text('Cinematic AI content for brands.', margin, 132);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(200, 196, 220);
  const intro = doc.splitTextToSize(
    plain(
      'A founder-led digital studio serving real estate brokerages and developers in the USA, UAE and Canada, and ambitious brands worldwide. ' +
        studioPhilosophy.tagline
    ),
    pageW - margin * 2
  );
  doc.text(intro, margin, 146);

  // Contact block under the stripe
  const y = pageH * 0.62 + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...VIOLET);
  doc.text('CONTACT', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(235, 231, 245);
  doc.text(plain(`Email: ${CONTACT.email}`), margin, y + 8);
  doc.text(plain(`WhatsApp: ${CONTACT.whatsappDisplay}`), margin, y + 15);
  doc.text(plain(`Instagram: @${CONTACT.instagramHandle}`), margin, y + 22);
  doc.setFontSize(8.5);
  doc.setTextColor(150, 146, 170);
  doc.text(plain(`Issued ${issuedDate()}  |  Prices in ${currency}`), margin, pageH - 20);

  b.newPage();
}

function serviceSection(b: BrandedDoc, s: ServiceDetail, currency: Currency) {
  const money = (usd: number) => formatPrice(usd, currency);
  // Keep each service together on one page
  b.ensureSpace(
    40 +
      b.measure(s.headline) +
      b.measure(s.summary) +
      b.measure(s.targetAudience, 9) +
      b.measure(s.keyFeatures, 9, true) +
      b.measure(s.deliverables, 9, true)
  );
  b.label(s.kicker);
  b.subheading(s.title);
  b.paragraph(s.headline, { italic: true, color: MUTED, size: 9.5, gap: 2.5 });
  b.paragraph(s.summary);
  b.label('Who it is for');
  b.paragraph(s.targetAudience, { size: 9 });
  b.label('What we do');
  b.bullets(s.keyFeatures);
  b.label('What you receive');
  b.bullets(s.deliverables);

  // Pricing line
  const unit = s.billingType === 'monthly' ? ' per month' : s.billingType === 'per-video' ? ' per video' : ' one-time';
  const parts = [`From ${money(s.startingPriceUSD)}${unit}`];
  if (s.tiers?.length) parts.push(s.tiers.map((t) => `${t.name} ${money(t.priceUSD)}`).join(', '));
  if (s.hourlyRateUSD) parts.push(`Hourly ${formatHourlyRate(s.hourlyRateUSD, currency)}`);
  b.label('Investment');
  b.paragraph(parts.join('  |  '), { size: 9, color: INK });

  // Divider between services
  b.doc.setDrawColor(226, 222, 240);
  b.doc.setLineWidth(0.2);
  b.doc.line(b.margin, b.y - 1, b.pageW - b.margin, b.y - 1);
  b.y += 6;
}

export function buildCompanyProfilePdf(currency: Currency): jsPDF {
  const b = createBrandedDoc();
  const money = (usd: number) => formatPrice(usd, currency);
  const reServices = servicesData.filter((s) => s.division === 'real-estate');
  const contentServices = servicesData.filter((s) => s.division === 'ai-content');

  coverPage(b, currency);

  // --- About ---
  b.heading('About RMAST Studio');
  b.paragraph(
    'RMAST Studio is a small, founder-led international digital practice. We build the digital systems that run modern real estate businesses, ' +
      'and we produce cinematic AI video content for brands, without the cost and delays of traditional film production.'
  );
  b.paragraph(studioPhilosophy.subtext);
  b.label('Where we work');
  b.paragraph('Remote studio serving the USA, UAE, Canada and clients worldwide.', { size: 9 });

  b.heading('Our Two Divisions');
  b.subheading('Division 01 - Real Estate Digital Systems');
  b.paragraph(
    'Systems that run your business. We engineer the technical infrastructure behind high-producing brokerages: websites, custom software, CRMs, AI automation, AI assistants, social media, virtual assistance and back-office operations.'
  );
  b.bullets(reServices.map((s) => s.title));
  b.subheading('Division 02 - Brands & AI Content Studio');
  b.paragraph(
    'Content that makes people stop scrolling. Cinematic AI commercial films, fashion campaigns, food cinema, product films and property tours - from idea to final frame in days, with no film sets, permits or location costs.'
  );
  b.bullets(contentServices.map((s) => s.title));

  b.heading('What Makes Us Different');
  for (const p of studioPhilosophy.principles) {
    b.subheading(`${p.number}  ${p.title}`);
    b.paragraph(p.description, { size: 9 });
  }

  // --- Services in detail ---
  b.newPage();
  b.heading('Real Estate Digital Systems', 'Every service in detail: what it does, who it is for, what you receive and what it costs.');
  reServices.forEach((s) => serviceSection(b, s, currency));

  b.newPage();
  b.heading('Brands & AI Content Studio', 'Cinematic AI video for property, fashion, food, products, advertising and social media.');
  b.label('Per-video rates');
  b.paragraph(aiVideoSinglePricing.map((v) => `${v.tier} ${money(v.priceUSD)}`).join('  |  ') + '  (monthly bundles save up to 24%)', { size: 9, color: INK });
  contentServices.forEach((s) => serviceSection(b, s, currency));

  // --- Portfolio ---
  b.newPage();
  b.heading('Selected Work', 'A selection of systems and campaigns from both divisions.');
  for (const p of projectsData) {
    // Keep each project together on one page
    b.ensureSpace(
      45 +
        b.measure(p.subtitle) +
        b.measure(p.description) +
        b.measure(p.challenges ?? [], 9, true) +
        b.measure(p.solutions ?? [], 9, true) +
        b.measure(p.deliverablesList ?? [], 9, true) +
        b.measure(p.outcome)
    );
    b.label(`${p.category}  |  ${clean(p.clientLocation)}  |  ${p.year}`);
    b.subheading(p.title);
    b.paragraph(p.subtitle, { italic: true, color: MUTED, size: 9.5, gap: 2.5 });
    b.paragraph(p.description);
    if (p.challenges?.length) {
      b.label('The challenge');
      b.bullets(p.challenges);
    }
    if (p.solutions?.length) {
      b.label('Our solution');
      b.bullets(p.solutions);
    }
    if (p.deliverablesList?.length) {
      b.label('Delivered');
      b.bullets(p.deliverablesList);
    }
    b.label('Outcome');
    b.paragraph(p.outcome, { color: INK });
    b.label('Services');
    b.paragraph(p.services.join('  |  '), { size: 9, color: MUTED });
    b.y += 4;
  }

  // --- Process ---
  b.newPage();
  b.heading('How We Work', 'A clear six-step process, with the founders involved at every stage.');
  for (const step of coreProcessSteps) {
    b.subheading(`${step.step}  ${step.name} - ${step.title}`);
    b.paragraph(step.summary, { size: 9 });
    b.bullets(step.activities, { size: 8.5 });
  }
  b.ensureSpace(95);
  b.heading('Division Workflows');
  b.table(
    ['Step', 'Real Estate Systems', 'AI Content Production'],
    realEstateWorkflowSteps.map((r, i) => {
      const c = aiContentWorkflowSteps[i];
      return [r.step, `${r.title}: ${r.desc}`, c ? `${c.title}: ${c.desc}` : ''];
    }),
    { 0: { cellWidth: 14, fontStyle: 'bold' } }
  );

  // --- Founders ---
  b.heading('The People Behind RMAST', `${studioPhilosophy.tagline} You work directly with the founders.`);
  for (const f of teamData) {
    b.ensureSpace(60);
    b.subheading(f.name);
    b.label(`${f.role}  |  ${f.title}`);
    b.paragraph(f.bio);
    b.paragraph(`"${f.quote}"`, { italic: true, color: MUTED, size: 9 });
    b.label('Focus');
    b.bullets(f.focus, { size: 8.5 });
    if (f.linkedin) b.paragraph(`LinkedIn: ${f.linkedin}`, { size: 8.5, color: MUTED });
  }

  // --- Pricing overview ---
  b.newPage();
  b.heading('Packages at a Glance', `Starting prices in ${currency}. Full price lists are available on request.`);
  // Each package table (about 70mm) stays on one page with its title
  b.subheading('Real Estate Packages');
  packageTable(b, realEstatePackages, currency);
  b.ensureSpace(80);
  b.subheading('Content Packages');
  packageTable(b, aiContentPackages, currency);
  b.ensureSpace(80);
  b.subheading('Complete Business Packages');
  packageTable(b, completeBusinessPackages, currency);

  // --- Next steps ---
  b.heading("Let's Build What's Next");
  b.paragraph(
    'Tell us what you want to build, automate or create. We reply within 24 hours and start with a short scoping call with the founders - no obligation.'
  );
  b.bullets([`Email: ${CONTACT.email}`, `WhatsApp: ${CONTACT.whatsappDisplay}`, `Instagram: @${CONTACT.instagramHandle}`, 'Or use the contact form on our website']);
  b.paragraph(
    'All prices are starting rates; final pricing is confirmed after scoping. Third-party costs such as domains, hosting, paid APIs and ad spend are billed separately.',
    { size: 8.5, color: MUTED }
  );

  return b.finish({ skipCover: true });
}

export function downloadCompanyProfilePdf(currency: Currency): void {
  buildCompanyProfilePdf(currency).save(`RMAST-Studio-Company-Profile-${currency}.pdf`);
}
