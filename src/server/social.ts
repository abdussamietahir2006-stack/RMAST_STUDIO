// Social media manager: writes one creative Instagram carousel (4 slides + caption) per day.
// Gemini writes the idea and copy as structured JSON; the dashboard draws the slides in the
// studio's visual style (src/admin/social/slideRenderer.ts) and the founders download and post.
import { randomUUID } from 'node:crypto';
import { GoogleGenAI, Type } from '@google/genai';
import type { SocialPost, SocialPostStatus, SocialSlide, SocialSlideLayout } from '../types/index.js';
import { collections, type SocialPostDoc } from './db.js';
import { CONTACT } from '../config/contact.js';
import { servicesData } from '../data/servicesData.js';
import {
  realEstatePackages,
  aiContentPackages,
  completeBusinessPackages,
  aiVideoSinglePricing,
  videoMonthlyBundles
} from '../data/pricingData.js';

export const SOCIAL_STATUSES: SocialPostStatus[] = ['new', 'downloaded', 'posted', 'skipped'];
const LAYOUTS: SocialSlideLayout[] = ['cover', 'list', 'points', 'statement', 'cta'];

// "Today" follows the studio's clock, so the cron and the dashboard agree on the date
const STUDIO_TZ = () => process.env.SOCIAL_TIMEZONE?.trim() || 'Asia/Karachi';
export const studioDay = (date = new Date()) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: STUDIO_TZ(), year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

// Content angles, rotated so consecutive days never feel the same
const PILLARS: { name: string; brief: string }[] = [
  { name: 'Myth vs reality', brief: 'Bust one specific belief real estate agents or brand owners hold about websites, CRMs, automation or AI video. Name the myth, then show the reality.' },
  { name: 'Price transparency', brief: 'Show exactly what one of our real prices buys (e.g. what a $500 website or a $45 AI video actually includes), and what agencies usually hide.' },
  { name: 'What-if scenario', brief: 'A short, vivid hypothetical story framed as "Picture this": a lead arriving at 2 AM, a launch week without a film crew. Walk it through our system, beat by beat.' },
  { name: 'Behind the scenes', brief: 'Reveal how we actually build or produce something: the steps behind an AI property tour, a CRM pipeline or a fashion film.' },
  { name: 'Contrarian take', brief: 'A bold, defensible opinion that goes against common industry advice (e.g. "You do not need more leads"), backed by clear reasoning.' },
  { name: 'Before / after', brief: 'Contrast the messy "before" (spreadsheets, missed WhatsApps, expensive shoots) with the "after" our systems create. Concrete, visual differences.' },
  { name: 'Cost of doing nothing', brief: 'Show what a specific problem (slow replies, no follow-up, outdated website, no video content) quietly costs a business, then the fix.' },
  { name: 'Service spotlight', brief: 'Put one service in the spotlight through a single sharp use case, not a feature list. Make the reader picture using it.' },
  { name: 'Founder perspective', brief: 'A point of view from the founders (Abdussamie and Mashhood) about how they work: small team, direct accountability, systems over headcount.' },
  { name: 'Industry teardown', brief: 'Tear down a common pattern (a typical brokerage lead flow, a typical product launch shoot) and show where it leaks time or money, and how to fix it.' }
];

// Facts the model may use; everything comes from the site's own data
function studioFacts(): string {
  const usd = (n: number) => `$${n.toLocaleString('en-US')}`;
  const services = servicesData
    .map((s) => {
      const unit = s.billingType === 'monthly' ? '/month' : s.billingType === 'per-video' ? '/video' : ' one-time';
      const tiers = s.tiers?.length ? ` (tiers ${s.tiers.map((t) => `${t.name} ${usd(t.priceUSD)}`).join(', ')})` : '';
      return `- ${s.title} [${s.division === 'real-estate' ? 'Real Estate' : 'AI Content'}]: from ${usd(s.startingPriceUSD)}${unit}${tiers}. ${s.summary}`;
    })
    .join('\n');
  const packages = [...realEstatePackages, ...aiContentPackages, ...completeBusinessPackages]
    .map((p) => `- ${p.title}: ${usd(p.priceUSD)} ${p.billingFrequency} - ${p.included.slice(0, 4).join('; ')}`)
    .join('\n');
  return `RMAST Studio: a small, founder-led remote studio (founders Raja Muhammad Abdussamie Tahir, systems architect, and Mashhood, creative technologist & AI director).
Division 1 - Real Estate Digital Systems for brokerages and developers in the USA, UAE and Canada.
Division 2 - Brands & AI Content: cinematic AI video for brands worldwide (no film sets, permits or weather delays).
Promises: transparent pricing published on the website, reply within 24 hours, you work directly with the founders, first month of website maintenance included.
Website extras: an AI assistant visitors can talk to by voice or chat, downloadable price-list PDFs and a company profile PDF.
AI video: ${aiVideoSinglePricing.map((v) => `${v.tier} ${usd(v.priceUSD)}`).join(', ')} per video; monthly bundles of 10/20/30 videos from ${usd(videoMonthlyBundles[0].starter.usd)}/month, saving up to 24%.
Contact: WhatsApp ${CONTACT.whatsappDisplay}, ${CONTACT.email}, Instagram @${CONTACT.instagramHandle}, website link in bio.

Services:
${services}

Packages:
${packages}`;
}

