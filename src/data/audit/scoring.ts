// Free Audit scoring and copy. Rule-based and deterministic: the same answers always give the same audit.
// Used by the website (to draw the audit) and by the server (which recalculates it, so scores can't be faked).
//
// HOW TO EDIT
// - POINTS: points (0-10) for each answer. Higher = healthier.
// - AREAS: how each area's score is worked out, and its copy. In copy, **text** is shown in bold.
//   Copy must only repeat what the visitor answered: never add facts they didn't give.
// - Pillar score = average of its 3 areas. Overall score = average of all 9 areas x 10.
// - The pillar with the LOWEST score becomes the main Assistant, and the audit image shows its 3 areas.
import type { AssistantId } from '../assistantsData.js';
import type { AuditAnswers } from './questions.js';

// ---------------------------------------------------------------------------
// Points for every option (0 = biggest problem, 10 = nothing to fix)
// ---------------------------------------------------------------------------

export const POINTS: Record<string, Record<string, number>> = {
  postFreq: { Daily: 10, '3–5x a week': 9, '1–2x a week': 6, 'A few times a month': 3, 'Rarely / not in months': 0 },
  creator: { 'A freelancer/agency': 9, 'Someone on my team': 8, 'Me, alone': 5, 'Templates/auto-posting': 3, 'Nobody right now': 0 },
  reels: { '0': 0, '1–2': 3, '3–5': 6, '6–10': 8, '10+': 10 },
  face: { Regularly: 10, Sometimes: 6, Never: 2 },
  likes: { 'Under 10': 1, '10–30': 3, '30–100': 6, '100–300': 8, '300+': 10 },
  siteStatus: { 'Custom & up to date': 10, 'Template, mostly fine': 7, 'Outdated / has broken parts': 3, 'Only a portal profile': 2, 'No website': 0 },
  siteMobile: { Yes: 10, 'Not sure': 5, No: 1 },
  siteListings: { 'Live IDX feed': 10, 'Updated manually': 6, 'No listings': 3 },
  siteContact: { 'Form + instant auto-reply': 10, 'Form only': 6, 'Phone/email only': 3, 'No way to contact': 0 },
  siteChat: { Yes: 10, No: 3 },
  replyTime: { 'Under 5 minutes': 10, 'Within 1 hour': 7, 'Same day': 4, 'Next day': 2, 'Often miss them': 0 },
  afterHours: { 'Auto-reply instantly': 10, 'I reply when I can': 5, 'They wait until next day': 1 },
  followSystem: { None: 0, 'Memory / notes': 2, Spreadsheet: 4, 'CRM, manual follow-up': 6, 'CRM with automated follow-up': 10 },
  followUps: { Once: 2, '2–3 times': 5, '4–6 times': 8, 'Until they reply/unsubscribe': 10, "I don't": 0 },
  adminHours: { 'Under 5': 10, '5–10': 7, '10–20': 4, '20+': 1 },
  scheduling: { 'Automated booking link': 10, 'Someone schedules for me': 8, 'Back-and-forth texts/calls': 3 },
  nurture: { 'Monthly newsletter/touches': 10, Occasionally: 5, Never: 0 },
  reviews: { Always: 10, Sometimes: 5, Never: 0 }
};

// Content variety: kinds of posts beyond listings and reposts (0, 1, 2, 3+ kinds)
const MIX_POINTS = [2, 5, 8, 10];

const pts = (question: keyof typeof POINTS, a: AuditAnswers) => POINTS[question][String(a[question as keyof AuditAnswers])] ?? 0;
const clamp10 = (n: number) => Math.max(0, Math.min(10, Math.round(n)));

// ---------------------------------------------------------------------------
// Wording helpers (turn an answer into words that fit a sentence)
// ---------------------------------------------------------------------------

const b = (s: string) => `**${s}**`;
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

