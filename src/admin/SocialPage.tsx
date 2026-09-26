import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Check,
  ClipboardCopy,
  Download,
  FileArchive,
  FileText,
  Film,
  Lightbulb,
  Music,
  Palette,
  PenLine,
  Play,
  Shuffle,
  SkipForward,
  Sparkles,
  Square,
  Trash2,
  X
} from 'lucide-react';
import { SocialPost, SocialPostStatus, VideoStyle } from '../types';
import { adminApi } from './api';
import { useAdmin } from './AdminApp';
import { Button, Card, ErrorNote, PageHeader, Spinner } from './ui';
import { loadSlideFonts, prepareSlide, renderSlide, SLIDE_H, SLIDE_SECONDS, SLIDE_W, slideToBlob } from './social/slideRenderer';
import { makeZip } from './social/zip';
import { fullCaption, newSeed, saveBlob, STATUS_STYLE } from './social/shared';
import { STYLE_NAMES, STYLES } from './video/themes';

type PostPatch = Partial<Pick<SocialPost, 'status' | 'style' | 'seed'>>;
const lookOf = (post: SocialPost) => ({ style: post.style, seed: post.seed });

const selectClass =
  'px-2 py-1.5 text-sm bg-[#0B0C10] border border-[#2E3040] rounded-md text-[#ECEAE5] outline-none focus:border-[#C9A96E] disabled:opacity-50';

const formatDay = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

// Draws the post's slides once the card scrolls near the screen (drawing 4 full-size slides is not free)
function useSlideImages(post: SocialPost, visible: boolean) {
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    const made: string[] = [];
    (async () => {
      await loadSlideFonts();
      for (const [i, slide] of post.slides.entries()) {
        const blob = await slideToBlob(slide, i, post.slides.length, lookOf(post));
        if (cancelled) return;
        made.push(URL.createObjectURL(blob));
        setUrls([...made]);
      }
    })().catch(() => undefined);
    return () => {
      cancelled = true;
      made.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [post, visible]);
  return urls;
}

