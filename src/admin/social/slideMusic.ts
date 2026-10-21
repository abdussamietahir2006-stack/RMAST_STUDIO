// Soft peaceful music for animated carousel slides (8 seconds), made with the reel composer.
// Kept apart from the MP4 exporter so the dashboard preview can play it without loading the encoder.
import type { VideoScene } from '../../types';
import { composeMusic } from '../video/music';
import { SLIDE_SECONDS, TEXT_START } from './slideRenderer';

// The composer works in scenes; a slide is one "cut", where a chime lands as the text rises
const CHIME_AT = TEXT_START + 0.15;
const scene = (duration: number): VideoScene => ({
  type: 'statement',
  duration,
  transition: 'wipe',
  kicker: '',
  headline: '',
  highlight: '',
  body: '',
  items: [],
  statValue: 0,
  statPrefix: '',
  statSuffix: '',
  before: '',
  after: ''
});

// Every slide of a post shares the post's seed, so the whole carousel is in the same key.
// Composed once per seed and reused.
const cache = new Map<number, Promise<AudioBuffer | null>>();
export function slideMusic(seed: number): Promise<AudioBuffer | null> {
  let music = cache.get(seed);
  if (!music) {
    music = composeMusic('peaceful', [scene(CHIME_AT), scene(SLIDE_SECONDS - CHIME_AT)], seed).catch(() => null);
    cache.set(seed, music);
  }
  return music;
}