const POST_FREQ_WORDS: Record<string, string> = {
  Daily: 'daily',
  '3–5x a week': '3–5 times a week',
  '1–2x a week': '1–2 times a week',
  'A few times a month': 'a few times a month',
  'Rarely / not in months': 'rarely'
};
const CREATOR_WORDS: Record<string, string> = {
  'Me, alone': 'you, alone',
  'Someone on my team': 'someone on your team',
  'A freelancer/agency': 'a freelancer or agency',
  'Templates/auto-posting': 'templates and auto-posting',
  'Nobody right now': 'nobody right now'
};
const REPLY_WORDS: Record<string, string> = {
  'Under 5 minutes': 'in under 5 minutes',
  'Within 1 hour': 'within an hour',
  'Same day': 'the same day',
  'Next day': 'the next day',
  'Often miss them': 'often not at all'
};
const AFTER_HOURS_WORDS: Record<string, string> = {
  'Auto-reply instantly': 'get an instant auto-reply',
  'I reply when I can': 'get a reply when you can',
  'They wait until next day': 'wait until the next day'
};
const SCHEDULING_WORDS: Record<string, string> = {
  'Automated booking link': 'an automated booking link',
  'Back-and-forth texts/calls': 'back-and-forth texts and calls',
  'Someone schedules for me': 'someone who schedules for you'
};
const SITE_WORDS: Record<string, string> = {
  'Custom & up to date': 'custom and up to date',
  'Template, mostly fine': 'a template that mostly works',
  'Outdated / has broken parts': 'outdated, with broken parts',
  'Only a portal profile': 'only a portal profile',
  'No website': 'missing'
};
const LISTING_WORDS: Record<string, string> = {
  'Live IDX feed': 'live IDX listings',
  'Updated manually': 'listings you update by hand',
  'No listings': 'no listings'
};
const CONTACT_WORDS: Record<string, string> = {
  'Form + instant auto-reply': 'a form with an instant reply',
  'Form only': 'a form with no instant reply',
  'Phone/email only': 'phone or email only',
  'No way to contact': 'nothing on the site'
};
const NURTURE_WORDS: Record<string, string> = {
  'Monthly newsletter/touches': 'every month',
  Occasionally: 'occasionally',
  Never: 'never'
};

function followSystemWords(a: AuditAnswers): string {
  const crm = a.crm && a.crm !== 'None' && a.crm !== 'Other' ? a.crm : 'a CRM';
  switch (a.followSystem) {
    case 'None':
      return 'no system';
    case 'Memory / notes':
      return 'memory and notes';
    case 'Spreadsheet':
      return 'a spreadsheet';
    case 'CRM, manual follow-up':
      return `${crm}, following up by hand`;
    default:
      return `${crm} with automated follow-ups`;
  }
}

function followUpsWords(a: AuditAnswers): string {
  if (a.followUps === "I don't") return `${b("don't")} follow up leads that go quiet`;
  if (a.followUps === 'Until they reply/unsubscribe') return `follow up quiet leads ${b('until they reply')}`;
  return `follow up quiet leads ${b(a.followUps === 'Once' ? 'once' : a.followUps)}`;
}

const nonListingKinds = (a: AuditAnswers) => a.postTypes.filter((t) => t !== 'Listings' && t !== 'Reposts / news').length;

// ---------------------------------------------------------------------------
// The 9 areas (3 per Assistant)
// ---------------------------------------------------------------------------

export interface AreaDef {
  id: string;
  pillar: AssistantId;
  title: string;
  score: (a: AuditAnswers) => number;
  // Short upper-case line for the audit headline
  headline: (a: AuditAnswers) => string;
  // Clause for the one-sentence summary ("Your biggest gap is ...: <gap>.")
  gap: (a: AuditAnswers) => string;
  problem: (a: AuditAnswers, strong: boolean) => string;
  costs: (a: AuditAnswers, score: number) => string;
  fix: (a: AuditAnswers, strong: boolean) => string;
  // "We can also help with" line when this is the weakest area of another Assistant
  also: (a: AuditAnswers) => string;
}

