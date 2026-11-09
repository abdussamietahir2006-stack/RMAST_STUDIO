// Free Audit form: every question, its options and which step it belongs to.
// Shared by the website (the form), the server (validation) and the dashboard / emails (answer lists).
// To change a question's wording or options, edit it here. If you rename an option, also update its
// points in scoring.ts (points are looked up by the option text).

export const ROLES = ['Owner / Broker', 'Team lead', 'Agent', 'Marketing manager', 'Other'] as const;
export const COUNTRIES = ['United States', 'Canada', 'UAE', 'Other'] as const;
export const BUSINESS_TYPES = ['Solo agent', 'Small team (2–5)', 'Brokerage (6–20 agents)', 'Brokerage (20+ agents)'] as const;
export const YEARS = ['Under 1', '1–3', '3–5', '5–10', '10+'] as const;
export const PORTALS = ['Zillow', 'Realtor.com', 'Property Finder', 'Bayut', 'MLS/IDX', 'None'] as const;

export const POST_FREQ = ['Daily', '3–5x a week', '1–2x a week', 'A few times a month', 'Rarely / not in months'] as const;
export const REELS = ['0', '1–2', '3–5', '6–10', '10+'] as const;
export const LIKES = ['Under 10', '10–30', '30–100', '100–300', '300+'] as const;
export const CREATORS = ['Me, alone', 'Someone on my team', 'A freelancer/agency', 'Templates/auto-posting', 'Nobody right now'] as const;
export const POST_TYPES = [
  'Listings',
  'Just sold / closings',
  'Market updates',
  'Personal / behind the scenes',
  'Tips & education',
  'Team spotlights',
  'Reposts / news'
] as const;
export const FACE = ['Regularly', 'Sometimes', 'Never'] as const;

export const SITE_STATUS = [
  'Custom & up to date',
  'Template, mostly fine',
  'Outdated / has broken parts',
  'Only a portal profile',
  'No website'
] as const;
export const SITE_LISTINGS = ['Live IDX feed', 'Updated manually', 'No listings'] as const;
export const SITE_CONTACT = ['Form + instant auto-reply', 'Form only', 'Phone/email only', 'No way to contact'] as const;
export const YES_NO = ['Yes', 'No'] as const;
export const SITE_MOBILE = ['Yes', 'Not sure', 'No'] as const;

export const LEADS_PER_MONTH = ['Under 5', '5–20', '20–50', '50–100', '100+'] as const;
export const LEAD_SOURCES = ['Referrals', 'Instagram/Facebook', 'Website', 'Zillow/portals', 'Paid ads', 'Open houses', 'Cold calling'] as const;
export const REPLY_TIME = ['Under 5 minutes', 'Within 1 hour', 'Same day', 'Next day', 'Often miss them'] as const;
export const FOLLOW_SYSTEM = ['None', 'Memory / notes', 'Spreadsheet', 'CRM, manual follow-up', 'CRM with automated follow-up'] as const;
export const CRMS = ['None', 'GoHighLevel', 'Follow Up Boss', 'kvCORE', 'HubSpot', 'Salesforce', 'Other'] as const;
export const FOLLOW_UPS = ['Once', '2–3 times', '4–6 times', 'Until they reply/unsubscribe', "I don't"] as const;
export const AFTER_HOURS = ['Auto-reply instantly', 'I reply when I can', 'They wait until next day'] as const;
export const SCHEDULING = ['Automated booking link', 'Back-and-forth texts/calls', 'Someone schedules for me'] as const;

export const ADMIN_HOURS = ['Under 5', '5–10', '10–20', '20+'] as const;
export const NURTURE = ['Monthly newsletter/touches', 'Occasionally', 'Never'] as const;
export const REVIEWS = ['Always', 'Sometimes', 'Never'] as const;
export const CHALLENGES = [
  'Not enough leads',
  "Leads don't convert",
  'No time for content',
  "Website doesn't bring business",
  'Too much admin',
  'Hiring / managing team'
] as const;
export const GOALS = ['More listings', 'More buyer leads', 'Stronger brand', 'Recruit agents', 'Free up my time'] as const;
export const BUDGETS = ['Under $300', '$300–700', '$700–1,500', '$1,500+', 'Not sure'] as const;

