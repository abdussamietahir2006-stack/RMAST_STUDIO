// Exports carousel slides as short MP4 clips (Instagram carousels accept videos): the background
// moves and the text animates in within the first two seconds, then holds so it can be read.
// Optionally with soft peaceful music (AAC). Encoded in the browser with WebCodecs + Mediabunny;
// loaded on demand.
import { AudioBufferSource, BufferTarget, CanvasSource, canEncodeAudio, canEncodeVideo, Mp4OutputFormat, Output, QUALITY_HIGH } from 'mediabunny';
import type { SocialSlide } from '../../types';
import { loadSlideFonts, prepareSlide, SLIDE_H, SLIDE_SECONDS, SLIDE_W, type SlideLook } from './slideRenderer';
import { slideMusic } from './slideMusic';

const FPS = 30;

export async function slideToMp4(
  slide: SocialSlide,
  index: number,
  total: number,
  look: SlideLook,
  withMusic: boolean,
  onProgress: (fraction: number) => void,
  signal?: AbortSignal
): Promise<{ blob: Blob; withMusic: boolean }> {
  if (typeof VideoEncoder === 'undefined' || !(await canEncodeVideo('avc', { width: SLIDE_W, height: SLIDE_H }))) {
    throw new Error('This browser cannot create MP4 video. Please use Chrome or Edge on a computer.');
  }
  await loadSlideFonts();
  const music = withMusic && (await canEncodeAudio('aac')) ? await slideMusic(look.seed) : null;

  const canvas = document.createElement('canvas');
  canvas.width = SLIDE_W;
  canvas.height = SLIDE_H;
  const ctx = canvas.getContext('2d')!;
  const draw = prepareSlide(ctx, slide, index, total, look);

  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  const source = new CanvasSource(canvas, { codec: 'avc', quality: QUALITY_HIGH });
  output.addVideoTrack(source, { frameRate: FPS });
  const audio = music ? new AudioBufferSource({ codec: 'aac', quality: QUALITY_HIGH }) : null;
  if (audio) output.addAudioTrack(audio);
  await output.start();

  const frames = SLIDE_SECONDS * FPS;
  try {
    if (audio && music) await audio.add(music);
    for (let f = 0; f < frames; f++) {
      if (signal?.aborted) throw new DOMException('Export cancelled', 'AbortError');
      draw(f / FPS);
      await source.add(f / FPS, 1 / FPS);
      if (f % 10 === 0) onProgress(f / frames);
    }
    await output.finalize();
  } catch (err) {
    await output.cancel().catch(() => undefined);
    throw err;
  }
  onProgress(1);
  return { blob: new Blob([output.target.buffer!], { type: 'video/mp4' }), withMusic: Boolean(audio) };
}