const STRONG = 8; // an area scoring 8+ is shown as a strength
const NOTHING_MAJOR = 'Nothing major here. The goal is to keep it this way as you get busier.';

export const AREAS: AreaDef[] = [
  // --- Creative Assistant: social media & content ---
  {
    id: 'posting',
    pillar: 'creative',
    title: 'Posting',
    score: (a) => clamp10(0.7 * pts('postFreq', a) + 0.3 * pts('creator', a)),
    headline: (a) =>
      ({ 'Rarely / not in months': 'NO POSTS IN MONTHS.', 'A few times a month': 'POSTS ARE RARE.', '1–2x a week': '1–2 POSTS A WEEK.' })[
        a.postFreq
      ] ?? 'POSTING IS STEADY.',
    gap: (a) => `you post ${b(POST_FREQ_WORDS[a.postFreq])}`,
    problem: (a, strong) =>
      strong
        ? `You post ${b(POST_FREQ_WORDS[a.postFreq])} and the content is made by ${b(CREATOR_WORDS[a.creator])}.`
        : `You post ${b(POST_FREQ_WORDS[a.postFreq])}, and your content is made by ${b(CREATOR_WORDS[a.creator])}.`,
    costs: (_a, s) =>
      s >= STRONG
        ? NOTHING_MAJOR
        : s >= 5
        ? 'Gaps between posts make you easy to forget between deals.'
        : 'When you go quiet, people forget you and call the agent they saw last week.',
    fix: (_a, strong) =>
      strong
        ? 'We step in when you’re busy, so posting never stops.'
        : 'We plan a month of posts, make them and post them on schedule, so you show up every week.',
    also: (a) => `you post ${b(POST_FREQ_WORDS[a.postFreq])}. We plan and post for you every week.`
  },
  {
    id: 'reels',
    pillar: 'creative',
    title: 'Reels & video',
    score: (a) => clamp10(0.7 * pts('reels', a) + 0.3 * pts('face', a)),
    headline: (a) =>
      a.reels === '0' ? '0 REELS A MONTH.' : a.reels === '1–2' ? '1–2 REELS A MONTH.' : a.face === 'Never' ? 'NO FACE ON CAMERA.' : 'REELS ARE WORKING.',
    gap: (a) => `you make ${b(`${a.reels} reels`)} a month`,
    problem: (a) => {
      const face =
        a.face === 'Never' ? `${b('never')} show your face on camera` : `show your face ${b(lower(a.face))}`;
      return `You make ${b(`${a.reels} reels`)} a month and ${face}.`;
    },
    costs: (_a, s) =>
      s >= STRONG
        ? NOTHING_MAJOR
        : s >= 5
        ? 'A few more short videos a month would put you in front of more people who don’t know you yet.'
        : 'Short videos are what reach new people on Instagram and TikTok. Photos mostly reach people who already follow you.',
    fix: (_a, strong) =>
      strong
        ? 'We edit and post your videos, so they keep coming without taking your time.'
        : 'We give you reel ideas you can film in minutes, edit them, and make listing videos from your photos.',
    also: (a) => `you make ${b(`${a.reels} reels`)} a month. We script and edit them for you.`
  },
  {
    id: 'reach',
    pillar: 'creative',
    title: 'Reach',
    score: (a) => clamp10(0.7 * pts('likes', a) + 0.3 * MIX_POINTS[Math.min(3, nonListingKinds(a))]),
    headline: (a) =>
      ({ 'Under 10': 'UNDER 10 LIKES A POST.', '10–30': '10–30 LIKES A POST.' })[a.likes] ?? 'REACH IS GROWING.',
    gap: (a) => `posts average ${b(`${lower(a.likes)} likes`)}`,
    problem: (a) => {
      const mostly =
        a.postTypes.length && nonListingKinds(a) <= 1 ? `, and you mostly post ${b(a.postTypes.map(lower).join(', '))}` : '';
      return `Your posts average ${b(`${lower(a.likes)} likes`)}${mostly}.`;
    },
    costs: (_a, s) =>
      s >= STRONG
        ? NOTHING_MAJOR
        : 'Posts that get few likes are shown to fewer people, so each one does less for you.',
    fix: (_a, strong) =>
      strong
        ? 'We add clear calls to action, so your reach turns into enquiries.'
        : 'We mix in market updates, tips and behind-the-scenes posts that people stop for.',
    also: (a) => `your posts average ${b(`${lower(a.likes)} likes`)}. We make content people stop for.`
  },

  // --- Technical Assistant: website & lead capture ---
  {
    id: 'website',
    pillar: 'technical',
    title: 'Website',
    score: (a) =>
      a.siteStatus === 'No website'
        ? 0
        : clamp10(0.6 * pts('siteStatus', a) + 0.25 * pts('siteMobile', a) + 0.15 * pts('siteListings', a)),
    headline: (a) =>
      a.siteStatus === 'No website'
        ? 'NO WEBSITE.'
        : a.siteStatus === 'Only a portal profile'
        ? 'NO WEBSITE OF YOUR OWN.'
        : a.siteStatus === 'Outdated / has broken parts'
        ? 'WEBSITE IS OUTDATED.'
        : a.siteMobile === 'No'
        ? 'SITE FAILS ON MOBILE.'
        : 'WEBSITE IS OK.',
    gap: (a) =>
      a.siteStatus === 'No website' ? `you have ${b('no website')}` : `your website is ${b(SITE_WORDS[a.siteStatus])}`,
    problem: (a) => {
      if (a.siteStatus === 'No website') return `You have ${b('no website')} of your own.`;
      if (a.siteStatus === 'Only a portal profile') return `Your only web page is ${b('a portal profile')}.`;
      const mobile = { Yes: 'loads well', 'Not sure': 'may not load well', No: 'doesn’t load well' }[a.siteMobile] ?? '';
      return `Your website is ${b(SITE_WORDS[a.siteStatus])}, ${b(mobile)} on mobile, and has ${b(LISTING_WORDS[a.siteListings])}.`;
    },
    costs: (_a, s) =>
      s >= STRONG
        ? NOTHING_MAJOR
        : s >= 5
        ? 'Visitors may leave before they get in touch, especially on their phones.'
        : 'People who look you up before calling find little that builds trust, so many move on.',
    fix: (_a, strong) =>
      strong
        ? 'We keep it updated and add pages when you need them.'
        : 'We build or fix your site so it loads fast on phones and shows your listings.',
    also: (a) =>
      a.siteStatus === 'No website'
        ? `you have ${b('no website')}. We build one that brings in enquiries.`
        : `your website is ${b(SITE_WORDS[a.siteStatus])}. We fix it so it brings in enquiries.`
  },
  {
    id: 'capture',
    pillar: 'technical',
    title: 'Lead capture',
    score: (a) => (a.siteStatus === 'No website' ? 0 : clamp10(0.75 * pts('siteContact', a) + 0.25 * pts('siteChat', a))),
    headline: (a) =>
      a.siteStatus === 'No website' || a.siteContact === 'No way to contact'
        ? 'NO WAY TO CONTACT YOU.'
        : a.siteContact === 'Phone/email only'
        ? 'NO FORM ON YOUR SITE.'
        : a.siteContact === 'Form only'
        ? 'NO INSTANT REPLY.'
        : 'LEAD CAPTURE IS SET.',
    gap: (a) =>
      a.siteStatus === 'No website' ? `there is ${b('no form or chat')} to catch enquiries` : `leads reach you through ${b(CONTACT_WORDS[a.siteContact])}`,
    problem: (a) =>
      a.siteStatus === 'No website'
        ? `With ${b('no website')}, there’s no form or chat to catch enquiries.`
        : `Leads reach you through ${b(CONTACT_WORDS[a.siteContact])}, with ${b(a.siteChat === 'Yes' ? 'chat on the site' : 'no WhatsApp or chat')} on the site.`,
    costs: (_a, s) =>
      s >= STRONG ? NOTHING_MAJOR : 'Visitors who are ready to talk can leave without getting in touch, and you never know they were there.',
    fix: (_a, strong) =>
      strong
        ? 'We connect it to your CRM, so every enquiry is tracked.'
        : 'We add a form with an instant reply and WhatsApp chat that sends every enquiry to you.',
    also: (a) =>
      a.siteStatus === 'No website'
        ? `there’s ${b('no form or chat')} to catch enquiries. We add both.`
        : `leads reach you through ${b(CONTACT_WORDS[a.siteContact])}. We add forms with instant replies.`
  },
  {
    id: 'speed',
    pillar: 'technical',
    title: 'Speed to lead',
    score: (a) => clamp10(0.7 * pts('replyTime', a) + 0.3 * pts('afterHours', a)),
    headline: (a) =>
      ({
        'Often miss them': 'LEADS GET MISSED.',
        'Next day': 'LEADS WAIT UNTIL TOMORROW.',
        'Same day': 'LEADS WAIT HOURS.'
      })[a.replyTime] ??
      (a.afterHours === 'They wait until next day' ? 'NIGHT LEADS WAIT A DAY.' : a.replyTime === 'Within 1 hour' ? 'LEADS WAIT UP TO AN HOUR.' : 'FAST REPLIES.'),
    gap: (a) =>
      a.replyTime === 'Often miss them' ? `new leads are ${b('often missed')}` : `new leads get a reply ${b(REPLY_WORDS[a.replyTime])}`,
    problem: (a) => {
      const reply =
        a.replyTime === 'Often miss them'
          ? `You ${b('often miss')} new leads`
          : `You reply to new leads ${b(REPLY_WORDS[a.replyTime])}`;
      return `${reply}, and after-hours leads ${b(AFTER_HOURS_WORDS[a.afterHours])}.`;
    },
    costs: (_a, s) =>
      s >= STRONG
        ? NOTHING_MAJOR
        : 'Many buyers message more than one agent. The first one to reply usually gets the conversation.',
    fix: (_a, strong) =>
      strong
        ? 'We automate it, so replies stay fast even on your busiest days.'
        : 'Our Lead Response System replies within 60 seconds, day or night, and books the call for you.',
    also: (a) =>
      a.replyTime === 'Often miss them'
        ? `new leads are ${b('often missed')}. We reply to every one within 60 seconds.`
        : `you reply ${b(REPLY_WORDS[a.replyTime])}. We reply to every lead within 60 seconds.`
  },

  // --- Virtual Assistant: follow-up, admin & sales systems ---
  {
    id: 'followup',
    pillar: 'virtual',
    title: 'Follow-up',
    score: (a) => clamp10(0.6 * pts('followSystem', a) + 0.4 * pts('followUps', a)),
    headline: (a) =>
      a.followSystem === 'None' || a.followSystem === 'Memory / notes'
        ? 'NO FOLLOW-UP SYSTEM.'
        : a.followUps === "I don't"
        ? 'QUIET LEADS ARE DROPPED.'
        : a.followUps === 'Once'
        ? 'ONLY ONE FOLLOW-UP.'
        : a.followSystem === 'Spreadsheet'
        ? 'FOLLOW-UP BY SPREADSHEET.'
        : 'FOLLOW-UP IS SET.',
    gap: (a) => `you track leads with ${b(followSystemWords(a))}`,
    problem: (a) => `You track leads with ${b(followSystemWords(a))} and ${followUpsWords(a)}.`,
    costs: (_a, s) =>
      s >= STRONG
        ? NOTHING_MAJOR
        : 'Many deals come from leads who weren’t ready the first time. Without steady follow-up, they buy with someone else later.',
    fix: (_a, strong) =>
      strong
        ? 'We handle the replies, so you only talk to people who are ready.'
        : 'Your Virtual Assistant follows up every lead by text and email, in your voice, until they reply.',
    also: (a) => `you track leads with ${b(followSystemWords(a))}. We follow up every lead for you.`
  },
  {
    id: 'admin',
    pillar: 'virtual',
    title: 'Admin time',
    score: (a) => clamp10(0.7 * pts('adminHours', a) + 0.3 * pts('scheduling', a)),
    headline: (a) =>
      a.adminHours === '20+'
        ? '20+ HRS A WEEK ON ADMIN.'
        : a.adminHours === '10–20'
        ? '10–20 HRS A WEEK ON ADMIN.'
        : a.scheduling === 'Back-and-forth texts/calls'
        ? 'SHOWINGS BOOKED BY TEXT.'
        : 'ADMIN IS UNDER CONTROL.',
    gap: (a) => `you spend ${b(`${a.adminHours} hours`)} a week on admin`,
    problem: (a) =>
      `You spend ${b(`${lower(a.adminHours)} hours`)} a week on admin and book showings through ${b(SCHEDULING_WORDS[a.scheduling])}.`,
    costs: (a, s) =>
      s >= STRONG
        ? NOTHING_MAJOR
        : a.adminHours === '20+'
        ? 'That’s half a working week away from listings and clients, the work that actually pays.'
        : 'That’s time you could spend with clients and on listings, the work that actually pays.',
    fix: (_a, strong) =>
      strong
        ? 'We take over new admin as you grow, so it stays this way.'
        : 'Your Virtual Assistant handles paperwork, data entry and showing scheduling every day.',
    also: (a) => `you spend ${b(`${lower(a.adminHours)} hours`)} a week on admin. We take it off your plate.`
  },
  {
    id: 'database',
    pillar: 'virtual',
    title: 'Past clients & reviews',
    score: (a) => clamp10(0.5 * pts('nurture', a) + 0.5 * pts('reviews', a)),
    headline: (a) =>
      a.nurture === 'Never' ? 'PAST CLIENTS FORGOTTEN.' : a.reviews === 'Never' ? 'NO REVIEWS COLLECTED.' : 'DATABASE IS WARM.',
    gap: (a) => (a.nurture === 'Never' ? `past clients ${b('never')} hear from you` : `you contact past clients ${b(NURTURE_WORDS[a.nurture])}`),
    problem: (a) => {
      const contact =
        a.nurture === 'Never' ? `You ${b('never')} contact past clients` : `You contact past clients ${b(NURTURE_WORDS[a.nurture])}`;
      return `${contact} and ${b(lower(a.reviews))} ask for a review after closing.`;
    },
    costs: (_a, s) =>
      s >= STRONG
        ? NOTHING_MAJOR
        : 'Past clients and their friends are an easy source of new deals. Without contact, they forget your name.',
    fix: (_a, strong) =>
      strong
        ? 'We keep the check-ins and review requests going when you’re busy.'
        : 'We send regular check-ins to past clients and ask every buyer and seller for a review.',
    also: (a) => `you contact past clients ${b(NURTURE_WORDS[a.nurture])}. We keep in touch for you.`
  }
];

