import { servicesData } from '../data/servicesData';
import { LeadDivision, LeadStats } from '../types';

export interface LeadFolder {
  division: LeadDivision;
  group: string;
  label: string;
}

export const DIVISION_LABELS: Record<LeadDivision, string> = {
  'real-estate': 'Real Estate',
  'ai-content': 'AI Content',
  general: 'General'
};

const SPECIAL_GROUPS: Record<string, string> = {
  packages: 'Packages & bundles',
  general: 'General inquiries'
};

// Every folder in the tree, including empty ones, in a stable order
export const LEAD_FOLDERS: Record<LeadDivision, LeadFolder[]> = {
  'real-estate': [
    ...servicesData
      .filter((s) => s.division === 'real-estate')
      .map((s) => ({ division: 'real-estate' as const, group: s.slug, label: s.title })),
    { division: 'real-estate', group: 'packages', label: SPECIAL_GROUPS.packages },
    { division: 'real-estate', group: 'general', label: SPECIAL_GROUPS.general }
  ],
  'ai-content': [
    ...servicesData
      .filter((s) => s.division === 'ai-content')
      .map((s) => ({ division: 'ai-content' as const, group: s.slug, label: s.title })),
    { division: 'ai-content', group: 'packages', label: SPECIAL_GROUPS.packages },
    { division: 'ai-content', group: 'general', label: SPECIAL_GROUPS.general }
  ],
  general: [
    { division: 'general', group: 'packages', label: 'Business packages & add-ons' },
    { division: 'general', group: 'general', label: SPECIAL_GROUPS.general }
  ]
};

export function folderLabel(division: LeadDivision, group: string): string {
  return LEAD_FOLDERS[division]?.find((f) => f.group === group)?.label ?? SPECIAL_GROUPS[group] ?? group;
}

export function folderCounts(stats: LeadStats | null) {
  const map = new Map<string, { count: number; newCount: number }>();
  for (const f of stats?.byFolder ?? []) map.set(`${f.division}/${f.group}`, { count: f.count, newCount: f.newCount });
  const get = (division: LeadDivision, group?: string) => {
    if (group) return map.get(`${division}/${group}`) ?? { count: 0, newCount: 0 };
    let count = 0;
    let newCount = 0;
    for (const [k, v] of map) {
      if (k.startsWith(`${division}/`)) {
        count += v.count;
        newCount += v.newCount;
      }
    }
    return { count, newCount };
  };
  return get;
}
