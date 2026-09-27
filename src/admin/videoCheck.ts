// Checks that a video will play smoothly on the website: H.264 (every browser decodes it in
// hardware), its index at the start of the file (so it streams at once) and a sensible bitrate.
// Returns plain-language warnings; the upload still goes ahead.
export async function webVideoWarnings(file: File, seconds: number | null): Promise<string[]> {
  const warnings: string[] = [];
  try {
    const { Input, BlobSource, ALL_FORMATS } = await import('mediabunny');
    const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
    const codec = (await input.getPrimaryVideoTrack())?.codec;
    if (codec === 'hevc') warnings.push('This video is H.265 (HEVC), which some browsers cannot play or play with stutter. Export it as H.264 MP4.');
    else if (codec && codec !== 'avc' && codec !== 'vp9' && codec !== 'av1') warnings.push(`This video uses the ${codec} format. H.264 MP4 plays best everywhere.`);
  } catch {
    // Unreadable here: the browser check below still runs
  }
  // MP4/MOV: the index ("moov") should come before the media data ("mdat")
  if (/mp4|quicktime/.test(file.type)) {
    const head = new DataView(await file.slice(0, 1 << 20).arrayBuffer());
    for (let i = 0; i + 8 <= head.byteLength; ) {
      const size = head.getUint32(i);
      const type = String.fromCharCode(head.getUint8(i + 4), head.getUint8(i + 5), head.getUint8(i + 6), head.getUint8(i + 7));
      if (type === 'moov') break;
      if (type === 'mdat') {
        warnings.push('The video is not web-optimized (its index is at the end), so it cannot start playing until much of it has downloaded. Export with "Fast start" / "Optimize for web".');
        break;
      }
      if (size < 8) break;
      i += size;
    }
  }
  if (seconds && seconds > 0) {
    const mbps = (file.size * 8) / seconds / 1e6;
    if (mbps > 6) warnings.push(`It is heavy for the web (${mbps.toFixed(1)} Mbit/s). About 3–4 Mbit/s keeps 1080p sharp and loads much faster.`);
  }
  return warnings;
}
