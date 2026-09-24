// Draws one Instagram carousel slide (1080x1350) in RMAST's dark aurora style on a canvas.
// Canvas (not HTML screenshots) keeps export exact and works under the site's strict CSP.
import type { SocialSlide } from '../../types';
import { CONTACT } from '../../config/contact';

export const SLIDE_W = 1080;
export const SLIDE_H = 1350;
const PAD = 88;
const TEXT_W = SLIDE_W - PAD * 2;

const SERIF = '"Playfair Display", Georgia, serif';
const SANS = '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';
const AURORA_TEXT = ['#c9b8ff', '#ff8cc6', '#ffcf85', '#86e8ff'];
const AURORA_FILL = ['#a68bff', '#ff5caa', '#ffb547', '#3ddcff'];
const WHITE = '#ffffff';
const LEAD = '#e6e1f5';
const MUTED = '#b1abc9';
const SOFT = '#c9c3dd';
const RULE = '#2a2340';

type Ctx = CanvasRenderingContext2D;

// Every layout runs twice: a dry run to measure, then the real draw at a size that fits
interface Pen {
  ctx: Ctx;
  dry: boolean;
  s: number; // text scale (shrinks until the content fits)
}

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

const setFont = (ctx: Ctx, weight: string | number, size: number, family: string, italic = false) => {
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

// Largest size (<= max) at which the text wraps into maxLines lines that all fit the width
function fit(ctx: Ctx, text: string, family: string, weight: number, max: number, min: number, maxW: number, maxLines: number) {
  let size = max;
  for (; size > min; size -= 4) {
    setFont(ctx, weight, size, family);
    const lines = wrap(ctx, text, maxW);
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= maxW)) return { size, lines };
  }
  setFont(ctx, weight, min, family);
  return { size: min, lines: wrap(ctx, text, maxW) };
}

