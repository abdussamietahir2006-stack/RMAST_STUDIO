// Motion-graphics engine for RMAST reels (1080x1920, 30 fps).
// A pure function of time: draw(ctx, t) paints exactly the same frame for the live preview and
// the MP4 export. Layers: the style's animated background (themes.ts), then the scenes' animated
// typography, blended by the scene transitions, then the brand mark and progress line.
import type { TextAlign, TextEntrance, VideoScene, VideoStyle } from '../../types';
import { CONTACT } from '../../config/contact';
import {
  clamp01,
  easeInOutCubic,
  linear,
  makeVariation,
  SANS,
  seeded,
  SERIF,
  THEMES,
  type Theme,
  type Variation,
  VIDEO_H,
  VIDEO_W
} from './themes';

export { VIDEO_H, VIDEO_W } from './themes';
export const FPS = 30;
export const TRANSITION = 0.7; // seconds, centred on each scene boundary
const PAD = 96;
const TEXT_W = VIDEO_W - PAD * 2;
const CONTENT_MID = 940; // vertical centre of the text block (clear of Reels UI at top and bottom)

type Ctx = CanvasRenderingContext2D;

// ---------------------------------------------------------------------------
// Easing
// ---------------------------------------------------------------------------

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const easeOutBack = (x: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
// 0..1 progress of an animation that starts at `start` and lasts `dur` seconds
const phase = (local: number, start: number, dur: number) => clamp01((local - start) / dur);

// ---------------------------------------------------------------------------
// Text helpers
// ---------------------------------------------------------------------------

const setFont = (ctx: Ctx, weight: number, size: number, family: string, italic = false) => {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${Math.round(size)}px ${family}`;
};

const setSpacing = (ctx: Ctx, px: number) => {
  if ('letterSpacing' in ctx) (ctx as Ctx & { letterSpacing: string }).letterSpacing = `${px}px`;
};

function wrap(ctx: Ctx, text: string, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (!line || ctx.measureText(next).width <= maxW) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Scene drawing runs twice: a dry run to measure the block's height (to centre it), then for real
interface Pen {
  ctx: Ctx;
  dry: boolean;
  t: number; // absolute time (for shimmer)
  local: number; // time since the scene started appearing
  th: Theme;
  align: TextAlign; // the scene's alignment (the founder's choice, else the look's)
  textIn: TextEntrance; // how the scene's text appears
}

// Left edge of a block `w` wide in the text column, for an alignment
const alignX = (align: TextAlign | undefined, w: number) =>
  align === 'center' ? PAD + (TEXT_W - w) / 2 : align === 'right' ? PAD + TEXT_W - w : PAD;

const displayText = (p: Pen, s: string) => (p.th.display.upper ? s.toUpperCase() : s);

// Largest size (<= max) that wraps into maxLines lines within maxW
function fitSize(p: Pen, text: string, family: string, weight: number, max: number, min: number, maxW: number, maxLines: number) {
  const { ctx } = p;
  setSpacing(ctx, family === p.th.display.family ? p.th.display.tracking : 0);
  for (let size = max; size > min; size -= 4) {
    setFont(ctx, weight, size, family);
    const lines = wrap(ctx, text, maxW);
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxW)) {
      setSpacing(ctx, 0);
      return size;
    }
  }
  setSpacing(ctx, 0);
  return min;
}

// Gradient that slowly slides along the text (a living shimmer)
function shimmer(ctx: Ctx, x: number, width: number, t: number, colours: string[]) {
  const span = Math.max(width, 200);
  const shift = Math.sin(t * 0.9) * span * 0.35;
  return linear(ctx, x - span * 0.3 + shift, 0, x + span * 1.3 + shift, 0, colours);
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

interface KineticOpts {
  size: number;
  weight: number;
  family: string;
  fill: string | 'accent';
  start: number; // seconds after the scene starts
  stagger?: number; // seconds between words
  lineH?: number;
  align?: TextAlign;
  tracking?: number;
  glow?: boolean;
}

// Words rise into place from behind a mask, one after another. Returns the y below the text.
function kinetic(p: Pen, text: string, y: number, o: KineticOpts): number {
  if (!text) return y;
  const { ctx } = p;
  const lineH = o.lineH ?? 1.08;
  const stagger = o.stagger ?? 0.07;
  setFont(ctx, o.weight, o.size, o.family);
  setSpacing(ctx, o.tracking ?? 0);
  const lines = wrap(ctx, text, TEXT_W);
  if (p.dry) {
    setSpacing(ctx, 0);
    return y + lines.length * o.size * lineH;
  }

  let k = 0;
  lines.forEach((line, li) => {
    const top = y + li * o.size * lineH;
    const baseline = top + o.size * 0.86;
    const lineW = ctx.measureText(line).width;
    const lx = alignX(o.align, lineW);
    const fill = o.fill === 'accent' ? shimmer(ctx, lx, lineW, p.t, p.th.accent) : o.fill;

    // "pop" and "fade": whole lines appear one after another (scaled in with a bounce, or faded in)
    if (p.textIn === 'pop' || p.textIn === 'fade') {
      const raw = phase(p.local, o.start + li * 0.3, p.textIn === 'pop' ? 0.55 : 0.7);
      if (raw <= 0) return;
      ctx.save();
      ctx.fillStyle = fill;
      if (o.glow && p.th.glow && raw >= 1) {
        ctx.shadowColor = p.th.glow;
        ctx.shadowBlur = o.size * 0.3;
      }
      if (p.textIn === 'pop') {
        const sc = easeOutBack(raw);
        const cx = lx + lineW / 2;
        const cy = baseline - o.size * 0.35;
        ctx.translate(cx, cy);
        ctx.scale(sc, sc);
        ctx.translate(-cx, -cy);
        ctx.globalAlpha = clamp01(raw * 2.5);
      } else {
        ctx.globalAlpha = easeOutCubic(raw);
      }
      ctx.fillText(line, lx, baseline);
      ctx.restore();
      return;
    }

    // "words" (default) rise one after another; "lines" rise a whole line at a time
    const lineE = easeOutExpo(phase(p.local, o.start + li * 0.3, 0.75));
    const words = line.split(' ').map((word) => {
      const e = p.textIn === 'lines' ? lineE : easeOutExpo(phase(p.local, o.start + k++ * stagger, 0.75));
      return { word, e };
    });
    // Words still rising are drawn through a mask (they appear out of an invisible slot);
    // words that have landed are drawn freely, so a glow can spread without hard edges
    ctx.save();
    ctx.beginPath();
    ctx.rect(lx - 40, top - o.size * 0.15, lineW + 80, o.size * lineH + o.size * 0.25);
    ctx.clip();
    ctx.fillStyle = fill;
    let wx = lx;
    for (const { word, e } of words) {
      if (e < 1) {
        ctx.globalAlpha = clamp01(e * 1.6);
        ctx.fillText(word, wx, baseline + (1 - e) * o.size * 1.05);
      }
      wx += ctx.measureText(`${word} `).width;
    }
    ctx.restore();
    ctx.save();
    ctx.fillStyle = fill;
    if (o.glow && p.th.glow) {
      ctx.shadowColor = p.th.glow;
      ctx.shadowBlur = o.size * 0.3;
    }
    wx = lx;
    for (const { word, e } of words) {
      if (e >= 1) ctx.fillText(word, wx, baseline);
      wx += ctx.measureText(`${word} `).width;
    }
    ctx.restore();
  });
  setSpacing(ctx, 0);
  return y + lines.length * o.size * lineH;
}

const wordCount = (s: string) => (s ? s.split(/\s+/).filter(Boolean).length : 0);

// Small uppercase label with a glowing dot
function kicker(p: Pen, text: string, y: number, start = 0.05, align: TextAlign = 'left'): number {
  if (!text) return y;
  if (!p.dry) {
    const { ctx } = p;
    const e = easeOutCubic(phase(p.local, start, 0.6));
    setFont(ctx, 700, 30, SANS);
    setSpacing(ctx, 7);
    const label = text.toUpperCase();
    const w = ctx.measureText(label).width + 38;
    const x = alignX(align, w);
    ctx.save();
    ctx.globalAlpha = e;
    ctx.shadowColor = p.th.dot;
    ctx.shadowBlur = 24;
    ctx.fillStyle = p.th.dot;
    ctx.beginPath();
    ctx.arc(x + 9, y + 18, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = e;
    ctx.fillStyle = p.th.kicker;
    ctx.fillText(label, x + 38 - (1 - e) * 30, y + 29);
    ctx.restore();
    setSpacing(ctx, 0);
  }
  return y + 84;
}

const displayOpts = (p: Pen, size: number, fill: string | 'accent', start: number, lineH: number, align: TextAlign): KineticOpts => ({
  size,
  weight: p.th.display.weight,
  family: p.th.display.family,
  fill,
  start,
  lineH,
  align,
  tracking: p.th.display.tracking,
  glow: true
});

// Headline, then the accent highlight, sharing one size so they read as one phrase
function titleBlock(p: Pen, s: VideoScene, y: number, max: number, min: number, maxLines: number, start: number, align: TextAlign = 'left') {
  const head = displayText(p, s.headline);
  const high = displayText(p, s.highlight);
  const size = fitSize(p, [head, high].filter(Boolean).join(' '), p.th.display.family, p.th.display.weight, max, min, TEXT_W, maxLines);
  y = kinetic(p, head, y, displayOpts(p, size, p.th.text, start, 1.04, align));
  const highStart = start + wordCount(head) * 0.07 + 0.1;
  y = kinetic(p, high, y, displayOpts(p, size, 'accent', highStart, 1.06, align));
  return { y, end: highStart + wordCount(high) * 0.07 + 0.5 };
}

function bodyText(p: Pen, text: string, y: number, start: number, size = 50, colour?: string, align: TextAlign = 'left'): number {
  if (!text) return y;
  return kinetic(p, text, y + 26, { size, weight: 500, family: SANS, fill: colour ?? p.th.lead, start, stagger: 0.025, lineH: 1.38, align });
}

// Counts the numeric part of a value up (e.g. "$1,000"); non-numeric values stay as they are
function countUp(value: string, e: number): string {
  const m = value.match(/^(\D*)([\d,]+(?:\.\d+)?)(.*)$/);
  if (!m) return value;
  const target = Number(m[2].replace(/,/g, ''));
  if (!Number.isFinite(target) || target === 0) return value;
  const decimals = m[2].includes('.') ? m[2].split('.')[1].length : 0;
  const n = target * e;
  const shown = decimals ? n.toFixed(decimals) : Math.round(n).toLocaleString('en-US');
  return `${m[1]}${shown}${m[3]}`;
}

// ---------------------------------------------------------------------------
// Scenes: each draws from top y and returns the bottom y
// ---------------------------------------------------------------------------

function hookScene(p: Pen, s: VideoScene, y: number): number {
  y = kicker(p, s.kicker, y, 0.05, p.align);
  const head = displayText(p, s.headline);
  const high = displayText(p, s.highlight);
  const size = fitSize(p, [head, high].filter(Boolean).join(' '), p.th.display.family, p.th.display.weight, 176, 96, TEXT_W, 5);
  y = kinetic(p, head, y, { ...displayOpts(p, size, p.th.text, 0.2, 1.02, p.align), stagger: 0.09 });
  const hs = 0.3 + wordCount(head) * 0.09;
  y = kinetic(p, high, y, { ...displayOpts(p, size * 1.08, 'accent', hs, 1.04, p.align), stagger: 0.09 });
  return bodyText(p, s.body, y + 10, hs + wordCount(high) * 0.09 + 0.2, 50, undefined, p.align);
}

function statementScene(p: Pen, s: VideoScene, y: number): number {
  y = kicker(p, s.kicker, y, 0.05, p.align);
  const { y: yy, end } = titleBlock(p, s, y, 148, 80, 7, 0.15, p.align);
  return bodyText(p, s.body, yy, end, 50, undefined, p.align);
}

function listScene(p: Pen, s: VideoScene, y: number): number {
  const { ctx, th } = p;
  y = kicker(p, s.kicker, y);
  const { y: ty, end } = titleBlock(p, s, y, 118, 72, 3, 0.15);
  y = bodyText(p, s.body, ty, end, 44, th.muted) + 50;
  const rowH = 148;
  s.items.forEach((item, i) => {
    const e = easeOutExpo(phase(p.local, end + 0.1 + i * 0.28, 0.8));
    if (!p.dry) {
      ctx.save();
      ctx.globalAlpha = clamp01(e * 1.4);
      const dx = (1 - e) * 120;
      // Separator draws in from the left
      ctx.fillStyle = th.rule;
      ctx.fillRect(PAD, y, TEXT_W * e, 2);
      setFont(ctx, 600, 54, SANS);
      ctx.fillStyle = th.text;
      ctx.fillText(item.label, PAD + dx, y + rowH / 2 + 20);
      if (item.value) {
        setFont(ctx, 800, 56, SANS);
        const shown = countUp(item.value, easeOutCubic(phase(p.local, end + 0.2 + i * 0.28, 1.1)));
        const w = ctx.measureText(item.value).width;
        ctx.fillStyle = shimmer(ctx, VIDEO_W - PAD - w, w, p.t, th.accent);
        if (th.glow) {
          ctx.shadowColor = th.glow;
          ctx.shadowBlur = 18;
        }
        ctx.textAlign = 'right';
        ctx.fillText(shown, VIDEO_W - PAD + dx, y + rowH / 2 + 20);
        ctx.textAlign = 'left';
      }
      ctx.restore();
    }
    y += rowH;
  });
  if (!p.dry && s.items.length) {
    ctx.fillStyle = th.rule;
    ctx.fillRect(PAD, y, TEXT_W * easeOutExpo(phase(p.local, end + 0.1 + s.items.length * 0.28, 0.8)), 2);
  }
  return y;
}

function statScene(p: Pen, s: VideoScene, y: number): number {
  const { ctx, th } = p;
  y = kicker(p, s.kicker, y, 0.05, p.align);
  const e = easeOutExpo(phase(p.local, 0.2, 1.6));
  const final = `${s.statPrefix}${Math.round(s.statValue).toLocaleString('en-US')}${s.statSuffix}`;
  const family = th.display.family;
  const size = fitSize(p, final, family, 900, 360, 140, TEXT_W, 1);
  if (!p.dry) {
    const current = `${s.statPrefix}${Math.round(s.statValue * e).toLocaleString('en-US')}${s.statSuffix}`;
    setFont(ctx, 900, size, family);
    const w = ctx.measureText(final).width;
    const x = alignX(p.align, w);
    ctx.save();
    ctx.globalAlpha = clamp01(phase(p.local, 0.15, 0.4));
    ctx.shadowColor = th.glow ?? 'rgba(255,92,170,0.45)';
    ctx.shadowBlur = 80;
    ctx.fillStyle = shimmer(ctx, x, w, p.t, th.accent);
    const pop = 1 + (1 - easeOutBack(phase(p.local, 0.15, 0.7))) * 0.15;
    ctx.translate(x, y + size * 0.86);
    ctx.scale(pop, pop);
    ctx.fillText(current, 0, 0);
    ctx.restore();
  }
  y += size * 1.05;
  const { y: ty, end } = titleBlock(p, s, y + 10, 100, 64, 4, 0.9, p.align);
  return bodyText(p, s.body, ty, end, 50, undefined, p.align);
}

function tagsScene(p: Pen, s: VideoScene, y: number): number {
  const { ctx, th } = p;
  y = kicker(p, s.kicker, y);
  const { y: ty, end } = titleBlock(p, s, y, 128, 72, 4, 0.15);
  y = bodyText(p, s.body, ty, end, 44, th.muted) + 60;
  const size = 60;
  const padX = 52;
  const h = 132;
  const gap = 22;
  let x = PAD;
  setFont(ctx, 700, size, SANS);
  s.items.forEach((item, i) => {
    const w = Math.min(ctx.measureText(item.label).width + padX * 2, TEXT_W);
    if (x > PAD && x + w > VIDEO_W - PAD) {
      x = PAD;
      y += h + gap;
    }
    if (!p.dry) {
      const e = phase(p.local, end + 0.1 + i * 0.16, 0.55);
      const sc = e <= 0 ? 0 : easeOutBack(e);
      if (sc > 0) {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        ctx.scale(sc, sc);
        roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
        ctx.fillStyle = th.pill;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = shimmer(ctx, -w / 2, w, p.t, th.fill);
        ctx.stroke();
        setFont(ctx, 700, size, SANS);
        ctx.fillStyle = th.text;
        ctx.textAlign = 'center';
        ctx.fillText(item.label, 0, size * 0.36);
        ctx.restore();
      }
    }
    x += w + gap;
  });
  return y + h;
}

function compareScene(p: Pen, s: VideoScene, y: number): number {
  const { ctx, th } = p;
  y = kicker(p, s.kicker, y);
  const { y: ty, end } = titleBlock(p, s, y, 124, 72, 4, 0.15);
  y = bodyText(p, s.body, ty, end, 44, th.muted) + 60;
  const size = 56;
  const pad = 56;
  const markW = 84;
  const inner = TEXT_W - pad * 2 - markW;
  const lineH = size * 1.3;

  const card = (text: string, good: boolean, start: number) => {
    setFont(ctx, 600, size, SANS);
    const rows = wrap(ctx, text, inner);
    const h = pad * 2 + rows.length * lineH - (lineH - size);
    if (!p.dry) {
      const e = easeOutExpo(phase(p.local, start, 0.8));
      const dx = (1 - e) * (good ? 160 : -160);
      ctx.save();
      ctx.globalAlpha = clamp01(e * 1.5);
      ctx.translate(dx, 0);
      if (good) {
        const pulse = 0.5 + 0.5 * Math.sin(p.t * 3);
        ctx.save();
        ctx.shadowColor = th.glow ?? `rgba(255,92,170,${0.3 + pulse * 0.25})`;
        ctx.shadowBlur = 90;
        roundRect(ctx, PAD, y, TEXT_W, h, 28);
        ctx.fillStyle = shimmer(ctx, PAD, TEXT_W, p.t, th.fill);
        ctx.fill();
        ctx.restore();
        roundRect(ctx, PAD + 4, y + 4, TEXT_W - 8, h - 8, 24);
        ctx.fillStyle = th.goodInner;
        ctx.fill();
      } else {
        roundRect(ctx, PAD, y, TEXT_W, h, 28);
        ctx.fillStyle = th.bad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = th.badBorder;
        ctx.stroke();
      }
      setFont(ctx, 800, size, SANS);
      ctx.fillStyle = good ? th.goodMark : th.badMark;
      ctx.fillText(good ? '✓' : '✗', PAD + pad, y + pad + size * 0.84);
      setFont(ctx, 600, size, SANS);
      // The weak version gets struck through, line by line, after it lands
      const strike = easeInOutCubic(phase(p.local, start + 0.8, 0.6));
      rows.forEach((row, i) => {
        const base = y + pad + size * 0.84 + i * lineH;
        ctx.fillStyle = good ? th.text : th.badText;
        ctx.fillText(row, PAD + pad + markW, base);
        if (!good && strike > 0) {
          ctx.fillStyle = th.strike;
          ctx.fillRect(PAD + pad + markW, base - size * 0.3, ctx.measureText(row).width * strike, 4);
        }
      });
      ctx.restore();
    }
    y += h;
  };

  if (s.before) card(s.before, false, end + 0.1);
  y += 36;
  if (s.after) card(s.after, true, end + 1.5);
  return y;
}

function stepsScene(p: Pen, s: VideoScene, y: number): number {
  const { ctx, th } = p;
  y = kicker(p, s.kicker, y);
  const { y: ty, end } = titleBlock(p, s, y, 118, 72, 3, 0.15);
  y = ty + 64;
  const nodeX = PAD + 36;
  const textX = PAD + 110;
  const stepGap = 34;
  const tops: number[] = [];
  for (const item of s.items) {
    setFont(ctx, 500, 44, SANS);
    const rows = item.value ? wrap(ctx, item.value, TEXT_W - 110).length : 0;
    tops.push(y);
    y += 64 + rows * 58 + stepGap;
  }
  if (!p.dry) {
    s.items.forEach((item, i) => {
      const start = end + 0.1 + i * 0.55;
      const e = easeOutExpo(phase(p.local, start, 0.7));
      const top = tops[i];
      // Connector line grows down to the next node
      if (i < s.items.length - 1) {
        const grow = easeInOutCubic(phase(p.local, start + 0.3, 0.5));
        ctx.fillStyle = th.rule;
        ctx.fillRect(nodeX - 2, top + 36, 4, (tops[i + 1] - top) * grow);
      }
      ctx.save();
      ctx.globalAlpha = clamp01(e * 1.5);
      ctx.beginPath();
      ctx.arc(nodeX, top + 22, 34 * (0.6 + 0.4 * e), 0, Math.PI * 2);
      ctx.fillStyle = th.goodInner;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = shimmer(ctx, nodeX - 34, 68, p.t, th.fill);
      ctx.stroke();
      setFont(ctx, 900, 32, SERIF);
      ctx.fillStyle = th.text;
      ctx.textAlign = 'center';
      ctx.fillText(String(i + 1), nodeX, top + 33);
      ctx.textAlign = 'left';
      const dx = (1 - e) * 80;
      setFont(ctx, 700, 54, SANS);
      ctx.fillStyle = th.text;
      ctx.fillText(item.label, textX + dx, top + 42);
      if (item.value) {
        setFont(ctx, 500, 44, SANS);
        ctx.fillStyle = th.muted;
        wrap(ctx, item.value, TEXT_W - 110).forEach((row, r) => ctx.fillText(row, textX + dx, top + 102 + r * 58));
      }
      ctx.restore();
    });
  }
  return y - stepGap;
}

function ctaScene(p: Pen, s: VideoScene, y: number): number {
  const { ctx, th } = p;
  // Logo lock-up
  if (!p.dry) {
    const e = easeOutExpo(phase(p.local, 0.1, 0.8));
    ctx.save();
    ctx.globalAlpha = e;
    setFont(ctx, 700, 64, SERIF);
    setSpacing(ctx, 10);
    const w = ctx.measureText('RMAST').width;
    setSpacing(ctx, 0);
    setFont(ctx, 600, 54, SERIF, true);
    const w2 = ctx.measureText('Studio').width;
    const x = alignX(p.align, w + 24 + w2);
    setFont(ctx, 700, 64, SERIF);
    setSpacing(ctx, 10);
    ctx.fillStyle = th.text;
    ctx.fillText('RMAST', x, y + 60 + (1 - e) * 40);
    setSpacing(ctx, 0);
    setFont(ctx, 600, 54, SERIF, true);
    ctx.fillStyle = th.brandAccent;
    ctx.fillText('Studio', x + w + 24, y + 60 + (1 - e) * 40);
    ctx.restore();
  }
  y += 130;
  y = kicker(p, s.kicker, y, 0.3, p.align);
  const { y: ty, end } = titleBlock(p, s, y, 136, 78, 4, 0.4, p.align);
  y = bodyText(p, s.body, ty, end, 50, undefined, p.align);
  y += 70;
  if (!p.dry) {
    const e = easeOutBack(phase(p.local, end + 0.2, 0.6));
    if (e > 0) {
      const label = s.button || 'LINK IN BIO  ↗';
      // Long custom labels shrink to fit the column
      let fontSize = 40;
      setSpacing(ctx, 6);
      do {
        setFont(ctx, 800, fontSize, SANS);
      } while (ctx.measureText(label).width + 110 > TEXT_W && (fontSize -= 2) > 22);
      const bw = ctx.measureText(label).width + 110;
      const bh = 116;
      const pulse = 1 + 0.025 * Math.sin(p.t * 4);
      const bx = alignX(p.align, bw);
      ctx.save();
      ctx.translate(bx + bw / 2, y + bh / 2);
      ctx.scale(e * pulse, e * pulse);
      ctx.shadowColor = th.glow ?? 'rgba(255,92,170,0.5)';
      ctx.shadowBlur = 80;
      roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 18);
      ctx.fillStyle = shimmer(ctx, -bw / 2, bw, p.t * 2, th.fill);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = th.buttonText;
      ctx.fillText(label, -bw / 2 + 55, 14);
      ctx.restore();
      setSpacing(ctx, 0);
    }
    const c = easeOutCubic(phase(p.local, end + 0.6, 0.7));
    ctx.save();
    ctx.globalAlpha = c;
    ctx.textAlign = p.align;
    const cx = p.align === 'center' ? VIDEO_W / 2 : p.align === 'right' ? PAD + TEXT_W : PAD;
    setFont(ctx, 600, 38, SANS);
    ctx.fillStyle = th.muted;
    ctx.fillText(`@${CONTACT.instagramHandle}`, cx, y + 196);
    setFont(ctx, 500, 34, SANS);
    ctx.fillText(`WhatsApp ${CONTACT.whatsappDisplay}  ·  ${CONTACT.email}`, cx, y + 250);
    ctx.restore();
  }
  return y + 260;
}

function drawScene(p: Pen, s: VideoScene, y: number): number {
  switch (s.type) {
    case 'hook':
      return hookScene(p, s, y);
    case 'statement':
      return statementScene(p, s, y);
    case 'list':
      return listScene(p, s, y);
    case 'stat':
      return statScene(p, s, y);
    case 'tags':
      return tagsScene(p, s, y);
    case 'compare':
      return compareScene(p, s, y);
    case 'steps':
      return stepsScene(p, s, y);
    case 'cta':
      return ctaScene(p, s, y);
  }
}

// Brand mark, progress line and the scene's corner texts (drawn on top of everything).
// Corner text: "" = the default (logo top-left, nothing elsewhere), "-" = empty, else shown as written.
function overlay(ctx: Ctx, th: Theme, t: number, total: number, scene: VideoScene | undefined) {
  ctx.fillStyle = th.track;
  ctx.fillRect(PAD, 92, TEXT_W, 5);
  ctx.fillStyle = shimmer(ctx, PAD, TEXT_W, t, th.fill);
  ctx.fillRect(PAD, 92, TEXT_W * clamp01(t / total), 5);

  const c = scene?.corners;
  const text = (value: string, right: boolean, y: number) => {
    if (!value || value === '-') return;
    ctx.save();
    setSpacing(ctx, 2);
    let size = 36;
    do {
      setFont(ctx, 700, size, SANS);
    } while (ctx.measureText(value).width > TEXT_W / 2 - 12 && (size -= 2) > 18);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = th.text;
    ctx.textAlign = right ? 'right' : 'left';
    ctx.fillText(value, right ? PAD + TEXT_W : PAD, y);
    ctx.restore();
  };
  // Bottom corners sit above the Reels caption and buttons
  text(c?.topRight ?? '', true, 172);
  text(c?.bottomLeft ?? '', false, VIDEO_H - 300);
  text(c?.bottomRight ?? '', true, VIDEO_H - 300);
  if (c?.topLeft) return text(c.topLeft, false, 172);

  setFont(ctx, 700, 40, SERIF);
  setSpacing(ctx, 6);
  ctx.fillStyle = th.text;
  ctx.fillText('RMAST', PAD, 172);
  const w = ctx.measureText('RMAST').width;
  setSpacing(ctx, 0);
  setFont(ctx, 600, 34, SERIF, true);
  ctx.fillStyle = th.brandAccent;
  ctx.fillText('Studio', PAD + w + 14, 172);
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export function videoLength(scenes: VideoScene[]): number {
  return scenes.reduce((n, s) => n + s.duration, 0);
}

// Start time of every scene (the music uses these to hit the cuts)
export function sceneStarts(scenes: VideoScene[]): number[] {
  let at = 0;
  return scenes.map((s) => {
    const start = at;
    at += s.duration;
    return start;
  });
}

export class VideoEngine {
  readonly duration: number;
  private readonly starts: number[];
  private readonly layers: { canvas: HTMLCanvasElement; ctx: Ctx }[];
  private readonly heights = new Map<number, number>();
  private readonly th: Theme;
  private readonly variation: Variation;

  constructor(
    private readonly scenes: VideoScene[],
    private readonly scale = 1,
    style: VideoStyle = 'aurora',
    seed = 1
  ) {
    this.starts = sceneStarts(scenes);
    this.duration = videoLength(scenes);
    this.th = THEMES[style] ?? THEMES.aurora;
    this.variation = makeVariation(seed);
    this.layers = [0, 1].map(() => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(VIDEO_W * scale);
      canvas.height = Math.round(VIDEO_H * scale);
      return { canvas, ctx: canvas.getContext('2d')! };
    });
  }

  // Scenes after the first start appearing during the transition into them
  private local(i: number, t: number) {
    return i === 0 ? t : t - this.starts[i] + TRANSITION / 2;
  }

  private pen(ctx: Ctx, dry: boolean, t: number, local: number, i: number): Pen {
    const s = this.scenes[i];
    return { ctx, dry, t, local, th: this.th, align: s?.align ?? this.th.align, textIn: s?.textIn ?? 'words' };
  }

  // Height of a scene's block, measured once (layout does not change over time)
  private height(ctx: Ctx, i: number) {
    let h = this.heights.get(i);
    if (h === undefined) {
      h = drawScene(this.pen(ctx, true, 0, 99, i), this.scenes[i], 0);
      this.heights.set(i, h);
    }
    return h;
  }

  private renderScene(layer: number, i: number, t: number): HTMLCanvasElement {
    const { canvas, ctx } = this.layers[layer];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const s = this.scenes[i];
    const local = this.local(i, t);
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    ctx.textBaseline = 'alphabetic';
    // Slow camera push-in across the scene
    const push = 1 + (s.motion === 'slowZoom' ? 0.2 : 0.04) * clamp01(local / (s.duration + TRANSITION));
    ctx.translate(VIDEO_W / 2, CONTENT_MID);
    ctx.scale(push, push);
    ctx.translate(-VIDEO_W / 2, -CONTENT_MID);
    const h = this.height(ctx, i);
    const top = Math.max(250, Math.min(CONTENT_MID - h / 2, VIDEO_H - 330 - h));
    drawScene(this.pen(ctx, false, t, local, i), s, top);
    return canvas;
  }

  draw(ctx: Ctx, time: number): void {
    const t = Math.max(0, Math.min(time, this.duration - 1e-3));
    const n = this.scenes.length;
    let i = 0;
    while (i + 1 < n && t >= this.starts[i + 1]) i++;

    // Which scenes are on screen, and how far through a transition we are
    let from = i;
    let to = i;
    let p = 1;
    if (i + 1 < n && t > this.starts[i + 1] - TRANSITION / 2) {
      to = i + 1;
      p = (t - (this.starts[i + 1] - TRANSITION / 2)) / TRANSITION;
    } else if (i > 0 && t < this.starts[i] + TRANSITION / 2) {
      from = i - 1;
      p = (t - (this.starts[i] - TRANSITION / 2)) / TRANSITION;
    }

    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    const scenePos = from === to ? from : from + easeInOutCubic(clamp01(p));
    this.th.background(ctx, t, scenePos, this.variation);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (from === to) {
      ctx.drawImage(this.renderScene(0, from, t), 0, 0);
    } else {
      const a = this.renderScene(0, from, t);
      const b = this.renderScene(1, to, t);
      this.transition(ctx, this.scenes[from].transition, a, b, clamp01(p), t);
    }

    // "muted" scenes are grey and dull; the effect blends in and out with the transition
    const muted = (i: number) => (this.scenes[i]?.tone === 'muted' ? 1 : 0);
    const dull = from === to ? muted(from) : muted(from) * (1 - clamp01(p)) + muted(to) * clamp01(p);
    if (dull > 0 && 'filter' in ctx) {
      ctx.save();
      ctx.globalAlpha = dull;
      ctx.filter = 'grayscale(1) brightness(0.72) contrast(0.92)';
      ctx.drawImage(ctx.canvas, 0, 0);
      ctx.restore();
    }

    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    // Corner texts follow the scene that is mostly on screen
    overlay(ctx, this.th, t, this.duration, this.scenes[from === to || p < 0.5 ? from : to]);

    // Gentle fade out at the very end
    const out = clamp01((t - (this.duration - 0.45)) / 0.45);
    if (out > 0) {
      ctx.save();
      ctx.globalAlpha = out;
      ctx.fillStyle = this.th.fade;
      ctx.fillRect(0, 0, VIDEO_W, VIDEO_H);
      ctx.restore();
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  // Blends the outgoing scene layer (a) into the incoming one (b); works in pixel space
  private transition(ctx: Ctx, kind: VideoScene['transition'], a: HTMLCanvasElement, b: HTMLCanvasElement, p: number, t: number) {
    const W = a.width;
    const H = a.height;
    const S = this.scale;
    const fill = this.th.fill;
    const e = easeInOutCubic(p);
    const layer = (img: HTMLCanvasElement, o: { alpha?: number; dx?: number; dy?: number; zoom?: number; blur?: number }) => {
      ctx.save();
      ctx.globalAlpha = clamp01(o.alpha ?? 1);
      if (o.blur && 'filter' in ctx) ctx.filter = `blur(${o.blur}px)`;
      const z = o.zoom ?? 1;
      ctx.translate(W / 2 + (o.dx ?? 0), H * 0.49 + (o.dy ?? 0));
      ctx.scale(z, z);
      ctx.drawImage(img, -W / 2, -H * 0.49);
      ctx.restore();
    };

    switch (kind) {
      case 'slide': {
        layer(a, { alpha: 1 - e, dy: -e * H * 0.32 });
        layer(b, { alpha: e, dy: (1 - e) * H * 0.32 });
        break;
      }
      case 'zoom': {
        layer(a, { alpha: 1 - e, zoom: 1 + e * 0.35, blur: e * 14 * S });
        layer(b, { alpha: e, zoom: 0.78 + 0.22 * e, blur: (1 - e) * 10 * S });
        break;
      }
      case 'wipe': {
        // A glowing blade sweeps diagonally, revealing the next scene behind it
        const slant = W * 0.35;
        const x = -slant + e * (W + slant * 2);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, 0);
        ctx.lineTo(x - slant, H);
        ctx.lineTo(0, H);
        ctx.closePath();
        ctx.clip();
        layer(b, {});
        ctx.restore();
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(W, 0);
        ctx.lineTo(W, H);
        ctx.lineTo(x - slant, H);
        ctx.closePath();
        ctx.clip();
        layer(a, {});
        ctx.restore();
        const band = 90 * S;
        ctx.save();
        ctx.globalAlpha = Math.sin(p * Math.PI);
        ctx.shadowColor = this.th.glow ?? 'rgba(255,92,170,0.9)';
        ctx.shadowBlur = 60 * S;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + band, 0);
        ctx.lineTo(x + band - slant, H);
        ctx.lineTo(x - slant, H);
        ctx.closePath();
        ctx.fillStyle = linear(ctx, 0, 0, 0, H, fill);
        ctx.fill();
        ctx.restore();
        break;
      }
      case 'circle': {
        layer(a, { alpha: 1 - e * 0.7, zoom: 1 + e * 0.08 });
        const r = e * Math.hypot(W, H) * 0.6;
        ctx.save();
        ctx.beginPath();
        ctx.arc(W / 2, H * 0.49, r, 0, Math.PI * 2);
        ctx.clip();
        layer(b, { zoom: 1.08 - 0.08 * e });
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 1 - e;
        ctx.lineWidth = 16 * S;
        ctx.shadowColor = this.th.glow ?? 'rgba(166,139,255,0.9)';
        ctx.shadowBlur = 50 * S;
        ctx.strokeStyle = linear(ctx, W / 2 - r, 0, W / 2 + r, 0, fill);
        ctx.beginPath();
        ctx.arc(W / 2, H * 0.49, Math.max(r, 1), 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        break;
      }
      case 'glitch': {
        // Horizontal slices jitter and split into colour fringes around the cut
        const src = p < 0.5 ? a : b;
        const strength = 1 - Math.abs(p - 0.5) * 2;
        const rnd = seeded(Math.floor(t * FPS) + 13);
        const slices = 16;
        const sh = H / slices;
        for (let k = 0; k < slices; k++) {
          const off = (rnd() - 0.5) * 160 * S * strength * (rnd() > 0.4 ? 1 : 0.2);
          ctx.drawImage(src, 0, k * sh, W, sh, off, k * sh, W, sh);
        }
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.45 * strength;
        ctx.drawImage(src, 10 * S * strength, 0);
        ctx.drawImage(src, -10 * S * strength, 0);
        ctx.restore();
        ctx.save();
        for (let k = 0; k < 5; k++) {
          ctx.globalAlpha = 0.35 * strength;
          ctx.fillStyle = fill[k % fill.length];
          ctx.fillRect(0, rnd() * H, W, (4 + rnd() * 26) * S);
        }
        ctx.restore();
        break;
      }
      case 'flash': {
        layer(p < 0.5 ? a : b, { zoom: p < 0.5 ? 1 + p * 0.1 : 1.05 - (p - 0.5) * 0.1 });
        ctx.save();
        const f = Math.sin(p * Math.PI);
        const g = ctx.createRadialGradient(W / 2, H * 0.49, 0, W / 2, H * 0.49, H * 0.8);
        g.addColorStop(0, `rgba(255,255,255,${0.78 * f})`);
        g.addColorStop(0.5, `rgba(255,255,255,${0.45 * f})`);
        g.addColorStop(1, `rgba(255,255,255,${0.2 * f})`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        break;
      }
    }
  }
}
