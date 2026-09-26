// Shared building blocks for RMAST's branded PDFs (price lists, company profile).
// Only imported by modules that the Studio Assistant loads on demand.
import { jsPDF } from 'jspdf';
import { formatHourlyRate, formatPrice, USD_TO_AED_RATE } from '../data/pricingData';
import autoTable from 'jspdf-autotable';
import { CONTACT } from '../config/contact';

type RGB = [number, number, number];

export const INK: RGB = [11, 10, 18];
export const VIOLET: RGB = [166, 139, 255];
export const PINK: RGB = [255, 92, 170];
export const AMBER: RGB = [255, 181, 71];
export const CYAN: RGB = [61, 220, 255];
export const MUTED: RGB = [96, 92, 112];
export const BODY: RGB = [40, 38, 52];
const ROW_TINT: RGB = [246, 243, 255];
const RULE: RGB = [226, 222, 240];

// The built-in PDF fonts only cover Latin-1, so typographic characters are swapped for plain ones
export const plain = (text: string) =>
  text
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/→/g, '->')
    .replace(/≈/g, '~')
    .replace(/…/g, '...')
    .replace(/[^\x00-\xFF]/g, '');

export interface BrandedDoc {
  doc: jsPDF;
  margin: number;
  pageW: number;
  pageH: number;
  /** Current vertical position (mm) */
  y: number;
  /** Start a new page if fewer than `space` mm remain */
  ensureSpace(space: number): void;
  /** Height (mm) that `paragraph` or `bullets` will take for this text, used to keep blocks together */
  measure(text: string | string[], size?: number, bullet?: boolean): number;
  /** Usable height of a page below the top margin */
  pageBody: number;
  newPage(): void;
  heading(title: string, sub?: string): void;
  subheading(title: string): void;
  paragraph(text: string, opts?: { size?: number; color?: RGB; italic?: boolean; gap?: number }): void;
  bullets(items: string[], opts?: { size?: number }): void;
  label(text: string): void;
  table(head: string[], body: string[][], columnStyles?: Record<number, object>): void;
  /** Adds footers with contact details and page numbers (not on a cover page), then returns the document */
  finish(opts?: { skipCover?: boolean }): jsPDF;
}

// Coloured stripe used under headers and on the cover
export function auroraStripe(doc: jsPDF, x: number, y: number, width: number, height: number) {
  const colours = [VIOLET, PINK, AMBER, CYAN];
  colours.forEach((c, i) => {
    doc.setFillColor(...c);
    doc.rect(x + (width / colours.length) * i, y, width / colours.length, height, 'F');
  });
}

