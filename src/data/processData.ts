export interface ProcessStep {
  step: string;
  name: string;
  title: string;
  summary: string;
  activities: string[];
}

export const coreProcessSteps: ProcessStep[] = [
  {
    step: '01',
    name: 'Discover',
    title: 'Audit & Objective Discovery',
    summary: 'We unpack your current operational bottlenecks, lead sources, and aesthetic ambitions directly with company principals.',
    activities: [
      'Comprehensive audit of existing tech stack or creative positioning',
      'Identification of operational lead leakage and manual friction',
      'Definition of non-negotiable conversion milestones and aesthetic benchmarks'
    ]
  },
  {
    step: '02',
    name: 'Strategy',
    title: 'Architectural & Creative Blueprint',
    summary: 'Before writing code or prompting visual models, we deliver a concrete structural blueprint of the system or film treatment.',
    activities: [
      'Data flow and pipeline schematics for software/automation',
      'Visual moodboards, style references, and prompt conditioning strategy for AI cinema',
      'Clear scope boundaries, deliverable timelines, and integration milestones'
    ]
  },
  {
    step: '03',
    name: 'Design',
    title: 'Interface & Visual Direction',
    summary: 'Crafting the visual language: high-converting editorial UI or cinematic art direction that commands authority.',
    activities: [
      'Bespoke desktop and mobile UI design with zero generic templates',
      'Lighting, texturing, and camera choreography design for cinematic content',
      'Direct founder review and fast alignment cycles'
    ]
  },
  {
    step: '04',
    name: 'Build',
    title: 'Engineering & Generation',
    summary: 'Translating designs into clean, scalable TypeScript code or generating high-definition cinematic frame sequences.',
    activities: [
      'Next.js frontend engineering and clean API endpoint preparation',
      'Multi-angle AI video rendering, prompt iterative tuning, and frame interpolation',
      'Secure database schema setup, webhook hooks, and CRM staging'
    ]
  },
  {
    step: '05',
    name: 'Launch',
    title: 'Deployment & System Integration',
    summary: 'Rigorous end-to-end testing, DNS/CDN deployment, and workflow automation switch-on.',
    activities: [
      'Live test lead submissions through WhatsApp and CRM pipelines',
      'Color grading, audio master mix, and multi-format video exports',
      'Team training walkthrough and operational runbook handover'
    ]
  },
  {
    step: '06',
    name: 'Optimize',
    title: 'Performance & Continuous Refinement',
    summary: 'We monitor live conversions, tune AI prompt parameters, and optimize operational velocity post-launch.',
    activities: [
      'First month complimentary maintenance and error monitoring',
      'Analytics review (conversion rate, lead response latency, audience retention)',
      'Quarterly system scaling recommendations'
    ]
  }
];

export const realEstateWorkflowSteps = [
  { step: '01', title: 'Business Audit', desc: 'Map every lead source, broker handoff, and spreadsheet gap.' },
  { step: '02', title: 'System Design', desc: 'Architect pipeline stages, automated triggers, and web architecture.' },
  { step: '03', title: 'Development', desc: 'Code high-speed web apps and configure custom CRM engines.' },
  { step: '04', title: 'Automation', desc: 'Connect WhatsApp, calendar booking, and AI qualification workflows.' },
  { step: '05', title: 'Launch', desc: 'Deploy to high-speed CDN and verify end-to-end deal flow.' },
  { step: '06', title: 'Optimization', desc: 'Refine broker SLA response times and conversion rates.' }
];

export const aiContentWorkflowSteps = [
  { step: '01', title: 'Concept', desc: 'Clarify brand world, hero product, and narrative campaign hook.' },
  { step: '02', title: 'Creative Direction', desc: 'Define cinematic lighting, camera physics, and moodboard palette.' },
  { step: '03', title: 'Generation', desc: 'Iterative AI video rendering and multi-perspective prompting.' },
  { step: '04', title: 'Editing', desc: 'Precision pacing cut, speed ramping, color grade, and foley audio.' },
  { step: '05', title: 'Review', desc: 'Direct review with brand principals for sharp alignment.' },
  { step: '06', title: 'Delivery', desc: 'Master exports in 4K widescreen and 9:16 vertical for immediate launch.' }
];
