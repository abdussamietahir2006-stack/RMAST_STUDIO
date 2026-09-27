import React, { useCallback, useEffect, useRef, useState } from 'react';
import { UploadCloud, RotateCcw, AlertTriangle, CheckCircle2, Film, Image as ImageIcon } from 'lucide-react';
import { MEDIA_LIMITS, MEDIA_SLOTS, MediaSlot, MediaSlotGroup } from '../config/mediaSlots';
import { servicesData } from '../data/servicesData';
import { teamData } from '../data/teamData';
import { MediaAsset } from '../types';
import { adminApi } from './api';
import { useAdmin } from './AdminApp';
import { Button, Card, ErrorNote, PageHeader, Spinner, formatBytes, relativeTime } from './ui';
import { webVideoWarnings } from './videoCheck';

// What the website shows for a slot when nothing has been uploaded
function defaultPreview(slot: MediaSlot): string | undefined {
  if (slot.group === 'team') return teamData.find((f) => `team-${f.id}` === slot.key)?.image;
  if (slot.group === 'ai-content') return servicesData.find((s) => `ai-content-${s.slug}` === slot.key)?.image;
  return undefined;
}

function readVideoDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Number.isFinite(video.duration) ? video.duration : null);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    video.src = url;
  });
}

const SECTIONS: { group: MediaSlotGroup; title: string; description: string; columns: string }[] = [
  {
    group: 'home',
    title: 'Home page',
    description: 'The introduction video beside the headline at the top of the home page.',
    columns: 'grid-cols-1 lg:grid-cols-2'
  },
  {
    group: 'team',
    title: 'Team photos',
    description: 'Shown on the About page and the home page founders section.',
    columns: 'grid-cols-1 sm:grid-cols-2'
  },
  {
    group: 'ai-content',
    title: 'AI Content videos',
    description:
      'One clip per industry, shown everywhere it appears: the AI Content page, the service’s own page, the Work page, Case Studies and the home page showcase.',
    columns: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
  }
];