export function createBrandedDoc(): BrandedDoc {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const textW = pageW - margin * 2;

  const b: BrandedDoc = {
    doc,
    margin,
    pageW,
    pageH,
    y: 20,
    pageBody: pageH - 18 - 20,
    ensureSpace(space) {
      // A block taller than a page can't be kept together: just start it on a fresh page
      if (b.y > pageH - 18 - Math.min(space, pageH - 18 - 20)) b.newPage();
    },
    measure(text, size = 9.5, bullet = false) {
      doc.setFontSize(size);
      const items = Array.isArray(text) ? text : [text];
      const lineH = size * (bullet ? 0.44 : 0.45);
      const lines = items.reduce((n, t) => n + (doc.splitTextToSize(plain(t), textW - (bullet ? 5 : 0)) as string[]).length, 0);
      return lines * lineH + (bullet ? items.length * 1.2 + 2.5 : 3.5);
    },
    newPage() {
      doc.addPage();
      b.y = 20;
    },
    heading(title, sub) {
      // Never leave a heading stranded at the foot of a page
      b.ensureSpace(55);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(...INK);
      doc.text(plain(title), margin, b.y);
      doc.setDrawColor(...VIOLET);
      doc.setLineWidth(0.7);
      doc.line(margin, b.y + 2.2, margin + 26, b.y + 2.2);
      b.y += 8;
      if (sub) b.paragraph(sub, { size: 9.5, color: MUTED, gap: 3 });
    },
    subheading(title) {
      b.ensureSpace(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(...INK);
      const lines = doc.splitTextToSize(plain(title), textW);
      doc.text(lines, margin, b.y);
      b.y += lines.length * 5 + 1;
    },
    label(text) {
      b.ensureSpace(12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(...VIOLET);
      doc.text(plain(text).toUpperCase(), margin, b.y);
      b.y += 4.5;
    },
    paragraph(text, opts = {}) {
      const size = opts.size ?? 9.5;
      doc.setFont('helvetica', opts.italic ? 'italic' : 'normal');
      doc.setFontSize(size);
      doc.setTextColor(...(opts.color ?? BODY));
      const lineH = size * 0.45;
      for (const line of doc.splitTextToSize(plain(text), textW) as string[]) {
        b.ensureSpace(lineH + 2);
        doc.text(line, margin, b.y);
        b.y += lineH;
      }
      b.y += opts.gap ?? 3.5;
    },
    bullets(items, opts = {}) {
      const size = opts.size ?? 9;
      const lineH = size * 0.44;
      doc.setFontSize(size);
      for (const item of items) {
        const lines = doc.splitTextToSize(plain(item), textW - 5) as string[];
        b.ensureSpace(lines.length * lineH + 2);
        doc.setFillColor(...VIOLET);
        doc.circle(margin + 1.2, b.y - 1.1, 0.7, 'F');
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...BODY);
        doc.text(lines, margin + 4.5, b.y);
        b.y += lines.length * lineH + 1.2;
      }
      b.y += 2.5;
    },
    table(head, body, columnStyles = {}) {
      autoTable(doc, {
        startY: b.y,
        head: [head.map(plain)],
        body: body.map((row) => row.map(plain)),
        margin: { left: margin, right: margin, top: 18, bottom: 20 },
        theme: 'grid',
        rowPageBreak: 'avoid',
        styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 1.7, textColor: INK, lineColor: RULE, lineWidth: 0.2, valign: 'middle' },
        headStyles: { fillColor: INK, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8.5 },
        alternateRowStyles: { fillColor: ROW_TINT },
        columnStyles
      });
      b.y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    },
    finish(opts = {}) {
      const pages = doc.getNumberOfPages();
      for (let i = opts.skipCover ? 2 : 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setDrawColor(...RULE);
        doc.setLineWidth(0.2);
        doc.line(margin, pageH - 13, pageW - margin, pageH - 13);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...MUTED);
        doc.text(plain(`${CONTACT.email}  |  WhatsApp ${CONTACT.whatsappDisplay}  |  Instagram @${CONTACT.instagramHandle}`), margin, pageH - 8);
        doc.text(`Page ${i} of ${pages}`, pageW - margin, pageH - 8, { align: 'right' });
      }
      return doc;
    }
  };
  return b;
}

// Dark header band used at the top of the first page of a document
// Optional small print (terms) sits inside the band, so it never spills onto a page of its own
export function headerBand(b: BrandedDoc, title: string, subtitle: string, rightNote: string, terms?: string) {
  const { doc, pageW, margin } = b;
  doc.setFontSize(7.5);
  const termLines = terms ? (doc.splitTextToSize(plain(terms), pageW - margin * 2) as string[]) : [];
  const bandH = 46 + termLines.length * 3.6;
  doc.setFillColor(...INK);
  doc.rect(0, 0, pageW, bandH, 'F');
  auroraStripe(doc, 0, bandH, pageW, 1.6);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('RMAST Studio', margin, 20);
  doc.setFontSize(13);
  doc.setTextColor(...VIOLET);
  doc.text(plain(title), margin, 29);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(200, 196, 220);
  doc.text(plain(subtitle), margin, 37);
  // Top right, level with the studio name, so a long subtitle never runs into it
  doc.text(plain(rightNote), pageW - margin, 20, { align: 'right' });
  if (termLines.length) {
    doc.setFontSize(7.5);
    doc.setTextColor(150, 146, 170);
    doc.text(termLines, margin, 43.5, { lineHeightFactor: 1.35 });
  }
  b.y = bandH + 12;
}

export const issuedDate = () => new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

// PDFs always show both currencies: US dollars and UAE dirhams
export const bothPrices = (usd: number, sep = ' / ') => `${formatPrice(usd, 'USD')}${sep}${formatPrice(usd, 'AED')}`;
export const bothHourly = (rate: { min: number; max: number }, sep = ' / ') =>
  `${formatHourlyRate(rate, 'USD')}${sep}${formatHourlyRate(rate, 'AED')}`;
export const CURRENCY_NOTE = `Prices in USD and AED (1 USD = ${USD_TO_AED_RATE} AED)`;
