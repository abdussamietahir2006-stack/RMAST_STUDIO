// Draws one carousel slide at any size (1080x1350 by default) on a canvas, in any of the reel looks
// (src/admin/video/themes.ts). The same drawing runs as a still image or animated: in the animated
// version every line of text rises into place within the first two seconds.
// Canvas (not HTML screenshots) keeps export exact and works under the site's strict CSP.
import type { CornerTexts, PostSize, SocialSlide, TextAlign, VideoStyle } from '../../types';
import { CONTACT } from '../../config/contact';
import { clamp01, makeVariation, SANS, SERIF, THEMES, type Variation } from '../video/themes';

export const SLIDE_W = 1080;
export const SLIDE_H = 1350;
export const DEFAULT_SIZE: PostSize = { width: SLIDE_W, height: SLIDE_H };
const PAD = 88;

// Layouts are designed on a canvas whose short side is 1080 units; the long side follows the
// chosen size (1350 for 4:5, 1920 for a story, 2064 wide for a 1200x628 banner). The finished
// drawing is then scaled to the exact pixel size. These hold the design frame of the slide being
// drawn; drawing is synchronous, so each measure or draw sets them first.
let W = SLIDE_W;
let H = SLIDE_H;
let TW = SLIDE_W - PAD * 2; // text column width (capped on wide banners so lines stay readable)

export function designFrame(size: PostSize) {
  const landscape = size.width >= size.height;
  const w = landscape ? Math.round((1080 * size.width) / size.height) : 1080;
  const h = landscape ? 1080 : Math.round((1080 * size.height) / size.width);
  return { w, h, scale: size.width / w };
}
const useFrame = (frame: { w: number; h: number }) => {
  W = frame.w;
  H = frame.h;
  TW = Math.min(W - PAD * 2, 1300);
};

// Animated slides: text starts after a beat and every element has landed by TEXT_DONE seconds
export const SLIDE_SECONDS = 8;
export const TEXT_START = 0.35;
const ENTER = 0.7;
const TEXT_DONE = 1.9;
const MAX_STAGGER = 0.14;
const STILL_T = 2; // background moment used for still images

export interface SlideLook {
  style: VideoStyle;
  seed: number;
}
const DEFAULT_LOOK: SlideLook = { style: 'aurora', seed: 1 };

type Ctx = CanvasRenderingContext2D;

interface Face {
  family: string;
  weight: number;
  tracking: number;
  upper: boolean;
}
const sans = (weight: number): Face => ({ family: SANS, weight, tracking: 0, upper: false });

// Slide colours for a look. Aurora keeps the exact colours of the original post design.
interface Palette {
  dark: boolean;
  text: string;
  lead: string;
  muted: string;
  soft: string;
  rule: string;
  page: string;
  kicker: string;
  dot: string;
  accent: string[];
  fill: string[];
  display: Face;
  glow: string | null;
  brandAccent: string;
  pillFill: string;
  pillStroke: string;
  bad: string;
  badBorder: string;
  badText: string;
  badMark: string;
  goodMark: string;
  goodInner: string;
  strike: string;
  buttonText: string;
  shadow: string; // glow under buttons and the "after" card
  marker: string | null; // highlighter band behind highlight lines (bold look)
}

const SHADOWS: Record<VideoStyle, string> = {
  aurora: 'rgba(255,92,170,0.5)',
  editorial: 'rgba(21,19,26,0.18)',
  neon: 'rgba(255,92,170,0.55)',
  bold: 'rgba(11,10,18,0.25)',
  mono: 'rgba(255,181,71,0.25)'
};
const DARK: Record<VideoStyle, boolean> = { aurora: true, editorial: false, neon: true, bold: false, mono: true };