const MediaSlotCard: React.FC<{
  slot: MediaSlot;
  asset?: MediaAsset;
  storageReady: boolean;
  onChange: (key: string, asset: MediaAsset | null) => void;
}> = ({ slot, asset, storageReady, onChange }) => {
  const { onUnauthorized } = useAdmin();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [removing, setRemoving] = useState(false);

  const limits = MEDIA_LIMITS[slot.kind];
  const uploading = progress !== null;

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  const handleFile = async (file: File | undefined) => {
    if (!file || uploading) return;
    setError(null);
    setWarning(null);
    setDone(false);

    if (!limits.types.includes(file.type)) {
      setError(slot.kind === 'video' ? 'Use an MP4, WebM or MOV video.' : 'Use a JPG, PNG, WebP or AVIF image.');
      return;
    }
    if (file.size > limits.maxBytes) {
      setError(`That file is ${formatBytes(file.size)}. The limit is ${formatBytes(limits.maxBytes)}.`);
      return;
    }
    if (slot.kind === 'video') {
      const seconds = await readVideoDuration(file);
      const notes = await webVideoWarnings(file, seconds);
      if (slot.group === 'ai-content' && seconds !== null && (seconds < 8 || seconds > 25)) {
        notes.push(`This clip is ${Math.round(seconds)} seconds. 10–20 seconds works best for these cards.`);
      }
      if (notes.length) setWarning(notes.join(' '));
    }

    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setProgress(0);
    try {
      const saved = await adminApi.uploadMedia(slot.key, file, setProgress);
      onChange(slot.key, saved);
      setDone(true);
    } catch (err) {
      if (!onUnauthorized(err)) setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setProgress(null);
      setLocalPreview(null);
    }
  };

  const revert = async () => {
    if (!confirm(`Remove the uploaded ${slot.kind} and go back to the default?`)) return;
    setRemoving(true);
    setError(null);
    try {
      await adminApi.removeMedia(slot.key);
      onChange(slot.key, null);
      setDone(false);
    } catch (err) {
      if (!onUnauthorized(err)) setError(err instanceof Error ? err.message : 'Could not remove it.');
    } finally {
      setRemoving(false);
    }
  };

  const previewSrc = localPreview ?? asset?.url ?? defaultPreview(slot);
  const showsVideo = slot.kind === 'video' && (localPreview || asset);
  const aspect = slot.group === 'team' ? 'aspect-[4/5]' : 'aspect-video';

  return (
    <Card className="overflow-hidden flex flex-col">
      {/* Drop zone doubles as the preview */}
      <div
        role="button"
        tabIndex={storageReady ? 0 : -1}
        aria-label={`Upload a new ${slot.kind} for ${slot.label}`}
        aria-disabled={!storageReady || uploading}
        onClick={() => storageReady && !uploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && storageReady && !uploading) {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (storageReady && !uploading) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (storageReady) handleFile(e.dataTransfer.files[0]);
        }}
        className={`relative ${aspect} ${slot.group === 'team' ? 'max-h-80 mx-auto w-full' : ''} bg-[#0B0C10] border-b border-[#22232D] outline-none focus-visible:ring-2 focus-visible:ring-[#C9A96E] ${
          storageReady && !uploading ? 'cursor-pointer' : ''
        }`}
      >
        {previewSrc ? (
          showsVideo ? (
            <video src={previewSrc} muted loop autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={previewSrc} alt="" className="w-full h-full object-cover" />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#3A3C4C]">
            {slot.kind === 'video' ? <Film className="w-10 h-10" /> : <ImageIcon className="w-10 h-10" />}
          </div>
        )}

        {/* Overlay: drop hint, or upload progress */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm transition-opacity ${
            dragOver || uploading
              ? 'opacity-100 bg-[#0B0C10]/85'
              : 'opacity-0 hover:opacity-100 focus-within:opacity-100 bg-[#0B0C10]/70'
          } ${dragOver ? 'ring-2 ring-inset ring-[#C9A96E]' : ''}`}
        >
          {uploading ? (
            <div className="w-2/3 space-y-2 text-center">
              <div className="text-[#ECEAE5]">Uploading… {Math.round(progress ?? 0)}%</div>
              <div className="h-1.5 rounded-full bg-[#22232D] overflow-hidden">
                <div className="h-full bg-[#C9A96E] transition-[width]" style={{ width: `${progress ?? 0}%` }} />
              </div>
            </div>
          ) : storageReady ? (
            <>
              <UploadCloud className="w-7 h-7 text-[#C9A96E]" />
              <span className="text-[#ECEAE5]">{dragOver ? 'Drop to upload' : 'Drag & drop or click to replace'}</span>
            </>
          ) : null}
        </div>

        <span
          className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] ${
            asset ? 'bg-[#C9A96E] text-[#0B0C10] font-medium' : 'bg-[#16171F]/90 text-[#A6A8B3]'
          }`}
        >
          {asset ? 'Custom' : slot.kind === 'video' ? 'No video yet' : 'Default photo'}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={limits.types.join(',')}
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div>
          <h3 className="text-sm font-semibold text-[#ECEAE5]">{slot.label}</h3>
          <p className="text-xs text-[#8B8D98] mt-0.5">{slot.hint}</p>
        </div>

        {asset && (
          <p className="text-xs text-[#6E7180]">
            {formatBytes(asset.size)} · updated {relativeTime(asset.updatedAt)}
          </p>
        )}

        {warning && (
          <p className="flex items-start gap-1.5 text-xs text-[#FBBF24]">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-px" /> {warning}
          </p>
        )}
        {done && !error && (
          <p className="flex items-center gap-1.5 text-xs text-[#4ADE80]" role="status">
            <CheckCircle2 className="w-3.5 h-3.5" /> Live on the website
          </p>
        )}
        <ErrorNote message={error} />

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <Button
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            disabled={!storageReady || uploading}
            className="text-xs"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            {asset ? 'Replace' : 'Upload'}
          </Button>
          {asset && (
            <Button variant="ghost" onClick={revert} loading={removing} disabled={uploading} className="text-xs">
              {!removing && <RotateCcw className="w-3.5 h-3.5" />}
              Revert to default
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export const MediaPage: React.FC = () => {
  const { onUnauthorized } = useAdmin();
  const [assets, setAssets] = useState<Record<string, MediaAsset> | null>(null);
  const [storageReady, setStorageReady] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .media()
      .then((res) => {
        setAssets(Object.fromEntries(res.assets.map((a) => [a.key, a])));
        setStorageReady(res.storageReady);
      })
      .catch((err) => {
        if (!onUnauthorized(err)) setError(err instanceof Error ? err.message : 'Could not load media.');
      });
  }, [onUnauthorized]);

  // A file dropped outside a drop zone would otherwise make the browser navigate away
  useEffect(() => {
    const block = (e: DragEvent) => e.preventDefault();
    window.addEventListener('dragover', block);
    window.addEventListener('drop', block);
    return () => {
      window.removeEventListener('dragover', block);
      window.removeEventListener('drop', block);
    };
  }, []);

  const onChange = useCallback((key: string, asset: MediaAsset | null) => {
    setAssets((prev) => {
      const next = { ...(prev ?? {}) };
      if (asset) next[key] = asset;
      else delete next[key];
      return next;
    });
  }, []);

  return (
    <>
      <PageHeader
        title="Website media"
        subtitle="Drag a new photo or video onto any card. Changes go live on the website within a few seconds."
      />
      <ErrorNote message={error} />
      {!storageReady && (
        <ErrorNote message="Media storage isn't connected yet (BLOB_READ_WRITE_TOKEN). Uploads are disabled until it is." />
      )}

      {assets === null && !error ? (
        <Spinner />
      ) : (
        <div className="space-y-10 mt-2">
          {SECTIONS.map((section) => (
            <section key={section.group} aria-labelledby={`media-${section.group}`}>
              <h2 id={`media-${section.group}`} className="text-base font-semibold text-[#ECEAE5]">
                {section.title}
              </h2>
              <p className="text-sm text-[#8B8D98] mb-4">{section.description}</p>
              <div className={`grid gap-4 ${section.columns}`}>
                {MEDIA_SLOTS.filter((s) => s.group === section.group).map((slot) => (
                  <MediaSlotCard
                    key={slot.key}
                    slot={slot}
                    asset={assets?.[slot.key]}
                    storageReady={storageReady}
                    onChange={onChange}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
};
