import { LeadDivision, LeadStats } from '../types';

// The folder tree (Assistants > sub-services, Full Team, General) is shared with the server
export { DIVISION_LABELS, LEAD_FOLDERS, folderLabel, type LeadFolder } from '../data/leadFolders';

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