function palette(style: VideoStyle): Palette {
  const th = THEMES[style];
  const aurora = style === 'aurora';
  return {
    dark: DARK[style],
    text: th.text,
    lead: th.lead,
    muted: th.muted,
    soft: aurora ? '#c9c3dd' : th.lead,
    rule: aurora ? '#2a2340' : th.rule,
    page: aurora ? '#6e6590' : th.muted,
    kicker: th.kicker,
    dot: th.dot,
    // Bold draws the highlight on a white marker band, so its accents are the dark text colour
    accent: style === 'bold' ? [th.text] : th.accent,
    fill: th.fill,
    display: { ...th.display },
    glow: th.glow,
    brandAccent: th.brandAccent,
    pillFill: aurora ? 'rgba(166,139,255,0.08)' : th.pill,
    pillStroke: aurora ? 'rgba(166,139,255,0.6)' : th.fill[0],
    bad: th.bad,
    badBorder: th.badBorder,
    badText: th.badText,
    badMark: th.badMark,
    goodMark: th.goodMark,
    goodInner: th.goodInner,
    strike: th.strike,
    buttonText: th.buttonText,
    shadow: SHADOWS[style],
    marker: style === 'bold' ? 'rgba(255,255,255,0.92)' : null
  };
}

// Every layout runs twice: a dry run to measure (and count animated elements), then the real draw
interface Pen {
  ctx: Ctx;
  dry: boolean;
  s: number; // text scale (shrinks until the content fits)
  pal: Palette;
  t: number | null; // seconds into the animation; null = still image with everything shown
  k: number; // animated elements so far
  step: number; // delay between elements
  inGroup: boolean;
  align: TextAlign; // the founder's alignment for this slide (left by default)
  bigLabel: boolean; // the kicker is shown as a big heading
}

// Left edge of a block `width` wide inside the text column, following the slide's alignment
const alignX = (p: Pen, width: number) =>
  p.align === 'center' ? PAD + (TW - width) / 2 : p.align === 'right' ? PAD + TW - width : PAD;

let fontsReady: Promise<void> | null = null;
export function loadSlideFonts(): Promise<void> {
  fontsReady ??= Promise.all(
    [
      `900 100px ${SERIF}`,
      `700 100px ${SERIF}`,
      `italic 600 40px ${SERIF}`,
      `400 30px ${SANS}`,
      `500 30px ${SANS}`,
      `600 30px ${SANS}`,
      `700 30px ${SANS}`
    ].map((f) => document.fonts.load(f))
  )
    .then(() => undefined)
    .catch(() => undefined);
  return fontsReady;
}

const setSpacing = (ctx: Ctx, px: number) => {
  if ('letterSpacing' in ctx) (ctx as Ctx & { letterSpacing: string }).letterSpacing = `${px}px`;
};

const setFont = (ctx: Ctx, weight: string | number, size: number, family: string, italic = false) => {
  ctx.font = `${italic ? 'italic ' : ''}${weight} ${Math.round(size)}px ${family}`;
  setSpacing(ctx, 0);
};

const setFace = (ctx: Ctx, face: Face, size: number) => {
  setFont(ctx, face.weight, size, face.family);
  if (face.tracking) setSpacing(ctx, face.tracking);
};

const cased = (face: Face, text: string) => (face.upper ? text.toUpperCase() : text);

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

// Largest size (<= max) at which the text wraps into maxLines lines that all fit the width
function fit(ctx: Ctx, text: string, face: Face, max: number, min: number, maxW: number, maxLines: number) {
  let size = max;
  for (; size > min; size -= 4) {
    setFace(ctx, face, size);
    const lines = wrap(ctx, text, maxW);
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxW)) return { size, lines };
  }
  setFace(ctx, face, min);
  return { size: min, lines: wrap(ctx, text, maxW) };
}

function gradient(ctx: Ctx, x: number, width: number, colours: string[]) {
  const g = ctx.createLinearGradient(x, 0, x + Math.max(width, 1), 0);
  colours.forEach((c, i) => g.addColorStop(colours.length === 1 ? 0 : i / (colours.length - 1), c));
  return g;
}

// ---------------------------------------------------------------------------
// Animation
// ---------------------------------------------------------------------------

// Eased entrance of the next element (1 = in place). Elements inside a group share the group's.
function progress(p: Pen): number {
  if (p.inGroup) return 1;
  const i = p.k++;
  if (p.t === null || p.dry) return 1;
  const x = clamp01((p.t - TEXT_START - i * p.step) / ENTER);
  return 1 - Math.pow(1 - x, 3);
}

