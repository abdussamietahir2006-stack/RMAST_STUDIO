// Builds the tier choices shown inside the inquiry popup, from the same pricing data the pages use.
import type { InquiryOption, PricingPackage, ServiceDetail } from '../types/index.js';
import { aiPostSinglePricing, aiVideoSinglePricing, postMonthlyBundles, videoMonthlyBundles } from './pricingData.js';

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

// Individual AI static posts: Starter / Standard / Professional (per post)
export function postTierOptions(): InquiryOption[] {
  return aiPostSinglePricing.map((t) => ({
    id: t.tier,
    label: t.tier,
    title: `${t.tier} Tier AI Static Post`,
    priceUSD: t.priceUSD,
    billingFrequency: '/ post',
    packageId: `post-${t.tier.toLowerCase()}`,
    description: t.description,
    features: [t.description, 'Caption and hashtags included', 'High-resolution files for Instagram, Facebook & LinkedIn'],
    badge: t.tier === 'Professional' ? 'Signature' : undefined
  }));
}

// Monthly post bundles: the same three tiers at the chosen volume (per month)
export function postBundleOptions(quantity: number): InquiryOption[] {
  const bundle = postMonthlyBundles.find((b) => b.quantity === quantity);
  if (!bundle) return [];
  const tiers = [
    { id: 'Starter', price: bundle.starter.usd },
    { id: 'Standard', price: bundle.standard.usd },
    { id: 'Professional', price: bundle.professional.usd }
  ];
  return tiers.map(({ id, price }) => ({
    id,
    label: id,
    title: `${quantity}-Post Monthly Retainer · ${id}`,
    priceUSD: price,
    billingFrequency: '/ month',
    packageId: `post-bundle-${quantity}-${id.toLowerCase()}`,
    description: aiPostSinglePricing.find((t) => t.tier === id)?.description,
    features: [
      `${quantity} ${id.toLowerCase()} static posts delivered every month`,
      'Monthly content calendar and captions',
      'Feed, story and ad sizes included',
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

// A single service: AI Content services offer the per-video tiers; real estate services offer
// their published Starter / Growth / Premium tiers when they have them.
export function serviceOptions(service: ServiceDetail): InquiryOption[] {
  if (service.division === 'ai-content') {
    return aiVideoSinglePricing.map((t) => ({
      id: t.tier,
      label: t.tier,
      title: `${service.title} · ${t.tier}`,
      priceUSD: t.priceUSD,
      billingFrequency: '/ video',
      description: t.description,
      features: [t.description, ...service.keyFeatures.slice(0, 3)],
      badge: t.tier === 'Professional' ? 'Signature' : undefined
    }));
  }
  const unit = service.billingType === 'monthly' ? '/ month' : 'one-time';
  return (service.tiers ?? []).map((t) => ({
    id: t.name,
    label: t.name,
    title: `${service.title} · ${t.name}`,
    priceUSD: t.priceUSD,
    billingFrequency: unit,
    description: t.note,
    features: [t.note, ...service.keyFeatures.slice(0, 3)],
    badge: t.name === 'Growth' ? 'Popular' : undefined
  }));
}
