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

// ---------------------------------------------------------------------------
// Social media manager (dashboard): one AI-written Instagram carousel per day
// ---------------------------------------------------------------------------

// How a slide is laid out when drawn (see src/admin/social/slideRenderer.ts)
export type SocialSlideLayout = 'cover' | 'list' | 'points' | 'statement' | 'tags' | 'compare' | 'cta';

export interface SocialSlide {
  layout: SocialSlideLayout;
  kicker: string; // small uppercase label above the headline
  headline: string; // white part of the headline
  highlight: string; // aurora-gradient part of the headline (second line)
  body: string; // supporting sentence
  items: { label: string; value: string }[]; // "list" rows (label + value); "tags" uses the labels as pills
  points: { title: string; text: string }[]; // "points" layout (numbered)
  before?: string; // "compare" layout: the weak version (crossed out)
  after?: string; // "compare" layout: the better version
}

export type SocialPostStatus = 'new' | 'downloaded' | 'posted' | 'skipped';

// Exact pixel size the slides are created at (e.g. 1080x1350 Instagram portrait, 1200x628 banner)
export interface PostSize {
  width: number;
  height: number;
}

export interface SocialPost {
  id: string;
  day: string; // YYYY-MM-DD in the studio's time zone
  createdAt: string;
  auto: boolean; // the day's automatic idea (false = extra idea or the founder's own idea)
  brief?: string; // the founder's own idea, when the post was made from one
  status: SocialPostStatus;
  pillar: string; // content angle used for the idea
  title: string; // internal name for the idea
  angle: string; // why this idea is worth posting
  slides: SocialSlide[]; // 1 (single post) to 20: cover, content slides, call to action
  caption: string;
  hashtags: string[];
  style: VideoStyle; // visual look of the slides (same looks as the reels)
  seed: number; // varies details within the look
  size: PostSize;
}

// ---------------------------------------------------------------------------
// Social video manager (dashboard): 10-60 second motion-graphics reels made from the founder's idea
// ---------------------------------------------------------------------------

// How a scene animates (see src/admin/video/engine.ts)
export type VideoSceneType = 'hook' | 'statement' | 'list' | 'stat' | 'tags' | 'compare' | 'steps' | 'cta';
// How a scene hands over to the next one
export type VideoTransition = 'wipe' | 'zoom' | 'slide' | 'glitch' | 'circle' | 'flash';
// The visual look of a reel (colours, type, background)
export type VideoStyle = 'aurora' | 'editorial' | 'neon' | 'bold' | 'mono';
// Background music composed for the reel
export type MusicMood = 'none' | 'peaceful' | 'uplifting' | 'blazing';

export interface VideoScene {
  type: VideoSceneType;
  duration: number; // seconds on screen
  transition: VideoTransition; // into the next scene
  kicker: string; // small label
  headline: string; // white text
  highlight: string; // gradient text
  body: string; // supporting line
  items: { label: string; value: string }[]; // list rows, tags, steps
  statValue: number; // "stat": the number that counts up
  statPrefix: string; // e.g. "$"
  statSuffix: string; // e.g. "/mo", "%", "x"
  before: string; // "compare": the weak version
  after: string; // "compare": the better version
}

export interface SocialVideo {
  id: string;
  createdAt: string;
  brief: string; // the founder's idea or script
  seconds: number; // target length
  status: SocialPostStatus;
  style: VideoStyle;
  seed: number; // varies layout details and music within a style, so no two reels look alike
  music: MusicMood;
  title: string;
  angle: string;
  scenes: VideoScene[];
  caption: string;
  hashtags: string[];
}