export interface AuditAnswers {
  // Step 1: about your business
  businessName: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  businessType: string;
  years: string;
  // Step 2: where you are online
  website: string;
  noWebsite: boolean;
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  linkedin: string;
  google: string;
  portals: string[];
  // Step 3: social media & content
  postFreq: string;
  reels: string;
  likes: string;
  creator: string;
  postTypes: string[];
  face: string;
  // Step 4: website & lead capture
  siteStatus: string;
  siteListings: string;
  siteContact: string;
  siteChat: string;
  siteMobile: string;
  // Step 5: leads, follow-up & sales systems
  leadsPerMonth: string;
  leadSources: string[];
  replyTime: string;
  followSystem: string;
  crm: string;
  followUps: string;
  afterHours: string;
  scheduling: string;
  // Step 6: time, admin & goals
  adminHours: string;
  nurture: string;
  reviews: string;
  challenge: string;
  goal: string;
  budget: string;
  // Final step
  consent: boolean;
}

export const EMPTY_ANSWERS: AuditAnswers = {
  businessName: '', name: '', role: '', email: '', phone: '', country: '', city: '', businessType: '', years: '',
  website: '', noWebsite: false, instagram: '', facebook: '', tiktok: '', youtube: '', linkedin: '', google: '', portals: [],
  postFreq: '', reels: '', likes: '', creator: '', postTypes: [], face: '',
  siteStatus: '', siteListings: '', siteContact: '', siteChat: '', siteMobile: '',
  leadsPerMonth: '', leadSources: [], replyTime: '', followSystem: '', crm: '', followUps: '', afterHours: '', scheduling: '',
  adminHours: '', nurture: '', reviews: '', challenge: '', goal: '', budget: '',
  consent: false
};

export type FieldKey = Exclude<keyof AuditAnswers, 'consent' | 'noWebsite'>;

// How a question is answered: free text (identity and links only), one choice, or several
export type Field =
  | { key: FieldKey; label: string; kind: 'text'; required?: boolean; placeholder?: string; inputType?: 'text' | 'email' | 'tel' | 'url'; autoComplete?: string; maxLength?: number }
  | { key: FieldKey; label: string; kind: 'select'; options: readonly string[] }
  | { key: FieldKey; label: string; kind: 'multi'; options: readonly string[]; hint?: string };

export interface Step {
  id: string;
  title: string;
  intro: string;
  fields: Field[];
}

export const LINK_FIELDS = ['website', 'instagram', 'facebook', 'tiktok', 'youtube', 'linkedin', 'google'] as const;