// A block that fades and lifts in as one element. The body always runs, so it can measure.
function group<T>(p: Pen, body: () => T, lift = 28): T {
  const e = progress(p);
  const { ctx } = p;
  const outer = p.inGroup;
  p.inGroup = true;
  ctx.save();
  if (!p.dry && e < 1) {
    ctx.globalAlpha *= e;
    ctx.translate(0, (1 - e) * lift);
  }
  try {
    return body();
  } finally {
    ctx.restore();
    p.inGroup = outer;
  }
}

// ---------------------------------------------------------------------------
// Decoration
// ---------------------------------------------------------------------------

function glow(ctx: Ctx, x: number, y: number, r: number, rgb: string, alpha: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

const AURORA_FILL = ['#a68bff', '#ff5caa', '#ffb547', '#3ddcff'];

// Black glass orb with an iridescent rim (same look as the website hero); the rim turns over time
function orb(ctx: Ctx, cx: number, cy: number, r: number, t: number) {
  cy += Math.sin(t * 1.2) * 10;
  glow(ctx, cx, cy, r * 1.7, '166,139,255', 0.32);
  glow(ctx, cx - r * 0.4, cy + r * 0.5, r * 1.4, '255,92,170', 0.16);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (typeof ctx.createConicGradient === 'function') {
    const ring = ctx.createConicGradient(Math.PI * 1.15 + t * 0.7, cx, cy);
    [...AURORA_FILL, AURORA_FILL[0]].forEach((c, i, all) => ring.addColorStop(i / (all.length - 1), c));
    ctx.fillStyle = ring;
  } else {
    ctx.fillStyle = gradient(ctx, cx - r, r * 2, AURORA_FILL);
  }
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  const body = ctx.createRadialGradient(cx + r * 0.05, cy + r * 0.05, 0, cx, cy, r);
  body.addColorStop(0, '#06040d');
  body.addColorStop(0.78, '#06040d');
  body.addColorStop(0.97, 'rgba(6,4,13,0)');
  ctx.fillStyle = body;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();

  const hx = cx - r * 0.3;
  const hy = cy - r * 0.38;
  const shine = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.13);
  shine.addColorStop(0, 'rgba(255,255,255,0.9)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine;
  ctx.fillRect(hx - r * 0.13, hy - r * 0.13, r * 0.26, r * 0.26);
}

// The original post background (black, soft glows, glass orb); glows drift slowly when animated
function auroraBackground(ctx: Ctx, slide: SocialSlide, t: number) {
  const dx = Math.sin(t * 0.4) * 40;
  const dy = Math.cos(t * 0.33) * 30 - 30;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  switch (slide.layout) {
    case 'cover':
      glow(ctx, 160 + dx, H - 200 + dy, 520, '255,92,170', 0.22);
      orb(ctx, W - 110, H * 0.363, 280, t);
      break;
    case 'list':
    case 'compare':
      glow(ctx, W - 40 - dx, 120 - dy, 560, '166,139,255', 0.3);
      break;
    case 'points':
    case 'tags':
      glow(ctx, 60 + dx, 160 - dy, 520, '255,92,170', 0.22);
      break;
    case 'statement':
      glow(ctx, W - 80 - dx, H - 230 + dy, 560, '166,139,255', 0.28);
      // Tucked into the corner so long statements never run into it
      orb(ctx, W - 30, H - 120, 150, t);
      break;
    case 'cta':
      glow(ctx, W - 80 - dx, H - 170 + dy, 640, '166,139,255', 0.34);
      break;
  }
}

function background(ctx: Ctx, slide: SocialSlide, index: number, look: SlideLook, v: Variation, t: number) {
  if (look.style === 'aurora') auroraBackground(ctx, slide, t);
  else THEMES[look.style].background(ctx, t, index, v, W, H);
}

function stripe(ctx: Ctx, pal: Palette) {
  const w = W / pal.fill.length;
  pal.fill.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(w * i, H - 10, w + 1, 10);
  });
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

