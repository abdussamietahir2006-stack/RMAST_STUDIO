import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, ClipboardCopy, Clapperboard, Download, Lightbulb, Music, Pause, Play, Shuffle, Sparkles, Trash2, X } from 'lucide-react';
import { MusicMood, SocialVideo, VideoScene, VideoStyle } from '../types';
import { adminApi } from './api';
import { useAdmin } from './AdminApp';
import { Button, Card, ErrorNote, PageHeader, Spinner } from './ui';
import { VIDEO_H, VIDEO_W, VideoEngine } from './video/engine';
import { STYLE_NAMES, STYLES } from './video/themes';
import { loadSlideFonts } from './social/slideRenderer';
import { fileSlug, fullCaption, saveBlob, STATUS_STYLE } from './social/shared';

// Reel length in whole seconds
const MIN_SECONDS = 10;
const MAX_SECONDS = 60;
const MAX_IDEA_LENGTH = 5000;
const PREVIEW_SCALE = 0.5; // preview canvas is 540x960, shown at 270x480 (sharp on high-DPI screens)

const MUSIC_NAMES: Record<MusicMood, string> = {
  peaceful: 'Peaceful (calm, ambient)',
  uplifting: 'Uplifting (warm, positive)',
  blazing: 'Blazing (energetic, punchy)',
  none: 'No music'
};
const MUSIC_OPTIONS: MusicMood[] = ['peaceful', 'uplifting', 'blazing', 'none'];

const SCENE_LABEL: Record<VideoScene['type'], string> = {
  hook: 'Hook',
  statement: 'Statement',
  list: 'List',
  stat: 'Number',
  tags: 'Tags',
  compare: 'Before / after',
  steps: 'Steps',
  cta: 'Call to action'
};

const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const newSeed = () => 1 + Math.floor(Math.random() * 2_000_000_000);

const selectClass =
  'px-2 py-1.5 text-sm bg-[#0B0C10] border border-[#2E3040] rounded-md text-[#ECEAE5] outline-none focus:border-[#C9A96E] disabled:opacity-50';

// Composed tracks are kept per video, mood and variation, so replaying doesn't recompose
const musicCache = new Map<string, Promise<AudioBuffer | null>>();
function musicFor(video: SocialVideo): Promise<AudioBuffer | null> {
  const key = `${video.id}|${video.music}|${video.seed}`;
  let track = musicCache.get(key);
  if (!track) {
    track = import('./video/music').then((m) => m.composeMusic(video.music, video.scenes, video.seed));
    musicCache.set(key, track);
  }
  return track;
}

