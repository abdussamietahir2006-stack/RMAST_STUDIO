// Visual looks for reels. Each style sets the type, colours and animated background; a per-video
// seed varies the details within a style (orb path, colour order, shape positions), so two reels in
// the same style still look different.
import type { VideoStyle } from '../../types';

export const VIDEO_W = 1080;
export const VIDEO_H = 1920;

export const SERIF = '"Playfair Display", Georgia, serif';
export const SANS = '"Plus Jakarta Sans", "Segoe UI", Arial, sans-serif';

type Ctx = CanvasRenderingContext2D;

export const STYLE_NAMES: Record<VideoStyle, string> = {
  aurora: 'Aurora (dark glass orb)',
  editorial: 'Editorial (light, elegant)',
  neon: 'Neon (synthwave sun)',
  bold: 'Bold (colour blocks)',
  mono: 'Mono (black & amber)'
};
export const STYLES = Object.keys(STYLE_NAMES) as VideoStyle[];

export interface Variation {
  spots: { x: number; y: number; r: number }[]; // where the hero shape sits in each scene
  palette: string[]; // scene colours (bold style)
  rnd: () => number;
}

export interface Theme {
  display: { family: string; weight: number; upper: boolean; tracking: number };
  text: string;
  lead: string;
  muted: string;
  kicker: string;
  dot: string;
  accent: string[]; // gradient for highlight text and numbers
  fill: string[]; // buttons, rings, wipes
  rule: string;
  pill: string;
  card: string;
  cardBorder: string;
  bad: string;
  badBorder: string;
  badText: string;
  badMark: string;
  goodMark: string;
  goodInner: string;
  strike: string;
  buttonText: string;
  glow: string | null; // text glow colour (neon)
  brandAccent: string;
  track: string; // progress bar track
  fade: string; // colour the reel fades to at the end
  align: 'left' | 'center';
  // Draws the animated background; w/h default to the reel size (posts pass 1080x1350)
  background: (ctx: Ctx, t: number, scenePos: number, v: Variation, w?: number, h?: number) => void;
}

// ---------------------------------------------------------------------------
// Shared drawing helpers
// ---------------------------------------------------------------------------

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(list: T[], rnd: () => number): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function glow(ctx: Ctx, x: number, y: number, r: number, rgb: string, alpha: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${alpha})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

export function linear(ctx: Ctx, x0: number, y0: number, x1: number, y1: number, colours: string[]) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  colours.forEach((c, i) => g.addColorStop(colours.length === 1 ? 0 : i / (colours.length - 1), c));
  return g;
}

// Where the hero shape is between two scene spots (it glides on scene changes)
function spotAt(v: Variation, scenePos: number, W: number, H: number) {
  const i = Math.floor(scenePos);
  const f = easeInOutCubic(scenePos - i);
  const a = v.spots[i % v.spots.length];
  const b = v.spots[(i + 1) % v.spots.length];
  return { x: lerp(a.x, b.x, f) * W, y: lerp(a.y, b.y, f) * H, r: lerp(a.r, b.r, f) * (H / VIDEO_H) };
}