// Live preview of the animated slides: small canvases looping the same animation as the MP4s,
// with the music looping in step when it is on
const AnimatedSlides: React.FC<{ post: SocialPost; music: boolean }> = ({ post, music }) => {
  const refs = useRef<(HTMLCanvasElement | null)[]>([]);
  useEffect(() => {
    let frame = 0;
    let cancelled = false;
    let audio: AudioContext | null = null;
    const scale = 0.4;
    (async () => {
      await loadSlideFonts();
      const buffer = music ? await import('./social/slideMusic').then((m) => m.slideMusic(post.seed)) : null;
      if (cancelled) return;
      if (buffer && typeof AudioContext !== 'undefined') {
        audio = new AudioContext();
        const source = audio.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(audio.destination);
        source.start();
      }
      const draws = post.slides.map((slide, i) => {
        const canvas = refs.current[i];
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return null;
        canvas.width = Math.round(SLIDE_W * scale);
        canvas.height = Math.round(SLIDE_H * scale);
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        return prepareSlide(ctx, slide, i, post.slides.length, lookOf(post));
      });
      const start = performance.now();
      const tick = (now: number) => {
        const t = ((now - start) / 1000) % SLIDE_SECONDS;
        draws.forEach((draw) => draw?.(t));
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      void audio?.close();
    };
  }, [post, music]);

  return (
    <>
      {post.slides.map((_, i) => (
        <div key={i} className="aspect-[4/5] rounded-md overflow-hidden bg-black border border-[#22232D]">
          <canvas
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="w-full h-full"
            aria-label={`Slide ${i + 1}, animated`}
          />
        </div>
      ))}
    </>
  );
};

const PostCard: React.FC<{
  post: SocialPost;
  onChange: (id: string, patch: PostPatch) => void;
  onDelete: (id: string) => void;
}> = ({ post, onChange, onDelete }) => {
  const onStatus = (id: string, status: SocialPostStatus) => onChange(id, { status });
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [music, setMusic] = useState(true);
  const [videoNote, setVideoNote] = useState<string | null>(null);
  const [videoJob, setVideoJob] = useState<{
    label: string;
    fraction: number;
  } | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const abort = useRef<AbortController | null>(null);
  const urls = useSlideImages(post, visible);
  const fileBase = `rmast-${post.day}-${
    post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'post'
  }`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), { rootMargin: '400px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const markDownloaded = () => {
    if (post.status === 'new') onStatus(post.id, 'downloaded');
  };

  const downloadSlide = async (i: number) => {
    await loadSlideFonts();
    saveBlob(await slideToBlob(post.slides[i], i, post.slides.length, lookOf(post)), `${fileBase}-slide-${i + 1}.png`);
    markDownloaded();
  };

  // Every slide as one page of a 4:5 PDF (also the format LinkedIn uses for carousel posts).
  // A PDF cannot animate, so animated slides appear as their finished frame, the same as the images.
  const downloadPdf = async () => {
    setPdfBusy(true);
    try {
      await loadSlideFonts();
      const { jsPDF } = await import('jspdf');
      const size: [number, number] = [540, 675]; // points; each page holds the full 1080x1350 slide
      const doc = new jsPDF({ unit: 'pt', format: size, compress: true });
      doc.setProperties({ title: post.title, author: 'RMAST Studio' });
      const canvas = document.createElement('canvas');
      for (const [i, slide] of post.slides.entries()) {
        renderSlide(canvas, slide, i, post.slides.length, lookOf(post));
        if (i > 0) doc.addPage(size);
        doc.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, size[0], size[1]);
      }
      saveBlob(doc.output('blob'), `${fileBase}.pdf`);
      markDownloaded();
    } finally {
      setPdfBusy(false);
    }
  };

  const downloadAll = async () => {
    setZipping(true);
    try {
      await loadSlideFonts();
      const entries = [];
      for (const [i, slide] of post.slides.entries()) {
        const blob = await slideToBlob(slide, i, post.slides.length, lookOf(post));
        entries.push({
          name: `slide-${i + 1}.png`,
          data: new Uint8Array(await blob.arrayBuffer())
        });
      }
      // UTF-8 byte-order mark so Windows apps show quotes and emojis correctly
      entries.push({
        name: 'caption.txt',
        data: new TextEncoder().encode(`﻿${fullCaption(post)}`)
      });
      saveBlob(makeZip(entries), `${fileBase}.zip`);
      markDownloaded();
    } finally {
      setZipping(false);
    }
  };

  // Animated slides as MP4 clips: one slide, or all of them in a ZIP with the caption
  const exportVideos = async (which: number | 'all') => {
    setVideoError(null);
    setVideoNote(null);
    const controller = new AbortController();
    abort.current = controller;
    const indexes = which === 'all' ? post.slides.map((_, i) => i) : [which];
    try {
      const { slideToMp4 } = await import('./social/animatedSlides');
      const entries = [];
      for (const [n, i] of indexes.entries()) {
        const label = indexes.length > 1 ? `Animating slide ${n + 1} of ${indexes.length}` : `Animating slide ${i + 1}`;
        const report = (f: number) => setVideoJob({ label, fraction: (n + f) / indexes.length });
        report(0);
        const { blob, withMusic } = await slideToMp4(post.slides[i], i, post.slides.length, lookOf(post), music, report, controller.signal);
        if (music && !withMusic) setVideoNote('This browser could not add the music, so the slides were saved without it. Chrome or Edge on a computer includes it.');
        if (which !== 'all') saveBlob(blob, `${fileBase}-slide-${i + 1}.mp4`);
        else
          entries.push({
            name: `slide-${i + 1}.mp4`,
            data: new Uint8Array(await blob.arrayBuffer())
          });
      }
      if (which === 'all') {
        entries.push({
          name: 'caption.txt',
          data: new TextEncoder().encode(`\uFEFF${fullCaption(post)}`)
        });
        saveBlob(makeZip(entries), `${fileBase}-animated.zip`);
      }
      markDownloaded();
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setVideoError(err instanceof Error ? err.message : 'The export failed. Please try again.');
      }
    } finally {
      setVideoJob(null);
      abort.current = null;
    }
  };

  const shuffleLook = () => {
    const others = STYLES.filter((s) => s !== post.style);
    onChange(post.id, {
      style: others[Math.floor(Math.random() * others.length)],
      seed: newSeed()
    });
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(fullCaption(post));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the caption is selectable below
    }
  };

  const status = STATUS_STYLE[post.status];

  return (
    <Card className="overflow-hidden">
      <div ref={ref} className="p-5 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#A6A8B3]">{formatDay(post.day)}</span>
              <span className={`px-2 py-0.5 rounded-full border ${status.className}`}>{status.label}</span>
              <span className="px-2 py-0.5 rounded-full border border-[#2E3040] text-[#A6A8B3]">{post.pillar}</span>
              <span className="px-2 py-0.5 rounded-full border border-[#2E3040] text-[#8B8D98]">{post.slides.length} slides</span>
              {!post.auto && !post.brief && (
                <span className="px-2 py-0.5 rounded-full border border-[#2E3040] text-[#8B8D98]">Extra idea</span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-[#ECEAE5]">{post.title}</h2>
            {post.brief && (
              <details className="text-sm text-[#8B8D98]">
                <summary className="cursor-pointer select-none text-[#A6A8B3]">Your idea</summary>
                <p className="mt-1.5 whitespace-pre-line pl-4 border-l border-[#2E3040]">{post.brief}</p>
              </details>
            )}
            {post.angle && (
              <p className="text-sm text-[#8B8D98] flex gap-1.5">
                <Lightbulb className="w-4 h-4 mt-0.5 shrink-0 text-[#C9A96E]" />
                <span>{post.angle}</span>
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={downloadAll} loading={zipping}>
              <FileArchive className="w-4 h-4" />
              Download all
            </Button>
            <Button onClick={downloadPdf} loading={pdfBusy} title="All slides in one PDF, one slide per page">
              <FileText className="w-4 h-4" />
              Download PDF
            </Button>
            <Button onClick={() => exportVideos('all')} disabled={videoJob !== null} title="Each slide as a short MP4 with animated text">
              <Film className="w-4 h-4" />
              Download animated
            </Button>
            {post.status !== 'posted' ? (
              <Button onClick={() => onStatus(post.id, 'posted')}>
                <Check className="w-4 h-4" />
                Mark posted
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => onStatus(post.id, 'downloaded')}>
                Undo posted
              </Button>
            )}
            {post.status !== 'skipped' && post.status !== 'posted' && (
              <Button variant="ghost" onClick={() => onStatus(post.id, 'skipped')} title="Skip this idea">
                <SkipForward className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" onClick={() => onDelete(post.id)} title="Delete this idea" aria-label="Delete this idea">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Look and animation: change any time without rewriting the post */}
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-[#A6A8B3]">
            <Palette className="w-3.5 h-3.5" />
            <select
              value={post.style}
              disabled={videoJob !== null}
              onChange={(e) => onChange(post.id, { style: e.target.value as VideoStyle })}
              className={selectClass}
              aria-label="Look"
            >
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {STYLE_NAMES[s]}
                </option>
              ))}
            </select>
          </label>
          <Button variant="ghost" onClick={shuffleLook} disabled={videoJob !== null} title="Random look and variation">
            <Shuffle className="w-4 h-4" />
            Shuffle look
          </Button>
          <Button variant="ghost" onClick={() => setAnimate((a) => !a)} title="Preview the text animation">
            {animate ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {animate ? 'Stop preview' : 'Preview animation'}
          </Button>
          <label className="flex items-center gap-2 text-xs text-[#A6A8B3] cursor-pointer select-none" title="Soft background music in the animated slides">
            <input
              type="checkbox"
              checked={music}
              onChange={(e) => setMusic(e.target.checked)}
              disabled={videoJob !== null}
              className="accent-[#C9A96E] w-3.5 h-3.5"
            />
            <Music className="w-3.5 h-3.5" />
            Peaceful music
          </label>
        </div>

        {videoJob && (
          <div className="flex items-center gap-3 text-xs text-[#A6A8B3]">
            <div className="flex-1 h-1.5 rounded-full bg-[#22232D] overflow-hidden">
              <div className="h-full bg-[#C9A96E]" style={{ width: `${Math.round(videoJob.fraction * 100)}%` }} />
            </div>
            <span className="shrink-0">
              {videoJob.label}… {Math.round(videoJob.fraction * 100)}%
            </span>
            <button onClick={() => abort.current?.abort()} className="shrink-0 hover:text-[#ECEAE5] cursor-pointer" aria-label="Cancel">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <ErrorNote message={videoError} />
        {videoNote && <p className="text-xs text-[#A6A8B3]">{videoNote}</p>}

        {/* Slides */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${post.slides.length > 4 ? 'xl:grid-cols-5' : ''}`}>
          {animate ? (
            <AnimatedSlides post={post} music={music} />
          ) : (
            post.slides.map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[4/5] rounded-md overflow-hidden bg-black border border-[#22232D]">
                  {urls[i] ? (
                    <img src={urls[i]} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-xs text-[#6E7180]">Drawing…</div>
                  )}
                </div>
                <div className="flex">
                  <button
                    onClick={() => downloadSlide(i)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-[#A6A8B3] hover:text-[#ECEAE5] py-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Slide {i + 1}
                  </button>
                  <button
                    onClick={() => exportVideos(i)}
                    disabled={videoJob !== null}
                    title={`Slide ${i + 1} as an animated MP4`}
                    className="inline-flex items-center gap-1 px-1.5 text-xs text-[#A6A8B3] hover:text-[#ECEAE5] py-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Film className="w-3.5 h-3.5" />
                    MP4
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Caption */}
        <div className="rounded-md border border-[#22232D] bg-[#0B0C10]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#22232D]">
            <span className="text-xs font-medium text-[#A6A8B3]">Caption</span>
            <button
              onClick={copyCaption}
              className="inline-flex items-center gap-1.5 text-xs text-[#C9A96E] hover:text-[#E3C88E] cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <ClipboardCopy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy caption'}
            </button>
          </div>
          <p className="px-4 py-3 text-sm text-[#D4D4D8] whitespace-pre-line leading-relaxed select-text">{fullCaption(post)}</p>
        </div>
      </div>
    </Card>
  );
};

const SLIDE_CHOICES = ['auto', 4, 5, 6, 7, 8, 9, 10] as const;
const MAX_IDEA_LENGTH = 5000;

// The founder's own idea (or ready-written slide text and caption) turned into a post
const IdeaComposer: React.FC<{
  disabled: boolean;
  onCreated: (post: SocialPost) => void;
  onError: (err: unknown) => void;
}> = ({ disabled, onCreated, onError }) => {
  const [brief, setBrief] = useState('');
  const [slides, setSlides] = useState<(typeof SLIDE_CHOICES)[number]>('auto');
  const [look, setLook] = useState<VideoStyle | 'surprise'>('surprise');
  const [busy, setBusy] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (brief.trim().length < 10 || busy) return;
    setBusy(true);
    try {
      onCreated(await adminApi.socialFromIdea(brief.trim(), slides, look));
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
            <PenLine className="w-4 h-4 text-[#C9A96E]" />
            Create from your idea
          </h2>
          <p className="text-xs text-[#8B8D98] mt-0.5">
            Describe an idea, or paste your own slide text and caption. Your wording is kept; anything missing is written for you.
          </p>
        </div>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          maxLength={MAX_IDEA_LENGTH}
          rows={6}
          disabled={disabled || busy}
          aria-label="Your post idea"
          placeholder={
            'e.g. "Why most listing reels get views but no buyers: show what buyers actually want"\n\n' +
            'Or paste slides:\nSlide 1: Your listing reel got 8,000 views. Not one was a buyer.\nSlide 2: ...'
          }
          className="w-full px-3 py-2 text-sm bg-[#0B0C10] border border-[#2E3040] rounded-md text-[#ECEAE5] placeholder:text-[#6E7180] outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E]/40 resize-y"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-[#A6A8B3]">
            Slides
            <select
              value={String(slides)}
              onChange={(e) => setSlides(e.target.value === 'auto' ? 'auto' : (Number(e.target.value) as (typeof SLIDE_CHOICES)[number]))}
              disabled={disabled || busy}
              className="px-2 py-1.5 text-sm bg-[#0B0C10] border border-[#2E3040] rounded-md text-[#ECEAE5] outline-none focus:border-[#C9A96E]"
            >
              {SLIDE_CHOICES.map((c) => (
                <option key={c} value={String(c)}>
                  {c === 'auto' ? 'Auto (fits the idea)' : `${c} slides`}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-[#A6A8B3]">
            Look
            <select
              value={look}
              onChange={(e) => setLook(e.target.value as VideoStyle | 'surprise')}
              disabled={disabled || busy}
              className={selectClass}
            >
              <option value="surprise">Surprise me (random)</option>
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {STYLE_NAMES[s]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-[#6E7180]">
              {busy ? 'Creating your post… up to 30 seconds' : `${brief.length.toLocaleString()} / ${MAX_IDEA_LENGTH.toLocaleString()}`}
            </span>
            <Button type="submit" variant="primary" loading={busy} disabled={disabled || brief.trim().length < 10}>
              <Sparkles className="w-4 h-4" />
              Create post
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export const SocialPage: React.FC = () => {
  const { onUnauthorized } = useAdmin();
  const [posts, setPosts] = useState<SocialPost[] | null>(null);
  const [ready, setReady] = useState(true);
  const [autoPost, setAutoPostState] = useState(false);
  const [savingAuto, setSavingAuto] = useState(false);
  const [writingToday, setWritingToday] = useState(false);
  const [writingExtra, setWritingExtra] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Held in a ref so the one-time load below never re-runs (and re-requests) on re-render
  const unauthorizedRef = useRef(onUnauthorized);
  unauthorizedRef.current = onUnauthorized;
  const fail = useCallback((err: unknown, fallback: string) => {
    if (!unauthorizedRef.current(err)) setError(err instanceof Error && err.message ? err.message : fallback);
  }, []);

  const addPost = (post: SocialPost) => setPosts((prev) => (prev?.some((p) => p.id === post.id) ? prev : [post, ...(prev ?? [])]));

  // Load the list; with daily auto post on, also make sure today's idea exists
  // (written now if the daily job hasn't run yet)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { posts: list, ready: ok, autoPost: on } = await adminApi.socialPosts();
        if (cancelled) return;
        setPosts(list);
        setReady(ok);
        setAutoPostState(on);
        if (!ok || !on) return;
        setWritingToday(true);
        const today = await adminApi.socialToday();
        if (!cancelled) addPost(today);
      } catch (err) {
        if (!cancelled) fail(err, "Couldn't load post ideas.");
      } finally {
        if (!cancelled) setWritingToday(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fail]);

  const newIdea = async () => {
    setWritingExtra(true);
    setError(null);
    try {
      addPost(await adminApi.socialExtra());
    } catch (err) {
      fail(err, "Couldn't write a new idea. Please try again.");
    } finally {
      setWritingExtra(false);
    }
  };

  const toggleAutoPost = async () => {
    const on = !autoPost;
    setSavingAuto(true);
    setError(null);
    try {
      await adminApi.setAutoPost(on);
      setAutoPostState(on);
      if (on && ready) {
        // Switched on: write today's idea straight away
        setWritingToday(true);
        addPost(await adminApi.socialToday());
      }
    } catch (err) {
      fail(err, "Couldn't change the daily auto post setting.");
    } finally {
      setSavingAuto(false);
      setWritingToday(false);
    }
  };

  const change = async (id: string, patch: PostPatch) => {
    setPosts((prev) => prev?.map((p) => (p.id === id ? { ...p, ...patch } : p)) ?? prev);
    try {
      await adminApi.updateSocialPost(id, patch);
    } catch (err) {
      fail(err, "Couldn't update the post.");
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this post idea?')) return;
    try {
      await adminApi.deleteSocialPost(id);
      setPosts((prev) => prev?.filter((p) => p.id !== id) ?? prev);
    } catch (err) {
      fail(err, "Couldn't delete the post.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Social posts"
        subtitle="Create Instagram carousels from your own ideas, or switch on daily auto post for a fresh idea every day."
        action={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={autoPost}
              onClick={toggleAutoPost}
              disabled={savingAuto || posts === null}
              title={autoPost ? 'A new idea is written every day' : 'Only posts you create are made'}
              className="inline-flex items-center gap-2.5 text-sm text-[#A6A8B3] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span
                className={`relative w-10 h-6 rounded-full border transition-colors ${autoPost ? 'bg-[#C9A96E] border-[#C9A96E]' : 'bg-[#16171F] border-[#2E3040]'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-[18px] h-[18px] rounded-full transition-transform ${autoPost ? 'translate-x-4 bg-[#0B0C10]' : 'bg-[#6E7180]'}`}
                />
              </span>
              Daily auto post {autoPost ? 'on' : 'off'}
            </button>
            <Button variant="primary" onClick={newIdea} loading={writingExtra} disabled={!ready || writingToday}>
              <Sparkles className="w-4 h-4" />
              New idea
            </Button>
          </div>
        }
      />

      <ErrorNote message={error} />
      {!ready && (
        <Card className="p-5 mb-5 text-sm text-[#A6A8B3]">
          Post ideas need the Gemini API key. Add <code className="text-[#C9A96E]">GEMINI_API_KEY</code> to the environment variables and
          redeploy.
        </Card>
      )}

      {ready && (
        <IdeaComposer
          disabled={writingToday}
          onCreated={(post) => {
            setError(null);
            addPost(post);
          }}
          onError={(err) => fail(err, "Couldn't create the post. Please try again.")}
        />
      )}

      {writingToday && (
        <Card className="p-5 mb-5 flex items-center gap-3 text-sm text-[#A6A8B3]">
          <Sparkles className="w-4 h-4 text-[#C9A96E] animate-pulse" />
          Writing today's idea… this takes about 15 seconds.
        </Card>
      )}

      {posts === null ? (
        <Spinner label="Loading post ideas…" />
      ) : posts.length === 0 && !writingToday ? (
        <Card className="p-8 text-center text-sm text-[#8B8D98]">No posts yet. Create one from your idea above, or press "New idea".</Card>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onChange={change} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
};