// Returns the extra height it takes beyond the small label's line
function kicker(p: Pen, text: string, y: number): number {
  if (!text) return 0;
  if (p.bigLabel) {
    const { ctx } = p;
    const label = text.toUpperCase();
    let size = 76;
    setFont(ctx, 800, size, SANS);
    while (ctx.measureText(label).width > TW && size > 36) setFont(ctx, 800, (size -= 4), SANS);
    group(p, () => {
      if (p.dry) return;
      setFont(ctx, 800, size, SANS);
      setSpacing(ctx, 2);
      ctx.fillStyle = p.pal.text;
      if (p.pal.glow) {
        ctx.shadowColor = p.pal.glow;
        ctx.shadowBlur = 24;
      }
      ctx.fillText(label, alignX(p, ctx.measureText(label).width), y + size * 0.55);
    }, 20);
    return size * 0.95;
  }
  group(p, () => {
    if (p.dry) return;
    const { ctx } = p;
    setFont(ctx, 700, 22, SANS);
    setSpacing(ctx, 5);
    const x = alignX(p, 30 + ctx.measureText(text.toUpperCase()).width);
    ctx.save();
    ctx.shadowColor = p.pal.dot;
    ctx.shadowBlur = 18;
    ctx.fillStyle = p.pal.dot;
    ctx.beginPath();
    ctx.arc(x + 7, y - 8, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = p.pal.kicker;
    ctx.fillText(text.toUpperCase(), x + 30, y);
  }, 16);
  return 0;
}

// The four corners: the founder's text where given ("-" leaves the corner empty), otherwise the
// design's default: logo, @handle and "SWIPE" on the first slide, the page number on the others
function corners(p: Pen, slide: SocialSlide, index: number, total: number) {
  const { ctx, pal } = p;
  const custom: CornerTexts = slide.corners ?? { topLeft: '', topRight: '', bottomLeft: '', bottomRight: '' };
  const first = index === 0;
  // On inner slides the top row sits above the kicker unless everything is left-aligned as designed
  const topY = first ? 140 : p.align === 'left' && !custom.topLeft ? 118 : 64;
  const bottomY = first ? H - 120 : H - 52;

  const text = (value: string, right: boolean, y: number) =>
    group(p, () => {
      if (p.dry) return;
      const c = fit(ctx, value, { family: SANS, weight: 700, tracking: 2, upper: false }, 26, 14, TW / 2 - 12, 1);
      setFace(ctx, { family: SANS, weight: 700, tracking: 2, upper: false }, c.size);
      ctx.fillStyle = pal.text;
      ctx.globalAlpha *= 0.85;
      ctx.textAlign = right ? 'right' : 'left';
      ctx.fillText(c.lines[0] ?? value, right ? W - PAD : PAD, y);
    }, 12);
  const slot = (value: string, right: boolean, y: number, fallback?: () => void) => {
    if (value === '-') return;
    if (value) text(value, right, y);
    else fallback?.();
  };

  slot(custom.topLeft, false, topY, first ? () =>
    group(p, () => {
      if (p.dry) return;
      setFont(ctx, 700, 44, SERIF);
      setSpacing(ctx, 6);
      ctx.fillStyle = pal.text;
      ctx.fillText('RMAST', PAD, 140);
      const w = ctx.measureText('RMAST').width;
      setFont(ctx, 600, 36, SERIF, true);
      ctx.fillStyle = pal.brandAccent;
      ctx.fillText('Studio', PAD + w + 18, 140);
    }, 12) : undefined);
  slot(custom.topRight, true, topY, first ? undefined : () =>
    group(p, () => {
      if (p.dry) return;
      setFont(ctx, 700, 22, SANS);
      setSpacing(ctx, 4);
      ctx.fillStyle = pal.page;
      ctx.textAlign = 'right';
      ctx.fillText(`${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, W - PAD, topY);
    }, 12));
  slot(custom.bottomLeft, false, bottomY, first ? () =>
    group(p, () => {
      if (p.dry) return;
      setFont(ctx, 600, 26, SANS);
      ctx.fillStyle = pal.muted;
      ctx.fillText(`@${CONTACT.instagramHandle}`, PAD, bottomY);
    }, 12) : undefined);
  slot(custom.bottomRight, true, bottomY, first ? () =>
    group(p, () => {
      if (p.dry) return;
      setFont(ctx, 700, 24, SANS);
      setSpacing(ctx, 5);
      ctx.fillStyle = pal.muted;
      ctx.textAlign = 'right';
      // A single-slide post has nothing to swipe to, so it points to the bio link instead
      ctx.fillText(total > 1 ? 'SWIPE  →' : 'LINK IN BIO  ↗', W - PAD, bottomY);
    }, 12) : undefined);
}

// Draws pre-wrapped lines, each rising out of a mask; returns the new y (baseline of the last line)
function lines(p: Pen, rows: string[], y: number, size: number, lineH: number, fill: string | 'accent', face: Face, x = PAD, glowing = false) {
  const { ctx } = p;
  for (const row of rows) {
    y += size * lineH;
    const e = progress(p);
    if (p.dry || e <= 0) continue;
    const base = y;
    ctx.save();
    if (e < 1) {
      const top = base - size * 1.08;
      const bottom = base + size * 0.34;
      ctx.beginPath();
      ctx.rect(0, top, W, bottom - top);
      ctx.clip();
      ctx.globalAlpha *= Math.min(1, e * 1.5);
      ctx.translate(0, (1 - e) * (bottom - top));
    }
    setFace(ctx, face, size);
    const width = ctx.measureText(row).width;
    // Column text follows the slide's alignment; indented text (numbered points) stays put
    const dx = x === PAD ? alignX(p, width) : x;
    if (fill === 'accent' && p.pal.marker && glowing) {
      ctx.fillStyle = p.pal.marker;
      ctx.fillRect(dx - 12, base - size * 0.8, width + 24, size * 1.0);
    }
    ctx.fillStyle = fill === 'accent' ? gradient(ctx, dx, width, p.pal.accent) : fill;
    // Glow is left off while the line is masked, so it never shows the mask's hard edge
    if (glowing && p.pal.glow && e >= 1) {
      ctx.shadowColor = p.pal.glow;
      ctx.shadowBlur = 28;
    }
    ctx.fillText(row, dx, base);
    ctx.restore();
  }
  return y;
}

function paragraph(p: Pen, text: string, y: number, size: number, colour: string, maxW = TW, weight = 500, lineH = 1.42) {
  if (!text) return y;
  setFont(p.ctx, weight, size, SANS);
  return lines(p, wrap(p.ctx, text, maxW), y, size, lineH, colour, sans(weight));
}

// Headline in the text colour with the accent highlight underneath
function title(p: Pen, slide: SocialSlide, y: number, max: number, min: number, maxW = TW, maxLines = 3) {
  const face = p.pal.display;
  if (slide.headline) {
    const h = fit(p.ctx, cased(face, slide.headline), face, max * p.s, min, maxW, maxLines);
    y = lines(p, h.lines, y, h.size, 1.0, p.pal.text, face, PAD, true);
  }
  if (slide.highlight) {
    const h = fit(p.ctx, cased(face, slide.highlight), face, max * p.s, min, maxW, maxLines);
    y = lines(p, h.lines, y, h.size, 1.02, 'accent', face, PAD, true);
  }
  return y;
}

// Divider that draws itself from left to right
function rule(p: Pen, y: number) {
  const e = progress(p);
  if (p.dry) return;
  p.ctx.fillStyle = p.pal.rule;
  p.ctx.fillRect(PAD, y, TW * e, 1.5);
}

function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

// ---------------------------------------------------------------------------
// Layouts. Each returns how far its content overflows its space (<= 0 means it fits).
// ---------------------------------------------------------------------------

function cover(p: Pen, slide: SocialSlide) {
  const { ctx, pal } = p;
  const face = pal.display;
  let y = Math.round(H * 0.29);
  y += kicker(p, slide.kicker, y);
  y += 28;
  ctx.save();
  if (!p.dry && pal.dark) {
    ctx.shadowColor = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur = 36;
  }
  if (slide.headline) {
    const h = fit(ctx, cased(face, slide.headline), face, 168 * p.s, 76, TW, 2);
    y = lines(p, h.lines, y, h.size, 0.98, pal.text, face, PAD, true);
  }
  if (slide.highlight) {
    const h = fit(ctx, cased(face, slide.highlight), face, 200 * p.s, 84, TW, 2);
    y = lines(p, h.lines, y + 8, h.size, 0.98, 'accent', face, PAD, true);
  }
  y = paragraph(p, slide.body, y + 36, 34 * p.s, pal.lead, Math.min(780, TW));
  ctx.restore();
  return y - (H - 200);
}

function list(p: Pen, slide: SocialSlide) {
  const { ctx, pal } = p;
  let y = 110;
  y += kicker(p, slide.kicker, y);
  y = title(p, slide, y + 24, 96, 56);
  y = paragraph(p, slide.body, y + 16, 28 * p.s, pal.muted);
  y += 34;
  rule(p, y);
  const rowH = 96 * p.s;
  for (const item of slide.items) {
    const top = y;
    group(p, () => {
      const valueSize = 34 * p.s;
      setFont(ctx, 700, valueSize, SANS);
      const valueW = ctx.measureText(item.value).width;
      const label = fit(ctx, item.label, sans(600), 34 * p.s, 22, TW - valueW - 40, 1);
      const base = top + rowH / 2 + label.size * 0.35;
      if (p.dry) return;
      setFont(ctx, 600, label.size, SANS);
      ctx.fillStyle = pal.text;
      ctx.fillText(label.lines[0] ?? '', PAD, base);
      setFont(ctx, 700, valueSize, SANS);
      ctx.fillStyle = gradient(ctx, PAD + TW - valueW, valueW, pal.accent);
      ctx.textAlign = 'right';
      ctx.fillText(item.value, PAD + TW, base);
    });
    y += rowH;
    rule(p, y);
  }
  return y - (H - 130);
}

function points(p: Pen, slide: SocialSlide) {
  const { pal } = p;
  let y = 110;
  y += kicker(p, slide.kicker, y);
  y = title(p, slide, y + 24, 92, 56);
  y = paragraph(p, slide.body, y + 16, 28 * p.s, pal.muted);
  y += 30;
  const textX = PAD + 98;
  slide.points.forEach((pt, i) => {
    rule(p, y);
    const top = y + 30;
    y = group(p, () => {
      lines(p, [String(i + 1).padStart(2, '0')], top - 6, 46 * p.s, 0.9, 'accent', { ...pal.display, weight: pal.display.family === SERIF ? 900 : 700 });
      const t = fit(p.ctx, pt.title, sans(700), 36 * p.s, 24, TW - 98, 2);
      let yy = lines(p, t.lines, top - 8, t.size, 1.12, pal.text, sans(700), textX);
      setFont(p.ctx, 400, 26 * p.s, SANS);
      yy = lines(p, wrap(p.ctx, pt.text, TW - 98), yy + 4, 26 * p.s, 1.4, pal.soft, sans(400), textX);
      return yy + 30;
    });
  });
  rule(p, y);
  return y - (H - 130);
}

function statement(p: Pen, slide: SocialSlide) {
  const { ctx, pal } = p;
  const face = pal.display;
  let y = 110;
  y += kicker(p, slide.kicker, y);
  y += 60;
  // Headline and highlight share one size so the statement reads as one sentence
  let size = 112 * p.s;
  let head: string[] = [];
  let high: string[] = [];
  for (; size > 52; size -= 4) {
    setFace(ctx, face, size);
    head = slide.headline ? wrap(ctx, cased(face, slide.headline), TW) : [];
    high = slide.highlight ? wrap(ctx, cased(face, slide.highlight), TW) : [];
    const widest = Math.max(0, ...[...head, ...high].map((l) => ctx.measureText(l).width));
    if (head.length + high.length <= 7 && widest <= TW) break;
  }
  y = lines(p, head, y, size, 1.04, pal.text, face, PAD, true);
  y = lines(p, high, y + 6, size, 1.04, 'accent', face, PAD, true);
  y = paragraph(p, slide.body, y + 44, 30 * p.s, pal.lead, Math.min(800, TW));
  return y - (H - 170);
}

function cta(p: Pen, slide: SocialSlide) {
  const { ctx, pal } = p;
  let y = 110;
  y += kicker(p, slide.kicker, y);
  y = title(p, slide, y + 24, 96, 56, TW, 3);
  y = paragraph(p, slide.body, y + 30, 32 * p.s, pal.lead, Math.min(860, TW));

  group(p, () => {
    if (p.dry) return;
    const label = slide.button || 'LINK IN BIO  ↗';
    const f = fit(ctx, label, { family: SANS, weight: 700, tracking: 4, upper: false }, 30, 18, TW - 80, 1);
    setFace(ctx, { family: SANS, weight: 700, tracking: 4, upper: false }, f.size);
    const bw = ctx.measureText(label).width + 80;
    const bx = alignX(p, bw);
    const by = H - 260;
    ctx.save();
    ctx.shadowColor = pal.shadow;
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = gradient(ctx, bx, bw, pal.fill);
    ctx.fillRect(bx, by, bw, 92);
    ctx.restore();
    ctx.fillStyle = pal.buttonText;
    ctx.fillText(label, bx + 40, by + 46 + f.size * 0.36);
  });

  group(p, () => {
    if (p.dry) return;
    const contact = `DM us  ·  WhatsApp ${CONTACT.whatsappDisplay}  ·  ${CONTACT.email}`;
    const c = fit(ctx, contact, sans(500), 24, 16, TW, 1);
    setFont(ctx, 500, c.size, SANS);
    ctx.fillStyle = pal.muted;
    ctx.fillText(contact, alignX(p, ctx.measureText(contact).width), H - 110);
  }, 12);
  return y - (H - 300);
}

// Short labels as pills, wrapped across rows ("Price", "Commute", "Schools")
function tags(p: Pen, slide: SocialSlide) {
  const { ctx, pal } = p;
  let y = 110;
  y += kicker(p, slide.kicker, y);
  y = title(p, slide, y + 24, 100, 56);
  y = paragraph(p, slide.body, y + 16, 30 * p.s, pal.muted);
  y += 50;
  const size = 52 * p.s;
  const padX = 42 * p.s;
  const h = size * 2;
  const gap = 18;
  let x = PAD;
  for (const item of slide.items) {
    setFont(ctx, 700, size, SANS);
    const w = Math.min(ctx.measureText(item.label).width + padX * 2, TW);
    if (x > PAD && x + w > PAD + TW) {
      x = PAD;
      y += h + gap;
    }
    const [px, py] = [x, y];
    group(p, () => {
      if (p.dry) return;
      roundRect(ctx, px, py, w, h, h / 2);
      ctx.fillStyle = pal.pillFill;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = pal.pillStroke;
      ctx.stroke();
      setFont(ctx, 700, size, SANS);
      ctx.fillStyle = pal.text;
      ctx.fillText(item.label, px + padX, py + h / 2 + size * 0.35);
    }, 20);
    x += w + gap;
  }
  return y + h - (H - 130);
}

// The weak version crossed out, then the better version in a gradient-bordered card
function compare(p: Pen, slide: SocialSlide) {
  const { ctx, pal } = p;
  let y = 110;
  y += kicker(p, slide.kicker, y);
  y = title(p, slide, y + 24, 100, 56);
  y = paragraph(p, slide.body, y + 16, 30 * p.s, pal.muted);
  y += 50;
  const size = 46 * p.s;
  const pad = 44 * p.s;
  const markW = 70 * p.s;
  const textW = TW - pad * 2 - markW;
  const lineH = size * 1.3;

  const card = (text: string, good: boolean) =>
    group(p, () => {
      setFont(ctx, 600, size, SANS);
      const rows = wrap(ctx, text, textW);
      const h = pad * 2 + rows.length * lineH - (lineH - size);
      if (!p.dry) {
        ctx.save();
        if (good) {
          ctx.shadowColor = pal.shadow;
          ctx.shadowBlur = 70;
          ctx.shadowOffsetY = 24;
          roundRect(ctx, PAD, y, TW, h, 22);
          ctx.fillStyle = gradient(ctx, PAD, TW, pal.fill);
          ctx.fill();
          ctx.restore();
          ctx.save();
          roundRect(ctx, PAD + 3, y + 3, TW - 6, h - 6, 19);
          ctx.fillStyle = pal.goodInner;
          ctx.fill();
        } else {
          roundRect(ctx, PAD, y, TW, h, 22);
          ctx.fillStyle = pal.bad;
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = pal.badBorder;
          ctx.stroke();
        }
        ctx.restore();
        setFont(ctx, 800, size, SANS);
        ctx.fillStyle = good ? pal.goodMark : pal.badMark;
        ctx.fillText(good ? '✓' : '✗', PAD + pad, y + pad + size * 0.85);
        setFont(ctx, 600, size, SANS);
        rows.forEach((row, i) => {
          const base = y + pad + size * 0.85 + i * lineH;
          ctx.fillStyle = good ? pal.text : pal.badText;
          ctx.fillText(row, PAD + pad + markW, base);
          if (!good) {
            ctx.save();
            ctx.globalAlpha *= 0.7;
            ctx.fillStyle = pal.strike;
            ctx.fillRect(PAD + pad + markW, base - size * 0.3, ctx.measureText(row).width, 3);
            ctx.restore();
          }
        });
      }
      y += h;
    }, 36);

  if (slide.before) card(slide.before, false);
  y += 28;
  if (slide.after) card(slide.after, true);
  return y - (H - 130);
}

function drawLayout(p: Pen, slide: SocialSlide, index: number, total: number): number {
  corners(p, slide, index, total);
  switch (slide.layout) {
    case 'cover':
      return cover(p, slide);
    case 'list':
      return list(p, slide);
    case 'points':
      return points(p, slide);
    case 'statement':
      return statement(p, slide);
    case 'tags':
      return tags(p, slide);
    case 'compare':
      return compare(p, slide);
    case 'cta':
      return cta(p, slide);
  }
}

// Measures the slide once and returns a function that draws it at any moment:
// t = seconds into the animation, or null for the finished still image.
// The caller's canvas transform maps the chosen pixel size (renderSlide sets it; previews scale it down).
export function prepareSlide(ctx: Ctx, slide: SocialSlide, index: number, total: number, look: SlideLook = DEFAULT_LOOK, size: PostSize = DEFAULT_SIZE) {
  const frame = designFrame(size);
  useFrame(frame);
  const pal = palette(look.style);
  const v = makeVariation(look.seed);
  const align = slide.align ?? 'left';
  const bigLabel = slide.label === 'big';
  const pen = (s: number, dry: boolean, t: number | null, step = 0): Pen => ({ ctx, dry, s, pal, t, k: 0, step, inGroup: false, align, bigLabel });

  // Size the text to the slide: shrink in steps if it overflows; otherwise grow it (up to 40%)
  // so short copy fills the slide instead of leaving an empty bottom half. The cover is already big.
  ctx.textBaseline = 'alphabetic';
  const overflow = (scale: number) => drawLayout(pen(scale, true, null), slide, index, total);
  let s = 1;
  if (overflow(1) > 0) {
    // Shorter formats (square, banners) have less room, so they may shrink further
    for (let i = 0; i < 10 && overflow(s) > 0; i++) s -= 0.06;
  } else if (slide.layout !== 'cover') {
    for (let grow = 1.05; grow <= 1.4 && overflow(grow) <= -40; grow += 0.05) s = grow;
  }

  // Spread the entrances so the last element lands by TEXT_DONE, however much text there is
  const counter = pen(s, true, null);
  drawLayout(counter, slide, index, total);
  const step = counter.k > 1 ? Math.min(MAX_STAGGER, (TEXT_DONE - ENTER - TEXT_START) / (counter.k - 1)) : 0;
  const stillT = look.style === 'aurora' ? 0 : STILL_T;

  return (t: number | null) => {
    useFrame(frame);
    ctx.save();
    ctx.scale(frame.scale, frame.scale);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    background(ctx, slide, index, look, v, t ?? stillT);
    drawLayout(pen(s, false, t, step), slide, index, total);
    stripe(ctx, pal);
    ctx.restore();
    // A "muted" slide is grey and dull (e.g. the "before" of a before/after)
    if (slide.tone === 'muted' && 'filter' in ctx) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.filter = 'grayscale(1) brightness(0.72) contrast(0.92)';
      ctx.drawImage(ctx.canvas, 0, 0);
      ctx.restore();
    }
  };
}

// Draws the finished slide at exactly size.width x size.height pixels
export function renderSlide(canvas: HTMLCanvasElement, slide: SocialSlide, index: number, total: number, look?: SlideLook, size: PostSize = DEFAULT_SIZE): void {
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  prepareSlide(ctx, slide, index, total, look, size)(null);
}

export function slideToBlob(slide: SocialSlide, index: number, total: number, look?: SlideLook, size?: PostSize): Promise<Blob> {
  const canvas = document.createElement('canvas');
  renderSlide(canvas, slide, index, total, look, size);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create the image'))), 'image/png')
  );
}
