// Media that founders can replace from the dashboard. Shared by the site and the API.
// Note: '.js' extensions keep this importable from the Node ESM server bundle too.
import type { MediaKind } from '../types/index.js';
import { servicesData } from '../data/servicesData.js';

export type MediaSlotGroup = 'home' | 'team' | 'ai-content';

export interface MediaSlot {
  key: string;
  kind: MediaKind;
  group: MediaSlotGroup;
  label: string;
  hint: string;
}

export const MEDIA_LIMITS: Record<MediaKind, { maxBytes: number; types: string[] }> = {
  image: { maxBytes: 8 * 1024 * 1024, types: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'] },
  video: { maxBytes: 100 * 1024 * 1024, types: ['video/mp4', 'video/webm', 'video/quicktime'] }
};

export const teamSlotKey = (founderId: string) => `team-${founderId}`;
export const aiContentSlotKey = (serviceSlug: string) => `ai-content-${serviceSlug}`;
export const HOME_INTRO_KEY = 'home-intro';

export const MEDIA_SLOTS: MediaSlot[] = [
  {
    key: HOME_INTRO_KEY,
    kind: 'video',
    group: 'home',
    label: 'Home page intro video',
    hint: 'Introduce RMAST Studio. Plays with sound when a visitor presses play.'
  },
  {
    key: teamSlotKey('abdussamie'),
    kind: 'image',
    group: 'team',
    label: 'Raja Muhammad Abdussamie Tahir',
    hint: 'Portrait photo, ideally 4:5 and at least 1000px wide.'
  },
  {
    key: teamSlotKey('mashhood'),
    kind: 'image',
    group: 'team',
    label: 'Mashhood',
    hint: 'Portrait photo, ideally 4:5 and at least 1000px wide.'
  },
  ...servicesData
    .filter((s) => s.division === 'ai-content')
    .map<MediaSlot>((s) => ({
      key: aiContentSlotKey(s.slug),
      kind: 'video',
      group: 'ai-content',
      label: s.title,
      hint: '10–20 second clip. Plays muted on a loop in place of the picture, everywhere this industry appears.'
    }))
];

export const findMediaSlot = (key: string) => MEDIA_SLOTS.find((s) => s.key === key);
