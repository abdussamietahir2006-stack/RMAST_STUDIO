// Branded price-list PDFs, built in the browser from the same data the pages render.
// Loaded on demand (dynamic import) by the Studio Assistant, so jsPDF never slows page loads.
import type { jsPDF } from 'jspdf';
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
import type { Currency, PricingPackage } from '../types';
import { createBrandedDoc, headerBand, issuedDate, plain, MUTED, type BrandedDoc } from './pdfDoc';

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

const packageColumns = { 0: { cellWidth: 38, fontStyle: 'bold' }, 1: { cellWidth: 28 } };

// Package tables (also used by the company profile's pricing overview)
export function packageTable(b: BrandedDoc, packages: PricingPackage[], currency: Currency) {
  b.table(
    ['Package', 'Price', "What's included"],
    packages.map((p) => [
      p.title.includes(p.tier) ? p.title : `${p.title}\n${p.tier}`,
      `${formatPrice(p.priceUSD, currency)}\n${p.billingFrequency}`,
      p.included.slice(0, 6).join('\n')
    ]),
    packageColumns
  );
}

export function buildPriceListPdf(sheet: PriceSheet, currency: Currency): jsPDF {
  const b = createBrandedDoc();
  const money = (usd: number) => formatPrice(usd, currency);
  const hourly = (rate?: { min: number; max: number }) => (rate ? formatHourlyRate(rate, currency) : '-');

  headerBand(b, SHEET_TITLES[sheet], `Prices in ${currency}  |  Issued ${issuedDate()}`, 'Digital systems for real estate  |  Cinematic AI content for brands');

  // --- Real estate ---
  if (sheet !== 'ai-content') {
    b.heading('Real Estate Digital Systems', 'Starting prices, tier prices and hourly rates for each service.');
    b.table(
      ['Service', 'Starting', 'Starter / Growth / Premium', 'Hourly rate', 'Billing'],
      servicesData
        .filter((s) => s.division === 'real-estate')
        .map((s) => [
          s.title,
          money(s.startingPriceUSD),
          s.tiers?.length ? s.tiers.map((t) => money(t.priceUSD)).join(' / ') : 'Custom quote',
          hourly(s.hourlyRateUSD),
          s.billingType === 'monthly' ? 'per month' : 'one-time'
        ]),
      { 0: { cellWidth: 52, fontStyle: 'bold' } }
    );

    b.heading('Real Estate Packages');
    packageTable(b, realEstatePackages, currency);

    b.heading('Add-ons & Ongoing Support');
    b.table(
      ['Add-on', 'Category', 'Price', 'Notes'],
      addOnItems.map((a) => [a.title, a.category, `${money(a.priceUSD)}${a.isMonthly ? ' /mo' : ''}`, a.notes ?? '']),
      { 0: { cellWidth: 50, fontStyle: 'bold' }, 1: { cellWidth: 26 }, 2: { cellWidth: 24 } }
    );
  }

  // --- Brands & AI content ---
  if (sheet !== 'real-estate') {
    b.heading('Brands & AI Content Studio', 'Cinematic AI video for property, fashion, food, products and social campaigns.');
    b.table(
      ['Service', 'From (per video)', 'Hourly rate'],
      servicesData.filter((s) => s.division === 'ai-content').map((s) => [s.title, money(s.startingPriceUSD), hourly(s.hourlyRateUSD)]),
      { 0: { cellWidth: 90, fontStyle: 'bold' } }
    );

    b.heading('Individual AI Video Rates');
    b.table(
      ['Tier', 'Price per video', 'What you get'],
      aiVideoSinglePricing.map((v) => [v.tier, money(v.priceUSD), v.description]),
      { 0: { cellWidth: 30, fontStyle: 'bold' }, 1: { cellWidth: 30 } }
    );

    b.heading('Monthly Video Bundles', 'Price per month for the number of videos delivered each month.');
    b.table(
      ['Videos / month', 'Starter', 'Standard', 'Professional', 'Savings'],
      videoMonthlyBundles.map((v) => [`${v.quantity} videos`, money(v.starter.usd), money(v.standard.usd), money(v.professional.usd), v.savingsLabel ?? '']),
      { 0: { fontStyle: 'bold' } }
    );

    b.heading('Content Packages');
    packageTable(b, aiContentPackages, currency);
  }

  // --- Both divisions together ---
  if (sheet === 'all') {
    b.heading('Complete Business Packages', 'Digital systems and AI content combined in one engagement.');
    packageTable(b, completeBusinessPackages, currency);
  }

  b.paragraph(
    plain(
      `All prices are starting rates in ${currency}. Final pricing is confirmed after a short scoping call. ` +
        'Hourly rates apply to work quoted by the hour (changes, extra features, ongoing support). ' +
        'Third-party costs such as domains, hosting, paid APIs and ad spend are billed separately.'
    ),
    { size: 8.5, color: MUTED }
  );

  return b.finish();
}

export function downloadPriceListPdf(sheet: PriceSheet, currency: Currency): void {
  buildPriceListPdf(sheet, currency).save(`RMAST-Price-List-${FILE_NAMES[sheet]}-${currency}.pdf`);
}