const SLIDE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    layout: { type: Type.STRING, enum: LAYOUTS },
    kicker: { type: Type.STRING },
    headline: { type: Type.STRING },
    highlight: { type: Type.STRING },
    body: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: { label: { type: Type.STRING }, value: { type: Type.STRING } }, required: ['label', 'value'] }
    },
    points: {
      type: Type.ARRAY,
      items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, text: { type: Type.STRING } }, required: ['title', 'text'] }
    }
  },
  required: ['layout', 'kicker', 'headline', 'highlight', 'body', 'items', 'points']
};

const POST_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    angle: { type: Type.STRING },
    slides: { type: Type.ARRAY, items: SLIDE_SCHEMA, minItems: '4', maxItems: '4' },
    caption: { type: Type.STRING },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ['title', 'angle', 'slides', 'caption', 'hashtags']
};

function instructions(pillar: (typeof PILLARS)[number], recent: SocialPostDoc[], day: string): string {
  const history = recent.length
    ? recent.map((p) => `- ${p.day} [${p.pillar}] ${p.title}: "${p.slides[0]?.headline ?? ''} ${p.slides[0]?.highlight ?? ''}"`).join('\n')
    : '- (none yet)';
  return `You are the creative director and social media strategist for RMAST Studio. Write ONE Instagram carousel post for ${day}.

TODAY'S CONTENT ANGLE: ${pillar.name}
${pillar.brief}

AUDIENCE: real estate brokers, agency owners and developers (USA, UAE, Canada) and brand owners (fashion, food, products). Busy, sceptical, scrolling fast.

CREATIVE STANDARD (most important):
- The idea must be specific, surprising and useful, and feel like it could only come from RMAST.
- Build the post around ONE creative device: a sharp number from our real prices, a surprising comparison, a hypothetical mini-story told beat by beat, a myth and its correction, a "this vs that" contrast, or a reveal of how something is actually made.
- Banned: generic tips lists ("5 tips to..."), "Did you know?", "In today's digital world", "game-changer", "unlock", "elevate", "take it to the next level", "seamless", "cutting-edge", motivational quotes, emojis on slides.
- Banned claims: never invent clients, testimonials, statistics, results or experience ("we've seen it countless times", "our clients saw 3x"). Hypothetical stories must be framed as hypothetical ("Picture this", "Imagine"). Use only prices and facts listed below.
- The cover must stop the scroll with tension: a bold claim, a number or a question the reader needs answered.
- Every slide must add something new and earn the swipe. Concrete details beat adjectives. List values must be informative (never the same word repeated, never just "Included").
- Do not repeat the ideas, hooks or headlines of recent posts (listed below).

GOOD cover examples (style, not to copy): headline "You don't need" + highlight "more leads." | headline "What $500" + highlight "actually buys." | headline "Your 2 AM lead" + highlight "just left." | headline "No crew. No set." + highlight "Still cinema."
BAD cover examples: headline "STOP" + highlight "THE" (broken phrase) | "Unlock Growth" (generic) | "Transform Your Business" (empty).

SLIDE FORMAT (exactly 4 slides, drawn at 1080x1350 in our dark aurora style):
The headline (white) and highlight (gradient) of a slide are read together as ONE natural phrase: the headline is the opening, the highlight is the punchy ending. Each must be a complete chunk of words, never a single stray article or preposition.
1. layout "cover": kicker (2-4 words), headline (2-4 words), highlight (1-3 words), body (one sentence, max 18 words).
2 and 3. choose the best layout for each (they should differ):
   - "list": headline + highlight (short title), body (max 14 words), items: 3-5 rows of {label (max 30 chars), value (max 14 chars: a price, time or short result)}.
   - "points": headline + highlight, body (max 14 words), exactly 3 points of {title (max 36 chars), text (max 85 chars)}.
   - "statement": one powerful statement: headline (max 70 chars) + highlight (max 36 chars, the punchline), body (short supporting line, max 18 words).
4. Slide 4 layout "cta": kicker, headline + highlight (short), body (what to do next, max 20 words). Contact details are added automatically.
Field limits: kicker max 26 chars, headline max 34 chars (except statement), highlight max 26 chars, body max 130 chars. Stay inside every limit: text over the limit is cut. Leave items/points as empty arrays when the layout does not use them.

CAPTION: 90-180 words. First line is a hook. Then the insight in 2-4 short paragraphs separated by a blank line (use "\n\n" between paragraphs). End with a clear call to action (link in bio, DM, or WhatsApp). A few tasteful emojis are fine. No hashtags inside the caption.
HASHTAGS: 10-14 relevant hashtags without the # sign, mixing niche and broad.
TITLE: a short internal name for this idea. ANGLE: one sentence on why this post will perform.

STUDIO FACTS:
${studioFacts()}

RECENT POSTS (do not repeat):
${history}`;
}