// Particles are fixed per reel (seeded) and drift upward
function particles(ctx: Ctx, t: number, count: number, colour: (a: number, violet: boolean) => string, W: number, H: number) {
  const r = seeded(7);
  for (let k = 0; k < count; k++) {
    const x = r() * W;
    const y0 = r() * H;
    const size = 1.5 + r() * 3;
    const speed = 18 + r() * 60;
    const ph = r() * Math.PI * 2;
    const violet = r() > 0.6;
    const y = (((y0 - t * speed) % H) + H) % H;
    ctx.fillStyle = colour(0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2.4 + ph)), violet);
    ctx.beginPath();
    ctx.arc(x + Math.sin(t * 0.8 + ph) * 12, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function vignette(ctx: Ctx, alpha: number, W: number, H: number) {
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, `rgba(0,0,0,${alpha})`);
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

const AURORA_FILL = ['#a68bff', '#ff5caa', '#ffb547', '#3ddcff'];

// Black glass orb with a rotating iridescent rim
function orb(ctx: Ctx, cx: number, cy: number, r: number, t: number) {
  glow(ctx, cx, cy, r * 1.9, '166,139,255', 0.3);
  glow(ctx, cx - r * 0.4, cy + r * 0.5, r * 1.5, '255,92,170', 0.16);
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  if (typeof ctx.createConicGradient === 'function') {
    const ring = ctx.createConicGradient(t * 0.8, cx, cy);
    [...AURORA_FILL, AURORA_FILL[0]].forEach((c, i, all) => ring.addColorStop(i / (all.length - 1), c));
    ctx.fillStyle = ring;
  } else {
    ctx.fillStyle = linear(ctx, cx - r, 0, cx + r, 0, AURORA_FILL);
  }
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  const body = ctx.createRadialGradient(cx + r * 0.05, cy + r * 0.05, 0, cx, cy, r);
  body.addColorStop(0, '#06040d');
  body.addColorStop(0.78, '#06040d');
  body.addColorStop(0.97, 'rgba(6,4,13,0)');
  ctx.fillStyle = body;
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
  const hx = cx - r * (0.3 + 0.05 * Math.sin(t));
  const hy = cy - r * 0.38;
  const shine = ctx.createRadialGradient(hx, hy, 0, hx, hy, r * 0.14);
  shine.addColorStop(0, 'rgba(255,255,255,0.9)');
  shine.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = shine;
  ctx.fillRect(hx - r * 0.14, hy - r * 0.14, r * 0.28, r * 0.28);
}

// A perspective floor grid flowing towards the viewer
function floorGrid(ctx: Ctx, t: number, horizonAt: number, colour: string, glowColour: string | null, alpha: number, W: number, H: number) {
  const horizon = H * horizonAt;
  const vx = W / 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  if (glowColour) {
    ctx.shadowColor = glowColour;
    ctx.shadowBlur = 16;
  }
  ctx.beginPath();
  for (let i = -12; i <= 12; i++) {
    ctx.moveTo(vx + i * 30, horizon);
    ctx.lineTo(vx + i * 260, H);
  }
  const offset = (t * 0.45) % 1;
  for (let k = 0; k < 12; k++) {
    const d = (k + offset) / 12;
    const yy = horizon + Math.pow(d, 2.2) * (H - horizon);
    ctx.moveTo(0, yy);
    ctx.lineTo(W, yy);
  }
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const aurora: Theme = {
  display: { family: SERIF, weight: 900, upper: false, tracking: 0 },
  text: '#ffffff',
  lead: '#e6e1f5',
  muted: '#b1abc9',
  kicker: '#c9b8ff',
  dot: '#ff5caa',
  accent: ['#c9b8ff', '#ff8cc6', '#ffcf85', '#86e8ff'],
  fill: AURORA_FILL,
  rule: 'rgba(166,139,255,0.35)',
  pill: 'rgba(166,139,255,0.12)',
  card: '#0d0a1c',
  cardBorder: '#2a2340',
  bad: '#120d16',
  badBorder: '#3a1f2e',
  badText: '#8f86a6',
  badMark: '#ff5c7a',
  goodMark: '#86e8ff',
  goodInner: '#0d0a1c',
  strike: '#ff5c7a',
  buttonText: '#0a0a0c',
  glow: null,
  brandAccent: '#a68bff',
  track: 'rgba(255,255,255,0.12)',
  fade: '#000000',
  align: 'left',
  background(ctx, t, scenePos, v, W = VIDEO_W, H = VIDEO_H) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    (
      [
        ['166,139,255', 0.26],
        ['255,92,170', 0.18],
        ['61,220,255', 0.14]
      ] as const
    ).forEach(([rgb, a], k) => {
      glow(ctx, W * (0.5 + 0.38 * Math.sin(t * 0.21 + k * 2.1)), H * (0.45 + 0.32 * Math.cos(t * 0.17 + k * 1.7)), 820 - k * 80, rgb, a);
    });
    floorGrid(ctx, t, 0.64, 'rgba(166,139,255,1)', null, 0.18, W, H);
    particles(ctx, t, 80, (a, violet) => (violet ? `rgba(201,184,255,${a})` : `rgba(255,255,255,${a * 0.8})`), W, H);
    const s = spotAt(v, scenePos, W, H);
    orb(ctx, s.x, s.y + Math.sin(t * 1.3) * 14, s.r, t);
    vignette(ctx, 0.55, W, H);
  }
};

const editorial: Theme = {
  display: { family: SERIF, weight: 900, upper: false, tracking: -1 },
  text: '#15131a',
  lead: '#3a3645',
  muted: '#6b6577',
  kicker: '#6a3fe0',
  dot: '#d1257f',
  accent: ['#6a3fe0', '#d1257f', '#c26a00'],
  fill: ['#6a3fe0', '#d1257f', '#c26a00'],
  rule: 'rgba(21,19,26,0.18)',
  pill: 'rgba(106,63,224,0.08)',
  card: '#ffffff',
  cardBorder: 'rgba(21,19,26,0.12)',
  bad: '#efe7df',
  badBorder: '#e0d3c8',
  badText: '#8a8093',
  badMark: '#d1257f',
  goodMark: '#0e7cb8',
  goodInner: '#ffffff',
  strike: '#d1257f',
  buttonText: '#ffffff',
  glow: null,
  brandAccent: '#6a3fe0',
  track: 'rgba(21,19,26,0.12)',
  fade: '#f4efe6',
  align: 'left',
  background(ctx, t, scenePos, v, W = VIDEO_W, H = VIDEO_H) {
    ctx.fillStyle = '#f4efe6';
    ctx.fillRect(0, 0, W, H);
    glow(ctx, W * (0.25 + 0.15 * Math.sin(t * 0.2)), H * 0.28, 760, '209,37,127', 0.07);
    glow(ctx, W * (0.8 + 0.1 * Math.cos(t * 0.17)), H * 0.75, 820, '106,63,224', 0.09);
    // Concentric rings with a rotating arc: an elegant stand-in for the orb
    const s = spotAt(v, scenePos, W, H);
    ctx.save();
    for (let k = 0; k < 4; k++) {
      ctx.strokeStyle = `rgba(106,63,224,${0.2 - k * 0.04})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 0.7 + k * 48 + Math.sin(t + k) * 6, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(209,37,127,0.55)';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * 0.7 + 48, t * 0.7, t * 0.7 + Math.PI * 0.55);
    ctx.stroke();
    ctx.restore();
    // Paper grain
    const r = seeded(3);
    ctx.fillStyle = 'rgba(21,19,26,0.05)';
    for (let k = 0; k < 700; k++) ctx.fillRect(r() * W, r() * H, 2, 2);
    // Fine frame
    ctx.strokeStyle = 'rgba(21,19,26,0.14)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, W - 80, H - 80);
  }
};

const neon: Theme = {
  display: { family: SANS, weight: 700, upper: true, tracking: 2 },
  text: '#ffffff',
  lead: '#f3d9ff',
  muted: '#c9a8e6',
  kicker: '#3ddcff',
  dot: '#3ddcff',
  accent: ['#ff5caa', '#ffb547', '#3ddcff'],
  fill: ['#ff5caa', '#ffb547', '#3ddcff'],
  rule: 'rgba(255,92,170,0.45)',
  pill: 'rgba(255,92,170,0.14)',
  card: 'rgba(20,6,40,0.85)',
  cardBorder: '#ff5caa',
  bad: 'rgba(40,10,30,0.85)',
  badBorder: '#5a1f3e',
  badText: '#b08aa0',
  badMark: '#ff5c7a',
  goodMark: '#3ddcff',
  goodInner: '#12052a',
  strike: '#ff5c7a',
  buttonText: '#0a0a0c',
  glow: 'rgba(255,92,170,0.85)',
  brandAccent: '#ff5caa',
  track: 'rgba(255,255,255,0.15)',
  fade: '#07031a',
  align: 'center',
  background(ctx, t, _scenePos, _v, W = VIDEO_W, H = VIDEO_H) {
    ctx.fillStyle = linear(ctx, 0, 0, 0, H, ['#07031a', '#1d0736', '#2b0a3f', '#0c0418']);
    ctx.fillRect(0, 0, W, H);
    particles(ctx, t, 90, (a) => `rgba(255,255,255,${a * 0.7})`, W, H);
    // Striped synthwave sun sitting on the horizon
    const post = H < VIDEO_H;
    const horizonAt = post ? 0.93 : 0.79;
    const horizon = H * horizonAt;
    const cx = W / 2;
    const r = post ? 250 : 330;
    glow(ctx, cx, horizon - 60, 700, '255,92,170', 0.35);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, W, horizon);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(cx, horizon, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalAlpha = post ? 0.45 : 0.7;
    ctx.fillStyle = linear(ctx, 0, horizon - r, 0, horizon, ['#ffcf85', '#ff8cc6', '#ff5caa']);
    ctx.fillRect(cx - r, horizon - r, r * 2, r);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#1d0736';
    const shift = (t * 18) % 40;
    for (let k = 0; k < 9; k++) {
      const y = horizon - r * 0.55 + k * 40 + shift;
      ctx.fillRect(cx - r, y, r * 2, 4 + k * 2.2);
    }
    ctx.restore();
    // Glowing horizon line and grid
    ctx.save();
    ctx.shadowColor = '#3ddcff';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#3ddcff';
    ctx.fillRect(0, horizon - 2, W, 4);
    ctx.restore();
    ctx.fillStyle = '#0c0418';
    ctx.fillRect(0, horizon + 2, W, H - horizon);
    floorGrid(ctx, t, horizonAt, '#ff5caa', 'rgba(255,92,170,0.9)', 0.55, W, H);
    vignette(ctx, 0.5, W, H);
  }
};

const bold: Theme = {
  display: { family: SANS, weight: 700, upper: false, tracking: -2 },
  text: '#0b0a12',
  lead: '#1b1826',
  muted: 'rgba(11,10,18,0.7)',
  kicker: '#0b0a12',
  dot: '#0b0a12',
  accent: ['#ffffff', '#ffffff'],
  fill: ['#0b0a12', '#0b0a12'],
  rule: 'rgba(11,10,18,0.28)',
  pill: 'rgba(255,255,255,0.35)',
  card: 'rgba(255,255,255,0.92)',
  cardBorder: 'rgba(11,10,18,0.15)',
  bad: 'rgba(11,10,18,0.1)',
  badBorder: 'rgba(11,10,18,0.2)',
  badText: 'rgba(11,10,18,0.55)',
  badMark: '#0b0a12',
  goodMark: '#0b0a12',
  goodInner: '#ffffff',
  strike: '#0b0a12',
  buttonText: '#ffffff',
  glow: null,
  brandAccent: '#ffffff',
  track: 'rgba(11,10,18,0.15)',
  fade: '#0b0a12',
  align: 'left',
  background(ctx, t, scenePos, v, W = VIDEO_W, H = VIDEO_H) {
    // Each scene has its own solid colour; the next one sweeps in diagonally
    const i = Math.floor(scenePos);
    const f = easeInOutCubic(scenePos - i);
    ctx.fillStyle = v.palette[i % v.palette.length];
    ctx.fillRect(0, 0, W, H);
    if (f > 0) {
      const slant = W * 0.5;
      const x = -slant + f * (W + slant * 2);
      ctx.fillStyle = v.palette[(i + 1) % v.palette.length];
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(x, 0);
      ctx.lineTo(x - slant, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
    }
    // Big geometric shapes drifting slowly
    const s = spotAt(v, scenePos, W, H);
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.translate(W - s.x, H - s.y);
    ctx.rotate(t * 0.15);
    ctx.strokeStyle = 'rgba(11,10,18,0.14)';
    ctx.lineWidth = 10;
    ctx.strokeRect(-s.r, -s.r, s.r * 2, s.r * 2);
    ctx.restore();
    // Fine dot grid
    ctx.fillStyle = 'rgba(11,10,18,0.1)';
    for (let x = 60; x < W; x += 60) for (let y = 60; y < H; y += 60) ctx.fillRect(x, y, 3, 3);
  }
};

const mono: Theme = {
  display: { family: SANS, weight: 700, upper: false, tracking: -1 },
  text: '#f5f5f5',
  lead: '#d6d6d6',
  muted: '#9a9a9a',
  kicker: '#ffb547',
  dot: '#ffb547',
  accent: ['#ffb547', '#ffcf85'],
  fill: ['#ffb547', '#ffcf85'],
  rule: 'rgba(255,255,255,0.18)',
  pill: 'rgba(255,181,71,0.1)',
  card: '#101010',
  cardBorder: '#2a2a2a',
  bad: '#0c0c0c',
  badBorder: '#2a2a2a',
  badText: '#7a7a7a',
  badMark: '#ff5c7a',
  goodMark: '#ffb547',
  goodInner: '#101010',
  strike: '#ff5c7a',
  buttonText: '#0a0a0a',
  glow: null,
  brandAccent: '#ffb547',
  track: 'rgba(255,255,255,0.12)',
  fade: '#000000',
  align: 'left',
  background(ctx, t, scenePos, v, W = VIDEO_W, H = VIDEO_H) {
    ctx.fillStyle = '#060606';
    ctx.fillRect(0, 0, W, H);
    // Drifting scanlines
    ctx.fillStyle = 'rgba(255,255,255,0.025)';
    const off = (t * 40) % 8;
    for (let y = off; y < H; y += 8) ctx.fillRect(0, y, W, 1);
    // Thin ring with a turning amber arc and an orbiting dot
    const s = spotAt(v, scenePos, W, H);
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#ffb547';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, -t * 0.9, -t * 0.9 + Math.PI * 0.35);
    ctx.stroke();
    const a = t * 1.6;
    glow(ctx, s.x + Math.cos(a) * s.r, s.y + Math.sin(a) * s.r, 60, '255,181,71', 0.5);
    ctx.restore();
    glow(ctx, W * 0.5, H * 0.5, 900, '255,181,71', 0.04);
    vignette(ctx, 0.6, W, H);
  }
};

export const THEMES: Record<VideoStyle, Theme> = { aurora, editorial, neon, bold, mono };

// Spots for the hero shape: top and bottom bands, clear of the text column
const SPOTS = [
  { x: 0.84, y: 0.17, r: 230 },
  { x: 0.18, y: 0.87, r: 210 },
  { x: 0.86, y: 0.85, r: 250 },
  { x: 0.82, y: 0.13, r: 190 },
  { x: 0.2, y: 0.9, r: 230 },
  { x: 0.9, y: 0.19, r: 200 }
];
const BOLD_PALETTE = ['#a68bff', '#ff5caa', '#ffb547', '#3ddcff', '#8cf5c8', '#ff8a5c'];

export function makeVariation(seed: number): Variation {
  const rnd = seeded(seed || 1);
  return { spots: shuffle(SPOTS, rnd), palette: shuffle(BOLD_PALETTE, rnd), rnd };
}
