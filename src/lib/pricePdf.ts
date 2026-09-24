// Branded price-list PDFs, built in the browser from the same data the pages render.
// Loaded on demand (dynamic import) by the Studio Assistant, so jsPDF never slows page loads.
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { servicesData } from '../data/servicesData';
import {
  realEstatePackages,
  aiContentPackages,
  completeBusinessPackages,
  aiVideoSinglePricing,
  videoMonthlyBundles,
  addOnItems,
  formatPrice,
  formatHourlyRate
} from '../data/pricingData';
import { CONTACT } from '../config/contact';
import type { Currency, PricingPackage } from '../types';

export type PriceSheet = 'all' | 'real-estate' | 'ai-content';

const SHEET_TITLES: Record<PriceSheet, string> = {
  all: 'Complete Price List',
  'real-estate': 'Real Estate Digital Systems',
  'ai-content': 'Brands & AI Content Studio'
};

const FILE_NAMES: Record<PriceSheet, string> = {
  all: 'All-Services',
  'real-estate': 'Real-Estate',
  'ai-content': 'Brands-and-Content'
};

// Brand colours (RGB)
const INK: [number, number, number] = [11, 10, 18];
const VIOLET: [number, number, number] = [166, 139, 255];
const PINK: [number, number, number] = [255, 92, 170];
const MUTED: [number, number, number] = [96, 92, 112];
const ROW_TINT: [number, number, number] = [246, 243, 255];

// The built-in PDF fonts only cover Latin-1, so typographic characters are swapped for plain ones
const plain = (text: string) =>
  text
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/→/g, '->')
    .replace(/≈/g, '~')
    .replace(/…/g, '...')
    .replace(/[^\x00-\xFF]/g, '');

