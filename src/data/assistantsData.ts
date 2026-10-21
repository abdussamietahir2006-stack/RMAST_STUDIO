// The three services RMAST Studio sells ("Assistants"), their sub-services, plans and FAQ.
// One source for the home page, the Assistant pages, the navigation and the SEO data.
// Note: '.js' extensions keep this importable from the build-time prerenderer too.

export type AssistantId = 'technical' | 'creative' | 'virtual';

export interface SubService {
  id: string;
  title: string;
  summary: string;
  delivered: string[];
  flagship?: boolean;
}

export interface Assistant {
  id: AssistantId;
  slug: string;
  path: string;
  name: string;
  tagline: string;
  intro: string;
  // Sub-service titles shown on the home page card (3-4)
  highlights: string[];
  problems: { title: string; text: string }[];
  subServices: SubService[];
  monthly: string[];
  process: { title: string; text: string }[];
  seo: { title: string; description: string; serviceType: string };
}

export const ASSISTANTS: Assistant[] = [
  {
    id: 'technical',
    slug: 'technical-assistant',
    path: '/services/technical-assistant',
    name: 'Technical Assistant',
    tagline: 'Systems that capture and answer every lead.',
    intro:
      'Your Technical Assistant builds and runs the systems behind your business. Every new enquiry gets a reply within 60 seconds, day or night. Your website, CRM and follow-ups work together, so no lead sits in an inbox and goes cold. We set it up, keep it running and fix what breaks.',
    highlights: ['Lead Response System', 'Websites & landing pages', 'CRM setup & automations', 'Integrations & dashboards'],
    problems: [
      { title: 'Leads wait hours for a reply', text: 'By the time you call back, they have already spoken to another agent.' },
      { title: 'Your CRM is a mess', text: 'Contacts are missing, tags mean nothing and follow-ups depend on your memory.' },
      { title: 'Your website brings in nothing', text: 'It looks fine, but nobody fills in the form.' },
      { title: 'Your tools don’t talk to each other', text: 'You copy the same lead from a portal to your CRM to a spreadsheet by hand.' }
    ],
    subServices: [
      {
        id: 'lead-response',
        title: 'Lead Response System',
        flagship: true,
        summary:
          'Every new enquiry from WhatsApp, SMS, Instagram or your website gets a reply within 60 seconds. We ask the right questions, separate serious buyers and sellers from browsers, and book the viewing or call into your calendar.',
        delivered: [
          'Instant replies on WhatsApp, SMS and Instagram',
          'A lead pipeline with clear stages',
          'Qualifying questions: budget, timeline, area, financing',
          'Viewing and appointment booking',
          'An alert to you when a hot lead comes in'
        ]
      },
      {
        id: 'websites',
        title: 'Websites & landing pages',
        summary: 'Agent, team and brokerage websites that load fast and turn visitors into enquiries. Listing pages and recruiting pages too.',
        delivered: ['Agent, team or brokerage website', 'Listing and landing pages', 'Recruiting pages for growing teams', 'Lead forms connected to your CRM']
      },
      {
        id: 'crm',
        title: 'CRM setup & automations',
        summary: 'Every lead gets a stage, a tag and a next step. Follow-ups go out on time without you having to remember them.',
        delivered: ['Pipelines for buyers, sellers and past clients', 'Clean tags and fields', 'Follow-up sequences by text and email', 'Contact import and clean-up', 'Connections to your lead sources']
      },
      {
        id: 'integrations',
        title: 'Integrations, dashboards & custom software',
        summary: 'When your tools don’t connect, we connect them. When nothing off the shelf fits, we build it.',
        delivered: ['Lead source integrations: portals, ads and forms', 'Simple dashboards for leads and deals', 'Custom tools for your team', 'Written documentation, so you are never locked in']
      }
    ],
    monthly: [
      'Your Lead Response System running and monitored',
      'Changes and fixes to your website, CRM and automations',
      'New follow-up sequences and pages when you need them',
      'A monthly report: leads in, replies sent, appointments booked'
    ],
    process: [
      { title: 'Audit', text: 'We look at how leads reach you today and where they get lost.' },
      { title: 'Plan', text: 'We agree what to build first, usually your Lead Response System.' },
      { title: 'Build and connect', text: 'We set everything up and test it with real enquiries.' },
      { title: 'Run and improve', text: 'We monitor it, report every month and keep improving it.' }
    ],
    seo: {
      title: 'Technical Assistant: Lead Response for Realtors & Real Estate CRM Setup | RMAST Studio',
      description:
        'Lead response for realtors: every enquiry answered in 60 seconds on WhatsApp, SMS and Instagram, qualified and booked. Plus real estate CRM setup, websites and integrations.',
      serviceType: 'Real estate lead response, CRM setup and websites'
    }
  },
  {
    id: 'creative',
    slug: 'creative-assistant',
    path: '/services/creative-assistant',
    name: 'Creative Assistant',
    tagline: 'Content people actually watch.',
    intro:
      'Your Creative Assistant plans, makes and posts your content. Reels, listing videos, graphics and captions, all in your brand, every week. You stay in front of buyers and sellers without filming every day or staring at a blank caption.',
    highlights: ['Content strategy & reel ideas', 'Reels & cinematic listing videos', 'Graphic design & branding', 'Social media management'],
    problems: [
      { title: 'Your listings get 2 likes', text: 'Photos alone don’t stop the scroll anymore.' },
      { title: 'You don’t know what to post', text: 'So you post nothing for weeks, then three times in one day.' },
      { title: 'Your brand looks different everywhere', text: 'Your logo, colours and posts don’t match, so people don’t remember you.' },
      { title: 'You have no time to film and edit', text: 'Content keeps slipping to the bottom of your list.' }
    ],
    subServices: [
      {
        id: 'strategy',
        title: 'Content strategy & reel ideas',
        summary: 'A monthly plan built around your market, your listings and what your audience responds to. Reel ideas you can film in minutes.',
        delivered: ['A monthly content calendar', 'Reel ideas with hooks and short scripts', 'Topics for buyers, sellers and your local area']
      },
      {
        id: 'reels',
        title: 'Reels & cinematic listing videos',
        summary: 'Short videos for every listing and for your personal brand. We edit your footage, or create AI-generated property and brand videos when you have none.',
        delivered: ['Edited reels from your clips', 'Cinematic listing videos', 'AI-generated property and brand videos', 'Vertical and widescreen versions']
      },
      {
        id: 'design',
        title: 'Graphic design & branding',
        summary: 'A look people remember. A logo, a brand kit and templates you reuse for every listing, open house and sale.',
        delivered: ['Logo and brand kit', 'Templates for just listed, open house and just sold', 'Social graphics and carousels', 'Flyers and simple print pieces']
      },
      {
        id: 'social',
        title: 'Social media management',
        summary: 'We post, write captions and reply to comments, so your accounts stay active and the leads in your DMs are not missed.',
        delivered: ['Scheduled posts and stories', 'Captions and local hashtags', 'Comment and DM replies, with leads passed to you', 'A monthly look at what worked']
      },
      {
        id: 'brand-content',
        title: 'Cinematic AI content for brands',
        summary: 'Cinematic AI videos for brands beyond real estate too: products, fashion, food and ads. No film crew, no location fees.',
        delivered: ['AI brand and product films', 'Ad variations to test', 'Formats for Reels, TikTok and YouTube']
      }
    ],
    monthly: [
      'A content calendar for the month',
      'The agreed number of reels and posts, edited and ready',
      'Posting, captions and replies to comments',
      'A monthly report: what was posted and how it performed'
    ],
    process: [
      { title: 'Audit', text: 'We look at your accounts, your brand and what your competitors post.' },
      { title: 'Plan', text: 'You get a calendar and reel ideas for the month.' },
      { title: 'Create and post', text: 'We make the content, you approve it, we post it.' },
      { title: 'Review', text: 'Every month we look at what worked and do more of it.' }
    ],
    seo: {
      title: 'Creative Assistant: Real Estate Social Media Management & Reels | RMAST Studio',
      description:
        'Real estate social media management: content strategy, reels, cinematic listing videos, AI property videos, branding and posting for agents, teams and brokerages.',
      serviceType: 'Real estate social media management and video content'
    }
  },
  {
    id: 'virtual',
    slug: 'virtual-assistant',
    path: '/services/virtual-assistant',
    name: 'Virtual Assistant',
    tagline: 'Admin and transactions, handled.',
    intro:
      'Your Virtual Assistant takes the admin off your plate: transactions from contract to close, follow-ups, your calendar and inbox, CRM updates and listing uploads. Trained in real estate, working your hours, and reporting to you every day.',
    highlights: ['Transaction coordination', 'Lead & past-client follow-ups', 'Calendar, inbox & showings', 'CRM data entry & listing uploads'],
    problems: [
      { title: 'Transaction paperwork eats your evenings', text: 'Deadlines, signatures and documents pile up after every accepted offer.' },
      { title: 'Past clients never hear from you', text: 'So next time they call another agent.' },
      { title: 'Your calendar runs you', text: 'Showings, inspections and calls get double-booked or forgotten.' },
      { title: 'Your CRM is out of date', text: 'New contacts and listings never make it in.' }
    ],
    subServices: [
      {
        id: 'transactions',
        title: 'Transaction coordination',
        summary: 'From accepted offer to closing, we track every deadline, collect the documents and keep buyers, sellers, lenders and agents updated.',
        delivered: ['A deadline tracker for every deal', 'Document collection and checklists', 'Updates to every party', 'Closing-day preparation']
      },
      {
        id: 'follow-ups',
        title: 'Lead and past-client follow-ups',
        summary: 'Regular check-ins with new leads, past clients and your sphere, written in your voice.',
        delivered: ['Follow-up texts, emails and calls', 'Birthday and home-anniversary touches', 'Hot leads passed to you straight away']
      },
      {
        id: 'calendar',
        title: 'Calendar, inbox & showing scheduling',
        summary: 'Your calendar stays clean and your inbox stays under control. Showings and inspections are booked and confirmed.',
        delivered: ['Inbox sorted every day', 'Showings, inspections and appointments booked', 'Reminders and confirmations sent']
      },
      {
        id: 'crm-entry',
        title: 'CRM data entry & listing uploads',
        summary: 'New contacts, notes and listings entered correctly, so you can trust your data.',
        delivered: ['Contacts and notes entered', 'Listing uploads to the MLS and portals', 'Regular clean-up of duplicates']
      },
      {
        id: 'admin',
        title: 'Admin & back-office support',
        summary: 'Everything else that takes your time: research, spreadsheets, ordering and filing.',
        delivered: ['Research and spreadsheets', 'Ordering photos, signs and supplies', 'Filing and simple reports']
      }
    ],
    monthly: [
      'A dedicated assistant trained in your systems',
      'The agreed number of hours each month',
      'An end-of-day summary of what was done',
      'A monthly report: deals tracked, follow-ups sent, tasks done'
    ],
    process: [
      { title: 'Audit', text: 'We list the tasks that take your time each week.' },
      { title: 'Plan', text: 'We write down how you like things done, step by step.' },
      { title: 'Hand over', text: 'Your assistant starts with a short checklist and grows from there.' },
      { title: 'Daily updates', text: 'You get a summary every day and a review every month.' }
    ],
    seo: {
      title: 'Virtual Assistant for Real Estate Agents: Transactions & Admin | RMAST Studio',
      description:
        'A real estate virtual assistant for agents and teams: transaction coordination, lead and past-client follow-ups, calendar and showings, CRM data entry and listing uploads.',
      serviceType: 'Real estate virtual assistant and transaction coordination'
    }
  }
];

