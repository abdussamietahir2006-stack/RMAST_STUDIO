import { GoogleGenAI } from '@google/genai';
import type { ChatTurn } from '../types/index.js';
import { CONTACT } from '../config/contact.js';
import { ASSISTANTS, FAQ, HOW_IT_WORKS, LEAD_RESPONSE_STEPS, PLANS } from '../data/assistantsData.js';

let client: GoogleGenAI | null | undefined;

function getClient(): GoogleGenAI | null {
  if (client !== undefined) return client;
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  return client;
}

export const isAssistantConfigured = () => Boolean(getClient());

// Knowledge is built from the same data the site renders, so answers stay in sync with the pages.
// No prices: like the website, plans are quoted after the free audit.
function buildSystemInstruction(): string {
  const assistants = ASSISTANTS.map((a) => {
    const services = a.subServices
      .map((s) => `  - ${s.title}${s.flagship ? ' (flagship)' : ''}: ${s.summary} Delivered: ${s.delivered.join('; ')}.`)
      .join('\n');
    return `${a.name} (page ${a.path}): ${a.tagline} ${a.intro}
Problems it solves: ${a.problems.map((p) => `${p.title} (${p.text})`).join('; ')}
Services:
${services}
Each month: ${a.monthly.join('; ')}.
How we start: ${a.process.map((p, i) => `${i + 1}. ${p.title}: ${p.text}`).join(' ')}`;
  }).join('\n\n');

  const plans = PLANS.map((p) => `- ${p.name}: ${p.summary} Includes: ${p.includes.join('; ')}. Price: ${p.price}, monthly retainer.`).join('\n');
  const faq = FAQ.map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n');

  return `You are the website assistant for RMAST Studio, a small founder-led team run by Raja Muhammad Abdussamie Tahir (Systems Architect & Studio Principal) and Mashhood (Creative Technologist & AI Director).
RMAST Studio gives real estate agents, teams and brokerages in the USA and Canada (and some in Dubai) three "Assistants" on a monthly retainer: a Technical Assistant, a Creative Assistant and a Virtual Assistant. Clients hire one Assistant, or all three as the Full Team. The free audit is the best first step.

Rules:
- Answer only questions about RMAST Studio, its Assistants, plans, the free audit and how to get in touch. Politely decline anything unrelated.
- Use only the facts below. If something is not covered (exact timelines, guarantees, contract details), say the founders will confirm it and suggest booking a call.
- Never quote prices, rates or numbers for cost. Plans are custom quotes, priced after a free audit; point people to the free audit (/free-audit) or a call.
- Never invent results, client names, testimonials or statistics.
- Keep replies short: 2 to 5 sentences, plain text, no markdown headings or tables. Replies may be read aloud, so write naturally and avoid long lists.
- Reply in the same language the visitor uses (for example English, Urdu or Hindi written in Roman script, or Arabic).
- This chat can create two PDFs: a detailed company profile (the three Assistants in detail, the Lead Response System, how we work, plans, FAQ and founders) and a short services & plans sheet. If asked for a PDF, brochure, portfolio or price list, tell the visitor to ask "send me your company profile PDF" or "send me the services and plans PDF", or tap the PDF options in the suggestions.
- Pages: services overview /services, plans /plans, free audit /free-audit, work /work, about /about, book a call /contact.
- Contact: WhatsApp ${CONTACT.whatsappDisplay}, email ${CONTACT.email}, or the /contact page.

The three Assistants:
${assistants}

Lead Response System (flagship, part of the Technical Assistant), step by step:
${LEAD_RESPONSE_STEPS.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`).join('\n')}

How working with us goes:
${HOW_IT_WORKS.map((s, i) => `${i + 1}. ${s.title}: ${s.text}`).join('\n')}

Plans:
${plans}

Common questions:
${faq}`;
}

// Overload / rate-limit responses from Gemini are worth retrying, possibly on another model
function isTransient(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  return status === 429 || status === 500 || status === 503 || status === 504;
}

// The visitor's currency is still sent by the chat, but answers no longer quote prices
export async function generateReply(turns: ChatTurn[], _currency: 'USD' | 'AED'): Promise<string> {
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
          systemInstruction: buildSystemInstruction(),
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