// ---------------------------------------------------------------------------
// Model output is checked and trimmed before it is stored
// ---------------------------------------------------------------------------

const text = (v: unknown, max: number) => {
  const clean = (typeof v === 'string' ? v : '').replace(/\s+/g, ' ').replace(/^#+/, '').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  // Prefer ending on a full sentence, then on a whole word
  const sentence = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  if (sentence > max * 0.55) return cut.slice(0, sentence + 1);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.5 ? cut.slice(0, space) : cut).replace(/[\s,;:.\-–—]+$/, '');
};

function cleanSlide(raw: unknown, forced?: SocialSlideLayout): SocialSlide {
  const r = (raw ?? {}) as Record<string, unknown>;
  const layout = forced ?? (LAYOUTS.includes(r.layout as SocialSlideLayout) ? (r.layout as SocialSlideLayout) : 'points');
  const statement = layout === 'statement';
  return {
    layout,
    kicker: text(r.kicker, 32),
    headline: text(r.headline, statement ? 100 : 48),
    highlight: text(r.highlight, statement ? 50 : 32),
    body: text(r.body, 170),
    items: (Array.isArray(r.items) ? r.items : [])
      .slice(0, 6)
      .map((i) => ({ label: text((i as Record<string, unknown>)?.label, 36), value: text((i as Record<string, unknown>)?.value, 22) }))
      .filter((i) => i.label),
    points: (Array.isArray(r.points) ? r.points : [])
      .slice(0, 3)
      .map((p) => ({ title: text((p as Record<string, unknown>)?.title, 44), text: text((p as Record<string, unknown>)?.text, 150) }))
      .filter((p) => p.title)
  };
}

function cleanPost(raw: unknown): Pick<SocialPost, 'title' | 'angle' | 'slides' | 'caption' | 'hashtags'> {
  const r = (raw ?? {}) as Record<string, unknown>;
  const slides = (Array.isArray(r.slides) ? r.slides : []).slice(0, 4);
  if (slides.length < 4) throw new Error('The idea came back incomplete. Please try again.');
  const cleaned = slides.map((s, i) => cleanSlide(s, i === 0 ? 'cover' : i === 3 ? 'cta' : undefined));
  // Middle slides must have the content their layout needs
  for (const s of cleaned.slice(1, 3)) {
    if (s.layout === 'list' && s.items.length < 2) s.layout = s.points.length ? 'points' : 'statement';
    if (s.layout === 'points' && s.points.length < 2) s.layout = s.items.length >= 2 ? 'list' : 'statement';
    if (s.layout === 'cover' || s.layout === 'cta') s.layout = 'statement';
  }
  const caption = (typeof r.caption === 'string' ? r.caption : '').trim().slice(0, 2200);
  const hashtags = (Array.isArray(r.hashtags) ? r.hashtags : [])
    .map((h) => String(h).replace(/[^A-Za-z0-9_]/g, ''))
    .filter(Boolean)
    .slice(0, 15);
  if (!caption || !cleaned[0].headline) throw new Error('The idea came back incomplete. Please try again.');
  return { title: text(r.title, 80) || 'Untitled idea', angle: text(r.angle, 240), slides: cleaned, caption, hashtags };
}

