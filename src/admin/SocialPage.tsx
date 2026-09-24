import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, ClipboardCopy, Download, FileArchive, Lightbulb, PenLine, SkipForward, Sparkles, Trash2 } from 'lucide-react';
import { SocialPost, SocialPostStatus } from '../types';
import { adminApi } from './api';
import { useAdmin } from './AdminApp';
import { Button, Card, ErrorNote, PageHeader, Spinner } from './ui';
import { loadSlideFonts, slideToBlob } from './social/slideRenderer';
import { makeZip } from './social/zip';

const STATUS_STYLE: Record<SocialPostStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-[#A68BFF]/15 text-[#C9B8FF] border-[#A68BFF]/40' },
  downloaded: { label: 'Downloaded', className: 'bg-[#3DDCFF]/10 text-[#86E8FF] border-[#3DDCFF]/35' },
  posted: { label: 'Posted', className: 'bg-[#10B981]/12 text-[#6EE7B7] border-[#10B981]/40' },
  skipped: { label: 'Skipped', className: 'bg-[#2A2B36] text-[#8B8D98] border-[#3A3B48]' }
};

const fullCaption = (post: SocialPost) =>
  `${post.caption}${post.hashtags.length ? `\n\n${post.hashtags.map((h) => `#${h}`).join(' ')}` : ''}`;

const formatDay = (day: string) =>
  new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

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
        const blob = await slideToBlob(slide, i, post.slides.length);
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

const PostCard: React.FC<{
  post: SocialPost;
  onStatus: (id: string, status: SocialPostStatus) => void;
  onDelete: (id: string) => void;
}> = ({ post, onStatus, onDelete }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [zipping, setZipping] = useState(false);
  const urls = useSlideImages(post, visible);
  const fileBase = `rmast-${post.day}-${post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'post'}`;

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
    saveBlob(await slideToBlob(post.slides[i], i, post.slides.length), `${fileBase}-slide-${i + 1}.png`);
    markDownloaded();
  };

  const downloadAll = async () => {
    setZipping(true);
    try {
      await loadSlideFonts();
      const entries = [];
      for (const [i, slide] of post.slides.entries()) {
        const blob = await slideToBlob(slide, i, post.slides.length);
        entries.push({ name: `slide-${i + 1}.png`, data: new Uint8Array(await blob.arrayBuffer()) });
      }
      // UTF-8 byte-order mark so Windows apps show quotes and emojis correctly
      entries.push({ name: 'caption.txt', data: new TextEncoder().encode(`﻿${fullCaption(post)}`) });
      saveBlob(makeZip(entries), `${fileBase}.zip`);
      markDownloaded();
    } finally {
      setZipping(false);
    }
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
              {!post.auto && !post.brief && <span className="px-2 py-0.5 rounded-full border border-[#2E3040] text-[#8B8D98]">Extra idea</span>}
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

        {/* Slides */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 ${post.slides.length > 4 ? 'xl:grid-cols-5' : ''}`}>
          {post.slides.map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[4/5] rounded-md overflow-hidden bg-black border border-[#22232D]">
                {urls[i] ? (
                  <img src={urls[i]} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-xs text-[#6E7180]">Drawing…</div>
                )}
              </div>
              <button
                onClick={() => downloadSlide(i)}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs text-[#A6A8B3] hover:text-[#ECEAE5] py-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Slide {i + 1}
              </button>
            </div>
          ))}
        </div>

        {/* Caption */}
        <div className="rounded-md border border-[#22232D] bg-[#0B0C10]">
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#22232D]">
            <span className="text-xs font-medium text-[#A6A8B3]">Caption</span>
            <button onClick={copyCaption} className="inline-flex items-center gap-1.5 text-xs text-[#C9A96E] hover:text-[#E3C88E] cursor-pointer">
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
const IdeaComposer: React.FC<{ disabled: boolean; onCreated: (post: SocialPost) => void; onError: (err: unknown) => void }> = ({
  disabled,
  onCreated,
  onError
}) => {
  const [brief, setBrief] = useState('');
  const [slides, setSlides] = useState<(typeof SLIDE_CHOICES)[number]>('auto');
  const [busy, setBusy] = useState(false);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (brief.trim().length < 10 || busy) return;
    setBusy(true);
    try {
      onCreated(await adminApi.socialFromIdea(brief.trim(), slides));
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
          <div className="flex items-center gap-3">
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
  const [writingToday, setWritingToday] = useState(false);
  const [writingExtra, setWritingExtra] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Held in a ref so the one-time load below never re-runs (and re-requests) on re-render
  const unauthorizedRef = useRef(onUnauthorized);
  unauthorizedRef.current = onUnauthorized;
  const fail = useCallback((err: unknown, fallback: string) => {
    if (!unauthorizedRef.current(err)) setError(err instanceof Error && err.message ? err.message : fallback);
  }, []);

  const addPost = (post: SocialPost) =>
    setPosts((prev) => (prev?.some((p) => p.id === post.id) ? prev : [post, ...(prev ?? [])]));

  // Load the list, then make sure today's idea exists (written now if the daily job hasn't run yet)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { posts: list, ready: ok } = await adminApi.socialPosts();
        if (cancelled) return;
        setPosts(list);
        setReady(ok);
        if (!ok) return;
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

  const setStatus = async (id: string, status: SocialPostStatus) => {
    setPosts((prev) => prev?.map((p) => (p.id === id ? { ...p, status } : p)) ?? prev);
    try {
      await adminApi.setSocialStatus(id, status);
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
        subtitle="A fresh Instagram carousel idea every day, or create one from your own idea. Pick one, download it and post."
        action={
          <Button variant="primary" onClick={newIdea} loading={writingExtra} disabled={!ready || writingToday}>
            <Sparkles className="w-4 h-4" />
            New idea
          </Button>
        }
      />

      <ErrorNote message={error} />
      {!ready && (
        <Card className="p-5 mb-5 text-sm text-[#A6A8B3]">
          Post ideas need the Gemini API key. Add <code className="text-[#C9A96E]">GEMINI_API_KEY</code> to the environment
          variables and redeploy.
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
        <Card className="p-8 text-center text-sm text-[#8B8D98]">No post ideas yet. Press "New idea" to create one.</Card>
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onStatus={setStatus} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  );
};
