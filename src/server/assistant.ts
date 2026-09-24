import { GoogleGenAI } from '@google/genai';
import type { ChatTurn } from '../types/index.js';
import { CONTACT } from '../config/contact.js';
import { servicesData } from '../data/servicesData.js';
import {
  realEstatePackages,
  aiContentPackages,
  completeBusinessPackages,
  aiVideoSinglePricing,
  videoMonthlyBundles,
  USD_TO_AED_RATE,
  formatHourlyRate
} from '../data/pricingData.js';

let client: GoogleGenAI | null | undefined;

function getClient(): GoogleGenAI | null {
  if (client !== undefined) return client;
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  return client;
}

export const isAssistantConfigured = () => Boolean(getClient());

// Knowledge is built from the same data the site renders, so answers stay in sync with the pages
function buildSystemInstruction(currency: 'USD' | 'AED'): string {
  const money = (usd: number) =>
    currency === 'USD'
      ? `$${usd.toLocaleString('en-US')}`
      : `AED ${Math.round(usd * USD_TO_AED_RATE).toLocaleString('en-US')}`;

  const services = servicesData
    .map((s) => {
      const route = s.division === 'real-estate' ? `/services/${s.slug}` : `/ai-content/${s.slug}`;
      const tiers = s.tiers?.length ? `; tiers: ${s.tiers.map((t) => `${t.name} ${money(t.priceUSD)}`).join(', ')}` : '';
      const hourly = s.hourlyRateUSD ? `; hourly rate ${formatHourlyRate(s.hourlyRateUSD, currency)}` : '';
      const notes = s.scopeNotes ? ` Pricing note: ${s.scopeNotes}` : '';
      return `- ${s.title} (${s.division}, from ${money(s.startingPriceUSD)} ${s.billingType}${tiers}${hourly}, page ${route}): ${s.summary}${notes}`;
    })
    .join('\n');

  const packages = [...realEstatePackages, ...aiContentPackages, ...completeBusinessPackages]
    .map((p) => `- ${p.title} [${p.division}, ${p.tier}] ${money(p.priceUSD)} ${p.billingFrequency}: ${p.included.join('; ')}`)
    .join('\n');

  const videos = aiVideoSinglePricing.map((v) => `${v.tier} ${money(v.priceUSD)}`).join(', ');
  const bundles = videoMonthlyBundles
    .map(
      (b) =>
        `${b.quantity} videos/month: Starter ${money(b.starter.usd)}, Standard ${money(b.standard.usd)}, Professional ${money(b.professional.usd)}`
    )
    .join('\n');

  return `You are the website assistant for RMAST Studio, a small founder-led studio run by Raja Muhammad Abdussamie Tahir (Systems Architect & Studio Principal) and Mashhood (Creative Technologist & AI Director).
The studio has two divisions: (1) digital systems for real estate brokerages in the USA, UAE and Canada (websites, custom software, CRM, AI automation, chatbots, social media, virtual assistance, admin operations) and (2) cinematic AI video content for brands worldwide (real estate, fashion, food, products, advertising, social content).

Rules:
- Answer only questions about RMAST Studio, its services, pricing, process and how to get in touch. Politely decline anything unrelated.
- Use only the facts below. If something is not covered (exact timelines, custom quotes, guarantees), say the founders will confirm it and suggest contacting them.
- Quote prices in ${currency}. All prices are starting prices; final scope depends on requirements.
- Every service also has an hourly rate (listed below) for work billed by the hour, such as changes, extra features and ongoing support.
- Keep replies short: 2 to 5 sentences, plain text, no markdown headings or tables. Replies may be read aloud, so write naturally and avoid long lists.
- Reply in the same language the visitor uses (for example English, Urdu or Hindi written in Roman script, or Arabic).
- This chat can create PDFs: a full company profile & portfolio (everything RMAST does, services, portfolio, process, founders), and price lists (all services, Real Estate only, or Brands & Content only). If asked for a PDF, brochure, portfolio or price list, tell the visitor to ask "send me your company profile PDF" or "send me the price list PDF", or tap the PDF options in the suggestions.
- Contact: WhatsApp ${CONTACT.whatsappDisplay}, email ${CONTACT.email}, or the /contact page.

Services:
${services}

Packages:
${packages}

Individual AI videos: ${videos}.
Monthly video bundles:
${bundles}`;
}

// Overload / rate-limit responses from Gemini are worth retrying, possibly on another model
function isTransient(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  return status === 429 || status === 500 || status === 503 || status === 504;
}

export async function generateReply(turns: ChatTurn[], currency: 'USD' | 'AED'): Promise<string> {
  const genai = getClient();
  if (!genai) throw new Error('Assistant is not configured');

  const primary = process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
  // Alias Google keeps pointed at its current lite model (older fixed names get retired)
  const fallback = process.env.GEMINI_FALLBACK_MODEL?.trim() || 'gemini-flash-lite-latest';
  // Primary model gets one retry before falling back
  const attempts = [primary, primary];
  if (fallback !== primary) attempts.push(fallback);
  let lastError: unknown;

  for (const [i, model] of attempts.entries()) {
    if (i > 0) await new Promise((r) => setTimeout(r, 600));
    try {
      const response = await genai.models.generateContent({
        model,
        contents: turns.map((t) => ({
          role: t.role === 'user' ? 'user' : 'model',
          parts: [{ text: t.text }]
        })),
        config: {
          systemInstruction: buildSystemInstruction(currency),
          maxOutputTokens: 600,
          temperature: 0.4,
          // thinkingBudget is a Gemini 2.5 setting; newer models reject it
          ...(model.startsWith('gemini-2.5') ? { thinkingConfig: { thinkingBudget: 0 } } : {})
        }
      });
      const reply = response.text?.trim();
      if (reply) return reply;
      lastError = new Error(`Empty response from ${model}`);
    } catch (err) {
      lastError = err;
      if (!isTransient(err)) break;
      console.warn(`Gemini ${model} unavailable (attempt ${i + 1}/${attempts.length})`);
    }
  }
  throw lastError;
}

export function parseTurns(raw: unknown): ChatTurn[] | null {
  const list: unknown[] = Array.isArray(raw) ? raw : [];
  const turns: ChatTurn[] = list
    .map((m) => m as Partial<ChatTurn>)
    .filter((m): m is ChatTurn => (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string')
    .slice(-12)
    .map((m) => ({ role: m.role, text: m.text.slice(0, 2000) }));
  // Gemini expects the conversation to start and end with a user turn
  while (turns.length && turns[0].role !== 'user') turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== 'user') return null;
  return turns;
}
