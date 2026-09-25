// Original background music for reels, composed in the browser (Web Audio, offline rendering).
// Every track is generated fresh from code (chords, pads, bass, melody and drums), so it is
// copyright-free. It is sized to the reel and hits its cuts: a whoosh into every scene change, an
// impact or chime on the cut, drums dropping in on the first cut and a riser into the finale.
import type { MusicMood, VideoScene } from '../../types';
import { sceneStarts, videoLength } from './engine';
import { seeded } from './themes';

const RATE = 48000;

// Chord shapes as semitones above the key (major key; vi gives the minor colour)
const I = [0, 4, 7, 11];
const IV = [5, 9, 12, 16];
const V = [7, 11, 14, 17];
const vi = [9, 12, 16, 19];
const ii = [2, 5, 9, 12];

interface Mood {
  bpm: number;
  barsPerChord: number;
  progressions: number[][][];
  keys: number[]; // MIDI root notes to pick from
  reverbSeconds: number;
  padCutoff: number;
}

const MOODS: Record<Exclude<MusicMood, 'none'>, Mood> = {
  peaceful: { bpm: 72, barsPerChord: 2, progressions: [[I, vi, IV, V], [IV, I, vi, V], [I, IV, vi, IV]], keys: [57, 60, 62], reverbSeconds: 4, padCutoff: 950 },
  uplifting: { bpm: 100, barsPerChord: 1, progressions: [[vi, IV, I, V], [I, V, vi, IV], [IV, V, vi, I]], keys: [55, 57, 60], reverbSeconds: 2.4, padCutoff: 1500 },
  blazing: { bpm: 124, barsPerChord: 1, progressions: [[vi, IV, I, V], [vi, V, IV, V], [vi, ii, IV, V]], keys: [57, 55, 59], reverbSeconds: 1.8, padCutoff: 2200 }
};