// ---------------------------------------------------------------------------
// Pillars (one per Assistant) and the finished audit
// ---------------------------------------------------------------------------

export const PILLARS: Record<AssistantId, { name: string; focus: string }> = {
  creative: { name: 'Creative Assistant', focus: 'social media & content' },
  technical: { name: 'Technical Assistant', focus: 'website & lead capture' },
  virtual: { name: 'Virtual Assistant', focus: 'follow-up, admin & sales systems' }
};

// When two pillars tie for lowest, the visitor's biggest challenge decides, then this order
const CHALLENGE_PILLAR: Record<string, AssistantId> = {
  'Not enough leads': 'technical',
  "Website doesn't bring business": 'technical',
  'No time for content': 'creative',
  "Leads don't convert": 'virtual',
  'Too much admin': 'virtual',
  'Hiring / managing team': 'virtual'
};
const PILLAR_ORDER: AssistantId[] = ['technical', 'creative', 'virtual'];

export const CTA = 'Book a free 15-min call and we’ll walk you through the fixes.';

export interface AuditCard {
  id: string;
  title: string;
  score: number;
  problem: string;
  costs: string;
  fix: string;
}

export interface AuditResult {
  overall: number; // 0-100
  pillars: Record<AssistantId, number>; // 0-10, one decimal
  areas: { id: string; pillar: AssistantId; title: string; score: number }[];
  main: AssistantId;
  headline: [string, string];
  summary: string;
  cards: AuditCard[]; // the main Assistant's 3 areas
  also: { assistant: AssistantId; text: string }[]; // the other 2 Assistants
  cta: string;
}