export const assistantById = (id: AssistantId) => ASSISTANTS.find((a) => a.id === id)!;
export const assistantBySlug = (slug: string) => ASSISTANTS.find((a) => a.slug === slug);

// The Lead Response System, step by step (home page spotlight and the Technical Assistant page)
export const LEAD_RESPONSE_STEPS = [
  { title: 'Enquiry', text: 'A buyer or seller messages you on WhatsApp, SMS, Instagram or your website.' },
  { title: 'Instant reply', text: 'They get a friendly reply within 60 seconds, day or night.' },
  { title: 'Qualified', text: 'A few short questions: budget, timeline, area and financing.' },
  { title: 'Viewing booked', text: 'Serious leads book a viewing or call straight into your calendar.' }
];

// How working with RMAST Studio goes, from first contact to the monthly report
export const HOW_IT_WORKS = [
  { title: 'Free audit', text: 'We look at how you handle leads, content and admin today, and show you where time and leads are lost.' },
  { title: 'Plan', text: 'You get a short plan: which Assistant to start with and what we do first.' },
  { title: 'Your Assistant team starts', text: 'We set up and get to work. You see progress as we go.' },
  { title: 'Monthly report', text: 'Every month you see what was done, what it achieved and what comes next.' }
];

export interface Plan {
  id: 'one' | 'full-team';
  name: string;
  summary: string;
  includes: string[];
  // TODO(owner): replace with the real monthly price, e.g. 'From $X / month'
  price: string;
  featured?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: 'one',
    name: 'One Assistant',
    summary: 'Start with the Assistant you need most. Add the others when you are ready.',
    includes: [
      'Your choice of Technical, Creative or Virtual Assistant',
      'A free audit and a written plan',
      'A monthly report',
      'Direct access to the founders'
    ],
    price: 'Custom quote'
  },
  {
    id: 'full-team',
    name: 'Full Team',
    summary: 'All three Assistants working together on your leads, content and admin.',
    includes: [
      'Technical, Creative and Virtual Assistants',
      'One plan across leads, content and admin',
      'Leads from your content go straight into your Lead Response System',
      'One monthly report for everything',
      'Direct access to the founders'
    ],
    price: 'Custom quote',
    featured: true
  }
];

