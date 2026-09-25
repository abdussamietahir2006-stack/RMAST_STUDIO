// Small helpers shared by the Social posts and Social videos pages.
import type { SocialPostStatus } from '../../types';

export const STATUS_STYLE: Record<SocialPostStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-[#A68BFF]/15 text-[#C9B8FF] border-[#A68BFF]/40' },
  downloaded: { label: 'Downloaded', className: 'bg-[#3DDCFF]/10 text-[#86E8FF] border-[#3DDCFF]/35' },
  posted: { label: 'Posted', className: 'bg-[#10B981]/12 text-[#6EE7B7] border-[#10B981]/40' },
  skipped: { label: 'Skipped', className: 'bg-[#2A2B36] text-[#8B8D98] border-[#3A3B48]' }
};

// Caption followed by its hashtags, ready to paste into Instagram
export const fullCaption = (item: { caption: string; hashtags: string[] }) =>
  `${item.caption}${item.hashtags.length ? `\n\n${item.hashtags.map((h) => `#${h}`).join(' ')}` : ''}`;

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export const fileSlug = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'post';

// A fresh random variation of a look
export const newSeed = () => 1 + Math.floor(Math.random() * 2_000_000_000);