export function computeAudit(a: AuditAnswers): AuditResult {
  const scored = AREAS.map((def) => ({ def, score: def.score(a) }));
  const pillarScore = (p: AssistantId) => {
    const list = scored.filter((s) => s.def.pillar === p);
    return Math.round((list.reduce((sum, s) => sum + s.score, 0) / list.length) * 10) / 10;
  };
  const pillars = { technical: pillarScore('technical'), creative: pillarScore('creative'), virtual: pillarScore('virtual') };

  const lowest = Math.min(...Object.values(pillars));
  const tied = PILLAR_ORDER.filter((p) => pillars[p] === lowest);
  const preferred = CHALLENGE_PILLAR[a.challenge];
  const main = tied.includes(preferred) ? preferred : tied[0];

  const overall = Math.round((scored.reduce((sum, s) => sum + s.score, 0) / scored.length) * 10);

  // Headline: the main Assistant's weakest area, then the next-weakest area anywhere
  const byScore = [...scored].sort(
    (x, y) => x.score - y.score || Number(y.def.pillar === main) - Number(x.def.pillar === main)
  );
  const first = byScore.find((s) => s.def.pillar === main)!;
  const second = byScore.find((s) => s !== first && s.def.headline(a) !== first.def.headline(a)) ?? byScore[1];

  const name = PILLARS[main].name;
  const summary = `Your biggest gap is ${PILLARS[main].focus}: ${first.def.gap(a)}. This is a ${name} fix.`;

  const cards: AuditCard[] = scored
    .filter((s) => s.def.pillar === main)
    .map(({ def, score }) => {
      const strong = score >= STRONG;
      return { id: def.id, title: def.title, score, problem: def.problem(a, strong), costs: def.costs(a, score), fix: def.fix(a, strong) };
    });

  const also = PILLAR_ORDER.filter((p) => p !== main).map((p) => {
    const weakest = scored.filter((s) => s.def.pillar === p).sort((x, y) => x.score - y.score)[0];
    // Nothing weak in that pillar: say so instead of offering to fix something that works
    const text =
      weakest.score >= STRONG
        ? `your ${PILLARS[p].focus} ${b('look healthy')}. We can keep them that way as you get busier.`
        : weakest.def.also(a);
    return { assistant: p, text };
  });

  return {
    overall,
    pillars,
    areas: scored.map(({ def, score }) => ({ id: def.id, pillar: def.pillar, title: def.title, score })),
    main,
    headline: [first.def.headline(a), second.def.headline(a)],
    summary,
    cards,
    also,
    cta: CTA
  };
}

// Score colours: red under 40, amber 40-69, green 70+ (score is 0-100)
export type ScoreBand = 'low' | 'mid' | 'high';
export const scoreBand = (score100: number): ScoreBand => (score100 < 40 ? 'low' : score100 < 70 ? 'mid' : 'high');

// Splits "**bold**" markers into parts for display; plain() removes them
export function richParts(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) => (part.startsWith('**') ? { text: part.slice(2, -2), bold: true } : { text: part, bold: false }));
}
export const plain = (text: string) => text.replace(/\*\*/g, '');