// ---------------------------------------------------------------------------
// Generation and storage
// ---------------------------------------------------------------------------

let client: GoogleGenAI | null | undefined;
function getClient(): GoogleGenAI | null {
  if (client !== undefined) return client;
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  return client;
}
export const isSocialConfigured = () => Boolean(getClient());

// Least recently used angle first, so the week covers a spread of angles
function pickPillar(recent: SocialPostDoc[]) {
  const lastUsed = new Map<string, number>();
  recent.forEach((p, i) => {
    if (!lastUsed.has(p.pillar)) lastUsed.set(p.pillar, i);
  });
  const unused = PILLARS.filter((p) => !lastUsed.has(p.name));
  if (unused.length) return unused[Math.floor(Math.random() * unused.length)];
  return [...PILLARS].sort((a, b) => (lastUsed.get(b.name) ?? 0) - (lastUsed.get(a.name) ?? 0))[0];
}

export const toSocialPost = (d: SocialPostDoc): SocialPost => ({
  id: d._id,
  day: d.day,
  createdAt: d.createdAt.toISOString(),
  auto: d.auto,
  status: d.status,
  pillar: d.pillar,
  title: d.title,
  angle: d.angle,
  slides: d.slides,
  caption: d.caption,
  hashtags: d.hashtags
});

async function writePost(auto: boolean): Promise<SocialPostDoc> {
  const col = await collections.socialPosts();
  const recent = await col.find({}, { projection: { day: 1, pillar: 1, title: 1, slides: { $slice: 1 } } }).sort({ createdAt: -1 }).limit(30).toArray();
  return draftPost(recent as SocialPostDoc[], auto);
}

// Writes an idea without saving it; recent posts steer the angle and prevent repeats
export async function draftPost(recent: SocialPostDoc[], auto: boolean): Promise<SocialPostDoc> {
  const genai = getClient();
  if (!genai) throw new Error('GEMINI_API_KEY is not configured');
  const pillar = pickPillar(recent);
  const day = studioDay();

  const primary = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
  const fallback = process.env.GEMINI_FALLBACK_MODEL?.trim() || 'gemini-2.5-flash-lite';
  let lastError: unknown;
  for (const model of primary === fallback ? [primary] : [primary, fallback]) {
    try {
      const response = await genai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: instructions(pillar, recent, day) }] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: POST_SCHEMA,
          temperature: 1,
          maxOutputTokens: 3000,
          thinkingConfig: { thinkingBudget: model.includes('lite') ? 0 : 1024 }
        }
      });
      const post = cleanPost(JSON.parse(response.text ?? '{}'));
      return {
        _id: randomUUID(),
        day,
        createdAt: new Date(),
        auto,
        status: 'new',
        pillar: pillar.name,
        ...post
      };
    } catch (err) {
      lastError = err;
      console.warn(`Social post generation with ${model} failed: ${err instanceof Error ? err.message : err}`);
    }
  }
  throw lastError;
}

// Today's automatic idea: created on first request of the day (cron or dashboard), never twice
export async function ensureTodayPost(): Promise<SocialPost> {
  const col = await collections.socialPosts();
  const existing = await col.findOne({ day: studioDay(), auto: true });
  if (existing) return toSocialPost(existing);
  const doc = await writePost(true);
  try {
    await col.insertOne(doc);
    return toSocialPost(doc);
  } catch (err) {
    // Another request created today's idea first: return that one
    if ((err as { code?: number }).code === 11000) {
      const winner = await col.findOne({ day: doc.day, auto: true });
      if (winner) return toSocialPost(winner);
    }
    throw err;
  }
}

// An extra idea on demand from the dashboard
export async function createExtraPost(): Promise<SocialPost> {
  const doc = await writePost(false);
  await (await collections.socialPosts()).insertOne(doc);
  return toSocialPost(doc);
}

export async function listSocialPosts(): Promise<SocialPost[]> {
  const docs = await (await collections.socialPosts()).find({}).sort({ createdAt: -1 }).limit(60).toArray();
  return docs.map(toSocialPost);
}
