import React from 'react';
import { useMedia, useMediaLoaded } from '../../context/SiteContentContext';
import { aiContentSlotKey } from '../../config/mediaSlots';
import { LoopingVideo } from './LoopingVideo';
import { ProofPlaceholder } from '../assistants/AssistantBlocks';

// The AI video slots founders fill from the dashboard (Media page), with the name shown on the site
const SLOTS = [
  { slug: 'real-estate', label: 'Property video' },
  { slug: 'social-content', label: 'Brand social content' },
  { slug: 'products', label: 'Product film' },
  { slug: 'fashion', label: 'Fashion film' },
  { slug: 'food', label: 'Food film' },
  { slug: 'ai-advertising', label: 'Ad creative' }
] as const;

// Real sample videos only: a slot appears once a video has been uploaded for it in the dashboard
// `heading` is shown above the videos, and only when there are videos to show
export const SampleVideos: React.FC<{ limit?: number; heading?: React.ReactNode }> = ({ limit, heading }) => {
  const loaded = useMediaLoaded();
  // SLOTS never changes, so the hooks run in the same order on every render
  const videos = SLOTS.map((s) => ({ ...s, media: useMedia(aiContentSlotKey(s.slug)) })).filter((s) => s.media?.kind === 'video');
  const shown = limit ? videos.slice(0, limit) : videos;

  if (!shown.length) {
    return loaded ? <ProofPlaceholder label="upload sample videos in the dashboard (Media → AI Content) to show them here" /> : null;
  }

  return (
    <div className="space-y-10">
      {heading}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shown.map(({ slug, label, media }) => (
          <figure key={slug} className="bg-surface border border-line rounded-card overflow-hidden">
            <LoopingVideo src={media!.url} poster={media!.poster} label={`${label} sample`} className="w-full aspect-[4/5] object-cover" />
            <figcaption className="px-4 py-3 text-sm font-medium text-fg">{label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
};