export function buildPriceListPdf(sheet: PriceSheet, currency: Currency): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const money = (usd: number) => plain(formatPrice(usd, currency));
  const hourly = (rate?: { min: number; max: number }) => (rate ? plain(formatHourlyRate(rate, currency)) : '-');
  const dated = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  // --- Cover band ---
  doc.setFillColor(...INK);
  doc.rect(0, 0, pageW, 46, 'F');
  // Aurora accent stripe
  const stripe = [VIOLET, PINK, [255, 181, 71], [61, 220, 255]] as [number, number, number][];
  stripe.forEach((c, i) => {
    doc.setFillColor(...c);
    doc.rect((pageW / stripe.length) * i, 46, pageW / stripe.length, 1.6, 'F');
  });
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('RMAST Studio', margin, 20);
  doc.setFontSize(13);
  doc.setTextColor(...VIOLET);
  doc.text(SHEET_TITLES[sheet], margin, 29);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 196, 220);
  doc.text(`Prices in ${currency}  |  Issued ${dated}`, margin, 37);
  doc.text('Digital systems for real estate  |  Cinematic AI content for brands', pageW - margin, 37, { align: 'right' });

  let y = 58;

  const heading = (title: string, sub?: string) => {
    // Never leave a heading stranded at the foot of a page with only a row or two under it
    if (y > pageH - 75) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...INK);
    doc.text(plain(title), margin, y);
    doc.setDrawColor(...VIOLET);
    doc.setLineWidth(0.6);
    doc.line(margin, y + 2, margin + 24, y + 2);
    y += 7;
    if (sub) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(plain(sub), margin, y);
      y += 5;
    }
  };

  const table = (head: string[], body: string[][], columnStyles: Record<number, object> = {}) => {
    autoTable(doc, {
      startY: y,
      head: [head.map(plain)],
      body: body.map((row) => row.map(plain)),
      margin: { left: margin, right: margin, bottom: 20 },
      theme: 'grid',
      rowPageBreak: 'avoid',
      styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2.4, textColor: INK, lineColor: [226, 222, 240], lineWidth: 0.2, valign: 'middle' },
      headStyles: { fillColor: INK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
      alternateRowStyles: { fillColor: ROW_TINT },
      columnStyles
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  };

  const packageRows = (packages: PricingPackage[]) =>
    packages.map((p) => [
      p.title.includes(p.tier) ? p.title : `${p.title}\n${p.tier}`,
      `${money(p.priceUSD)}\n${p.billingFrequency}`,
      p.included.slice(0, 6).join('\n')
    ]);
  const packageColumns = { 0: { cellWidth: 38, fontStyle: 'bold' }, 1: { cellWidth: 28 } };

  // --- Real estate ---
  if (sheet !== 'ai-content') {
    const reServices = servicesData.filter((s) => s.division === 'real-estate');
    heading('Real Estate Digital Systems', 'Starting prices, tier prices and hourly rates for each service.');
    table(
      ['Service', 'Starting', 'Starter / Growth / Premium', 'Hourly rate', 'Billing'],
      reServices.map((s) => [
        s.title,
        money(s.startingPriceUSD),
        s.tiers?.length ? s.tiers.map((t) => money(t.priceUSD)).join(' / ') : 'Custom quote',
        hourly(s.hourlyRateUSD),
        s.billingType === 'monthly' ? 'per month' : 'one-time'
      ]),
      { 0: { cellWidth: 52, fontStyle: 'bold' } }
    );

    heading('Real Estate Packages');
    table(['Package', 'Price', "What's included"], packageRows(realEstatePackages), packageColumns);

    heading('Add-ons & Ongoing Support');
    table(
      ['Add-on', 'Category', 'Price', 'Notes'],
      addOnItems.map((a) => [a.title, a.category, `${money(a.priceUSD)}${a.isMonthly ? ' /mo' : ''}`, a.notes ?? '']),
      { 0: { cellWidth: 50, fontStyle: 'bold' }, 1: { cellWidth: 26 }, 2: { cellWidth: 24 } }
    );
  }

  // --- Brands & AI content ---
  if (sheet !== 'real-estate') {
    const contentServices = servicesData.filter((s) => s.division === 'ai-content');
    heading('Brands & AI Content Studio', 'Cinematic AI video for property, fashion, food, products and social campaigns.');
    table(
      ['Service', 'From (per video)', 'Hourly rate'],
      contentServices.map((s) => [s.title, money(s.startingPriceUSD), hourly(s.hourlyRateUSD)]),
      { 0: { cellWidth: 90, fontStyle: 'bold' } }
    );

    heading('Individual AI Video Rates');
    table(
      ['Tier', 'Price per video', 'What you get'],
      aiVideoSinglePricing.map((v) => [v.tier, money(v.priceUSD), v.description]),
      { 0: { cellWidth: 30, fontStyle: 'bold' }, 1: { cellWidth: 30 } }
    );

    heading('Monthly Video Bundles', 'Price per month for the number of videos delivered each month.');
    table(
      ['Videos / month', 'Starter', 'Standard', 'Professional', 'Savings'],
      videoMonthlyBundles.map((b) => [
        `${b.quantity} videos`,
        money(b.starter.usd),
        money(b.standard.usd),
        money(b.professional.usd),
        b.savingsLabel ?? ''
      ]),
      { 0: { fontStyle: 'bold' } }
    );

    heading('Content Packages');
    table(['Package', 'Price', "What's included"], packageRows(aiContentPackages), packageColumns);
  }

  // --- Both divisions together ---
  if (sheet === 'all') {
    heading('Complete Business Packages', 'Digital systems and AI content combined in one engagement.');
    table(['Package', 'Price', "What's included"], packageRows(completeBusinessPackages), packageColumns);
  }

  // --- Closing note ---
  if (y > pageH - 40) {
    doc.addPage();
    y = 20;
  }
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const note = plain(
    `All prices are starting rates in ${currency}. Final pricing is confirmed after a short scoping call. ` +
      'Hourly rates apply to work quoted by the hour (changes, extra features, ongoing support). ' +
      'Third-party costs such as domains, hosting, paid APIs and ad spend are billed separately.'
  );
  doc.text(doc.splitTextToSize(note, pageW - margin * 2), margin, y);

  // --- Footer on every page ---
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 222, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, pageH - 13, pageW - margin, pageH - 13);
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(plain(`${CONTACT.email}  |  WhatsApp ${CONTACT.whatsappDisplay}  |  Instagram @${CONTACT.instagramHandle}`), margin, pageH - 8);
    doc.text(`Page ${i} of ${pages}`, pageW - margin, pageH - 8, { align: 'right' });
  }

  return doc;
}

export function downloadPriceListPdf(sheet: PriceSheet, currency: Currency): void {
  buildPriceListPdf(sheet, currency).save(`RMAST-Price-List-${FILE_NAMES[sheet]}-${currency}.pdf`);
}