export const FAQ = [
  {
    q: 'What’s included in each Assistant?',
    a: 'Each Assistant page lists every sub-service and what you get each month. Your plan says exactly which ones we start with, based on your free audit.'
  },
  {
    q: 'Who is this for?',
    a: 'Real estate agents, teams and brokerages in the USA and Canada, and some in Dubai. Solo agents usually start with one Assistant. Teams and brokerages often take the Full Team.'
  },
  {
    q: 'How fast can you start?',
    a: 'We start as soon as your plan is agreed. Your plan includes a start date and a first-week checklist, so you know what happens and when.'
  },
  {
    q: 'Do you work in US and Canadian time zones?',
    a: 'Yes. We work with clients on Eastern and Pacific time and plan your Assistant’s hours around your day. The Lead Response System replies 24/7.'
  },
  {
    q: 'Is there a long contract?',
    a: 'We work on a monthly retainer. The terms are written into your plan before you agree to anything.'
  },
  {
    q: 'How does the free audit work?',
    a: 'Fill in a short form. We look at your website, social accounts, how fast leads get a reply and where admin piles up. Then we send you what we found and what we would fix first. It’s free, with no obligation.'
  }
];

// Pages for the free audit and the call booking
export const FREE_AUDIT_PATH = '/free-audit';
// TODO(owner): replace with a booking link (e.g. Calendly) when you have one
export const BOOK_CALL_PATH = '/contact';