const hz = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export async function composeMusic(mood: MusicMood, scenes: VideoScene[], seed: number): Promise<AudioBuffer | null> {
  if (mood === 'none' || !scenes.length || typeof OfflineAudioContext === 'undefined') return null;
  const spec = MOODS[mood];
  const rnd = seeded(seed * 7 + 11);
  const duration = videoLength(scenes);
  const ctx = new OfflineAudioContext(2, Math.ceil(duration * RATE), RATE);

  // --- Mix bus: everything → master → gentle compressor → out; plus a shared reverb ---
  const master = ctx.createGain();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.ratio.value = 3.5;
  comp.attack.value = 0.004;
  comp.release.value = 0.25;
  master.connect(comp).connect(ctx.destination);
  master.gain.setValueAtTime(0, 0);
  master.gain.linearRampToValueAtTime(1, 0.35);
  master.gain.setValueAtTime(1, Math.max(0.4, duration - 1.8));
  master.gain.linearRampToValueAtTime(0, duration);

  const reverb = ctx.createConvolver();
  reverb.buffer = impulse(ctx, spec.reverbSeconds, rnd);
  const reverbIn = ctx.createGain();
  reverbIn.gain.value = mood === 'peaceful' ? 0.55 : 0.3;
  reverbIn.connect(reverb).connect(master);

  const bus = (gain: number) => {
    const g = ctx.createGain();
    g.gain.value = gain;
    g.connect(master);
    return g;
  };
  const padBus = bus(mood === 'blazing' ? 0.5 : 0.6);
  const pluckBus = bus(0.55);
  const bassBus = bus(0.7);
  const drumBus = bus(0.8);
  const sfxBus = bus(0.7);

  const noise = noiseBuffer(ctx);
  const beat = 60 / spec.bpm;
  const bar = beat * 4;
  const chordLen = bar * spec.barsPerChord;
  const progression = spec.progressions[Math.floor(rnd() * spec.progressions.length)];
  const key = spec.keys[Math.floor(rnd() * spec.keys.length)];
  const starts = sceneStarts(scenes);
  const firstCut = starts[1] ?? bar; // drums (blazing/uplifting) drop in here
  const lastScene = starts[starts.length - 1] ?? duration;

  // --- Instruments ---------------------------------------------------------
  const pad = (at: number, len: number, notes: number[]) => {
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(spec.padCutoff * 0.6, at);
    filter.frequency.linearRampToValueAtTime(spec.padCutoff, at + len * 0.7);
    filter.Q.value = 0.6;
    const env = ctx.createGain();
    const attack = Math.min(mood === 'peaceful' ? 1.6 : 0.4, len * 0.4);
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(0.16, at + attack);
    env.gain.setValueAtTime(0.16, at + len - 0.05);
    env.gain.linearRampToValueAtTime(0, at + len + 1.2);
    filter.connect(env);
    env.connect(padBus);
    env.connect(reverbIn);
    for (const n of notes) {
      for (const detune of [-9, 9]) {
        const o = ctx.createOscillator();
        o.type = 'sawtooth';
        o.frequency.value = hz(key + n);
        o.detune.value = detune;
        o.connect(filter);
        o.start(at);
        o.stop(at + len + 1.3);
      }
    }
    const warm = ctx.createOscillator();
    warm.type = 'triangle';
    warm.frequency.value = hz(key + notes[0] - 12);
    warm.connect(filter);
    warm.start(at);
    warm.stop(at + len + 1.3);
  };

  const pluck = (at: number, midi: number, vel: number, pan: number, decay: number) => {
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = hz(midi);
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = hz(midi + 12);
    const g2 = ctx.createGain();
    g2.gain.value = 0.3;
    o2.connect(g2);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 3200;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(vel, at + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    o.connect(f);
    g2.connect(f);
    f.connect(env).connect(p);
    p.connect(pluckBus);
    p.connect(reverbIn);
    o.start(at);
    o2.start(at);
    o.stop(at + decay + 0.05);
    o2.stop(at + decay + 0.05);
  };

  const bassNote = (at: number, len: number, midi: number, vel: number, bright: boolean) => {
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = hz(midi);
    const saw = ctx.createOscillator();
    saw.type = 'sawtooth';
    saw.frequency.value = hz(midi);
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.setValueAtTime(bright ? 900 : 380, at);
    f.frequency.exponentialRampToValueAtTime(bright ? 260 : 220, at + Math.min(len, 0.3));
    const sawGain = ctx.createGain();
    sawGain.gain.value = bright ? 0.5 : 0.25;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(vel, at + 0.01);
    env.gain.setValueAtTime(vel, at + len * 0.8);
    env.gain.exponentialRampToValueAtTime(0.0001, at + len);
    sub.connect(env);
    saw.connect(sawGain).connect(f).connect(env);
    env.connect(bassBus);
    sub.start(at);
    saw.start(at);
    sub.stop(at + len + 0.02);
    saw.stop(at + len + 0.02);
  };

  const noiseHit = (at: number, type: BiquadFilterType, freq: number, q: number, vel: number, decay: number, pan = 0, dest: AudioNode = drumBus) => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    f.Q.value = q;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(vel, at + 0.003);
    env.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    src.connect(f).connect(env).connect(p).connect(dest);
    src.start(at, rnd() * 1.5, decay + 0.05);
  };

  const kick = (at: number, vel: number) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(150, at);
    o.frequency.exponentialRampToValueAtTime(45, at + 0.12);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(vel, at + 0.004);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.42);
    o.connect(env).connect(drumBus);
    o.start(at);
    o.stop(at + 0.45);
  };

  const clap = (at: number, vel: number) => {
    for (let k = 0; k < 3; k++) noiseHit(at + k * 0.012, 'bandpass', 1700, 0.9, vel * (k === 2 ? 1 : 0.6), k === 2 ? 0.2 : 0.03);
    noiseHit(at, 'bandpass', 1700, 0.9, vel * 0.3, 0.6, 0, reverbIn);
  };

  const hat = (at: number, vel: number, open: boolean) => noiseHit(at, 'highpass', 8000, 0.7, vel, open ? 0.22 : 0.045, (rnd() - 0.5) * 0.4);

  // Sidechain-style pump: pads and bass dip on every kick (blazing)
  const duck = (at: number) => {
    for (const g of [padBus, bassBus]) {
      const base = g.gain.value;
      g.gain.setValueAtTime(base * 0.35, at);
      g.gain.linearRampToValueAtTime(base, at + beat * 0.6);
    }
  };

  // --- Transition effects ---------------------------------------------------
  const whoosh = (at: number, vel: number) => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    const f = ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.Q.value = 1.2;
    const t0 = Math.max(0, at - 0.55);
    f.frequency.setValueAtTime(350, t0);
    f.frequency.exponentialRampToValueAtTime(5200, at);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(vel, at - 0.05);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 0.25);
    src.connect(f).connect(env);
    env.connect(sfxBus);
    env.connect(reverbIn);
    src.start(t0, rnd(), 0.9);
  };

  const impact = (at: number, vel: number) => {
    const o = ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(90, at);
    o.frequency.exponentialRampToValueAtTime(32, at + 0.9);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, at);
    env.gain.exponentialRampToValueAtTime(vel, at + 0.005);
    env.gain.exponentialRampToValueAtTime(0.0001, at + 1.3);
    o.connect(env);
    env.connect(sfxBus);
    env.connect(reverbIn);
    o.start(at);
    o.stop(at + 1.35);
    noiseHit(at, 'lowpass', 1800, 0.5, vel * 0.5, 0.5, 0, sfxBus);
  };

  const chime = (at: number, midi: number) => {
    pluck(at, midi + 24, 0.12, -0.3, 2.8);
    pluck(at + 0.09, midi + 31, 0.08, 0.3, 2.8);
  };

  const riser = (from: number, to: number, vel: number) => {
    if (to - from < 0.5) return;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.loop = true;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.setValueAtTime(300, from);
    f.frequency.exponentialRampToValueAtTime(6000, to);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, from);
    env.gain.exponentialRampToValueAtTime(vel, to - 0.02);
    env.gain.linearRampToValueAtTime(0, to + 0.02);
    src.connect(f).connect(env).connect(sfxBus);
    src.start(from);
    src.stop(to + 0.05);
  };

  // --- Arrangement ------------------------------------------------------------
  const chordAt = (time: number) => progression[Math.floor(time / chordLen) % progression.length];

  for (let at = 0; at < duration; at += chordLen) pad(at, Math.min(chordLen, duration - at + 0.5), chordAt(at));

  const steps = Math.ceil(duration / (beat / 4));
  const arp16 = [0, 1, 2, 1, 3, 2, 1, 2];
  for (let k = 0; k < steps; k++) {
    const at = k * (beat / 4);
    if (at >= duration - 0.2) break;
    const chord = chordAt(at);
    const beatPos = k % 4; // 16th within the beat
    const beatIndex = Math.floor(k / 4);
    const inBar = beatIndex % 4;

    if (mood === 'peaceful') {
      // Soft 8th-note arpeggio with gaps, a whole-note bass, a quiet shaker
      if (beatPos % 2 === 0 && rnd() < 0.62) pluck(at, key + 12 + chord[Math.floor(rnd() * chord.length)], 0.1 + rnd() * 0.06, (rnd() - 0.5) * 0.7, 1.8);
      if (k % 16 === 0) bassNote(at, bar * 0.95, key - 12 + chord[0], 0.28, false);
      if (at > bar && beatPos % 2 === 0) noiseHit(at, 'bandpass', 6500, 1.5, beatPos === 0 ? 0.035 : 0.022, 0.06, (rnd() - 0.5) * 0.6);
    } else if (mood === 'uplifting') {
      pluck(at, key + 12 + chord[arp16[k % arp16.length] % chord.length], 0.1, k % 2 ? 0.35 : -0.35, 0.7);
      if (beatPos === 0) bassNote(at, beat * 0.9, key - 12 + chord[0] + (inBar === 2 ? 12 : 0), 0.4, false);
      if (at >= firstCut) {
        if (beatPos === 0 && (inBar === 0 || inBar === 2)) kick(at, 0.75);
        if (beatPos === 0 && (inBar === 1 || inBar === 3)) clap(at, 0.4);
        if (beatPos % 2 === 0) hat(at, beatPos === 2 ? 0.12 : 0.07, false);
      }
    } else {
      // Blazing: four-on-the-floor, offbeat bass, 16th lead, pumping pads
      if (at >= firstCut) {
        if (beatPos === 0) {
          kick(at, 0.95);
          duck(at);
        }
        if (beatPos === 0 && (inBar === 1 || inBar === 3)) clap(at, 0.55);
        if (beatPos === 2) hat(at, 0.16, true);
        if (beatPos !== 2) hat(at, 0.05, false);
        if (beatPos === 2) bassNote(at, beat * 0.45, key - 12 + chord[0], 0.55, true);
        const rise = Math.floor(k / 2) % 4;
        pluck(at, key + 12 + chord[(arp16[k % arp16.length] + rise) % chord.length] + (k % 8 === 7 ? 12 : 0), 0.11, k % 2 ? 0.4 : -0.4, 0.35);
      } else {
        // Intro: filtered anticipation before the drop
        if (beatPos === 0) pluck(at, key + 12 + chord[inBar % chord.length], 0.08, 0, 0.9);
        hat(at, 0.03, false);
      }
    }
  }

  // Scene changes: whoosh into the cut, then an impact (or a chime when peaceful)
  starts.slice(1).forEach((cut, n) => {
    whoosh(cut, mood === 'peaceful' ? 0.12 : 0.28);
    if (mood === 'peaceful') chime(cut, key + chordAt(cut)[0]);
    else impact(cut, mood === 'blazing' ? 0.85 : n === 0 ? 0.6 : 0.4);
  });
  if (mood !== 'peaceful') riser(Math.max(firstCut, lastScene - 2.2), lastScene, mood === 'blazing' ? 0.3 : 0.18);

  const rendered = await ctx.startRendering();
  normalize(rendered, 0.9);
  return rendered;
}

function noiseBuffer(ctx: BaseAudioContext): AudioBuffer {
  const buffer = ctx.createBuffer(1, RATE * 3, RATE);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

// A synthetic room: stereo noise with an exponential tail
function impulse(ctx: BaseAudioContext, seconds: number, rnd: () => number): AudioBuffer {
  const length = Math.floor(RATE * seconds);
  const buffer = ctx.createBuffer(2, length, RATE);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) data[i] = (rnd() * 2 - 1) * Math.pow(1 - i / length, 3.2);
  }
  return buffer;
}

function normalize(buffer: AudioBuffer, target: number) {
  let peak = 0;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
  }
  if (peak < 1e-4) return;
  const k = target / peak;
  for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < data.length; i++) data[i] *= k;
  }
}