// Live preview: the same engine as the export, drawn at half size, with the composed music
const ReelPlayer: React.FC<{ video: SocialVideo }> = ({ video }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engine = useRef<VideoEngine | null>(null);
  const [time, setTime] = useState(1.2);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [composing, setComposing] = useState(false);
  const timeRef = useRef(time);
  timeRef.current = time;
  const audio = useRef<{ ctx: AudioContext | null; src: AudioBufferSourceNode | null; buffer: AudioBuffer | null }>({ ctx: null, src: null, buffer: null });

  const stopAudio = () => {
    audio.current.src?.stop();
    audio.current.src = null;
  };
  const startAudio = (at: number) => {
    stopAudio();
    const { buffer } = audio.current;
    if (!buffer) return;
    const ctx = (audio.current.ctx ??= new AudioContext());
    void ctx.resume();
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    src.start(0, Math.min(at, buffer.duration - 0.01));
    audio.current.src = src;
  };

  // A new look, variation or script means a new engine (and new music)
  useEffect(() => {
    let cancelled = false;
    setPlaying(false);
    stopAudio();
    audio.current.buffer = null;
    loadSlideFonts().then(() => {
      if (cancelled) return;
      engine.current = new VideoEngine(video.scenes, PREVIEW_SCALE, video.style, video.seed);
      setReady(true);
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) engine.current.draw(ctx, timeRef.current);
    });
    return () => {
      cancelled = true;
    };
  }, [video.scenes, video.style, video.seed, video.music]);

  useEffect(() => () => {
    stopAudio();
    void audio.current.ctx?.close();
  }, []);

  // Paint the current frame whenever the time changes
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ready && ctx && engine.current) engine.current.draw(ctx, time);
  }, [time, ready]);

  useEffect(() => {
    if (!playing || !engine.current) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      let next = timeRef.current + (now - last) / 1000;
      last = now;
      if (next >= engine.current!.duration) {
        next = 0;
        startAudio(0);
      }
      setTime(next);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const play = async () => {
    if (playing) {
      setPlaying(false);
      stopAudio();
      return;
    }
    if (video.music !== 'none' && !audio.current.buffer) {
      setComposing(true);
      audio.current.buffer = await musicFor(video).catch(() => null);
      setComposing(false);
    }
    startAudio(timeRef.current);
    setPlaying(true);
  };

  const duration = engine.current?.duration ?? video.scenes.reduce((n, s) => n + s.duration, 0);

  return (
    <div className="space-y-2 w-[270px] shrink-0">
      <div className="relative rounded-lg overflow-hidden border border-[#22232D] bg-black" style={{ width: 270, height: 480 }}>
        <canvas
          ref={canvasRef}
          width={Math.round(VIDEO_W * PREVIEW_SCALE)}
          height={Math.round(VIDEO_H * PREVIEW_SCALE)}
          style={{ width: 270, height: 480 }}
          onClick={() => ready && !composing && play()}
          className="cursor-pointer"
        />
        {(!ready || composing) && (
          <div className="absolute inset-0 grid place-items-center text-xs text-[#ECEAE5] bg-black/40">
            {composing ? 'Composing music…' : 'Loading preview…'}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={play}
          disabled={!ready || composing}
          className="p-1.5 rounded-md text-[#ECEAE5] hover:bg-[#16171F] cursor-pointer disabled:opacity-40"
          aria-label={playing ? 'Pause preview' : 'Play preview'}
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={duration}
          step={0.01}
          value={time}
          onChange={(e) => {
            const t = Number(e.target.value);
            setTime(t);
            if (playing) startAudio(t);
          }}
          className="flex-1 accent-[#C9A96E]"
          aria-label="Preview position"
        />
        <span className="text-xs tabular-nums text-[#8B8D98] w-[74px] text-right">
          {formatTime(time)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

const VideoCard: React.FC<{
  video: SocialVideo;
  onChange: (id: string, patch: Partial<Pick<SocialVideo, 'status' | 'style' | 'seed' | 'music'>>) => void;
  onDelete: (id: string) => void;
}> = ({ video, onChange, onDelete }) => {
  const [progress, setProgress] = useState<number | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportNote, setExportNote] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const status = STATUS_STYLE[video.status];

  const exportMp4 = async () => {
    setExportError(null);
    setExportNote(null);
    setProgress(0);
    abort.current = new AbortController();
    try {
      const { exportReelMp4 } = await import('./video/exportMp4');
      const { blob, withMusic } = await exportReelMp4(video, setProgress, abort.current.signal);
      saveBlob(blob, `rmast-reel-${fileSlug(video.title)}.mp4`);
      if (video.music !== 'none' && !withMusic) setExportNote('This browser could not add the music, so the video was saved without it. Chrome or Edge on a computer includes it.');
      if (video.status === 'new') onChange(video.id, { status: 'downloaded' });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setExportError(err instanceof Error ? err.message : 'The export failed. Please try again.');
      }
    } finally {
      setProgress(null);
      abort.current = null;
    }
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(fullCaption(video));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the caption is selectable below
    }
  };

  const shuffleLook = () => {
    const others = STYLES.filter((s) => s !== video.style);
    onChange(video.id, { style: others[Math.floor(Math.random() * others.length)], seed: newSeed() });
  };

  const exporting = progress !== null;

  return (
    <Card className="p-5">
      <div className="flex flex-col lg:flex-row gap-6">
        <ReelPlayer video={video} />

        <div className="flex-1 min-w-0 space-y-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#A6A8B3]">
                {new Date(video.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className={`px-2 py-0.5 rounded-full border ${status.className}`}>{status.label}</span>
              <span className="px-2 py-0.5 rounded-full border border-[#2E3040] text-[#8B8D98]">
                {Math.round(video.scenes.reduce((n, s) => n + s.duration, 0))}s · {video.scenes.length} scenes · 1080×1920
              </span>
            </div>
            <h2 className="text-lg font-semibold text-[#ECEAE5]">{video.title}</h2>
            <details className="text-sm text-[#8B8D98]">
              <summary className="cursor-pointer select-none text-[#A6A8B3]">Your idea</summary>
              <p className="mt-1.5 whitespace-pre-line pl-4 border-l border-[#2E3040]">{video.brief}</p>
            </details>
            {video.angle && (
              <p className="text-sm text-[#8B8D98] flex gap-1.5">
                <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-[#C9A96E]" />
                <span>{video.angle}</span>
              </p>
            )}
            {video.notFollowed && (
              <p className="text-sm text-[#F5C26B] flex gap-1.5">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Could not be applied exactly: {video.notFollowed}</span>
              </p>
            )}
          </div>

          {/* Look and music: change any time without rewriting the script */}
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 text-xs text-[#A6A8B3]">
              Look
              <select
                value={video.style}
                disabled={exporting}
                onChange={(e) => onChange(video.id, { style: e.target.value as VideoStyle })}
                className={selectClass}
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {STYLE_NAMES[s]}
                  </option>
                ))}
              </select>
            </label>
            <Button variant="ghost" onClick={shuffleLook} disabled={exporting} title="Random look and variation">
              <Shuffle className="w-4 h-4" />
              Shuffle look
            </Button>
            <label className="flex items-center gap-2 text-xs text-[#A6A8B3]">
              <Music className="w-3.5 h-3.5" />
              <select
                value={video.music}
                disabled={exporting}
                onChange={(e) => onChange(video.id, { music: e.target.value as MusicMood })}
                className={selectClass}
                aria-label="Music"
              >
                {MUSIC_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {MUSIC_NAMES[m]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!exporting ? (
              <Button variant="primary" onClick={exportMp4}>
                <Download className="w-4 h-4" />
                Export MP4
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-48 h-2 rounded-full bg-[#1A1B24] overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress * 100)}>
                  <div className="h-full bg-[#C9A96E] transition-[width]" style={{ width: `${progress * 100}%` }} />
                </div>
                <span className="text-xs text-[#A6A8B3] tabular-nums">
                  {progress === 0 && video.music !== 'none' ? 'Composing music…' : `Rendering ${Math.round(progress * 100)}%`}
                </span>
                <Button variant="ghost" onClick={() => abort.current?.abort()} aria-label="Cancel export">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
            {video.status !== 'posted' ? (
              <Button onClick={() => onChange(video.id, { status: 'posted' })}>
                <Check className="w-4 h-4" />
                Mark posted
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => onChange(video.id, { status: 'downloaded' })}>
                Undo posted
              </Button>
            )}
            <Button variant="ghost" onClick={() => onDelete(video.id)} title="Delete this video" aria-label="Delete this video">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <ErrorNote message={exportError} />
          {exportNote && <p className="text-xs text-[#C9A96E]">{exportNote}</p>}

          {/* Scene plan */}
          <ol className="rounded-md border border-[#22232D] divide-y divide-[#22232D] text-sm">
            {video.scenes.map((s, i) => (
              <li key={i} className="flex gap-3 px-3 py-2">
                <span className="w-24 shrink-0 text-xs text-[#8B8D98] pt-0.5">
                  {i + 1}. {SCENE_LABEL[s.type]}
                  <br />
                  {s.duration.toFixed(1)}s
                </span>
                <span className="text-[#D4D4D8] min-w-0">
                  {[s.headline, s.highlight].filter(Boolean).join(' ')}
                  {s.type === 'stat' && ` (${s.statPrefix}${s.statValue.toLocaleString()}${s.statSuffix})`}
                  {s.items.length > 0 && <span className="text-[#8B8D98]"> · {s.items.map((it) => it.label).join(', ')}</span>}
                </span>
              </li>
            ))}
          </ol>

          {/* Caption */}
          <div className="rounded-md border border-[#22232D] bg-[#0B0C10]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#22232D]">
              <span className="text-xs font-medium text-[#A6A8B3]">Caption</span>
              <button onClick={copyCaption} className="inline-flex items-center gap-1.5 text-xs text-[#C9A96E] hover:text-[#E3C88E] cursor-pointer">
                {copied ? <Check className="w-3.5 h-3.5" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy caption'}
              </button>
            </div>
            <p className="px-4 py-3 text-sm text-[#D4D4D8] whitespace-pre-line leading-relaxed select-text">{fullCaption(video)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

const VideoComposer: React.FC<{ onCreated: (v: SocialVideo) => void; onError: (err: unknown) => void }> = ({ onCreated, onError }) => {
  const [brief, setBrief] = useState('');
  const [seconds, setSeconds] = useState(30);
  const [look, setLook] = useState<VideoStyle | 'surprise'>('surprise');
  const [music, setMusic] = useState<MusicMood>('uplifting');
  const [busy, setBusy] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (brief.trim().length < 10 || busy) return;
    setBusy(true);
    try {
      onCreated(await adminApi.createVideo(brief.trim(), seconds, look, music));
      setBrief('');
    } catch (err) {
      onError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-5 mb-5">
      <form onSubmit={create} className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-[#ECEAE5] flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-[#C9A96E]" />
            Create a reel from your idea
          </h2>
          <p className="text-xs text-[#8B8D98] mt-0.5">
            Describe the video, or paste your own lines scene by scene. Your wording is kept; anything missing is written for you.
          </p>
        </div>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          maxLength={MAX_IDEA_LENGTH}
          rows={6}
          disabled={busy}
          aria-label="Your video idea"
          placeholder={
            'e.g. "What a $500 website from us actually includes, shown as a fast reveal for real estate agents"\n\n' +
            'Or paste lines:\nScene 1: Your listing reel got 8,000 views. Not one was a buyer.\nScene 2: ...'
          }
          className="w-full px-3 py-2 text-sm bg-[#0B0C10] border border-[#2E3040] rounded-md text-[#ECEAE5] placeholder:text-[#6E7180] outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E]/40 resize-y"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-[#A6A8B3]">
              Length
              <input
                type="range"
                min={MIN_SECONDS}
                max={MAX_SECONDS}
                step={1}
                value={seconds}
                onChange={(e) => setSeconds(Number(e.target.value))}
                disabled={busy}
                aria-label="Length in seconds"
                className="w-32 accent-[#C9A96E]"
              />
              <span className="w-12 tabular-nums text-[#ECEAE5]">{seconds} s</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#A6A8B3]">
              Look
              <select value={look} onChange={(e) => setLook(e.target.value as VideoStyle | 'surprise')} disabled={busy} className={selectClass}>
                <option value="surprise">Surprise me (random)</option>
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {STYLE_NAMES[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-xs text-[#A6A8B3]">
              Music
              <select value={music} onChange={(e) => setMusic(e.target.value as MusicMood)} disabled={busy} className={selectClass}>
                {MUSIC_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {MUSIC_NAMES[m]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#6E7180]">
              {busy ? 'Writing the script… up to 30 seconds' : `${brief.length.toLocaleString()} / ${MAX_IDEA_LENGTH.toLocaleString()}`}
            </span>
            <Button type="submit" variant="primary" loading={busy} disabled={brief.trim().length < 10}>
              <Sparkles className="w-4 h-4" />
              Create video
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export const VideosPage: React.FC = () => {
  const { onUnauthorized } = useAdmin();
  const [videos, setVideos] = useState<SocialVideo[] | null>(null);
  const [ready, setReady] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const unauthorizedRef = useRef(onUnauthorized);
  unauthorizedRef.current = onUnauthorized;
  const fail = useCallback((err: unknown, fallback: string) => {
    if (!unauthorizedRef.current(err)) setError(err instanceof Error && err.message ? err.message : fallback);
  }, []);

  useEffect(() => {
    let cancelled = false;
    adminApi
      .socialVideos()
      .then(({ videos: list, ready: ok }) => {
        if (cancelled) return;
        setVideos(list);
        setReady(ok);
      })
      .catch((err) => !cancelled && fail(err, "Couldn't load videos."));
    return () => {
      cancelled = true;
    };
  }, [fail]);

  const change = async (id: string, patch: Partial<Pick<SocialVideo, 'status' | 'style' | 'seed' | 'music'>>) => {
    setVideos((prev) => prev?.map((v) => (v.id === id ? { ...v, ...patch } : v)) ?? prev);
    try {
      await adminApi.updateVideo(id, patch);
    } catch (err) {
      fail(err, "Couldn't update the video.");
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this video?')) return;
    try {
      await adminApi.deleteVideo(id);
      setVideos((prev) => prev?.filter((v) => v.id !== id) ?? prev);
    } catch (err) {
      fail(err, "Couldn't delete the video.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Social videos"
        subtitle="10–60 second motion-graphics reels (1080×1920) with original music, made from your idea. Pick a look, preview, export the MP4, post."
      />
      <ErrorNote message={error} />
      {!ready && (
        <Card className="p-5 mb-5 text-sm text-[#A6A8B3]">
          Videos need the Gemini API key. Add <code className="text-[#C9A96E]">GEMINI_API_KEY</code> to the environment variables and redeploy.
        </Card>
      )}
      {ready && (
        <VideoComposer
          onCreated={(v) => {
            setError(null);
            setVideos((prev) => [v, ...(prev ?? [])]);
          }}
          onError={(err) => fail(err, "Couldn't write the video. Please try again.")}
        />
      )}
      {videos === null ? (
        <Spinner label="Loading videos…" />
      ) : videos.length === 0 ? (
        <Card className="p-8 text-center text-sm text-[#8B8D98]">No videos yet. Describe your first reel above.</Card>
      ) : (
        <div className="space-y-5">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} onChange={change} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
};
