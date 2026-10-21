import React from 'react';
import { useMedia } from '../../context/SiteContentContext';
import { teamSlotKey } from '../../config/mediaSlots';
import { Founder } from '../../types';

// Team photo, replaced by the one uploaded in the dashboard when available
export const FounderPhoto: React.FC<{ founder: Founder; className?: string }> = ({ founder, className = '' }) => {
  const custom = useMedia(teamSlotKey(founder.id));
  const src = custom?.kind === 'image' ? custom.url : founder.image;
  return <img src={src} alt={founder.name} loading="lazy" decoding="async" className={className} />;
};
