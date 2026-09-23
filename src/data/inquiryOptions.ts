// Builds the tier choices shown inside the inquiry popup, from the same pricing data the pages use.
import type { InquiryOption, PricingPackage } from '../types/index.js';
import { aiVideoSinglePricing, videoMonthlyBundles } from './pricingData.js';

// Individual AI videos: Starter / Standard / Professional (per video)
export function videoTierOptions(): InquiryOption[] {
  return aiVideoSinglePricing.map((t) => ({
    id: t.tier,
    label: t.tier,
    title: `${t.tier} Tier AI Video Production`,
    priceUSD: t.priceUSD,
    billingFrequency: '/ video',
    packageId: `video-${t.tier.toLowerCase()}`,
    description: t.description,
    features: [t.description, 'Sound design and color grading included', '4K master export'],
    badge: t.tier === 'Professional' ? 'Signature' : undefined
  }));
}

// Monthly bundles: the same three tiers at the chosen volume (per month)
export function videoBundleOptions(quantity: number): InquiryOption[] {
  const bundle = videoMonthlyBundles.find((b) => b.quantity === quantity);
  if (!bundle) return [];
  const tiers = [
    { id: 'Starter', price: bundle.starter.usd },
    { id: 'Standard', price: bundle.standard.usd },
    { id: 'Professional', price: bundle.professional.usd }
  ];
  return tiers.map(({ id, price }) => ({
    id,
    label: id,
    title: `${quantity}-Video Monthly Retainer · ${id}`,
    priceUSD: price,
    billingFrequency: '/ month',
    packageId: `bundle-${quantity}-${id.toLowerCase()}`,
    description: aiVideoSinglePricing.find((t) => t.tier === id)?.description,
    features: [
      `${quantity} ${id.toLowerCase()} videos delivered every month`,
      'Monthly creative direction and storyboard alignment',
      'TikTok, Reels & 16:9 widescreen formats included',
      bundle.savingsLabel ?? ''
    ].filter(Boolean),
    badge: id === 'Standard' ? 'Popular' : undefined
  }));
}

// Package tiers (Starter / Growth / Premium) for one division
export function packageOptions(packages: PricingPackage[]): InquiryOption[] {
  return packages.map((p) => ({
    id: p.id,
    label: p.tier,
    title: p.title,
    priceUSD: p.priceUSD,
    billingFrequency: p.billingFrequency,
    packageId: p.id,
    description: p.bestFor,
    features: p.included,
    badge: p.highlight ? 'Most chosen' : undefined
  }));
}
