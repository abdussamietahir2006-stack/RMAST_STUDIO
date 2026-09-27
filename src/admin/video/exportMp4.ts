// Renders a reel frame by frame and encodes it as an H.264 MP4 (what Instagram accepts),
// with its composed music as an AAC track, entirely in the browser via WebCodecs + Mediabunny.
// Frame-exact, so slow machines take longer but never drop frames. Loaded on demand.
import { AudioBufferSource, BufferTarget, CanvasSource, canEncodeAudio, canEncodeVideo, Mp4OutputFormat, Output, QUALITY_HIGH } from 'mediabunny';
import type { SocialVideo } from '../../types';
import { DEFAULT_VIDEO_SIZE, FPS, VideoEngine } from './engine';
import { composeMusic } from './music';
import { loadSlideFonts } from '../social/slideRenderer';

export interface ExportResult {
  blob: Blob;
  withMusic: boolean;
  width: number;
  height: number;
}

export async function exportReelMp4(
  video: Pick<SocialVideo, 'scenes' | 'style' | 'seed' | 'music'> & { size?: SocialVideo['size'] },
  onProgress: (fraction: number) => void,
  signal?: AbortSignal
): Promise<ExportResult> {
  // H.264 needs even sides: an odd width or height is rounded up by one pixel
  const size = video.size ?? DEFAULT_VIDEO_SIZE;
  const even = { width: size.width + (size.width % 2), height: size.height + (size.height % 2) };
  if (typeof VideoEncoder === 'undefined') {
    throw new Error('This browser cannot create MP4 video. Please use Chrome or Edge on a computer.');
  }
  if (!(await canEncodeVideo('avc', even))) {
    throw new Error(`This browser cannot create an MP4 at ${even.width}×${even.height}. Try a smaller size (up to about 4096×2304).`);
  }
  await loadSlideFonts();

  // Music first (a few seconds), then the frames
  const music = video.music !== 'none' && (await canEncodeAudio('aac')) ? await composeMusic(video.music, video.scenes, video.seed) : null;

  const canvas = document.createElement('canvas');
  canvas.width = even.width;
  canvas.height = even.height;
  const ctx = canvas.getContext('2d')!;
  const engine = new VideoEngine(video.scenes, 1, video.style, video.seed, even);

  const output = new Output({ format: new Mp4OutputFormat({ fastStart: 'in-memory' }), target: new BufferTarget() });
  const source = new CanvasSource(canvas, { codec: 'avc', quality: QUALITY_HIGH });
  output.addVideoTrack(source, { frameRate: FPS });
  const audio = music ? new AudioBufferSource({ codec: 'aac', quality: QUALITY_HIGH }) : null;
  if (audio) output.addAudioTrack(audio);
  await output.start();

  const frames = Math.round(engine.duration * FPS);
  try {
    if (audio && music) await audio.add(music);
    for (let f = 0; f < frames; f++) {
      if (signal?.aborted) throw new DOMException('Export cancelled', 'AbortError');
      engine.draw(ctx, f / FPS);
      await source.add(f / FPS, 1 / FPS);
      if (f % 6 === 0) onProgress(f / frames);
    }
    await output.finalize();
  } catch (err) {
    await output.cancel().catch(() => undefined);
    throw err;
  }
  onProgress(1);
  return { blob: new Blob([output.target.buffer!], { type: 'video/mp4' }), withMusic: Boolean(audio), ...even };
}