export const STEPS: Step[] = [
  {
    id: 'business',
    title: 'About your business',
    intro: 'So we know who the audit is for.',
    fields: [
      { key: 'businessName', label: 'Business name', kind: 'text', required: true, autoComplete: 'organization', maxLength: 120 },
      { key: 'name', label: 'Your name', kind: 'text', required: true, autoComplete: 'name', maxLength: 120 },
      { key: 'role', label: 'Your role', kind: 'select', options: ROLES },
      { key: 'email', label: 'Email', kind: 'text', inputType: 'email', required: true, autoComplete: 'email', maxLength: 200 },
      { key: 'phone', label: 'Phone (optional)', kind: 'text', inputType: 'tel', autoComplete: 'tel', maxLength: 40, placeholder: '+1 555 123 4567' },
      { key: 'country', label: 'Country', kind: 'select', options: COUNTRIES },
      { key: 'city', label: 'City', kind: 'text', autoComplete: 'address-level2', maxLength: 80 },
      { key: 'businessType', label: 'Business type', kind: 'select', options: BUSINESS_TYPES },
      { key: 'years', label: 'Years in business', kind: 'select', options: YEARS }
    ]
  },
  {
    id: 'online',
    title: 'Where you are online',
    intro: 'Add at least one link or handle. All of them are optional.',
    fields: [
      { key: 'website', label: 'Website URL', kind: 'text', inputType: 'url', placeholder: 'yourwebsite.com', maxLength: 200 },
      { key: 'instagram', label: 'Instagram handle', kind: 'text', placeholder: '@yourhandle', maxLength: 100 },
      { key: 'facebook', label: 'Facebook page', kind: 'text', placeholder: 'facebook.com/yourpage', maxLength: 200 },
      { key: 'tiktok', label: 'TikTok', kind: 'text', placeholder: '@yourhandle', maxLength: 100 },
      { key: 'youtube', label: 'YouTube', kind: 'text', placeholder: 'youtube.com/@yourchannel', maxLength: 200 },
      { key: 'linkedin', label: 'LinkedIn', kind: 'text', placeholder: 'linkedin.com/in/you', maxLength: 200 },
      { key: 'google', label: 'Google Business Profile link', kind: 'text', placeholder: 'g.page/yourbusiness', maxLength: 300 },
      { key: 'portals', label: 'Listing portals you use', kind: 'multi', options: PORTALS, hint: 'Tap all that apply' }
    ]
  },
  {
    id: 'content',
    title: 'Social media & content',
    intro: 'Tap the answer closest to how things are today.',
    fields: [
      { key: 'postFreq', label: 'How often do you post?', kind: 'select', options: POST_FREQ },
      { key: 'reels', label: 'Reels / short videos per month', kind: 'select', options: REELS },
      { key: 'likes', label: 'Average likes per post', kind: 'select', options: LIKES },
      { key: 'creator', label: 'Who creates your content?', kind: 'select', options: CREATORS },
      { key: 'postTypes', label: 'What do you mostly post?', kind: 'multi', options: POST_TYPES, hint: 'Tap all that apply' },
      { key: 'face', label: 'Do you show your face on camera?', kind: 'select', options: FACE }
    ]
  },
  {
    id: 'website',
    title: 'Website & lead capture',
    intro: 'How your website turns visitors into enquiries.',
    fields: [
      { key: 'siteStatus', label: 'Website status', kind: 'select', options: SITE_STATUS },
      { key: 'siteListings', label: 'Listings on your website', kind: 'select', options: SITE_LISTINGS },
      { key: 'siteContact', label: 'How do leads contact you from the site?', kind: 'select', options: SITE_CONTACT },
      { key: 'siteChat', label: 'WhatsApp / chat on your website', kind: 'select', options: YES_NO },
      { key: 'siteMobile', label: 'Does your site load well on mobile?', kind: 'select', options: SITE_MOBILE }
    ]
  },
  {
    id: 'leads',
    title: 'Leads, follow-up & sales',
    intro: 'What happens after someone gets in touch.',
    fields: [
      { key: 'leadsPerMonth', label: 'New leads per month', kind: 'select', options: LEADS_PER_MONTH },
      { key: 'leadSources', label: 'Main lead sources', kind: 'multi', options: LEAD_SOURCES, hint: 'Tap all that apply' },
      { key: 'replyTime', label: 'Average time to reply to a new lead', kind: 'select', options: REPLY_TIME },
      { key: 'followSystem', label: 'Your follow-up system', kind: 'select', options: FOLLOW_SYSTEM },
      { key: 'crm', label: 'Which CRM?', kind: 'select', options: CRMS },
      { key: 'followUps', label: 'How many times do you follow up a lead that goes quiet?', kind: 'select', options: FOLLOW_UPS },
      { key: 'afterHours', label: 'After-hours leads (nights / weekends)', kind: 'select', options: AFTER_HOURS },
      { key: 'scheduling', label: 'Showing scheduling', kind: 'select', options: SCHEDULING }
    ]
  },
  {
    id: 'admin',
    title: 'Time, admin & goals',
    intro: 'Last questions. Then we build your audit.',
    fields: [
      { key: 'adminHours', label: 'Hours per week on admin (paperwork, scheduling, data entry)', kind: 'select', options: ADMIN_HOURS },
      { key: 'nurture', label: 'Do you nurture your past-client database?', kind: 'select', options: NURTURE },
      { key: 'reviews', label: 'Do you collect reviews after closing?', kind: 'select', options: REVIEWS },
      { key: 'challenge', label: 'Biggest challenge right now', kind: 'select', options: CHALLENGES },
      { key: 'goal', label: 'Main goal for the next 90 days', kind: 'select', options: GOALS },
      { key: 'budget', label: 'Monthly marketing budget', kind: 'select', options: BUDGETS }
    ]
  }
];

export const ALL_FIELDS: Field[] = STEPS.flatMap((s) => s.fields);
