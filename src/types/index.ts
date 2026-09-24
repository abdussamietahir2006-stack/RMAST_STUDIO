export type Currency = 'USD' | 'AED';

export interface ServiceDetail {
  id: string;
  slug: string;
  title: string;
  division: 'real-estate' | 'ai-content';
  kicker: string;
  headline: string;
  summary: string;
  targetAudience: string;
  keyFeatures: string[];
  deliverables: string[];
  startingPriceUSD: number;
  billingType: 'one-time' | 'monthly' | 'custom' | 'per-video';
  scopeNotes?: string;
  // Hourly rate range, for work quoted by the hour
  hourlyRateUSD?: { min: number; max: number };
  // Published tier prices, offered as choices in the inquiry popup
  tiers?: { name: string; priceUSD: number; note: string }[];
  relatedServiceSlugs?: string[];
  image: string;
}

export interface PricingPackage {
  id: string;
  title: string;
  tier: 'Starter' | 'Growth' | 'Premium';
  division: 'real-estate' | 'ai-content' | 'complete-business' | 'video-single';
  priceUSD: number;
  billingFrequency: 'one-time' | '/month' | '/video';
  bestFor: string;
  highlight?: boolean;
  included: string[];
  notIncluded?: string[];
  ctaText?: string;
}

export interface VideoTierPricing {
  quantity: number;
  starter: { usd: number };
  standard: { usd: number };
  professional: { usd: number };
  savingsLabel?: string;
}

export interface AddOnItem {
  id: string;
  category: 'Website' | 'AI Systems' | 'Ongoing Support';
  title: string;
  priceUSD: number;
  isMonthly?: boolean;
  notes?: string;
}

export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  division: 'real-estate' | 'ai-content';
  category: 'REAL ESTATE' | 'WEB' | 'SOFTWARE' | 'CRM' | 'AI AUTOMATION' | 'AI VIDEO' | 'FASHION' | 'FOOD' | 'PRODUCT';
  clientLocation: string; // e.g., 'Miami, USA', 'Dubai, UAE', 'Toronto, CA', 'Worldwide'
  year: string;
  services: string[];
  outcome: string;
  description: string;
  challenges?: string[];
  solutions?: string[];
  image: string;
  // AI Content service slug whose dashboard video replaces the image (shared with the AI Content page)
  videoSlot?: string;
  aspectRatio?: 'landscape' | 'portrait' | 'cinematic';
  deliverablesList?: string[];
}

export interface Founder {
  id: string;
  name: string;
  role: string;
  title: string;
  bio: string;
  quote: string;
  focus: string[];
  image: string;
  linkedin?: string;
}

// One selectable tier inside the inquiry popup (e.g. Starter / Standard / Professional)
export interface InquiryOption {
  id: string;
  label: string;
  title: string;
  priceUSD: number;
  billingFrequency: string;
  packageId?: string;
  description?: string;
  features?: string[];
  badge?: string;
}

export interface InquiryTarget {
  serviceId?: string;
  packageId?: string;
  title: string;
  division?: 'real-estate' | 'ai-content' | 'general';
  priceUSD?: number;
  billingFrequency?: string;
  kicker?: string;
  features?: string[];
  // When present, the visitor can switch between these tiers inside the popup
  options?: InquiryOption[];
  selectedOptionId?: string;
}

export type DispatchMethod = 'whatsapp' | 'email' | 'form' | 'contact-form';
export type InquiryStatus = 'new' | 'reviewed' | 'contacted';
export type LeadDivision = 'real-estate' | 'ai-content' | 'general';

// Where a lead is filed in the dashboard: division folder + sub-folder
// (a service slug, 'packages' for priced packages/bundles/add-ons, or 'general')
export interface LeadCategory {
  division: LeadDivision;
  group: string;
}

// Hints the browser sends so the server can file the lead in the right folder
export interface LeadRouting {
  serviceId?: string;
  packageId?: string;
  divisionKey?: LeadDivision;
  isPriced?: boolean;
}

// Payload the browser sends to POST /api/leads
export interface LeadInput extends LeadRouting {
  targetTitle: string;
  division: string;
  estimatedPrice: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCompany: string;
  clientLocation: string;
  timeline: string;
  notes: string;
  dispatchMethod: DispatchMethod;
}

export interface StoredInquiry extends Omit<LeadInput, keyof LeadRouting> {
  id: string;
  timestamp: string;
  status: InquiryStatus;
  category: LeadCategory;
}

export interface LeadStats {
  total: number;
  newCount: number;
  last7Days: number;
  last30Days: number;
  byStatus: Record<InquiryStatus, number>;
  byFolder: { division: LeadDivision; group: string; count: number; newCount: number }[];
  daily: { date: string; count: number }[]; // last 30 days, oldest first, YYYY-MM-DD
}

export type MediaKind = 'image' | 'video';

export interface MediaAsset {
  key: string;
  kind: MediaKind;
  url: string;
  contentType: string;
  size: number;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin';
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}
