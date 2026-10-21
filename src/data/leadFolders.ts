// Dashboard lead folders: one per Assistant (with a sub-folder per sub-service), plus Full Team and
// General. Shared by the server (filing and filtering leads) and the dashboard (folder tree).
// Note: '.js' extensions keep this importable from the Node ESM server bundle too.
import type { LeadCategory, LeadDivision } from '../types/index.js';
import { ASSISTANTS } from './assistantsData.js';

export interface LeadFolder {
  division: LeadDivision;
  group: string;
  label: string;
}

export const DIVISION_LABELS: Record<LeadDivision, string> = {
  technical: 'Technical Assistant',
  creative: 'Creative Assistant',
  virtual: 'Virtual Assistant',
  'full-team': 'Full Team',
  general: 'General'
};

// Every folder in the tree, including empty ones, in a stable order
export const LEAD_FOLDERS: Record<LeadDivision, LeadFolder[]> = {
  technical: [],
  creative: [],
  virtual: [],
  'full-team': [{ division: 'full-team', group: 'general', label: 'Full Team inquiries' }],
  general: [
    { division: 'general', group: 'general', label: 'Not sure yet / general' },
    { division: 'general', group: 'packages', label: 'Older package inquiries' }
  ]
};
for (const a of ASSISTANTS) {
  LEAD_FOLDERS[a.id] = [
    ...a.subServices.map((s) => ({ division: a.id, group: s.id, label: s.title })),
    { division: a.id, group: 'general', label: 'Not sure which service' }
  ];
}

export const LEAD_DIVISIONS = Object.keys(LEAD_FOLDERS) as LeadDivision[];

// Leads saved before the three Assistants were filed as "real-estate" or "ai-content" plus an old
// service slug. They stay as they are in the database and are shown in their new folder.
const LEGACY_FOLDERS: Record<string, LeadCategory> = {
  'real-estate/web-development': { division: 'technical', group: 'websites' },
  'real-estate/custom-software': { division: 'technical', group: 'integrations' },
  'real-estate/crm-development': { division: 'technical', group: 'crm' },
  'real-estate/ai-automation': { division: 'technical', group: 'lead-response' },
  'real-estate/ai-assistants': { division: 'technical', group: 'lead-response' },
  'real-estate/social-media': { division: 'creative', group: 'social' },
  'real-estate/virtual-assistance': { division: 'virtual', group: 'general' },
  'real-estate/admin-support': { division: 'virtual', group: 'crm-entry' },
  'real-estate/packages': { division: 'general', group: 'packages' },
  'real-estate/general': { division: 'general', group: 'general' },
  'ai-content/real-estate': { division: 'creative', group: 'reels' },
  'ai-content/fashion': { division: 'creative', group: 'brand-content' },
  'ai-content/food': { division: 'creative', group: 'brand-content' },
  'ai-content/products': { division: 'creative', group: 'brand-content' },
  'ai-content/ai-advertising': { division: 'creative', group: 'brand-content' },
  'ai-content/social-content': { division: 'creative', group: 'brand-content' },
  'ai-content/packages': { division: 'general', group: 'packages' },
  'ai-content/general': { division: 'creative', group: 'general' }
};

// The folder a stored lead belongs in today (new categories pass through unchanged)
export function normalizeCategory(stored: { division?: string; group?: string } | undefined): LeadCategory {
  const division = stored?.division ?? 'general';
  const group = stored?.group ?? 'general';
  const legacy = LEGACY_FOLDERS[`${division}/${group}`];
  if (legacy) return legacy;
  const folder = LEAD_FOLDERS[division as LeadDivision]?.find((f) => f.group === group);
  return folder ? { division: folder.division, group: folder.group } : { division: 'general', group: 'general' };
}

// Every stored category that shows up in a folder (or a whole division when group is omitted),
// so the database can be filtered for new and older leads alike
export function storedCategoriesFor(division: LeadDivision, group?: string): { division: string; group?: string }[] {
  const legacy = Object.entries(LEGACY_FOLDERS)
    .filter(([, to]) => to.division === division && (!group || to.group === group))
    .map(([from]) => {
      const [d, g] = from.split('/');
      return { division: d, group: g };
    });
  return [{ division, group }, ...legacy];
}

export function folderLabel(division: LeadDivision, group: string): string {
  return LEAD_FOLDERS[division]?.find((f) => f.group === group)?.label ?? group;
}
