import { Founder } from '../types';
import { CONTACT } from '../config/contact';

export const teamData: Founder[] = [
  {
    id: 'abdussamie',
    name: 'Raja Muhammad Abdussamie Tahir',
    role: 'Founder & CEO',
    title: 'Systems Architect & Studio Principal',
    bio: 'Leads digital system architecture, custom software development, and strategic studio vision. Works directly with real estate leaders and global brands to engineer automated digital operations that run with absolute precision.',
    quote: 'We do not sell hours or generic website templates. We architect the digital backbone that enables modern businesses to scale without chaos.',
    focus: [
      'Digital Systems Architecture',
      'Real Estate CRM Engineering',
      'Autonomous Business Workflows',
      'Executive Technology Strategy'
    ],
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=80',
    linkedin: CONTACT.founderLinkedIn
  },
  {
    id: 'mashhood',
    name: 'Mashhood',
    role: 'Co-Founder',
    title: 'Creative Technologist & AI Director',
    bio: 'Heads creative direction and the AI Content Studio. Specializes in cinematic video generation, high-fashion campaigns, luxury architectural tours, and sensory commercial storytelling that commands attention.',
    quote: 'Traditional production requires weeks of crew coordination and massive budgets. AI allows us to move from pure concept to final cinema in days.',
    focus: [
      'Cinematic AI Direction',
      'Architectural Visuals & Tours',
      'Brand & Fashion Commercials',
      'Prompt Engineering & Audio Design'
    ],
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=80'
  }
];

export const studioPhilosophy = {
  tagline: 'Small team. Serious execution.',
  subtext: 'You work directly with the two founders who architect your systems and direct your creative content. No junior account managers, no bureaucratic handoffs, no bloated overhead.',
  principles: [
    {
      number: '01',
      title: 'Systems Over Headcount',
      description: 'A well-engineered automated workflow outperforms a bloated department every single day. We build digital leverage.'
    },
    {
      number: '02',
      title: 'Production Without the Production',
      description: 'Cinematic visual campaigns without the friction, permits, weather delays, and multi-week overhead of legacy film sets.'
    },
    {
      number: '03',
      title: 'Direct Founder Accountability',
      description: 'Every line of code and every visual frame is crafted or reviewed directly by Abdussamie and Mashhood.'
    },
    {
      number: '04',
      title: 'International Standard',
      description: 'Operating remotely from day one, serving real estate brokerages and ambitious brands across the United States, UAE, Canada, and worldwide.'
    }
  ]
};
