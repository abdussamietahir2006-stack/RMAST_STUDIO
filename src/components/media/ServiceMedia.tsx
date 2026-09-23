import React from 'react';
import { useMedia } from '../../context/SiteContentContext';
import { aiContentSlotKey } from '../../config/mediaSlots';
import { ProjectItem, ServiceDetail } from '../../types';
import { LoopingVideo } from './LoopingVideo';

interface AiContentMediaProps {
  slug?: string; // AI Content service slug whose dashboard video should play here
  image: string; // fallback picture (also the video's poster)
  alt: string;
  className?: string;
}

// One dashboard video per AI Content industry, shown everywhere that industry appears:
// the AI Content page, its service page, the Work page, Case Studies and the home page.
export const AiContentMedia: React.FC<AiContentMediaProps> = ({ slug, image, alt, className = '' }) => {
  const video = useMedia(slug ? aiContentSlotKey(slug) : '');

  if (slug && video?.kind === 'video') {
    return <LoopingVideo src={video.url} poster={image} label={`${alt} video`} className={className} />;
  }
  return <img src={image} alt={alt} loading="lazy" decoding="async" className={className} />;
};

export const ServiceMedia: React.FC<{ service: ServiceDetail; className?: string }> = ({ service, className }) => (
  <AiContentMedia
    slug={service.division === 'ai-content' ? service.slug : undefined}
    image={service.image}
    alt={service.title}
    className={className}
  />
);

export const ProjectMedia: React.FC<{ project: ProjectItem; className?: string }> = ({ project, className }) => (
  <AiContentMedia slug={project.videoSlot} image={project.image} alt={project.title} className={className} />
);