function auroraGradient(ctx: Ctx, x: number, width: number, colours = AURORA_TEXT) {
  const g = ctx.createLinearGradient(x, 0, x + Math.max(width, 1), 0);
  colours.forEach((c, i) => g.addColorStop(i / (colours.length - 1), c));
  return g;
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

// Black glass orb with an iridescent rim (same look as the website hero)
function orb(ctx: Ctx, cx: number, cy: number, r: number) {
  glow(ctx, cx, cy, r * 1.7, '166,139,255', 0.32);
  glow(ctx, cx - r * 0.4, cy + r * 0.5, r * 1.4, '255,92,170', 0.16);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (typeof ctx.createConicGradient === 'function') {
    const ring = ctx.createConicGradient(Math.PI * 1.15, cx, cy);
    [...AURORA_FILL, AURORA_FILL[0]].forEach((c, i, all) => ring.addColorStop(i / (all.length - 1), c));
    ctx.fillStyle = ring;
  } else {
    ctx.fillStyle = auroraGradient(ctx, cx - r, r * 2, AURORA_FILL);
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

function stripe(ctx: Ctx) {
  AURORA_FILL.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect((SLIDE_W / 4) * i, SLIDE_H - 10, SLIDE_W / 4, 10);
  });
}

function background(ctx: Ctx, slide: SocialSlide) {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, SLIDE_W, SLIDE_H);
  switch (slide.layout) {
    case 'cover':
      glow(ctx, 160, 1150, 520, '255,92,170', 0.22);
      orb(ctx, 970, 490, 280);
      break;
    case 'list':
      glow(ctx, 1040, 120, 560, '166,139,255', 0.3);
      break;
    case 'points':
      glow(ctx, 60, 160, 520, '255,92,170', 0.22);
      break;
    case 'statement':
      glow(ctx, 1000, 1120, 560, '166,139,255', 0.28);
      orb(ctx, 1010, 1120, 190);
      break;
    case 'cta':
      glow(ctx, 1000, 1180, 640, '166,139,255', 0.34);
      break;
  }
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

function kicker(p: Pen, text: string, y: number) {
  if (!text || p.dry) return;
  const { ctx } = p;
  ctx.save();
  ctx.shadowColor = '#ff5caa';
  ctx.shadowBlur = 18;
  ctx.fillStyle = '#ff5caa';
  ctx.beginPath();
  ctx.arc(PAD + 7, y - 8, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  setFont(ctx, 700, 22, SANS);
  setSpacing(ctx, 5);
  ctx.fillStyle = '#c9b8ff';
  ctx.fillText(text.toUpperCase(), PAD + 30, y);
  setSpacing(ctx, 0);
}

function pageLabel(p: Pen, index: number, total: number) {
  if (p.dry || index === 0) return;
  const { ctx } = p;
  setFont(ctx, 700, 22, SANS);
  setSpacing(ctx, 4);
  ctx.fillStyle = '#6e6590';
  ctx.textAlign = 'right';
  ctx.fillText(`${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, SLIDE_W - PAD, 118);
  ctx.textAlign = 'left';
  setSpacing(ctx, 0);
}

// Draws pre-wrapped lines; returns the new y (baseline of the last line + descent)
function lines(p: Pen, rows: string[], y: number, size: number, lineH: number, fill: string | 'aurora', weight: number, family: string, x = PAD) {
  const { ctx } = p;
  setFont(ctx, weight, size, family);
  for (const row of rows) {
    y += size * lineH;
    if (!p.dry) {
      ctx.fillStyle = fill === 'aurora' ? auroraGradient(ctx, x, ctx.measureText(row).width) : fill;
      ctx.fillText(row, x, y);
    }
  }
  return y;
}

function paragraph(p: Pen, text: string, y: number, size: number, colour: string, maxW = TEXT_W, weight = 500, lineH = 1.42) {
  if (!text) return y;
  setFont(p.ctx, weight, size, SANS);
  return lines(p, wrap(p.ctx, text, maxW), y, size, lineH, colour, weight, SANS);
}

// White headline with the gradient highlight underneath
function title(p: Pen, slide: SocialSlide, y: number, max: number, min: number, maxW = TEXT_W, maxLines = 2) {
  if (slide.headline) {
    const h = fit(p.ctx, slide.headline, SERIF, 900, max * p.s, min, maxW, maxLines);
    y = lines(p, h.lines, y, h.size, 1.0, WHITE, 900, SERIF);
  }
  if (slide.highlight) {
    const h = fit(p.ctx, slide.highlight, SERIF, 900, max * p.s, min, maxW, maxLines);
    y = lines(p, h.lines, y, h.size, 1.02, 'aurora', 900, SERIF);
  }
  return y;
}

function rule(p: Pen, y: number) {
  if (p.dry) return;
  p.ctx.fillStyle = RULE;
  p.ctx.fillRect(PAD, y, TEXT_W, 1.5);
}

// ---------------------------------------------------------------------------
// Layouts. Each returns how far its content overflows its space (<= 0 means it fits).
// ---------------------------------------------------------------------------

function cover(p: Pen, slide: SocialSlide) {
  const { ctx } = p;
  if (!p.dry) {
    setFont(ctx, 700, 44, SERIF);
    setSpacing(ctx, 6);
    ctx.fillStyle = WHITE;
    ctx.fillText('RMAST', PAD, 140);
    const w = ctx.measureText('RMAST').width;
    setSpacing(ctx, 0);
    setFont(ctx, 600, 36, SERIF, true);
    ctx.fillStyle = '#a68bff';
    ctx.fillText('Studio', PAD + w + 18, 140);
  }
  let y = 390;
  kicker(p, slide.kicker, y);
  y += 28;
  if (!p.dry) {
    ctx.shadowColor = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur = 36;
  }
  if (slide.headline) {
    const h = fit(ctx, slide.headline, SERIF, 900, 168 * p.s, 76, TEXT_W, 2);
    y = lines(p, h.lines, y, h.size, 0.98, WHITE, 900, SERIF);
  }
  if (slide.highlight) {
    const h = fit(ctx, slide.highlight, SERIF, 900, 200 * p.s, 84, TEXT_W, 2);
    y = lines(p, h.lines, y + 8, h.size, 0.98, 'aurora', 900, SERIF);
  }
  y = paragraph(p, slide.body, y + 36, 34 * p.s, LEAD, 780);
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  if (!p.dry) {
    setFont(ctx, 600, 26, SANS);
    ctx.fillStyle = MUTED;
    ctx.fillText(`@${CONTACT.instagramHandle}`, PAD, 1230);
    setFont(ctx, 700, 24, SANS);
    setSpacing(ctx, 5);
    ctx.textAlign = 'right';
    ctx.fillText('SWIPE  →', SLIDE_W - PAD, 1230);
    ctx.textAlign = 'left';
    setSpacing(ctx, 0);
  }
  return y - 1150;
}

function list(p: Pen, slide: SocialSlide, index: number, total: number) {
  const { ctx } = p;
  pageLabel(p, index, total);
  let y = 110;
  kicker(p, slide.kicker, y);
  y = title(p, slide, y + 24, 96, 56);
  y = paragraph(p, slide.body, y + 16, 28 * p.s, MUTED);
  y += 34;
  rule(p, y);
  const rowH = 96 * p.s;
  for (const item of slide.items) {
    const valueSize = 34 * p.s;
    setFont(ctx, 700, valueSize, SANS);
    const valueW = ctx.measureText(item.value).width;
    const label = fit(ctx, item.label, SANS, 600, 34 * p.s, 22, TEXT_W - valueW - 40, 1);
    const base = y + rowH / 2 + label.size * 0.35;
    if (!p.dry) {
      setFont(ctx, 600, label.size, SANS);
      ctx.fillStyle = WHITE;
      ctx.fillText(label.lines[0] ?? '', PAD, base);
      setFont(ctx, 700, valueSize, SANS);
      ctx.fillStyle = auroraGradient(ctx, SLIDE_W - PAD - valueW, valueW);
      ctx.textAlign = 'right';
      ctx.fillText(item.value, SLIDE_W - PAD, base);
      ctx.textAlign = 'left';
    }
    y += rowH;
    rule(p, y);
  }
  return y - 1220;
}

function points(p: Pen, slide: SocialSlide, index: number, total: number) {
  pageLabel(p, index, total);
  let y = 110;
  kicker(p, slide.kicker, y);
  y = title(p, slide, y + 24, 92, 56);
  y = paragraph(p, slide.body, y + 16, 28 * p.s, MUTED);
  y += 30;
  const textX = PAD + 98;
  slide.points.forEach((pt, i) => {
    rule(p, y);
    const top = y + 30;
    lines(p, [String(i + 1).padStart(2, '0')], top - 6, 46 * p.s, 0.9, 'aurora', 900, SERIF);
    const t = fit(p.ctx, pt.title, SANS, 700, 36 * p.s, 24, TEXT_W - 98, 2);
    let yy = lines(p, t.lines, top - 8, t.size, 1.12, WHITE, 700, SANS, textX);
    setFont(p.ctx, 400, 26 * p.s, SANS);
    yy = lines(p, wrap(p.ctx, pt.text, TEXT_W - 98), yy + 4, 26 * p.s, 1.4, SOFT, 400, SANS, textX);
    y = yy + 30;
  });
  rule(p, y);
  return y - 1220;
}

function statement(p: Pen, slide: SocialSlide, index: number, total: number) {
  const { ctx } = p;
  pageLabel(p, index, total);
  let y = 110;
  kicker(p, slide.kicker, y);
  y += 60;
  // Headline and highlight share one size so the statement reads as one sentence
  let size = 112 * p.s;
  let head: string[] = [];
  let high: string[] = [];
  for (; size > 52; size -= 4) {
    setFont(ctx, 900, size, SERIF);
    head = slide.headline ? wrap(ctx, slide.headline, TEXT_W) : [];
    high = slide.highlight ? wrap(ctx, slide.highlight, TEXT_W) : [];
    const widest = Math.max(0, ...[...head, ...high].map((l) => ctx.measureText(l).width));
    if (head.length + high.length <= 7 && widest <= TEXT_W) break;
  }
  y = lines(p, head, y, size, 1.04, WHITE, 900, SERIF);
  y = lines(p, high, y + 6, size, 1.04, 'aurora', 900, SERIF);
  y = paragraph(p, slide.body, y + 44, 30 * p.s, LEAD, 800);
  return y - 1180;
}

function cta(p: Pen, slide: SocialSlide, index: number, total: number) {
  const { ctx } = p;
  pageLabel(p, index, total);
  let y = 110;
  kicker(p, slide.kicker, y);
  y = title(p, slide, y + 24, 96, 56, TEXT_W, 3);
  y = paragraph(p, slide.body, y + 30, 32 * p.s, LEAD, 860);

  if (!p.dry) {
    // Gradient button
    setFont(ctx, 700, 30, SANS);
    setSpacing(ctx, 4);
    const label = 'LINK IN BIO  ↗';
    const bw = ctx.measureText(label).width + 80;
    const by = 1090;
    ctx.save();
    ctx.shadowColor = 'rgba(255,92,170,0.55)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = auroraGradient(ctx, PAD, bw, AURORA_FILL);
    ctx.fillRect(PAD, by, bw, 92);
    ctx.restore();
    ctx.fillStyle = '#0a0a0c';
    ctx.fillText(label, PAD + 40, by + 57);
    setSpacing(ctx, 0);

    const contact = `DM us  ·  WhatsApp ${CONTACT.whatsappDisplay}  ·  ${CONTACT.email}`;
    const c = fit(ctx, contact, SANS, 500, 24, 16, TEXT_W, 1);
    setFont(ctx, 500, c.size, SANS);
    ctx.fillStyle = MUTED;
    ctx.fillText(contact, PAD, 1240);
  }
  return y - 1050;
}

function drawLayout(p: Pen, slide: SocialSlide, index: number, total: number): number {
  switch (slide.layout) {
    case 'cover':
      return cover(p, slide);
    case 'list':
      return list(p, slide, index, total);
    case 'points':
      return points(p, slide, index, total);
    case 'statement':
      return statement(p, slide, index, total);
    case 'cta':
      return cta(p, slide, index, total);
  }
}

export function renderSlide(canvas: HTMLCanvasElement, slide: SocialSlide, index: number, total: number): void {
  canvas.width = SLIDE_W;
  canvas.height = SLIDE_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.textBaseline = 'alphabetic';

  // Size the text to the slide: shrink in steps if it overflows; otherwise grow it (up to 40%)
  // so short copy fills the slide instead of leaving an empty bottom half. The cover is already big.
  const overflow = (scale: number) => drawLayout({ ctx, dry: true, s: scale }, slide, index, total);
  let s = 1;
  if (overflow(1) > 0) {
    for (let i = 0; i < 8 && overflow(s) > 0; i++) s -= 0.07;
  } else if (slide.layout !== 'cover') {
    for (let grow = 1.05; grow <= 1.4 && overflow(grow) <= -40; grow += 0.05) s = grow;
  }

  background(ctx, slide);
  drawLayout({ ctx, dry: false, s }, slide, index, total);
  stripe(ctx);
}

export function slideToBlob(slide: SocialSlide, index: number, total: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  renderSlide(canvas, slide, index, total);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not create the image'))), 'image/png')
  );
}
